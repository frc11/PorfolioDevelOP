/**
 * CONTACT-PATH — Invariantes del camino "que me contacten".
 *
 *   npm run test:contactpath
 *   (o: npx tsx src/modules/chatbot/server/tools/__tests__/confirm-contact-request.invariant.ts)
 *
 * PARTE A — el tool aislado: forma del resultado, idempotencia, resiliencia.
 * PARTE B — **el test que importa**, contra el `streamText` REAL: que una tool
 *           call a `confirm_contact_request` haga arrancar el STEP SIGUIENTE y
 *           que el turno pueda terminar con TEXTO. Los unitarios del tool
 *           aislado NO habrían detectado este bug: la diferencia entre un tool
 *           server-side y uno client-side solo se ve en la interacción con el
 *           pipeline del SDK.
 *
 * Cero DB real, cero red, cero credenciales: el acceso a Prisma se inyecta.
 */
import assert from 'node:assert/strict'
import { streamText, stepCountIs, tool } from 'ai'
import type { LanguageModelV3, LanguageModelV3StreamPart } from '@ai-sdk/provider'
import {
  CONFIRM_CONTACT_REQUEST_DESCRIPTION,
  CONTACT_REQUEST_EVENT_TYPE,
  buildConfirmContactRequestTool,
  confirmContactRequestInputSchema,
  type ContactRequestPersistence,
} from '../confirmContactRequest.ts'
import type { ToolCallContext } from '../types.ts'

const unhandled: string[] = []
process.on('unhandledRejection', (reason: unknown) => {
  unhandled.push(String(reason))
})

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const USAGE = {
  inputTokens: { total: 100, noCache: 100, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 20, text: 20, reasoning: 0 },
}

// ══════════ PARTE A — el tool REAL, con la persistencia inyectada ══════════
//
// Se ejercita `buildConfirmContactRequestTool` de verdad (su `execute` real),
// con un `ContactRequestPersistence` en memoria. Nada de simular la lógica: lo
// que corre es el código que va a producción.

const CTX: ToolCallContext = {
  conversationId: 'conv-1',
  botConfigId: 'bot-1',
  organizationId: 'org-1',
  // C0.1 — botSlug pasó a requerido en ToolCallContext; irrelevante para
  // confirm_contact_request, cualquier valor no-agencia sirve acá.
  botSlug: 'bot-1',
}

/** Persistencia en memoria. `recordThrows` simula la DB caída. */
function makeFakeStore(seed: readonly string[] = [], recordThrows = false) {
  const conversations = new Set<string>(seed)
  const persistence: ContactRequestPersistence = {
    hasRequest: (ctx) => Promise.resolve(conversations.has(ctx.conversationId)),
    record: (ctx) => {
      if (recordThrows) return Promise.reject(new Error('DB caida'))
      conversations.add(ctx.conversationId)
      return Promise.resolve()
    },
  }
  return { conversations, persistence }
}

/** Invoca el `execute` REAL del tool construido por el builder real. */
async function callRealExecute(
  persistence: ContactRequestPersistence,
  ctx: ToolCallContext,
): Promise<{ success: boolean; alreadyRequested: boolean }> {
  const built = buildConfirmContactRequestTool(ctx, persistence)
  assert.ok(built.execute, 'el tool DEBE tener execute: es lo que fuerza el step final')
  const out: unknown = await built.execute(
    { preferredChannel: 'phone' },
    { toolCallId: 'tc1', messages: [] },
  )
  assert.ok(
    typeof out === 'object' && out !== null && 'success' in out && 'alreadyRequested' in out,
    'el execute devuelve { success, alreadyRequested }',
  )
  const typed = out as { success: boolean; alreadyRequested: boolean }
  return { success: typed.success, alreadyRequested: typed.alreadyRequested }
}

