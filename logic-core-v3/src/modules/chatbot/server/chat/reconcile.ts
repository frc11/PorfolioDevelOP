/**
 * ONF-1 — Piezas PURAS del reconcile transaccional del onFinish (handleChatRequest).
 *
 * Mismo criterio que `dedup.ts` (INFRA.2): la DECISIÓN vive acá, pura y testeable
 * sin DB ni reloj propio; la orquestación (transacción, compensación, hooks del
 * stream) queda en handleChatRequest.ts — NO se extrae el persist a un módulo
 * (deuda C3.6, fuera de scope).
 *
 * Cubre:
 *   1. Retry acotado de la transacción de persistencia (constantes + dedup del
 *      ASSISTANT para que el reintento sea idempotente ante commit-ack perdido).
 *   2. Tabla de decisión de compensación de cupo (cuándo se devuelve la reserva).
 *   3. Fallback de respuesta vacía: mensaje canned de derivación + transform que
 *      lo inyecta al stream cuando el modelo no emitió texto útil.
 *   4. Constantes de INFRA.3 (retry contra la conexión) DEFINIDAS pero NO activas.
 *   5. DEADLINE-ONFINISH: presupuestos de tiempo de los hooks del stream y el
 *      cálculo puro del techo efectivo contra el `maxDuration` de la ruta.
 */
import type { StreamTextTransform, TextStreamPart, ToolSet } from 'ai'
import type { TailMessage } from './dedup'

// ─── 1. Retry acotado de la transacción de persistencia (ACTIVO) ─────────────

/**
 * Intentos totales del $transaction del turno en onFinish (1 intento + 1 retry).
 * Es retry de APLICACIÓN sobre un write atómico ya entregado al visitante — la
 * respuesta ya salió, así que el único costo del retry es tiempo de función
 * (acotado: 1 × backoff). NO confundir con INFRA.3 (retry de conexión, abajo).
 */
export const PERSIST_TX_MAX_ATTEMPTS = 2

/** Espera entre intentos del $transaction (transitorios cortos de Neon). */
export const PERSIST_TX_RETRY_BACKOFF_MS = 300

/**
 * Ventana del dedup del ASSISTANT en el reintento. Cubre el caso commit-ack
 * perdido: el COMMIT del intento 1 entró pero el cliente vio error de conexión;
 * sin este guard, el retry duplicaría mensaje + contadores. El gap real entre
 * intentos es ~PERSIST_TX_RETRY_BACKOFF_MS; la ventana ancha (espejo de
 * USER_PERSIST_DEDUP_WINDOW_MS de INFRA.2) solo agrega margen — la corrección
 * la da el rol + contenido de la cola.
 */
export const ASSISTANT_PERSIST_DEDUP_WINDOW_MS = 90_000

/**
 * ¿Se debe SALTAR el persist del turno en un REINTENTO? (true = el intento
 * anterior ya commiteó, aunque el caller haya visto error.)
 *
 * Como los tres writes del turno son UNA transacción, alcanza con encontrar
 * el ASSISTANT idéntico y reciente: si está, los contadores también entraron.
 *
 * `candidate` NO es la cola de la conversación — es el resultado de una query
 * DIRIGIDA (conversationId + role ASSISTANT + MISMO content + createdAt
 * dentro de la ventana). Mirar solo la cola era frágil (hallazgo del review):
 * un USER interleaved de otro request del mismo sessionId, persistido entre
 * el commit "perdido" del intento 1 y la lectura del intento 2, desplazaba la
 * cola y tapaba el commit fantasma → assistant y contadores duplicados. Esta
 * función re-valida en JS lo que la query ya filtró en SQL (defensa doble,
 * misma decisión).
 *
 * Residual aceptado: en la MISMA conversación, un ASSISTANT idéntico de OTRO
 * request dentro de la ventana (plausible solo con contenido canned +
 * double-fire del widget) produce un skip "de más" — se prefiere un persist
 * de menos a contadores dobles.
 *
 * Pura y determinista: recibe `now` explícito, no lee reloj ni DB.
 */
