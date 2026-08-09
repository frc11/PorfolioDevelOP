/**
 * MUDEZ — Invariante del bloque: "un turno que llega al final produce texto
 * para el visitante O queda registrado con su costo" — y con la red del borde,
 * las dos cosas.
 *
 *   npm run test:mudez
 *   (o: npx tsx src/modules/chatbot/server/chat/__tests__/mudez-net.invariant.ts)
 *
 * QUE EJERCITA (todo codigo REAL de produccion, cero replicas):
 *   - `createStreamWatchdog` de verdad (bytes, ventanas chicas para el test):
 *     la emision de frames devueltos por onIdle/onSilentClose, el descarte
 *     post-settled, y que `cancel` NUNCA habla.
 *   - `buildSilenceTextFrames` de verdad, validado contra la FORMA ESTRICTA
 *     que exige el cliente (type/id/delta — un campo mal y el transport hace
 *     throw).
 *   - `streamText` REAL (ai instalado) con providers falsos, atravesando
 *     `toUIMessageStreamResponse()` + el watchdog: la forma C5 (doStream
 *     pendiente para siempre) y la forma NoOutput (stream que cierra sin
 *     output) terminan con el canned VISIBLE en el body y el persist
 *     registrado.
 *
 * LIMITE HONESTO (hallazgo 0 de MS-E6.2): el closure onIdle/onSilentClose de
 * produccion vive dentro de `handleChatRequest` y no es invocable sin servidor
 * ni DB. Aca se cablea un closure ESPEJO minimo (persistencia grabada en
 * memoria + los mismos guards) sobre los mecanismos reales — lo que este test
 * pinnea es la MECANICA (watchdog + frames + SDK), que es donde vivia el bug.
 *
 * ⚠️ Guard de timeout en cada drain: si el pipeline se trabara, el `read()`
 * queda pendiente, el event loop se vacia y Node saldria con codigo 0 EN
 * SILENCIO (leccion de sprints previos). Un cuelgue es un FALLO explicito aca.
 */
import assert from 'node:assert/strict'
import { streamText, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import type { LanguageModelV3, LanguageModelV3StreamPart } from '@ai-sdk/provider'
import { createStreamWatchdog } from '../streamWatchdog.ts'
import { buildSilenceTextFrames, SILENCE_TEXT_ID } from '../silenceFrames.ts'
import {
  createEmptyResponseFallbackTransform,
  pickPersistedAssistantText,
} from '../reconcile.ts'

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const USAGE = {
  inputTokens: { total: 50, noCache: 50, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 10, text: 10, reasoning: 0 },
}

const CANNED = 'Se me complico responder ahora - te derivo con el equipo.'

const unhandled: string[] = []
process.on('unhandledRejection', (reason: unknown) => {
  unhandled.push(String(reason))
})

interface DrainResult {
  frames: string[]
  cannedSeen: boolean
  realTextSeen: boolean
  done: boolean
}

/** Drena el body y clasifica los frames. Cuelgue => throw (nunca silencio). */
async function drainBody(body: ReadableStream<Uint8Array>, capMs: number): Promise<DrainResult> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  const frames: string[] = []
  let cannedSeen = false
  let realTextSeen = false
  let buffer = ''
  let done = false

  const drain = (async () => {
    for (;;) {
      const r = await reader.read()
      if (r.done) {
        done = true
        break
      }
      buffer += decoder.decode(r.value, { stream: true })
      let idx
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        const line = raw.split('\n').find((l) => l.startsWith('data: '))
        if (!line) continue
        const payload = line.slice(6)
        if (payload === '[DONE]') continue
        const parsed: unknown = JSON.parse(payload)
        if (typeof parsed !== 'object' || parsed === null) continue
        const obj = parsed as { type?: unknown; id?: unknown; delta?: unknown }
        frames.push(String(obj.type))
        if (obj.type === 'text-delta') {
          // FORMA ESTRICTA del cliente: text-delta DEBE traer id y delta string.
          assert.equal(typeof obj.id, 'string', 'text-delta sin id: el cliente haria throw')
          assert.equal(typeof obj.delta, 'string', 'text-delta sin delta: el cliente haria throw')
          if (obj.id === SILENCE_TEXT_ID) cannedSeen = true
          else realTextSeen = true
        }
      }
    }
  })()

  const winner = await Promise.race([drain.then(() => 'ok' as const), sleep(capMs).then(() => 'timeout' as const)])
  if (winner === 'timeout') {
    await reader.cancel().catch(() => {})
    throw new Error(`drain colgado > ${capMs}ms — el pipeline no cerro`)
  }
  return { frames, cannedSeen, realTextSeen, done }
}

