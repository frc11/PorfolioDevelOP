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
 *
 * WATCHDOG-3 — la ventana inicial es POR STEP, no por stream.
 *
 * EL BUG que esto arregla: verificado en prod, dos veces. El visitante da sus
 * datos, `capture_lead` corre bien (el lead queda en la tabla), pero **el bot
 * nunca responde nada** — ni texto, ni error. Causa: cuando un tool termina, el
 * SDK arranca un STEP NUEVO (manda el resultado del tool de vuelta al modelo y
 * espera el texto final) — y ese step es una llamada NUEVA al provider, con su
 * propio arranque en frío. WATCHDOG-2 asumía que "reanudar pasa a mitad del
 * stream" y por eso `resume()` forzaba la ventana CORTA (`idleMs`) — correcto
 * si el tool call y el texto final compartieran step, pero **el arranque en
 * frío no es una propiedad del stream, es de cada step**. Con la ventana corta,
 * el watchdog cortaba antes de que llegara el primer token del step 2 (gaps
 * medidos de 1470-1664ms > `idleMs`=1200ms).
 *
 * LA SALIDA: `beginStep()`, cableado a `experimental_onStepStart` de
 * `streamText` (confirmado que corre ANTES de que el provider sea invocado
 * para ese step — `ai/dist/index.js:7661-7685`, antes de `doStream` en
 * `:7690-7746`). Resetea el estado a "esperando el primer chunk DE ESTE STEP" y
 * rearma con `initialIdleMs`. `resume()` YA NO fuerza `hasFirstChunk = true`:
 * ahora es `beginStep()` —no la suposición de `resume()`— quien decide qué
 * ventana corresponde. El orden real (confirmado en el SDK): el tool termina
 * y `resume()` corre DENTRO del mismo step que lo llamó, ANTES de que el
 * siguiente step arranque; `beginStep()` llega un instante después y
 * sobreescribe con la ventana correcta — pero el diseño no depende de ese
 * orden: si por algún motivo `beginStep()` corriera primero mientras el
 * watchdog sigue suspendido, `armTimer` ya no arma nada (ver su guard), y
 * cuando `resume()` llegue después va a usar el `hasFirstChunk` que
 * `beginStep()` dejó en `false` — mismo resultado, sin importar el orden.
 *
 * WATCHDOG-4 — la ventana la decide el CONTENIDO, no los bytes.
 *
 * EL BUG: este transform opera sobre bytes (`Uint8Array`), y el SDK encola un
 * frame `start` apenas se crea el stream (`ai/dist/index.js:7359`), que
 * `toUIMessageStream` traduce a un frame SSE inmediato (`:8534-8542`) — **antes
 * de que el modelo haya generado nada**. La versión anterior tomaba ese byte
 * como "ya llegó el primer chunk" y se pasaba a la ventana CORTA. Después
 * Vertex tardaba en el primer token y el watchdog mataba una respuesta que el
 * modelo estaba generando bien.
 *
 * Medido en prod, en un turno que se cortó: `chunks: 1` con
 * `assistantTextLength: 0` al disparar a los 3005ms — el único chunk que había
 * pasado era el `start`. El modelo terminó igual, natural, con 351 tokens de
 * salida y `finishReason: "stop"`... 5 segundos después de que lo cortáramos. Y
 * el turno "sano" de la misma sesión tenía `gapMs: 2969` contra una ventana de
 * 3000: **zafó por 31ms**. No era un bug de un camino puntual, era una moneda
 * al aire en CADA turno.
 *
 * LA SEPARACIÓN QUE INTRODUCE: hoy los bytes hacían dos cosas a la vez.
 *   - RESETEAR EL TIMER  ← lo siguen haciendo (cualquier byte cuenta como
 *     actividad del transporte, y eso está bien);
 *   - ELEGIR LA VENTANA  ← ya NO. Eso ahora lo decide `markContent()`, que el
 *     llamador invoca desde el `onChunk` de `streamText`.
 *
 * Por qué `onChunk` es el discriminador correcto: el SDK lo invoca ÚNICAMENTE
 * para chunks reales del modelo — `text-delta`, `reasoning-delta`, `source`,
 * `tool-call`, `tool-result`, `tool-input-*`, `raw` (`ai/dist/index.js:7105`) —
 * y NUNCA para `start`, `start-step`, `finish-step` ni `finish`. Es la única
 * señal disponible que distingue "empezó a fluir el transporte" de "empezó a
 * responder el modelo".
 */

