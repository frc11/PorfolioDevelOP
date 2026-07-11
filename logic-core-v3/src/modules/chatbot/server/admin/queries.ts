import { forOrg } from '@/lib/isolation'

// Admin bot-detail: cada función recibe el organizationId del bot (resuelto por
// el caller admin) y scopea vía el helper. El botConfigId sigue acotando al bot.

export async function listLeadsForBot(organizationId: string, botConfigId: string, limit: number = 50) {
  return forOrg(organizationId).chatbotLead.findMany({
    where: { botConfigId },
    orderBy: { capturedAt: 'desc' },
    take: limit,
    include: {
      conversation: {
        select: { sessionId: true, currentPath: true, startedAt: true },
      },
    },
  })
}

export async function listConversationsForBot(organizationId: string, botConfigId: string, limit: number = 50) {
  return forOrg(organizationId).conversation.findMany({
    where: { botConfigId },
    orderBy: { lastMessageAt: 'desc' },
    take: limit,
    include: {
      lead: { select: { id: true, name: true, intent: true } },
      _count: { select: { messages: true } },
    },
  })
}

export async function getMonthlyUsageForBot(organizationId: string, botConfigId: string) {
  const now = new Date()
  return forOrg(organizationId).quotaUsage.findByPeriod(botConfigId, now.getUTCFullYear(), now.getUTCMonth() + 1)
}

export async function listRecentEvents(organizationId: string, botConfigId: string, limit: number = 100) {
  return forOrg(organizationId).chatbotEvent.findMany({
    where: { botConfigId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      conversation: { select: { sessionId: true, currentPath: true } },
    },
  })
}

export async function listEventsSince(
  organizationId: string,
  botConfigId: string,
  since: Date,
  limit: number = 50,
) {
  return forOrg(organizationId).chatbotEvent.findMany({
    where: { botConfigId, createdAt: { gt: since } },
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: {
      conversation: { select: { sessionId: true, currentPath: true } },
    },
  })
}
