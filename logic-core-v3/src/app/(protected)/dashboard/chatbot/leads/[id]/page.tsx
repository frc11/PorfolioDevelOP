import { notFound, redirect } from 'next/navigation'
import {
  getClientChatbotSession,
  getLeadByIdForOrg,
  getConversationMessagesForOrg,
} from '@/modules/chatbot/index.server'
import {
  getEffectiveScore,
  getScoreExplanation,
} from '@/modules/chatbot/server/scoring'
import type {
  LeadScoreClassification,
  ScoredSignal,
} from '@/modules/chatbot/server/scoring'
import { LeadDetail } from '@/modules/chatbot/components/dashboard/LeadDetail'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { categorizeOrigin, siteHost, campaignLabel } from '@/lib/dashboard/lead-origin'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params

  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  // Anti-IDOR: el helper filtra por organizationId en la misma query.
  // Si el id no existe o pertenece a otra org → null → notFound.
  const lead = await getLeadByIdForOrg(id, session.organization.id)
  if (!lead) notFound()

  // P0.3 — Gate de presentación de la priorización (mismo helper que la lista).
  // El score se computa igual abajo; el flag solo decide si se muestra.
  const plan = await getPlanForOrg(session.organization.id)
  const showScoring = planAllows(plan, 'leadScoring')

  // Score efectivo + explicación se computan en lectura (mismo patrón que la lista).
  const now = new Date()
  const enriched = (() => {
    if (lead.score == null || lead.classification == null) {
      return {
        effectiveScore: null as number | null,
        effectiveClassification: null as LeadScoreClassification | null,
        decayTierLabel: null as string | null,
        scoreExplanation: [] as ReturnType<typeof getScoreExplanation>,
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
      effectiveScore: effective.effectiveScore,
      effectiveClassification: effective.effectiveClassification,
      decayTierLabel: effective.decayTierLabel,
      scoreExplanation: getScoreExplanation(signals),
    }
  })()

  // Mensajes de la conversación origen (si hay). El helper revalida org → cero
  // IDOR aunque el lead tenga conversationId apuntando a otra org (no debería,
  // pero defensa en profundidad).
  const messages = lead.conversationId
    ? await getConversationMessagesForOrg(lead.conversationId, session.organization.id, 50)
    : []

  // Origen legible reusando el mapeo compartido de P1.C/P1.D (lead-origin.ts).
  // Dato factual → para todos los planes. ownHost evita marcar tráfico interno
  // como 'Otros'.
  const originLabel = categorizeOrigin(
    { referrerUrl: lead.conversation?.referrerUrl ?? null, utmSource: lead.utmSource },
    siteHost(session.organization.siteUrl),
  )

  // P4.1 — Campaña legible reusando el mapeo compartido (lead-origin.ts). El
  // utm_campaign ya viene cargado en `lead` (getLeadByIdForOrg usa include).
  // null (sin campaña / lead pre-UTM.1) → el componente muestra "Sin campaña".
  const campaign = campaignLabel(lead.utmCampaign)

  return (
    <LeadDetail
      lead={lead}
      enriched={enriched}
      messages={messages}
      botSlug={session.organization.slug}
      showScoring={showScoring}
      originLabel={originLabel}
      campaignLabel={campaign}
    />
  )
}