/** Modelo falso: step 1 tool-call; el doStream del step 2 NUNCA resuelve (C5). */
function makePendingStep2Model(): LanguageModelV3 {
  let call = 0
  return {
    specificationVersion: 'v3',
    provider: 'probe',
    modelId: 'probe',
    supportedUrls: {},
    doGenerate: () => Promise.reject(new Error('no doGenerate')),
    doStream: async () => {
      if (call++ > 0) return new Promise(() => {}) // pendiente para siempre
      const stream = new ReadableStream<LanguageModelV3StreamPart>({
        start(c) {
          c.enqueue({ type: 'stream-start', warnings: [] })
          c.enqueue({ type: 'tool-input-start', id: 'tc0', toolName: 'probe_tool' })
          c.enqueue({ type: 'tool-input-end', id: 'tc0' })
          c.enqueue({ type: 'tool-call', toolCallId: 'tc0', toolName: 'probe_tool', input: '{}' })
          c.enqueue({ type: 'finish', finishReason: { unified: 'tool-calls', raw: 'T' }, usage: USAGE })
          c.close()
        },
      })
      return { stream }
    },
  }
}

/** Modelo falso: stream que cierra SIN output ni finish (NoOutputGeneratedError). */
function makeNoOutputModel(): LanguageModelV3 {
  return {
    specificationVersion: 'v3',
    provider: 'probe',
    modelId: 'probe',
    supportedUrls: {},
    doGenerate: () => Promise.reject(new Error('no doGenerate')),
    doStream: async () => ({
      stream: new ReadableStream<LanguageModelV3StreamPart>({
        start(c) {
          c.enqueue({ type: 'stream-start', warnings: [] })
          c.close()
        },
      }),
    }),
  }
}

/** Modelo falso sano: texto y cierre normal. */
function makeHealthyModel(): LanguageModelV3 {
  return {
    specificationVersion: 'v3',
    provider: 'probe',
    modelId: 'probe',
    supportedUrls: {},
    doGenerate: () => Promise.reject(new Error('no doGenerate')),
    doStream: async () => ({
      stream: new ReadableStream<LanguageModelV3StreamPart>({
        start(c) {
          c.enqueue({ type: 'stream-start', warnings: [] })
          c.enqueue({ type: 'text-start', id: 't0' })
          c.enqueue({ type: 'text-delta', id: 't0', delta: 'respuesta real' })
          c.enqueue({ type: 'text-end', id: 't0' })
          c.enqueue({ type: 'finish', finishReason: { unified: 'stop', raw: 'S' }, usage: USAGE })
          c.close()
        },
      }),
    }),
  }
}

interface NetRun {
  drained: DrainResult
  persisted: Array<{ source: string; text: string; finishReason: string }>
  events: string[]
}

/**
 * Cablea el espejo minimo del handler: streamText real -> body real -> watchdog
 * REAL con la red (onIdle devuelve canned si no hubo texto; onSilentClose igual
 * salvo fallback ya inyectado), grabando cada persist.
 */
