import { getClientChatbotSession, listLeadsByOrgSlug } from '@/modules/chatbot/index.server'
import { ClientLeadsTable } from '@/modules/chatbot/components/dashboard/ClientLeadsTable'
import { getEffectiveScore, getScoreExplanation } from '@/modules/chatbot/server/scoring'
import type { ScoredSignal, LeadScoreClassification } from '@/modules/chatbot/server/scoring'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ClientLeadsPage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  const rawLeads = await listLeadsByOrgSlug(session.organization.slug, 200)
  // B5.5 — aplica getEffectiveScore en lectura, filtra DQ del lado del cliente
  const now = new Date()
  const visibleRaw = rawLeads.filter((lead) => lead.classification !== 'dq')
  // Si capturó leads pero todos eran DQ, mostrar empty state distinto
  const hadOnlyDq = rawLeads.length > 0 && visibleRaw.length === 0

  const leads = visibleRaw
    .map((lead) => {
      if (lead.score == null || lead.classification == null) {
        return { ...lead, effectiveScore: null, effectiveClassification: null, decayTierLabel: null, scoreExplanation: [] }
      }
      const effective = getEffectiveScore(
        {
          score: lead.score,
          classification: lead.classification as LeadScoreClassification,
          // unstable_cache serializa dates como strings → normalizar siempre
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
    // Orden por score efectivo desc; nulls al final, desempate por capturedAt desc.
    // En-app sobre el efectivo: la query usa índices DB para filtrar,
    // pero el efectivo (crudo × decay) no está en DB y se computa acá.
    // Trade-off: no escala a >miles de leads sin paginación + materialización.
    .sort((a, b) => {
      if (a.effectiveScore == null && b.effectiveScore == null) {
        return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
      }
      if (a.effectiveScore == null) return 1
      if (b.effectiveScore == null) return -1
      if (b.effectiveScore !== a.effectiveScore) return b.effectiveScore - a.effectiveScore
      return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    })

  return <ClientLeadsTable leads={leads} hadOnlyDq={hadOnlyDq} />
}
