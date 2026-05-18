import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export const getSubscriptionForOrg = cache(async (orgId: string) => {
  return prisma.subscription.findUnique({
    where: { organizationId: orgId },
    select: {
      status: true,
      planName: true,
      renewalDate: true,
    },
  })
})
