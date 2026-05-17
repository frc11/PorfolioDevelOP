'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { requireSuperAdmin } from '@/modules/chatbot/server/admin/requireSuperAdmin'

export async function bulkPauseBots(orgIds: string[]) {
  const user = await requireSuperAdmin()
  const uniqueOrgIds = [...new Set(orgIds)].filter(Boolean)

  if (uniqueOrgIds.length === 0) {
    return { ok: true, affected: 0 }
  }

  const bots = await prisma.botConfig.findMany({
    where: {
      organizationId: { in: uniqueOrgIds },
      isActive: true,
    },
  })

  await prisma.botConfig.updateMany({
    where: { organizationId: { in: uniqueOrgIds }, isActive: true },
    data: { isActive: false },
  })

  for (const bot of bots) {
    await logAdminAction({
      userId: user.id ?? 'unknown',
      userEmail: user.email,
      userName: user.name,
      actionType: 'BOT_DEACTIVATED',
      action: `Bulk: bot pausado "${bot.botName}"`,
      targetType: 'BotConfig',
      targetId: bot.id,
      metadata: { bulkAction: true, count: uniqueOrgIds.length },
    })
  }

  revalidatePath('/admin/clients')
  return { ok: true, affected: bots.length }
}

export async function bulkExportLeads(orgIds: string[]) {
  await requireSuperAdmin()
  const uniqueOrgIds = [...new Set(orgIds)].filter(Boolean)

  const leads = await prisma.chatbotLead.findMany({
    where: { botConfig: { organizationId: { in: uniqueOrgIds } } },
    include: {
      botConfig: {
        include: {
          organization: { select: { companyName: true } },
        },
      },
    },
    orderBy: { capturedAt: 'desc' },
  })

  const csv = [
    'Cliente,Nombre,Email,Telefono,Status,Intent,Fecha',
    ...leads.map((lead) =>
      [
        lead.botConfig.organization.companyName,
        lead.name ?? '',
        lead.email ?? '',
        lead.phone ?? '',
        lead.status,
        lead.intent ?? '',
        lead.capturedAt.toISOString(),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ].join('\n')

  return { ok: true, csv, count: leads.length }
}
