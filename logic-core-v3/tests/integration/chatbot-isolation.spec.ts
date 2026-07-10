/**
 * B0-S3 — Test negativo REAL del aislamiento multi-tenant del chatbot.
 *
 * Espejo de motor-isolation.spec.ts (B0-S2) para los modelos del chatbot que el
 * helper porta: BotConfig, Conversation, ChatMessage, ChatbotLead (+ el escape
 * global). Crea DOS organizaciones efímeras con datos SOLAPADOS (mismo email de
 * lead, mismo contenido de mensaje en ambas) y verifica que el scope de A jamás
 * alcanza datos de B — en lectura, lectura por id y escritura — y que el
 * "bot de B consultado con el scope de A" falla.
 *
 * Reglas heredadas del sprint:
 *   - El seed es PARTE del test. Si falla o queda una sola org, la suite FALLA
 *     con error explícito — prohibido test.skip o salida silenciosa.
 *   - Corre contra el MISMO rol de conexión que usa la app: el helper usa
 *     @/lib/prisma y el DATABASE_URL de .env.local (playwright.integration.config).
 *   - Teardown por id EXACTO (la Neon dev es compartida): se borran solo las dos
 *     orgs creadas acá; el cascade org→(bot→conversations→messages/leads) limpia el resto.
 *
 * Corre con: npx playwright test --config=playwright.integration.config.ts chatbot-isolation
 */
import { test, expect } from '@playwright/test'
import type { PrismaClient } from '@prisma/client'
import {
  forOrg,
  unsafeGlobalQuery,
  IsolationError,
  IsolationNotFoundError,
  type OrgScope,
} from '../../src/lib/isolation'

// Sufijo único por corrida: datos namespaced, sin colisión entre corridas ni con
// datos reales de la Neon dev compartida.
const RUN = `${Date.now().toString(36)}-${Math.floor(Math.random() * 36 ** 4).toString(36)}`

// Valor DELIBERADAMENTE compartido entre A y B: prueba que el scope discrimina por
// org y no por el dato (email de lead no es unique — convive en ambas orgs).
const SHARED_LEAD_EMAIL = `compartido-${RUN}@example.com`
const SHARED_MESSAGE = `hola, mismo texto en A y B ${RUN}`

interface SeedIds {
  orgId: string
  botId: string
  botSlug: string
  conversationId: string
  sessionId: string
  userMessageId: string
  leadId: string
}

const seeded: { a?: SeedIds; b?: SeedIds } = {}

/** Ids de orgs YA creadas, registrados apenas existen: si el seed muere a mitad, el teardown igual sabe qué borrar. */
const createdOrgIds: string[] = []

/** Acceso al seed con fallo EXPLÍCITO: sin org sembrada no hay test que corra. */
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

/** Siembra una org completa: bot + conversación + 2 mensajes + lead, TODO vía helper. */
async function seedOrg(tag: 'a' | 'b'): Promise<SeedIds> {
  const org = await unsafeGlobalQuery(
    'seed chatbot-isolation: alta de organización efímera de test (crear tenants es global)',
    (c) =>
      c.organization.create({
        data: { companyName: `Chatbot ISO ${tag.toUpperCase()} ${RUN}`, slug: `chatbot-iso-${tag}-${RUN}` },
        select: { id: true },
      }),
  )
  createdOrgIds.push(org.id)
  const scope = forOrg(org.id)

  const botSlug = `chatbot-iso-bot-${tag}-${RUN}`
  const bot = await scope.botConfig.create({
    slug: botSlug,
    botName: `Bot ${tag.toUpperCase()} ${RUN}`,
    welcomeMessage: `Hola, soy el bot ${tag}`,
  })

  const sessionId = `chatbot-iso-sess-${tag}-${RUN}`
  const conversation = await scope.conversation.create({
    botConfigId: bot.id,
    sessionId,
  })

  const userMessage = await scope.chatMessage.create({
    conversationId: conversation.id,
    role: 'USER',
    content: SHARED_MESSAGE,
  })
  await scope.chatMessage.create({
    conversationId: conversation.id,
    role: 'ASSISTANT',
    content: `respuesta para ${tag}`,
  })

  const lead = await scope.chatbotLead.create({
    botConfigId: bot.id,
    conversationId: conversation.id,
    name: `Lead ${tag}`,
    email: SHARED_LEAD_EMAIL,
  })

  return {
    orgId: org.id,
    botId: bot.id,
    botSlug,
    conversationId: conversation.id,
    sessionId,
    userMessageId: userMessage.id,
    leadId: lead.id,
  }
}

