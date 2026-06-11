/**
 * P0.2 — Lógica pura de presentación del "Análisis de tu negocio"
 * (/dashboard/resultados/analisis).
 *
 * Funciones puras, sin Prisma ni Date.now(): reciben filas YA org-scoped
 * (el scoping vive en el server module) y devuelven estructuras listas para
 * renderizar. Testeables con `scripts/_p02-test-analisis.ts`.
 *
 * Regla de fechas del sprint: los cortes de mes vienen EXCLUSIVAMENTE de los
 * agregados guardados (QuotaUsage.year/month). Acá no se computa ningún borde
 * de mes — solo aritmética y formato sobre claves ya persistidas.
 */
import type { InsightCategory, InsightStatus, LeadCategory } from '@prisma/client'

// ─── "Cómo viene tu mes" — serie de conversaciones por mes ───────────────────

/** Fila de QuotaUsage ya org-scoped. SOLO conteos — tokens/costos jamás llegan acá. */
export interface MonthlyUsageRow {
  year: number
  month: number // 1-12 (clave tal cual fue persistida por el agregado)
  conversationsCount: number
}

export interface MonthPoint {
  /** Clave estable "YYYY-MM" para keys de React y orden. */
  key: string
  /** Etiqueta de negocio: "mayo", "junio" (con año solo si la serie cruza años). */
  label: string
  count: number
}

export interface MonthVariation {
  /** Porcentaje redondeado, con signo. Ej: 40, -12. */
  pct: number
  direction: 'up' | 'down' | 'flat'
  /** "+40% vs mayo" — listo para mostrar. */
  label: string
}

export interface ConversationSeries {
  points: MonthPoint[]
  /** Mes más reciente de la serie (último punto), null si no hay datos. */
  current: MonthPoint | null
  /** Variación del último mes vs el anterior. Null si no es computable (un
   *  solo mes, o mes anterior en cero — no se inventa un %). */
  variation: MonthVariation | null
}

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const

export function monthLabel(month: number, year: number, withYear: boolean): string {
  const name = MESES_ES[month - 1] ?? `mes ${month}`
  return withYear ? `${name} ${year}` : name
}

/**
 * Ordena cronológicamente las filas (año, mes asc) y arma la serie con
 * etiquetas y variación del último mes vs el anterior. Pura: no mira el reloj.
 */
export function buildConversationSeries(rows: MonthlyUsageRow[]): ConversationSeries {
  const sorted = [...rows].sort((a, b) => a.year - b.year || a.month - b.month)
  const crossesYears = sorted.length > 0 && sorted.some((r) => r.year !== sorted[0].year)

  const points: MonthPoint[] = sorted.map((r) => ({
    key: `${r.year}-${String(r.month).padStart(2, '0')}`,
    label: monthLabel(r.month, r.year, crossesYears),
    count: r.conversationsCount,
  }))

  const current = points.length > 0 ? points[points.length - 1] : null
  const prev = points.length > 1 ? points[points.length - 2] : null

  let variation: MonthVariation | null = null
  if (current && prev && prev.count > 0) {
    const pct = Math.round(((current.count - prev.count) / prev.count) * 100)
    const direction: MonthVariation['direction'] = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat'
    const sign = pct > 0 ? '+' : ''
    variation = { pct, direction, label: `${sign}${pct}% vs ${prev.label}` }
  }

  return { points, current, variation }
}

// ─── "Qué pregunta tu gente" — top de categorías ─────────────────────────────

/** Fila agregada (groupBy category) ya org-scoped. */
export interface CategoryCountRow {
  category: LeadCategory
  count: number
}

export interface CategoryEntry {
  category: LeadCategory
  /** Etiqueta corta de negocio: "Quieren comprar". */
  label: string
  /** Frase para "X de cada 10 consultas son …": "para comprar". */
  phrase: string
  count: number
  /** Proporción 0-1 sobre el total de la org en la ventana. */
  share: number
  /** "X de cada 10" redondeado (mínimo 1 si count > 0). */
  outOf10: number
}

