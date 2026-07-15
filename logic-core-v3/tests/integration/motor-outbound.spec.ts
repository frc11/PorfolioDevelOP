/**
 * B1-S2 — Suite de integración del adaptador BSP de SALIDA (envío 360dialog).
 *
 * Invoca el servicio REAL `sendMotorMessage` con el HTTP del provider MOCKEADO
 * (fetch inyectado), contra la MISMA Neon dev y el mismo rol que la app
 * (DATABASE_URL de .env.local vía playwright.integration.config.ts). Cubre:
 * texto en ventana OK; texto FUERA de ventana RECHAZADO sin llamada HTTP;
 * plantilla fuera de ventana OK; 5xx reintenta / 4xx no; idempotencyKey
 * repetido no duplica; y la API key JAMÁS aparece en los logs (assertion sobre
 * el logger inyectado) ni en la fila persistida.
 *
 * Reglas heredadas de B0: el seed es PARTE del test (si falla, la suite FALLA
 * explícito — prohibido test.skip); teardown por id EXACTO (Neon compartida).
 */
import { test, expect } from '@playwright/test'
import { forOrg, unsafeGlobalQuery } from '../../src/lib/isolation'
import { createSecretBox } from '../../src/lib/crypto/secret-box'
import { sendMotorMessage, type SendMessageDeps } from '../../src/modules/motor/services/sendMessage'

// La caja de cifrado necesita la env key. Si el entorno no la trae, se fija una
// key de test determinística (64 hex = 32 bytes). El seed y el servicio leen la
// MISMA env en runtime, así que cifran/descifran con la misma key.
const TEST_CHANNEL_KEY = 'ab'.repeat(32)
if (!process.env.MOTOR_CHANNEL_SECRET_KEY) {
  process.env.MOTOR_CHANNEL_SECRET_KEY = TEST_CHANNEL_KEY
}

const RUN = `${Date.now().toString(36)}-${Math.floor(Math.random() * 36 ** 4).toString(36)}`
const RUN_ALNUM = RUN.replace(/-/g, '')
const PHONE_BASE = String(Date.now()).slice(-8)
const API_KEY_PLAIN = `D360-APIKEY-${RUN_ALNUM}` // secreto que NO debe aparecer en logs

const HOUR_MS = 60 * 60 * 1000

interface Seed {
  orgId: string
  channelId: string
  conversationId: string
  phone: string
}

const createdOrgIds: string[] = []
let seed: Seed | undefined

function mustSeed(): Seed {
  if (!seed) {
    throw new Error('SEED ROTO: la org no quedó sembrada — prohibido test.skip (regla del sprint).')
  }
  return seed
}

// ── Doble del HTTP del provider ─────────────────────────────────────────────

interface FetchCall {
  url: string
  headers: Record<string, string>
  body: string
}
type Responder = (call: FetchCall, index: number) => { status: number; body: string }

function makeFakeFetch(responder: Responder): { fetchImpl: typeof fetch; calls: FetchCall[] } {
  const calls: FetchCall[] = []
  const fetchImpl = (async (input: unknown, init?: RequestInit) => {
    const headers: Record<string, string> = {}
    const raw = (init?.headers ?? {}) as Record<string, string>
    for (const key of Object.keys(raw)) headers[key.toLowerCase()] = raw[key]
    const call: FetchCall = { url: String(input), headers, body: String(init?.body ?? '') }
    calls.push(call)
    const res = responder(call, calls.length - 1)
    return new Response(res.body, { status: res.status, headers: { 'content-type': 'application/json' } })
  }) as unknown as typeof fetch
  return { fetchImpl, calls }
}

function okBody(wamid: string): string {
  return JSON.stringify({ messages: [{ id: wamid }] })
}
function errBody(code: number, message = 'provider error'): string {
  return JSON.stringify({ error: { code, message } })
}

// Logger que captura todo lo emitido (evento + data serializada) para el
// assertion de "la API key nunca se loguea".
function makeCapturingLogger(): { logger: NonNullable<SendMessageDeps['logger']>; dump: () => string } {
  const lines: string[] = []
  const record = (event: string, data?: Record<string, unknown>): void => {
    lines.push(JSON.stringify({ event, data: data ?? null }))
  }
  return {
    logger: { info: record, warn: record, error: record },
    dump: () => lines.join('\n'),
  }
}

/** Deps base: retries instantáneos (sin esperar backoff real en test). */
function baseDeps(fetchImpl: typeof fetch, extra: Partial<SendMessageDeps> = {}): SendMessageDeps {
  return { fetch: fetchImpl, retryDelaysMs: [0, 0], baseUrl: 'https://fake.360dialog.test', ...extra }
}

