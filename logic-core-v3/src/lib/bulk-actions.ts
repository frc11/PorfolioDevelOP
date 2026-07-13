'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { CSV_NEWLINE, UTF8_BOM, rowToCsv } from '@/lib/csv/csv-escape'
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
  revalidateTag('admin-clients', {})
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

  // PA-2: cada celda pasa por csvEscape (anti-fórmula + RFC 4180); BOM para
  // que Excel abra tildes/ñ; CRLF como separador.
  const csv =
    UTF8_BOM +
    [
      rowToCsv(['Cliente', 'Nombre', 'Email', 'Telefono', 'Status', 'Intent', 'Fecha']),
      ...leads.map((lead) =>
        rowToCsv([
          lead.botConfig.organization.companyName,
          lead.name ?? '',
          lead.email ?? '',
          lead.phone ?? '',
          lead.status,
          lead.intent ?? '',
          lead.capturedAt.toISOString(),
        ]),
      ),
    ].join(CSV_NEWLINE)

  return { ok: true, csv, count: leads.length }
}
