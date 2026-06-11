import {
  getClientChatbotSession,
  listLeadsForDashboard,
  countDqLeadsForOrg,
  type LeadDashboardFilters,
} from '@/modules/chatbot/index.server'
import { ClientLeadsTable } from '@/modules/chatbot/components/dashboard/ClientLeadsTable'
import { getEffectiveScore, getScoreExplanation } from '@/modules/chatbot/server/scoring'
import type { ScoredSignal, LeadScoreClassification } from '@/modules/chatbot/server/scoring'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import type { ChatbotLeadStatus } from '@prisma/client'
import type { DateRange } from '@/lib/tz-ar'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const VALID_STATUSES: ChatbotLeadStatus[] = ['NEW', 'CONTACTED', 'IN_NEGOTIATION', 'WON', 'LOST']
const VALID_RANGES: DateRange[] = ['all', 'today', '7d', '30d']

function parseStatus(v: string | undefined): ChatbotLeadStatus | undefined {
  if (!v) return undefined
  return (VALID_STATUSES as string[]).includes(v) ? (v as ChatbotLeadStatus) : undefined
}

function parseRange(v: string | undefined): DateRange {
  if (!v) return 'all'
  return (VALID_RANGES as string[]).includes(v) ? (v as DateRange) : 'all'
}

interface PageProps {
  searchParams: Promise<{ status?: string; range?: string; view?: string }>
}

export default async function ClientLeadsPage({ searchParams }: PageProps) {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  const params = await searchParams
  const statusFilter = parseStatus(params.status)
  const rangeFilter = parseRange(params.range)
  const showingDq = params.view === 'dq'

  // Filtros DB: status, range, exclusión DQ (o solo DQ si view=dq). Aprovecha:
  // @@index([botConfigId, capturedAt]), @@index([status]),
  // @@index([botConfigId, classification, capturedAt(sort: Desc)]).
  const filters: LeadDashboardFilters = {
    status: statusFilter,
    range: rangeFilter,
    onlyDq: showingDq,
  }

  // El conteo DQ es global a la org (no respeta filtros) — sirve para que el
  // chip "Descartados (N)" muestre siempre el total real disponible.
  const [rawLeads, dqCount, plan] = await Promise.all([
    listLeadsForDashboard(session.organization.id, filters, 200),
    countDqLeadsForOrg(session.organization.id),
    getPlanForOrg(session.organization.id),
  ])

  // P0.3 — Gate de PRESENTACIÓN de la priorización caliente/tibio/frío. El
  // scoring se computa igual abajo (un Starter que sube a Pro ve su historial
  // clasificado al instante); este flag solo decide si la UI muestra los chips
  // o el teaser. Decisión única vía `planAllows` (mapea a insightEnabled).
  const showScoring = planAllows(plan, 'leadScoring')

  // Si la org no captura aún ninguno (incluyendo DQ), el empty state base
  // ofrece CTA al chatbot. `hadOnlyDq` solo aplica a la vista no-DQ.
  const hadOnlyDq = !showingDq && rawLeads.length === 0 && dqCount > 0

  const now = new Date()
  const leads = rawLeads
    .map((lead) => {
      if (lead.score == null || lead.classification == null) {
        return {
          ...lead,
          effectiveScore: null,
          effectiveClassification: null,
          decayTierLabel: null,
          scoreExplanation: [],
        }
      }
      const effective = getEffectiveScore(
        {
          score: lead.score,
          classification: lead.classification as LeadScoreClassification,
          lastActivityAt: new Date(lead.capturedAt),
        },
        now,
      )
      const signals = Array.isArray(lead.scoreSignals)
        ? (lead.scoreSignals as unknown as ScoredSignal[])
        : []
      return {
        ...lead,
        effectiveScore: effective.effectiveScore,
        effectiveClassification: effective.effectiveClassification,
        decayTierLabel: effective.decayTierLabel,
        scoreExplanation: getScoreExplanation(signals),
      }
    })
    // Orden en memoria por score efectivo desc. No se puede en DB porque el
    // efectivo = crudo × decay temporal, y el decay se aplica en lectura.
    // A volumen miles+, esto pide paginación + materialización (roadmap-pendientes).
    .sort((a, b) => {
      if (a.effectiveScore == null && b.effectiveScore == null) {
        return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
      }
      if (a.effectiveScore == null) return 1
      if (b.effectiveScore == null) return -1
      if (b.effectiveScore !== a.effectiveScore) return b.effectiveScore - a.effectiveScore
      return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    })

  return (
    <ClientLeadsTable
      leads={leads}
      hadOnlyDq={hadOnlyDq}
      dqCount={dqCount}
      showingDq={showingDq}
      showScoring={showScoring}
      initialStatus={statusFilter ?? 'all'}
      initialRange={rangeFilter}
    />
  )
}
