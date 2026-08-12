/**
 * Contador de chunks del provider por tipo — telemetría PERMANENTE.
 *
 * POR QUÉ VIVE ACÁ Y NO EN `streamProbe.ts` (H.3). Nació como parte de la
 * instrumentación temporal (STREAM-TIMEOUT Fase 2) y vivía en ese módulo, pero
 * su `snapshot()` alimenta `chat.onfinish_phases` (`handleChatRequest.ts`), que
 * es telemetría permanente y NO está gated por `CHATBOT_STREAM_PROBE`. Mientras
 * estuvieron en el mismo archivo, borrar el probe algún día habría roto un log
 * permanente. H.3 separó las dos cosas: `streamProbe.ts` es el instrumento
 * temporal y reversible; esto se queda.
 *
 * QUÉ MIDE Y POR QUÉ IMPORTA. El flujo de chunks que llega a `onChunk`. Si
 * `chunks_total` sigue subiendo después de que el texto terminó, el provider
 * sigue hablando y ningún timeout ENTRE chunks puede cortar — que fue
 * exactamente la hipótesis que hubo que descartar para llegar al deadlock real.
 * `msSinceLastChunk` es el silencio acumulado hasta el instante del snapshot.
 *
 * ⚠️ LÍMITE DE LA MEDICIÓN, a tener presente al leer el log: cuenta en
 * `onChunk`, que el SDK invoca AGUAS ABAJO del enqueue — los chunks que el SDK
 * descarta antes (un `text-delta` vacío, `stream-start`) NUNCA llegan acá. Para
 * el flujo CRUDO del provider está `provider.stream_chunks`
 * (`llm/providerStreamClose.ts`), que cuenta del lado de arriba.
 *
 * REGLA DE PII: solo TIPOS de chunk y contadores. Nunca contenido.
 */

/**
 * Contadores planos, listos para spread dentro de otro log. El tipo
 * (`string | number | boolean` por campo) es la barrera que impide colar
 * contenido de mensajes.
 */
export type ChunkTallySnapshot = Record<string, string | number | boolean>

export interface ChunkTally {
  /** Registra un chunk recibido. */
  record(chunkType: string): void
  /** Contadores acumulados, listos para adjuntar a otra emisión. */
  snapshot(): ChunkTallySnapshot
}

/** `text-delta` → `chunks_text_delta`. Claves planas y seguras para el log. */
function tallyKey(chunkType: string): string {
  return `chunks_${chunkType.replace(/[^a-zA-Z0-9]+/g, '_')}`
}

export function createChunkTally(): ChunkTally {
  const counts = new Map<string, number>()
  let total = 0
  let lastChunkAt = Date.now()

  return {
    snapshot(): ChunkTallySnapshot {
      const out: ChunkTallySnapshot = {
        chunks_total: total,
        // Silencio del provider hasta ESTE instante.
        msSinceLastChunk: Date.now() - lastChunkAt,
      }
      for (const [type, count] of counts) out[tallyKey(type)] = count
      return out
    },
    record(chunkType) {
      total += 1
      counts.set(chunkType, (counts.get(chunkType) ?? 0) + 1)
      lastChunkAt = Date.now()
    },
  }
}