export function shouldSkipAssistantPersist(
  candidate: TailMessage | null,
  assistantContent: string,
  now: Date,
  windowMs: number = ASSISTANT_PERSIST_DEDUP_WINDOW_MS,
): boolean {
  if (!candidate) return false
  if (candidate.role !== 'ASSISTANT') return false
  if (candidate.content !== assistantContent) return false
  return now.getTime() - candidate.createdAt.getTime() < windowMs
}

// ─── 1.b DEADLINE-ONFINISH: presupuestos de tiempo de los hooks ──────────────

/**
 * DEADLINE-ONFINISH — Por qué existen estas constantes.
 *
 * `onFinish` corre DENTRO del `flush()` del stream del AI SDK (`notify()` lo
 * invoca con `await`), y por semántica de `TransformStream` el lado readable no
 * llega a `done` hasta que ese flush resuelve. El `useChat` del cliente itera
 * hasta `done` y recién ahí pasa a `status:'ready'` — lo único que destraba el
 * input del widget. O sea: **el input del visitante queda rehén de toda la
 * persistencia post-respuesta**. Sin techo de tiempo, una DB que no responde
 * deja el input trabado hasta que la plataforma mata la función (30s exactos).
 *
 * Estas constantes son el techo. Son CALIBRABLES: cambiarlas no toca lógica.
 */

/** Techo total de un hook del stream (`onFinish` y `onError`). */
export const ONFINISH_TOTAL_BUDGET_MS = 5_000

/** Techo de CADA intento del `$transaction` de persistencia del turno. */
export const PERSIST_TX_DEADLINE_MS = 2_000

/** Techo de cada `logChatbotEvent` (write a `chatbot_events`). */
export const EVENT_LOG_DEADLINE_MS = 700

/** Techo de la compensación de cupo (`compensateNewConversationReservation`). */
export const QUOTA_COMPENSATION_DEADLINE_MS = 1_500

/**
 * ⚠️ ESPEJO de `export const maxDuration = 30` en
 * `src/app/api/chatbot/[slug]/chat/route.ts:9`. NO se puede importar de ahí (ese
 * módulo arrastra el barrel `index.server`, que trae `next-auth`/`next/server`).
 * **Si `maxDuration` cambia allá, este valor tiene que cambiar acá** — si no, el
 * colchón de `computeHookBudgetMs` queda mal calibrado en silencio.
 */
export const ROUTE_MAX_DURATION_MS = 30_000

/**
 * Colchón entre el fin del hook y el kill de la plataforma: la respuesta todavía
 * tiene que cerrar y llegar al cliente después de que el hook retorna.
 */
export const HOOK_SAFETY_MARGIN_MS = 3_000

/**
 * Presupuesto EFECTIVO de un hook del stream, dado cuánto lleva corriendo el
 * request completo.
 *
 * Sin este techo, los 5s fijos se suman a lo que ya consumió el request: con una
 * conversación larga y Vertex lento (LLM de ~24s) el hook volvería a rozar el
 * `maxDuration` de 30s y la plataforma mataría la función igual — exactamente el
 * síntoma que este sprint arregla.
 *
 * Ejemplos: request de 3s → 5000ms; LLM lento de 24s → 3000ms; request de 28s →
 * **0ms** (no se arranca ninguna query: se emite el abandono y el stream cierra).
 *
 * Pura y determinista: recibe el elapsed explícito, no lee reloj.
 */
export function computeHookBudgetMs(requestElapsedMs: number): number {
  return Math.max(
    0,
    Math.min(
      ONFINISH_TOTAL_BUDGET_MS,
      ROUTE_MAX_DURATION_MS - requestElapsedMs - HOOK_SAFETY_MARGIN_MS,
    ),
  )
}

// ─── 1.c STREAM-TIMEOUT: silencio máximo tolerado del provider ───────────────