test.describe('B0-S3 — aislamiento multi-tenant del chatbot (A vs B)', () => {
  test.beforeAll(async () => {
    const a = await seedOrg('a')
    const b = await seedOrg('b')
    seeded.a = a
    seeded.b = b

    // Verificación DURA del seed contra la DB (ground truth, sin el helper).
    const check = await unsafeGlobalQuery('seed chatbot-isolation: verificación dura del seed', async (c) => ({
      orgs: await c.organization.count({ where: { id: { in: [a.orgId, b.orgId] } } }),
      bots: await c.botConfig.count({ where: { organizationId: { in: [a.orgId, b.orgId] } } }),
      conversations: await c.conversation.count({ where: { botConfig: { organizationId: { in: [a.orgId, b.orgId] } } } }),
      messages: await c.chatMessage.count({
        where: { conversation: { botConfig: { organizationId: { in: [a.orgId, b.orgId] } } } },
      }),
      leads: await c.chatbotLead.count({ where: { email: SHARED_LEAD_EMAIL } }),
    }))
    if (
      check.orgs !== 2 ||
      check.bots !== 2 ||
      check.conversations !== 2 ||
      check.messages !== 4 ||
      check.leads !== 2
    ) {
      throw new Error(
        `SEED ROTO: se esperaba orgs=2/bots=2/conversations=2/messages=4/leads=2 y hay ` +
          `orgs=${check.orgs}/bots=${check.bots}/conversations=${check.conversations}/messages=${check.messages}/leads=${check.leads}. ` +
          'La suite falla acá a propósito — prohibido continuar con seed parcial.',
      )
    }
  })

  test.afterAll(async () => {
    if (createdOrgIds.length === 0) return
    await unsafeGlobalQuery(
      'teardown chatbot-isolation: borrar por id exacto las orgs efímeras (cascade limpia bot/conversations/messages/leads)',
      (c) => c.organization.deleteMany({ where: { id: { in: createdOrgIds } } }),
    )
  })

  test('(a) el scope de A no devuelve nada de B: bots, conversaciones, mensajes y leads', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const scopeA = forOrg(a.orgId)

    const bots = await scopeA.botConfig.findMany()
    expect(bots).toHaveLength(1)
    expect(bots[0]?.id).toBe(a.botId)
    expect(bots.map((x) => x.id)).not.toContain(b.botId)

    const conversations = await scopeA.conversation.findMany()
    expect(conversations).toHaveLength(1)
    expect(conversations[0]?.id).toBe(a.conversationId)
    expect(conversations.map((c) => c.id)).not.toContain(b.conversationId)

    const messages = await scopeA.chatMessage.findMany({ orderBy: { createdAt: 'asc' } })
    expect(messages).toHaveLength(2)
    expect(messages.map((m) => m.conversationId)).not.toContain(b.conversationId)

    // El email COMPARTIDO devuelve solo el lead propio: el discriminador es la org.
    const leads = await scopeA.chatbotLead.findMany({ where: { email: SHARED_LEAD_EMAIL } })
    expect(leads).toHaveLength(1)
    expect(leads[0]?.id).toBe(a.leadId)
    expect(leads[0]?.botConfigId).toBe(a.botId)
  })

  test('(b) lectura por id de un recurso de B desde el scope de A devuelve null', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const scopeA = forOrg(a.orgId)

    expect(await scopeA.botConfig.findById(b.botId)).toBeNull()
    expect(await scopeA.conversation.findById(b.conversationId)).toBeNull()
    expect(await scopeA.chatMessage.findById(b.userMessageId)).toBeNull()
    expect(await scopeA.chatbotLead.findById(b.leadId)).toBeNull()

    // Control positivo: lo propio SÍ se alcanza (el null de arriba no es falso negativo).
    expect(await scopeA.conversation.findById(a.conversationId)).not.toBeNull()
    expect(await scopeA.botConfig.findById(a.botId)).not.toBeNull()
  })

  test('(c) escritura desde el scope de A sobre un recurso de B falla y B queda intacto', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const scopeA = forOrg(a.orgId)

    // El bot de B consultado/escrito con el scope de A falla (caso central del sprint).
    await expect(scopeA.botConfig.update(b.botId, { botName: 'hackeado' })).rejects.toThrow(IsolationNotFoundError)
    await expect(scopeA.conversation.update(b.conversationId, { leadCaptured: true })).rejects.toThrow(
      IsolationNotFoundError,
    )
    await expect(scopeA.chatbotLead.delete(b.leadId)).rejects.toThrow(IsolationNotFoundError)

    // Batch scoped: el where del caller apunta a B pero el scope lo acota a 0 filas.
    const batch = await scopeA.chatbotLead.updateMany({
      where: { botConfigId: b.botId },
      data: { status: 'WON' },
    })
    expect(batch.count).toBe(0)

    // Ground truth sin helper: B no fue modificado por ninguno de los intentos.
    const bBot = await unsafeGlobalQuery('verificación (c): el bot de B quedó intacto', (c) =>
      c.botConfig.findUnique({ where: { id: b.botId }, select: { botName: true } }),
    )
    expect(bBot?.botName).toContain('Bot B')
    const bLead = await unsafeGlobalQuery('verificación (c): el lead de B quedó intacto', (c) =>
      c.chatbotLead.findUnique({ where: { id: b.leadId }, select: { status: true } }),
    )
    expect(bLead?.status).toBe('NEW')
  })

  test('(d) el mismo email de lead convive en A y en B sin colisión (el scope discrimina, no el dato)', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    const rows = await unsafeGlobalQuery('verificación (d): mismo email en dos orgs', (c) =>
      c.chatbotLead.findMany({ where: { email: SHARED_LEAD_EMAIL }, select: { id: true, botConfigId: true } }),
    )
    expect(rows).toHaveLength(2)
    expect(new Set(rows.map((r) => r.botConfigId))).toEqual(new Set([a.botId, b.botId]))
  })

  test('(e) unsafeGlobalQuery ve ambas orgs — contrato del escape explícito', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    const leads = await unsafeGlobalQuery('caso (e): lectura cross-org deliberada para documentar el escape', (c) =>
      c.chatbotLead.findMany({ where: { email: SHARED_LEAD_EMAIL } }),
    )
    expect(leads).toHaveLength(2)

    // El reason es obligatorio también en runtime: vacío o whitespace lanza ANTES de tocar la base.
    await expect(unsafeGlobalQuery('', (c) => c.organization.count())).rejects.toThrow(IsolationError)
    await expect(unsafeGlobalQuery('   ', (c) => c.organization.count())).rejects.toThrow(IsolationError)
    void a
    void b
  })

  test('(f) los parentChecks rechazan referencias cross-org en create (guard del chatbot sin constraint compuesto)', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    // Lead de A apuntando al bot de B → el parentCheck (botConfigId ∈ org) lanza.
    await expect(forOrg(a.orgId).chatbotLead.create({ botConfigId: b.botId, name: 'cross' })).rejects.toThrow(
      IsolationNotFoundError,
    )
    // Mensaje de A apuntando a la conversación de B → parentCheck (conversationId ∈ org) lanza.
    await expect(
      forOrg(a.orgId).chatMessage.create({ conversationId: b.conversationId, role: 'USER', content: 'cross' }),
    ).rejects.toThrow(IsolationNotFoundError)

    // Nada de lo anterior persistió: B sigue con exactamente 2 mensajes.
    const bMessages = await unsafeGlobalQuery('verificación (f): ningún mensaje cross-org persistió en B', (c) =>
      c.chatMessage.count({ where: { conversationId: b.conversationId } }),
    )
    expect(bMessages).toBe(2)
  })

  test('(g) el scope no se re-apunta por where: organizationId ajeno lanza IsolationError (BotConfig)', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    await expect(forOrg(a.orgId).botConfig.findMany({ where: { organizationId: b.orgId } })).rejects.toThrow(
      IsolationError,
    )
    // Redundante pero igual al scope (misma org) NO lanza: solo el ajeno es bug.
    const own = await forOrg(a.orgId).botConfig.findMany({ where: { organizationId: a.orgId } })
    expect(own).toHaveLength(1)
  })

  test('(h) los guards son runtime: un bypass de tipos no alcanza', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    // organizationId ajeno inyectado por FUERA de los tipos (as never): prepareWriteData lanza.
    const hostil = { slug: `hostil-${RUN}`, botName: 'x', welcomeMessage: 'x', organizationId: b.orgId } as never
    await expect(forOrg(a.orgId).botConfig.create(hostil)).rejects.toThrow(IsolationError)

    // Re-keying por update: prohibido en runtime.
    await expect(forOrg(a.orgId).conversation.update(a.conversationId, { id: 'otro-id' } as never)).rejects.toThrow(
      IsolationError,
    )

    // Re-parenting por update: el guard runtime debe ESPEJAR el Omit del tipo
    // (no pueden divergir). Un bypass de tipos que intente saltar el CrmSyncAttempt
    // a otro lead/integración se rechaza en el guard de claves, ANTES de tocar la DB
    // — por eso se afirma el mensaje del guard, no un IsolationNotFoundError genérico.
    await expect(
      forOrg(a.orgId).crmSyncAttempt.update('cualquier-id', { leadId: 'otro-lead' } as never),
    ).rejects.toThrow(/la clave "leadId" no se acepta/)
    await expect(
      forOrg(a.orgId).crmSyncAttempt.update('cualquier-id', { integrationId: 'otra-integracion' } as never),
    ).rejects.toThrow(/la clave "integrationId" no se acepta/)

    // Cursor: ancla la paginación por unique GLOBAL (oráculo cross-org) — rechazado.
    await expect(
      forOrg(a.orgId).chatMessage.findMany({ cursor: { id: b.userMessageId }, orderBy: { createdAt: 'asc' } } as never),
    ).rejects.toThrow(IsolationError)

    // Nada hostil persistió: el bot hostil no existe en ninguna org.
    const hostiles = await unsafeGlobalQuery('verificación (h): ningún write hostil persistió', (c) =>
      c.botConfig.count({ where: { slug: `hostil-${RUN}` } }),
    )
    expect(hostiles).toBe(0)
  })
})

