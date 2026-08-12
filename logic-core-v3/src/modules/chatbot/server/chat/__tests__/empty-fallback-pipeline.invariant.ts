/**
 * DEADLOCK-FINISH-STEP — El test que faltaba hace tres sprints.
 *
 *   npm run test:emptyfallback
 *   (o: npx tsx src/modules/chatbot/server/chat/__tests__/empty-fallback-pipeline.invariant.ts)
 *
 * POR QUÉ EXISTE. `createEmptyResponseFallbackTransform` retenía el chunk
 * `finish-step` un chunk. Los tests unitarios del transform NO lo detectaron
 * porque lo miraban AISLADO: el chunk salía, solo que más tarde, y eso parecía
 * inofensivo ("retrasado, nunca perdido"). **El bug solo existe en la
 * interacción con el pipeline del SDK**, donde produce una espera circular:
 *
 *   inner transform encola `finish-step` (`ai/dist/index.js:8007`) y hace
 *   `await stepFinish.promise` (`:8022`) → `stepFinish.resolve()` vive en el
 *   `eventProcessor` bajo `part.type === 'finish-step'` (`:7253`) → nuestros
 *   transforms se aplican EN EL MEDIO (`:7396-7405`) y lo tenían retenido →
 *   se liberaba con el chunk siguiente (que no llega si el SDK no avanza) o en
 *   nuestro `flush` (que corre al cerrar el stream de arriba, y ese cierre está
 *   DESPUÉS del await bloqueado).
 *
 * Costó tres sprints de arreglar la capa equivocada. Este test corre contra el
 * `streamText` REAL, con un provider falso SANO (cierra normal, con `usage`),
 * y queda en el repo como regresión permanente.
 *
 * REGLA QUE PINNEA: un transform de usuario puede AGREGAR chunks, pero jamás
 * demorar uno del SDK. Cada chunk se reenvía en la misma invocación de
 * `transform()`.
 *
 * Cero DB, cero red, cero credenciales.
 */