async function runThroughNet(model: LanguageModelV3, opts: { cancelAfterMs?: number } = {}): Promise<NetRun> {
  let accumulated = ''
  let fallbackInjected = false
  const persisted: NetRun['persisted'] = []
  const events: string[] = []
  const runAbort = new AbortController()

  const probeTool = tool({
    description: 'sonda',
    inputSchema: z.object({}),
    execute: async () => ({ ok: true }),
  })

  const result = streamText({
    model,
    abortSignal: runAbort.signal,
    prompt: 'sonda',
    tools: { probe_tool: probeTool },
    stopWhen: stepCountIs(3),
    experimental_transform: createEmptyResponseFallbackTransform(CANNED, () => {
      fallbackInjected = true
    }),
    onChunk: ({ chunk }) => {
      if (chunk.type === 'text-delta') accumulated += chunk.text
    },
    onError: () => {},
    onAbort: () => {},
  })

  const persistOnce = (source: string, text: string, finishReason: string): void => {
    // Espejo del guard de idempotencia de persistTurn.
    if (persisted.length > 0) return
    persisted.push({ source, text, finishReason })
  }

  const watchdog = createStreamWatchdog({
    idleMs: 250,
    initialIdleMs: 500,
    onIdle: async () => {
      const spokeCanned = accumulated.trim().length === 0
      persistOnce(spokeCanned ? 'watchdog_canned' : 'watchdog', spokeCanned ? CANNED : accumulated, 'watchdog_idle')
      runAbort.abort()
      void Promise.resolve(result.consumeStream()).catch(() => {})
      return spokeCanned ? buildSilenceTextFrames(CANNED) : null
    },
    onSilentClose: async () => {
      if (accumulated.trim().length > 0) return null
      if (fallbackInjected) return null
      persistOnce('watchdog_canned', CANNED, 'silent_close')
      return buildSilenceTextFrames(CANNED)
    },
    onEvent: (info) => {
      events.push(info.reason)
    },
  })

  const response = result.toUIMessageStreamResponse()
  assert.ok(response.body, 'el body del UI stream existe')
  const guarded = response.body.pipeThrough(watchdog.stream)

  if (opts.cancelAfterMs !== undefined) {
    const reader = guarded.getReader()
    const first = await Promise.race([reader.read(), sleep(1_000).then(() => null)])
    assert.ok(first !== null, 'llego al menos un byte antes del cancel')
    await sleep(opts.cancelAfterMs)
    await reader.cancel()
    await sleep(400) // dejar asentar los callbacks
    return { drained: { frames: [], cannedSeen: false, realTextSeen: false, done: false }, persisted, events }
  }

  const drained = await drainBody(guarded, 8_000)
  await sleep(300)
  return { drained, persisted, events }
}

