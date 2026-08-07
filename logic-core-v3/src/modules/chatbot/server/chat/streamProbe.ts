/**
 * PROBE-STREAM — Instrumento de diagnóstico APAGADO POR DEFECTO, para localizar
 * el punto EXACTO donde el stream del chatbot se cuelga.
 *
 * ESTADO (H.3). El cuelgue que motivó este módulo YA ESTÁ RESUELTO: era nuestro
 * propio `createEmptyResponseFallbackTransform` reteniendo el chunk
 * `finish-step` y deadlockeando el pipeline del SDK (ver DEADLOCK-FINISH-STEP en
 * la bitácora). Este instrumento fue el que lo encontró, después de tres sprints
 * de hipótesis equivocadas sobre el provider.
 *
 * POR QUÉ SE QUEDA IGUAL. Reconstruirlo si aparece OTRO cuelgue sería tirar ese
 * trabajo. Con `CHATBOT_STREAM_PROBE` sin setear cuesta una lectura de env var
 * por request y un `return` sobre un booleano: cero líneas de log, cero
 * overhead. H.3 sacó los puntos que emitían en el CAMINO SANO (eran ~20 líneas
 * ERROR por conversación) y dejó los que sirven para diagnosticar algo nuevo:
 * los pares enter/exit alrededor de cada await a DB de los tools, y las entradas
 * de `onError`/`onAbort`.
 *
 * NO CONFUNDIR con la telemetría permanente, que NO pasa por acá y se emite
 * siempre vía `chatbotLog`: `chat.watchdog_fired`, `watchdog_settled`,
 * `provider.stream_chunks`, `chat.onfinish_phases`, `chat.persist_abandoned`.
 * Ese es el diagnóstico de rutina; esto es el instrumento que se prende cuando
 * el diagnóstico de rutina no alcanza.
 *
 * CÓMO PRENDERLO: `CHATBOT_STREAM_PROBE=1` en el entorno. Cada línea que emite
 * lleva el campo `probe: 'stream'` para poder aislarlas de un grep.
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
