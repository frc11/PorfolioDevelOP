/**
 * B0-S2 — Test negativo REAL del aislamiento multi-tenant del motor.
 *
 * Crea DOS organizaciones efímeras con datos solapados (mismo externalId de
 * contacto y mismo phoneNumberId de canal en ambas) y verifica que el scope
 * de A jamás alcanza datos de B — en lectura, lectura por id y escritura —
 * y que unsafeGlobalQuery (el escape explícito) sí ve ambas.
 *
 * Reglas heredadas del sprint:
 *   - El seed es PARTE del test. Si falla o queda una sola org, la suite
 *     FALLA con error explícito — prohibido test.skip o salida silenciosa.
 *   - Corre contra el MISMO rol de conexión que usa la app: el helper usa
 *     @/lib/prisma y el DATABASE_URL de .env.local que carga
 *     playwright.integration.config.ts — sin rol especial de test.
 *   - Teardown por id EXACTO (la Neon dev es compartida): se borran solo las
 *     dos orgs creadas acá; el cascade org→motor_* limpia el resto.
 *
 * Corre con: npm run test:integration   (o filtrado: npx playwright test
 * --config=playwright.integration.config.ts motor-isolation)
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

// Sufijo único por corrida: datos namespaced, sin colisión entre corridas ni
// con datos reales de la Neon dev compartida.
const RUN = `${Date.now().toString(36)}-${Math.floor(Math.random() * 36 ** 4).toString(36)}`

// Claves DELIBERADAMENTE compartidas entre A y B: prueban que los uniques del
// motor son compuestos por org (nunca globales) y que el scope discrimina.
const SHARED_EXTERNAL_ID = `bsuid-compartido-${RUN}`
const SHARED_PHONE_NUMBER_ID = `pn-compartido-${RUN}`

interface SeedIds {
  orgId: string
  channelId: string
  identityId: string
  conversationId: string
  messageInId: string
  providerMessageIdIn: string
}

const seeded: { a?: SeedIds; b?: SeedIds } = {}

/**
 * Ids de orgs YA creadas, registrados apenas existen: si el seed muere a mitad
 * de camino (ej. falla seedOrg('b') con la org A ya persistida), el teardown
 * igual sabe qué borrar — nada queda huérfano en la Neon compartida.
 */
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

/** Siembra una org completa: canal + identidad + conversación + 2 mensajes, TODO vía helper. */
async function seedOrg(tag: 'a' | 'b'): Promise<SeedIds> {
  const org = await unsafeGlobalQuery(
    'seed motor-isolation: alta de organización efímera de test (crear tenants es global)',
    (c) =>
      c.organization.create({
        data: { companyName: `Motor ISO ${tag.toUpperCase()} ${RUN}`, slug: `motor-iso-${tag}-${RUN}` },
        select: { id: true },
      }),
  )
  createdOrgIds.push(org.id)
  const scope = forOrg(org.id)
  const channel = await scope.wabaChannel.create({
    phoneNumberId: SHARED_PHONE_NUMBER_ID,
    wabaId: `waba-${tag}-${RUN}`,
    displayPhoneNumber: '+54 9 11 5555-5555',
  })
  const identity = await scope.contactIdentity.create({
    channelType: 'WHATSAPP',
    externalId: SHARED_EXTERNAL_ID,
    waId: `wa-${tag}-${RUN}`,
  })
  const conversation = await scope.motorConversation.create({
    contactIdentityId: identity.id,
    wabaChannelId: channel.id,
    lastInboundAt: new Date(),
  })
  const messageIn = await scope.motorMessage.create({
    conversationId: conversation.id,
    direction: 'IN',
    body: `hola desde ${tag}`,
    messageType: 'text',
    status: 'RECEIVED',
    providerMessageId: `wamid-in-${tag}-${RUN}`,
  })
  await scope.motorMessage.create({
    conversationId: conversation.id,
    direction: 'OUT',
    body: `respuesta para ${tag}`,
    messageType: 'text',
    status: 'SENT',
    providerMessageId: `wamid-out-${tag}-${RUN}`,
  })
  if (messageIn.providerMessageId === null) {
    throw new Error('SEED ROTO: el mensaje IN quedó sin providerMessageId — el discriminador del test (a) no existe.')
  }
  return {
    orgId: org.id,
    channelId: channel.id,
    identityId: identity.id,
    conversationId: conversation.id,
    messageInId: messageIn.id,
    // Leído de la fila real (no recalculado): si cambia cómo se genera, el
    // assert del test (a) sigue apuntando al dato verdadero.
    providerMessageIdIn: messageIn.providerMessageId,
  }
}

