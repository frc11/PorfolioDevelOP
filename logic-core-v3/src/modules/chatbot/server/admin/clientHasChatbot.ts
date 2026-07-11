import { cache } from 'react'
import { forOrg } from '@/lib/isolation'

export const checkClientHasChatbot = cache(async (orgId: string) => {
  const bot = await forOrg(orgId).botConfig.findFirst({
    where: { isActive: true },
    select: { id: true, isActive: true },
  })
  return !!bot
})
