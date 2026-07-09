import { cache } from 'react'
import { unsafeGlobalQuery } from '@/lib/isolation'

export const listAllBots = cache(async () => {
  // PLATFORM-AGG: listado de todos los bots de todas las orgs (admin develOP).
  return unsafeGlobalQuery('PLATFORM-AGG: listado de todos los bots/orgs para el admin develOP', (c) =>
    c.botConfig.findMany({
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
    }),
  )
})

export type BotListItem = Awaited<ReturnType<typeof listAllBots>>[number]