/** Provider falso que llama al tool y después escribe texto, y CIERRA normal. */
function makeToolCallingModel(toolName: string): LanguageModelV3 {
  let call = 0
  return {
    specificationVersion: 'v3',
    provider: 'test-provider',
    modelId: 'test-model',
    supportedUrls: {},
    doGenerate: () => Promise.reject(new Error('doGenerate no se usa acá')),
    doStream: () => {
      const isFirstCall = call++ === 0
      const stream = new ReadableStream<LanguageModelV3StreamPart>({
        start(controller) {
          controller.enqueue({ type: 'stream-start', warnings: [] })
          controller.enqueue({
            type: 'response-metadata',
            id: 'r1',
            modelId: 'test-model',
            timestamp: new Date(0),
          })
          if (isFirstCall) {
            // Step 1: SOLO la tool call, sin texto — igual que en producción.
            controller.enqueue({ type: 'tool-input-start', id: 'tc1', toolName })
            controller.enqueue({ type: 'tool-input-end', id: 'tc1' })
            controller.enqueue({
              type: 'tool-call',
              toolCallId: 'tc1',
              toolName,
              input: JSON.stringify({ preferredChannel: 'phone' }),
            })
            controller.enqueue({
              type: 'finish',
              finishReason: { unified: 'tool-calls', raw: 'TOOL' },
              usage: USAGE,
            })
          } else {
            // Step 2: la confirmación en texto. Es lo que hoy NUNCA llegaba.
            controller.enqueue({ type: 'text-start', id: 't1' })
            controller.enqueue({
              type: 'text-delta',
              id: 't1',
              delta: 'Listo, el equipo te contacta hoy.',
            })
            controller.enqueue({ type: 'text-end', id: 't1' })
            controller.enqueue({
              type: 'finish',
              finishReason: { unified: 'stop', raw: 'STOP' },
              usage: USAGE,
            })
          }
          controller.close()
        },
      })
      return Promise.resolve({ stream })
    },
  }
}

interface PipelineOutcome {
  drained: boolean
  text: string
  finishReason: string | undefined
  steps: number
  toolRan: boolean
}

/**
 * Corre el `streamText` REAL.
 *
 * `useRealTool: true` usa **`buildConfirmContactRequestTool` de verdad** — no
 * una réplica — con la persistencia inyectada. Es lo que hace genuina la
 * verificación falla-primero: si alguien le saca el `execute` al tool real,
 * este test falla.
 *
 * `useRealTool: false` es el CONTROL: el mismo tool declarado sin `execute`
 * (client-side), que reproduce el bug de producción.
 *
 * ⚠️ El guard de timeout no es decorativo: si el pipeline se trabara, el
 * `for await` queda pendiente, el event loop se vacía y **Node saldría con
 * código 0 en silencio** (lección de sprints previos).
 */
async function runPipeline(useRealTool: boolean, timeoutMs = 2_500): Promise<PipelineOutcome> {
  let toolRan = false
  let text = ''
  let finishReason: string | undefined
  let steps = 0

  const store = makeFakeStore()
  const contactTool = useRealTool
    ? buildConfirmContactRequestTool(CTX, {
        hasRequest: (ctx) => {
          toolRan = true
          return store.persistence.hasRequest(ctx)
        },
        record: (ctx, input) => store.persistence.record(ctx, input),
      })
    : tool({
        description: CONFIRM_CONTACT_REQUEST_DESCRIPTION,
        inputSchema: confirmContactRequestInputSchema,
        // Sin `execute`: client-side puro, como `offer_handoff_options`.
      })

  const result = streamText({
    model: makeToolCallingModel('confirm_contact_request'),
    prompt: 'prefiero que me contacten ustedes',
    stopWhen: stepCountIs(3),
    tools: { confirm_contact_request: contactTool },
    onFinish: (event) => {
      finishReason = event.finishReason
      steps = event.steps.length
      text = event.text
    },
    onError: () => {},
  })

  let streamedText = ''
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
  let handle: ReturnType<typeof setTimeout> | undefined
  const timedOut = new Promise<void>((resolve) => {
    handle = setTimeout(() => {
      drained = false
      resolve()
    }, timeoutMs)
  })
  try {
    await Promise.race([consume, timedOut])
  } finally {
    if (handle !== undefined) clearTimeout(handle)
  }
  await sleep(120)

  return { drained, text: text || streamedText, finishReason, steps, toolRan }
}

