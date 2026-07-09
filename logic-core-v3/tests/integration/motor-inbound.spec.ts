/**
 * B1-S1 — Suite de integración del adaptador BSP de ENTRADA (webhook 360dialog).
 *
 * Invoca el route handler REAL (POST de
 * src/app/api/motor/webhook/[channelToken]/route.ts) con Request estándar,
 * contra la MISMA Neon dev y el mismo rol de conexión que usa la app
 * (DATABASE_URL de .env.local vía playwright.integration.config.ts).
 * Cubre: autenticación (401 sin escritura), idempotencia por wamid,
 * resolución de identidad BSUID-first (creación, BSUID-only, reconciliación
 * teléfono→BSUID), unique compuesto por org (mismo BSUID en dos orgs),
 * lastInboundAt, statuses (progresión, stale, failed sin contacts, scoping
 * por org), user_id_update (migración + transición) y shape estricto.
 *
 * Reglas heredadas de B0:
 *   - El seed es PARTE del test: si falla, la suite FALLA explícito —
 *     prohibido test.skip o salida silenciosa.
 *   - Teardown por id EXACTO (la Neon dev es compartida): se borran solo las
 *     orgs creadas acá; el cascade org→motor_* limpia el resto (incluidas
 *     las transiciones de identidad).
 *
 * Corre con: npm run test:integration   (o filtrado: npx playwright test
 * --config=playwright.integration.config.ts motor-inbound)
 */
import { test, expect } from '@playwright/test'
import { forOrg, unsafeGlobalQuery } from '../../src/lib/isolation'
import { generateChannelWebhookCredentials } from '../../src/modules/motor/domain/channel-credentials'
import { POST } from '../../src/app/api/motor/webhook/[channelToken]/route'
import {
  failedStatusPayload,
  inboundTextMessagePayload,
  statusPayload,
  unknownEventPayload,
  userIdUpdatePayload,
} from './fixtures/motor-inbound-payloads'

// Sufijo único por corrida: datos namespaced, sin colisión entre corridas ni
// con datos reales de la Neon dev compartida.
const RUN = `${Date.now().toString(36)}-${Math.floor(Math.random() * 36 ** 4).toString(36)}`
// Variante alfanumérica para BSUIDs (el patrón no admite '-').
const RUN_ALNUM = RUN.replace(/-/g, '')
// Base numérica para teléfonos estilo Cloud API (solo dígitos, sin '+').
const PHONE_BASE = String(Date.now()).slice(-8)

const bsuidFor = (tag: string): string => `AR.${RUN_ALNUM}${tag}`
const phoneFor = (index: number): string => `54911${PHONE_BASE}${index}`
const wamidFor = (tag: string): string => `wamid.${RUN}.${tag}`

interface SeedIds {
  orgId: string
  channelId: string
  channelToken: string
  webhookSecret: string
  phoneNumberId: string
  /** Mensaje OUT sembrado (status SENT) para los tests de statuses. */
  outWamid: string
  outMessageId: string
}

const seeded: { a?: SeedIds; b?: SeedIds } = {}

/**
 * Ids de orgs YA creadas, registrados apenas existen: si el seed muere a
 * mitad de camino, el teardown igual sabe qué borrar.
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

/** POST real al route handler, con la Request que armaría 360dialog. */
async function postWebhook(input: {
  token: string
  secret: string | null
  payload?: unknown
  rawBody?: string
}): Promise<Response> {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (input.secret !== null) headers.set('authorization', `Bearer ${input.secret}`)
  const body = input.rawBody ?? JSON.stringify(input.payload)
  const request = new Request(`http://localhost/api/motor/webhook/${input.token}`, {
    method: 'POST',
    headers,
    body,
  })
  return POST(request, { params: Promise.resolve({ channelToken: input.token }) })
}

/**
 * Siembra una org completa: canal CON credenciales de webhook + contacto con
 * un mensaje OUT ya enviado (para los tests de statuses). Todo vía helper.
 */
