import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { excludeDqWhere } from '@/modules/chatbot/server/scoring'

const THIRTY_DAYS_AGO = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

export const getBotsOverviewStats = cache(async () => {
  const [totalBots, activeBots, totalConversationsLast30d, totalLeadsLast30d] = await Promise.all([
    prisma.botConfig.count(),
    prisma.botConfig.count({ where: { isActive: true } }),
    prisma.conversation.count({
      where: { startedAt: { gte: THIRTY_DAYS_AGO() } },
    }),
    // B5.3 — métricas de conversión excluyen DQ (empleo/proveedor/spam/postventa<0).
    prisma.chatbotLead.count({
      where: {
        capturedAt: { gte: THIRTY_DAYS_AGO() },
        ...excludeDqWhere(),
      },
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
