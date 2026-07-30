/**
 * ONF-1 — Invariantes del reconcile transaccional del onFinish. Corre SIN DB
 * ni server:
 *
 *   npm run test:onf1
 *   (o: npx tsx src/modules/chatbot/server/chat/__tests__/onf1-reconcile.invariant.ts)
 *
 * Cubre las piezas PURAS de reconcile.ts + un modelo ejecutable de las dos
 * semánticas que viven en SQL/Prisma (para pinnear la INTENCIÓN — la garantía
 * física la dan el UPDATE condicional y el $transaction de Postgres, misma
 * mecánica ya probada en prod por reserveConversation):
 *
 *   1. Tabla de decisión de compensación de cupo (cuándo se devuelve la reserva).
 *   2. Guard once-only por request (dos hooks concurrentes → 1 solo release).
 *   3. Modelo del release condicional: N releases concurrentes nunca dejan el
 *      contador negativo ni pierden updates.
 *   4. Dedup del ASSISTANT en el retry de persistencia (commit-ack perdido).
 *   5. Transform de respuesta vacía: inyecta SOLO en run sin texto útil; con
 *      texto útil el stream pasa IDÉNTICO (paridad camino feliz); nunca
 *      inyecta en un stream que murió sin `finish`.
 *   6. Modelo de atomicidad: si un write de la tx falla, no queda estado parcial.
 */
import assert from 'node:assert/strict'
import type { TextStreamPart, ToolSet } from 'ai'
import {
  ASSISTANT_PERSIST_DEDUP_WINDOW_MS,
  EMPTY_FALLBACK_TEXT_ID,
  PERSIST_TX_MAX_ATTEMPTS,
  PERSIST_TX_RETRY_BACKOFF_MS,
  buildEmptyFallbackMessage,
  createEmptyResponseFallbackTransform,
  shouldCompensateQuota,
  shouldSkipAssistantPersist,
  type CompensationTrigger,
} from '../reconcile.ts'
import type { TailMessage } from '../dedup.ts'