/** Por qué se resolvió el watchdog. Solo `idle` significa que actuó. */
export type StreamWatchdogReason =
  | 'idle' // venció el silencio: cerramos nosotros
  | 'closed' // el upstream cerró normal (camino sano) — el timer se limpia
  | 'cancelled' // el consumidor (cliente) cortó la conexión

/**
 * WATCHDOG-4 — Qué ventana estaba activa. `initial` = todavía esperando el
 * primer contenido REAL del modelo (ventana larga, cold start). `content` = ya
 * llegó contenido y aplica la ventana corta.
 */
export type StreamWatchdogWindow = 'initial' | 'content'

export interface StreamWatchdogEvent {
  reason: StreamWatchdogReason
  /**
   * Chunks de BYTES que pasaron por el borde. Incluye frames estructurales del
   * SDK (`start`, `finish-step`…), así que NO implica contenido del modelo.
   * NUNCA su contenido.
   */
  chunks: number
  /**
   * WATCHDOG-4 — Chunks de CONTENIDO real del modelo (los que el SDK pasa a
   * `onChunk`), acumulados en todo el stream. Es el contador que distingue
   * "el transporte arrancó" de "el modelo respondió": un disparo con
   * `window: 'content'` y `contentChunks: 0` sería una contradicción evidente.
   */
  contentChunks: number
  /** WATCHDOG-4 — Ventana activa al momento del evento. */
  window: StreamWatchdogWindow
  /** Desde que se creó el watchdog (≈ desde que se devolvió la respuesta). */
  elapsedMs: number
  /** Silencio acumulado hasta este evento. */
  lastGapMs: number
}

