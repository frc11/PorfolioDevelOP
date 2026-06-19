'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { computeDiff, logAdminAction, omitAuditNoise } from '@/lib/audit-log'
import { requireSuperAdmin } from './requireSuperAdmin'
import { alertIdSchema } from './manageAlerts.schemas'

export async function listAlerts(filter?: { status?: string; severity?: string }) {
  await requireSuperAdmin()

  return prisma.botAlert.findMany({
    where: {
      ...(filter?.status && { status: filter.status as never }),
      ...(filter?.severity && { severity: filter.severity as never }),
    },
    include: {
      botConfig: {
        include: { organization: { select: { companyName: true, slug: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

export async function acknowledgeAlert(alertId: string) {
  const id = alertIdSchema.parse(alertId)
  const user = await requireSuperAdmin()

  const before = await prisma.botAlert.findUnique({ where: { id } })
  const after = await prisma.botAlert.update({
    where: { id },
    data: {
      status: 'ACKNOWLEDGED',
      acknowledgedAt: new Date(),
      acknowledgedBy: user.id,
    },
  })

  if (before) {
    await logAdminAction({
      userId: user.id ?? 'unknown',
      userEmail: user.email,
      userName: user.name,
      actionType: 'ALERT_ACKNOWLEDGED',
      action: `Marco alerta como vista: "${after.title}"`,
      targetType: 'BotAlert',
      targetId: after.id,
      diff: computeDiff(
        omitAuditNoise(before as unknown as Record<string, unknown>),
        omitAuditNoise(after as unknown as Record<string, unknown>),
      ),
      metadata: { botConfigId: after.botConfigId },
    })
  }

  revalidatePath('/admin/alerts')
  revalidateTag('admin-alerts-count', {})
  return { ok: true }
}

export async function resolveAlert(alertId: string) {
  const id = alertIdSchema.parse(alertId)
  const user = await requireSuperAdmin()

  const before = await prisma.botAlert.findUnique({ where: { id } })
  const after = await prisma.botAlert.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedBy: user.id,
    },
  })

  if (before) {
    await logAdminAction({
      userId: user.id ?? 'unknown',
      userEmail: user.email,
      userName: user.name,
      actionType: 'ALERT_RESOLVED',
      action: `Resolvio alerta: "${after.title}"`,
      targetType: 'BotAlert',
      targetId: after.id,
      diff: computeDiff(
        omitAuditNoise(before as unknown as Record<string, unknown>),
        omitAuditNoise(after as unknown as Record<string, unknown>),
      ),
      metadata: { botConfigId: after.botConfigId },
    })
  }

  revalidatePath('/admin/alerts')
  revalidateTag('admin-alerts-count', {})
  return { ok: true }
}
