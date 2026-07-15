/**
 * Webhook de entrada del motor WhatsApp (B1-S1) — 360dialog reenvía acá los
 * eventos de la Cloud API. Route FINO (patrón del chat route del chatbot):
 * rate limit por canal y delegación al módulo; auth, identidad y persistencia
 * viven en src/modules/motor/adapters/whatsapp/inbound/ (donde rige la
 * frontera de aislamiento). Sin GET: 360dialog no usa challenge de
 * verificación (el webhook se registra vía su API — ver auth.ts).
 *
 * Contrato de respuesta: 200 rápido y sin trabajo lento (nada de LLM — eso
 * es B2); 401 auth; 400 shape; 429 rate limit; 500 SOLO errores de
 * infraestructura (el BSP reintenta hasta 7 días y la idempotencia por wamid
 * absorbe el replay). Nunca se filtran detalles internos al cliente.
 */
import { createHash } from 'node:crypto'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { logger } from '@/lib/logger'
import { handleInboundWebhookRequest } from '@/modules/motor/adapters/whatsapp/inbound'

export const runtime = 'nodejs'
export const maxDuration = 15

interface RouteContext {
  params: Promise<{ channelToken: string }>
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const { channelToken } = await context.params

  // Rate limit ANTES de cualquier lectura de DB de canales. La clave hashea
  // el token: es material secreto de URL y la tabla rate_limit es compartida.
  const tokenHash = createHash('sha256').update(channelToken, 'utf8').digest('hex').slice(0, 24)
  const rate = await checkRateLimit({
    key: `motorWebhookPerChannel:${tokenHash}`,
    limit: RATE_LIMIT_PRESETS.motorWebhookPerChannel.limit,
    windowMs: RATE_LIMIT_PRESETS.motorWebhookPerChannel.windowMs,
  })
  if (!rate.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    })
  }

  try {
    return await handleInboundWebhookRequest(request, channelToken)
  } catch (error) {
    logger.error('motor-inbound: error de infraestructura procesando el webhook', error)
    return new Response(JSON.stringify({ error: 'internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