/**
 * STREAM-TIMEOUT — Silencio máximo tolerado ENTRE chunks del provider antes de
 * abortar el stream.
 *
 * EL PROBLEMA QUE RESUELVE (medido en prod con los probes de PROBE-STREAM):
 * el stream de Gemini entrega el texto completo y después NO EMITE SU CHUNK
 * TERMINAL. El SDK espera para siempre: `onStepFinish` nunca dispara,
 * `onFinish` nunca entra, y la función muere en el kill de `maxDuration` (30s
 * exactos) con el input del widget trabado todo ese tiempo. La corrida real
 * mostró `firstChunk` a los 6.2s y después silencio absoluto hasta el kill.
 * Es un problema conocido de la API de Gemini, NO de la DB ni de los tools
 * (cero probes de tool en esa corrida) ni de `onFinish` (nunca se llega).
 *
 * CÓMO CORTA: `chunkMs` arma un timer que `resetChunkTimeout()` reinicia en la
 * PRIMERA línea del transform de cada chunk del provider (ai/dist/index.js:7793).
 * Al vencer, dispara un AbortController que el SDK mergea en el `abortSignal`
 * del run; el `pull` del stream ve `abortSignal.aborted`, enquea el chunk
 * `abort` y cierra el stream. El cliente recibe `done` y el input se destraba.
 *
 * POR QUÉ SOLO `chunkMs` — `stepMs`/`totalMs` quedan deliberadamente sin setear:
 *   - `chunkMs` se arma recién DESPUÉS del primer chunk, así que no puede matar
 *     una respuesta que tarda en arrancar. Cubre exactamente nuestro síntoma:
 *     silencio DESPUÉS de que el texto ya llegó.
 *   - `stepMs` se arma al inicio del step, antes de `doStream`: cubriría "nunca
 *     llega el primer chunk", que NO es nuestro síntoma y del que hoy no hay
 *     evidencia — y mataría generaciones legítimas lentas. Queda disponible si
 *     algún día los logs muestran ese caso.
 *
 * CALIBRABLE: los chunks de Gemini llegan con ms de diferencia entre sí, así que
 * 5s de silencio es señal clara de stream muerto sin riesgo de cortar una
 * generación sana. Ajustable contra tráfico real sin tocar lógica.
 *
 * OJO con la forma del valor: `getChunkTimeoutMs` (ai/dist/index.js:1043) SOLO
 * lee `.chunkMs` cuando `timeout` es un OBJETO — pasar un número plano se
 * interpreta como `totalMs` y tendría un efecto completamente distinto.
 */
export const STREAM_CHUNK_TIMEOUT_MS = 5_000

/**
 * WATCHDOG — Silencio máximo tolerado EN EL BORDE DE LA RESPUESTA antes de que
 * cerremos el stream nosotros.
 *
 * POR QUÉ EXISTE, y por qué reemplaza al enfoque de los dos sprints previos: la
 * medición en prod (dos invocaciones idénticas) mostró `chunks_total: 1` —
 * Gemini manda la respuesta entera en UN chunk y después silencio absoluto. Sin
 * ruido y sin keepalives, los timers del SDK (`chunkMs`, `stepMs`) TUVIERON que
 * vencer, y aun así no se cerró nada. La causa está en el SDK y ninguna opción
 * de `timeout` la esquiva (ver el encabezado de `streamWatchdog.ts`): el chequeo
 * de abort corre detrás de un `read()` bloqueado, y el `closeStream()` vive en
 * un `flush()` que no corre cuando el stream erroriza.
 *
 * Este techo NO le pide nada al SDK: corre en el `TransformStream` que envuelve
 * el body que devolvemos, así que el cierre está garantizado por construcción.
 *
 * ARITMÉTICA (con los números medidos): el chunk único llega a los ~6.4s de
 * elapsed del request → el watchdog dispara a ~9.4s → `persistTurn` corre con el
 * presupuesto de ONF-2 (típico ~300ms, techo 5s) → cierre a ~10s. Contra los 30s
 * de hoy, y con ~20s de aire contra el `maxDuration`. En el camino sano el
 * upstream cierra solo, el `flush` mata el timer y esto no cambia NADA.
 *
 * CALIBRABLE, no sagrado. Los `gapMs` medidos hasta el primer chunk fueron 1470
 * y 1664; no tenemos datos de gaps ENTRE chunks porque Gemini mandó uno solo. Si
 * en prod aparecen respuestas cortadas a la mitad, este es el número a subir.
 */
