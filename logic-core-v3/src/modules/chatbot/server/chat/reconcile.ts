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

// ─── 1.c STREAM-TIMEOUT: `chunkMs` — REMOVIDO (bloque MUDEZ) ─────────────────

/**
 * `STREAM_CHUNK_TIMEOUT_MS` (el `chunkMs` de STREAM-TIMEOUT) fue REMOVIDO.
 *
 * Se creía "benigno" (5s de silencio, no un reloj absoluto). La Fase 0 del
 * bloque MUDEZ probó lo contrario, contra el SDK instalado (ai@6.0.214) y con
 * reproducción empírica: el timer se arma con el primer chunk del step
 * (`ai/dist/index.js:7793` — incluido `stream-start`, que es transporte) y se
 * limpia recién en el flush del step (`:8071`). Como el SDK RETIENE el chunk
 * `finish` del provider hasta que los tools terminan (`:6655/:6618`), el gap
 * tool-call→tool-result es INTRA-step: un tool server-side legítimo que tarde
 * más de 5s (capture_lead con Neon fría: 7.8s medidos) disparaba un ABORT
 * SILENCIOSO del run entero — `onAbort` sin `onError`, cero texto, y con 0
 * steps registrados `onFinish` jamás corre (`:7264`): turno mudo, nada
 * persistido, costo perdido, cupo cobrado. Era la causa raíz de la variante
 * "orig3" del turno mudo (~1 de cada 8-13 turnos con captura de lead en dev).
 *
 * Sus dos funciones reales ya tienen dueño mejor:
 *   - cortar el silencio del provider → `providerStreamClose` (cierra, no
 *     aborta: los `flush()` del SDK corren y el run TERMINA con `onFinish`);
 *   - liberar recursos upstream → el AbortController propio del handler,
 *     abortado por el watchdog al disparar (bloque MUDEZ, commit 1).
 *
 * `stepMs`/`totalMs` siguen sin setearse (ver la nota de `stepMs` abajo).
 */

/**
 * WATCHDOG — Silencio máximo tolerado EN EL BORDE DE LA RESPUESTA, UNA VEZ QUE
 * YA FLUYÓ EL PRIMER CHUNK, antes de que cerremos el stream nosotros.
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
 * WATCHDOG-2 — bajado de 3000ms a 1200ms tras verificar en prod que el watchdog
 * SÍ funciona (el input se destrababa en ~4s: ~3000ms de idle + ~300-1000ms de
 * `persistTurn`). Casi todo ese tiempo era el idle, así que ahí estaba el
 * margen. Bajarlo de una sin separar ventanas hubiera cortado el arranque (ver
 * `STREAM_WATCHDOG_INITIAL_IDLE_MS`) — por eso esta ventana ahora SOLO aplica
 * después del primer chunk, donde 1200ms es un silencio mucho más anómalo.
 *
 * ARITMÉTICA (con los números medidos): el chunk único llega a los ~6.4s de
 * elapsed del request → el watchdog dispara a ~7.6s → `persistTurn` corre con el
 * presupuesto de ONF-2 (típico ~300ms, techo 5s) → cierre a ~7.9-8.6s. Contra
 * los 30s de hoy. En el camino sano el upstream cierra solo, el `flush` mata el
 * timer y esto no cambia NADA.
 *
 * CALIBRABLE, no sagrado. NO tenemos datos de gaps ENTRE chunks (Gemini mandó
 * uno solo en las mediciones) — es una estimación conservadora, no una
 * medición directa como sí lo es `STREAM_WATCHDOG_INITIAL_IDLE_MS`. Si en prod
 * aparecen respuestas cortadas a la mitad, este es el número a subir primero.
 *
 * PROVIDER-CLOSE — SUBIDO de 1200ms a 3000ms: pasa de ser el mecanismo que
 * cierra a ser una RED DE SEGURIDAD. Ahora quien cierra rápido es
 * `PROVIDER_STREAM_IDLE_MS` (1000ms, aguas arriba, sobre el stream del
 * provider), y al cerrarse ese stream el SDK completa el pipeline y el body
 * termina solo — este watchdog no debería dispararse NUNCA en operación
 * normal. Se sube para que los dos no compitan: con 1200ms podía dispararse
 * justo mientras el SDK arranca el step 2 (que tiene su propio cold start),
 * cortando la respuesta final. NO degrada la latencia — el cierre rápido ahora
 * lo hace el middleware del provider.
 */
export const STREAM_WATCHDOG_IDLE_MS = 3_000

