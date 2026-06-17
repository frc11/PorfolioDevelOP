'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/audit-log'
import { invalidateBotCache } from '@/modules/chatbot/server/conversation'

interface BulkResult {
  success: number
  failed: number
  failures: Array<{ botId: string; error: string }>
}

const BulkBotIdsSchema = z.array(z.string().min(1)).min(1, 'Sin bots seleccionados.')

export async function bulkPauseBotsAction(botIds: string[]): Promise<BulkResult> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { success: 0, failed: botIds.length, failures: [] }
  }
  const userId = session.user.id
  if (!userId) return { success: 0, failed: botIds.length, failures: [] }

  let success = 0
  let failed = 0
  const failures: Array<{ botId: string; error: string }> = []

  for (const botId of botIds) {
    try {
      const bot = await prisma.botConfig.update({
        where: { id: botId },
        data: { isActive: false },
        select: { slug: true },
      })
      invalidateBotCache(bot.slug)

      await logAdminAction({
        userId,
        userEmail: session.user.email,
        userName: session.user.name,
        actionType: 'BOT_DEACTIVATED',
        action: `Pausó bot ${botId} (acción bulk)`,
        targetType: 'BotConfig',
        targetId: botId,
        metadata: { bulk: true },
      })

      success++
    } catch (error) {
      failed++
      failures.push({
        botId,
        error: error instanceof Error ? error.message : 'unknown',
      })
    }
  }

  revalidatePath('/admin/chatbots')
  return { success, failed, failures }
}

export async function bulkActivateBotsAction(botIds: string[]): Promise<BulkResult> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { success: 0, failed: botIds.length, failures: [] }
  }
  const userId = session.user.id
  if (!userId) return { success: 0, failed: botIds.length, failures: [] }

  let success = 0
  let failed = 0
  const failures: Array<{ botId: string; error: string }> = []

  for (const botId of botIds) {
    try {
      const bot = await prisma.botConfig.update({
        where: { id: botId },
        data: { isActive: true },
        select: { slug: true },
      })
      invalidateBotCache(bot.slug)

      await logAdminAction({
        userId,
        userEmail: session.user.email,
        userName: session.user.name,
        actionType: 'BOT_ACTIVATED',
        action: `Activó bot ${botId} (acción bulk)`,
        targetType: 'BotConfig',
        targetId: botId,
        metadata: { bulk: true },
      })

      success++
    } catch (error) {
      failed++
      failures.push({
        botId,
        error: error instanceof Error ? error.message : 'unknown',
      })
    }
  }

  revalidatePath('/admin/chatbots')
  return { success, failed, failures }
}

export async function exportLeadsBulkAction(botIds: string[]) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { ok: false as const, error: 'Forbidden' }
  }
  const userId = session.user.id
  if (!userId) return { ok: false as const, error: 'Forbidden' }

  const leads = await prisma.chatbotLead.findMany({
    where: { botConfigId: { in: botIds } },
    include: {
      botConfig: {
        select: {
          botName: true,
          organization: { select: { companyName: true } },
        },
      },
    },
    orderBy: { capturedAt: 'desc' },
  })

  const headers = ['Cliente', 'Bot', 'Nombre', 'Email', 'Teléfono', 'Intent', 'Status', 'Fecha']

  const rows = leads.map(lead => [
    lead.botConfig.organization.companyName,
    lead.botConfig.botName,
    lead.name ?? '',
    lead.email ?? '',
    lead.phone ?? '',
    (lead.intent ?? '').replace(/"/g, '""'),
    lead.status,
    lead.capturedAt.toISOString(),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')

  await logAdminAction({
    userId,
    userEmail: session.user.email,
    userName: session.user.name,
    actionType: 'LEADS_EXPORTED',
    action: `Exportó ${leads.length} leads de ${botIds.length} bot${botIds.length !== 1 ? 's' : ''}`,
    targetType: 'BotConfig',
    targetId: botIds[0] ?? 'bulk',
    metadata: { botIds, totalLeads: leads.length },
  })

  return { ok: true as const, csv, totalLeads: leads.length }
}

// Borrado bulk. Cada bot se elimina con un único delete que arrastra todo su
// subárbol vía onDelete: Cascade (mismas relaciones que deleteBotAction),
// scopeado por id; nunca toca otras orgs. Loop tolerante a fallos parciales.
export async function bulkDeleteBotsAction(botIds: string[]): Promise<BulkResult> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { success: 0, failed: botIds.length, failures: [] }
  }
  const userId = session.user.id
  if (!userId) return { success: 0, failed: botIds.length, failures: [] }

  const parsed = BulkBotIdsSchema.safeParse(botIds)
  if (!parsed.success) {
    return { success: 0, failed: botIds.length, failures: [] }
  }
  const ids = parsed.data

  let success = 0
  let failed = 0
  const failures: Array<{ botId: string; error: string }> = []

  for (const botId of ids) {
    try {
      const bot = await prisma.botConfig.findUnique({
        where: { id: botId },
        select: {
          slug: true,
          botName: true,
          organizationId: true,
          _count: { select: { conversations: true, leads: true, events: true } },
        },
      })
      if (!bot) {
        failed++
        failures.push({ botId, error: 'El bot no existe o ya fue eliminado.' })
        continue
      }

      await prisma.botConfig.delete({ where: { id: botId } })
      invalidateBotCache(bot.slug)

      await logAdminAction({
        userId,
        userEmail: session.user.email,
        userName: session.user.name,
        // Ver deleteBotAction: OTHER + metadata.subAction porque el enum
        // AuditActionType (schema FROZEN) no tiene BOT_DELETED.
        actionType: 'OTHER',
        action: `Eliminó el bot ${bot.botName} (${bot.slug}) y todos sus datos (acción bulk)`,
        targetType: 'BotConfig',
        targetId: botId,
        metadata: {
          subAction: 'BOT_DELETED',
          botSlug: bot.slug,
          organizationId: bot.organizationId,
          deletedCounts: {
            conversations: bot._count.conversations,
            leads: bot._count.leads,
            events: bot._count.events,
          },
          bulk: true,
        },
      })

      success++
    } catch (error) {
      failed++
      failures.push({
        botId,
        error: error instanceof Error ? error.message : 'unknown',
      })
    }
  }

  revalidatePath('/admin/chatbots')
  return { success, failed, failures }
}
