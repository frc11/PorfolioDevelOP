import { prisma } from '@/lib/prisma'

export async function getPendingInsightsByOrgSlug(orgSlug: string) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { botConfig: true },
  })
  if (!org?.botConfig) return []

  return prisma.chatbotInsight.findMany({
    where: {
      botConfigId: org.botConfig.id,
      status: 'PENDING',
    },
    orderBy: [{ category: 'asc' }, { evidenceCount: 'desc' }],
  })
}

export async function getInsightHistoryByOrgSlug(orgSlug: string, limit = 50) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { botConfig: true },
  })
  if (!org?.botConfig) return []

  return prisma.chatbotInsight.findMany({
    where: {
      botConfigId: org.botConfig.id,
      status: { in: ['APPLIED', 'DISMISSED'] },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getInsightsCountForBot(botConfigId: string) {
  const counts = await prisma.chatbotInsight.groupBy({
    by: ['status'],
    where: { botConfigId },
    _count: { status: true },
  })

  return counts.reduce(
    (acc, count) => ({ ...acc, [count.status]: count._count.status }),
    {} as Record<string, number>
  )
}