/**
 * PROVIDER-CLOSE — Silencio máximo tolerado en el stream CRUDO del provider,
 * ENTRE chunks, antes de que lo cerremos para destrabar el pipeline del SDK.
 *
 * Distinto —y aguas ARRIBA— del watchdog del borde: aquel cierra la respuesta
 * HTTP hacia el cliente (destraba el input del widget); este cierra el stream
 * del provider, que es lo único que hace correr los `flush()` internos del SDK
 * (ejecución de tools, `finish-step`, step siguiente, `onStepFinish`,
 * `onFinish` y el `usage` que alimenta el costo). El del borde no puede hacer
 * eso: cierra hacia abajo, no hacia arriba.
 *
 * 1000ms: el silencio entre chunks de un provider que está generando es de
 * milisegundos; 1s ya es señal inequívoca de que terminó y no va a cerrar.
 * Más agresivo que el del borde (3000ms) a propósito — este es el que ahora
 * marca la latencia real de cierre, y el del borde quedó como red de seguridad.
 */
export const PROVIDER_STREAM_IDLE_MS = 1_000

/**
 * PROVIDER-CLOSE — Silencio máximo tolerado ANTES del primer chunk del stream
 * del provider (cold start real de Vertex/Gemini).
 *
 * Misma razón que `STREAM_WATCHDOG_INITIAL_IDLE_MS` y el mismo valor: los gaps
 * medidos en prod hasta el primer chunk fueron 1470ms y 1664ms, muy por encima
 * de `PROVIDER_STREAM_IDLE_MS`. Con una sola ventana, cerraríamos el stream
 * ANTES de que el modelo empiece a responder.
 *
 * No hace falta un `beginStep()` como en el watchdog del borde: cada step llama
 * a `doStream()` de nuevo, así que cada step recibe su propia instancia del
 * transform con su propia ventana inicial. El arranque en frío por step queda
 * cubierto por construcción.
 */
export const PROVIDER_STREAM_INITIAL_IDLE_MS = 12_000

/**
 * WATCHDOG-2 — Silencio máximo tolerado ANTES del primer chunk (cold start del
 * provider). Por qué es mucho más largo que `STREAM_WATCHDOG_IDLE_MS`: bajar
 * este último a 1200ms (de los 3000ms originales) para acortar la latencia de
 * cierre habría cortado la respuesta ANTES de que llegara el primer chunk —
 * los `gapMs` medidos en prod hasta el primer chunk fueron **1470ms y 1664ms**,
 * ya por encima de 1200ms. Separar las dos ventanas permite bajar la ventana
 * POST-chunk sin arriesgar el arranque.
 *
 * 12000ms da margen amplio para un cold start de Vertex/Neon sin ser, por eso
 * mismo, un reloj absoluto: sigue siendo un timeout de INACTIVIDAD (se resetea
 * si algo llega antes), no un techo duro tipo el `stepMs` removido.
 */
export const STREAM_WATCHDOG_INITIAL_IDLE_MS = 12_000

/**
 * WATCHDOG-2 — Techo máximo de SUSPENSIÓN del watchdog mientras hay tools en
 * vuelo (`capture_lead`, `show_whatsapp_handoff` — los únicos con `execute`
 * server-side). Sin este techo, un tool colgado (ej. la misma Neon fría que
 * motiva la suspensión, pero que nunca responde) dejaría al watchdog suspendido
 * PARA SIEMPRE — exactamente el mismo síntoma de 30s que este sprint entero
 * viene arreglando, ahora reintroducido por la propia mitigación.
 *
 * 15000ms: más que suficiente para el cold start de Neon medido (6-7s) más
 * margen, y bien por debajo de lo que quedaría de `maxDuration` (30s) restando
 * el pre-LLM (~5-6s medido) y el colchón de persistencia.
 */
export const STREAM_WATCHDOG_TOOL_MAX_MS = 15_000

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
 * `chunkMs` (`STREAM_CHUNK_TIMEOUT_MS`) corrió la misma suerte después (bloque
 * MUDEZ): "benigno" resultó falso — abortaba turnos con tools legítimos lentos.
 * Ver la nota de remoción en la sección 1.c.
 */

// ─── 1.d MUDEZ: qué texto se persiste como respuesta del asistente ───────────

