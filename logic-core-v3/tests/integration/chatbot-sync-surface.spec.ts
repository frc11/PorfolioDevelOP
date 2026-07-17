/**
 * B2-S1 — Test de integración de la superficie sincrónica del chatbot
 * (`generateBotReply`, importada por su barrel público `@/modules/chatbot/public-api`).
 *
 * Cubre el contrato del sprint:
 *   (a) respuesta completa devuelta y PERSISTIDA (user + assistant, messageCount).
 *   (b) bot de la org B invocado con el scope de A → error tipado (BotNotInOrgError)
 *       y CERO escritura.
 *   (c) `capture_lead` dispara en el camino sync y el lead queda scoped a la org.
 *   (d) sessionId sintético namespaced (`wa:...`) crea conversación propia sin
 *       colisionar con una sesión de widget del mismo bot.
 *
 * Reglas heredadas (Estándar B0):
 *   - El seed es PARTE del test: si falla o queda incompleto, la suite FALLA con
 *     error explícito — prohibido test.skip o salida silenciosa.
 *   - Corre en proceso contra la Neon de .env.local (playwright.integration.config).
 *   - Teardown por id EXACTO (Neon dev compartida): se borran solo las orgs
 *     efímeras; el cascade limpia bot/KB/conversaciones/mensajes/leads.
 *   - El LLM se mockea en la interfaz `LLMProvider` (inyección `getProvider`, el
 *     mismo seam que resolveEffectiveModel/COST-1): un `MockLanguageModelV3` del
 *     AI SDK stremea texto (y, para (c), una tool-call de capture_lead). Cero
 *     credenciales, cero red al provider.
 *
 * Corre con: npx playwright test --config=playwright.integration.config.ts chatbot-sync-surface
 */
import { test, expect } from '@playwright/test'
import { simulateReadableStream, type LanguageModel } from 'ai'
import { MockLanguageModelV3 } from 'ai/test'
import type { LanguageModelV3, LanguageModelV3StreamPart } from '@ai-sdk/provider'
import { forOrg, unsafeGlobalQuery } from '../../src/lib/isolation'
import {
  generateBotReply,
  BotNotInOrgError,
  GenerateBotReplyError,
} from '../../src/modules/chatbot/public-api'
import type { LLMProvider } from '../../src/modules/chatbot/server/llm'
import type { LLMProviderName } from '../../src/modules/chatbot/shared/types'

// Sufijo único por corrida: datos namespaced, sin colisión entre corridas ni con
// datos reales de la Neon dev compartida.
const RUN = `${Date.now().toString(36)}-${Math.floor(Math.random() * 36 ** 4).toString(36)}`

// ─── Doble del LLM (interfaz LLMProvider → MockLanguageModelV3) ───────────────

// Shape V3 de `usage` (el SDK lo aplana a números en onFinish).
const USAGE = {
  inputTokens: { total: 12, noCache: 12, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 8, text: 8, reasoning: 0 },
} as const

/** Un step de solo texto (finishReason 'stop' → el run termina acá). */
function textStep(text: string): LanguageModelV3StreamPart[] {
  return [
    { type: 'stream-start', warnings: [] },
    { type: 'text-start', id: '0' },
    { type: 'text-delta', id: '0', delta: text },
    { type: 'text-end', id: '0' },
    { type: 'finish', usage: USAGE, finishReason: { unified: 'stop', raw: 'stop' } },
  ]
}

/** Un step que invoca una tool (finishReason 'tool-calls' → el SDK continúa). */
function toolCallStep(toolName: string, input: object): LanguageModelV3StreamPart[] {
  return [
    { type: 'stream-start', warnings: [] },
    { type: 'tool-call', toolCallId: `call_${RUN}`, toolName, input: JSON.stringify(input) },
    { type: 'finish', usage: USAGE, finishReason: { unified: 'tool-calls', raw: 'tool-calls' } },
  ]
}