import assert from 'node:assert/strict'
import { streamText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import type { LanguageModelV3, LanguageModelV3StreamPart } from '@ai-sdk/provider'
import type { TextStreamPart, ToolSet } from 'ai'
import {
  EMPTY_FALLBACK_TEXT_ID,
  CARD_CONNECTOR_TEXT_ID,
  createEmptyResponseFallbackTransform,
  type EmptyFallbackInjectionKind,
} from '../reconcile.ts'

const unhandled: string[] = []
process.on('unhandledRejection', (reason: unknown) => {
  unhandled.push(String(reason))
})

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** Tokens reales medidos en producción, para que el assert sea reconocible. */
const USAGE = {
  inputTokens: { total: 6280, noCache: 6280, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 202, text: 202, reasoning: 0 },
}

interface FakeModelOptions {
  /** El step 1 hace una tool call en vez de emitir texto. */
  withToolCall?: boolean
  /** Ningún step emite texto (respuesta vacía → debe disparar el fallback). */
  emitNoText?: boolean
}

/**
 * Provider SANO: emite y CIERRA NORMAL. Es el comportamiento real de Gemini,
 * confirmado en prod (`provider.stream_chunks reason:"natural" elapsedMs:659`
 * con `sawFinishChunk:true` y usage completo). El provider nunca fue el
 * problema — por eso el test no simula ningún cuelgue del provider.
 */
function makeHealthyModel(options: FakeModelOptions = {}): LanguageModelV3 {
  let callCount = 0
  return {
    specificationVersion: 'v3',
    provider: 'test-provider',
    modelId: 'test-model',
    supportedUrls: {},
    doGenerate: () => Promise.reject(new Error('doGenerate no se usa acá')),
    doStream: () => {
      const isFirstCall = callCount++ === 0
      const stream = new ReadableStream<LanguageModelV3StreamPart>({
        start(controller) {
          controller.enqueue({ type: 'stream-start', warnings: [] })
          controller.enqueue({
            type: 'response-metadata',
            id: 'r1',
            modelId: 'test-model',
            timestamp: new Date(0),
          })
          if (options.withToolCall && isFirstCall) {
            // Step intermedio: SOLO tool call, sin texto. Es correcto que no
            // tenga texto — no debe disparar el fallback.
            controller.enqueue({ type: 'tool-input-start', id: 'tc1', toolName: 'probe_tool' })
            controller.enqueue({ type: 'tool-input-end', id: 'tc1' })
            controller.enqueue({
              type: 'tool-call',
              toolCallId: 'tc1',
              toolName: 'probe_tool',
              input: JSON.stringify({ q: 'x' }),
            })
            controller.enqueue({
              type: 'finish',
              finishReason: { unified: 'tool-calls', raw: 'TOOL' },
              usage: USAGE,
            })
          } else if (options.emitNoText) {
            controller.enqueue({
              type: 'finish',
              finishReason: { unified: 'stop', raw: 'STOP' },
              usage: USAGE,
            })
          } else {
            controller.enqueue({ type: 'text-start', id: 't1' })
            controller.enqueue({ type: 'text-delta', id: 't1', delta: 'hola mundo' })
            controller.enqueue({ type: 'text-end', id: 't1' })
            controller.enqueue({
              type: 'finish',
              finishReason: { unified: 'stop', raw: 'STOP' },
              usage: USAGE,
            })
          }
          // CIERRA NORMAL. El provider está sano.
          controller.close()
        },
      })
      return Promise.resolve({ stream })
    },
  }
}

interface RunOutcome {
  drained: boolean
  onFinishFired: boolean
  stepFinishCount: number
  stepsLength: number
  inputTokens?: number
  outputTokens?: number
  toolRan: boolean
  streamedText: string
  fallbackInjected: boolean
}

/**
 * Corre el `streamText` REAL con nuestro transform puesto.
 *
 * ⚠️ El `timeoutMs` NO es decorativo: si el pipeline se traba, el `for await`
 * queda pendiente, el event loop de Node se vacía y **el proceso saldría con
 * código 0 en silencio** — el test "pasaría" sin verificar nada. La carrera
 * contra un timer convierte el cuelgue en un `drained: false` explícito.
 */
async function runPipeline(
  modelOptions: FakeModelOptions,
  useTransform: boolean,
  timeoutMs = 2_500,
): Promise<RunOutcome> {
  let onFinishFired = false
  let stepFinishCount = 0
  let stepsLength = -1
  let inputTokens: number | undefined
  let outputTokens: number | undefined
  let toolRan = false
  let streamedText = ''
  let fallbackInjected = false

  const result = streamText({
    model: makeHealthyModel(modelOptions),
    prompt: 'test',
    stopWhen: stepCountIs(3),
    ...(modelOptions.withToolCall
      ? {
          tools: {
            probe_tool: tool({
              description: 'probe',
              inputSchema: z.object({ q: z.string() }),
              execute: () => {
                toolRan = true
                return Promise.resolve({ ok: true })
              },
            }),
          },
        }
      : {}),
    ...(useTransform
      ? {
          experimental_transform: createEmptyResponseFallbackTransform('FALLBACK-CANNED', () => {
            fallbackInjected = true
          }),
        }
      : {}),
    onStepFinish: () => {
      stepFinishCount += 1
    },
    onFinish: (event) => {
      onFinishFired = true
      stepsLength = event.steps.length
      inputTokens = event.totalUsage.inputTokens
      outputTokens = event.totalUsage.outputTokens
    },
    onError: () => {
      // No debe tumbar el test.
    },
  })

  const consume = (async () => {
    try {
      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') streamedText += part.text
      }
    } catch {
      // idem
    }
  })()

  let drained = true
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  const timedOut = new Promise<void>((resolve) => {
    timeoutHandle = setTimeout(() => {
      drained = false
      resolve()
    }, timeoutMs)
  })
  try {
    await Promise.race([consume, timedOut])
  } finally {
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
  }
  await sleep(120)

  return {
    drained,
    onFinishFired,
    stepFinishCount,
    stepsLength,
    inputTokens,
    outputTokens,
    toolRan,
    streamedText,
    fallbackInjected,
  }
}

