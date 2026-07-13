'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logAdminAction, logAdminActionsBatch } from '@/lib/audit-log'
import { CSV_NEWLINE, UTF8_BOM, rowToCsv } from '@/lib/csv/csv-escape'
import { invalidateBotCache } from '@/modules/chatbot/server/conversation'

interface BulkResult {
  success: number
  failed: number
  failures: Array<{ botId: string; error: string }>
}

const BulkBotIdsSchema = z.array(z.string().min(1)).min(1, 'Sin bots seleccionados.')

// PA-3: causa clara en vez de failures:[] cuando el rechazo es previo al loop
// (permiso/sesión) — la UI ya distingue vacío vs. poblado, esto solo mejora
// el mensaje sin tocar announceBulk.
function permissionDeniedResult(botIds: string[]): BulkResult {
  return {
    success: 0,
    failed: botIds.length,
    failures: botIds.map((botId) => ({ botId, error: 'Sin permisos o sesión expirada' })),
  }
}

// PA-4: pause/activate pasan de N updates+logs seriales a 1 updateMany + 1
// createMany de logs. El where del batch replica EXACTAMENTE el scope serial
// anterior ({id} puro, sin organizationId) — no se amplía el alcance.
async function bulkSetActiveAction(
  botIds: string[],
  isActive: boolean,
  actionType: 'BOT_DEACTIVATED' | 'BOT_ACTIVATED',
  actionVerb: string,
): Promise<BulkResult> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return permissionDeniedResult(botIds)
  }
  const userId = session.user.id
  if (!userId) return permissionDeniedResult(botIds)

  const validBots = await prisma.botConfig.findMany({
    where: { id: { in: botIds } },
    select: { id: true, slug: true },
  })
  const validIds = new Set(validBots.map((bot) => bot.id))
  const failures: Array<{ botId: string; error: string }> = botIds
    .filter((botId) => !validIds.has(botId))
    .map((botId) => ({ botId, error: 'El bot no existe' }))

  if (validBots.length > 0) {
    await prisma.botConfig.updateMany({
      where: { id: { in: [...validIds] } },
      data: { isActive },
    })

    for (const bot of validBots) {
      invalidateBotCache(bot.slug)
    }

    await logAdminActionsBatch(
      validBots.map((bot) => ({
        userId,
        userEmail: session.user.email,
        userName: session.user.name,
        actionType,
        action: `${actionVerb} bot ${bot.id} (acción bulk)`,
        targetType: 'BotConfig',
        targetId: bot.id,
        metadata: { bulk: true },
      })),
    )
  }

  revalidatePath('/admin/chatbots')
  return { success: validBots.length, failed: failures.length, failures }
}

export async function bulkPauseBotsAction(botIds: string[]): Promise<BulkResult> {
  return bulkSetActiveAction(botIds, false, 'BOT_DEACTIVATED', 'Pausó')
}

export async function bulkActivateBotsAction(botIds: string[]): Promise<BulkResult> {
  return bulkSetActiveAction(botIds, true, 'BOT_ACTIVATED', 'Activó')
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
    lead.intent ?? '',
    lead.status,
    lead.capturedAt.toISOString(),
  ])

  // PA-2: cada celda pasa por csvEscape (anti-fórmula + RFC 4180); BOM para
  // que Excel abra tildes/ñ; CRLF como separador.
  const csv =
    UTF8_BOM + [rowToCsv(headers), ...rows.map((r) => rowToCsv(r))].join(CSV_NEWLINE)

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
    return permissionDeniedResult(botIds)
  }
  const userId = session.user.id
  if (!userId) return permissionDeniedResult(botIds)

  const parsed = BulkBotIdsSchema.safeParse(botIds)
  if (!parsed.success) {
    return {
      success: 0,
      failed: botIds.length,
      failures: botIds.map((botId) => ({ botId, error: 'Datos inválidos' })),
    }
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
        actionType: 'BOT_DELETED',
        action: `Eliminó el bot ${bot.botName} (${bot.slug}) y todos sus datos (acción bulk)`,
        targetType: 'BotConfig',
        targetId: botId,
        metadata: {
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
