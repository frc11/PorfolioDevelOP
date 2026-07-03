import { prisma } from '@/lib/prisma'
import { excludeDqWhere } from '@/modules/chatbot/server/scoring/dqFilter'
import {
  getEffectiveScore,
  getScoreExplanation,
  type ScoredSignal,
} from '@/modules/chatbot/server/scoring/calculateLeadScore'

export interface TopHotLeadItem {
  name: string
  email: string | null
  phone: string | null
  /** Etiqueta legible PyME: "Caliente" | "Tibio" | "Frío". Nunca "dq". */
  heatLabel: 'Caliente' | 'Tibio' | 'Frío'
  /** Color de acento para el chip en el email (hex). */
  heatAccent: string
  /** Texto rioplatense que dice qué pidió. Truncado para no romper el layout. */
  whatTheyWant: string | null
  /** 1–3 razones legibles, del `getScoreExplanation` (positivas/combos, sin penalties). */
  reasons: string[]
}

const HEAT_BY_CLASS: Record<
  'hot' | 'warm' | 'cold',
  { label: TopHotLeadItem['heatLabel']; accent: string }
> = {
  hot: { label: 'Caliente', accent: '#f43f5e' },
  warm: { label: 'Tibio', accent: '#f59e0b' },
  cold: { label: 'Frío', accent: '#38bdf8' },
}

const MAX_MESSAGE_CHARS = 120
const MAX_REASONS = 2

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

/**
 * Devuelve los top N leads de la semana (ranqueados por score EFECTIVO con
 * decay) para una org. Pensado para la sección Business-only del reporte
 * ejecutivo semanal. N es configurable por el dueño (P2.B.2,
 * `Organization.executiveReportLeadCount`) — default 3, mismo comportamiento
 * que antes de parametrizarlo.
 *
 * Reglas críticas:
 * - 🔴 USA `getEffectiveScore` (decay incluido). El crudo persistido NO refleja
 *   "qué tan caliente está HOY" — si usás el crudo, el #1 puede ser alguien que
 *   se enfrió hace una semana y el reporte miente.
 * - 🔴 Excluye DQ siempre (`excludeDqWhere()`).
 * - 🔴 Filtra por organización (multi-tenant).
 * - Si la org no tiene leads en la semana, devuelve `[]`.
 */
export async function getTopHotLeadsForWeek(
  organizationId: string,
  weekStart: Date,
  weekEnd: Date,
  now: Date = new Date(),
  leadCount: number = 3,
): Promise<TopHotLeadItem[]> {
  // Defensivo: la columna Organization.executiveReportLeadCount es un Int sin
  // constraint de DB. Si llega un valor fuera de rango (dato legado, edición
  // manual), caemos a 3 en vez de un `.slice(0, n<=0)` silenciosamente vacío/raro.
  const safeLeadCount =
    Number.isInteger(leadCount) && leadCount > 0 ? Math.min(leadCount, 50) : 3

  const rows = await prisma.chatbotLead.findMany({
    where: {
      botConfig: { organizationId },
      capturedAt: { gte: weekStart, lte: weekEnd },
      score: { not: null },
      classification: { not: null },
      ...excludeDqWhere(),
    },
    select: {
      name: true,
      email: true,
      phone: true,
      message: true,
      intent: true,
      score: true,
      classification: true,
      scoreSignals: true,
      capturedAt: true,
    },
    // El sort fino por efectivo es en memoria (el decay no está en DB). Acotamos
    // el set con un take generoso para que el ranking sea correcto sin traer
    // toda la base.
    orderBy: { capturedAt: 'desc' },
    take: 50,
  })

  type Ranked = {
    row: (typeof rows)[number]
    effectiveScore: number
    effectiveClassification: 'hot' | 'warm' | 'cold'
  }

  const ranked: Ranked[] = rows
    .map((row): Ranked | null => {
      if (row.score === null || row.classification === null) return null
      const eff = getEffectiveScore(
        {
          score: row.score,
          classification: row.classification,
          lastActivityAt: row.capturedAt,
        },
        now,
      )
      // Defensa de cinturón y tirantes — `getEffectiveScore` ya respeta DQ pero
      // si por algún motivo el ranking incluye DQ, lo descartamos acá también.
      const cls = eff.effectiveClassification
      if (cls === 'dq') return null
      return {
        row,
        effectiveScore: eff.effectiveScore,
        effectiveClassification: cls,
      }
    })
    .filter((x): x is Ranked => x !== null)
    .sort((a, b) => {
      if (b.effectiveScore !== a.effectiveScore) {
        return b.effectiveScore - a.effectiveScore
      }
      return b.row.capturedAt.getTime() - a.row.capturedAt.getTime()
    })
    .slice(0, safeLeadCount)

  return ranked.map((r) => {
    const heat = HEAT_BY_CLASS[r.effectiveClassification]

    const signals = Array.isArray(r.row.scoreSignals)
      ? (r.row.scoreSignals as unknown as ScoredSignal[])
      : []
    const reasons = getScoreExplanation(signals)
      .filter((line) => line.kind === 'positive' || line.kind === 'combo')
      .slice(0, MAX_REASONS)
      .map((line) => line.label)

    const messageText = r.row.message?.trim() || null
    const intentText = r.row.intent?.trim() || null
    const whatTheyWant =
      messageText && messageText.length > 0
        ? truncate(messageText, MAX_MESSAGE_CHARS)
        : intentText && intentText.length > 0 && intentText !== 'unknown'
          ? intentText
          : null

    return {
      name: r.row.name?.trim() || 'Sin nombre',
      email: r.row.email,
      phone: r.row.phone,
      heatLabel: heat.label,
      heatAccent: heat.accent,
      whatTheyWant,
      reasons,
    }
  })
}