export interface CategorySummary {
  /** false si hay menos de `minSample` consultas — degradar honesto. */
  sufficient: boolean
  total: number
  top: CategoryEntry[]
}

/** Lenguaje de dueño — cero jerga. Sentence case en labels. */
export const CATEGORY_PRESENTATION: Record<LeadCategory, { label: string; phrase: string }> = {
  sales: { label: 'Quieren comprar', phrase: 'para comprar' },
  postventa: { label: 'Postventa y service', phrase: 'de postventa' },
  employment: { label: 'Buscan trabajo', phrase: 'por búsqueda de trabajo' },
  provider: { label: 'Proveedores que ofrecen', phrase: 'de proveedores' },
  spam: { label: 'Spam', phrase: 'spam' },
  other: { label: 'Otras consultas', phrase: 'por otros temas' },
}

export const CATEGORY_MIN_SAMPLE = 10

/**
 * Top 5 de categorías con proporciones legibles. Orden: count desc, desempate
 * estable por orden del enum (determinista para tests y para el render).
 */
export function summarizeCategories(
  rows: CategoryCountRow[],
  minSample: number = CATEGORY_MIN_SAMPLE,
): CategorySummary {
  const order = Object.keys(CATEGORY_PRESENTATION) as LeadCategory[]
  const total = rows.reduce((sum, r) => sum + r.count, 0)

  const top = [...rows]
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count || order.indexOf(a.category) - order.indexOf(b.category))
    .slice(0, 5)
    .map((r) => {
      const share = total > 0 ? r.count / total : 0
      const outOf10 = Math.min(10, Math.max(1, Math.round(share * 10)))
      const presentation = CATEGORY_PRESENTATION[r.category]
      return {
        category: r.category,
        label: presentation.label,
        phrase: presentation.phrase,
        count: r.count,
        share,
        outOf10,
      }
    })

  return { sufficient: total >= minSample, total, top }
}

// ─── "Lo que descubrimos este mes" — ranking de descubrimientos ─────────────

/** Subset renderizable de ChatbotInsight (ya org-scoped). */
export interface InsightRow {
  id: string
  category: InsightCategory
  status: InsightStatus
  title: string
  description: string
  suggestedAction: string
  evidenceCount: number
  createdAt: Date
}

/** Lenguaje de dueño por categoría de descubrimiento. */
export const INSIGHT_CATEGORY_PRESENTATION: Record<
  InsightCategory,
  { label: string; tone: 'amber' | 'rose' | 'cyan' | 'violet' | 'sky' }
> = {
  KB_GAP: { label: 'Preguntas sin respuesta', tone: 'amber' },
  CONVERSION_LEAK: { label: 'Ventas que se escapan', tone: 'rose' },
  CONTENT_OPPORTUNITY: { label: 'Contenido que conviene sumar', tone: 'cyan' },
  CONFIG_TWEAK: { label: 'Ajuste recomendado', tone: 'violet' },
  COMPETITIVE_INTEL: { label: 'Mencionaron a la competencia', tone: 'sky' },
}

export const MAX_INSIGHTS_SHOWN = 6

/**
 * Jerarquía: lo nuevo (PENDING) primero — es lo accionable —, después lo ya
 * aplicado como contexto. DISMISSED/IGNORED no se muestran (el dueño los
 * descartó; no se le re-insiste). Dentro de cada grupo, lo más reciente
 * primero y a igual fecha, más evidencia primero.
 */
export function rankInsights(rows: InsightRow[], max: number = MAX_INSIGHTS_SHOWN): InsightRow[] {
  const statusRank: Record<InsightStatus, number> = {
    PENDING: 0,
    APPLIED: 1,
    DISMISSED: 2,
    IGNORED: 3,
  }
  return rows
    .filter((r) => r.status === 'PENDING' || r.status === 'APPLIED')
    .sort(
      (a, b) =>
        statusRank[a.status] - statusRank[b.status] ||
        b.createdAt.getTime() - a.createdAt.getTime() ||
        b.evidenceCount - a.evidenceCount,
    )
    .slice(0, max)
}