// Sin top-level await (paquete CJS, mismo criterio que el resto de los
// invariant): todo corre dentro de main(), fallo = exit 1.
async function main(): Promise<void> {
// ── 1. Tabla de decisión de compensación ──────────────────────────────────────
{
  const base = { alreadyCompensated: false, firstTokenDelivered: false, toolCallCount: 0 }

  // Stream muerto ANTES del primer chunk útil → se devuelve.
  assert.equal(shouldCompensateQuota({ ...base, trigger: 'stream_error' }), true)
  assert.equal(shouldCompensateQuota({ ...base, trigger: 'stream_abort' }), true)
  // Stream muerto DESPUÉS de entregar algo (texto parcial o tool) → se cobra.
  assert.equal(
    shouldCompensateQuota({ ...base, trigger: 'stream_error', firstTokenDelivered: true }),
    false,
    'entrega parcial → el cupo se cobra',
  )
  assert.equal(
    shouldCompensateQuota({ ...base, trigger: 'stream_abort', firstTokenDelivered: true }),
    false,
  )

  // Respuesta vacía sin tools → se devuelve. Con tools (capture_lead) → se cobra.
  assert.equal(shouldCompensateQuota({ ...base, trigger: 'empty_response' }), true)
  assert.equal(
    shouldCompensateQuota({ ...base, trigger: 'empty_response', toolCallCount: 1 }),
    false,
    'tool ejecutada = valor entregado → se cobra',
  )
  // En empty_response manda toolCallCount, NO ttfb: el propio fallback
  // inyectado puede haber marcado ttfb vía onChunk.
  assert.equal(
    shouldCompensateQuota({ ...base, trigger: 'empty_response', firstTokenDelivered: true }),
    true,
    'empty_response ignora firstTokenDelivered (el fallback inyectado marca ttfb)',
  )

  // Nunca se llamó al LLM / nunca salió el stream → se devuelve siempre.
  assert.equal(shouldCompensateQuota({ ...base, trigger: 'no_user_message' }), true)
  assert.equal(shouldCompensateQuota({ ...base, trigger: 'unhandled_error' }), true)
  assert.equal(
    shouldCompensateQuota({
      ...base,
      trigger: 'unhandled_error',
      firstTokenDelivered: true,
      toolCallCount: 3,
    }),
    true,
    'unhandled_error compensa sin importar el resto del contexto',
  )

  // Guard once-only: con alreadyCompensated, NINGÚN trigger vuelve a compensar.
  const triggers: CompensationTrigger[] = [
    'stream_error',
    'stream_abort',
    'empty_response',
    'no_user_message',
    'unhandled_error',
  ]
  for (const trigger of triggers) {
    assert.equal(
      shouldCompensateQuota({ ...base, trigger, alreadyCompensated: true }),
      false,
      `alreadyCompensated bloquea ${trigger}`,
    )
  }
}

// ── 2. Once-only por request: dos hooks "concurrentes" → 1 solo release ──────
// Replica el patrón exacto del handler: flag marcado ANTES del await del
// release. Los hooks del request corren en el mismo event loop → entre el
// check y el set no hay interleaving posible.
{
  let alreadyCompensated = false
  let releases = 0
  const compensate = async (trigger: CompensationTrigger): Promise<void> => {
    if (
      !shouldCompensateQuota({
        alreadyCompensated,
        trigger,
        firstTokenDelivered: false,
        toolCallCount: 0,
      })
    ) {
      return
    }
    alreadyCompensated = true // ANTES del await — igual que el handler
    await Promise.resolve() // simula el round-trip del release
    releases += 1
  }
  // onError y onFinish-vacío disparando "a la vez" (mismo tick).
  await Promise.all([compensate('stream_error'), compensate('empty_response')])
  assert.equal(releases, 1, 'dos hooks del mismo request → exactamente 1 release')
}

// ── 3. Modelo del release condicional (semántica del SQL) ─────────────────────
// El UPDATE `SET count = count - 1 WHERE count > 0` es una sola sentencia
// atómica: no hay lectura previa que perder. Este modelo pinnea esa semántica:
// cada release "toca" el contador una sola vez, condicionado, nunca negativo.
{
  const conditionalRelease = (row: { count: number }): boolean => {
    // Modelo de la sentencia atómica: condición y decremento son UN paso.
    if (row.count > 0) {
      row.count -= 1
      return true
    }
    return false
  }

  // Dos compensaciones legítimas (dos requests distintos) sobre count=5 → 3.
  const rowA = { count: 5 }
  assert.equal(conditionalRelease(rowA), true)
  assert.equal(conditionalRelease(rowA), true)
  assert.equal(rowA.count, 3, 'dos releases legítimos decrementan exactamente 2')

  // N releases > count → el contador clava en 0, jamás negativo.
  const rowB = { count: 1 }
  const results = [conditionalRelease(rowB), conditionalRelease(rowB), conditionalRelease(rowB)]
  assert.deepEqual(results, [true, false, false], 'solo el primero libera; el resto no-op')
  assert.equal(rowB.count, 0, 'el contador nunca queda negativo')
}

// ── 3.b Modelo de la compensación EN PAREJA (release + discard atómicos) ──────
// compensateNewConversationReservation: el release y el descarte de la fila
// entran JUNTOS o no entra ninguno, y el discard es condicional a "sin
// ASSISTANT persistido". Pinnea el fix del hallazgo mayor del review: release
// con fila viva = conversación revivida gratis por el retry del widget;
// discard sin release = doble cobro al recrear. Y si otro request ya entregó
// un turno en la fila, la compensación entera se omite (el cobro queda).
{
  interface Store {
    quota: { count: number }
    conversations: Map<string, { hasAssistant: boolean }>
  }
  const compensateAtomic = (store: Store, conversationId: string): boolean => {
    const conv = store.conversations.get(conversationId)
    // Delete condicional: solo si la fila existe y NO tiene ASSISTANT.
    if (!conv || conv.hasAssistant) return false // count 0 → sin release, cobro queda
    store.conversations.delete(conversationId)
    if (store.quota.count > 0) store.quota.count -= 1
    return true
  }

  // Caso base: fila nueva sin ASSISTANT → discard + release, ambos.
  const s1: Store = { quota: { count: 3 }, conversations: new Map([['c1', { hasAssistant: false }]]) }
  assert.equal(compensateAtomic(s1, 'c1'), true)
  assert.equal(s1.quota.count, 2, 'cupo devuelto')
  assert.equal(s1.conversations.has('c1'), false, 'fila descartada — el retry recrea y RE-RESERVA')

  // Carrera: otro request ya entregó un turno en la fila → NADA se toca.
  const s2: Store = { quota: { count: 3 }, conversations: new Map([['c1', { hasAssistant: true }]]) }
  assert.equal(compensateAtomic(s2, 'c1'), false)
  assert.equal(s2.quota.count, 3, 'el cobro queda (conversación entregada)')
  assert.equal(s2.conversations.has('c1'), true, 'historia entregada jamás se borra')

  // Doble compensación (segunda pasada sobre fila ya descartada) → no-op total.
  assert.equal(compensateAtomic(s1, 'c1'), false)
  assert.equal(s1.quota.count, 2, 'sin doble release')
}

// ── 4. Dedup del ASSISTANT en el retry (commit-ack perdido) ───────────────────
// El handler alimenta esta decisión con una query DIRIGIDA (conversationId +
// role ASSISTANT + mismo content + ventana), NO con la cola — así un USER
// interleaved de otro request no tapa el commit fantasma. La función re-valida
// en JS lo que el SQL filtró (defensa doble, misma decisión).
{
  const now = new Date('2026-07-14T12:00:00Z')
  const ago = (ms: number): Date => new Date(now.getTime() - ms)
  const content = 'Perfecto, ¿en qué más te ayudo?'

  // Camino del retry REAL: el intento 1 no commiteó → la query dirigida no
  // encuentra candidato → NO saltear (hay que persistir). Defensivo: aunque
  // llegara una fila USER, el rol la descarta.
  assert.equal(shouldSkipAssistantPersist(null, content, now), false, 'sin candidato → persistir')
  const userTail: TailMessage = { role: 'USER', content: 'quiero un presupuesto', createdAt: ago(2_000) }
  assert.equal(shouldSkipAssistantPersist(userTail, content, now), false, 'fila USER → persistir')

  // Commit-ack perdido: el intento 1 SÍ commiteó → la cola es el ASSISTANT
  // idéntico y reciente → saltear (los contadores entraron con él, atómico).
  const committedTail: TailMessage = { role: 'ASSISTANT', content, createdAt: ago(500) }
  assert.equal(shouldSkipAssistantPersist(committedTail, content, now), true, 'commit fantasma → saltear')

  // ASSISTANT idéntico pero VIEJO (fuera de ventana) → no es de este turno.
  const oldTail: TailMessage = {
    role: 'ASSISTANT',
    content,
    createdAt: ago(ASSISTANT_PERSIST_DEDUP_WINDOW_MS),
  }
  assert.equal(shouldSkipAssistantPersist(oldTail, content, now), false, 'huérfano viejo → persistir')

  // ASSISTANT reciente con OTRO contenido (turno previo) → persistir.
  const otherTail: TailMessage = { role: 'ASSISTANT', content: 'otra respuesta', createdAt: ago(500) }
  assert.equal(shouldSkipAssistantPersist(otherTail, content, now), false, 'otro contenido → persistir')
}

// ── 5. Transform de respuesta vacía ───────────────────────────────────────────

type Part = TextStreamPart<ToolSet>

/** Pasa `chunks` por el transform y devuelve el stream resultante + si inyectó. */
async function runTransform(chunks: Part[]): Promise<{ out: Part[]; injected: boolean }> {
  let injected = false
  const factory = createEmptyResponseFallbackTransform<ToolSet>('FALLBACK', () => {
    injected = true
  })
  const stream = factory({ tools: {}, stopStream: () => undefined })
  const out: Part[] = []
  const writer = stream.writable.getWriter()
  const reader = stream.readable.getReader()
  const writing = (async () => {
    for (const chunk of chunks) await writer.write(chunk)
    await writer.close()
  })()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    out.push(value)
  }
  await writing
  return { out, injected }
}