export const STREAM_WATCHDOG_IDLE_MS = 3_000

/**
 * WATCHDOG — `STREAM_STEP_TIMEOUT_MS` (el `stepMs` de la Fase 2) fue REMOVIDO.
 *
 * Se agregó como reloj de pared contra la hipótesis de que Gemini emitía ruido
 * que reiniciaba el `chunkMs`. La medición la descartó: `chunks_total: 1`, un
 * solo chunk y silencio. Con eso, `stepMs` (12s) TUVO que vencer en las dos
 * invocaciones observadas — y no apareció ni `onAbort_enter` ni `onFinish_enter`,
 * y la función igual billó 30000 ms. Beneficio medido: CERO.
 *
 * Y tenía un costo real: aborta a los 12s del inicio del step pase lo que pase,
 * así que TRUNCA cualquier generación legítima más larga. Riesgo sin
 * contraprestación → se saca. Quien cierra el stream ahora es el watchdog
 * (`STREAM_WATCHDOG_IDLE_MS` arriba), que no depende del SDK.
 *
 * `chunkMs` (`STREAM_CHUNK_TIMEOUT_MS`) se deja: es más benigno (5s de silencio,
 * no un reloj absoluto) y no trunca generaciones sanas. No cierra el stream por
 * sí mismo, pero una vez que el watchdog cerró el lado del cliente puede ayudar
 * a que el SDK libere recursos upstream.
 */

// ─── 2. Compensación de cupo: tabla de decisión ──────────────────────────────

/** Dónde se detectó que el turno NO entregó una respuesta cobrable. */
export type CompensationTrigger =
  | 'stream_error' // onError: el stream murió (Vertex, throw en una tool)
  | 'stream_abort' // onAbort: el stream se cortó (cliente desconectado)
  | 'empty_response' // onFinish con fallback inyectado (el modelo devolvió vacío)
  | 'no_user_message' // 400 post-reserva: el body no traía mensaje 'user'
  | 'unhandled_error' // catch externo: falló antes de devolver el stream

export interface CompensationDecisionInput {
  /** Ya se compensó esta reserva en este request (guard once-only del caller). */
  alreadyCompensated: boolean
  trigger: CompensationTrigger
  /** ttfbAt !== null: al visitante le llegó al menos un chunk útil (text-delta o tool-call). */
  firstTokenDelivered: boolean
  /** Tool calls agregadas de todos los steps del run (relevante solo en empty_response). */
  toolCallCount: number
}

/**
 * ¿Corresponde devolver la reserva de cupo? El caller solo construye el
 * compensador cuando la reserva EXISTIÓ (isNewConversation + reserve OK), así
 * que "no hubo reserva" no entra a esta tabla.
 *
 * Criterio: el cupo se cobra si el visitante recibió ALGO de valor (texto
 * parcial o una tool ejecutada, ej. capture_lead). Se devuelve solo cuando el
 * turno murió sin entregar nada.
 */
export function shouldCompensateQuota(input: CompensationDecisionInput): boolean {
  if (input.alreadyCompensated) return false
  switch (input.trigger) {
    case 'stream_error':
    case 'stream_abort':
      // Murió DESPUÉS del primer chunk útil → entrega parcial, se cobra.
      // Antes del primer chunk útil → no se entregó nada, se devuelve.
      return !input.firstTokenDelivered
    case 'empty_response':
      // Texto vacío pero con tools ejecutadas (capture_lead / handoff) = valor
      // entregado (el lead quedó capturado) → se cobra. Vacío total → se devuelve.
      return input.toolCallCount === 0
    case 'no_user_message':
    case 'unhandled_error':
      // Nunca se llamó al LLM / nunca salió el stream → se devuelve siempre.
      return true
  }
}

// ─── 3. Fallback de respuesta vacía ───────────────────────────────────────────

/** id de las text parts inyectadas (visible en el UI message stream — greppable). */
export const EMPTY_FALLBACK_TEXT_ID = 'onf1-empty-fallback'

