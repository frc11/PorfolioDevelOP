import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const checkClientHasChatbot = cache(async (orgId: string) => {
  const bot = await prisma.botConfig.findFirst({
    where: {
      organizationId: orgId,
      isActive: true,
    },
    select: { id: true, isActive: true },
  })
  return !!bot
})