/**
 * Un stream que abre y CIERRA sin emitir ningún step (ni 'finish' ni contenido):
 * reproduce el peor caso del provider: sin output. El SDK rechaza sus promesas
 * internas (NoOutputGeneratedError) y NUNCA llama al onFinish — y además no dispara
 * onError (no hay parte 'error'). Es el caso exacto que colgaría el drenaje sync si
 * esperara `persisted` a ciegas.
 */
function noOutputStep(): LanguageModelV3StreamPart[] {
  return [{ type: 'stream-start', warnings: [] }]
}

/**
 * Modelo mock que devuelve `steps[i]` en la i-ésima llamada a doStream (counter
 * por closure — evita el off-by-one del modo array de MockLanguageModelV3). Clampa
 * al último step por si el run pidiera más pasos de los provistos.
 */
function mockModel(steps: LanguageModelV3StreamPart[][]): LanguageModelV3 {
  let call = 0
  return new MockLanguageModelV3({
    doStream: async () => {
      const chunks = steps[Math.min(call, steps.length - 1)]
      call += 1
      return {
        stream: simulateReadableStream({ chunks, initialDelayInMs: 0, chunkDelayInMs: 0 }),
      }
    },
  })
}

/** Inyección `getProvider` que devuelve un LLMProvider cuyo getModel es el mock. */
function fakeProvider(model: LanguageModelV3): (name: LLMProviderName) => LLMProvider {
  return () => ({
    name: 'google',
    getModel: (): LanguageModel => model,
    estimateCost: () => 0,
    listModels: () => [],
  })
}

// ─── Seed ────────────────────────────────────────────────────────────────────

interface SeedIds {
  orgId: string
  botId: string
  botSlug: string
}

const seeded: { a?: SeedIds; b?: SeedIds } = {}
const createdOrgIds: string[] = []

function mustSeed(side: 'a' | 'b'): SeedIds {
  const ids = seeded[side]
  if (!ids) {
    throw new Error(
      `SEED ROTO: la organización "${side}" no quedó sembrada. ` +
        'La suite falla acá a propósito — prohibido test.skip (regla del sprint).',
    )
  }
  return ids
}

/** Siembra una org con bot + KnowledgeBase (generateBotReply exige KB no-null). */
async function seedOrg(tag: 'a' | 'b'): Promise<SeedIds> {
  const org = await unsafeGlobalQuery(
    'seed chatbot-sync-surface: alta de organización efímera de test (crear tenants es global)',
    (c) =>
      c.organization.create({
        data: { companyName: `Sync ${tag.toUpperCase()} ${RUN}`, slug: `sync-${tag}-${RUN}` },
        select: { id: true },
      }),
  )
  createdOrgIds.push(org.id)
  const scope = forOrg(org.id)

  const botSlug = `sync-bot-${tag}-${RUN}`
  const bot = await scope.botConfig.create({
    slug: botSlug,
    botName: `Bot ${tag.toUpperCase()} ${RUN}`,
    welcomeMessage: `Hola, soy el bot ${tag}`,
  })
  await scope.knowledgeBase.create({
    botConfigId: bot.id,
    businessInfo: `Negocio de prueba ${tag} para la superficie sync.`,
    servicesOrProducts: 'Servicio de prueba.',
  })

  return { orgId: org.id, botId: bot.id, botSlug }
}

