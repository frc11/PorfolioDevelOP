import { cache } from 'react'
import { prisma } from '@/lib/prisma'

const THIRTY_DAYS_AGO = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

export const getBotsOverviewStats = cache(async () => {
  const [totalBots, activeBots, totalConversationsLast30d, totalLeadsLast30d] = await Promise.all([
    prisma.botConfig.count(),
    prisma.botConfig.count({ where: { isActive: true } }),
    prisma.conversation.count({
      where: { startedAt: { gte: THIRTY_DAYS_AGO() } },
    }),
    prisma.chatbotLead.count({
      where: { capturedAt: { gte: THIRTY_DAYS_AGO() } },
    }),
  ])

  return {
    totalBots,
    activeBots,
    inactiveBots: totalBots - activeBots,
    conversationsLast30d: totalConversationsLast30d,
    leadsLast30d: totalLeadsLast30d,
  }
})
