/**
 * PROVIDER-CLOSE — Invariantes del cierre del stream CRUDO del provider. Corre
 * SIN DB, SIN red, SIN credenciales y SIN server:
 *
 *   npm run test:providerclose
 *   (o: npx tsx src/modules/chatbot/server/llm/__tests__/provider-stream-close.invariant.ts)
 *
 * PARTE A — el transform en sí (chunks, ventanas, timers, cierre limpio).
 * PARTE B — la premisa del sprint, verificada END-TO-END contra el `streamText`
 *           REAL del SDK con un modelo falso que emite y NUNCA cierra. Es lo
 *           que distingue este sprint de los dos intentos anteriores:
 *             - sin middleware        → `onFinish` NUNCA dispara (el bug);
 *             - abortando             → `onFinish` NUNCA dispara (por eso
 *                                        `chunkMs`/`stepMs` fallaron);
 *             - CERRANDO (`terminate`) → el pipeline completa.
 *           Y responde la pregunta del costo: si el provider manda su chunk
 *           `finish`, el `usage` que llega a `onFinish` es IDÉNTICO al de un
 *           provider que cierra solo.
 */
import assert from 'node:assert/strict'
import { streamText, wrapLanguageModel } from 'ai'
import type { LanguageModelV3, LanguageModelV3StreamPart } from '@ai-sdk/provider'
import { createProviderStreamCloseMiddleware } from '../providerStreamClose.ts'

const unhandled: string[] = []
process.on('unhandledRejection', (reason: unknown) => {
  unhandled.push(String(reason))
})

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** Cuántos timers hay vivos ahora. Tipado en @types/node — cero `any`. */
const liveTimers = (): number =>
  process.getActiveResourcesInfo().filter((r) => r === 'Timeout').length

/** Forma V3 real del usage (objetos anidados, no números planos). */
const USAGE = {
  inputTokens: { total: 111, noCache: 111, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 222, text: 222, reasoning: 0 },
} as const

/**
 * Modelo falso que emite chunks y —según `closeNaturally`— cierra o se queda
 * mudo para siempre. El caso `false` reproduce el patrón real de Gemini.
 */
function makeFakeModel(options: {
  emitFinish: boolean
  closeNaturally: boolean
  firstChunkDelayMs?: number
}): LanguageModelV3 {
  return {
    specificationVersion: 'v3',
    provider: 'test-provider',
    modelId: 'test-model',
    supportedUrls: {},
    doGenerate() {
      return Promise.reject(new Error('doGenerate no se usa en este test'))
    },
    doStream() {
      const stream = new ReadableStream<LanguageModelV3StreamPart>({
        async start(controller) {
          if (options.firstChunkDelayMs) await sleep(options.firstChunkDelayMs)
          controller.enqueue({ type: 'stream-start', warnings: [] })
          controller.enqueue({
            type: 'response-metadata',
            id: 'r1',
            modelId: 'test-model',
            timestamp: new Date(0),
          })
          controller.enqueue({ type: 'text-start', id: 't1' })
          controller.enqueue({ type: 'text-delta', id: 't1', delta: 'hola mundo' })
          controller.enqueue({ type: 'text-end', id: 't1' })
          if (options.emitFinish) {
            controller.enqueue({
              type: 'finish',
              finishReason: { unified: 'stop', raw: 'STOP' },
              usage: USAGE,
            })
          }
          if (options.closeNaturally) controller.close()
          // Si no: NUNCA cierra. Es el bug de producción.
        },
      })
      return Promise.resolve({ stream })
    },
  }
}

