/**
 * PROBE-STREAM — Instrumentación TEMPORAL de diagnóstico para localizar el
 * punto EXACTO donde el stream del chatbot se cuelga en producción.
 *
 * CONTEXTO: en prod, una invocación colgada muestra `chat.llm_request_start` y
 * después, directo, `Duration: 30000` (el kill de Netlify). `chat.onfinish_phases`
 * —que vive en un `finally` y corre SIEMPRE si `onFinish` llega a entrar— NO
 * aparece. Eso prueba que el cuelgue está AGUAS ARRIBA de `onFinish`, en algún
 * `await` del tramo `streamText()` → tools → `onFinish` que hoy no loguea nada.
 *
 * ESTE MÓDULO ES TEMPORAL Y REVERSIBLE. Cada línea que emite lleva el campo
 * `probe: 'stream'` para poder localizarla y revertirla de una.
 *
 * POR QUÉ CADA LÍNEA ES AUTOSUFICIENTE PARA REORDENAR A MANO
 * Netlify bufferea y reordena logs — se comprobó una línea `Duration` apareciendo
 * ANTES que el `chat.llm_request_start` de la MISMA invocación en el mismo log.
 * Por eso cada emisión lleva `seq` (contador monotónico, POR REQUEST — vive en el
 * closure de `createStreamProbe`, no a nivel módulo, porque un contador de módulo
 * persiste entre invocaciones del mismo contenedor caliente y mezclaría
 * secuencias de requests distintos) y `elapsedMs` (desde el `startTime` del
 * request): con esos dos campos se puede reconstruir el orden real aunque
 * Netlify entregue las líneas mezcladas o incompletas.
 *
 * CÓMO LEER EL RESULTADO
 * La regla de diseño es enter/exit: toda operación que pueda colgar se envuelve
 * con un `enter` antes y un `exit` (o `error`) después. Si cuelga, veremos su
 * `enter` sin su `exit`. El ÚLTIMO `point` con `phase:'enter'` y sin su
 * `phase:'exit'`/`'error'` correspondiente (mismo `conversationId`, `seq` mayor)
 * es el cuelgue. `phase:'mark'` son breadcrumbs de un solo punto en el tiempo
 * (no se esperan en pares) — su ausencia no es significativa.
 *
 * GATE — cero overhead sin la env var. Si `CHATBOT_STREAM_PROBE !== '1'`, `probe()`
 * y `mark()` son no-ops y `probeAround` se reduce a un `await op()` transparente.
 * La env var se lee UNA vez al crear el probe, no en cada emisión.
 *
 * REGLA DE PII — el tipo de `extra` (`string | number | boolean` por campo) es la
 * barrera: impide pasar objetos anidados, arrays o el contenido de un mensaje.
 * NUNCA loguear argumentos de tool, contenido de chat, ni resultados — solo
 * nombres, contadores, longitudes y flags.
 */

/**
 * `enter`/`exit`/`error` se usan en pares (via `probeAround`) para operaciones
 * que pueden colgar — su ausencia de `exit` es la señal que este sprint busca.
 * `mark` es un breadcrumb de un solo punto en el tiempo (ej. `firstChunk`,
 * `beforeStreamResponse`) — no se espera un exit para él.
 */
export type ProbePhase = 'enter' | 'exit' | 'error' | 'mark'

/**
 * Metadata SEGURA para adjuntar a una emisión: nombre de tool, contadores,
 * longitudes, flags, finishReason. Las claves están limitadas a
 * `string | number | boolean` A PROPÓSITO — es la barrera de tipos que impide
 * pasar contenido de mensajes, argumentos de tool o cualquier objeto anidado.
 * NUNCA loguear el valor de un mensaje o de un argumento de usuario acá.
 */
export type ProbeExtra = Record<string, string | number | boolean>

export interface StreamProbe {
  /** `true` si `CHATBOT_STREAM_PROBE === '1'` (leído una vez, al crear el probe). */
  readonly enabled: boolean
  /** Emite una línea de probe. No-op si `enabled` es `false`. */
  probe(point: string, phase: ProbePhase, extra?: ProbeExtra): void
  /** Atajo para `probe(point, 'mark', extra)` — un breadcrumb de un solo punto. */
  mark(point: string, extra?: ProbeExtra): void
}

/**
 * Crea un probe atado a UN request. `seq` arranca en 0 y vive en este closure
 * (no en el módulo) para que no se mezcle entre invocaciones del mismo
 * contenedor caliente.
 */
export function createStreamProbe(conversationId: string, startTime: number): StreamProbe {
  const enabled = process.env.CHATBOT_STREAM_PROBE === '1'
  let seq = 0

  const probe = (point: string, phase: ProbePhase, extra?: ProbeExtra): void => {
    if (!enabled) return
    seq += 1
    console.error(
      JSON.stringify({
        probe: 'stream',
        seq,
        conversationId,
        point,
        phase,
        elapsedMs: Date.now() - startTime,
        ...extra,
      }),
    )
  }

  return {
    enabled,
    probe,
    mark: (point, extra) => probe(point, 'mark', extra),
  }
}

