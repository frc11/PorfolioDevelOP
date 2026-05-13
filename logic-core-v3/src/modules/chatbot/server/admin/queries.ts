import { prisma } from '@/lib/prisma'

export async function listLeadsForBot(botConfigId: string, limit: number = 50) {
  return prisma.chatbotLead.findMany({
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

export async function listConversationsForBot(botConfigId: string, limit: number = 50) {
  return prisma.conversation.findMany({
    where: { botConfigId },
    orderBy: { lastMessageAt: 'desc' },
    take: limit,
    include: {
      lead: { select: { id: true, name: true, intent: true } },
      _count: { select: { messages: true } },
    },
  })
}

export async function getMonthlyUsageForBot(botConfigId: string) {
  const now = new Date()
  return prisma.quotaUsage.findUnique({
    where: {
      botConfigId_year_month: {
        botConfigId,
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
      },
    },
  })
}
