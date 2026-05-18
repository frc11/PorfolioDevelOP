'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/auth'
import { logAdminAction } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import {
  BOT_POSITIONS,
  CLIENT_AVATAR_STYLES,
  CURATED_COLORS,
} from '@/modules/chatbot/shared/appearance'

const quickReplyTextSchema = z.string().trim().min(1).max(40)

const UpdateBotAppearanceSchema = z
  .object({
    accentColor: z.enum(CURATED_COLORS).optional(),
    position: z.enum(BOT_POSITIONS).optional(),
    avatarStyle: z.enum(CLIENT_AVATAR_STYLES).optional(),
    avatarEmoji: z.string().trim().max(2).optional(),
    welcomeMessage: z.string().trim().min(10).max(200).optional(),
    quickReplies: z.array(quickReplyTextSchema).max(4).optional(),
  })
  .strict()

type UpdateBotAppearanceInput = z.infer<typeof UpdateBotAppearanceSchema>

function toPublicQuickReplies(replies: string[]) {
  return replies.map((reply) => ({
    label: reply,
    promptToSend: reply,
  }))
}

export async function updateBotAppearance(input: UpdateBotAppearanceInput) {
  const session = await auth()
  if (!session?.user) {
    return { ok: false as const, error: 'No autenticado' }
  }

  const orgId = await resolveOrgId()
  if (!orgId) {
    return { ok: false as const, error: 'Sin organizacion' }
  }

  const parsed = UpdateBotAppearanceSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'Datos invalidos',
      details: parsed.error.format(),
    }
  }

  const bot = await prisma.botConfig.findUnique({
    where: { organizationId: orgId },
  })

  if (!bot) {
    return { ok: false as const, error: 'No tenes bot configurado' }
  }

  const before = {
    accentColor: bot.accentColor,
    position: bot.position,
    avatarStyle: bot.avatarStyle,
    avatarEmoji: bot.avatarEmoji,
    welcomeMessage: bot.welcomeMessage,
    quickReplies: bot.quickReplies,
  }

  const data = parsed.data
  const updated = await prisma.botConfig.update({
    where: { id: bot.id },
    data: {
      ...(data.accentColor !== undefined ? { accentColor: data.accentColor } : {}),
      ...(data.position !== undefined ? { position: data.position } : {}),
      ...(data.avatarStyle !== undefined ? { avatarStyle: data.avatarStyle } : {}),
      ...(data.avatarEmoji !== undefined ? { avatarEmoji: data.avatarEmoji || null } : {}),
      ...(data.welcomeMessage !== undefined ? { welcomeMessage: data.welcomeMessage } : {}),
      ...(data.quickReplies !== undefined
        ? { quickReplies: toPublicQuickReplies(data.quickReplies) as object }
        : {}),
    },
  })

  await logAdminAction({
    userId: session.user.id ?? 'unknown',
    userEmail: session.user.email ?? undefined,
    userName: session.user.name ?? undefined,
    actionType: 'BOT_CONFIG_UPDATED',
    action: 'Cliente actualizo apariencia del bot',
    targetType: 'BotConfig',
    targetId: bot.id,
    diff: {
      before,
      after: {
        accentColor: updated.accentColor,
        position: updated.position,
        avatarStyle: updated.avatarStyle,
        avatarEmoji: updated.avatarEmoji,
        welcomeMessage: updated.welcomeMessage,
        quickReplies: updated.quickReplies,
      },
    },
    metadata: { source: 'dashboard_cliente', organizationId: orgId },
  })

  revalidatePath('/dashboard/chatbot/settings')
  revalidatePath('/dashboard/chatbot')

  return { ok: true as const }
}
