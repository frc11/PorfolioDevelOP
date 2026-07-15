/**
 * B1-S3 — Suite de integración de eventos de SALUD del webhook: ciclo de vida
 * de plantillas (message_template_status_update), tier de mensajería
 * (phone_number_quality_update) y estado del número (account_update), más
 * las alertas operativas (MotorAlert) que disparan.
 *
 * Invoca el MISMO route handler real que motor-inbound.spec.ts
 * (POST de src/app/api/motor/webhook/[channelToken]/route.ts), contra la
 * misma Neon dev.
 *
 * Reglas heredadas de B0/B1-S1: el seed es PARTE del test (prohibido
 * test.skip); teardown por id EXACTO (cascade limpia motor_*).
 *
 * Corre con: npm run test:integration   (filtrado: npx playwright test
 * --config=playwright.integration.config.ts motor-health)
 */
import { test, expect } from '@playwright/test'
import { forOrg, unsafeGlobalQuery } from '../../src/lib/isolation'
import { generateChannelWebhookCredentials } from '../../src/modules/motor/domain/channel-credentials'
import { POST } from '../../src/app/api/motor/webhook/[channelToken]/route'
import {
  accountUpdatePayload,
  phoneQualityUpdatePayload,
  templateStatusUpdatePayload,
} from './fixtures/motor-inbound-payloads'

const RUN = `${Date.now().toString(36)}-${Math.floor(Math.random() * 36 ** 4).toString(36)}`

interface SeedIds {
  orgId: string
  channelId: string
  channelToken: string
  webhookSecret: string
}

