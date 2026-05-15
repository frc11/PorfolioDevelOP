import { prisma } from '@/lib/prisma'

export async function getBotByOrgSlug(orgSlug: string) {
  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      botConfig: {
        include: {
          knowledgeBase: true,
        },
      },
    },
  })

  if (!organization || !organization.botConfig) return null

  return {
    organization,
    bot: organization.botConfig,
  }
}

export async function listLeadsByOrgSlug(orgSlug: string, limit: number = 50) {
  const botInfo = await getBotByOrgSlug(orgSlug)
  if (!botInfo) return []

  const rows = await prisma.chatbotLead.findMany({
    where: { botConfigId: botInfo.bot.id },
    orderBy: { capturedAt: 'desc' },
    take: limit,
    include: {
      conversation: {
        select: { sessionId: true, currentPath: true, startedAt: true },
      },
    },
  })

  return rows.map((r) => ({
    ...r,
    name: r.name ?? 'Sin nombre',
    intent: r.intent ?? 'unknown',
    message: r.message ?? '',
  }))
}

export async function listConversationsByOrgSlug(orgSlug: string, limit: number = 50) {
  const botInfo = await getBotByOrgSlug(orgSlug)
  if (!botInfo) return []

  const rows = await prisma.conversation.findMany({
    where: { botConfigId: botInfo.bot.id },
    orderBy: { lastMessageAt: 'desc' },
    take: limit,
    include: {
      lead: { select: { id: true, name: true, intent: true } },
      _count: { select: { messages: true } },
    },
  })

  return rows.map((r) => ({
    ...r,
    lead: r.lead ? { ...r.lead, name: r.lead.name ?? 'Sin nombre' } : null,
  }))
}

export async function getUsageByOrgSlug(orgSlug: string) {
  const botInfo = await getBotByOrgSlug(orgSlug)
  if (!botInfo) return null

  const now = new Date()
  return prisma.quotaUsage.findUnique({
    where: {
      botConfigId_year_month: {
        botConfigId: botInfo.bot.id,
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
      },
    },
  })
}