/** Corre SOLO el transform, aislado, y devuelve los chunks de salida. */
async function runTransformOnly(
  input: readonly TextStreamPart<ToolSet>[],
  cardConnectors?: ReadonlyMap<string, string>,
): Promise<{ out: TextStreamPart<ToolSet>[]; injected: boolean; kinds: EmptyFallbackInjectionKind[] }> {
  let injected = false
  const kinds: EmptyFallbackInjectionKind[] = []
  const factory = createEmptyResponseFallbackTransform<ToolSet>(
    'FALLBACK-CANNED',
    (kind) => {
      injected = true
      kinds.push(kind)
    },
    cardConnectors,
  )
  const transform = factory({ tools: {}, stopStream: () => {} })
  const source = new ReadableStream<TextStreamPart<ToolSet>>({
    start(controller) {
      for (const chunk of input) controller.enqueue(chunk)
      controller.close()
    },
  })
  const out: TextStreamPart<ToolSet>[] = []
  const reader = source.pipeThrough(transform).getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) out.push(value)
  }
  return { out, injected, kinds }
}

async function main(): Promise<void> {
// ══════════ PARTE A — contra el `streamText` REAL (el test que faltaba) ══════

// ── A1. Con nuestro transform, el pipeline COMPLETA ──────────────────────────
// Este es EL assert. Con la versión que retenía `finish-step`, todo esto era
// `false`/`0`/`-1`/`undefined` y el stream quedaba colgado.
{
  const r = await runPipeline({}, true)
  assert.equal(r.drained, true, 'el stream se drena por completo (no hay deadlock)')
  assert.equal(r.onFinishFired, true, 'onFinish DISPARA')
  assert.ok(r.stepFinishCount > 0, `onStepFinish dispara (fueron ${r.stepFinishCount})`)
  assert.ok(r.stepsLength > 0, `steps.length > 0 (fue ${r.stepsLength})`)
  assert.equal(r.inputTokens, 6280, 'el usage del chunk finish llega — el costo deja de ser 0')
  assert.equal(r.outputTokens, 202)
  assert.equal(r.streamedText, 'hola mundo', 'el texto sale intacto')
  assert.equal(r.fallbackInjected, false, 'con texto real no se inyecta fallback')
}

// ── A2. PARIDAD: con y sin el transform, el pipeline se comporta igual ───────
// El transform no puede cambiar el resultado del pipeline. Si algún día vuelve
// a retener algo, esta comparación lo delata.
{
  const withT = await runPipeline({}, true)
  const withoutT = await runPipeline({}, false)
  assert.deepEqual(
    {
      drained: withT.drained,
      onFinishFired: withT.onFinishFired,
      steps: withT.stepsLength,
      inputTokens: withT.inputTokens,
      outputTokens: withT.outputTokens,
    },
    {
      drained: withoutT.drained,
      onFinishFired: withoutT.onFinishFired,
      steps: withoutT.stepsLength,
      inputTokens: withoutT.inputTokens,
      outputTokens: withoutT.outputTokens,
    },
    'el pipeline se comporta IDÉNTICO con y sin el transform',
  )
}

// ── A3. Con una tool call, el STEP 2 arranca ────────────────────────────────
// Es el síntoma más caro en producción: el tool corría (el lead se guardaba)
// pero el step siguiente nunca arrancaba, así que el bot no respondía nada.
{
  const r = await runPipeline({ withToolCall: true }, true)
  assert.equal(r.drained, true)
  assert.equal(r.toolRan, true, 'el tool se ejecuta')
  assert.equal(r.onFinishFired, true, 'onFinish dispara')
  assert.ok(
    r.stepsLength >= 2,
    `EL STEP 2 ARRANCA (steps=${r.stepsLength}) — el bot responde después de capturar el lead`,
  )
  assert.equal(r.streamedText, 'hola mundo', 'el texto del step 2 llega al visitante')
  assert.equal(
    r.fallbackInjected,
    false,
    'un step intermedio SIN texto (solo tool call) NO dispara un fallback espurio',
  )
}

// ── A4. Respuesta vacía de verdad: el fallback se inyecta igual ─────────────
{
  const r = await runPipeline({ emitNoText: true }, true)
  assert.equal(r.drained, true, 'sigue sin haber deadlock en el camino del fallback')
  assert.equal(r.onFinishFired, true)
  assert.equal(r.fallbackInjected, true, 'run sin texto útil → se inyecta el fallback')
  assert.equal(
    r.streamedText,
    'FALLBACK-CANNED',
    'el visitante VE el texto de derivación en vivo, por el stream real',
  )
}

// ══════════ PARTE B — el transform aislado ══════════

const START = { type: 'start' } as const
const START_STEP = { type: 'start-step', request: {}, warnings: [] } as const
const FINISH_STEP = {
  type: 'finish-step',
  finishReason: 'stop',
  usage: {
    inputTokens: 1,
    outputTokens: 1,
    totalTokens: 2,
    inputTokenDetails: {},
    outputTokenDetails: {},
  },
  response: { id: 'r', modelId: 'm', timestamp: new Date(0) },
  providerMetadata: undefined,
} as unknown as TextStreamPart<ToolSet>
const FINISH = {
  type: 'finish',
  finishReason: 'stop',
  totalUsage: {
    inputTokens: 1,
    outputTokens: 1,
    totalTokens: 2,
    inputTokenDetails: {},
    outputTokenDetails: {},
  },
} as unknown as TextStreamPart<ToolSet>
const textParts = (text: string): TextStreamPart<ToolSet>[] => [
  { type: 'text-start', id: 't1' } as unknown as TextStreamPart<ToolSet>,
  { type: 'text-delta', id: 't1', text } as unknown as TextStreamPart<ToolSet>,
  { type: 'text-end', id: 't1' } as unknown as TextStreamPart<ToolSet>,
]
// BLOQUE VOZ — tool-call como lo ve el transform (TextStreamPart, campo toolName).
const toolCall = (toolName: string): TextStreamPart<ToolSet> =>
  ({
    type: 'tool-call',
    toolCallId: `tc-${toolName}`,
    toolName,
    input: {},
  }) as unknown as TextStreamPart<ToolSet>
// Mapa de conectores DE PRUEBA (el test pinnea la MECÁNICA; el copy real vive
// en CARD_RENDERING_TOOL_CONNECTORS de getTools.ts y lo pinnea test:mudez).
const CARD_CONNECTORS_TEST: ReadonlyMap<string, string> = new Map([
  ['offer_handoff_options', 'CONECTOR-OFFER'],
  ['show_whatsapp_handoff', 'CONECTOR-WA'],
])
const deltaOf = (out: readonly TextStreamPart<ToolSet>[]): { id: string; text: string } => {
  const d = out.find((c) => c.type === 'text-delta')
  assert.ok(d && d.type === 'text-delta', 'hay exactamente un text-delta inyectado')
  return { id: String(d.id), text: String(d.text) }
}

// ── B1. `finish-step` sale en la MISMA posición en que entra ────────────────
// La propiedad estructural que evita el deadlock. Con la versión vieja,
// `finish-step` salía DESPUÉS del chunk siguiente.
{
  const input = [
    START,
    START_STEP,
    ...textParts('hola'),
    FINISH_STEP,
    FINISH,
  ] as TextStreamPart<ToolSet>[]
  const { out, injected } = await runTransformOnly(input)
  assert.equal(injected, false)
  assert.deepEqual(
    out.map((c) => c.type),
    input.map((c) => c.type),
    'con texto útil el stream pasa IDÉNTICO, en el mismo orden y sin diferir nada',
  )
  const idxFinishStep = out.findIndex((c) => c.type === 'finish-step')
  const idxFinish = out.findIndex((c) => c.type === 'finish')
  assert.ok(
    idxFinishStep < idxFinish && idxFinishStep === input.length - 2,
    '`finish-step` conserva su posición exacta: no se reordena ni se demora',
  )
}

// ── B2. Respuesta vacía: inyecta ANTES del `finish`, sin retener ────────────
{
  const { out, injected } = await runTransformOnly([
    START,
    START_STEP,
    FINISH_STEP,
    FINISH,
  ] as TextStreamPart<ToolSet>[])
  assert.equal(injected, true)
  assert.deepEqual(
    out.map((c) => c.type),
    ['start', 'start-step', 'finish-step', 'text-start', 'text-delta', 'text-end', 'finish'],
    'el fallback se encola antes del `finish`, y `finish-step` sigue en su lugar original',
  )
  const delta = out.find((c) => c.type === 'text-delta')
  assert.ok(delta && delta.type === 'text-delta' && delta.text === 'FALLBACK-CANNED')
  assert.ok(delta && delta.type === 'text-delta' && delta.id === EMPTY_FALLBACK_TEXT_ID)
}

// ── B3. Multi-step con step intermedio sin texto: sin fallback espurio ──────
{
  const { out, injected } = await runTransformOnly([
    START,
    START_STEP,
    FINISH_STEP, // step 1: solo tool call, sin texto — correcto que no tenga
    START_STEP,
    ...textParts('respuesta final'),
    FINISH_STEP,
    FINISH,
  ] as TextStreamPart<ToolSet>[])
  assert.equal(injected, false, 'el texto del step 2 evita el fallback espurio')
  assert.equal(out.filter((c) => c.type === 'finish-step').length, 2, 'los dos finish-step pasan')
}

// ── B4. Multi-step SIN texto en ningún step: inyecta UNA vez, al final ──────
{
  const { out, injected } = await runTransformOnly([
    START,
    START_STEP,
    FINISH_STEP,
    START_STEP,
    FINISH_STEP,
    FINISH,
  ] as TextStreamPart<ToolSet>[])
  assert.equal(injected, true)
  assert.equal(out.filter((c) => c.type === 'text-delta').length, 1, 'una sola inyección')
  assert.equal(out[out.length - 1].type, 'finish', 'el `finish` sigue siendo el último chunk')
}

// ── B5. Stream que muere sin `finish` (error/abort): NO inyecta y no retiene ─
{
  const input = [START, START_STEP, ...textParts(''), FINISH_STEP] as TextStreamPart<ToolSet>[]
  const { out, injected } = await runTransformOnly(input)
  assert.equal(injected, false, 'sin `finish` no se inyecta (ese caso es compensación)')
  assert.deepEqual(
    out.map((c) => c.type),
    input.map((c) => c.type),
    'todo sale igual: NADA quedó retenido esperando un flush',
  )
}

// ── B6. Ningún chunk estructural queda retenido, en ninguna combinación ─────
// Barrido: para cada prefijo del stream, lo que entró tiene que haber salido.
{
  const full = [
    START,
    START_STEP,
    ...textParts('x'),
    FINISH_STEP,
    START_STEP,
    FINISH_STEP,
    FINISH,
  ] as TextStreamPart<ToolSet>[]
  for (let i = 1; i <= full.length; i += 1) {
    const prefix = full.slice(0, i)
    const { out } = await runTransformOnly(prefix)
    const inTypes = prefix.map((c) => c.type)
    const outTypes = out.map((c) => c.type)
    // El fallback puede AGREGAR chunks; nunca puede faltar ninguno de entrada.
    for (const t of inTypes) {
      const inCount = inTypes.filter((x) => x === t).length
      const outCount = outTypes.filter((x) => x === t).length
      assert.ok(
        outCount >= inCount,
        `prefijo de ${i} chunks: entraron ${inCount} "${t}" y salieron ${outCount} — se retuvo alguno`,
      )
    }
  }
}

// ══════════ PARTE C — BLOQUE VOZ: el conector de tarjeta ══════════
// Cuando el run cierra en un tool CARDEADO sin texto, la tarjeta ES la
// respuesta: se inyecta el conector neutral, no la disculpa. Misma mecánica
// sin retención (la decisión sigue en el chunk terminal `finish`).

// ── C1. Run que cierra en tool cardeada: conector, no disculpa ──────────────
{
  const { out, injected, kinds } = await runTransformOnly(
    [
      START,
      START_STEP,
      toolCall('offer_handoff_options'),
      FINISH_STEP,
      FINISH,
    ] as TextStreamPart<ToolSet>[],
    CARD_CONNECTORS_TEST,
  )
  assert.equal(injected, true, 'C1: run sin texto → inyecta')
  assert.deepEqual(kinds, ['card_connector'], 'C1: el kind es card_connector')
  const delta = deltaOf(out)
  assert.equal(delta.text, 'CONECTOR-OFFER', 'C1: el texto es el conector del tool, NO la disculpa')
  assert.equal(delta.id, CARD_CONNECTOR_TEXT_ID, 'C1: id propio del conector (greppable en el wire)')
  assert.equal(out[out.length - 1].type, 'finish', 'C1: el `finish` sigue siendo el último chunk')
  const idxFinishStep = out.findIndex((c) => c.type === 'finish-step')
  assert.ok(idxFinishStep !== -1 && idxFinishStep < out.findIndex((c) => c.type === 'text-start'),
    'C1: `finish-step` conserva su posición — nada se retuvo')
}

// ── C2. Run que cierra en tool NO cardeada: la disculpa de siempre ──────────
{
  const { out, injected, kinds } = await runTransformOnly(
    [START, START_STEP, toolCall('capture_lead'), FINISH_STEP, FINISH] as TextStreamPart<ToolSet>[],
    CARD_CONNECTORS_TEST,
  )
  assert.equal(injected, true)
  assert.deepEqual(kinds, ['derivation'], 'C2: capture_lead no es cardeado → derivación')
  const delta = deltaOf(out)
  assert.equal(delta.text, 'FALLBACK-CANNED', 'C2: sin tarjeta en pantalla, la disculpa es correcta')
  assert.equal(delta.id, EMPTY_FALLBACK_TEXT_ID)
}

// ── C3. Tool cardeada + texto real después: passthrough puro, cero inyección ─
{
  const input = [
    START,
    START_STEP,
    toolCall('offer_handoff_options'),
    FINISH_STEP,
    START_STEP,
    ...textParts('cierre real'),
    FINISH_STEP,
    FINISH,
  ] as TextStreamPart<ToolSet>[]
  const { out, injected } = await runTransformOnly(input, CARD_CONNECTORS_TEST)
  assert.equal(injected, false, 'C3: con texto real no se inyecta nada')
  assert.deepEqual(
    out.map((c) => c.type),
    input.map((c) => c.type),
    'C3: paridad exacta del camino con texto',
  )
}

// ── C4. La memoria del tool cardeado NO se resetea entre steps — a propósito ─
// (pregunta explícita del cierre de Fase 0, en sus dos direcciones)
{
  // a) Tarjeta en step 1, tool NO cardeado en step 2, cero texto: la tarjeta
  //    sigue en pantalla (el widget renderiza el acumulado de toolCalls del
  //    mensaje) → conector de la tarjeta, no disculpa.
  const a = await runTransformOnly(
    [
      START,
      START_STEP,
      toolCall('show_whatsapp_handoff'),
      FINISH_STEP,
      START_STEP,
      toolCall('capture_lead'),
      FINISH_STEP,
      FINISH,
    ] as TextStreamPart<ToolSet>[],
    CARD_CONNECTORS_TEST,
  )
  assert.deepEqual(a.kinds, ['card_connector'], 'C4a: un tool no cardeado posterior no borra la tarjeta')
  assert.equal(deltaOf(a.out).text, 'CONECTOR-WA', 'C4a: el conector es el de la tarjeta visible')

  // b) capture_lead en step 1 y step 2 cierra sin tool ni texto: capture_lead
  //    JAMÁS setea el conector (no está en el mapa) → derivación. Es el
  //    escenario exacto de la pregunta: nada "viejo" queda apuntado.
  const b = await runTransformOnly(
    [
      START,
      START_STEP,
      toolCall('capture_lead'),
      FINISH_STEP,
      START_STEP,
      FINISH_STEP,
      FINISH,
    ] as TextStreamPart<ToolSet>[],
    CARD_CONNECTORS_TEST,
  )
  assert.deepEqual(b.kinds, ['derivation'], 'C4b: capture_lead nunca deja conector viejo apuntado')
  assert.equal(deltaOf(b.out).text, 'FALLBACK-CANNED')
}

// ── C5. Sin mapa (callers legacy): tool cardeada igual cae a derivación ─────
{
  const { kinds, out } = await runTransformOnly([
    START,
    START_STEP,
    toolCall('offer_handoff_options'),
    FINISH_STEP,
    FINISH,
  ] as TextStreamPart<ToolSet>[])
  assert.deepEqual(kinds, ['derivation'], 'C5: sin mapa el comportamiento previo queda intacto')
  assert.equal(deltaOf(out).text, 'FALLBACK-CANNED')
}

// ── Cero unhandled rejections ───────────────────────────────────────────────
await sleep(150)
assert.deepEqual(unhandled, [], `unhandled rejections detectadas: ${unhandled.join(' | ')}`)

console.log(
  '✓ empty-fallback-pipeline invariants OK: contra el streamText REAL el pipeline completa ' +
    '(onFinish, onStepFinish, steps y usage), el step 2 arranca tras una tool call, el fallback ' +
    'se inyecta solo en runs realmente vacíos, y el transform no retiene NINGÚN chunk — ' +
    '`finish-step` conserva su posición exacta.',
)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
