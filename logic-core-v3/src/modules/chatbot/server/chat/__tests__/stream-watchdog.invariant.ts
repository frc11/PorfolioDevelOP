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
  const { text, sawDone, error } = await drain(makeSource(parts, 20, true).pipeThrough(wd))
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
    makeSource(['data: hola\n\n'], 10, false).pipeThrough(wd),
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
  const { text, sawDone } = await drain(makeSource([], 10, false).pipeThrough(wd))
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
  await drain(makeSource(['data: x\n\n'], 5, true).pipeThrough(wd))
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
  const { sawDone, error } = await drain(makeSource(['data: y\n\n'], 10, false).pipeThrough(wd))
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
  await drain(makeSource(['data: z\n\n'], 10, false).pipeThrough(wd))
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
  const out = makeSource(['data: w\n\n'], 5, false).pipeThrough(wd)
  const reader = out.getReader()
  await reader.read()
  await reader.cancel(new Error('el cliente cerró la pestaña'))
  await sleep(60)
  assert.equal(idleCalls, 0, 'nadie espera la respuesta → no se persiste por el watchdog')
  assert.deepEqual(reasons, ['cancelled'])
  assert.equal(liveTimers(), baseline, 'timer limpio también en la cancelación')
}

// ── 8. Cero unhandled rejections ─────────────────────────────────────────────
// `terminate()` erroriza el writable, así que el productor upstream recibe un
// error. Si ese rechazo quedara suelto, Node mata el proceso.
await sleep(150)
assert.deepEqual(unhandled, [], `unhandled rejections detectadas: ${unhandled.join(' | ')}`)

console.log(
  '✓ stream-watchdog invariants OK: los chunks pasan verbatim, el silencio dispara el cierre ' +
    'esperando la persistencia, un stream que nunca emite igual cierra, el cierre sano y la ' +
    'cancelación no persisten ni dejan timers, un onIdle que falla no impide cerrar, y no queda ' +
    'ninguna promesa sin manejar.',
)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
