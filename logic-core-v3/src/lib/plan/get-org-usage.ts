/**
 * B4.6 — Lectura unificada de plan + consumo del mes actual para una org.
 *
 * Devuelve el plan efectivo (vía `getPlanForOrg`) + el contador real de
 * `QuotaUsage` del mes en curso para el bot de la org. Si la org no tiene
 * BotConfig (caso onboarding incompleto) o no hay fila de QuotaUsage del
 * mes, devuelve `conversationsUsed = 0`.
 *
 * Garantía del proyecto: 1 org = 1 BotConfig (la columna
 * `BotConfig.organizationId` es `@unique`). No hay agregación cross-bot.
 *
 * Lectura sólo: nunca crea/muta filas. El bot crea la fila de QuotaUsage
 * en el primer chat del mes vía `tryReserveConversation`.
 */
import { prisma } from '@/lib/prisma'
import { getPlanForOrg } from './get-plan-for-org'
import type { EffectivePlan } from './fallback'

export interface OrgUsageSnapshot {
  plan: EffectivePlan
  conversationsUsed: number
  conversationsLimit: number
  /** Entre 0 y 100. Si used > limit (no debería pasar gracias al reserve atómico) se clampea a 100. */
  percentage: number
  /** UTC year/month del período en curso. */
  year: number
  month: number
  /** Etiqueta del mes en español, ej. "mayo 2026". */
  periodLabel: string
  /** `true` si la org no tiene BotConfig configurado todavía. */
  hasBotConfigured: boolean
}

function currentPeriodKey(date: Date = new Date()) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  }
}

function formatPeriodLabel(year: number, month: number): string {
  const monthDate = new Date(Date.UTC(year, month - 1, 1))
  // timeZone: 'UTC' evita que la TZ AR (-3h) retroceda al mes anterior al formatear.
  return monthDate
    .toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .toLowerCase()
}

export async function getOrgUsageSnapshot(orgId: string): Promise<OrgUsageSnapshot> {
  const { year, month } = currentPeriodKey()

  const [plan, bot] = await Promise.all([
    getPlanForOrg(orgId),
    prisma.botConfig.findUnique({
      where: { organizationId: orgId },
      select: { id: true },
    }),
  ])

  let conversationsUsed = 0
  if (bot) {
    const usage = await prisma.quotaUsage.findUnique({
      where: {
        botConfigId_year_month: { botConfigId: bot.id, year, month },
      },
      select: { conversationsCount: true },
    })
    conversationsUsed = usage?.conversationsCount ?? 0
  }

  const conversationsLimit = plan.quota
  const rawPercentage = conversationsLimit > 0 ? (conversationsUsed / conversationsLimit) * 100 : 0
  const percentage = Math.min(100, Math.max(0, Math.round(rawPercentage)))

  return {
    plan,
    conversationsUsed,
    conversationsLimit,
    percentage,
    year,
    month,
    periodLabel: formatPeriodLabel(year, month),
    hasBotConfigured: Boolean(bot),
  }
}
