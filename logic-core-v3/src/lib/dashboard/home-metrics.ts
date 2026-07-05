// P1.C — Capa de datos del home de resultados del negocio. Org-scoped SIEMPRE
// (filtro relacional `botConfig: { organizationId }`, mismo patrón anti-fuga que
// listLeadsForDashboard). Períodos vía dates-ar (nunca new Date() para bordes).
// La lógica derivada (velocidad, embudo, origen) es pura y vive en
// home-metrics-logic.ts; acá solo se consultan y se orquestan en paralelo.

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { countHotNewLeadsForOrg } from '@/modules/chatbot/server/admin/multiTenantQueries'
import {
  periodBoundsForHome,
  computeLeadsDelta,
  computeVelocity,
  buildFunnel,
  tallyOrigins,
  tallyCampaigns,
  type LeadsDelta,
  type Velocity,
  type Funnel,
  type OriginBucket,
  type CampaignBreakdown,
} from './home-metrics-logic'
import type { UTCRange } from '@/lib/dates-ar'

export interface TopHotLead {
  id: string
  name: string
  intent: string | null
  message: string | null
  capturedAt: Date
}

export interface HomeSemaforo {
  /** true sólo si el plan incluye clasificación (Pro+). Si false, hotCount=0/top=null. */
  enabled: boolean
  hotCount: number
  top: TopHotLead | null
}

export interface HomeBusinessMetrics {
  leads: LeadsDelta
  velocity: Velocity
  funnel: Funnel
  origins: OriginBucket[]
  campaigns: CampaignBreakdown
  semaforo: HomeSemaforo
}

export interface HomeMetricsOptions {
  /** Gate Pro+: si false, NO se consultan ni muestran los datos de clasificación. */
  includeClassification: boolean
  /** Host del sitio del cliente (Organization.siteUrl) para mapear tráfico interno. */
  ownHost?: string | null
  /** Inyectable para tests; default reloj real. */
  now?: Date
}

async function getTopHotNewLead(organizationId: string): Promise<TopHotLead | null> {
  const lead = await prisma.chatbotLead.findFirst({
    where: { botConfig: { organizationId }, status: 'NEW', classification: 'hot' },
    orderBy: { capturedAt: 'desc' },
    select: { id: true, name: true, intent: true, message: true, capturedAt: true },
  })
  if (!lead) return null
  return {
    id: lead.id,
    name: lead.name ?? 'Un contacto',
    intent: lead.intent,
    message: lead.message,
    capturedAt: lead.capturedAt,
  }
}

/**
 * Métricas del home para UNA org y el período actual (semana AR) vs el anterior.
 * Todas las queries van en paralelo. Los datos de clasificación (semáforo) sólo
 * se consultan si `includeClassification` (gate de plan resuelto por el caller).
 */
export async function getHomeBusinessMetrics(
  organizationId: string,
  opts: HomeMetricsOptions,
): Promise<HomeBusinessMetrics> {
  const now = opts.now ?? new Date()
  const ownHost = opts.ownHost ?? null
  const { current, previous } = periodBoundsForHome(now)

  // Lead "del negocio" = todo lo capturado MENOS los descalificados (DQ). Excluye
  // SOLO classification='dq' e INCLUYE los no clasificados (null): un lead sin
  // scorear todavía es un lead real que entró. OJO: no se reusa `excludeDqWhere()`
  // de scoring (NOT:{classification:'dq'}) porque en SQL ese filtro también
  // descarta los null → undercount de leads sin scorear. Acá los contamos.
  const notDq: Prisma.ChatbotLeadWhereInput = {
    OR: [{ classification: null }, { classification: { not: 'dq' } }],
  }

  const businessWhere = (range: UTCRange): Prisma.ChatbotLeadWhereInput => ({
    botConfig: { organizationId },
    ...notDq,
    capturedAt: { gte: range.start, lt: range.end },
  })

  const [leadsCurrent, leadsPrevious, periodLeads, hotCount, top] = await Promise.all([
    prisma.chatbotLead.count({ where: businessWhere(current) }),
    prisma.chatbotLead.count({ where: businessWhere(previous) }),
    prisma.chatbotLead.findMany({
      where: businessWhere(current),
      select: {
        status: true,
        firstContactedAt: true,
        capturedAt: true,
        utmSource: true,
        utmCampaign: true,
        conversation: { select: { referrerUrl: true } },
      },
    }),
    opts.includeClassification ? countHotNewLeadsForOrg(organizationId) : Promise.resolve(0),
    opts.includeClassification ? getTopHotNewLead(organizationId) : Promise.resolve(null),
  ])

  const velocity = computeVelocity(
    periodLeads.map((l) => ({ capturedAt: l.capturedAt, firstContactedAt: l.firstContactedAt })),
  )
  const funnel = buildFunnel(
    periodLeads.map((l) => ({ status: l.status, firstContactedAt: l.firstContactedAt })),
  )
  const origins = tallyOrigins(
    periodLeads.map((l) => ({
      referrerUrl: l.conversation?.referrerUrl ?? null,
      utmSource: l.utmSource,
    })),
    ownHost,
  )
  // Campaña: misma query org-scoped y mismo período que el resto (no se re-consulta).
  const campaigns = tallyCampaigns(periodLeads.map((l) => l.utmCampaign))

  return {
    leads: computeLeadsDelta(leadsCurrent, leadsPrevious),
    velocity,
    funnel,
    origins,
    campaigns,
    semaforo: { enabled: opts.includeClassification, hotCount, top },
  }
}
