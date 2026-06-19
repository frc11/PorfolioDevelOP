'use server'

import type { AuditActionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/modules/chatbot/server/admin/requireSuperAdmin'

interface ListAuditLogFilter {
  userId?: string
  actionType?: string
  targetType?: string
  targetId?: string
  fromDate?: Date
  toDate?: Date
}

export async function listAuditLog(
  filter?: ListAuditLogFilter,
  page = 0,
  pageSize = 10,
) {
  await requireSuperAdmin()

  const createdAt =
    filter?.fromDate || filter?.toDate
      ? {
          ...(filter.fromDate && { gte: filter.fromDate }),
          ...(filter.toDate && { lte: filter.toDate }),
        }
      : undefined

  // Se pide pageSize + 1 para saber si existe una página siguiente sin un count() extra.
  const rows = await prisma.adminAuditLog.findMany({
    where: {
      ...(filter?.userId && { userId: filter.userId }),
      ...(filter?.actionType && {
        actionType: filter.actionType as AuditActionType,
      }),
      ...(filter?.targetType && { targetType: filter.targetType }),
      ...(filter?.targetId && { targetId: filter.targetId }),
      ...(createdAt && { createdAt }),
    },
    orderBy: { createdAt: 'desc' },
    skip: page * pageSize,
    take: pageSize + 1,
  })

  return {
    entries: rows.slice(0, pageSize),
    hasMore: rows.length > pageSize,
  }
}

export async function getAuditLogStats() {
  await requireSuperAdmin()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [total, last7Days, byActionType] = await Promise.all([
    prisma.adminAuditLog.count(),
    prisma.adminAuditLog.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.adminAuditLog.groupBy({
      by: ['actionType'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true,
    }),
  ])

  return { total, last7Days, byActionType }
}