const start: Part = { type: 'start' }
const startStep: Part = { type: 'start-step', request: {}, warnings: [] }
const usage = {
  inputTokens: 1,
  inputTokenDetails: { noCacheTokens: 1, cacheReadTokens: undefined, cacheWriteTokens: undefined },
  outputTokens: 1,
  outputTokenDetails: { textTokens: 1, reasoningTokens: undefined },
  totalTokens: 2,
}
const finishStep: Part = {
  type: 'finish-step',
  response: { id: 'r', timestamp: new Date(0), modelId: 'm' },
  usage,
  finishReason: 'stop',
  rawFinishReason: 'stop',
  providerMetadata: undefined,
}
const finish: Part = {
  type: 'finish',
  finishReason: 'stop',
  rawFinishReason: 'stop',
  totalUsage: usage,
}
const textParts = (text: string): Part[] => [
  { type: 'text-start', id: 't1' },
  { type: 'text-delta', id: 't1', text },
  { type: 'text-end', id: 't1' },
]

// 5.a — Run normal con texto: passthrough IDÉNTICO (mismos chunks, mismo orden).
{
  const chunks = [start, startStep, ...textParts('Hola, ¿cómo estás?'), finishStep, finish]
  const { out, injected } = await runTransform(chunks)
  assert.equal(injected, false, 'con texto útil no se inyecta')
  assert.deepEqual(out, chunks, 'paridad camino feliz: el stream pasa idéntico')
}

// 5.b — Run vacío (sin text-delta): inyecta la derivación DENTRO del último step.
{
  const { out, injected } = await runTransform([start, startStep, finishStep, finish])
  assert.equal(injected, true, 'run vacío → inyecta')
  const types = out.map((c) => c.type)
  assert.deepEqual(
    types,
    ['start', 'start-step', 'text-start', 'text-delta', 'text-end', 'finish-step', 'finish'],
    'texto inyectado ANTES del finish-step (dentro del step) y antes del finish',
  )
  const delta = out.find((c) => c.type === 'text-delta')
  assert.ok(delta && delta.type === 'text-delta' && delta.text === 'FALLBACK')
  assert.ok(delta && delta.type === 'text-delta' && delta.id === EMPTY_FALLBACK_TEXT_ID)
}

