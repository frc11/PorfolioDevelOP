import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const listAllBots = cache(async () => {
  return prisma.botConfig.findMany({
    select: {
      id: true,
      slug: true,
      botName: true,
      isActive: true,
      accentColor: true,
      industry: true,
      createdAt: true,
      updatedAt: true,
      organization: {
        select: {
          id: true,
          companyName: true,
          slug: true,
        },
      },
      _count: {
        select: {
          conversations: true,
          leads: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
})

export type BotListItem = Awaited<ReturnType<typeof listAllBots>>[number]
