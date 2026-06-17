'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logAdminAction } from '@/lib/audit-log'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { botActivatedEmail } from '@/lib/email/templates/bot-activated'
import { invalidateBotCache } from '@/modules/chatbot/server/conversation'
import { z } from 'zod'

// P1-12: validación server-side de los args (un POST crafteado podría mandar
// un botId vacío o un newActive no-booleano — los args de una server action
// se deserializan sin garantías de tipo en runtime).
const ToggleBotActiveSchema = z.object({
  botId: z.string().min(1, 'Bot inválido.'),
  newActive: z.boolean(),
})

const DeleteBotSchema = z.object({
  botId: z.string().min(1, 'Bot inválido.'),
})

export async function toggleBotActiveAction(
  botId: string,
  newActive: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { ok: false, error: 'Forbidden' }
  }
  const userId = session.user.id
  if (!userId) return { ok: false, error: 'Forbidden' }

  const parsed = ToggleBotActiveSchema.safeParse({ botId, newActive })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }

  try {
    const bot = await prisma.botConfig.update({
      where: { id: botId },
      data: { isActive: newActive },
      include: {
        organization: {
          include: {
            members: {
              take: 1,
              orderBy: { joinedAt: 'asc' },
              include: { user: { select: { email: true, name: true } } },
            },
          },
        },
      },
    })

    await logAdminAction({
      userId,
      userEmail: session.user.email,
      userName: session.user.name,
      actionType: newActive ? 'BOT_ACTIVATED' : 'BOT_DEACTIVATED',
      action: `${newActive ? 'Activó' : 'Pausó'} bot ${botId} desde la página de detalle`,
      targetType: 'BotConfig',
      targetId: botId,
      metadata: { source: 'detail_page' },
    })

    invalidateBotCache(bot.slug)

    if (newActive) {
      const primaryMember = bot.organization.members[0]?.user
      if (primaryMember?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://develop.com.ar'
        sendTransactionalEmail({
          to: { email: primaryMember.email, name: primaryMember.name ?? undefined },
          ...botActivatedEmail({
            clientName: primaryMember.name ?? primaryMember.email,
            botName: bot.botName,
            botSlug: bot.slug,
            appUrl,
          }),
        }).catch((err: unknown) => {
          console.error('[toggleBotActive] Email send failed:', err)
        })
      }
    }

    revalidatePath(`/admin/chatbots/${botId}`)
    revalidatePath('/admin/chatbots')

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'unknown',
    }
  }
}

// Borra un bot y TODO su subárbol de datos. Todas las relaciones hijas de
// BotConfig son onDelete: Cascade (KnowledgeBase, Conversation→ChatMessage,
// ChatbotLead→CrmSyncAttempt, QuotaUsage, ChatbotEvent, ChatbotInsight,
// BotAlert), así que un único delete arrastra todo el subárbol del bot —
// scopeado a este bot, sin tocar otras orgs ni la CrmIntegration (que cuelga
// de Organization, no de BotConfig).
//
// Devuelve { ok: false } solo en error/forbidden; en éxito hace redirect
// server-side a la lista (la ruta /admin/chatbots/[botId] deja de existir).
export async function deleteBotAction(
  botId: string,
): Promise<{ ok: false; error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { ok: false, error: 'Forbidden' }
  }
  const userId = session.user.id
  if (!userId) return { ok: false, error: 'Forbidden' }

  const parsed = DeleteBotSchema.safeParse({ botId })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }

  try {
    // Identidad + conteos ANTES del cascade (para dejarlos en el audit trail).
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
      return { ok: false, error: 'El bot no existe o ya fue eliminado.' }
    }

    await prisma.botConfig.delete({ where: { id: botId } })

    await logAdminAction({
      userId,
      userEmail: session.user.email,
      userName: session.user.name,
      // No existe un valor BOT_DELETED en el enum AuditActionType y el schema
      // está FROZEN → se audita con OTHER + metadata.subAction (ver lane-LOG.md,
      // PENDIENTE DE COORDINACIÓN para sumar el valor de enum dedicado).
      actionType: 'OTHER',
      action: `Eliminó el bot ${bot.botName} (${bot.slug}) y todos sus datos`,
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
        source: 'detail_page',
      },
    })

    invalidateBotCache(bot.slug)
    revalidatePath('/admin/chatbots')
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo eliminar el bot.',
    }
  }

  // Éxito: fuera del try para que el throw interno de redirect() no sea
  // capturado por el catch.
  redirect('/admin/chatbots')
}
