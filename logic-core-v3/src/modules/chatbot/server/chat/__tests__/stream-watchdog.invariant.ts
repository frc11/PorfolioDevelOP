/**
 * WATCHDOG — Invariantes del cierre del stream desde nuestro borde. Corre SIN
 * DB, SIN red y SIN server:
 *
 *   npm run test:watchdog
 *   (o: npx tsx src/modules/chatbot/server/chat/__tests__/stream-watchdog.invariant.ts)
 *
 * Lo que se pinnea, y por qué cada uno importa:
 *   1. Chunks fluyendo → no dispara, y salen VERBATIM y en orden (el watchdog
 *      no puede alterar ni un byte de la respuesta del bot).
 *   2. Silencio > idleMs → dispara, ESPERA `onIdle` antes de cerrar (es lo que
 *      hace que la persistencia deje de ser best-effort) y el consumidor ve
 *      `done` limpio, que es lo que destraba el input del widget.
 *   3. CERO chunks nunca → dispara igual. El timer se arma al crear, no con el
 *      primer chunk: es la diferencia con el `chunkMs` del SDK.
 *   4. Cierre normal antes del timeout → el timer se limpia y `onIdle` NO corre
 *      (no persistir sobre un turno que ya se persistió por el camino sano).
 *   5. `onIdle` que rechaza → el stream cierra IGUAL. Cerrar nunca puede quedar
 *      condicionado a que la DB responda (lección de ONF-2).
 *   6. `onIdle` no se llama dos veces.
 *   7. Cancelación del consumidor → timer limpio y sin `onIdle`.
 *   8. CERO unhandled rejections en todos los casos — un rechazo suelto mata el
 *      proceso en Node con `--unhandled-rejections=throw` (el mismo detalle que
 *      hizo falta en `withDeadline`).
 *
 * WATCHDOG-2 — dos ventanas + suspensión externa:
 *   9.  Primer chunk que tarda más que `idleMs` pero menos que `initialIdleMs`
 *       → NO dispara (la ventana inicial, más generosa, es la que corre).
 *   10. Nunca llega ningún chunk → dispara a `initialIdleMs`, no a `idleMs`.
 *   11. Después del primer chunk, silencio > `idleMs` → dispara (con la
 *       ventana corta, no la larga inicial — confirma el SWITCH de ventana).
 *   12. `suspend()` bloquea el disparo aunque pase largamente `idleMs`, y
 *       `resume()` lo reactiva.
 *   13. Contador de 2 tools solapados: NO dispara mientras el contador > 0
 *       (el caso que un booleano rompería — el primer tool que termina no
 *       puede reanudar si el segundo sigue en vuelo).
 *   14. El contador SÍ llega a 0 → se reanuda y dispara con `idleMs`.
 *   15. Tool "colgado" (nunca termina) → el techo de seguridad fuerza el
 *       resume igual, y el watchdog cierra — un tool colgado no puede
 *       reintroducir el cuelgue de 30s.
 *
 * WATCHDOG-3 — la ventana inicial es POR STEP, no por stream. Reproduce el bug
 * verificado en prod: el lead se guardaba (el tool corría bien) pero el bot
 * nunca respondía nada, porque tras el tool el modelo arranca un STEP NUEVO
 * (su propio arranque en frío) y `resume()` dejaba la ventana CORTA activa
 * justo ahí:
 *   16. El caso del bug, reproducido exacto: chunk de texto fluye → tool
 *       suspende → tool termina (`resume()`) → arranca el step 2
 *       (`beginStep()`) → un silencio entre `idleMs` e `initialIdleMs` (el
 *       cold start del step 2) → NO dispara, y el chunk del step 2 llega bien.
 *   17. Orden INVERTIDO (`beginStep()` antes que `resume()`, con el watchdog
 *       todavía suspendido): no pisa la suspensión, y al reanudar usa la
 *       ventana LARGA de todos modos — el fix no depende de qué callback del
 *       SDK llegue primero.
 *   18. `beginStep()` llamado varias veces seguidas → un solo timer vivo.
 *   19. El step 2 nunca manda ningún chunk → dispara a `initialIdleMs`, no se
 *       queda esperando `idleMs` (que en este caso sería mucho más largo).
 *
 * WATCHDOG-4 — la ventana la decide el CONTENIDO, no los bytes:
 *   20. EL CASO DEL BUG: pasa un byte que NO es contenido (el frame `start` del
 *       SDK), después un silencio entre `idleMs` e `initialIdleMs` (el cold
 *       start de Vertex) → NO dispara, y la respuesta llega completa. Con la
 *       semántica vieja el watchdog la mataba.
 *   21. Bytes fluyendo sin `markContent()` jamás → dispara recién a
 *       `initialIdleMs`, y el evento sale con `window:'initial'` y
 *       `contentChunks: 0` — la telemetría que hace obvio el diagnóstico.
 *   22. `markContent()` es idempotente: N llamadas dejan UN timer y un solo
 *       cambio de ventana, pero el contador sí cuenta las N.
 *   23. `beginStep()` vuelve a la ventana larga aunque el step previo hubiera
 *       tenido contenido (multi-step: el step 2 arranca en frío).
 *   24 y 25. `suspend()`/`resume()` NO pisan el estado de ventana, en ambas
 *       direcciones (regresión de WATCHDOG-3, ahora sobre el flag nuevo).
 */
