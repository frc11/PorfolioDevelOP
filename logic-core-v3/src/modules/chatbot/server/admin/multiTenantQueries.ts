import { unstable_cache } from 'next/cache'
import { forOrg, unsafeGlobalQuery } from '@/lib/isolation'
import type { Prisma, ChatbotLeadStatus } from '@prisma/client'
import { excludeDqWhere } from '../scoring/dqFilter'
import { startOfDateRange, type DateRange } from '@/lib/tz-ar'

export async function getBotByOrgSlug(orgSlug: string) {
  // TENANT-RESOLUTION: org+bot por slug (Organization no está cubierta por el
  // helper). El id de la org resultante alimenta los accessors scoped de abajo.
  const organization = await unsafeGlobalQuery(
    'TENANT-RESOLUTION: org+bot por slug para el dashboard/admin del chatbot',
    (c) =>
      c.organization.findUnique({
        where: { slug: orgSlug },
        include: { botConfig: { include: { knowledgeBase: true } } },
      }),
  )

  if (!organization || !organization.botConfig) return null

  return {
    organization,
    bot: organization.botConfig,
  }
}

export async function listLeadsByOrgSlug(orgSlug: string, limit: number = 50) {
  return unstable_cache(
    async () => {
      const botInfo = await getBotByOrgSlug(orgSlug)
      if (!botInfo) return []

      const rows = await forOrg(botInfo.organization.id).chatbotLead.findMany({
        where: { botConfigId: botInfo.bot.id },
        orderBy: { capturedAt: 'desc' },
        take: limit,
        include: {
          conversation: {
            select: { sessionId: true, currentPath: true, startedAt: true },
          },
        },
      })

      return rows.map((r) => ({
        ...r,
        name: r.name ?? 'Sin nombre',
        intent: r.intent,
        message: r.message ?? '',
      }))
    },
    ['chatbot-leads', orgSlug, String(limit)],
    { revalidate: 120, tags: [`chatbot-leads:${orgSlug}`] }
  )()
}

// B5.5 — Filtros para la vista del dueño. `status` y `range` se aplican en DB
// (índices @@index([status]) y @@index([botConfigId, capturedAt])). El filtro
// por clase (hot/warm/cold) NO está acá porque depende del score EFECTIVO
// post-decay, que se computa en app — se aplica después en page.tsx.
export interface LeadDashboardFilters {
  status?: ChatbotLeadStatus
  range?: DateRange
  /** Si true, devuelve SOLO los DQ. Si false (default), excluye DQ. */
  onlyDq?: boolean
}

/**
 * Lista leads de una org con filtros server-side. Sin unstable_cache:
 * las combinaciones de filtros vivirían como cache keys distintos y el set
 * ya queda acotado por los filtros DB. El polling cliente refresca cada 30s.
 *
 * Multi-tenancy: filtro relacional `botConfig: { organizationId }` — un id
 * de otra org devuelve [] sin leak de existencia.
 */
export async function listLeadsForDashboard(
  organizationId: string,
  filters: LeadDashboardFilters = {},
  limit: number = 200,
) {
  // El scope (forOrg) agrega el filtro botConfig:{organizationId}; el `where`
  // acá solo lleva los filtros de la vista (nunca el eje de tenant).
  const where: Prisma.ChatbotLeadWhereInput = {}

  if (filters.onlyDq) {
    where.classification = 'dq'
  } else {
    Object.assign(where, excludeDqWhere())
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.range && filters.range !== 'all') {
    const start = startOfDateRange(filters.range)
    if (start) {
      where.capturedAt = { gte: start }
    }
  }

  const rows = await forOrg(organizationId).chatbotLead.findMany({
    where,
    // El orden final por score efectivo se hace EN MEMORIA (page.tsx) porque el
    // efectivo = score crudo × decay temporal, y el decay no está en DB.
    // El índice DB (botConfigId, capturedAt) ordena el set acotado por fecha;
    // sirve como desempate estable cuando dos efectivos empatan.
    orderBy: { capturedAt: 'desc' },
    take: limit,
    include: {
      conversation: {
        select: { sessionId: true, currentPath: true, startedAt: true },
      },
    },
  })

  return rows.map((r) => ({
    ...r,
    name: r.name ?? 'Sin nombre',
    intent: r.intent,
    message: r.message ?? '',
  }))
}

