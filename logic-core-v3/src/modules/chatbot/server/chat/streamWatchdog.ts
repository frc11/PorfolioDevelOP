/**
 * WATCHDOG — Cierre del stream HTTP desde NUESTRO borde, sin depender de ningún
 * mecanismo interno del AI SDK.
 *
 * EL PROBLEMA (medido en prod, dos invocaciones idénticas): Gemini manda la
 * respuesta entera en UN chunk (`chunks_total: 1`) y después silencio absoluto.
 * No hay ruido ni keepalives. Con `chunkMs=5000` y `stepMs=12000` ya deployados,
 * los dos timers TUVIERON que vencer — y aun así no apareció `onAbort_enter` ni
 * `onFinish_enter`, y la función igual murió en el kill de 30s.
 *
 * POR QUÉ NINGÚN `timeout` DEL SDK PUEDE ARREGLARLO. Todas las variantes
 * (`chunkMs`, `stepMs`, `totalMs`) desembocan en el mismo `mergeAbortSignals`, y
 * ese camino no cierra el stream por dos eslabones independientes:
 *   1. El chequeo de abort corre DESPUÉS de un `read()` ya bloqueado
 *      (`ai/dist/index.js:7374-7382`): abortar la señal no despierta un `read()`
 *      que espera un chunk que no va a llegar, así que el chequeo nunca corre.
 *   2. `self.closeStream()` vive en un `flush()`, y el `flush` de un
 *      `TransformStream` NO corre cuando el stream erroriza — solo cuando cierra
 *      normal. El abort errioriza la cadena, o sea que rompe el stream por un
 *      camino que impide que se cierre.
 *
 * LA SALIDA: dejar de pedirle al SDK que se cierre a sí mismo. Este transform va
 * en el borde de la respuesta (el body que devolvemos), deja pasar cada chunk
 * verbatim, y si pasa `idleMs` sin actividad **cierra el readable nosotros**. El
 * cliente ve `done`, `useChat` pasa a `ready`, el input se destraba. Cero
 * dependencia de `abortSignal` y de que corra ningún `flush` del SDK.
 *
 * BENEFICIO SECUNDARIO, Y NO MENOR: como esto corre en código nuestro, la
 * persistencia se puede **esperar** antes de cerrar. Mientras el body siga
 * abierto la respuesta no terminó, así que la función sigue viva: `onIdle` deja
 * de ser una carrera contra el freeze (que es lo que sí era desde `onAbort`,
 * donde el SDK ya había llamado a `controller.close()`).
 *
 * Verificado empíricamente en este runtime (Node 24) antes de escribirlo:
 * `terminate()` deja al consumidor con un `done: true` limpio (sin error), el
 * transformer soporta `cancel`, y el `pipeThrough` no deja unhandled rejections
 * al terminar (la spec marca su promesa como handled).
 *
 * Módulo puro: sin dependencias nuevas, sin DB, sin red, sin `any`. Nunca
 * inspecciona ni transforma el contenido de un chunk.
 *
 * WATCHDOG-2 — dos ventanas + suspensión externa.
 *
 * **Dos ventanas.** El watchdog original usaba un único `idleMs` desde la
 * creación del stream. Pero el gap real hasta el PRIMER chunk (cold start de
 * Vertex/Gemini) es mucho más largo que el silencio tolerable UNA VEZ que la
 * respuesta ya empezó a fluir — medido en prod: 1470ms y 1664ms hasta el primer
 * chunk. Con un solo `idleMs` corto, el watchdog cortaría la respuesta ANTES de
 * que llegue el texto. `initialIdleMs` cubre la espera inicial (generosa);
 * `idleMs` aplica desde el primer chunk en adelante (ajustado, es lo que baja
 * la latencia de cierre real).
 *
 * **Suspensión externa (`suspend`/`resume`).** Mientras un tool ejecuta
 * `execute()` server-side, no fluye NINGÚN chunk por este borde — el SDK recién
 * vuelve a emitir algo cuando el tool termina. Sin una forma de pausar, el
 * watchdog cortaría la respuesta A MITAD de `capture_lead` (Neon fría: 6-7s
 * medidos), justo el momento comercialmente más valioso del producto. Por eso
 * `createStreamWatchdog` devuelve un CONTROLLER (`{ stream, suspend, resume }`)
 * en vez de directamente el `TransformStream`.
 *
 * Este módulo NO sabe nada de "tools": `suspend()`/`resume()` son un toggle
 * genérico e idempotente (llamarlos de más no rompe nada — desarman/rearman el
 * timer, nada más). La lógica de CONTEO (varios tools en paralelo, resumir solo
 * cuando el último termina) es responsabilidad del LLAMADOR — ver
 * `handleChatRequest.ts`, donde vive el contador real.
 */