async function main(): Promise<void> {
  // ── 1. Forma C5: doStream del step 2 pendiente para siempre ────────────────
  {
    const run = await runThroughNet(makePendingStep2Model())
    assert.ok(run.drained.done, 'C5: el body cierra (el visitante ve done)')
    assert.ok(run.drained.cannedSeen, 'C5: el canned del borde LLEGA al visitante')
    assert.equal(run.persisted.length, 1, 'C5: el turno queda registrado')
    assert.equal(run.persisted[0].source, 'watchdog_canned', 'C5: distinguible por source')
    assert.equal(run.persisted[0].finishReason, 'watchdog_idle', 'C5: via disparo idle')
    assert.ok(run.events.includes('idle'), 'C5: el watchdog reporto idle')
    console.log('  ok 1. C5 (doStream pendiente): canned visible + persistido via idle')
  }

  // ── 2. Forma NoOutput: cierre limpio del SDK con cero texto ────────────────
  {
    const run = await runThroughNet(makeNoOutputModel())
    assert.ok(run.drained.done, 'NoOutput: el body cierra')
    assert.ok(run.drained.cannedSeen, 'NoOutput: el canned del borde LLEGA al visitante')
    assert.equal(run.persisted.length, 1, 'NoOutput: el turno queda registrado')
    assert.equal(run.persisted[0].finishReason, 'silent_close', 'NoOutput: via cierre limpio, no idle')
    assert.ok(run.events.includes('closed'), 'NoOutput: el watchdog reporto closed (no idle)')
    assert.ok(!run.events.includes('idle'), 'NoOutput: idle NO disparo — el cierre fue rapido')
    console.log('  ok 2. NoOutput (cierre limpio vacio): canned visible + persistido via silent_close')
  }

  // ── 3. Paridad sana: con texto real, la red NO habla ni persiste ───────────
  {
    const run = await runThroughNet(makeHealthyModel())
    assert.ok(run.drained.done, 'sano: el body cierra')
    assert.ok(run.drained.realTextSeen, 'sano: el texto real llega')
    assert.ok(!run.drained.cannedSeen, 'sano: CERO canned — paridad exacta')
    assert.equal(run.persisted.length, 0, 'sano: la red no persiste nada (lo hace onFinish en prod)')
    console.log('  ok 3. Paridad sana: texto real, cero canned, la red no interviene')
  }

  // ── 4. Cancel del consumidor: la red NUNCA habla (visitante ido) ───────────
  {
    const run = await runThroughNet(makePendingStep2Model(), { cancelAfterMs: 100 })
    assert.equal(run.persisted.length, 0, 'cancel: la red no persiste (no es su camino)')
    assert.ok(run.events.includes('cancelled'), 'cancel: el watchdog reporto cancelled')
    assert.ok(!run.events.includes('idle'), 'cancel: idle no disparo')
    console.log('  ok 4. Cancel: la red no habla ni persiste — visitante ido')
  }

  // ── 5. Descarte post-settled (nivel watchdog, directo) ─────────────────────
  {
    const chunks: Uint8Array[] = []
    let resolveIdleGate: () => void = () => {}
    const idleGate = new Promise<void>((r) => {
      resolveIdleGate = r
    })
    const wd = createStreamWatchdog({
      idleMs: 100,
      initialIdleMs: 100,
      onIdle: async () => {
        await idleGate // simula la persistencia lenta (ventana del premortem)
        return buildSilenceTextFrames(CANNED)
      },
      onEvent: () => {},
    })
    const writer = wd.stream.writable.getWriter()
    const reader = wd.stream.readable.getReader()
    const enc = new TextEncoder()
    const readAll = (async () => {
      for (;;) {
        const r = await reader.read()
        if (r.done) break
        chunks.push(r.value)
      }
    })()
    await writer.write(enc.encode('antes-del-silencio '))
    await sleep(250) // el timer (100ms) dispara y queda esperando el gate
    await writer.write(enc.encode('REVIVIDO-NO-DEBE-SALIR ')).catch(() => {})
    resolveIdleGate()
    await Promise.race([readAll, sleep(3_000)])
    const out = new TextDecoder().decode(
      chunks.reduce((acc, c) => {
        const merged = new Uint8Array(acc.length + c.length)
        merged.set(acc)
        merged.set(c, acc.length)
        return merged
      }, new Uint8Array(0)),
    )
    assert.ok(out.includes('antes-del-silencio'), 'descarte: lo previo al disparo salio')
    assert.ok(!out.includes('REVIVIDO-NO-DEBE-SALIR'), 'descarte: lo revivido post-settled NO sale')
    assert.ok(out.includes(SILENCE_TEXT_ID), 'descarte: el canned salio igual, despues')
    await writer.close().catch(() => {})
    console.log('  ok 5. Descarte post-settled: chunk revivido no llega, canned si')
  }

  // ── 6. BUG-D: texto en un step ANTERIOR al último — se persiste lo visto ───
  // El más silencioso de la familia: el visitante VE la respuesta (streameada
  // en vivo desde el step 1) pero onFinish llega con text='' (solo último
  // step, ai/dist/index.js:7280/:4203) y se persistía una fila vacía. Acá se
  // reproduce la forma REAL contra el streamText instalado y se verifica que
  // la decisión de producción (pickPersistedAssistantText) rescata lo visto.
  {
    const textAndToolModel: LanguageModelV3 = {
      specificationVersion: 'v3',
      provider: 'probe',
      modelId: 'probe',
      supportedUrls: {},
      doGenerate: () => Promise.reject(new Error('no doGenerate')),
      doStream: (() => {
        let call = 0
        return async () => ({
          stream: new ReadableStream<LanguageModelV3StreamPart>({
            start(c) {
              c.enqueue({ type: 'stream-start', warnings: [] })
              if (call++ === 0) {
                // Step 1: TEXTO (el visitante lo ve en vivo) + tool-call.
                c.enqueue({ type: 'text-start', id: 't0' })
                c.enqueue({ type: 'text-delta', id: 't0', delta: 'texto visto por el visitante' })
                c.enqueue({ type: 'text-end', id: 't0' })
                c.enqueue({ type: 'tool-input-start', id: 'tc0', toolName: 'probe_tool' })
                c.enqueue({ type: 'tool-input-end', id: 'tc0' })
                c.enqueue({ type: 'tool-call', toolCallId: 'tc0', toolName: 'probe_tool', input: '{}' })
                c.enqueue({ type: 'finish', finishReason: { unified: 'tool-calls', raw: 'T' }, usage: USAGE })
              } else {
                // Step 2 (final): cierra SIN texto.
                c.enqueue({ type: 'finish', finishReason: { unified: 'stop', raw: 'S' }, usage: USAGE })
              }
              c.close()
            },
          }),
        })
      })(),
    }

    let accumulated = ''
    let finishText: string | null = null
    const probeTool = tool({
      description: 'sonda',
      inputSchema: z.object({}),
      execute: async () => ({ ok: true }),
    })
    const result = streamText({
      model: textAndToolModel,
      prompt: 'sonda',
      tools: { probe_tool: probeTool },
      stopWhen: stepCountIs(3),
      onChunk: ({ chunk }) => {
        if (chunk.type === 'text-delta') accumulated += chunk.text
      },
      onFinish: ({ text }) => {
        finishText = text
      },
      onError: () => {},
    })
    const response = result.toUIMessageStreamResponse()
    assert.ok(response.body, 'BUG-D: el body existe')
    const drained = await drainBody(response.body, 8_000)
    assert.ok(drained.done, 'BUG-D: el run cierra normal')
    assert.ok(drained.realTextSeen, 'BUG-D: el visitante VIO el texto del step 1')
    // La premisa del bug, verificada contra el SDK real: onFinish.text vacío.
    assert.equal(finishText, '', 'BUG-D premisa: onFinish.text es SOLO el último step (vacío)')
    assert.equal(accumulated, 'texto visto por el visitante', 'BUG-D: el acumulado tiene lo visto')
    // La decisión de producción rescata lo que el visitante vio:
    assert.equal(
      pickPersistedAssistantText(finishText ?? '', accumulated),
      'texto visto por el visitante',
      'BUG-D: se persiste lo VISTO, no la fila vacía',
    )
    // Residuo del premortem: whitespace-only no pisa un acumulado con contenido.
    assert.equal(
      pickPersistedAssistantText('   \n ', accumulated),
      accumulated,
      'BUG-D: text whitespace-only cae al acumulado',
    )
    // Y con texto real en el cierre, ese gana (comportamiento de siempre):
    assert.equal(
      pickPersistedAssistantText('cierre real', accumulated),
      'cierre real',
      'BUG-D: un cierre con texto real se persiste tal cual',
    )
    console.log('  ok 6. BUG-D: onFinish.text vacio con texto visto -> se persiste el acumulado')
  }

  assert.equal(unhandled.length, 0, `unhandled rejections: ${unhandled.join(' | ')}`)
  console.log(
    '\n[MUDEZ invariant] Todas las aserciones pasaron: la forma C5 y la forma NoOutput terminan ' +
      'con el canned VISIBLE y el turno persistido (source watchdog_canned, finishReason ' +
      'watchdog_idle / silent_close), el camino sano queda byte-identico, cancel nunca habla, y ' +
      'los chunks revividos post-settled se descartan.',
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
