/**
 * MUDEZ (commit 2) — Frames SSE de texto para que el borde pueda HABLAR.
 *
 * Cuando la red del watchdog decide que el turno va a terminar mudo (silencio
 * cortado por idle, o cierre limpio del SDK sin texto ni fallback), el visitante
 * tiene que ver la derivación canned igual. El watchdog opera sobre BYTES, así
 * que lo que puede encolar antes de cerrar son frames del UI message stream ya
 * codificados — exactamente los mismos tres que el SDK emite para un texto:
 *
 *   data: {"type":"text-start","id":...}
 *   data: {"type":"text-delta","id":...,"delta":...}
 *   data: {"type":"text-end","id":...}
 *
 * ⚠️ LA FORMA ES ESTRICTA. El transport del cliente valida cada frame con
 * `uiMessageChunkSchema` (`z.strictObject`, ai/dist/index.js:5504-5519) y un
 * frame que no parsea hace THROW → status 'error' → el widget no muestra NADA
 * (el fix de la mudez produciría mudez). El campo del delta se llama `delta`,
 * NO `text` — es la diferencia exacta con el `TextStreamPart` interno del
 * server, y fue una trampa identificada en el premortem del bloque. El id
 * habilita al cliente a abrir/cerrar la parte de texto (`text-start` requerido
 * antes de cualquier `text-delta`, ai/dist/index.js:5882-5895).
 *
 * `[DONE]` no hace falta: el cliente termina bien con el EOF del body (hoy el
 * `terminate()` del watchdog ya corta antes del `[DONE]` del SDK y el widget
 * pasa a `ready` igual — medido en los sprints del watchdog).
 *
 * Módulo puro: sin estado, sin I/O. Una función, un encoder local.
 */

/** Id de la parte de texto inyectada por el borde. Rastreable en el wire. */
export const SILENCE_TEXT_ID = 'mudez-borde'

const encoder = new TextEncoder()

/** Codifica un frame SSE del UI message stream. */
function sseFrame(payload: Record<string, string>): string {
  return `data: ${JSON.stringify(payload)}\n\n`
}

/**
 * La tríada `text-start` / `text-delta` / `text-end` con el texto dado, lista
 * para encolar en el borde ANTES de cerrar el stream.
 */
export function buildSilenceTextFrames(text: string, id: string = SILENCE_TEXT_ID): Uint8Array {
  return encoder.encode(
    sseFrame({ type: 'text-start', id }) +
      sseFrame({ type: 'text-delta', id, delta: text }) +
      sseFrame({ type: 'text-end', id }),
  )
}
