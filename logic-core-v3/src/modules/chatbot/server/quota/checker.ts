import { prisma } from '@/lib/prisma'

/**
 * Quota tracking is per (BotConfig, year-month).
 *
 * The "period" key is "YYYY-MM" (UTC). One QuotaUsage row per month.
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
  botConfigId: string,
  monthlyQuota: number
): Promise<QuotaCheckResult> {
  const { year, month } = currentPeriodKey()

  const usage = await prisma.quotaUsage.findUnique({
    where: {
      botConfigId_year_month: { botConfigId, year, month },
    },
  })

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

  await prisma.quotaUsage.upsert({
    where: {
      botConfigId_year_month: { botConfigId: input.botConfigId, year, month },
    },
    create: {
      botConfigId: input.botConfigId,
      year,
      month,
      conversationsCount: input.isNewConversation ? 1 : 0,
      tokensIn: input.tokensIn,
      tokensOut: input.tokensOut,
      costUsd: input.costUsd,
    },
    update: {
      conversationsCount: input.isNewConversation
        ? { increment: 1 }
        : undefined,
      tokensIn: { increment: input.tokensIn },
      tokensOut: { increment: input.tokensOut },
      costUsd: { increment: input.costUsd },
    },
  })
}