async function seedOrg(tag: 'a' | 'b'): Promise<SeedIds> {
  const org = await unsafeGlobalQuery(
    'seed motor-inbound: alta de organización efímera de test (crear tenants es global)',
    (c) =>
      c.organization.create({
        data: { companyName: `Motor INBOUND ${tag.toUpperCase()} ${RUN}`, slug: `motor-inbound-${tag}-${RUN}` },
        select: { id: true },
      }),
  )
  createdOrgIds.push(org.id)
  const scope = forOrg(org.id)
  const credentials = generateChannelWebhookCredentials()
  const channel = await scope.wabaChannel.create({
    phoneNumberId: `pn-inbound-${tag}-${RUN}`,
    wabaId: `waba-inbound-${tag}-${RUN}`,
    displayPhoneNumber: '+54 9 11 5555-5555',
    channelToken: credentials.channelToken,
    webhookSecretHash: credentials.webhookSecretHash,
  })
  const identity = await scope.contactIdentity.create({
    channelType: 'WHATSAPP',
    externalId: bsuidFor(`Out${tag.toUpperCase()}`),
    waId: phoneFor(tag === 'a' ? 8 : 9),
  })
  const conversation = await scope.motorConversation.create({
    contactIdentityId: identity.id,
    wabaChannelId: channel.id,
  })
  const outMessage = await scope.motorMessage.create({
    conversationId: conversation.id,
    direction: 'OUT',
    body: `respuesta enviada por ${tag}`,
    messageType: 'text',
    status: 'SENT',
    providerMessageId: wamidFor(`out-${tag}`),
  })
  if (outMessage.providerMessageId === null) {
    throw new Error('SEED ROTO: el mensaje OUT quedó sin providerMessageId — los tests de status no tienen ancla.')
  }
  return {
    orgId: org.id,
    channelId: channel.id,
    channelToken: credentials.channelToken,
    webhookSecret: credentials.webhookSecret,
    phoneNumberId: `pn-inbound-${tag}-${RUN}`,
    outWamid: outMessage.providerMessageId,
    outMessageId: outMessage.id,
  }
}