/** Corre `streamText` real y devuelve qué llegó a completarse. */
async function runStreamText(
  model: LanguageModelV3,
  timeoutMs = 3_000,
): Promise<{ text: string; onFinishFired: boolean; inputTokens?: number; outputTokens?: number }> {
  let onFinishFired = false
  let inputTokens: number | undefined
  let outputTokens: number | undefined
  let text = ''
  const result = streamText({
    model,
    prompt: 'test',
    onFinish: (event) => {
      onFinishFired = true
      inputTokens = event.totalUsage.inputTokens
      outputTokens = event.totalUsage.outputTokens
    },
    onError: () => {
      // El caso "abort" erroriza a propósito; no debe tumbar el test.
    },
  })
  const consume = (async () => {
    try {
      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') text += part.text
      }
    } catch {
      // idem
    }
  })()
  await Promise.race([consume, sleep(timeoutMs)])
  await sleep(100)
  return { text, onFinishFired, inputTokens, outputTokens }
}

/**
 * Drena el stream del middleware directamente (Parte A).
 *
 * ⚠️ El `timeoutMs` NO es decorativo. Si el middleware no cerrara el stream, el
 * `read()` quedaría pendiente para siempre, el event loop de Node se vaciaría y
 * **el proceso saldría con código 0 en silencio** — el test "pasaría" sin haber
 * verificado nada. Se descubrió justamente así, neutralizando el timer del
 * middleware a propósito. La carrera contra un timer convierte ese cuelgue en
 * un fallo explícito.
 */
async function drainRaw(
  stream: ReadableStream<LanguageModelV3StreamPart>,
  timeoutMs = 2_000,
): Promise<{ types: string[]; sawDone: boolean; error: string | null }> {
  const reader = stream.getReader()
  const types: string[] = []
  const drained = (async (): Promise<{ types: string[]; sawDone: boolean; error: string | null }> => {
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) return { types, sawDone: true, error: null }
        if (value) types.push(value.type)
      }
    } catch (error) {
      return { types, sawDone: false, error: error instanceof Error ? error.message : String(error) }
    }
  })()
  // El timer del guard se CANCELA cuando gana el drain: si quedara vivo,
  // contaminaría el conteo de `liveTimers()` de los checks de timers huérfanos.
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  const timedOut = new Promise<{ timedOut: true }>((resolve) => {
    timeoutHandle = setTimeout(() => resolve({ timedOut: true }), timeoutMs)
  })
  try {
    const outcome = await Promise.race([
      drained.then((value) => ({ timedOut: false as const, value })),
      timedOut,
    ])
    if (outcome.timedOut) {
      throw new Error(
        `el stream NO cerró en ${timeoutMs}ms — el middleware no está cerrando (chunks vistos: ${types.length})`,
      )
    }
    return outcome.value
  } finally {
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
  }
}

/** Aplica el middleware a un modelo y devuelve el stream resultante. */
async function pipeThroughMiddleware(
  model: LanguageModelV3,
  opts: { idleMs: number; initialIdleMs: number; onClose?: (r: Record<string, string | number | boolean>) => void },
): Promise<ReadableStream<LanguageModelV3StreamPart>> {
  const mw = createProviderStreamCloseMiddleware(opts)
  assert.ok(mw.wrapStream, 'el middleware debe exponer wrapStream')
  const wrapped = await mw.wrapStream({
    doStream: () => model.doStream({ prompt: [] }),
    doGenerate: () => model.doGenerate({ prompt: [] }),
    params: { prompt: [] },
    model,
  })
  return wrapped.stream
}

