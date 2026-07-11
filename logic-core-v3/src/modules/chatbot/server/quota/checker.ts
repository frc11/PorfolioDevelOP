import { forOrg } from '@/lib/isolation'

/**
 * Quota tracking is per (BotConfig, year-month).
 *
 * The "period" key is "YYYY-MM" (UTC). One QuotaUsage row per month.
 *
 * B0-S3: todo acceso a QuotaUsage pasa por el helper de aislamiento scoped por
 * org (forOrg(organizationId).quotaUsage). Verifica que el bot pertenezca a la
 * org y las mutaciones atómicas llevan el guard de org embebido en el SQL.
 */

function currentPeriodKey(date: Date = new Date()) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  }
}

export interface QuotaCheckResult {
  withinQuota: boolean
  conversationsUsed: number
  conversationsLimit: number
  year: number
  month: number
}

/**
 * Checks if the bot is within its monthly quota.
 * Does NOT increment counters — that's done after the message is processed.
 */
export async function checkQuota(
  organizationId: string,
  botConfigId: string,
  monthlyQuota: number
): Promise<QuotaCheckResult> {
  const { year, month } = currentPeriodKey()

  const usage = await forOrg(organizationId).quotaUsage.findByPeriod(botConfigId, year, month)

  const conversationsUsed = usage?.conversationsCount ?? 0

  return {
    withinQuota: conversationsUsed < monthlyQuota,
    conversationsUsed,
    conversationsLimit: monthlyQuota,
    year,
    month,
  }
}

export interface QuotaIncrementInput {
  organizationId: string
  botConfigId: string
  isNewConversation: boolean
  messagesAdded: number
  tokensIn: number
  tokensOut: number
  costUsd: number
}

/**
 * Upserts the QuotaUsage row for the current period with the new usage.
 */
export async function incrementQuota(input: QuotaIncrementInput): Promise<void> {
  const { year, month } = currentPeriodKey()

  await forOrg(input.organizationId).quotaUsage.upsertPeriod({
    botConfigId: input.botConfigId,
    year,
    month,
    create: {
      conversationsCount: input.isNewConversation ? 1 : 0,
      tokensIn: input.tokensIn,
      tokensOut: input.tokensOut,
      costUsd: input.costUsd,
    },
    update: {
      conversationsCount: input.isNewConversation ? { increment: 1 } : undefined,
      tokensIn: { increment: input.tokensIn },
      tokensOut: { increment: input.tokensOut },
      costUsd: { increment: input.costUsd },
    },
  })
}

export interface QuotaReserveResult {
  reserved: boolean
  conversationsUsed: number
  conversationsLimit: number
  year: number
  month: number
}

/**
 * B4.2 — Reserva atómica de cupo de conversación nueva.
 *
 * Resuelve el race condition TOCTOU entre `checkQuota` (lectura) y el
 * incremento eventual en `incrementQuota` (post-LLM): en burst de N
 * requests simultáneos contra el último cupo, el `checkQuota`
 * optimista deja pasar a todos, y el contador termina por sobre el
 * límite.
 *
 * Esta función hace `UPDATE ... WHERE conversationsCount < limit
 * RETURNING ...` que es atómico en PostgreSQL (lock por fila). Si la
 * fila no existía, la crea con `count=1`; si existía pero el límite
 * ya está alcanzado, devuelve `reserved=false` sin tocar el contador.
 *
 * Garantía: el `conversationsCount` después de N reservas exitosas
 * concurrentes nunca excede `monthlyQuota`. La N+1ª reserva falla.
 *
 * Llamar SOLO cuando la conversación es NUEVA (isNewConversation=true).
 * Mensajes en conversación existente no incrementan el contador.
 *
 * Si esta función reserva, `incrementQuota` para el mismo turn debe
 * pasarse con `isNewConversation: false` para no double-count.
 */
export async function tryReserveConversation(
  organizationId: string,
  botConfigId: string,
  monthlyQuota: number,
): Promise<QuotaReserveResult> {
  const { year, month } = currentPeriodKey()

  // La reserva atómica (asegurar fila + UPDATE conditional con row-lock de
  // Postgres + re-lectura) vive en el accessor scoped. El guard de org va
  // EMBEBIDO en el SQL (EXISTS sobre chatbot_bot_config), preservando la
  // garantía TOCTOU: N reservas concurrentes nunca exceden monthlyQuota.
  const { reserved, conversationsUsed } = await forOrg(organizationId).quotaUsage.reserveConversation({
    botConfigId,
    year,
    month,
    monthlyQuota,
  })

  return {
    reserved,
    conversationsUsed,
    conversationsLimit: monthlyQuota,
    year,
    month,
  }
}