test.describe('B0-S2 — aislamiento multi-tenant del motor (A vs B)', () => {
  test.beforeAll(async () => {
    const a = await seedOrg('a')
    const b = await seedOrg('b')
    seeded.a = a
    seeded.b = b

    // Verificación DURA del seed contra la DB (ground truth, sin el helper).
    const check = await unsafeGlobalQuery('seed motor-isolation: verificación dura del seed', async (c) => ({
      orgs: await c.organization.count({ where: { id: { in: [a.orgId, b.orgId] } } }),
      identities: await c.contactIdentity.count({ where: { externalId: SHARED_EXTERNAL_ID } }),
      conversations: await c.motorConversation.count({ where: { organizationId: { in: [a.orgId, b.orgId] } } }),
      messages: await c.motorMessage.count({ where: { organizationId: { in: [a.orgId, b.orgId] } } }),
    }))
    if (check.orgs !== 2 || check.identities !== 2 || check.conversations !== 2 || check.messages !== 4) {
      throw new Error(
        `SEED ROTO: se esperaba orgs=2/identities=2/conversations=2/messages=4 y hay ` +
          `orgs=${check.orgs}/identities=${check.identities}/conversations=${check.conversations}/messages=${check.messages}. ` +
          'La suite falla acá a propósito — prohibido continuar con seed parcial.',
      )
    }
  })

  test.afterAll(async () => {
    if (createdOrgIds.length === 0) return
    // Usa el registro incremental (no `seeded`): si seedOrg('b') falló a mitad,
    // la org A ya creada igual se borra.
    await unsafeGlobalQuery(
      'teardown motor-isolation: borrar por id exacto las orgs efímeras creadas (cascade limpia motor_*)',
      (c) => c.organization.deleteMany({ where: { id: { in: createdOrgIds } } }),
    )
  })

  test('(a) el scope de A no devuelve nada de B: conversaciones, mensajes e identidades', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const scopeA = forOrg(a.orgId)

    const conversations = await scopeA.motorConversation.findMany()
    expect(conversations).toHaveLength(1)
    for (const conversation of conversations) {
      expect(conversation.organizationId).toBe(a.orgId)
    }
    expect(conversations.map((c) => c.id)).not.toContain(b.conversationId)

    const messages = await scopeA.motorMessage.findMany({ orderBy: { createdAt: 'asc' } })
    expect(messages).toHaveLength(2)
    for (const message of messages) {
      expect(message.organizationId).toBe(a.orgId)
    }
    expect(messages.map((m) => m.providerMessageId)).not.toContain(b.providerMessageIdIn)

    // La clave COMPARTIDA devuelve solo la fila propia: el discriminador es la org.
    const identities = await scopeA.contactIdentity.findMany({ where: { externalId: SHARED_EXTERNAL_ID } })
    expect(identities).toHaveLength(1)
    expect(identities[0]?.id).toBe(a.identityId)
    expect(identities[0]?.organizationId).toBe(a.orgId)

    const channels = await scopeA.wabaChannel.findMany({ where: { phoneNumberId: SHARED_PHONE_NUMBER_ID } })
    expect(channels).toHaveLength(1)
    expect(channels[0]?.id).toBe(a.channelId)
  })

  test('(b) lectura por id de un recurso de B desde el scope de A devuelve null', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const scopeA = forOrg(a.orgId)

    expect(await scopeA.motorConversation.findById(b.conversationId)).toBeNull()
    expect(await scopeA.contactIdentity.findById(b.identityId)).toBeNull()
    expect(await scopeA.motorMessage.findById(b.messageInId)).toBeNull()
    expect(await scopeA.wabaChannel.findById(b.channelId)).toBeNull()

    // Control positivo: lo propio SÍ se alcanza (el null de arriba no es un falso negativo).
    expect(await scopeA.motorConversation.findById(a.conversationId)).not.toBeNull()
  })

  test('(c) escritura desde el scope de A sobre un recurso de B falla y B queda intacto', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const scopeA = forOrg(a.orgId)

    await expect(scopeA.motorConversation.update(b.conversationId, { status: 'CLOSED' })).rejects.toThrow(
      IsolationNotFoundError,
    )
    await expect(scopeA.motorMessage.delete(b.messageInId)).rejects.toThrow(IsolationNotFoundError)

    // Batch scoped: el where del caller apunta a B pero el scope lo acota a 0 filas.
    const batch = await scopeA.motorMessage.updateMany({
      where: { conversationId: b.conversationId },
      data: { status: 'FAILED' },
    })
    expect(batch.count).toBe(0)

    // Ground truth sin helper: B no fue modificado por ninguno de los intentos.
    const bConversation = await unsafeGlobalQuery('verificación del caso (c): B quedó intacto', (c) =>
      c.motorConversation.findUnique({ where: { id: b.conversationId }, include: { messages: true } }),
    )
    expect(bConversation?.status).toBe('OPEN')
    expect(bConversation?.messages).toHaveLength(2)
    expect(bConversation?.messages.every((m) => m.status !== 'FAILED')).toBe(true)
  })

  test('(d) el mismo externalId convive en A y en B sin colisión (unique compuesto por org)', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    const rows = await unsafeGlobalQuery('verificación del caso (d): unique compuesto por org', (c) =>
      c.contactIdentity.findMany({
        where: { externalId: SHARED_EXTERNAL_ID },
        select: { id: true, organizationId: true },
      }),
    )
    expect(rows).toHaveLength(2)
    expect(new Set(rows.map((r) => r.organizationId))).toEqual(new Set([a.orgId, b.orgId]))

    // Y DENTRO de una misma org el unique sí pega: el duplicado explota.
    await expect(
      forOrg(a.orgId).contactIdentity.create({ channelType: 'WHATSAPP', externalId: SHARED_EXTERNAL_ID }),
    ).rejects.toThrow()
  })

  test('(e) unsafeGlobalQuery ve ambas orgs — contrato del escape explícito', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    const identities = await unsafeGlobalQuery(
      'caso (e): lectura cross-org deliberada para documentar el contrato del escape',
      (c) => c.contactIdentity.findMany({ where: { externalId: SHARED_EXTERNAL_ID } }),
    )
    expect(identities).toHaveLength(2)
    expect(new Set(identities.map((i) => i.organizationId))).toEqual(new Set([a.orgId, b.orgId]))

    // El reason es obligatorio también en runtime: vacío o whitespace, lanza
    // ANTES de tocar la base.
    await expect(unsafeGlobalQuery('', (c) => c.organization.count())).rejects.toThrow(IsolationError)
    await expect(unsafeGlobalQuery('   ', (c) => c.organization.count())).rejects.toThrow(IsolationError)
  })

  test('(f) defensa en profundidad: la FK compuesta rechaza referencias cross-org aun sin helper', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    // Vía helper: conversación de A apuntando a la identidad de B → contrato uniforme.
    await expect(
      forOrg(a.orgId).motorConversation.create({ contactIdentityId: b.identityId, wabaChannelId: a.channelId }),
    ).rejects.toThrow(IsolationNotFoundError)

    // SIN helper (prisma crudo vía escape): la DB también lo rechaza (P2003,
    // FK compuesta organizationId+contactIdentityId). El aislamiento del motor
    // no depende de que el código use el helper.
    await expect(
      unsafeGlobalQuery('caso (f): probar el constraint compuesto de la DB sin pasar por el helper', (c) =>
        c.motorConversation.create({
          data: { organizationId: a.orgId, contactIdentityId: b.identityId, wabaChannelId: a.channelId },
        }),
      ),
    ).rejects.toThrow()
  })

  test('(g) el scope no se re-apunta por where: organizationId ajeno lanza IsolationError', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    await expect(forOrg(a.orgId).motorMessage.findMany({ where: { organizationId: b.orgId } })).rejects.toThrow(
      IsolationError,
    )
    // Redundante pero igual al scope (mismo org) NO lanza: solo el ajeno es bug.
    const own = await forOrg(a.orgId).motorMessage.findMany({ where: { organizationId: a.orgId } })
    expect(own).toHaveLength(2)
  })

  test('(h) los guards de escritura y lectura también son runtime: un bypass de tipos no alcanza', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')

    // organizationId ajeno inyectado por FUERA de los tipos (as never): el
    // guard de prepareWriteData lanza — el Omit del tipo no es la única defensa.
    const dataHostil = {
      phoneNumberId: `pn-hostil-${RUN}`,
      wabaId: `waba-hostil-${RUN}`,
      displayPhoneNumber: '+54 9 11 0000-0000',
      organizationId: b.orgId,
    } as never
    await expect(forOrg(a.orgId).wabaChannel.create(dataHostil)).rejects.toThrow(IsolationError)

    // Nested write inyectado por fuera de los tipos: rechazado en runtime.
    const nestedHostil = {
      channelType: 'WHATSAPP',
      externalId: `bsuid-hostil-${RUN}`,
      organization: { connect: { id: b.orgId } },
    } as never
    await expect(forOrg(a.orgId).contactIdentity.create(nestedHostil)).rejects.toThrow(IsolationError)

    // Re-keying por update: prohibido en runtime (y en tipos).
    const rekey = { id: 'otro-id' } as never
    await expect(forOrg(a.orgId).motorMessage.update(a.messageInId, rekey)).rejects.toThrow(IsolationError)

    // Cursor: ancla la paginación por unique GLOBAL (oráculo de existencia
    // cross-org) — el helper lo rechaza.
    await expect(
      forOrg(a.orgId).motorMessage.findMany({ cursor: { id: b.messageInId }, orderBy: { createdAt: 'asc' } }),
    ).rejects.toThrow(IsolationError)

    // Nada de lo anterior escribió: el canal hostil no existe en ninguna org.
    const hostiles = await unsafeGlobalQuery('verificación del caso (h): ningún write hostil persistió', (c) =>
      c.wabaChannel.count({ where: { phoneNumberId: `pn-hostil-${RUN}` } }),
    )
    expect(hostiles).toBe(0)
  })
})