test.describe('B2-S1 — superficie sincrónica generateBotReply', () => {
  test.beforeAll(async () => {
    seeded.a = await seedOrg('a')
    seeded.b = await seedOrg('b')

    // Verificación dura del seed contra la DB (ground truth, sin el helper).
    const check = await unsafeGlobalQuery('seed chatbot-sync-surface: verificación dura', async (c) => ({
      orgs: await c.organization.count({ where: { id: { in: createdOrgIds } } }),
      bots: await c.botConfig.count({ where: { organizationId: { in: createdOrgIds } } }),
      kbs: await c.knowledgeBase.count({ where: { botConfig: { organizationId: { in: createdOrgIds } } } }),
    }))
    if (check.orgs !== 2 || check.bots !== 2 || check.kbs !== 2) {
      throw new Error(
        `SEED ROTO: se esperaba orgs=2/bots=2/kbs=2 y hay ` +
          `orgs=${check.orgs}/bots=${check.bots}/kbs=${check.kbs}. Prohibido continuar con seed parcial.`,
      )
    }
  })

  test.afterAll(async () => {
    if (createdOrgIds.length === 0) return
    await unsafeGlobalQuery(
      'teardown chatbot-sync-surface: borrar por id exacto las orgs efímeras (cascade limpia el resto)',
      (c) => c.organization.deleteMany({ where: { id: { in: createdOrgIds } } }),
    )
  })

  test('(a) devuelve el texto completo y persiste user + assistant', async () => {
    const a = mustSeed('a')
    const sessionId = `wa:reply-${RUN}`
    const reply = 'Hola, ¿en qué te puedo ayudar hoy?'

    const result = await generateBotReply({
      organizationId: a.orgId,
      botConfigId: a.botId,
      sessionId,
      userMessageText: 'Hola, buenas',
      getProvider: fakeProvider(mockModel([textStep(reply)])),
    })

    expect(result.text).toBe(reply)
    expect(result.leadCaptured).toBe(false)
    expect(result.conversationId).toBeTruthy()

    // Persistencia autoritativa vía el scope de la org.
    const scope = forOrg(a.orgId)
    const conversation = await scope.conversation.findById(result.conversationId)
    expect(conversation).not.toBeNull()
    expect(conversation?.sessionId).toBe(sessionId)
    // onFinish incrementa +2 (user + assistant).
    expect(conversation?.messageCount).toBe(2)

    const messages = await scope.chatMessage.findMany({
      where: { conversationId: result.conversationId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    })
    expect(messages).toHaveLength(2)
    expect(messages[0]).toEqual({ role: 'USER', content: 'Hola, buenas' })
    expect(messages[1]).toEqual({ role: 'ASSISTANT', content: reply })
  })

  test('(b) bot de la org B invocado con el scope de A → error tipado y CERO escritura', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const sessionId = `wa:crossorg-${RUN}`

    await expect(
      generateBotReply({
        organizationId: a.orgId,
        botConfigId: b.botId, // ← bot de B, org de A
        sessionId,
        userMessageText: 'hola',
        getProvider: fakeProvider(mockModel([textStep('no debería responder')])),
      }),
    ).rejects.toThrow(BotNotInOrgError)

    // CERO escritura: ninguna conversación con ese sessionId en ninguna org.
    const conversations = await unsafeGlobalQuery(
      'verificación (b): el pedido cross-org no dejó ninguna conversación',
      (c) => c.conversation.count({ where: { sessionId } }),
    )
    expect(conversations).toBe(0)
    // El bot de B sigue sin conversaciones propias.
    const bConversations = await unsafeGlobalQuery('verificación (b): B intacto', (c) =>
      c.conversation.count({ where: { botConfigId: b.botId } }),
    )
    expect(bConversations).toBe(0)
  })

  test('(c) capture_lead dispara en el camino sync y el lead queda scoped a la org', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const sessionId = `wa:lead-${RUN}`
    const email = `prospecto-${RUN}@example.com`
    const reply = '¡Listo! Un asesor te va a contactar.'

    const result = await generateBotReply({
      organizationId: a.orgId,
      botConfigId: a.botId,
      // El email va en el mensaje del visitante: capture_lead solo persiste un
      // canal que APAREZCA en lo que el visitante escribió (anti-fabricación).
      userMessageText: `Hola, soy Juan Pérez, mi mail es ${email}, quiero una cotización.`,
      sessionId,
      getProvider: fakeProvider(
        mockModel([
          toolCallStep('capture_lead', {
            name: 'Juan Pérez',
            email,
            intent: 'quote_request',
            contextSummary: 'El visitante pidió una cotización de prueba para el test sync.',
            category: 'sales',
            requestedAppointment: false,
            mentionedFinancing: false,
            mentionedTradeIn: false,
            askedSpecificModel: false,
          }),
          textStep(reply),
        ]),
      ),
    })

    expect(result.text).toBe(reply)
    expect(result.leadCaptured).toBe(true)

    // El lead quedó en la org A, ligado al bot de A.
    const scopeA = forOrg(a.orgId)
    const leadsA = await scopeA.chatbotLead.findMany({ where: { conversationId: result.conversationId } })
    expect(leadsA).toHaveLength(1)
    expect(leadsA[0]?.email).toBe(email)
    expect(leadsA[0]?.botConfigId).toBe(a.botId)

    // La org B no ve ese lead (el email es un discriminador de contenido, no de org).
    const scopeB = forOrg(b.orgId)
    const leadsB = await scopeB.chatbotLead.findMany({ where: { email } })
    expect(leadsB).toHaveLength(0)
  })

  test('(d) sessionId namespaced (wa:...) crea conversación propia sin colisionar con el widget', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)

    // Sesión de WIDGET pre-existente (mismo bot). sessionId es @unique global:
    // por eso el canal sync namespacea con `wa:` y nunca pisa una sesión de widget.
    const widgetSessionId = `widget-${RUN}`
    const widgetConversation = await scope.conversation.create({
      botConfigId: a.botId,
      sessionId: widgetSessionId,
    })

    const syncSessionId = `wa:${widgetSessionId}`
    const result = await generateBotReply({
      organizationId: a.orgId,
      botConfigId: a.botId,
      sessionId: syncSessionId,
      userMessageText: 'Hola por WhatsApp',
      getProvider: fakeProvider(mockModel([textStep('¡Hola! Te leo por acá.')])),
    })

    // Conversación propia, distinta de la del widget.
    expect(result.conversationId).not.toBe(widgetConversation.id)
    const syncConversation = await scope.conversation.findById(result.conversationId)
    expect(syncConversation?.sessionId).toBe(syncSessionId)

    // Las dos conversaciones conviven (widget + sync) para el mismo bot.
    const both = await unsafeGlobalQuery('verificación (d): widget y sync conviven', (c) =>
      c.conversation.count({ where: { sessionId: { in: [widgetSessionId, syncSessionId] } } }),
    )
    expect(both).toBe(2)
  })

  test('(e) un fallo del modelo (stream sin onFinish) RECHAZA — no cuelga el drenaje', async () => {
    const a = mustSeed('a')
    const sessionId = `wa:fail-${RUN}`

    // El modelo muere sin completar ningún step → el SDK no llama al onFinish.
    // Si el drenaje esperara `persisted` a ciegas, esto colgaría hasta el timeout
    // del test; el orden correcto (materializar result.text primero) lo convierte
    // en un throw tipado y RÁPIDO.
    const started = Date.now()
    await expect(
      generateBotReply({
        organizationId: a.orgId,
        botConfigId: a.botId,
        sessionId,
        userMessageText: 'Hola, esto debería fallar',
        getProvider: fakeProvider(mockModel([noOutputStep()])),
      }),
    ).rejects.toThrow(GenerateBotReplyError)
    // Prueba de "no cuelga": si hubiera colgado, el reject nunca llega antes del
    // timeout del spec. Cota holgada para no ser flaky en CI.
    expect(Date.now() - started).toBeLessThan(20_000)

    // Estado parcial sano: el turno del visitante quedó persistido, pero como el
    // onFinish nunca corrió, no hay ASSISTANT ni se incrementó messageCount.
    const scope = forOrg(a.orgId)
    const conversation = await scope.conversation.findFirst({ where: { sessionId } })
    expect(conversation).not.toBeNull()
    expect(conversation?.messageCount).toBe(0)
    const messages = await scope.chatMessage.findMany({
      where: { conversationId: conversation?.id ?? '' },
      select: { role: true },
    })
    expect(messages).toEqual([{ role: 'USER' }])
  })
})