import assert from 'node:assert/strict'
import { createStreamWatchdog } from '../streamWatchdog.ts'

const unhandled: string[] = []
process.on('unhandledRejection', (reason: unknown) => {
  unhandled.push(String(reason))
})

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))
const enc = new TextEncoder()
const dec = new TextDecoder()

/** Cuántos timers hay vivos ahora. Tipado en @types/node — cero `any`. */
const liveTimers = (): number =>
  process.getActiveResourcesInfo().filter((r) => r === 'Timeout').length

/**
 * Fuente que emite `chunks` con `gapMs` entre cada uno y después queda MUDA
 * para siempre (o cierra, si `closeAtEnd`). Reproduce el patrón real de Gemini:
 * la respuesta entera en un chunk y silencio.
 */
function makeSource(
  chunks: readonly string[],
  gapMs: number,
  closeAtEnd: boolean,
): ReadableStream<Uint8Array> {
  let i = 0
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (i < chunks.length) {
        await sleep(gapMs)
        controller.enqueue(enc.encode(chunks[i]))
        i += 1
        return
      }
      if (closeAtEnd) {
        controller.close()
        return
      }
      // Mudo para siempre: nunca resuelve. Es el caso patológico real.
      await new Promise<void>(() => {})
    },
  })
}

/** Fuente que nunca emite y nunca cierra — para las pruebas de suspensión. */
function makeSilentSource(): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    pull() {
      return new Promise<void>(() => {})
    },
  })
}

/**
 * Fuente pilotada a mano: el test decide EXACTAMENTE cuándo llega cada chunk,
 * para poder intercalar `suspend()`/`resume()`/`beginStep()` en los instantes
 * precisos que reproducen el orden real del SDK (tool termina → `resume()` →
 * un instante después, el step siguiente arranca → `beginStep()`).
 */
function makeControllableSource(): {
  stream: ReadableStream<Uint8Array>
  push: (text: string) => void
  close: () => void
} {
  let ctrl: ReadableStreamDefaultController<Uint8Array> | undefined
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      ctrl = controller
    },
  })
  return {
    stream,
    push: (text) => ctrl?.enqueue(enc.encode(text)),
    close: () => ctrl?.close(),
  }
}

/** Drena el readable y devuelve el texto concatenado + si vio `done` limpio. */
async function drain(
  stream: ReadableStream<Uint8Array>,
): Promise<{ text: string; sawDone: boolean; error: string | null }> {
  const reader = stream.getReader()
  let text = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) return { text, sawDone: true, error: null }
      if (value) text += dec.decode(value)
    }
  } catch (error) {
    return { text, sawDone: false, error: error instanceof Error ? error.message : String(error) }
  }
}

