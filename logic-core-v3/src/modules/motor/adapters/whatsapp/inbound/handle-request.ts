/**
 * Entrada HTTP del pipeline (B1-S1). El route handler queda fino (rate limit
 * + delegación, patrón del chat route del chatbot); acá vive el orden
 * inviolable del sprint: NINGÚN payload se procesa sin pasar la
 * autenticación — resolver canal (la única lectura pre-auth, inevitable:
 * el secret es por-canal) → verificar secret → recién ahí parsear y tocar
 * datos, todo scoped con forOrg. Fallo de auth → 401 con log y CERO
 * escrituras. Respuestas sin detalles internos (401/400 genéricos).
 */
import { logger } from '@/lib/logger'
import { forOrg } from '@/lib/isolation'
import { verifyWebhookAuth } from './auth'
import { webhookEnvelopeSchema } from './payload'
import { processInboundPayload } from './process'
import { resolveChannelByToken } from './resolve-channel'

// Techo de tamaño del body: los payloads reales de la Cloud API son de KBs;
// 1 MB corta floods sin rozar tráfico legítimo.
const MAX_BODY_CHARS = 1_000_000

export async function handleInboundWebhookRequest(request: Request, channelToken: string): Promise<Response> {
  const channel = await resolveChannelByToken(channelToken)
  if (channel === null) {
    // Token malformado y token desconocido son indistinguibles a propósito:
    // sin oráculo de existencia de canales.
    logger.warn('motor-inbound: webhook con channelToken desconocido o inválido')
    return unauthorized()
  }

  const auth = verifyWebhookAuth(request.headers.get('authorization'), channel.webhookSecretHash)
  if (!auth.ok) {
    logger.warn('motor-inbound: webhook rechazado por autenticación', {
      channelId: channel.id,
      reason: auth.reason,
    })
    return unauthorized()
  }

  if (channel.status === 'INACTIVE') {
    logger.warn('motor-inbound: webhook sobre canal INACTIVE, rechazado', { channelId: channel.id })
    return unauthorized()
  }

  const body = await readBody(request)
  if (body === null) return badRequest()

  const envelope = webhookEnvelopeSchema.safeParse(body)
  if (!envelope.success) {
    logger.warn('motor-inbound: envelope con shape inválido', { channelId: channel.id })
    return badRequest()
  }

  const summary = await processInboundPayload(forOrg(channel.organizationId), channel, envelope.data)
  logger.info('motor-inbound: webhook procesado', { channelId: channel.id, ...summary })
  return json(200, { ok: true })
}

/** Body → JSON, con techo de tamaño. null = no procesable (400). */
async function readBody(request: Request): Promise<unknown | null> {
  let text: string
  try {
    text = await request.text()
  } catch {
    return null
  }
  if (text.length === 0 || text.length > MAX_BODY_CHARS) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function unauthorized(): Response {
  return json(401, { error: 'unauthorized' })
}

function badRequest(): Response {
  return json(400, { error: 'invalid payload' })
}

function json(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
