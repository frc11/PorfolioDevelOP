'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from './requireSuperAdmin'

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
  const user = await requireSuperAdmin()

  await prisma.botAlert.update({
    where: { id: alertId },
    data: {
      status: 'ACKNOWLEDGED',
      acknowledgedAt: new Date(),
      acknowledgedBy: user.id,
    },
  })

  revalidatePath('/admin/alerts')
  return { ok: true }
}

export async function resolveAlert(alertId: string) {
  const user = await requireSuperAdmin()

  await prisma.botAlert.update({
    where: { id: alertId },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedBy: user.id,
    },
  })

  revalidatePath('/admin/alerts')
  return { ok: true }
}