/** Por qué se resolvió el watchdog. Solo `idle` significa que actuó. */
export type StreamWatchdogReason =
  | 'idle' // venció el silencio: cerramos nosotros
  | 'closed' // el upstream cerró normal (camino sano) — el timer se limpia
  | 'cancelled' // el consumidor (cliente) cortó la conexión

export interface StreamWatchdogEvent {
  reason: StreamWatchdogReason
  /** Chunks que pasaron por el borde. NUNCA su contenido. */
  chunks: number
  /** Desde que se creó el watchdog (≈ desde que se devolvió la respuesta). */
  elapsedMs: number
  /** Silencio acumulado hasta este evento. */
  lastGapMs: number
}

export interface StreamWatchdogOptions {
  /** Silencio máximo tolerado UNA VEZ que empezó a fluir el primer chunk. */
  idleMs: number
  /**
   * Silencio máximo tolerado ANTES del primer chunk (cold start del provider).
   * Casi siempre más largo que `idleMs`. Default: `idleMs` (mismo
   * comportamiento que la versión de una sola ventana, para no romper otros
   * callers si alguna vez aparecen).
   */
  initialIdleMs?: number
  /**
   * Se ESPERA antes de cerrar el readable. Acá va la persistencia del turno.
   * Si rechaza, se traga y el stream cierra igual: cerrar nunca puede quedar
   * condicionado a que la DB responda (lección de ONF-2).
   */
  onIdle: () => Promise<void>
  /** Telemetría a stderr. Recibe contadores y tiempos, jamás contenido. */
  onEvent?: (info: StreamWatchdogEvent) => void
}

/**
 * Lo que devuelve `createStreamWatchdog`: el stream a pipear, más los dos
 * controles externos de suspensión. `suspend`/`resume` son idempotentes — se
 * pueden llamar de más sin efecto adicional (ver el encabezado del archivo).
 */
export interface StreamWatchdogController {
  stream: TransformStream<Uint8Array, Uint8Array>
  /** Desarma el timer. Ningún chunk lo re-arma mientras esté suspendido. */
  suspend(): void
  /** Re-arma el timer con la ventana post-primer-chunk (`idleMs`). */
  resume(): void
}

/**
 * El runtime (Node 24) SÍ invoca `transformer.cancel()` cuando el consumidor
 * cancela el readable — verificado empíricamente antes de escribir este módulo.
 * La definición de `Transformer` de la lib de TS instalada todavía no lo
 * declara, así que se extiende acá. Se prefiere extender el tipo antes que
 * castear: queda honesto y sin `any` ni `as unknown as`.
 */
interface CancelableTransformer<I, O> extends Transformer<I, O> {
  cancel?: (reason: unknown) => void | PromiseLike<void>
}

/**
 * Transform que deja pasar bytes verbatim y cierra el readable si el upstream
 * se queda mudo más de `idleMs` (o `initialIdleMs` antes del primer chunk).
 * Suspendible desde afuera con `suspend()`/`resume()`.
 */