async function main(): Promise<void> {
// ══════════ PARTE A — el transform ══════════

// ── A1. Chunks fluyendo y provider que cierra solo: pasan VERBATIM y en orden ─
{
  const reports: Record<string, string | number | boolean>[] = []
  const stream = await pipeThroughMiddleware(
    makeFakeModel({ emitFinish: true, closeNaturally: true }),
    { idleMs: 500, initialIdleMs: 1_000, onClose: (r) => reports.push(r) },
  )
  const { types, sawDone, error } = await drainRaw(stream)
  assert.equal(error, null, 'el camino sano no erroriza')
  assert.equal(sawDone, true)
  assert.deepEqual(
    types,
    ['stream-start', 'response-metadata', 'text-start', 'text-delta', 'text-end', 'finish'],
    'los chunks salen VERBATIM y en orden — el middleware no altera nada',
  )
  assert.equal(reports.length, 1, 'reporta exactamente una vez')
  assert.equal(reports[0].reason, 'natural', 'el provider cerró solo')
  assert.equal(reports[0].sawFinishChunk, true)
  assert.equal(reports[0].finishInputTokens, 111, 'lee los tokens del chunk finish')
  assert.equal(reports[0].finishOutputTokens, 222)
  assert.equal(reports[0].chunk_text_delta, 1, 'cuenta por tipo de chunk')
}

// ── A2. Provider que NO cierra: cerramos nosotros, con `done` LIMPIO ─────────
{
  const reports: Record<string, string | number | boolean>[] = []
  const stream = await pipeThroughMiddleware(
    makeFakeModel({ emitFinish: true, closeNaturally: false }),
    { idleMs: 60, initialIdleMs: 1_000, onClose: (r) => reports.push(r) },
  )
  const { types, sawDone, error } = await drainRaw(stream)
  assert.equal(error, null, 'el consumidor NO ve un error: ve un cierre LIMPIO (esa es la clave)')
  assert.equal(sawDone, true)
  assert.ok(types.includes('finish'), 'el chunk finish ya encolado NO se pierde al cerrar')
  assert.equal(reports[0].reason, 'idle', 'cerramos nosotros')
}

// ── A3. Primer chunk lento: entre idleMs e initialIdleMs → NO cierra ─────────
{
  const stream = await pipeThroughMiddleware(
    makeFakeModel({ emitFinish: true, closeNaturally: true, firstChunkDelayMs: 150 }),
    { idleMs: 50, initialIdleMs: 600 },
  )
  const { types, sawDone } = await drainRaw(stream)
  assert.equal(sawDone, true)
  assert.ok(
    types.includes('text-delta'),
    'la ventana INICIAL (600ms) cubre el cold start: no se corta antes de que llegue el texto',
  )
}

// ── A4. Ningún chunk NUNCA: cierra a initialIdleMs ──────────────────────────
{
  const reports: Record<string, string | number | boolean>[] = []
  const silent: LanguageModelV3 = {
    specificationVersion: 'v3',
    provider: 'test-provider',
    modelId: 'test-model',
    supportedUrls: {},
    doGenerate: () => Promise.reject(new Error('no usado')),
    doStream: () =>
      Promise.resolve({
        stream: new ReadableStream<LanguageModelV3StreamPart>({
          pull() {
            return new Promise<void>(() => {})
          },
        }),
      }),
  }
  const startedAt = Date.now()
  const stream = await pipeThroughMiddleware(silent, {
    idleMs: 5_000,
    initialIdleMs: 60,
    onClose: (r) => reports.push(r),
  })
  const { types, sawDone } = await drainRaw(stream)
  const elapsed = Date.now() - startedAt
  assert.equal(sawDone, true, 'sin recibir NADA, igual cierra')
  assert.deepEqual(types, [])
  assert.ok(elapsed < 1_000, `cerró con initialIdleMs (${elapsed}ms), no esperó idleMs=5000`)
  assert.equal(reports[0].totalChunks, 0)
  assert.equal(reports[0].sawFinishChunk, false)
}

// ── A5. Cierre natural: timers limpios, sin doble reporte ───────────────────
{
  const baseline = liveTimers()
  const reports: Record<string, string | number | boolean>[] = []
  const stream = await pipeThroughMiddleware(
    makeFakeModel({ emitFinish: true, closeNaturally: true }),
    { idleMs: 60_000, initialIdleMs: 60_000, onClose: (r) => reports.push(r) },
  )
  await drainRaw(stream)
  await sleep(50)
  assert.equal(reports.length, 1, 'un solo reporte, sin doble cierre')
  assert.equal(
    liveTimers(),
    baseline,
    'el timer de 60s se limpió: ningún timer huérfano manteniendo viva la función',
  )
}

// ── A6. Cancelación del consumidor: timers limpios ──────────────────────────
{
  const baseline = liveTimers()
  const reports: Record<string, string | number | boolean>[] = []
  const stream = await pipeThroughMiddleware(
    makeFakeModel({ emitFinish: true, closeNaturally: false }),
    { idleMs: 60_000, initialIdleMs: 60_000, onClose: (r) => reports.push(r) },
  )
  const reader = stream.getReader()
  await reader.read()
  await reader.cancel(new Error('el consumidor corto'))
  await sleep(80)
  assert.equal(liveTimers(), baseline, 'timer limpio también en la cancelación')
  assert.equal(reports[0]?.reason, 'cancelled')
}

// ══════════ PARTE B — la premisa, contra el `streamText` REAL ══════════

// ── B1. CONTROL: sin middleware, el provider no cierra → onFinish NUNCA ──────
// Es el bug de producción, reproducido.
{
  const r = await runStreamText(makeFakeModel({ emitFinish: true, closeNaturally: false }))
  assert.equal(r.text, 'hola mundo', 'el texto SÍ llega (por eso el visitante lo ve)')
  assert.equal(
    r.onFinishFired,
    false,
    'CONTROL: sin cerrar el stream del provider, onFinish NUNCA dispara — el bug',
  )
}

// ── B2. EL FIX: cerrando, el pipeline completa Y el usage se recupera ────────
{
  const r = await runStreamText(
    wrapLanguageModel({
      model: makeFakeModel({ emitFinish: true, closeNaturally: false }),
      middleware: createProviderStreamCloseMiddleware({ idleMs: 120, initialIdleMs: 1_000 }),
    }),
  )
  assert.equal(r.text, 'hola mundo')
  assert.equal(r.onFinishFired, true, 'cerrando el stream del provider, onFinish SÍ dispara')
  assert.equal(r.inputTokens, 111, 'el usage del chunk finish sobrevive al cierre — el costo se recupera')
  assert.equal(r.outputTokens, 222)
}

// ── B3. Paridad con el camino sano: mismo usage que si el provider cerrara ──
{
  const healthy = await runStreamText(makeFakeModel({ emitFinish: true, closeNaturally: true }))
  const closed = await runStreamText(
    wrapLanguageModel({
      model: makeFakeModel({ emitFinish: true, closeNaturally: false }),
      middleware: createProviderStreamCloseMiddleware({ idleMs: 120, initialIdleMs: 1_000 }),
    }),
  )
  assert.equal(healthy.onFinishFired, true, 'baseline sano')
  assert.deepEqual(
    { inputTokens: closed.inputTokens, outputTokens: closed.outputTokens },
    { inputTokens: healthy.inputTokens, outputTokens: healthy.outputTokens },
    'el usage tras cerrar es IDÉNTICO al de un provider que cierra solo',
  )
}

// ── B4. Si el provider NO manda `finish`: se destraba igual, pero sin usage ──
// Es la otra rama de la pregunta abierta del costo. Documenta el límite real.
{
  const r = await runStreamText(
    wrapLanguageModel({
      model: makeFakeModel({ emitFinish: false, closeNaturally: false }),
      middleware: createProviderStreamCloseMiddleware({ idleMs: 120, initialIdleMs: 1_000 }),
    }),
  )
  assert.equal(r.text, 'hola mundo', 'el texto llega igual')
  assert.equal(r.onFinishFired, true, 'el pipeline se destraba igual (persistencia OK)')
  assert.equal(
    r.inputTokens,
    undefined,
    'sin chunk finish del provider NO hay usage: el costo queda en 0 y hace falta otro sprint',
  )
}

// ── Cero unhandled rejections ───────────────────────────────────────────────
await sleep(150)
assert.deepEqual(unhandled, [], `unhandled rejections detectadas: ${unhandled.join(' | ')}`)

console.log(
  '✓ provider-stream-close invariants OK: los chunks pasan verbatim, el provider mudo se cierra ' +
    'con `done` limpio (nunca un error), las dos ventanas conmutan, no quedan timers huérfanos ' +
    'ni promesas sin manejar, y —contra el streamText REAL— cerrar el stream del provider hace ' +
    'que onFinish dispare y que el usage llegue idéntico al camino sano, donde sin middleware ' +
    'nunca disparaba.',
)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