/**
 * MUDEZ (commit 3) — BUG-D: `onFinish.text` es SOLO el texto del ÚLTIMO step
 * (`ai/dist/index.js:7280` + `:4203`: `recordedContent` se resetea en cada
 * `start-step`). En un run multi-step donde el modelo escribió en el step 1 y
 * el step final cerró sin texto, el visitante VIO la respuesta streameada en
 * vivo pero `onFinish` llega con `text: ''` — y se persistía una fila ASSISTANT
 * vacía. El bug más silencioso de la familia: en producción no se nota nunca;
 * se nota meses después, en un transcript incompleto o en el motor de insights
 * leyendo conversaciones sin respuestas. Reproducido empíricamente contra el
 * streamText real (sonda P3 de la Fase 0).
 *
 * La decisión: si el `text` del SDK trae contenido real, se persiste ese (es el
 * texto canónico del cierre); si viene vacío —o solo whitespace, el residuo que
 * marcó el premortem— se persiste el ACUMULADO de `onChunk`, que es literalmente
 * lo que el visitante vio pasar por su pantalla.
 *
 * LÍMITE CONOCIDO (anotado, no cubierto acá): si el step final SÍ trae texto y
 * un step anterior TAMBIÉN traía, el transcript conserva solo el final — igual
 * que siempre. Cambiar eso es una decisión de formato de transcript (¿concatenar
 * steps? ¿con qué separador?), no un fix de mudez.
 *
 * Pura y determinista, sin I/O — testeable directo (mudez-net.invariant.ts).
 */
export function pickPersistedAssistantText(
  finishText: string,
  accumulatedText: string,
): string {
  return finishText.trim().length > 0 ? finishText : accumulatedText
}

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

/** BLOQUE VOZ — id de las text parts del conector de tarjeta (greppable en el wire). */
export const CARD_CONNECTOR_TEXT_ID = 'voz-card-connector'

/**
 * BLOQUE VOZ — qué inyectó el transform de respuesta vacía:
 *  - 'derivation': la disculpa/derivación de siempre (algo se rompió de verdad).
 *  - 'card_connector': el conector neutral — el run cerró en un tool CARDEADO
 *    y la tarjeta en pantalla ES la respuesta; disculparse la contradecía.
 * Ambos kinds marcan el turno como fallback (mismo flag del handler); el kind
 * existe para telemetría y para elegir el texto.
 */
export type EmptyFallbackInjectionKind = 'derivation' | 'card_connector'

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
 * ⚠️ REGLA DURA, aprendida a los golpes (DEADLOCK-FINISH-STEP): un transform de
 * usuario puede AGREGAR chunks, pero **JAMÁS puede demorar uno del SDK**. Cada
 * chunk se reenvía con `controller.enqueue()` en la MISMA invocación de
 * `transform()` en la que llega. Nada se retiene, ni un chunk ni un tick.
 *
 * POR QUÉ. La versión anterior retenía `finish-step` un chunk (para saber si era
 * el último step antes de decidir). Eso producía una ESPERA CIRCULAR que trababa
 * el pipeline entero del SDK:
 *
 *   1. El inner transform de `streamStep` encola `finish-step`
 *      (`ai/dist/index.js:8007`) y hace `await stepFinish.promise` (`:8022`).
 *   2. `stepFinish.resolve()` vive en el `eventProcessor`, bajo
 *      `part.type === 'finish-step'` (`:7253`) — o sea, corre SOLO cuando ese
 *      chunk llega hasta ahí.
 *   3. Nuestros transforms se aplican ENTRE medio (`:7396-7405`), así que el
 *      chunk retenido nunca llegaba al `eventProcessor`.
 *   4. Se liberaba con el chunk siguiente... que solo llega si el SDK avanza.
 *   5. O en nuestro `flush`, que corre al cerrar el stream de arriba — y ese
 *      cierre (`self.closeStream()`, `:8103`/`:8112`) está DESPUÉS del `await`
 *      bloqueado.
 *
 * Consecuencias medidas en prod: `step_count: 0`, `onFinish` nunca dispara,
 * costo en 0 (el `usage` viaja en `finish`, que nunca se procesaba) y —lo más
 * caro— tras un tool el step 2 NUNCA arrancaba, así que el bot capturaba el lead
 * y después no respondía nada. Verificado contra el `streamText` real: con un
 * provider sano que cierra normal, SIN este transform `onFinish` dispara con
 * `steps: 1` y usage completo; CON la versión que retenía, el stream quedaba
 * colgado. Ver `empty-fallback-pipeline.invariant.ts`.
 *
 * MECÁNICA ACTUAL. Se lleva la cuenta de si hubo texto útil a medida que fluyen
 * los chunks, y la decisión se toma en el chunk terminal `finish` — que es
 * inequívocamente el final de TODO el run, no de un step intermedio. Si no hubo
 * texto en ningún step, las text parts canned se encolan ANTES del `finish`, en
 * la misma invocación: alcanza con el ORDEN dentro de la llamada, no hace falta
 * retener para inyectar antes.
 *
 * CUÁNDO INYECTA: idéntico a la versión anterior (la vieja también decidía al
 * ver el `finish`). Un step intermedio que solo hace una tool call no dispara
 * nada — su `finish-step` pasa de largo y la decisión espera al `finish` del
 * run, para entonces con el texto del step 2 ya contabilizado. Un stream que
 * muere con error/abort nunca llega al `finish` → no se inyecta (ese caso es
 * compensación, no fallback).
 *
 * LO ÚNICO QUE CAMBIA: las text parts caen DESPUÉS del último `finish-step` en
 * vez de antes, así que quedan fuera de `steps[]`/`text` del `onFinish`. Es
 * inocuo para la persistencia: `handleChatRequest` ya resuelve
 * `assistantContent` con el canned explícito cuando `emptyFallbackInjected` y
 * el texto viene vacío (belt-and-suspenders que ya existía). Y para el
 * visitante no cambia nada: las parts igual viajan por el UI message stream.
 *
 * BLOQUE VOZ — QUÉ texto se inyecta depende de cómo cerró el run. Si algún
 * tool CARDEADO (claves de `cardConnectors`, catálogo en getTools.ts) corrió
 * en el run, su tarjeta quedó en pantalla y ES la respuesta: se inyecta el
 * conector neutral de ese tool (id `CARD_CONNECTOR_TEXT_ID`) — disculparse
 * ahí contradecía la tarjeta (camino 6 del mapa de MUDEZ, capturado en prod).
 * Sin tarjeta, la derivación de siempre (id `EMPTY_FALLBACK_TEXT_ID`). La
 * decisión sigue tomándose en el chunk terminal `finish`, con estado
 * acumulado — la regla de NO retención queda intacta.
 *
 * `onInject` avisa al handler (flag de request) que el turno fue fallback:
 * no se cuenta como respuesta entregada (compensación de cupo si aplica; con
 * tools ejecutadas el turno se cobra igual — tabla de shouldCompensateQuota).
 * El `kind` distingue derivación de conector, para telemetría.
 */