/**
 * Garantías de COMPILACIÓN — esta función nunca se ejecuta. Si el helper
 * aflojara sus tipos (organizationId aceptado en data, reason opcional,
 * re-parenting permitido, nested writes abiertos), los @ts-expect-error
 * quedarían "sin usar" y `npx tsc --noEmit` fallaría con TS2578: el
 * typecheck del repo ES el test negativo de tipos.
 */
function garantiasDeTipos(scope: OrgScope): void {
  // @ts-expect-error — forOrg exige organizationId: sin argumento no compila
  void forOrg()
  // @ts-expect-error — unsafeGlobalQuery exige reason como primer argumento
  void unsafeGlobalQuery((c: PrismaClient) => c.organization.count())
  // @ts-expect-error — el organizationId del create lo fija el scope, no el caller
  void scope.wabaChannel.create({ organizationId: 'otra', phoneNumberId: 'x', wabaId: 'x', displayPhoneNumber: 'x' })
  // @ts-expect-error — update no permite mover una fila de organización
  void scope.motorMessage.update('un-id', { organizationId: 'otra' })
  // @ts-expect-error — update no permite re-parenting: conversationId es inmutable vía helper
  void scope.motorMessage.update('un-id', { conversationId: 'otra-conversacion' })
  // @ts-expect-error — update no permite re-keying: id es inmutable vía helper
  void scope.conversation.update('un-id', { id: 'otro-id' })
  // @ts-expect-error — nested writes prohibidos: los mensajes entran por su propio accessor
  void scope.motorConversation.create({ contactIdentityId: 'x', wabaChannelId: 'x', messages: { create: [] } })
}
void garantiasDeTipos
