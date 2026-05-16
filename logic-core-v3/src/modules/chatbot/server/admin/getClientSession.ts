import { cache } from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const getClientChatbotSession = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null

  // Buscar organización del usuario via OrgMember
  const member = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organization: {
        include: {
          botConfig: true,
        },
      },
    },
  })

  if (!member?.organization?.botConfig) return null

  return {
    user: session.user,
    organization: member.organization,
    bot: member.organization.botConfig,
  }
})
