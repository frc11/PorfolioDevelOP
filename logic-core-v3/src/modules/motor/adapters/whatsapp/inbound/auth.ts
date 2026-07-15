/**
 * Autenticación del webhook entrante (B1-S1 — hallazgo del paso 0).
 *
 * Mecanismo implementado: HEADER SECRETO PROPIO por canal — el más fuerte
 * disponible en el plan actual (cliente directo de la Messaging API de
 * 360dialog). Evidencia relevada en docs.360dialog.com:
 *
 *  1. El webhook de mensajería se configura por API y acepta headers custom
 *     que 360dialog reenvía en cada POST:
 *     `POST https://waba-v2.360dialog.io/v1/configs/webhook` (auth
 *     D360-API-KEY) con body `{ "url": "...", "headers": { ... } }`.
 *     Cita: docs.360dialog.com/docs/messaging-api/api-reference/webhooks
 *     ("Partners can set http headers that they want to receive in webhook
 *     requests. Example: Authorization, Content-Type.") y
 *     docs.360dialog.com/docs/messaging/webhook (ejemplo configurando el
 *     header `Authorization`).
 *  2. 360dialog NO reenvía la firma `X-Hub-Signature-256` de Meta al webhook
 *     del cliente: la suscripción ante Meta es de 360dialog y esa firma usa
 *     el app secret de ELLOS. Tampoco hay challenge GET (hub.challenge): el
 *     webhook se registra vía su API, no en el dashboard de Meta — por eso
 *     esta ruta no implementa GET.
 *  3. SÍ existe una firma HMAC-SHA256 propia del BSP
 *     (header `x-360dialog-signature`, firmada con un "platform secret"),
 *     pero es EXCLUSIVA del plan partner: el secret se genera en el Partner
 *     Hub, al que un cliente API directo no accede. Cita:
 *     docs.360dialog.com/partner/onboarding/webhook-events-and-setup/
 *     signature-validation. Si la cuenta migra a partner, ESTE verificador
 *     es el único punto a reemplazar por HMAC del raw body (riesgo residual
 *     reportado a planificación: el header estático autentica el origen pero
 *     no la integridad por-payload).
 *
 * Defensa en profundidad alrededor de este verificador: channelToken opaco
 * de 256 bits en la URL (segundo secreto independiente), rate limit por
 * canal ANTES de tocar la DB, validación estricta de shape del payload y
 * cross-check de metadata.phone_number_id contra el canal del token.
 *
 * Fail closed: canal sin webhookSecretHash configurado rechaza todo.
 */
import { webhookSecretMatches } from '@/modules/motor/domain/channel-credentials'

const BEARER_PREFIX = 'Bearer '

export type WebhookAuthFailure = 'not-configured' | 'missing-header' | 'mismatch'

export type WebhookAuthResult = { ok: true } | { ok: false; reason: WebhookAuthFailure }

export function verifyWebhookAuth(
  authorizationHeader: string | null,
  webhookSecretHash: string | null,
): WebhookAuthResult {
  if (webhookSecretHash === null || webhookSecretHash.length === 0) {
    return { ok: false, reason: 'not-configured' }
  }
  if (authorizationHeader === null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
    return { ok: false, reason: 'missing-header' }
  }
  const presented = authorizationHeader.slice(BEARER_PREFIX.length).trim()
  if (presented.length === 0) {
    return { ok: false, reason: 'missing-header' }
  }
  return webhookSecretMatches(presented, webhookSecretHash) ? { ok: true } : { ok: false, reason: 'mismatch' }
}
