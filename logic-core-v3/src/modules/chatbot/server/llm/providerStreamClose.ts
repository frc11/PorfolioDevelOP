import type { LanguageModelMiddleware } from 'ai'
import type { LanguageModelV3StreamPart } from '@ai-sdk/provider'

/**
 * PROVIDER-CLOSE — Cierra el stream CRUDO del provider cuando se queda mudo,
 * para que el pipeline del AI SDK pueda avanzar.
 *
 * EL PROBLEMA. El stream de Gemini entrega su contenido y después no termina
 * nunca (no cierra la conexión HTTP). El SDK arranca el step siguiente, emite
 * `finish-step`, resuelve `usage` y dispara `onStepFinish`/`onFinish` desde el
 * `flush()` de sus TransformStreams internos — y un `flush()` solo corre cuando
 * el stream de arriba TERMINA. Resultado medido en prod: `step_count: 0`,
 * `onFinish` nunca dispara, y el `usage` (o sea el costo) queda en 0.
 *
 * POR QUÉ CERRAR Y NO ABORTAR. Los dos intentos anteriores (`chunkMs`,
 * `stepMs` del propio SDK) ABORTABAN, y un abort ERRORIZA la cadena — y un
 * `flush()` NO corre cuando el stream erroriza, solo cuando cierra normal. Por
 * eso fallaron. Verificado empíricamente contra el SDK real antes de escribir
 * esto, con un modelo falso que emite y nunca cierra:
 *
 *   | variante                   | onStepFinish | onFinish |
 *   |----------------------------|--------------|----------|
 *   | sin middleware (control)   | 0            | NUNCA    |
 *   | ABORT tras idle            | 0            | NUNCA    |
 *   | CLOSE (`terminate`) tras idle | 2         | 623ms    |
 *
 * EL COSTO SE RECUPERA (también verificado, no asumido). Cerrar con
 * `terminate()` NO pierde los chunks ya encolados: si el provider mandó su
 * chunk `finish`, el `usage` que llega a `onFinish` es **byte-idéntico** al de
 * un provider que cierra solo. Si el provider NO manda `finish`, el pipeline
 * igual se destraba (texto entregado, `onFinish` dispara) pero el usage queda
 * vacío y el costo en 0. Cuál de los dos casos es Gemini lo responde la
 * instrumentación de acá abajo, en producción: el chunk `finish` NO se pasa a
 * `onChunk`, así que el `chunks_total: 1` medido antes no lo descartaba.
 *
 * DOS VENTANAS, y por qué no hace falta suspender por tools (a diferencia del
 * watchdog del borde): cada step llama a `doStream()` de nuevo, así que cada
 * step recibe su PROPIA instancia de este transform, con su propia ventana
 * inicial. El arranque en frío por step queda cubierto por construcción. Y
 * durante la ejecución de un tool el stream del provider ya cumplió su turno
 * — cerrarlo ahí es exactamente lo que queremos.
 *
 * Módulo puro: sin dependencias nuevas, sin DB, sin red, sin `any`. Reenvía
 * cada chunk VERBATIM; solo lee `type` y (del chunk `finish`) los contadores de
 * tokens. Nunca toca ni loguea contenido.
 */

/** Por qué terminó el stream del provider. Solo `idle` significa que actuamos. */
export type ProviderStreamCloseReason =
  | 'idle' // se quedó mudo y lo cerramos nosotros
  | 'natural' // el provider cerró solo (lo esperable si algún día se arregla)
  | 'cancelled' // el consumidor de abajo canceló

/**
 * Reporte plano y listo para loguear. Solo tipos de chunk, contadores, tiempos
 * y números de tokens — NUNCA contenido de mensajes ni argumentos de tools.
 * El tipo (`string | number | boolean` por campo) es la barrera que lo impide.
 */
export type ProviderStreamCloseReport = Record<string, string | number | boolean>

export interface ProviderStreamCloseOptions {
  /** Silencio máximo tolerado ENTRE chunks, una vez que el stream arrancó. */
  idleMs: number
  /** Silencio máximo tolerado ANTES del primer chunk (cold start del provider). */
  initialIdleMs: number
  /**
   * Se invoca UNA vez, al resolverse el stream por cualquier camino. Es la
   * instrumentación que responde si Gemini manda o no su chunk `finish`.
   */
  onClose?: (report: ProviderStreamCloseReport) => void
}

/** `text-delta` → `chunk_text_delta`. Claves planas y seguras para el log. */
function reportKey(chunkType: string): string {
  return `chunk_${chunkType.replace(/[^a-zA-Z0-9]+/g, '_')}`
}

