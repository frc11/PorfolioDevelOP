import { NextResponse } from 'next/server'
import { resolveOrgId } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { excludeDqWhere, getEffectiveScore, getScoreExplanation } from '@/modules/chatbot/server/scoring'
import type { ScoredSignal, LeadScoreClassification } from '@/modules/chatbot/server/scoring'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ leads: [] }, { status: 401 })
  }

  const orgId = await resolveOrgId()
  if (!orgId) {
    return NextResponse.json({ leads: [] })
  }

  // B5.3 — vista del cliente NO muestra DQ (empleo/proveedor/spam/postventa-negativo).
  const rawLeads = await prisma.chatbotLead.findMany({
    where: {
      botConfig: { organizationId: orgId },
      ...excludeDqWhere(),
    },
    orderBy: { capturedAt: 'desc' },
    take: 50,
  })

  // B5.5 — aplica decay en lectura, enriquece con score efectivo + explicación
  const now = new Date()
  const leads = rawLeads
    .map((lead) => {
      if (lead.score == null || lead.classification == null) {
        return { ...lead, effectiveScore: null, effectiveClassification: null, decayTierLabel: null, scoreExplanation: [] }
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
    // Orden por efectivo desc (en-app, no en DB) — ver nota en page.tsx
    .sort((a, b) => {
      if (a.effectiveScore == null && b.effectiveScore == null) {
        return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
      }
      if (a.effectiveScore == null) return 1
      if (b.effectiveScore == null) return -1
      if (b.effectiveScore !== a.effectiveScore) return b.effectiveScore - a.effectiveScore
      return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    })

  return NextResponse.json({ leads })
}