export function createEmptyResponseFallbackTransform<TOOLS extends ToolSet>(
  fallbackText: string,
  onInject: (kind: EmptyFallbackInjectionKind) => void,
  cardConnectors: ReadonlyMap<string, string> = new Map<string, string>(),
): StreamTextTransform<TOOLS> {
  return () => {
    let sawUsefulText = false
    // BLOQUE VOZ — conector del último tool CARDEADO visto en el run (las
    // claves de `cardConnectors` son el catálogo de getTools.ts). NO se
    // resetea entre steps A PROPÓSITO: la tarjeta ya renderizada persiste en
    // pantalla (el widget renderiza el acumulado de toolCalls del mensaje),
    // así que un tool NO cardeado posterior no la quita — y un reset por step
    // reintroduciría la disculpa pegada a la tarjeta en el caso
    // show_whatsapp_handoff → step siguiente vacío. Un tool no cardeado
    // (capture_lead) jamás lo setea, así que el caso "capture_lead y después
    // nada" cae en la derivación, que es lo correcto (no hay nada visible).
    // Solo estado ACUMULADO en el closure del factory — cero retención de
    // chunks, la regla dura de arriba sigue intacta.
    let cardConnectorText: string | null = null
    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        if (chunk.type === 'text-delta' && chunk.text.trim().length > 0) {
          sawUsefulText = true
        }
        if (chunk.type === 'tool-call') {
          const connector = cardConnectors.get(chunk.toolName)
          if (connector !== undefined) cardConnectorText = connector
        }
        // `finish` = terminal del RUN completo (no de un step). Es el único
        // punto donde ya se sabe que no va a llegar más texto.
        if (chunk.type === 'finish' && !sawUsefulText) {
          // BLOQUE VOZ — con tarjeta en pantalla, la tarjeta ES la respuesta:
          // el texto conecta con ella en vez de disculparse. Sin tarjeta, la
          // derivación de siempre. Cada variante con su id, distinguible en
          // el wire y en telemetría.
          const kind: EmptyFallbackInjectionKind =
            cardConnectorText !== null ? 'card_connector' : 'derivation'
          const id = kind === 'card_connector' ? CARD_CONNECTOR_TEXT_ID : EMPTY_FALLBACK_TEXT_ID
          const text = cardConnectorText ?? fallbackText
          onInject(kind)
          sawUsefulText = true
          controller.enqueue({ type: 'text-start', id })
          controller.enqueue({ type: 'text-delta', id, text })
          controller.enqueue({ type: 'text-end', id })
        }
        // SIEMPRE, en la misma invocación. Sin `flush`: no hay nada retenido
        // que liberar — y esa es exactamente la propiedad que importa.
        controller.enqueue(chunk)
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
