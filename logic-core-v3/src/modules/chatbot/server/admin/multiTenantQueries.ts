import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getBotByOrgSlug(orgSlug: string) {
  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      botConfig: {
        include: {
          knowledgeBase: true,
        },
      },
    },
  })

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

      const rows = await prisma.chatbotLead.findMany({
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
        intent: r.intent ?? 'unknown',
        message: r.message ?? '',
      }))
    },
    ['chatbot-leads', orgSlug, String(limit)],
    { revalidate: 120, tags: [`chatbot-leads:${orgSlug}`] }
  )()
}

export async function listConversationsByOrgSlug(orgSlug: string, limit: number = 50) {
  const botInfo = await getBotByOrgSlug(orgSlug)
  if (!botInfo) return []

  const rows = await prisma.conversation.findMany({
    where: { botConfigId: botInfo.bot.id },
    orderBy: { lastMessageAt: 'desc' },
    take: limit,
    include: {
      lead: { select: { id: true, name: true, intent: true } },
      _count: { select: { messages: true } },
    },
  })

  return rows.map((r) => ({
    ...r,
    lead: r.lead ? { ...r.lead, name: r.lead.name ?? 'Sin nombre' } : null,
  }))
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

  const rows = await prisma.chatbotEvent.findMany({
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
      return prisma.quotaUsage.findUnique({
        where: {
          botConfigId_year_month: {
            botConfigId: botInfo.bot.id,
            year: now.getUTCFullYear(),
            month: now.getUTCMonth() + 1,
          },
        },
      })
    },
    ['chatbot-usage', orgSlug],
    { revalidate: 300, tags: [`chatbot-usage:${orgSlug}`] }
  )()
}