/**
 * El runtime (Node 24) SÍ invoca `transformer.cancel()`, pero la definición de
 * `Transformer` de la lib de TS instalada todavía no lo declara. Se extiende el
 * tipo en vez de castear — mismo criterio y mismo precedente que
 * `server/chat/streamWatchdog.ts`, donde ya se verificó empíricamente.
 */
interface CancelableTransformer<I, O> extends Transformer<I, O> {
  cancel?: (reason: unknown) => void | PromiseLike<void>
}

/**
 * Middleware de `wrapLanguageModel` que cierra el stream del provider tras un
 * silencio. Agnóstico del provider: no mira contenido ni conoce a Gemini.
 */
export function createProviderStreamCloseMiddleware({
  idleMs,
  initialIdleMs,
  onClose,
}: ProviderStreamCloseOptions): LanguageModelMiddleware {
  return {
    specificationVersion: 'v3',
    async wrapStream({ doStream }) {
      const { stream, ...rest } = await doStream()

      const startedAt = Date.now()
      const counts = new Map<string, number>()
      let totalChunks = 0
      let lastChunkAt = startedAt
      let hasFirstChunk = false
      /** Ya se reportó/resolvió: no se actúa ni se reporta dos veces. */
      let settled = false
      let sawFinishChunk = false
      let finishReasonSeen: string | null = null
      let finishInputTokens: number | null = null
      let finishOutputTokens: number | null = null
      let timer: ReturnType<typeof setTimeout> | undefined

      // Un timer huérfano mantiene viva la función serverless. Se limpia en
      // TODOS los caminos de salida.
      const clearTimer = (): void => {
        if (timer !== undefined) {
          clearTimeout(timer)
          timer = undefined
        }
      }

      const report = (reason: ProviderStreamCloseReason): void => {
        if (settled) return
        settled = true
        clearTimer()
        if (!onClose) return
        const now = Date.now()
        const out: ProviderStreamCloseReport = {
          reason,
          totalChunks,
          elapsedMs: now - startedAt,
          lastGapMs: now - lastChunkAt,
          // LA pregunta que este log existe para responder: ¿Gemini manda su
          // chunk `finish`? Si sí, el costo se recupera solo; si no, el
          // pipeline se destraba igual pero `usage` queda en 0.
          sawFinishChunk,
        }
        if (finishReasonSeen !== null) out.finishReason = finishReasonSeen
        if (finishInputTokens !== null) out.finishInputTokens = finishInputTokens
        if (finishOutputTokens !== null) out.finishOutputTokens = finishOutputTokens
        for (const [type, count] of counts) out[reportKey(type)] = count
        onClose(out)
      }

      const armTimer = (controller: TransformStreamDefaultController<LanguageModelV3StreamPart>): void => {
        clearTimer()
        timer = setTimeout(
          () => {
            report('idle')
            try {
              // CERRAR, jamás abortar. `terminate()` cierra el readable de
              // forma NORMAL, que es lo que hace correr los `flush()` del SDK
              // (ejecución de tools, `finish-step`, step siguiente, `onFinish`).
              // Un `controller.error(...)` acá reintroduciría exactamente el
              // bug que este módulo existe para arreglar.
              controller.terminate()
            } catch {
              // Ya estaba cerrado por otro camino. Nada que hacer.
            }
          },
          hasFirstChunk ? idleMs : initialIdleMs,
        )
      }

      // Variable tipada (no literal inline) para que `cancel` pase el chequeo
      // de propiedades excedentes sin recurrir a un cast.
      const transformer: CancelableTransformer<LanguageModelV3StreamPart, LanguageModelV3StreamPart> = {
        start(controller) {
          // El timer arranca al crear el stream, no con el primer chunk: si
          // el provider no manda NADA, igual hay que destrabar el pipeline.
          armTimer(controller)
        },
        transform(chunk, controller) {
          // Verbatim y primero. El contenido no se inspecciona ni se altera.
          controller.enqueue(chunk)

          totalChunks += 1
          counts.set(chunk.type, (counts.get(chunk.type) ?? 0) + 1)
          lastChunkAt = Date.now()
          hasFirstChunk = true

          if (chunk.type === 'finish') {
            // Solo contadores de tokens y el motivo — nunca contenido.
            sawFinishChunk = true
            finishReasonSeen = chunk.finishReason.unified
            finishInputTokens = chunk.usage.inputTokens.total ?? null
            finishOutputTokens = chunk.usage.outputTokens.total ?? null
          }

          armTimer(controller)
        },
        flush() {
          // El provider cerró solo: el camino sano. Nada que cerrar.
          report('natural')
        },
        cancel() {
          report('cancelled')
        },
      }

      return {
        ...rest,
        stream: stream.pipeThrough(
          new TransformStream<LanguageModelV3StreamPart, LanguageModelV3StreamPart>(transformer),
        ),
      }
    },
  }
}