test.describe('B1-S1 — webhook de entrada 360dialog (auth, identidad, idempotencia)', () => {
  test.beforeAll(async () => {
    seeded.a = await seedOrg('a')
    seeded.b = await seedOrg('b')

    // Verificación DURA del seed contra la DB (ground truth, sin el helper).
    const check = await unsafeGlobalQuery('seed motor-inbound: verificación dura del seed', async (c) => ({
      orgs: await c.organization.count({ where: { id: { in: createdOrgIds } } }),
      channels: await c.wabaChannel.count({
        where: { organizationId: { in: createdOrgIds }, channelToken: { not: null }, webhookSecretHash: { not: null } },
      }),
      outMessages: await c.motorMessage.count({
        where: { organizationId: { in: createdOrgIds }, direction: 'OUT' },
      }),
    }))
    if (check.orgs !== 2 || check.channels !== 2 || check.outMessages !== 2) {
      throw new Error(
        `SEED ROTO: se esperaba orgs=2/channels=2/outMessages=2 y hay ` +
          `orgs=${check.orgs}/channels=${check.channels}/outMessages=${check.outMessages}. ` +
          'La suite falla acá a propósito — prohibido continuar con seed parcial.',
      )
    }
  })

  test.afterAll(async () => {
    if (createdOrgIds.length === 0) return
    await unsafeGlobalQuery(
      'teardown motor-inbound: borrar por id exacto las orgs efímeras creadas (cascade limpia motor_*)',
      (c) => c.organization.deleteMany({ where: { id: { in: createdOrgIds } } }),
    )
  })

  test('(a) autenticación: secret inválido, header ausente y token desconocido → 401 y CERO escritura', async () => {
    const a = mustSeed('a')
    const wamid = wamidFor('auth')
    const payload = inboundTextMessagePayload({
      phoneNumberId: a.phoneNumberId,
      address: phoneFor(0),
      bsuid: bsuidFor('auth'),
      wamid,
    })

    const wrongSecret = await postWebhook({ token: a.channelToken, secret: 'a'.repeat(64), payload })
    expect(wrongSecret.status).toBe(401)

    const missingHeader = await postWebhook({ token: a.channelToken, secret: null, payload })
    expect(missingHeader.status).toBe(401)

    const unknownToken = await postWebhook({ token: 'f'.repeat(64), secret: a.webhookSecret, payload })
    expect(unknownToken.status).toBe(401)

    const malformedToken = await postWebhook({ token: 'no-es-un-token', secret: a.webhookSecret, payload })
    expect(malformedToken.status).toBe(401)

    // Ground truth: ninguno de los intentos escribió nada.
    const written = await unsafeGlobalQuery('caso (a): verificar cero escritura tras 401', async (c) => ({
      messages: await c.motorMessage.count({ where: { providerMessageId: wamid } }),
      identities: await c.contactIdentity.count({ where: { externalId: bsuidFor('auth') } }),
    }))
    expect(written.messages).toBe(0)
    expect(written.identities).toBe(0)
  })

  test('(b) mensaje con teléfono + BSUID: identidad, conversación y mensaje quedan persistidos', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)
    const bsuid = bsuidFor('b1')
    const phone = phoneFor(1)
    const wamid = wamidFor('b1')

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: inboundTextMessagePayload({
        phoneNumberId: a.phoneNumberId,
        address: phone,
        bsuid,
        wamid,
        text: 'Hola, quiero una demo',
      }),
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })

    const identity = await scope.contactIdentity.findFirst({
      where: { channelType: 'WHATSAPP', externalId: bsuid },
    })
    expect(identity).not.toBeNull()
    expect(identity?.waId).toBe(phone)
    expect(identity?.reconciledAt).toBeNull()

    const message = await scope.motorMessage.findFirst({ where: { providerMessageId: wamid } })
    expect(message).not.toBeNull()
    expect(message?.direction).toBe('IN')
    expect(message?.status).toBe('RECEIVED')
    expect(message?.messageType).toBe('text')
    expect(message?.body).toBe('Hola, quiero una demo')

    const conversation = await scope.motorConversation.findById(message?.conversationId ?? '')
    expect(conversation).not.toBeNull()
    expect(conversation?.contactIdentityId).toBe(identity?.id)
    expect(conversation?.wabaChannelId).toBe(a.channelId)
    expect(conversation?.status).toBe('OPEN')
    expect(conversation?.lastInboundAt).not.toBeNull()
  })

  test('(c) el retry del BSP con el mismo wamid deja UNA sola fila (idempotencia)', async () => {
    const a = mustSeed('a')
    const wamid = wamidFor('c1')
    const payload = inboundTextMessagePayload({
      phoneNumberId: a.phoneNumberId,
      address: phoneFor(2),
      bsuid: bsuidFor('c1'),
      wamid,
    })

    const first = await postWebhook({ token: a.channelToken, secret: a.webhookSecret, payload })
    const retry = await postWebhook({ token: a.channelToken, secret: a.webhookSecret, payload })
    expect(first.status).toBe(200)
    expect(retry.status).toBe(200)

    const count = await unsafeGlobalQuery('caso (c): contar filas del wamid duplicado', (c) =>
      c.motorMessage.count({ where: { providerMessageId: wamid } }),
    )
    expect(count).toBe(1)
  })

  test('(d) mensaje BSUID-only (sin teléfono en wa_id/from) crea la identidad SIN waId', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)
    const bsuid = bsuidFor('d1')

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: inboundTextMessagePayload({
        phoneNumberId: a.phoneNumberId,
        // wa_id y from traen el BSUID (jun-2026+): NO es un teléfono y no
        // debe guardarse como waId.
        address: bsuid,
        bsuid,
        wamid: wamidFor('d1'),
      }),
    })
    expect(response.status).toBe(200)

    const identity = await scope.contactIdentity.findFirst({
      where: { channelType: 'WHATSAPP', externalId: bsuid },
    })
    expect(identity).not.toBeNull()
    expect(identity?.waId).toBeNull()
  })

  test('(e) teléfono-luego-BSUID: la fila legacy se reconcilia (backfill) en vez de duplicarse', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)
    const phone = phoneFor(3)
    const bsuid = bsuidFor('e1')

    // Fila LEGACY pre-BSUID: externalId era el teléfono (así llegaban antes
    // de la migración de Meta), sin reconciliar.
    const legacy = await scope.contactIdentity.create({
      channelType: 'WHATSAPP',
      externalId: phone,
      waId: phone,
    })

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: inboundTextMessagePayload({
        phoneNumberId: a.phoneNumberId,
        address: phone,
        bsuid,
        wamid: wamidFor('e1'),
      }),
    })
    expect(response.status).toBe(200)

    // MISMA fila (id preservado), ahora BSUID-first y marcada como reconciliada.
    const reconciled = await scope.contactIdentity.findById(legacy.id)
    expect(reconciled?.externalId).toBe(bsuid)
    expect(reconciled?.waId).toBe(phone)
    expect(reconciled?.reconciledAt).not.toBeNull()

    // Y NO se creó una segunda identidad para el mismo contacto.
    const rows = await scope.contactIdentity.findMany({
      where: { channelType: 'WHATSAPP', OR: [{ externalId: bsuid }, { externalId: phone }, { waId: phone }] },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]?.id).toBe(legacy.id)
  })

  test('(f) el MISMO BSUID en dos orgs crea DOS identidades (unique compuesto por org)', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const bsuid = bsuidFor('f1')
    const phone = phoneFor(4)

    const toA = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: inboundTextMessagePayload({
        phoneNumberId: a.phoneNumberId,
        address: phone,
        bsuid,
        wamid: wamidFor('f1-a'),
      }),
    })
    const toB = await postWebhook({
      token: b.channelToken,
      secret: b.webhookSecret,
      payload: inboundTextMessagePayload({
        phoneNumberId: b.phoneNumberId,
        address: phone,
        bsuid,
        wamid: wamidFor('f1-b'),
      }),
    })
    expect(toA.status).toBe(200)
    expect(toB.status).toBe(200)

    const rows = await unsafeGlobalQuery('caso (f): unique compuesto por org sobre el mismo BSUID', (c) =>
      c.contactIdentity.findMany({ where: { externalId: bsuid }, select: { organizationId: true } }),
    )
    expect(rows).toHaveLength(2)
    expect(new Set(rows.map((r) => r.organizationId))).toEqual(new Set([a.orgId, b.orgId]))
  })

  test('(g) lastInboundAt avanza con cada mensaje y la conversación OPEN se REUTILIZA', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)
    const bsuid = bsuidFor('g1')
    const phone = phoneFor(5)

    const first = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: inboundTextMessagePayload({
        phoneNumberId: a.phoneNumberId,
        address: phone,
        bsuid,
        wamid: wamidFor('g1-1'),
      }),
    })
    expect(first.status).toBe(200)

    const identity = await scope.contactIdentity.findFirst({
      where: { channelType: 'WHATSAPP', externalId: bsuid },
    })
    const afterFirst = await scope.motorConversation.findFirst({
      where: { contactIdentityId: identity?.id ?? '' },
    })
    expect(afterFirst?.lastInboundAt).not.toBeNull()
    const firstInboundAt = afterFirst?.lastInboundAt?.getTime() ?? 0

    const second = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: inboundTextMessagePayload({
        phoneNumberId: a.phoneNumberId,
        address: phone,
        bsuid,
        wamid: wamidFor('g1-2'),
      }),
    })
    expect(second.status).toBe(200)

    const conversations = await scope.motorConversation.findMany({
      where: { contactIdentityId: identity?.id ?? '' },
    })
    expect(conversations).toHaveLength(1)
    expect(conversations[0]?.id).toBe(afterFirst?.id)
    expect(conversations[0]?.lastInboundAt?.getTime() ?? 0).toBeGreaterThan(firstInboundAt)
  })

  test('(h) statuses: progresión monotónica, scoping por org, stale y failed SIN contacts', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const scopeA = forOrg(a.orgId)
    const scopeB = forOrg(b.orgId)

    // delivered sobre el OUT sembrado de A → DELIVERED.
    const delivered = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: statusPayload({
        phoneNumberId: a.phoneNumberId,
        wamid: a.outWamid,
        status: 'delivered',
        recipientAddress: phoneFor(8),
        recipientBsuid: bsuidFor('OutA'),
      }),
    })
    expect(delivered.status).toBe(200)
    expect((await scopeA.motorMessage.findById(a.outMessageId))?.status).toBe('DELIVERED')

    // El wamid de A llegando por el canal de B (secret válido de B): el scope
    // de B no lo alcanza → no aplica y el mensaje de A queda intacto.
    const crossOrg = await postWebhook({
      token: b.channelToken,
      secret: b.webhookSecret,
      payload: statusPayload({
        phoneNumberId: b.phoneNumberId,
        wamid: a.outWamid,
        status: 'read',
        recipientAddress: phoneFor(9),
        recipientBsuid: bsuidFor('OutB'),
      }),
    })
    expect(crossOrg.status).toBe(200)
    expect((await scopeA.motorMessage.findById(a.outMessageId))?.status).toBe('DELIVERED')

    // read por el canal correcto → READ; un delivered tardío NO retrocede.
    await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: statusPayload({
        phoneNumberId: a.phoneNumberId,
        wamid: a.outWamid,
        status: 'read',
        recipientAddress: phoneFor(8),
        recipientBsuid: bsuidFor('OutA'),
      }),
    })
    await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: statusPayload({
        phoneNumberId: a.phoneNumberId,
        wamid: a.outWamid,
        status: 'delivered',
        recipientAddress: phoneFor(8),
        recipientBsuid: bsuidFor('OutA'),
      }),
    })
    expect((await scopeA.motorMessage.findById(a.outMessageId))?.status).toBe('READ')

    // failed sobre el OUT de B, SIN bloque contacts (dato verificado): aplica
    // y guarda el detalle del error del BSP.
    const failed = await postWebhook({
      token: b.channelToken,
      secret: b.webhookSecret,
      payload: failedStatusPayload({
        phoneNumberId: b.phoneNumberId,
        wamid: b.outWamid,
        recipientBsuid: bsuidFor('OutB'),
      }),
    })
    expect(failed.status).toBe(200)
    const failedMessage = await scopeB.motorMessage.findById(b.outMessageId)
    expect(failedMessage?.status).toBe('FAILED')
    expect(failedMessage?.error).toContain('131047')
  })

  test('(i) user_id_update migra la identidad y deja la transición; un ID viejo desconocido deja SOLO la transición', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)
    const oldBsuid = bsuidFor('i1old')
    const newBsuid = bsuidFor('i1new')

    // La identidad existe porque el contacto ya escribió.
    await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: inboundTextMessagePayload({
        phoneNumberId: a.phoneNumberId,
        address: phoneFor(6),
        bsuid: oldBsuid,
        wamid: wamidFor('i1'),
      }),
    })
    const before = await scope.contactIdentity.findFirst({
      where: { channelType: 'WHATSAPP', externalId: oldBsuid },
    })
    expect(before).not.toBeNull()

    const migrate = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: userIdUpdatePayload({ phoneNumberId: a.phoneNumberId, oldBsuid, newBsuid }),
    })
    expect(migrate.status).toBe(200)

    // MISMA fila, externalId nuevo; el waId viejo se ANULA (el número pudo
    // reasignarse a otra persona); transición registrada apuntándola.
    const after = await scope.contactIdentity.findById(before?.id ?? '')
    expect(after?.externalId).toBe(newBsuid)
    expect(after?.waId).toBeNull()
    const transition = await scope.contactIdentityTransition.findFirst({
      where: { fromExternalId: oldBsuid, toExternalId: newBsuid },
    })
    expect(transition).not.toBeNull()
    expect(transition?.contactIdentityId).toBe(before?.id)
    expect(transition?.source).toBe('user_id_update')

    // ID viejo que no matchea nada: 200, transición con identidad null, y NO
    // se crea ninguna identidad nueva.
    const ghostOld = bsuidFor('i2ghost')
    const ghostNew = bsuidFor('i2new')
    const unknown = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: userIdUpdatePayload({ phoneNumberId: a.phoneNumberId, oldBsuid: ghostOld, newBsuid: ghostNew }),
    })
    expect(unknown.status).toBe(200)
    const ghostTransition = await scope.contactIdentityTransition.findFirst({
      where: { fromExternalId: ghostOld, toExternalId: ghostNew },
    })
    expect(ghostTransition).not.toBeNull()
    expect(ghostTransition?.contactIdentityId).toBeNull()
    expect(ghostTransition?.source).toBe('user_id_update:unknown-identity')
    const ghostIdentities = await scope.contactIdentity.count({ externalId: { in: [ghostOld, ghostNew] } })
    expect(ghostIdentities).toBe(0)
  })

  test('(j) evento desconocido y shape inválido: 200/400 según corresponda, sin escrituras', async () => {
    const a = mustSeed('a')

    const baseline = await unsafeGlobalQuery('caso (j): baseline de filas motor de la org A', (c) =>
      c.motorMessage.count({ where: { organizationId: a.orgId } }),
    )

    // Evento real de otro producto: autenticado → 200 sin drama (log y listo).
    const unknown = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: unknownEventPayload(a.phoneNumberId),
    })
    expect(unknown.status).toBe(200)

    // Body que no es JSON → 400.
    const notJson = await postWebhook({ token: a.channelToken, secret: a.webhookSecret, rawBody: 'esto no es json{{{' })
    expect(notJson.status).toBe(400)

    // JSON válido pero envelope irreconocible → 400.
    const badEnvelope = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: { object: 'whatsapp_business_account', entry: 'no-es-un-array' },
    })
    expect(badEnvelope.status).toBe(400)

    const after = await unsafeGlobalQuery('caso (j): la org A no ganó filas', (c) =>
      c.motorMessage.count({ where: { organizationId: a.orgId } }),
    )
    expect(after).toBe(baseline)
  })

  test('(k) defensa en profundidad: metadata.phone_number_id ajeno al canal del token NO escribe', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const bsuid = bsuidFor('k1')

    // Payload "de B" (metadata de B) entrando por la URL + secret de A: el
    // cross-check de tenant lo descarta aunque la autenticación sea válida.
    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: inboundTextMessagePayload({
        phoneNumberId: b.phoneNumberId,
        address: phoneFor(7),
        bsuid,
        wamid: wamidFor('k1'),
      }),
    })
    expect(response.status).toBe(200)

    const written = await unsafeGlobalQuery('caso (k): el payload ajeno no escribió en ninguna org', async (c) => ({
      identities: await c.contactIdentity.count({ where: { externalId: bsuid } }),
      messages: await c.motorMessage.count({ where: { providerMessageId: wamidFor('k1') } }),
    }))
    expect(written.identities).toBe(0)
    expect(written.messages).toBe(0)
  })
})
