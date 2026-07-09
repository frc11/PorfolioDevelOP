/**
 * P0.2 — Datos del "Análisis de tu negocio" para una org.
 *
 * Org-scoping: TODO se resuelve org → botConfig (relación 1:1) y de ahí por
 * botConfigId — mismo patrón que multiTenantQueries. Imposible cruzar tenants:
 * cada query filtra por el bot de ESTA org.
 *
 * Reglas de datos del sprint:
 *  - Cortes de mes: EXCLUSIVAMENTE los agregados ya guardados (QuotaUsage
 *    year/month). Acá no se computa ningún borde de mes.
 *  - Ventana de categorías: helper canónico `startOfDateRange('30d')` de
 *    tz-ar — el MISMO que usa la vista de leads. Cero manejo de TZ nuevo.
 *  - De QuotaUsage solo sale `conversationsCount`. tokens/costUsd son
 *    internos y NUNCA se seleccionan.
 */
import { forOrg } from '@/lib/isolation'
import { startOfDateRange } from '@/lib/tz-ar'
import {
  buildConversationSeries,
  summarizeCategories,
  rankInsights,
  type ConversationSeries,
  type CategorySummary,
  type InsightRow,
} from '../../lib/monthly-analysis'

export interface MonthlyAnalysisData {
  /** false → la org no tiene chatbot: la vista muestra el estado de activación. */
  hasBot: boolean
  insights: InsightRow[]
  series: ConversationSeries
  categories: CategorySummary
  /** Total de contactos capturados en la ventana de 30 días (dato de apoyo). */
  leadsLast30d: number
}

const EMPTY: MonthlyAnalysisData = {
  hasBot: false,
  insights: [],
  series: { points: [], current: null, variation: null },
  categories: { sufficient: false, total: 0, top: [] },
  leadsLast30d: 0,
}

/** Cuántos meses de agregados guardados entran en la serie (3 a 6 por spec). */
const SERIES_MONTHS = 6

export async function getMonthlyAnalysisForOrg(
  organizationId: string,
): Promise<MonthlyAnalysisData> {
  // Raíz del scoping: el bot de ESTA org (el helper fija el tenant). Si no hay
  // bot, no hay datos que mostrar.
  const scope = forOrg(organizationId)
  const bot = await scope.botConfig.findFirst({ select: { id: true } })
  const botConfigId = bot?.id
  if (!botConfigId) return EMPTY

  const windowStart = startOfDateRange('30d')

  const [insightRows, usageRows, categoryGroups] = await Promise.all([
    scope.chatbotInsight.findMany({
      where: { botConfigId, status: { in: ['PENDING', 'APPLIED'] } },
      orderBy: { createdAt: 'desc' },
      take: 20, // rankInsights corta a MAX_INSIGHTS_SHOWN; traemos margen para ordenar
      select: {
        id: true,
        category: true,
        status: true,
        title: true,
        description: true,
        suggestedAction: true,
        evidenceCount: true,
        createdAt: true,
      },
    }),
    scope.quotaUsage.findMany({
      where: { botConfigId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: SERIES_MONTHS,
      // SOLO conteos. tokensIn/tokensOut/costUsd son internos — jamás salen de acá.
      select: { year: true, month: true, conversationsCount: true },
    }),
    scope.chatbotLead.groupBy({
      by: ['category'],
      where: {
        botConfigId,
        ...(windowStart ? { capturedAt: { gte: windowStart } } : {}),
      },
      _count: { _all: true },
    }),
  ])

  const categoryRows = categoryGroups.map((g) => ({
    category: g.category,
    count: g._count._all,
  }))
  const categories = summarizeCategories(categoryRows)

  return {
    hasBot: true,
    insights: rankInsights(insightRows),
    series: buildConversationSeries(usageRows),
    categories,
    leadsLast30d: categories.total,
  }
}
