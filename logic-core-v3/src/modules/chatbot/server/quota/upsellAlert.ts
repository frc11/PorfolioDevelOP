/**
 * B4.5 — Alerta de upsell cuando una org entra en modo degradado.
 *
 * Idempotencia y anti-spam vía `QuotaUsage.degradedAt`:
 *   - El UPDATE conditional setea `degradedAt = NOW()` SOLO si era null.
 *   - Si afecta 1 fila → primera vez del mes → disparamos alerta.
 *   - Si afecta 0 filas → ya alertamos este período → no-op.
 *   - Garantía: máximo 1 alerta de upsell por (botConfigId, year, month).
 *
 * El cambio de mes resetea naturalmente: el upsert de `QuotaUsage`
 * crea una fila nueva con `degradedAt = null` por default.
 *
 * Envíos:
 *   1. `sendAgencyAlert({ type: 'LEAD_UPSELL', … })` — usa el webhook
 *      configurado en `agency_settings.alertWebhookUrl` si el toggle
 *      `alertOnLeads` está activo.
 *   2. `notifyTelegramOptional(…)` — fallback/duplicado si las env vars
 *      TELEGRAM_BOT_TOKEN + CHAT_ID existen.
 *
 * Errores en el envío NO bloquean el flujo del bot (best-effort log).
 */
import { forOrg } from '@/lib/isolation'
import { sendAgencyAlert } from '@/lib/alerts'
import { notifyTelegramOptional } from '@/lib/notifications/telegram'
import { chatbotError } from '../logging'

export interface TriggerUpsellAlertInput {
  organizationId: string
  botConfigId: string
  organizationName: string
  planKey: string
  planQuota: number
  conversationsUsed: number
  /** Año UTC actual (el período de QuotaUsage donde se marca degradedAt). */
  year: number
  /** Mes UTC actual (1-12). */
  month: number
  /** URL del admin de develOP — link al detalle del cliente. */
  adminLinkPath?: string
}

/**
 * Marca atómicamente `degradedAt` y dispara alertas si era primera vez del mes.
 * Devuelve `true` si la alerta se envió, `false` si ya se había enviado.
 */
export async function triggerUpsellAlertIfFirst(
  input: TriggerUpsellAlertInput,
): Promise<boolean> {
  // Marca degradedAt atómicamente solo si era null (row-lock de Postgres →
  // concurrent calls no disparan doble alerta). El guard de org va embebido en
  // el SQL del accessor scoped. true solo la primera vez del período.
  const marked = await forOrg(input.organizationId).quotaUsage.markDegradedIfFirst({
    botConfigId: input.botConfigId,
    year: input.year,
    month: input.month,
  })

  if (!marked) return false

  const periodLabel = `${input.year}-${String(input.month).padStart(2, '0')}`
  const detail =
    `Cuota del plan ${input.planKey} agotada (${input.conversationsUsed}/${input.planQuota}) ` +
    `en el período ${periodLabel}. El bot pasó a modo degradado — candidato a upsell.`

  // Envío en paralelo. Errores se loguean pero NO interrumpen el flow
  // del bot (este helper se llama desde el path del usuario; cualquier
  // throw acá rompería el JSON degradado que se le devuelve al widget).
  await Promise.allSettled([
    sendAgencyAlert({
      type: 'LEAD_UPSELL',
      clientName: input.organizationName,
      detail,
      priority: 'HIGH',
      link: input.adminLinkPath ?? undefined,
    }).catch((error: unknown) =>
      chatbotError('upsell_alert.agency_webhook_failed', error, {
        botConfigId: input.botConfigId,
      }),
    ),
    notifyTelegramOptional(
      `⚠️ Upsell: *${input.organizationName}*\n${detail}` +
        (input.adminLinkPath ? `\n[Ver cliente](${input.adminLinkPath})` : ''),
    ).catch((error: unknown) =>
      chatbotError('upsell_alert.telegram_failed', error, {
        botConfigId: input.botConfigId,
      }),
    ),
  ])

  return true
}