/**
 * Garantías de COMPILACIÓN — nunca se ejecuta. Si el helper aflojara sus tipos
 * para los modelos del chatbot (organizationId aceptado en data, re-parenting
 * permitido, nested writes abiertos), los @ts-expect-error quedarían "sin usar"
 * y `npx tsc --noEmit` fallaría con TS2578.
 */
function garantiasDeTiposChatbot(scope: OrgScope): void {
  // @ts-expect-error — el organizationId del create de BotConfig lo fija el scope, no el caller
  void scope.botConfig.create({ organizationId: 'otra', slug: 'x', botName: 'x', welcomeMessage: 'x' })
  // @ts-expect-error — update no permite re-parenting: botConfigId de la conversación es inmutable vía helper
  void scope.conversation.update('un-id', { botConfigId: 'otro-bot' })
  // @ts-expect-error — update no permite re-parenting: conversationId del mensaje es inmutable vía helper
  void scope.chatMessage.update('un-id', { conversationId: 'otra-conversacion' })
  // @ts-expect-error — update no permite re-parenting: leadId del CrmSyncAttempt es inmutable vía helper
  void scope.crmSyncAttempt.update('un-id', { leadId: 'otro-lead' })
  // @ts-expect-error — update no permite re-parenting: integrationId del CrmSyncAttempt es inmutable vía helper
  void scope.crmSyncAttempt.update('un-id', { integrationId: 'otra-integracion' })
  // @ts-expect-error — nested writes prohibidos: los mensajes entran por su propio accessor
  void scope.conversation.create({ botConfigId: 'x', sessionId: 'x', messages: { create: [] } })
  // @ts-expect-error — unsafeGlobalQuery exige reason como primer argumento
  void unsafeGlobalQuery((c: PrismaClient) => c.organization.count())
}
void garantiasDeTiposChatbot