async function main(): Promise<void> {
// ── A1. Primera invocación: registra y lo reporta ───────────────────────────
{
  const store = makeFakeStore()
  const r = await callRealExecute(store.persistence, CTX)
  assert.deepEqual(r, { success: true, alreadyRequested: false })
  assert.equal(store.conversations.size, 1, 'se registró el pedido')
  assert.ok(store.conversations.has('conv-1'))
  assert.equal(CONTACT_REQUEST_EVENT_TYPE, 'handoff.callback', 'espejo de handoff.whatsapp')
}

// ── A2. IDEMPOTENCIA: dos invocaciones seguidas → un solo registro ──────────
{
  const store = makeFakeStore()
  const first = await callRealExecute(store.persistence, CTX)
  const second = await callRealExecute(store.persistence, CTX)
  assert.equal(first.alreadyRequested, false)
  assert.equal(second.alreadyRequested, true, 'la segunda detecta que ya estaba')
  assert.equal(store.conversations.size, 1, 'UN solo registro, no dos')
  assert.equal(
    second.success,
    true,
    '`success: true` aunque ya existiera: para el modelo el pedido ESTÁ registrado, ' +
      'devolver error lo empujaría a reintentar o a disculparse',
  )
}

// ── A3. Aislamiento por conversación: otra conversación sí registra ─────────
{
  const store = makeFakeStore(['conv-1'])
  const r = await callRealExecute(store.persistence, { ...CTX, conversationId: 'conv-2' })
  assert.equal(r.alreadyRequested, false, 'la idempotencia es POR conversación')
  assert.equal(store.conversations.size, 2)
}

// ── A4. Si la DB falla, el tool NO relanza ─────────────────────────────────
// Un fallo de registro no puede dejar al visitante sin respuesta: el lead ya
// está en ChatbotLead, que es lo que habilita el contacto.
{
  const store = makeFakeStore([], true)
  const r = await callRealExecute(store.persistence, CTX)
  assert.equal(r.success, true, 'devuelve success igual — el turno tiene que cerrar con texto')
  assert.equal(store.conversations.size, 0, 'no se registró nada, pero no explotó')
}

// ── A5. El schema acepta el default y rechaza un canal inventado ────────────
{
  const withDefault = confirmContactRequestInputSchema.parse({})
  assert.equal(withDefault.preferredChannel, 'any', 'sin dato explícito cae en "any"')
  assert.equal(confirmContactRequestInputSchema.parse({ preferredChannel: 'phone' }).preferredChannel, 'phone')
  assert.equal(
    confirmContactRequestInputSchema.safeParse({ preferredChannel: 'telepatia' }).success,
    false,
    'un canal inventado no pasa',
  )
}

// ══════════ PARTE B — contra el `streamText` REAL ══════════

// ── B1. EL TEST QUE IMPORTA: el tool REAL → arranca el step 2 → hay TEXTO ──
{
  const r = await runPipeline(true)
  assert.equal(r.drained, true, 'el stream completa')
  assert.equal(r.toolRan, true, 'el execute REAL del tool corrió')
  assert.ok(r.steps >= 2, `ARRANCÓ EL STEP SIGUIENTE (steps=${r.steps})`)
  assert.ok(r.text.length > 0, `el turno termina con TEXTO (${r.text.length} chars)`)
  assert.equal(r.text, 'Listo, el equipo te contacta hoy.')
  assert.equal(
    r.finishReason,
    'stop',
    'cierra con "stop", no con "tool-calls" — que era el síntoma del bug',
  )
}

// ── B2. CONTROL: el mismo tool SIN `execute` reproduce el bug ──────────────
// Es la diferencia estructural entre `show_whatsapp_handoff` (server-side, que
// funcionaba) y `offer_handoff_options` (client-side, que dejaba el turno mudo).
{
  const r = await runPipeline(false)
  assert.equal(r.toolRan, false, 'sin execute el tool no corre nada server-side')
  assert.equal(
    r.steps,
    1,
    'NO arranca el step siguiente: el SDK exige output de las tool calls para continuar',
  )
  assert.equal(r.text, '', 'el turno cierra SIN TEXTO — exactamente el bug de producción')
  assert.equal(r.finishReason, 'tool-calls', 'y con finishReason "tool-calls", como en el log')
}

// ── Cero unhandled rejections ──────────────────────────────────────────────
await sleep(150)
assert.deepEqual(unhandled, [], `unhandled rejections detectadas: ${unhandled.join(' | ')}`)

console.log(
  '✓ confirm-contact-request invariants OK: el tool es idempotente por conversación, no relanza ' +
    'si la DB falla, y —contra el streamText REAL— su `execute` hace arrancar el step siguiente ' +
    'para que el turno cierre con texto y finishReason "stop"; el mismo tool sin `execute` ' +
    'reproduce el bug (1 step, cero texto, finishReason "tool-calls").',
)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
