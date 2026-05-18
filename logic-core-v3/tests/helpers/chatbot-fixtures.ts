import { PrismaClient } from '@prisma/client'

export async function ensureClientBot(prisma: PrismaClient) {
  const membership = await prisma.orgMember.findFirst({
    where: { user: { email: 'cliente@sanmiguel.com' } },
    include: {
      organization: {
        include: { botConfig: true },
      },
    },
  })

  if (!membership?.organization) {
    throw new Error('Client fixture organization not found')
  }

  if (membership.organization.botConfig) {
    return { botId: membership.organization.botConfig.id, created: false }
  }

  const bot = await prisma.botConfig.create({
    data: {
      organizationId: membership.organization.id,
      slug: `${membership.organization.slug}-e2e-bot`,
      botName: 'Asistente San Miguel',
      isActive: true,
      accentColor: '#06b6d4',
      avatarStyle: 'neuro',
      position: 'bottom_right',
      welcomeMessage: 'Hola! Soy el asistente de San Miguel. Te ayudo con tu consulta.',
      quickReplies: [
        { label: 'Quiero cotizar', promptToSend: 'Quiero cotizar' },
        { label: 'Ver horarios', promptToSend: 'Ver horarios' },
      ],
    },
  })

  return { botId: bot.id, created: true }
}

export async function cleanupClientBot(prisma: PrismaClient, fixture: Awaited<ReturnType<typeof ensureClientBot>> | null) {
  if (!fixture?.created) return
  await prisma.botConfig.delete({ where: { id: fixture.botId } }).catch(() => undefined)
}