/**
 * STREAM-TIMEOUT (Fase 2) — Contador de chunks del provider, para confirmar o
 * descartar la hipótesis del cuelgue: **¿Gemini sigue emitiendo chunks después
 * de terminar la respuesta?**
 *
 * POR QUÉ IMPORTA: `resetChunkTimeout()` es la PRIMERA línea del transform del
 * SDK (`ai/dist/index.js:7793`) y corre para CUALQUIER chunk del provider —
 * incluidos los que el SDK descarta enseguida (un `text-delta` con
 * `delta.length === 0` hace `break` sin enqueue, `:7824-7834`; `stream-start`
 * hace `return`, `:7794-7797`). Si Gemini sigue emitiendo chunks vacíos o
 * keepalives, el timer de `chunkMs` se reinicia para siempre y NUNCA vence.
 * Eso explicaría por qué el `chunkMs` de la Fase 1 no cortó el cuelgue.
 *
 * ⚠️ LÍMITE DE ESTA MEDICIÓN, y hay que tenerlo presente al leer el log: este
 * tally cuenta en `onChunk`, que el SDK invoca AGUAS ABAJO del enqueue. Los
 * chunks descartados NO llegan acá. O sea:
 *   - contador que SIGUE SUBIENDO tras el fin del texto → Gemini emite chunks
 *     visibles de más (hipótesis confirmada, variante "ruido visible");
 *   - contador ESTANCADO y aun así el `chunkMs` no vence → los chunks existen
 *     pero el SDK los descarta antes de `onChunk` (hipótesis confirmada,
 *     variante "ruido invisible" — la más probable);
 *   - contador estancado Y el `chunkMs` corta → el provider se calló de verdad.
 * Las dos primeras se distinguen entre sí por el contador; ambas se distinguen
 * de la tercera por si el stream aborta o no.
 *
 * HEARTBEAT en vez de log terminal: el modo de falla es justamente que ningún
 * hook terminal dispara, así que un resumen emitido al final no se vería nunca.
 * Se emite periódicamente desde el propio `onChunk`, con throttle para no
 * inundar el log.
 */
export interface ChunkTally {
  /** Registra un chunk recibido. Emite el heartbeat si toca. */
  record(chunkType: string): void
  /** Contadores acumulados, listos para adjuntar a otra emisión. */
  snapshot(): ProbeExtra
}

/** Intervalo mínimo entre heartbeats de `chunkFlow`. */
export const CHUNK_FLOW_HEARTBEAT_MS = 2_000

/** `text-delta` → `chunks_text_delta`. Claves planas y seguras para el log. */
function tallyKey(chunkType: string): string {
  return `chunks_${chunkType.replace(/[^a-zA-Z0-9]+/g, '_')}`
}

export function createChunkTally(
  probe: StreamProbe,
  heartbeatMs: number = CHUNK_FLOW_HEARTBEAT_MS,
): ChunkTally {
  const counts = new Map<string, number>()
  let total = 0
  let lastChunkAt = Date.now()
  let lastEmitAt = 0

  const snapshot = (): ProbeExtra => {
    const out: ProbeExtra = {
      chunks_total: total,
      // Silencio del provider hasta ESTE instante. Es el número que decide:
      // si se mantiene chico mientras el stream sigue colgado, el provider
      // sigue hablando y ningún timeout ENTRE chunks puede cortar.
      msSinceLastChunk: Date.now() - lastChunkAt,
    }
    for (const [type, count] of counts) out[tallyKey(type)] = count
    return out
  }

  return {
    snapshot,
    record(chunkType) {
      total += 1
      counts.set(chunkType, (counts.get(chunkType) ?? 0) + 1)
      const now = Date.now()
      // msSinceLastChunk del heartbeat mide el gap ANTES de este chunk.
      const gapMs = now - lastChunkAt
      lastChunkAt = now
      if (!probe.enabled) return
      if (now - lastEmitAt < heartbeatMs) return
      lastEmitAt = now
      probe.probe('chunkFlow', 'mark', { ...snapshot(), gapMs })
    },
  }
}

/**
 * Fallback para callers que no wirearon `ctx.probe` (hoy solo `getTools()`, en
 * `handleChatRequest.ts`, siempre lo pasa — este fallback es defensivo, para
 * cualquier otro call-site presente o futuro). SIEMPRE no-op, sin importar la
 * env var: sin un `conversationId` real no hay con qué correlacionar la línea.
 */
export const DISABLED_STREAM_PROBE: StreamProbe = {
  enabled: false,
  probe: () => {},
  mark: () => {},
}

/**
 * Envuelve una operación async con `enter` antes y `exit`/`error` después.
 * Re-lanza el error de `op` TAL CUAL (nunca lo traga) — esto es solo
 * instrumentación, no cambia el comportamiento de la operación envuelta.
 *
 * Si `op` cuelga, el `exit` (o `error`) NUNCA sale — ese es el dato: el último
 * `enter` sin su `exit` en el log marca el punto exacto del cuelgue.
 */
export async function probeAround<T>(
  probe: StreamProbe,
  point: string,
  op: () => Promise<T>,
  extra?: ProbeExtra,
): Promise<T> {
  probe.probe(point, 'enter', extra)
  try {
    const value = await op()
    probe.probe(point, 'exit', extra)
    return value
  } catch (error) {
    probe.probe(point, 'error', {
      ...extra,
      errorName: error instanceof Error ? error.name : 'NonError',
    })
    throw error
  }
}