/**
 * Conteo de DQ de la org. Lo usa el toggle "Ver descartados" para mostrar el
 * número incluso cuando la vista actual los excluye. Índice usado:
 * @@index([botConfigId, classification, capturedAt(sort: Desc)]) — pega justo.
 */
export async function countDqLeadsForOrg(organizationId: string): Promise<number> {
  return forOrg(organizationId).chatbotLead.count({ classification: 'dq' })
}

// B5.7 — cuenta de leads "hot + sin contactar" para el badge de notificación
// del sidebar. Usa `classification` cruda de DB (no el efectivo post-decay) por
// dos razones: (1) el efectivo no está en DB → tendríamos que traer todos y
// computar en app, ineficiente; (2) un lead que fue hot al capturar y sigue
// NEW merece atención del dueño aunque haya envejecido a warm — el badge
// indica trabajo pendiente, no calidad actual. El efectivo correcto se ve al
// abrir la lista.
export async function countHotNewLeadsForOrg(organizationId: string): Promise<number> {
  return forOrg(organizationId).chatbotLead.count({ status: 'NEW', classification: 'hot' })
}

// B5.6 — fetch de un lead por id con anti-IDOR. Devuelve null si el lead no existe
// o pertenece a otra org. Prisma compone el filtro relacional en una sola query,
// así un atacante que adivine ids ajenos recibe null (no 403, no leak de existencia).
export async function getLeadByIdForOrg(leadId: string, organizationId: string) {
  return forOrg(organizationId).chatbotLead.findFirst({
    where: { id: leadId },
    include: {
      conversation: {
        select: { id: true, sessionId: true, currentPath: true, referrerUrl: true, startedAt: true, lastMessageAt: true, messageCount: true },
      },
    },
  })
}

// B5.6 — mensajes de una conversación con el mismo guard relacional. Si la
// conversación no es de la org, devuelve [] (no leak). `limit` cap inferior
// para evitar fetchs masivos desde la UI.
export async function getConversationMessagesForOrg(
  conversationId: string,
  organizationId: string,
  limit: number = 50,
) {
  return forOrg(organizationId).chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: Math.min(Math.max(limit, 1), 200),
    select: { id: true, role: true, content: true, createdAt: true },
  })
}

export async function listConversationsByOrgSlug(orgSlug: string, limit: number = 50) {
  const botInfo = await getBotByOrgSlug(orgSlug)
  if (!botInfo) return { items: [], total: 0 }

  const scope = forOrg(botInfo.organization.id)
  const [rows, total] = await Promise.all([
    scope.conversation.findMany({
      where: { botConfigId: botInfo.bot.id },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      include: {
        lead: { select: { id: true, name: true, intent: true } },
        _count: { select: { messages: true } },
      },
    }),
    scope.conversation.count({ botConfigId: botInfo.bot.id }),
  ])

  const items = rows.map((r) => ({
    ...r,
    lead: r.lead ? { ...r.lead, name: r.lead.name ?? 'Sin nombre' } : null,
  }))

  return { items, total }
}

export type HandoffEvent = {
  id: string
  visitorName: string | null
  reason: string | null
  createdAt: Date
  conversationId: string | null
}

export async function listRecentHandoffsByOrgSlug(
  orgSlug: string,
  limit: number = 10
): Promise<HandoffEvent[]> {
  const botInfo = await getBotByOrgSlug(orgSlug)
  if (!botInfo) return []

  const rows = await forOrg(botInfo.organization.id).chatbotEvent.findMany({
    where: {
      botConfigId: botInfo.bot.id,
      type: 'handoff.whatsapp',
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      conversationId: true,
      metadata: true,
      createdAt: true,
    },
  })

  return rows.map((r) => {
    const meta = (r.metadata ?? {}) as Record<string, string | null>
    return {
      id: r.id,
      conversationId: r.conversationId,
      visitorName: meta.visitorName ?? null,
      reason: meta.reason ?? null,
      createdAt: r.createdAt,
    }
  })
}

export async function getUsageByOrgSlug(orgSlug: string) {
  return unstable_cache(
    async () => {
      const botInfo = await getBotByOrgSlug(orgSlug)
      if (!botInfo) return null

      const now = new Date()
      return forOrg(botInfo.organization.id).quotaUsage.findByPeriod(
        botInfo.bot.id,
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
      )
    },
    ['chatbot-usage', orgSlug],
    { revalidate: 300, tags: [`chatbot-usage:${orgSlug}`] }
  )()
}