export function createStreamWatchdog({
  idleMs,
  initialIdleMs = idleMs,
  onIdle,
  onEvent,
}: StreamWatchdogOptions): StreamWatchdogController {
  const startedAt = Date.now()
  let chunks = 0
  let lastChunkAt = startedAt
  /** El watchdog ya se resolvió por algún camino: no vuelve a actuar. */
  let settled = false
  /** `false` = todavía no llegó ningún chunk → usar `initialIdleMs`. */
  let hasFirstChunk = false
  /** Suspendido por el llamador (tool en vuelo): ningún timer se arma. */
  let suspended = false
  let timer: ReturnType<typeof setTimeout> | undefined
  /**
   * Capturado en `start()`. `resume()` lo necesita para poder re-armar el
   * timer sin depender de que un `transform()` lo llame — `resume()` se invoca
   * desde AFUERA (cuando termina un tool), no desde dentro del transform.
   */
  let activeController: TransformStreamDefaultController<Uint8Array> | undefined

  // Un timer huérfano mantiene viva la función serverless. Se limpia en TODOS
  // los caminos de salida (idle, cierre normal, cancelación del cliente).
  const clearTimer = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  const emit = (reason: StreamWatchdogReason): void => {
    const now = Date.now()
    onEvent?.({
      reason,
      chunks,
      elapsedMs: now - startedAt,
      lastGapMs: now - lastChunkAt,
    })
  }

  /** Cierra por silencio. Solo se llega acá desde el timer. */
  const fireIdle = async (
    controller: TransformStreamDefaultController<Uint8Array>,
  ): Promise<void> => {
    // Guard SINCRÓNICO, antes de cualquier await: si el upstream cierra o el
    // cliente corta mientras persistimos, no se dispara dos veces.
    if (settled) return
    settled = true
    clearTimer()
    // Se emite ANTES de esperar la persistencia: si `onIdle` se colgara, esta
    // línea ya salió y el log dice qué pasó. Es la lección de los sprints
    // previos — el rastro nunca puede depender del recurso que está fallando.
    emit('idle')
    try {
      // Esperado a propósito: mientras el readable siga abierto la respuesta no
      // terminó y la función sigue viva. Acá es donde la persistencia deja de
      // ser best-effort. `onIdle` trae su propio techo de tiempo (el
      // presupuesto de ONF-2), así que esta espera está acotada.
      await onIdle()
    } catch {
      // Tragado a propósito: el cierre del stream NO puede quedar condicionado
      // a que la DB responda. Quien pasa `onIdle` es responsable de su propio
      // rastro de error (persistTurn ya loguea a stderr).
    }
    try {
      // Cierra el readable (el cliente ve `done`) y erroriza el writable, que
      // es lo que corta el productor colgado upstream.
      controller.terminate()
    } catch {
      // El stream ya estaba cerrado por otro camino. Nada que hacer.
    }
  }

  /**
   * Re-arma el timer con la ventana que corresponda. NO-OP mientras
   * `suspended` — es lo que hace que un tool en vuelo no corte la respuesta:
   * el chunk (si llega alguno) igual se enqueuea, pero el timer no se toca.
   */
  const armTimer = (controller: TransformStreamDefaultController<Uint8Array>): void => {
    clearTimer()
    if (suspended) return
    timer = setTimeout(() => {
      // `fireIdle` atrapa todo internamente, así que esta promesa nunca rechaza.
      void fireIdle(controller)
    }, hasFirstChunk ? idleMs : initialIdleMs)
  }

  // Se declara como variable tipada (no como literal inline) para que
  // `cancel` —que el runtime soporta pero la lib de TS no declara— pase el
  // chequeo de propiedades excedentes sin recurrir a un cast.
  const transformer: CancelableTransformer<Uint8Array, Uint8Array> = {
    start(controller) {
      activeController = controller
      // El timer se arma AL CREAR, no con el primer chunk. Es la diferencia
      // clave con el `chunkMs` del SDK: si no llega NADA, igual cerramos.
      armTimer(controller)
    },

    transform(chunk, controller) {
      // Verbatim y primero: el contenido no se inspecciona ni se transforma.
      controller.enqueue(chunk)
      chunks += 1
      lastChunkAt = Date.now()
      hasFirstChunk = true
      // Si ya estamos comprometidos a cerrar (persistiendo), no re-armamos: el
      // chunk sale igual, pero la decisión de cerrar no se revierte. La carrera
      // es remotísima (el stream lleva `idleMs` mudo) y preferimos un cierre
      // determinista a un watchdog que se pueda posponer indefinidamente.
      if (settled) return
      armTimer(controller)
    },

    flush() {
      // Camino sano: el upstream cerró solo. Matar el timer para no cerrar (ni
      // persistir) sobre un stream que ya terminó.
      if (!settled) {
        settled = true
        emit('closed')
      }
      clearTimer()
    },

    cancel() {
      // El consumidor cortó (cliente que cierra la pestaña / aborta el fetch).
      // NO se llama a `onIdle`: no hay nadie esperando la respuesta.
      if (!settled) {
        settled = true
        emit('cancelled')
      }
      clearTimer()
    },
  }

  return {
    stream: new TransformStream<Uint8Array, Uint8Array>(transformer),
    suspend() {
      // Idempotente: si ya está suspendido (o el stream ya se resolvió), no
      // hace nada extra. El llamador puede llamarlo de más sin riesgo.
      if (settled) return
      suspended = true
      clearTimer()
    },
    resume() {
      if (settled || !activeController) return
      suspended = false
      // SIEMPRE la ventana post-primer-chunk: reanudar pasa a mitad del
      // stream, nunca durante la espera inicial del modelo.
      hasFirstChunk = true
      armTimer(activeController)
    },
  }
}