async function setWindow(open: boolean): Promise<void> {
  const s = mustSeed()
  const scope = forOrg(s.orgId)
  const lastInboundAt = open ? new Date() : new Date(Date.now() - 25 * HOUR_MS)
  await scope.motorConversation.update(s.conversationId, { lastInboundAt })
}

// ── Seed ────────────────────────────────────────────────────────────────────

test.describe('B1-S2 — envío de salida 360dialog (ventana, plantillas, idempotencia)', () => {
  test.beforeAll(async () => {
    const org = await unsafeGlobalQuery('seed motor-outbound: alta de org efímera de test', (c) =>
      c.organization.create({
        data: { companyName: `Motor OUTBOUND ${RUN}`, slug: `motor-outbound-${RUN}` },
        select: { id: true },
      }),
    )
    createdOrgIds.push(org.id)
    const scope = forOrg(org.id)

    const box = createSecretBox('MOTOR_CHANNEL_SECRET_KEY')
    const enc = box.encrypt(API_KEY_PLAIN)
    const channel = await scope.wabaChannel.create({
      phoneNumberId: `pn-out-${RUN}`,
      wabaId: `waba-out-${RUN}`,
      displayPhoneNumber: '+54 9 11 5555-0000',
      apiKeyEncrypted: enc.encrypted,
      apiKeyIv: enc.iv,
      apiKeyTag: enc.tag,
    })
    const phone = `54911${PHONE_BASE}0`
    const identity = await scope.contactIdentity.create({
      channelType: 'WHATSAPP',
      externalId: `AR.${RUN_ALNUM}out`,
      waId: phone,
    })
    const conversation = await scope.motorConversation.create({
      contactIdentityId: identity.id,
      wabaChannelId: channel.id,
      lastInboundAt: new Date(),
    })
    await scope.motorTemplate.create({
      wabaChannelId: channel.id,
      name: 'seguimiento',
      language: 'es',
      category: 'UTILITY',
      body: 'Hola {{1}}, seguimos tu consulta.',
      status: 'APPROVED',
    })
    await scope.motorTemplate.create({
      wabaChannelId: channel.id,
      name: 'promo_pendiente',
      language: 'es',
      category: 'SERVICE',
      body: 'Novedad {{1}}',
      status: 'PENDING',
    })

    seed = { orgId: org.id, channelId: channel.id, conversationId: conversation.id, phone }

    // Verificación dura del seed contra la DB (ground truth, sin el helper).
    const check = await unsafeGlobalQuery('seed motor-outbound: verificación dura', async (c) => ({
      channels: await c.wabaChannel.count({
        where: { organizationId: org.id, apiKeyEncrypted: { not: null } },
      }),
      templates: await c.motorTemplate.count({ where: { organizationId: org.id, status: 'APPROVED' } }),
    }))
    if (check.channels !== 1 || check.templates !== 1) {
      throw new Error(
        `SEED ROTO: channels(apiKey)=${check.channels}/approvedTemplates=${check.templates} (esperado 1/1). ` +
          'La suite falla acá a propósito.',
      )
    }
  })

  test.afterAll(async () => {
    if (createdOrgIds.length === 0) return
    await unsafeGlobalQuery('teardown motor-outbound: borrar por id exacto (cascade motor_*)', (c) =>
      c.organization.deleteMany({ where: { id: { in: createdOrgIds } } }),
    )
  })

  test('(a) texto DENTRO de ventana: despacha, persiste SENT con wamid y usa la API key como header', async () => {
    const s = mustSeed()
    await setWindow(true)
    const wamid = `wamid.${RUN}.a`
    const { fetchImpl, calls } = makeFakeFetch(() => ({ status: 200, body: okBody(wamid) }))

    const result = await sendMotorMessage(
      { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body: `hola-${RUN}-a` } },
      baseDeps(fetchImpl),
    )

    expect(result.status).toBe('sent')
    if (result.status === 'sent') {
      expect(result.wamid).toBe(wamid)
      const msg = await forOrg(s.orgId).motorMessage.findById(result.messageId)
      expect(msg?.direction).toBe('OUT')
      expect(msg?.status).toBe('SENT')
      expect(msg?.providerMessageId).toBe(wamid)
      expect(msg?.messageType).toBe('text')
    }
    // Una sola llamada, con la API key descifrada en el header y al endpoint correcto.
    expect(calls).toHaveLength(1)
    expect(calls[0]?.headers['d360-api-key']).toBe(API_KEY_PLAIN)
    expect(calls[0]?.url).toBe('https://fake.360dialog.test/messages')
    expect(calls[0]?.body).toContain(s.phone)
  })

  test('(b) texto FUERA de ventana: RECHAZADO sin ninguna llamada HTTP y sin fila persistida', async () => {
    const s = mustSeed()
    await setWindow(false)
    const body = `fuera-de-ventana-${RUN}-b`
    const { fetchImpl, calls } = makeFakeFetch(() => ({ status: 200, body: okBody('nope') }))

    const result = await sendMotorMessage(
      { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body } },
      baseDeps(fetchImpl),
    )

    expect(result.status).toBe('rejected')
    if (result.status === 'rejected') expect(result.reason).toBe('window_closed')
    // Cero HTTP y cero escritura: no "lo resuelve" mandando igual.
    expect(calls).toHaveLength(0)
    const persisted = await forOrg(s.orgId).motorMessage.count({ body })
    expect(persisted).toBe(0)
  })

  test('(c) plantilla APPROVED FUERA de ventana: despacha OK (las plantillas no dependen de la ventana)', async () => {
    const s = mustSeed()
    await setWindow(false)
    const wamid = `wamid.${RUN}.c`
    const { fetchImpl, calls } = makeFakeFetch(() => ({ status: 200, body: okBody(wamid) }))

    const result = await sendMotorMessage(
      {
        orgId: s.orgId,
        conversationId: s.conversationId,
        content: { kind: 'template', name: 'seguimiento', language: 'es', bodyParameters: ['Ana'] },
      },
      baseDeps(fetchImpl),
    )

    expect(result.status).toBe('sent')
    expect(calls).toHaveLength(1)
    // El body al provider es de tipo template con el nombre correcto.
    expect(calls[0]?.body).toContain('"type":"template"')
    expect(calls[0]?.body).toContain('seguimiento')
  })

  test('(c2) plantilla NO aprobada: RECHAZADA sin HTTP', async () => {
    const s = mustSeed()
    await setWindow(true)
    const { fetchImpl, calls } = makeFakeFetch(() => ({ status: 200, body: okBody('nope') }))

    const result = await sendMotorMessage(
      {
        orgId: s.orgId,
        conversationId: s.conversationId,
        content: { kind: 'template', name: 'promo_pendiente', language: 'es' },
      },
      baseDeps(fetchImpl),
    )

    expect(result.status).toBe('rejected')
    if (result.status === 'rejected') expect(result.reason).toBe('template_not_approved')
    expect(calls).toHaveLength(0)
  })

  test('(d) 5xx REINTENTA (y luego OK); 4xx NO reintenta (falla tipada)', async () => {
    const s = mustSeed()
    await setWindow(true)

    // 5xx en el primer intento, 200 en el segundo → SENT tras 2 llamadas.
    const wamid = `wamid.${RUN}.d`
    const retry = makeFakeFetch((_call, i) =>
      i === 0 ? { status: 503, body: 'upstream down' } : { status: 200, body: okBody(wamid) },
    )
    const okAfterRetry = await sendMotorMessage(
      { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body: `retry-${RUN}-d` } },
      baseDeps(retry.fetchImpl),
    )
    expect(okAfterRetry.status).toBe('sent')
    expect(retry.calls).toHaveLength(2)

    // 4xx (code de plantilla) → una sola llamada, resultado failed, fila FAILED.
    const fourxx = makeFakeFetch(() => ({ status: 400, body: errBody(132001, 'template not found') }))
    const failed = await sendMotorMessage(
      { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body: `no-retry-${RUN}-d` } },
      baseDeps(fourxx.fetchImpl),
    )
    expect(failed.status).toBe('failed')
    expect(fourxx.calls).toHaveLength(1)
    if (failed.status === 'failed') {
      expect(failed.error.kind).toBe('template_not_approved')
      const msg = await forOrg(s.orgId).motorMessage.findById(failed.messageId)
      expect(msg?.status).toBe('FAILED')
      expect(msg?.error).toContain('template_not_approved')
    }
  })

  test('(e) idempotencyKey repetido: NO duplica el despacho (segunda llamada = deduped)', async () => {
    const s = mustSeed()
    await setWindow(true)
    const key = `idem-${RUN}-e`
    const wamid = `wamid.${RUN}.e`
    const { fetchImpl, calls } = makeFakeFetch(() => ({ status: 200, body: okBody(wamid) }))
    const deps = baseDeps(fetchImpl)

    const first = await sendMotorMessage(
      { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body: `idem-${RUN}` }, idempotencyKey: key },
      deps,
    )
    const second = await sendMotorMessage(
      { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body: `idem-${RUN}` }, idempotencyKey: key },
      deps,
    )

    expect(first.status).toBe('sent')
    expect(second.status).toBe('deduped')
    if (first.status === 'sent' && second.status === 'deduped') {
      expect(second.messageId).toBe(first.messageId)
      expect(second.wamid).toBe(wamid)
    }
    // Un solo despacho y una sola fila con la clave.
    expect(calls).toHaveLength(1)
    const rows = await forOrg(s.orgId).motorMessage.count({ outboundIdempotencyKey: key })
    expect(rows).toBe(1)
  })

  test('(e2) misma clave en paralelo: el unique compuesto deja UNA sola fila', async () => {
    const s = mustSeed()
    await setWindow(true)
    const key = `idem-par-${RUN}-e2`
    const { fetchImpl } = makeFakeFetch((_c, i) => ({ status: 200, body: okBody(`wamid.${RUN}.e2.${i}`) }))
    const deps = baseDeps(fetchImpl)

    const results = await Promise.all([
      sendMotorMessage(
        { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body: `par-${RUN}` }, idempotencyKey: key },
        deps,
      ),
      sendMotorMessage(
        { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body: `par-${RUN}` }, idempotencyKey: key },
        deps,
      ),
    ])

    // Exactamente una fila con la clave, sin importar el orden de la carrera.
    const rows = await forOrg(s.orgId).motorMessage.count({ outboundIdempotencyKey: key })
    expect(rows).toBe(1)
    expect(results.some((r) => r.status === 'sent' || r.status === 'deduped')).toBe(true)
  })

  test('(f) la API key JAMÁS aparece en los logs ni en la fila persistida', async () => {
    const s = mustSeed()
    await setWindow(true)

    // Camino feliz + camino de error, ambos con logger capturador.
    const ok = makeCapturingLogger()
    const okFetch = makeFakeFetch(() => ({ status: 200, body: okBody(`wamid.${RUN}.f`) }))
    const sent = await sendMotorMessage(
      { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body: `log-ok-${RUN}` } },
      baseDeps(okFetch.fetchImpl, { logger: ok.logger }),
    )
    expect(sent.status).toBe('sent')

    const fail = makeCapturingLogger()
    const failFetch = makeFakeFetch(() => ({ status: 500, body: 'boom' }))
    const failed = await sendMotorMessage(
      { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body: `log-fail-${RUN}` } },
      baseDeps(failFetch.fetchImpl, { logger: fail.logger }),
    )
    expect(failed.status).toBe('failed')

    // El secreto en claro no aparece en NINGÚN log.
    expect(ok.dump()).not.toContain(API_KEY_PLAIN)
    expect(fail.dump()).not.toContain(API_KEY_PLAIN)

    // Ni en las filas persistidas (body/error).
    if (failed.status === 'failed') {
      const msg = await forOrg(s.orgId).motorMessage.findById(failed.messageId)
      expect(msg?.error ?? '').not.toContain(API_KEY_PLAIN)
      expect(msg?.body ?? '').not.toContain(API_KEY_PLAIN)
    }
  })

  test('(g) API key indescifrable (key rotada/corrupta): RECHAZA sin HTTP y sin dejar fila colgada', async () => {
    const s = mustSeed()
    await setWindow(true)
    const body = `key-rota-${RUN}-g`
    const { fetchImpl, calls } = makeFakeFetch(() => ({ status: 200, body: okBody('nope') }))

    // secretBox cuyo decrypt falla (simula key rotada o ciphertext corrupto).
    const brokenBox = {
      encrypt: () => ({ encrypted: '', iv: '', tag: '' }),
      decrypt: () => {
        throw new Error('boom: no se pudo descifrar')
      },
      isConfigured: () => true,
    }

    const result = await sendMotorMessage(
      { orgId: s.orgId, conversationId: s.conversationId, content: { kind: 'text', body }, idempotencyKey: `idem-${RUN}-g` },
      baseDeps(fetchImpl, { secretBox: brokenBox }),
    )

    expect(result.status).toBe('rejected')
    if (result.status === 'rejected') expect(result.reason).toBe('channel_key_invalid')
    // Cero HTTP, cero fila (ni PENDING colgada), idempotencyKey NO quemada.
    expect(calls).toHaveLength(0)
    const persisted = await forOrg(s.orgId).motorMessage.count({ body })
    expect(persisted).toBe(0)
  })
})
