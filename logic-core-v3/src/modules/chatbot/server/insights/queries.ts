import { forOrg, unsafeGlobalQuery } from '@/lib/isolation'

/** TENANT-RESOLUTION: resuelve la org (y si tiene bot) por su slug de dashboard. */
async function resolveOrgIdBySlug(orgSlug: string): Promise<string | null> {
  const org = await unsafeGlobalQuery(
    'TENANT-RESOLUTION: org por slug para el dashboard de insights',
    (c) => c.organization.findUnique({ where: { slug: orgSlug }, select: { id: true, botConfig: { select: { id: true } } } }),
  )
  return org?.botConfig ? org.id : null
}

export async function getPendingInsightsByOrgSlug(orgSlug: string) {
  const organizationId = await resolveOrgIdBySlug(orgSlug)
  if (!organizationId) return []

  // Scope relacional (botConfig.organizationId): la org tiene un único bot, así
  // que el scope equivale al filtro por botConfigId anterior.
  return forOrg(organizationId).chatbotInsight.findMany({
    where: { status: 'PENDING' },
    orderBy: [{ category: 'asc' }, { evidenceCount: 'desc' }],
  })
}

export async function getInsightHistoryByOrgSlug(orgSlug: string, limit = 50) {
  const organizationId = await resolveOrgIdBySlug(orgSlug)
  if (!organizationId) return []

  return forOrg(organizationId).chatbotInsight.findMany({
    where: { status: { in: ['APPLIED', 'DISMISSED'] } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getInsightsCountForBot(organizationId: string, botConfigId: string) {
  const counts = await forOrg(organizationId).chatbotInsight.groupBy({
    by: ['status'],
    where: { botConfigId },
    _count: { status: true },
  })

  return counts.reduce(
    (acc, count) => ({ ...acc, [count.status]: count._count.status }),
    {} as Record<string, number>
  )
}