async function main(): Promise<void> {
// ── 1. Chunks fluyendo: no dispara y pasan verbatim y en orden ───────────────
{
  const parts = ['data: {"a":1}\n\n', 'data: {"b":2}\n\n', 'data: {"c":3}\n\n']
  let idleCalls = 0
  const wd = createStreamWatchdog({
    idleMs: 500,
    onIdle: async () => {
      idleCalls += 1
    },
  })
  const { text, sawDone, error } = await drain(makeSource(parts, 20, true).pipeThrough(wd.stream))
  assert.equal(error, null, 'el camino sano no erroriza')
  assert.equal(sawDone, true)
  assert.equal(idleCalls, 0, 'con chunks fluyendo el watchdog no dispara')
  assert.equal(text, parts.join(''), 'los bytes salen VERBATIM y en orden')
}

// ── 2. Silencio > idleMs: dispara, ESPERA onIdle, y cierra limpio ────────────
{
  const order: string[] = []
  let idleResolved = false
  const wd = createStreamWatchdog({
    idleMs: 60,
    onIdle: async () => {
      order.push('onIdle:start')
      await sleep(120) // persistencia lenta a propósito
      idleResolved = true
      order.push('onIdle:end')
    },
    onEvent: (info) => order.push(`event:${info.reason}:chunks=${info.chunks}`),
  })
  const startedAt = Date.now()
  const { text, sawDone, error } = await drain(
    makeSource(['data: hola\n\n'], 10, false).pipeThrough(wd.stream),
  )
  const elapsed = Date.now() - startedAt

  assert.equal(error, null, 'el consumidor NO ve un error: ve un cierre limpio')
  assert.equal(sawDone, true, 'el consumidor llega a `done` — esto es lo que destraba el input')
  assert.equal(text, 'data: hola\n\n', 'el chunk que sí llegó salió igual')
  assert.equal(idleResolved, true, 'onIdle se ESPERO antes de cerrar')
  assert.deepEqual(
    order,
    ['event:idle:chunks=1', 'onIdle:start', 'onIdle:end'],
    'el evento sale ANTES de esperar la persistencia (si onIdle se colgara, el log ya salió)',
  )
  assert.ok(
    elapsed >= 60 + 120,
    `el cierre esperó el idle + la persistencia completa (fue ${elapsed}ms)`,
  )
}

// ── 3. Cero chunks NUNCA: dispara igual ──────────────────────────────────────
// El timer se arma al CREAR el stream. Es la diferencia clave con el `chunkMs`
// del SDK, que se arma recién con el primer chunk del provider.
{
  let idleCalls = 0
  const wd = createStreamWatchdog({
    idleMs: 50,
    onIdle: async () => {
      idleCalls += 1
    },
  })
  const { text, sawDone } = await drain(makeSource([], 10, false).pipeThrough(wd.stream))
  assert.equal(idleCalls, 1, 'sin recibir NADA, el watchdog dispara igual')
  assert.equal(sawDone, true)
  assert.equal(text, '')
}

// ── 4. Cierre normal antes del timeout: timer limpio y onIdle NO corre ───────
{
  const baseline = liveTimers()
  let idleCalls = 0
  const reasons: string[] = []
  const wd = createStreamWatchdog({
    idleMs: 60_000, // largo: si no se limpiara, quedaría vivo
    onIdle: async () => {
      idleCalls += 1
    },
    onEvent: (info) => reasons.push(info.reason),
  })
  await drain(makeSource(['data: x\n\n'], 5, true).pipeThrough(wd.stream))
  assert.equal(idleCalls, 0, 'cierre sano → no se persiste por el watchdog')
  assert.deepEqual(reasons, ['closed'])
  assert.equal(
    liveTimers(),
    baseline,
    'el timer de 60s se limpió: ningún timer huérfano manteniendo viva la función',
  )
}

// ── 5. onIdle que RECHAZA: el stream cierra igual ────────────────────────────
// Cerrar el stream no puede quedar condicionado a que la DB responda.
{
  const wd = createStreamWatchdog({
    idleMs: 50,
    onIdle: async () => {
      throw new Error('la DB no respondió')
    },
  })
  const { sawDone, error } = await drain(
    makeSource(['data: y\n\n'], 10, false).pipeThrough(wd.stream),
  )
  assert.equal(sawDone, true, 'onIdle rechazó y el stream CERRÓ igual')
  assert.equal(error, null, 'el fallo de persistencia no se filtra al consumidor')
}

// ── 6. onIdle no se llama dos veces ──────────────────────────────────────────
// Con un idle corto y un stream largo mudo, el timer podría re-armarse; el flag
// `settled` lo impide.
{
  let idleCalls = 0
  const wd = createStreamWatchdog({
    idleMs: 40,
    onIdle: async () => {
      idleCalls += 1
      await sleep(80)
    },
  })
  await drain(makeSource(['data: z\n\n'], 10, false).pipeThrough(wd.stream))
  await sleep(200)
  assert.equal(idleCalls, 1, 'una sola vez, aunque el idle sea corto y la persistencia lenta')
}

// ── 7. Cancelación del consumidor: timer limpio, sin onIdle ──────────────────
{
  const baseline = liveTimers()
  let idleCalls = 0
  const reasons: string[] = []
  const wd = createStreamWatchdog({
    idleMs: 60_000,
    onIdle: async () => {
      idleCalls += 1
    },
    onEvent: (info) => reasons.push(info.reason),
  })
  const out = makeSource(['data: w\n\n'], 5, false).pipeThrough(wd.stream)
  const reader = out.getReader()
  await reader.read()
  await reader.cancel(new Error('el cliente cerró la pestaña'))
  await sleep(60)
  assert.equal(idleCalls, 0, 'nadie espera la respuesta → no se persiste por el watchdog')
  assert.deepEqual(reasons, ['cancelled'])
  assert.equal(liveTimers(), baseline, 'timer limpio también en la cancelación')
}

// ── 8. Cero unhandled rejections (bloques 1-7) ───────────────────────────────
// `terminate()` erroriza el writable, así que el productor upstream recibe un
// error. Si ese rechazo quedara suelto, Node mata el proceso.
await sleep(150)
assert.deepEqual(unhandled, [], `unhandled rejections detectadas (1-7): ${unhandled.join(' | ')}`)

// ── 9. Primer chunk entre idleMs e initialIdleMs: NO dispara ─────────────────
// idleMs=50 (corto) pero initialIdleMs=300 (largo, cold start). El chunk único
// llega a los 150ms — ya pasó `idleMs` pero no `initialIdleMs`. Si el watchdog
// usara `idleMs` para la espera inicial, habría cerrado a los 50ms, ANTES de
// que el chunk pudiera llegar.
{
  let idleCalls = 0
  const wd = createStreamWatchdog({
    idleMs: 50,
    initialIdleMs: 300,
    onIdle: async () => {
      idleCalls += 1
    },
  })
  const { text, sawDone } = await drain(
    makeSource(['data: recien-llega\n\n'], 150, true).pipeThrough(wd.stream),
  )
  assert.equal(idleCalls, 0, 'la ventana INICIAL (300ms) es la que corre, no idleMs (50ms)')
  assert.equal(text, 'data: recien-llega\n\n', 'el chunk llegó completo, sin cortarlo')
  assert.equal(sawDone, true, 'cierre normal (el source cerró solo)')
}

// ── 10. Cero chunks nunca: dispara a initialIdleMs, no a idleMs ──────────────
{
  let idleCalls = 0
  const startedAt = Date.now()
  const wd = createStreamWatchdog({
    idleMs: 5_000, // si se usara este, el test tardaría 5s en pasar
    initialIdleMs: 40,
    onIdle: async () => {
      idleCalls += 1
    },
  })
  await drain(makeSource([], 10, false).pipeThrough(wd.stream))
  const elapsed = Date.now() - startedAt
  assert.equal(idleCalls, 1)
  assert.ok(elapsed < 1_000, `disparó con initialIdleMs (${elapsed}ms), no esperó los 5000ms de idleMs`)
}

// ── 11. Tras markContent(), silencio > idleMs: dispara con la ventana CORTA ──
// initialIdleMs largo (5s) — si el switch de ventana no ocurriera, el test
// tardaría 5s. idleMs corto (40ms) es el que tiene que aplicar tras el
// contenido.
//
// WATCHDOG-4 — antes este bloque mandaba solo un byte y esperaba el switch.
// Ese era EXACTAMENTE el bug: un byte (p. ej. el frame `start` del SDK) no es
// contenido del modelo. Ahora el switch lo dispara `markContent()`.
{
  let idleCalls = 0
  const startedAt = Date.now()
  const wd = createStreamWatchdog({
    idleMs: 40,
    initialIdleMs: 5_000,
    onIdle: async () => {
      idleCalls += 1
    },
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))
  src.push('data: hola\n\n')
  wd.markContent() // ← el modelo empezó a responder de verdad
  await drainPromise
  const elapsed = Date.now() - startedAt
  assert.equal(idleCalls, 1)
  assert.ok(
    elapsed < 1_000,
    `tras markContent() se usó idleMs=40 (${elapsed}ms), no la ventana inicial de 5s`,
  )
}

// ── 12. suspend()/resume(): bloquea el disparo y lo reactiva ─────────────────
{
  const reasons: string[] = []
  const wd = createStreamWatchdog({
    idleMs: 40,
    onEvent: (info) => reasons.push(info.reason),
    onIdle: async () => {},
  })
  // Se pipea pero NUNCA se drena activamente esperando `done` — se simula el
  // "tool en vuelo" suspendiendo antes de que pase el idle.
  const piped = makeSilentSource().pipeThrough(wd.stream)
  const reader = piped.getReader()
  const readPromise = reader.read()

  wd.suspend()
  await sleep(120) // bien por encima de idleMs=40
  assert.deepEqual(reasons, [], 'suspendido: el watchdog NO dispara aunque pase largamente idleMs')

  wd.resume()
  const { done } = await readPromise
  assert.equal(done, true, 'tras resume(), el watchdog SÍ cierra dentro de idleMs')
  assert.deepEqual(reasons, ['idle'])
}

// ── 13 y 14. Contador de tools solapados (NO un booleano) ───────────────────
// Modela EXACTAMENTE el contador de handleChatRequest.ts (incrementar en
// start, decrementar en finish, resumir SOLO en la transición →0) contra el
// watchdog real. Es el caso que un booleano rompería: el primer tool que
// termina no puede reanudar mientras el segundo sigue en vuelo.
{
  const reasons: string[] = []
  const wd = createStreamWatchdog({
    idleMs: 40,
    onEvent: (info) => reasons.push(info.reason),
    onIdle: async () => {},
  })
  let toolsInFlight = 0
  const onToolStart = (): void => {
    toolsInFlight += 1
    if (toolsInFlight === 1) wd.suspend()
  }
  const onToolFinish = (): void => {
    toolsInFlight = Math.max(0, toolsInFlight - 1)
    if (toolsInFlight === 0) wd.resume()
  }

  const piped = makeSilentSource().pipeThrough(wd.stream)
  const reader = piped.getReader()
  const readPromise = reader.read()

  onToolStart() // tool A empieza (contador 0→1, suspende)
  onToolStart() // tool B empieza (contador 1→2, NO vuelve a suspender)
  await sleep(80) // > idleMs: si suspend() no aguantara, ya habría disparado
  assert.deepEqual(reasons, [], 'con 2 tools en vuelo, no dispara')

  onToolFinish() // termina A (contador 2→1): NO debe reanudar
  await sleep(80)
  assert.deepEqual(
    reasons,
    [],
    '13. termina el PRIMER tool pero el segundo sigue: NO reanuda (esto rompería con un booleano)',
  )

  onToolFinish() // termina B (contador 1→0): ACÁ SÍ reanuda
  const { done } = await readPromise
  assert.equal(done, true, '14. el contador llegó a 0 → se reanuda y dispara con idleMs')
  assert.deepEqual(reasons, ['idle'])
}

// ── 15. Tool "colgado" (nunca termina): el techo de seguridad fuerza el cierre ─
// Modela STREAM_WATCHDOG_TOOL_MAX_MS: un timer LOCAL (equivalente al de
// handleChatRequest.ts) que fuerza `resume()` si el tool nunca llama a
// onToolFinish. Un tool colgado no puede reintroducir el cuelgue de 30s.
{
  const reasons: string[] = []
  const wd = createStreamWatchdog({
    idleMs: 40,
    onEvent: (info) => reasons.push(info.reason),
    onIdle: async () => {},
  })
  wd.suspend() // el tool "arranca" y nunca llama a onToolFinish
  const toolMaxTimer = setTimeout(() => wd.resume(), 80) // el techo de seguridad

  const { sawDone } = await drain(makeSilentSource().pipeThrough(wd.stream))
  clearTimeout(toolMaxTimer)
  assert.equal(
    sawDone,
    true,
    'aunque el tool nunca "termina", el techo de seguridad reanuda y el watchdog cierra',
  )
  assert.deepEqual(reasons, ['idle'])
}

// ── 16. EL BUG REPRODUCIDO: tool termina → step 2 arranca → cold start del
// step 2 (entre idleMs e initialIdleMs) → NO dispara, el chunk final llega ───
// Orden EXACTO confirmado en el SDK: onToolCallFinish/resume() corre DENTRO
// del step que llamó al tool, antes de que el step siguiente arranque; el
// onStepStart/beginStep() del step 2 llega un instante después.
{
  const wd = createStreamWatchdog({
    idleMs: 40,
    initialIdleMs: 300,
    onIdle: async () => {},
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))

  src.push('data: step1-tool-call\n\n')
  await sleep(10)
  wd.suspend() // el tool arranca (onToolCallStart)
  await sleep(60) // el tool "corre" (más que idleMs Y que initialIdleMs — suspendido, no importa)
  wd.resume() // el tool termina (onToolCallFinish, contador → 0)
  wd.beginStep() // el step 2 arranca (onStepStart) — ACÁ está el fix
  await sleep(150) // cold start del step 2: > idleMs(40), < initialIdleMs(300)
  src.push('data: step2-respuesta-final\n\n') // el texto que ANTES se perdía
  await sleep(10)
  src.close()

  const { text, sawDone, error } = await drainPromise
  assert.equal(error, null)
  assert.equal(sawDone, true, 'cierre normal — el watchdog NUNCA disparó de más')
  assert.equal(
    text,
    'data: step1-tool-call\n\ndata: step2-respuesta-final\n\n',
    'EL BUG: sin beginStep(), el watchdog cortaba acá y el texto del step 2 nunca llegaba',
  )
}

// ── 17. Orden invertido: beginStep() ANTES que resume() ──────────────────────
// El fix no puede depender de qué callback del SDK llegue primero.
{
  const reasons: string[] = []
  const wd = createStreamWatchdog({
    idleMs: 40,
    initialIdleMs: 300,
    onIdle: async () => {},
    onEvent: (info) => reasons.push(info.reason),
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))

  src.push('data: step1\n\n')
  await sleep(10)
  wd.suspend()
  wd.beginStep() // llega ANTES que resume(): no debe pisar la suspensión
  await sleep(150) // bien suspendido: ni idleMs(40) ni "casi" initialIdleMs importan
  assert.deepEqual(reasons, [], 'beginStep() mientras está suspendido no dispara nada')

  wd.resume() // recién ACÁ se reanuda — tiene que usar la ventana LARGA (la dejó beginStep())
  await sleep(150) // > idleMs(40); si resume() hubiera vuelto a la ventana corta, ya habría cortado
  assert.deepEqual(reasons, [], 'tras resume(), sigue viva la ventana LARGA que dejó beginStep()')

  src.push('data: step2-final\n\n')
  await sleep(10)
  src.close()
  const { text, sawDone } = await drainPromise
  assert.equal(sawDone, true)
  assert.equal(text, 'data: step1\n\ndata: step2-final\n\n', 'ambos chunks llegaron, sin importar el orden')
}

// ── 18. beginStep() llamado varias veces seguidas: un solo timer vivo ───────
{
  const baseline = liveTimers()
  const wd = createStreamWatchdog({ idleMs: 5_000, initialIdleMs: 5_000, onIdle: async () => {} })
  assert.equal(liveTimers(), baseline + 1, 'start() ya armó un timer al crear el watchdog')
  wd.beginStep()
  wd.beginStep()
  wd.beginStep()
  assert.equal(
    liveTimers(),
    baseline + 1,
    'beginStep() llamado 3 veces seguidas sigue siendo UN solo timer, no 3',
  )
  wd.suspend() // limpieza: no dejar un timer de 5s vivo hasta el final del proceso
  assert.equal(liveTimers(), baseline)
}

// ── 19. Step 2 nunca manda ningún chunk: dispara a initialIdleMs ────────────
// idleMs deliberadamente larguísimo: si el watchdog usara esa ventana en vez
// de initialIdleMs tras beginStep(), el test tardaría 5s en pasar.
{
  let idleCalls = 0
  const startedAt = Date.now()
  const wd = createStreamWatchdog({
    idleMs: 5_000,
    initialIdleMs: 40,
    onIdle: async () => {
      idleCalls += 1
    },
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))

  src.push('data: step1\n\n')
  await sleep(10)
  wd.suspend()
  wd.resume()
  wd.beginStep() // step 2 arranca — y no manda NADA nunca
  await drainPromise
  const elapsed = Date.now() - startedAt

  assert.equal(idleCalls, 1)
  assert.ok(
    elapsed < 1_000,
    `disparó con initialIdleMs tras beginStep() (${elapsed}ms) — no se quedó esperando idleMs=5000`,
  )
}

// ── 20. EL CASO DEL BUG: un byte SIN contenido no acorta la ventana ─────────
// Reproduce el turno real de prod: el frame `start` del SDK pasa por el borde
// (1 byte-chunk, `assistantTextLength: 0`), después Vertex tarda 8s en el
// primer token. Con la semántica vieja (bytes eligen ventana) el watchdog
// disparaba a los 3s y mataba una respuesta que el modelo generó bien.
{
  const events: { window: string; contentChunks: number }[] = []
  const wd = createStreamWatchdog({
    idleMs: 120, // "3000ms" a escala
    initialIdleMs: 480, // "12000ms" a escala
    onIdle: async () => {},
    onEvent: (info) => events.push({ window: info.window, contentChunks: info.contentChunks }),
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))

  src.push('data: {"type":"start"}\n\n') // el frame `start` del SDK: NO es contenido
  await sleep(320) // > idleMs(120), < initialIdleMs(480): el cold start de Vertex
  // `.length` y no `deepEqual(events, [])`: comparar contra `[]` estrecha
  // `events` a `never[]` y rompe los usos de abajo.
  assert.equal(events.length, 0, 'un byte sin contenido NO acorta la ventana: no dispara')

  wd.markContent() // recién ahora el modelo empieza a responder
  src.push('data: {"type":"text-delta"}\n\n')
  await sleep(10)
  src.close()

  const { text, sawDone } = await drainPromise
  assert.equal(sawDone, true, 'cierre normal — el watchdog nunca cortó')
  assert.equal(
    text,
    'data: {"type":"start"}\n\ndata: {"type":"text-delta"}\n\n',
    'la respuesta llega completa: es la que antes se perdía',
  )
  assert.deepEqual(events.map((e) => e.window), ['content'], 'terminó en la ventana de contenido')
}

// ── 21. Bytes fluyendo sin markContent() nunca → dispara a INITIAL, no antes ─
{
  const events: { window: string; contentChunks: number }[] = []
  const startedAt = Date.now()
  const wd = createStreamWatchdog({
    idleMs: 40,
    initialIdleMs: 300,
    onIdle: async () => {},
    onEvent: (info) => events.push({ window: info.window, contentChunks: info.contentChunks }),
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))
  // Bytes estructurales cada 80ms: superan idleMs(40) pero resetean el timer,
  // así que lo que corre es la ventana INICIAL desde el último byte.
  for (let i = 0; i < 3; i += 1) {
    src.push(`data: {"frame":${i}}\n\n`)
    await sleep(80)
  }
  await drainPromise
  const elapsed = Date.now() - startedAt
  assert.ok(elapsed >= 300, `esperó la ventana inicial completa (${elapsed}ms >= 300ms)`)
  assert.deepEqual(
    events,
    [{ window: 'initial', contentChunks: 0 }],
    'disparó en la ventana INICIAL, con contentChunks 0 — el log lo dice solo',
  )
}

// ── 22. markContent() es idempotente: un solo cambio, sin timers duplicados ──
{
  const baseline = liveTimers()
  const events: { window: string; contentChunks: number }[] = []
  const wd = createStreamWatchdog({
    idleMs: 60_000,
    initialIdleMs: 60_000,
    onIdle: async () => {},
    onEvent: (info) => events.push({ window: info.window, contentChunks: info.contentChunks }),
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))
  for (let i = 0; i < 5; i += 1) wd.markContent()
  assert.equal(
    liveTimers(),
    baseline + 1,
    'cinco markContent() dejan UN solo timer vivo, no cinco',
  )
  src.close()
  await drainPromise
  assert.equal(events[0]?.contentChunks, 5, 'el contador SÍ cuenta las cinco llamadas')
  assert.equal(events[0]?.window, 'content')
  assert.equal(liveTimers(), baseline, 'timer limpio al cerrar')
}

// ── 23. beginStep() vuelve a la ventana larga aunque hubo contenido antes ────
// Es el caso multi-step real: step 1 genera texto, step 2 arranca en frío.
{
  const events: { window: string }[] = []
  const startedAt = Date.now()
  const wd = createStreamWatchdog({
    idleMs: 40,
    initialIdleMs: 350,
    onIdle: async () => {},
    onEvent: (info) => events.push({ window: info.window }),
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))
  wd.markContent() // step 1 tuvo contenido → ventana corta
  src.push('data: step1\n\n')
  await sleep(10)
  wd.beginStep() // step 2 arranca → tiene que volver a la ventana LARGA
  await drainPromise
  const elapsed = Date.now() - startedAt
  assert.ok(
    elapsed >= 350,
    `tras beginStep() rige la ventana inicial otra vez (${elapsed}ms >= 350ms)`,
  )
  assert.deepEqual(events.map((e) => e.window), ['initial'], 'volvió a la ventana inicial')
}

// ── 24. suspend()/resume() NO pisan el estado de ventana ────────────────────
// Regresión directa de WATCHDOG-3, ahora también sobre el estado de contenido.
{
  const events: { window: string }[] = []
  const startedAt = Date.now()
  const wd = createStreamWatchdog({
    idleMs: 40,
    initialIdleMs: 350,
    onIdle: async () => {},
    onEvent: (info) => events.push({ window: info.window }),
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))
  // Sin markContent(): estamos en la ventana LARGA. Un ciclo de tool no debe
  // convertirla en corta (eso era el bug de WATCHDOG-3, ahora con otro flag).
  wd.suspend()
  await sleep(60)
  wd.resume()
  await drainPromise
  const elapsed = Date.now() - startedAt
  assert.ok(
    elapsed >= 350,
    `resume() respetó la ventana LARGA que no se había cambiado (${elapsed}ms >= 350ms)`,
  )
  assert.deepEqual(events.map((e) => e.window), ['initial'])
}

// ── 25. Simetría: con contenido previo, resume() mantiene la ventana CORTA ──
{
  const events: { window: string }[] = []
  const startedAt = Date.now()
  const wd = createStreamWatchdog({
    idleMs: 40,
    initialIdleMs: 5_000,
    onIdle: async () => {},
    onEvent: (info) => events.push({ window: info.window }),
  })
  const src = makeControllableSource()
  const drainPromise = drain(src.stream.pipeThrough(wd.stream))
  wd.markContent() // ya hubo contenido en este step
  wd.suspend()
  await sleep(60)
  wd.resume() // sin beginStep(): sigue siendo el MISMO step
  await drainPromise
  const elapsed = Date.now() - startedAt
  assert.ok(elapsed < 1_000, `resume() conservó la ventana CORTA (${elapsed}ms)`)
  assert.deepEqual(events.map((e) => e.window), ['content'])
}

// ── Cero unhandled rejections en TODO el archivo (9-25 incluidos) ───────────
await sleep(150)
assert.deepEqual(unhandled, [], `unhandled rejections detectadas: ${unhandled.join(' | ')}`)

console.log(
  '✓ stream-watchdog invariants OK: los chunks pasan verbatim, el silencio dispara el cierre ' +
    'esperando la persistencia, un stream que nunca emite igual cierra, el cierre sano y la ' +
    'cancelación no persisten ni dejan timers, un onIdle que falla no impide cerrar, no queda ' +
    'ninguna promesa sin manejar, las dos ventanas (initial/post-chunk) conmutan correctamente, ' +
    'la suspensión por contador (no booleano) aguanta tools solapados y se libera con el techo ' +
    'de seguridad ante un tool colgado, beginStep() hace que el arranque en frío del STEP 2 ' +
    '(tras un tool) ya no corte la respuesta — sin importar el orden entre resume() y ' +
    'beginStep() — y la ventana la decide markContent() (contenido real del modelo), NO los ' +
    'bytes: un frame estructural del SDK ya no acorta la ventana ni mata una respuesta lenta.',
)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
