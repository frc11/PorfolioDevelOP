'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
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