const seeded: { a?: SeedIds; b?: SeedIds } = {}
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
  secret: string
  payload: unknown
}): Promise<Response> {
  const headers = new Headers({
    'content-type': 'application/json',
    authorization: `Bearer ${input.secret}`,
  })
  const request = new Request(
    `http://localhost/api/motor/webhook/${input.token}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(input.payload),
    },
  )
  return POST(request, {
    params: Promise.resolve({ channelToken: input.token }),
  })
}

/** Siembra una org con un canal CON credenciales de webhook. Sin plantillas
 *  compartidas: cada test crea las suyas, taggeadas, para no interferir entre sí. */
async function seedOrg(tag: 'a' | 'b'): Promise<SeedIds> {
  const org = await unsafeGlobalQuery(
    'seed motor-health: alta de organización efímera de test (crear tenants es global)',
    (c) =>
      c.organization.create({
        data: {
          companyName: `Motor HEALTH ${tag.toUpperCase()} ${RUN}`,
          slug: `motor-health-${tag}-${RUN}`,
        },
        select: { id: true },
      }),
  )
  createdOrgIds.push(org.id)
  const scope = forOrg(org.id)
  const credentials = generateChannelWebhookCredentials()
  const channel = await scope.wabaChannel.create({
    phoneNumberId: `pn-health-${tag}-${RUN}`,
    wabaId: `waba-health-${tag}-${RUN}`,
    displayPhoneNumber: '+54 9 11 5555-5555',
    channelToken: credentials.channelToken,
    webhookSecretHash: credentials.webhookSecretHash,
  })
  return {
    orgId: org.id,
    channelId: channel.id,
    channelToken: credentials.channelToken,
    webhookSecret: credentials.webhookSecret,
  }
}

test.describe('B1-S3 — salud del canal (plantillas, tier, estado del número, alertas)', () => {
  test.beforeAll(async () => {
    seeded.a = await seedOrg('a')
    seeded.b = await seedOrg('b')

    const check = await unsafeGlobalQuery(
      'seed motor-health: verificación dura del seed',
      async (c) => ({
        orgs: await c.organization.count({
          where: { id: { in: createdOrgIds } },
        }),
        channels: await c.wabaChannel.count({
          where: {
            organizationId: { in: createdOrgIds },
            channelToken: { not: null },
          },
        }),
      }),
    )
    if (check.orgs !== 2 || check.channels !== 2) {
      throw new Error(
        `SEED ROTO: se esperaba orgs=2/channels=2 y hay orgs=${check.orgs}/channels=${check.channels}. ` +
          'La suite falla acá a propósito — prohibido continuar con seed parcial.',
      )
    }
  })

  test.afterAll(async () => {
    if (createdOrgIds.length === 0) return
    await unsafeGlobalQuery(
      'teardown motor-health: borrar por id exacto las orgs efímeras creadas (cascade limpia motor_*)',
      (c) =>
        c.organization.deleteMany({ where: { id: { in: createdOrgIds } } }),
    )
  })

  test('(a) message_template_status_update APPROVED actualiza el status, sin alerta', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)
    const template = await scope.motorTemplate.create({
      wabaChannelId: a.channelId,
      name: `tpl-a1-${RUN}`,
      language: 'es_AR',
      category: 'UTILITY',
      body: 'Cuerpo de prueba',
      status: 'PENDING',
      providerTemplateId: `provider-a1-${RUN}`,
    })

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: templateStatusUpdatePayload({
        event: 'APPROVED',
        templateId: template.providerTemplateId ?? undefined,
        name: template.name,
        language: template.language,
      }),
    })
    expect(response.status).toBe(200)

    const updated = await scope.motorTemplate.findById(template.id)
    expect(updated?.status).toBe('APPROVED')

    const alerts = await scope.motorAlert.findMany({
      where: { wabaChannelId: a.channelId },
    })
    expect(alerts).toHaveLength(0)
  })

  test('(b) message_template_status_update REJECTED actualiza el status y crea UNA alerta (retry no duplica)', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)
    const template = await scope.motorTemplate.create({
      wabaChannelId: a.channelId,
      name: `tpl-b1-${RUN}`,
      language: 'es_AR',
      category: 'UTILITY',
      body: 'Cuerpo de prueba',
      status: 'APPROVED',
      providerTemplateId: `provider-b1-${RUN}`,
    })
    const payload = templateStatusUpdatePayload({
      event: 'REJECTED',
      templateId: template.providerTemplateId ?? undefined,
      name: template.name,
      language: template.language,
      reason: 'SCAM',
    })

    const first = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload,
    })
    expect(first.status).toBe(200)

    const updated = await scope.motorTemplate.findById(template.id)
    expect(updated?.status).toBe('REJECTED')

    const alertsAfterFirst = await scope.motorAlert.findMany({
      where: { wabaChannelId: a.channelId, type: 'TEMPLATE_REJECTED' },
    })
    expect(alertsAfterFirst).toHaveLength(1)
    expect(alertsAfterFirst[0]?.severity).toBe('HIGH')
    expect(alertsAfterFirst[0]?.description).toContain('SCAM')

    // Retry del BSP con el MISMO evento: el status ya está en REJECTED (no
    // regresiona) y la alerta NO se duplica (dedupe de 24h).
    const retry = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload,
    })
    expect(retry.status).toBe(200)
    const alertsAfterRetry = await scope.motorAlert.findMany({
      where: { wabaChannelId: a.channelId, type: 'TEMPLATE_REJECTED' },
    })
    expect(alertsAfterRetry).toHaveLength(1)
  })

  test('(c) message_template_status_update PAUSED actualiza el status, sin alerta', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)
    const template = await scope.motorTemplate.create({
      wabaChannelId: a.channelId,
      name: `tpl-c1-${RUN}`,
      language: 'es_AR',
      category: 'UTILITY',
      body: 'Cuerpo de prueba',
      status: 'APPROVED',
      providerTemplateId: `provider-c1-${RUN}`,
    })

    // Baseline ANTES del request: el canal es compartido entre tests de esta
    // suite, así que "sin alerta nueva" se mide relativo, no en absoluto
    // (otro caso — REJECTED — ya puede haber dejado una alerta en el canal).
    const before = await scope.motorAlert.count({
      wabaChannelId: a.channelId,
      type: 'TEMPLATE_REJECTED',
    })

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: templateStatusUpdatePayload({
        event: 'PAUSED',
        templateId: template.providerTemplateId ?? undefined,
        name: template.name,
        language: template.language,
      }),
    })
    expect(response.status).toBe(200)

    const updated = await scope.motorTemplate.findById(template.id)
    expect(updated?.status).toBe('PAUSED')

    const after = await scope.motorAlert.count({
      wabaChannelId: a.channelId,
      type: 'TEMPLATE_REJECTED',
    })
    expect(after).toBe(before)
  })

  test('(d) message_template_status_update con event sin mapeo (FLAGGED): log-only, status NO cambia', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)
    const template = await scope.motorTemplate.create({
      wabaChannelId: a.channelId,
      name: `tpl-d1-${RUN}`,
      language: 'es_AR',
      category: 'UTILITY',
      body: 'Cuerpo de prueba',
      status: 'APPROVED',
      providerTemplateId: `provider-d1-${RUN}`,
    })

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: templateStatusUpdatePayload({
        event: 'FLAGGED',
        templateId: template.providerTemplateId ?? undefined,
        name: template.name,
        language: template.language,
      }),
    })
    expect(response.status).toBe(200)

    const untouched = await scope.motorTemplate.findById(template.id)
    expect(untouched?.status).toBe('APPROVED')
  })

  test('(e) message_template_status_update sin plantilla local que matchee: 200, sin escritura ni alerta', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)

    const beforeTemplates = await scope.motorTemplate.count({
      wabaChannelId: a.channelId,
    })
    // Baseline relativo (ver comentario del caso (c)): otro caso ya pudo haber
    // dejado una alerta TEMPLATE_REJECTED en este canal compartido.
    const beforeAlerts = await scope.motorAlert.count({
      wabaChannelId: a.channelId,
      type: 'TEMPLATE_REJECTED',
    })

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: templateStatusUpdatePayload({
        event: 'REJECTED',
        templateId: `provider-fantasma-${RUN}`,
        name: `tpl-fantasma-${RUN}`,
        language: 'es_AR',
      }),
    })
    expect(response.status).toBe(200)

    const afterTemplates = await scope.motorTemplate.count({
      wabaChannelId: a.channelId,
    })
    expect(afterTemplates).toBe(beforeTemplates)
    const afterAlerts = await scope.motorAlert.count({
      wabaChannelId: a.channelId,
      type: 'TEMPLATE_REJECTED',
    })
    expect(afterAlerts).toBe(beforeAlerts)
  })

  test('(f) phone_number_quality_update con tier confirmado: messagingLimitTier se persiste, qualityRating queda UNKNOWN', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: phoneQualityUpdatePayload({ currentLimit: 'TIER_10K' }),
    })
    expect(response.status).toBe(200)

    const channel = await scope.wabaChannel.findById(a.channelId)
    expect(channel?.messagingLimitTier).toBe('TIER_10K')
    // Documentado: el color de calidad no tiene shape confirmado — nunca se popula.
    expect(channel?.qualityRating).toBe('UNKNOWN')
  })

  test('(g) phone_number_quality_update sin current_limit reconocible: log-only, tier queda UNKNOWN', async () => {
    const b = mustSeed('b')
    const scope = forOrg(b.orgId)

    const response = await postWebhook({
      token: b.channelToken,
      secret: b.webhookSecret,
      payload: phoneQualityUpdatePayload({}),
    })
    expect(response.status).toBe(200)

    const channel = await scope.wabaChannel.findById(b.channelId)
    expect(channel?.messagingLimitTier).toBe('UNKNOWN')
  })

  test('(h) account_update ACCOUNT_VIOLATION: channelStatus RESTRICTED + alerta HIGH', async () => {
    const b = mustSeed('b')
    const scope = forOrg(b.orgId)

    const response = await postWebhook({
      token: b.channelToken,
      secret: b.webhookSecret,
      payload: accountUpdatePayload({ event: 'ACCOUNT_VIOLATION' }),
    })
    expect(response.status).toBe(200)

    const channel = await scope.wabaChannel.findById(b.channelId)
    expect(channel?.channelStatus).toBe('RESTRICTED')

    const alerts = await scope.motorAlert.findMany({
      where: { wabaChannelId: b.channelId, type: 'PHONE_RESTRICTED_OR_BANNED' },
    })
    expect(alerts).toHaveLength(1)
    expect(alerts[0]?.severity).toBe('HIGH')
  })

  test('(i) account_update ACCOUNT_DELETED: channelStatus BANNED + alerta CRITICAL', async () => {
    const a = mustSeed('a')
    const scope = forOrg(a.orgId)

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: accountUpdatePayload({ event: 'ACCOUNT_DELETED' }),
    })
    expect(response.status).toBe(200)

    const updated = await scope.wabaChannel.findById(a.channelId)
    expect(updated?.channelStatus).toBe('BANNED')

    const alerts = await scope.motorAlert.findMany({
      where: { wabaChannelId: a.channelId, type: 'PHONE_RESTRICTED_OR_BANNED' },
    })
    expect(alerts.some((alert) => alert.severity === 'CRITICAL')).toBe(true)
  })

  test('(j) account_update sin mapeo (PARTNER_ADDED): channelStatus NO cambia, sin alerta', async () => {
    const b = mustSeed('b')
    const scope = forOrg(b.orgId)
    const before = await scope.wabaChannel.findById(b.channelId)

    const response = await postWebhook({
      token: b.channelToken,
      secret: b.webhookSecret,
      payload: accountUpdatePayload({ event: 'PARTNER_ADDED' }),
    })
    expect(response.status).toBe(200)

    const after = await scope.wabaChannel.findById(b.channelId)
    expect(after?.channelStatus).toBe(before?.channelStatus)
  })

  test('(k) aislamiento: un evento de salud autenticado con el token de A NUNCA toca el canal/alertas de B', async () => {
    const a = mustSeed('a')
    const b = mustSeed('b')
    const scopeB = forOrg(b.orgId)
    const beforeB = await scopeB.wabaChannel.findById(b.channelId)
    const beforeAlertsB = await scopeB.motorAlert.count({
      wabaChannelId: b.channelId,
    })

    const response = await postWebhook({
      token: a.channelToken,
      secret: a.webhookSecret,
      payload: accountUpdatePayload({ event: 'ACCOUNT_VIOLATION' }),
    })
    expect(response.status).toBe(200)

    const afterB = await scopeB.wabaChannel.findById(b.channelId)
    expect(afterB?.channelStatus).toBe(beforeB?.channelStatus)
    const afterAlertsB = await scopeB.motorAlert.count({
      wabaChannelId: b.channelId,
    })
    expect(afterAlertsB).toBe(beforeAlertsB)

    // Y el canal de A sí quedó restringido — confirma que el evento se aplicó
    // (a algún lado) y que "nada cambió en B" no es un falso negativo por 401/500.
    const scopeA = forOrg(a.orgId)
    const afterA = await scopeA.wabaChannel.findById(a.channelId)
    expect(afterA?.channelStatus).toBe('RESTRICTED')
  })
})