// 5.c — Solo whitespace: cuenta como vacío → inyecta.
{
  const { injected } = await runTransform([start, startStep, ...textParts('  \n '), finishStep, finish])
  assert.equal(injected, true, 'whitespace-only → inyecta')
}

// 5.d — Multi-step con tool en step 1 y texto en step 2: NO inyecta y el orden
// se preserva (el finish-step retenido se libera al ver el start-step siguiente).
{
  const chunks = [start, startStep, finishStep, startStep, ...textParts('listo, te anoté'), finishStep, finish]
  const { out, injected } = await runTransform(chunks)
  assert.equal(injected, false, 'texto útil en cualquier step → no inyecta')
  assert.deepEqual(out, chunks, 'multi-step: orden intacto')
}

// 5.e — Multi-step SIN texto en ningún step → inyecta una sola vez, al final.
{
  const chunks = [start, startStep, finishStep, startStep, finishStep, finish]
  const { out, injected } = await runTransform(chunks)
  assert.equal(injected, true)
  const deltas = out.filter((c) => c.type === 'text-delta')
  assert.equal(deltas.length, 1, 'una sola inyección aunque haya varios steps')
  assert.equal(out[out.length - 1].type, 'finish')
  assert.equal(out[out.length - 2].type, 'finish-step', 'inyección dentro del ÚLTIMO step')
}

// 5.f — Stream que muere sin `finish` (error mid-run): NUNCA inyecta; lo
// retenido se libera intacto en el flush (ese caso es compensación, no fallback).
{
  const chunks = [start, startStep, finishStep]
  const { out, injected } = await runTransform(chunks)
  assert.equal(injected, false, 'sin finish → no inyecta (stream muerto)')
  assert.deepEqual(out, chunks, 'flush libera el finish-step retenido')
}

// ── 6. Modelo de atomicidad de la tx (write 3 falla → nada persiste) ──────────
// La garantía física es el rollback de Postgres; este modelo pinnea el CONTRATO
// que el handler asume: los tres writes entran o no entra ninguno.
{
  interface TurnState {
    messages: number
    conversationCounters: number
    quotaTokens: number
  }
  const committed: TurnState = { messages: 0, conversationCounters: 0, quotaTokens: 0 }
  const txAllOrNothing = (writes: Array<(s: TurnState) => void>): boolean => {
    // Staging: los writes aplican sobre una copia; COMMIT = volcarla entera.
    const staged: TurnState = { ...committed }
    try {
      for (const write of writes) write(staged)
    } catch {
      return false // rollback: `committed` queda intacto
    }
    Object.assign(committed, staged)
    return true
  }

  const failed = txAllOrNothing([
    (s) => {
      s.messages += 1
    },
    (s) => {
      s.conversationCounters += 2
    },
    () => {
      throw new Error('quota write murió (corte a mitad del onFinish)')
    },
  ])
  assert.equal(failed, false)
  assert.deepEqual(
    committed,
    { messages: 0, conversationCounters: 0, quotaTokens: 0 },
    'fallo del 3er write → rollback total, cero estado parcial',
  )

  const ok = txAllOrNothing([
    (s) => {
      s.messages += 1
    },
    (s) => {
      s.conversationCounters += 2
    },
    (s) => {
      s.quotaTokens += 10
    },
  ])
  assert.equal(ok, true)
  assert.deepEqual(committed, { messages: 1, conversationCounters: 2, quotaTokens: 10 })
}

// ── 7. Sanidad de constantes ──────────────────────────────────────────────────
{
  assert.ok(PERSIST_TX_MAX_ATTEMPTS >= 2, 'hay al menos 1 retry para el caso respuesta-ya-entregada')
  assert.ok(
    PERSIST_TX_RETRY_BACKOFF_MS < ASSISTANT_PERSIST_DEDUP_WINDOW_MS,
    'el gap del retry entra cómodo en la ventana del dedup',
  )
  assert.ok(buildEmptyFallbackMessage('+549381...').includes('WhatsApp'), 'con número → deriva a WhatsApp')
  assert.ok(!buildEmptyFallbackMessage(null).includes('WhatsApp'), 'sin número → derivación genérica')
}

console.log(
  '✓ onf1-reconcile invariants OK: la compensación decide bien (y una sola vez por request), ' +
    'el release condicional nunca deja el contador negativo, el retry no duplica ante commit ' +
    'fantasma, el transform inyecta solo en runs vacíos que terminaron (paridad exacta del ' +
    'camino feliz) y la tx es todo-o-nada.',
)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
