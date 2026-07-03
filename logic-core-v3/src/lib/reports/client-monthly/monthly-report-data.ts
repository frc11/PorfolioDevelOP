/**
 * P2.C — Ensamblado PURO de datos para "Descargá el informe del mes".
 *
 * Sin Prisma, sin Date.now(): recibe piezas YA calculadas (por P0.2 y por el
 * orquestador de este mismo feature) y arma la forma final que consume el PDF.
 * Reusa el mismo criterio de "degradación honesta" que ya usa la tab P0.2 —
 * `categories.sufficient` / `series.current === null` pasan TAL CUAL, así el
 * PDF y la tab nunca pueden divergir sobre cuándo hay "suficientes datos".
 *
 * Leads: reusa `computeLeadsDelta` (aritmética 100% igual al home semanal),
 * pero con una frase PROPIA de mes — `deltaPhrase` (home-metrics-logic.ts)
 * hardcodea "semana pasada" y ese archivo alimenta un widget en vivo del
 * dashboard; se decidió no tocarlo por una diferencia de copy.
 *
 * Embudo: reusa `buildFunnel` sin cambios — la función ya devuelve solo
 * números (total/contacted/sold/pending), el copy "esta semana" vive en el
 * componente React del home, no acá.
 */
import type { CategorySummary, ConversationSeries, InsightRow } from '@/modules/chatbot/lib/monthly-analysis'
import type { MonthlyAnalysisData } from '@/modules/chatbot/server/analysis/getMonthlyAnalysisForOrg'
import { buildFunnel, computeLeadsDelta, type Funnel, type FunnelInput, type LeadsDelta } from '@/lib/dashboard/home-metrics-logic'

export interface MonthlyReportLeadsNumber {
  current: number
  previous: number
  delta: number
  /** "+3 vs el mes pasado" · "igual que el mes pasado" · null sin base (0 y 0). */
  phrase: string | null
}

interface ClientMonthlyReportDataBase {
  companyName: string
  /** "junio 2026" — listo para mostrar. */
  monthLabel: string
}

/**
 * Unión discriminada por `hasBot`: cuando es `true`, TypeScript narrowea
 * automáticamente el resto de los campos a no-nulos (sin asserts `!` en el
 * componente PDF) — cuando es `false`, no hay NADA que mostrar más que el
 * mensaje de activación (nunca ceros inventados).
 */
export type ClientMonthlyReportData =
  | (ClientMonthlyReportDataBase & { hasBot: false })
  | (ClientMonthlyReportDataBase & {
      hasBot: true
      leads: MonthlyReportLeadsNumber
      series: ConversationSeries
      categories: CategorySummary
      /** El descubrimiento más relevante del mes, si existe. Nunca se inventa uno. */
      topInsight: InsightRow | null
      funnel: Funnel
    })

/** Frase de variación mensual para leads. Ver nota de cabecera: copy propia,
 * NO se reusa `deltaPhrase` de home-metrics-logic.ts (esa dice "semana pasada"). */
export function monthlyLeadsPhrase(d: LeadsDelta): string | null {
  if (d.previous === 0 && d.current === 0) return null
  if (d.previous === 0) return 'primeros del mes'
  if (d.delta === 0) return 'igual que el mes pasado'
  const signo = d.delta > 0 ? '+' : '-'
  return `${signo}${Math.abs(d.delta)} vs el mes pasado`
}

export function buildMonthlyReportLeadsNumber(
  current: number,
  previous: number,
): MonthlyReportLeadsNumber {
  const d = computeLeadsDelta(current, previous)
  return { current: d.current, previous: d.previous, delta: d.delta, phrase: monthlyLeadsPhrase(d) }
}

export function assembleClientMonthlyReportData(args: {
  companyName: string
  monthLabel: string
  analysis: MonthlyAnalysisData
  leadsThisMonth: number
  leadsPrevMonth: number
  funnelLeads: FunnelInput[]
}): ClientMonthlyReportData {
  const { companyName, monthLabel, analysis } = args

  if (!analysis.hasBot) {
    return { companyName, monthLabel, hasBot: false }
  }

  return {
    companyName,
    monthLabel,
    hasBot: true,
    leads: buildMonthlyReportLeadsNumber(args.leadsThisMonth, args.leadsPrevMonth),
    series: analysis.series,
    categories: analysis.categories,
    topInsight: analysis.insights[0] ?? null,
    funnel: buildFunnel(args.funnelLeads),
  }
}
