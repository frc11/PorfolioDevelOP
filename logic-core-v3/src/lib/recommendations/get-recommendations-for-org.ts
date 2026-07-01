/**
 * P5.1 — Capa de datos del motor de recomendaciones para UNA org.
 *
 * Solo LECTURA de señales YA org-scoped: reusa los helpers canónicos (cero
 * cómputo caro, cero migraciones, cero queries duplicadas). El org-scoping vive
 * en cada helper (todos filtran por la org o su botConfig), así que las reglas
 * jamás cruzan tenant. Devuelve las recomendaciones ya construidas y ordenadas.
 */
import { prisma } from '@/lib/prisma'
import { startOfWeekAR } from '@/lib/dates-ar'
import { getOrgUsageSnapshot } from '@/lib/plan/get-org-usage'
import { getActiveModuleSlugs } from '@/lib/premium-modules'
import { getMonthlyAnalysisForOrg } from '@/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg'
import { countHotNewLeadsForOrg } from '@/modules/chatbot/server/admin/multiTenantQueries'
import { computeRecommendations } from './rules'
import type { Recommendation, RecommendationSignals } from './types'

const DAY_MS = 86_400_000

/**
 * Semilla de rotación semanal en hora AR: estable dentro de la semana, cambia el
 * lunes. Reusa la primitiva canónica `startOfWeekAR` (cero manejo de TZ nuevo).
 */
export function weeklyRotationSeed(now: Date = new Date()): number {
  return Math.floor(startOfWeekAR(now).getTime() / DAY_MS)
}

export async function getRecommendationsForOrg(
  organizationId: string,
): Promise<Recommendation[]> {
  const [analysis, usage, activeModuleSlugs, hotLeads, org] = await Promise.all([
    getMonthlyAnalysisForOrg(organizationId),
    getOrgUsageSnapshot(organizationId),
    getActiveModuleSlugs(organizationId),
    countHotNewLeadsForOrg(organizationId),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { googleReviewsCount: true, gbpConnectedAt: true },
    }),
  ])

  const signals: RecommendationSignals = {
    organizationId,
    hasBot: analysis.hasBot,
    leadsLast30d: analysis.leadsLast30d,
    conversationsThisMonth: usage.conversationsUsed,
    hotLeads,
    googleReviewsCount: org?.googleReviewsCount ?? 0,
    gbpConnected: Boolean(org?.gbpConnectedAt),
    activeModuleSlugs,
    plan: {
      key: usage.plan.key,
      reportsEnabled: usage.plan.reportsEnabled,
      crmEnabled: usage.plan.crmEnabled,
    },
  }

  return computeRecommendations(signals, weeklyRotationSeed())
}