export interface StreamWatchdogOptions {
  /**
   * Silencio máximo tolerado una vez que llegó CONTENIDO real del modelo
   * (o sea, tras el primer `markContent()`) — no desde el primer byte.
   */
  idleMs: number
  /**
   * Silencio máximo tolerado ANTES del primer contenido real del modelo (cold
   * start del provider). Casi siempre más largo que `idleMs`. Default: `idleMs`
   * (mismo comportamiento que la versión de una sola ventana, para no romper
   * otros callers si alguna vez aparecen).
   */
  initialIdleMs?: number
  /**
   * Se ESPERA antes de cerrar el readable. Acá va la persistencia del turno.
   * Si rechaza, se traga y el stream cierra igual: cerrar nunca puede quedar
   * condicionado a que la DB responda (lección de ONF-2).
   *
   * MUDEZ (commit 2) — puede devolver bytes (frames SSE ya codificados, ver
   * silenceFrames.ts): se encolan al readable INMEDIATAMENTE antes del
   * `terminate()`, sin ningún await entre medio (condición del premortem: un
   * await ahí abre la ventana para que un provider revivido meta texto real
   * DESPUÉS del canned). Devolver `void`/`null` = cerrar sin hablar.
   */
  onIdle: () => Promise<Uint8Array | null | void>
  /**
   * MUDEZ (commit 2) — la red del CIERRE LIMPIO. El SDK puede cerrar el body
   * normal y rápido con cero texto (un part de error tipo NoOutputGeneratedError
   * cierra vía closeStream: sin silencio no hay idle, y sin chunk `finish` el
   * fallback del transform no inyecta). Se invoca en `flush()` — upstream cerró
   * solo, todavía podemos encolar — y sus bytes salen antes del cierre. La
   * decisión de si hay que hablar (¿hubo texto? ¿el fallback ya habló?) es del
   * llamador; devolver `null`/`void` = cierre normal mudo a propósito.
   * NUNCA se invoca en `cancel()`: si el cliente se fue, no hay a quién hablarle.
   */
  onSilentClose?: () => Promise<Uint8Array | null | void>
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
  /**
   * Re-arma el timer. Usa la ventana que corresponda según el estado ACTUAL —
   * ya no lo asume (fue el bug de WATCHDOG-3). Quienes controlan ese estado son
   * `beginStep()` y `markContent()`; `resume()` solo re-arma con lo que haya.
   */
  resume(): void
  /**
   * WATCHDOG-3 — Llamar al ARRANCAR CADA STEP (cableado a
   * `experimental_onStepStart`), incluido el primero. Resetea el watchdog al
   * estado "esperando contenido" y rearma con `initialIdleMs` — el arranque en
   * frío del provider es una propiedad de CADA step, no del stream completo.
   * No-op mientras esté suspendido (no pisa una suspensión activa) y es
   * idempotente: llamarlo dos veces seguidas no duplica timers.
   */
  beginStep(): void
  /**
   * WATCHDOG-4 — Llamar cuando llega CONTENIDO REAL del modelo (cableado al
   * `onChunk` de `streamText`, que el SDK invoca solo para chunks del modelo y
   * nunca para frames estructurales — ver el encabezado del archivo). Pasa a la
   * ventana corta `idleMs`.
   *
   * Los BYTES ya no eligen la ventana: el frame `start` del SDK llega antes de
   * que el modelo genere nada, y tomarlo como "primer chunk" cortaba respuestas
   * sanas. Esta es la única señal que distingue transporte de contenido.
   *
   * Idempotente y barata: se invoca por cada chunk, pero después del primero
   * solo incrementa el contador de telemetría.
   */
  markContent(): void
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
  onSilentClose,
  onEvent,
}: StreamWatchdogOptions): StreamWatchdogController {
  const startedAt = Date.now()
  let chunks = 0
  let lastChunkAt = startedAt
  /** El watchdog ya se resolvió por algún camino: no vuelve a actuar. */
  let settled = false
  /**
   * WATCHDOG-4 — `false` = todavía no llegó CONTENIDO real del modelo en este
   * step → aplica `initialIdleMs`. Lo levanta SOLO `markContent()`; los bytes
   * que pasan por el transform ya NO lo tocan (el frame `start` del SDK es un
   * byte que no es contenido, y tomarlo como tal cortaba respuestas sanas).
   * Es POR STEP: `beginStep()` lo vuelve a `false`.
   */
  let hasContent = false
  /** WATCHDOG-4 — Chunks de contenido real, acumulados. Solo telemetría. */
  let contentChunks = 0
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
      contentChunks,
      window: hasContent ? 'content' : 'initial',
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
    // MUDEZ (commit 2) — si `onIdle` devuelve frames (la derivación canned ya
    // persistida), se encolan justo antes del terminate.
    let silenceFrames: Uint8Array | null = null
    try {
      // Esperado a propósito: mientras el readable siga abierto la respuesta no
      // terminó y la función sigue viva. Acá es donde la persistencia deja de
      // ser best-effort. `onIdle` trae su propio techo de tiempo (el
      // presupuesto de ONF-2), así que esta espera está acotada.
      const returned = await onIdle()
      if (returned instanceof Uint8Array) silenceFrames = returned
    } catch {
      // Tragado a propósito: el cierre del stream NO puede quedar condicionado
      // a que la DB responda. Quien pasa `onIdle` es responsable de su propio
      // rastro de error (persistTurn ya loguea a stderr).
    }
    try {
      // Enqueue y terminate en la MISMA tarea, sin await entre medio: un await
      // acá abriría la ventana para que un provider revivido intercale texto
      // real después del canned (condición del premortem del bloque MUDEZ).
      if (silenceFrames !== null) controller.enqueue(silenceFrames)
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
    }, hasContent ? idleMs : initialIdleMs)
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
      // MUDEZ (commit 2) — DESCARTE post-settled. `fireIdle` marca `settled`
      // sincrónicamente y después ESPERA la persistencia (hasta 5s de
      // presupuesto): en esa ventana un provider revivido puede empujar chunks.
      // Antes se encolaban igual (el guard solo evitaba re-armar el timer) y el
      // visitante veía texto DESPUÉS de decidida la persistencia — con la red
      // que habla, eso sería canned + texto real duplicado. Decidido el cierre,
      // lo que llegue tarde se descarta.
      if (settled) return
      // Verbatim y primero: el contenido no se inspecciona ni se transforma.
      controller.enqueue(chunk)
      chunks += 1
      lastChunkAt = Date.now()
      // WATCHDOG-4 — Un byte cuenta como ACTIVIDAD (resetea el timer) pero NO
      // elige la ventana. El frame `start` del SDK llega antes de que el modelo
      // genere nada; tomarlo como "ya hay contenido" pasaba a la ventana corta
      // y mataba respuestas sanas. La ventana la decide `markContent()`.
      armTimer(controller)
    },

    async flush(controller) {
      // Camino sano: el upstream cerró solo. Matar el timer para no cerrar (ni
      // persistir) sobre un stream que ya terminó.
      if (!settled) {
        settled = true
        clearTimer()
        // MUDEZ (commit 2) — la red del CIERRE LIMPIO: el SDK puede cerrar
        // normal con cero texto (part de error → closeStream: sin silencio no
        // hay idle, sin `finish` el fallback no inyecta). El llamador decide si
        // hay que hablar; sus bytes salen antes de completar el cierre. El
        // enqueue en flush es legal: se entrega antes del close del readable.
        if (onSilentClose) {
          try {
            const returned = await onSilentClose()
            if (returned instanceof Uint8Array) controller.enqueue(returned)
          } catch {
            // Tragado: el cierre no puede quedar condicionado a la DB (misma
            // regla que onIdle).
          }
        }
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
      // WATCHDOG-3 — NO toca el estado de ventana. Esa suposición ("reanudar
      // pasa a mitad del stream", que forzaba la ventana corta) fue el bug de
      // aquel sprint: cuando un tool termina, lo que sigue casi siempre es un
      // STEP NUEVO con su propio arranque en frío. Quienes deciden la ventana
      // son `beginStep()` y `markContent()`; acá solo se re-arma con lo que haya.
      armTimer(activeController)
    },
    beginStep() {
      if (settled || !activeController) return
      // Vuelve al estado "esperando CONTENIDO de este step" → ventana larga. Si
      // el watchdog sigue suspendido (no debería, en el orden real, pero es
      // defensivo ante cualquier orden), `armTimer` no arma nada — respeta la
      // suspensión — y este `false` queda listo para cuando `resume()` corra.
      hasContent = false
      armTimer(activeController)
    },
    markContent() {
      if (settled) return
      // El contador es telemetría pura y cuenta TODAS las llamadas.
      contentChunks += 1
      // El cambio de ventana ocurre una sola vez por step: a partir del segundo
      // chunk esto es un no-op barato (se invoca por cada chunk del modelo).
      if (hasContent) return
      hasContent = true
      // Re-armar con la ventana corta ya. No depende del orden respecto de los
      // bytes: `onChunk` corre aguas arriba del borde, así que normalmente esto
      // llega antes que el byte correspondiente — y si llegara después, el
      // `armTimer` del transform ya habría usado la ventana correcta igual.
      if (activeController) armTimer(activeController)
    },
  }
}
