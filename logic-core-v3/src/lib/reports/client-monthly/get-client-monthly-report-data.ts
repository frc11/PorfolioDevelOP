/**
 * P2.C — Orquestador de datos para "Descargá el informe del mes".
 *
 * Org-scoping: el `organizationId` SIEMPRE lo resuelve el caller desde la
 * sesión (`resolveOrgId()`, nunca de un parámetro) — esta función confía en
 * recibirlo ya resuelto, mismo contrato que `getMonthlyAnalysisForOrg`.
 *
 * Cero recálculo paralelo: `getMonthlyAnalysisForOrg` (P0.2) aporta insights,
 * serie de conversaciones y categorías TAL CUAL. Lo único nuevo acá son dos
 * conteos de leads (mes actual/anterior) y las filas para el embudo del mes —
 * ambos con el MISMO helper de fechas AR que el resto del repo (`dates-ar`),
 * cero `new Date()` manual salvo el instante de entrada `now`.
 */
import { prisma } from '@/lib/prisma'
import { monthRangeAR, previousRangeForPeriod, startOfMonthAR } from '@/lib/dates-ar'
import { getMonthlyAnalysisForOrg } from '@/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg'
import { monthLabel } from '@/modules/chatbot/lib/monthly-analysis'
import { assembleClientMonthlyReportData, type ClientMonthlyReportData } from './monthly-report-data'

export async function getClientMonthlyReportData(
  organizationId: string,
  now: Date = new Date(),
): Promise<ClientMonthlyReportData> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { companyName: true, botConfig: { select: { id: true } } },
  })

  const companyName = org?.companyName ?? 'tu negocio'
  const botConfigId = org?.botConfig?.id ?? null

  // Año/mes AR derivados del ancla exportada por dates-ar (00:00 AR del día 1,
  // fijada a las 03:00 UTC) — cero aritmética de TZ nueva acá.
  const startOfMonth = startOfMonthAR(now)
  const label = monthLabel(startOfMonth.getUTCMonth() + 1, startOfMonth.getUTCFullYear(), false)

  // getMonthlyAnalysisForOrg resuelve `hasBot` internamente (mismo criterio,
  // una única fuente de verdad) — se llama siempre, es barata cuando no hay bot.
  const analysis = await getMonthlyAnalysisForOrg(organizationId)

  if (!botConfigId || !analysis.hasBot) {
    return assembleClientMonthlyReportData({
      companyName,
      monthLabel: label,
      analysis,
      leadsThisMonth: 0,
      leadsPrevMonth: 0,
      funnelLeads: [],
    })
  }

  const current = monthRangeAR(now)
  const previous = previousRangeForPeriod('month', now)

  const [leadsThisMonth, leadsPrevMonth, funnelLeads] = await Promise.all([
    prisma.chatbotLead.count({
      where: { botConfigId, capturedAt: { gte: current.start, lt: current.end } },
    }),
    prisma.chatbotLead.count({
      where: { botConfigId, capturedAt: { gte: previous.start, lt: previous.end } },
    }),
    prisma.chatbotLead.findMany({
      where: { botConfigId, capturedAt: { gte: current.start, lt: current.end } },
      select: { status: true, firstContactedAt: true },
    }),
  ])

  return assembleClientMonthlyReportData({
    companyName,
    monthLabel: label,
    analysis,
    leadsThisMonth,
    leadsPrevMonth,
    funnelLeads,
  })
}