/**
 * Mensaje canned de derivación para un turno donde el modelo devolvió vacío.
 * Mismo tono y estructura que las respuestas degradadas de C0.2/B4.2 (deriva a
 * WhatsApp si el bot lo tiene configurado). Es TEXTO del assistant (se inyecta
 * al stream y se persiste), no un `degradedResponse` JSON — a esta altura el
 * stream HTTP ya está comprometido.
 */
export function buildEmptyFallbackMessage(whatsappNumber: string | null): string {
  return whatsappNumber
    ? 'Se me complicó generar una respuesta ahora. Te derivo con el equipo por WhatsApp así seguimos sin demoras.'
    : 'Se me complicó generar una respuesta ahora. Escribinos por los canales de contacto del sitio y el equipo te sigue personalmente.'
}

/**
 * Transform de streamText que inyecta el mensaje de derivación cuando el run
 * terminó SIN texto útil (ni un text-delta con contenido no-blanco en ningún
 * step). Así el visitante ve la derivación EN VIVO (el widget lo renderiza como
 * texto normal del assistant — cero cambios en el widget) y el turno no queda
 * mudo.
 *
 * Mecánica: cada `finish-step` se retiene un chunk (no sabemos si es el último
 * step hasta ver el siguiente chunk). Si lo que sigue es el `finish` del run y
 * no hubo texto útil, las text parts canned se inyectan ANTES del finish-step
 * retenido — quedan DENTRO del último step, así `steps[]`/`text` del onFinish
 * las incluyen y el orden del protocolo UI queda válido. En cualquier otro caso
 * el chunk retenido se libera intacto: con texto útil el stream pasa IDÉNTICO
 * (paridad del camino feliz, sin latencia — retener finish-step no demora
 * ningún text-delta). Un stream que muere con error nunca llega al `finish`
 * → no se inyecta (ese caso es compensación, no fallback).
 *
 * `onInject` avisa al handler (flag de request) que el turno fue fallback:
 * no se cuenta como respuesta entregada (compensación de cupo si aplica).
 */
export function createEmptyResponseFallbackTransform<TOOLS extends ToolSet>(
  fallbackText: string,
  onInject: () => void,
): StreamTextTransform<TOOLS> {
  return () => {
    let sawUsefulText = false
    let heldFinishStep: TextStreamPart<TOOLS> | null = null
    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        if (chunk.type === 'text-delta' && chunk.text.trim().length > 0) {
          sawUsefulText = true
        }
        if (heldFinishStep !== null) {
          if (chunk.type === 'finish' && !sawUsefulText) {
            onInject()
            sawUsefulText = true
            controller.enqueue({ type: 'text-start', id: EMPTY_FALLBACK_TEXT_ID })
            controller.enqueue({ type: 'text-delta', id: EMPTY_FALLBACK_TEXT_ID, text: fallbackText })
            controller.enqueue({ type: 'text-end', id: EMPTY_FALLBACK_TEXT_ID })
          }
          controller.enqueue(heldFinishStep)
          heldFinishStep = null
        }
        if (chunk.type === 'finish-step') {
          heldFinishStep = chunk
          return
        }
        controller.enqueue(chunk)
      },
      flush(controller) {
        // Stream que terminó sin `finish` (error/abort): liberar lo retenido
        // tal cual — nunca inyectar en un stream que murió.
        if (heldFinishStep !== null) controller.enqueue(heldFinishStep)
      },
    })
  }
}

// ─── 4. INFRA.3 — retry contra la conexión (DEFINIDO, NO ACTIVO) ─────────────

/**
 * TODO(INFRA.3): parámetros del retry/backoff CONTRA LA CONEXIÓN (lib/prisma.ts
 * / pgbouncer / connection string de Neon). Quedan definidos acá para que el
 * sprint INFRA.3 los cablee cuando estén la firma real del error de prod
 * (Netlify Function Logs + Sentry DSN) y la coordinación con Franco sobre la
 * Neon compartida. NO se usan en ONF-1: este sprint NO toca cómo se conecta a
 * la DB. El único retry activo de ONF-1 es PERSIST_TX_* (aplicación, arriba).
 */
export const INFRA3_CONNECTION_RETRY = {
  maxAttempts: 3,
  initialBackoffMs: 250,
  maxBackoffMs: 2_000,
} as const
