'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/auth'
import { logAdminAction } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { invalidateBotCache } from '@/modules/chatbot/server/conversation'
import { CLIENT_AVATAR_STYLE_SCHEMA } from '@/modules/chatbot/components/avatar'
import {
  BOT_POSITIONS,
  CURATED_COLORS,
} from '@/modules/chatbot/shared/appearance'

const quickReplyTextSchema = z.string().trim().min(1).max(40)

const UpdateBotAppearanceSchema = z
  .object({
    accentColor: z.enum(CURATED_COLORS).optional(),
    // accentSecondary + chatSurfaceTint: hex libre nullable (espeja saveBotConfig
    // del admin). El "Limpiar" del ColorPicker manda '' y el cliente lo pasa a null.
    accentSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
    chatSurfaceTint: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
    position: z.enum(BOT_POSITIONS).optional(),
    avatarStyle: CLIENT_AVATAR_STYLE_SCHEMA.optional(),
    // max(8) UTF-16 units: paridad con el cap del EmojiPickerField y con las
    // server actions del admin (saveBotConfig). nullable: el "Quitar" del
    // picker envía null para limpiar el emoji.
    avatarEmoji: z.string().trim().max(8).nullable().optional(),
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
    accentSecondary: bot.accentSecondary,
    chatSurfaceTint: bot.chatSurfaceTint,
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
      ...(data.accentSecondary !== undefined ? { accentSecondary: data.accentSecondary } : {}),
      ...(data.chatSurfaceTint !== undefined ? { chatSurfaceTint: data.chatSurfaceTint } : {}),
      ...(data.position !== undefined ? { position: data.position } : {}),
      ...(data.avatarStyle !== undefined ? { avatarStyle: data.avatarStyle } : {}),
      ...(data.avatarEmoji !== undefined ? { avatarEmoji: data.avatarEmoji || null } : {}),
      ...(data.welcomeMessage !== undefined ? { welcomeMessage: data.welcomeMessage } : {}),
      ...(data.quickReplies !== undefined
        ? { quickReplies: toPublicQuickReplies(data.quickReplies) as object }
        : {}),
    },
  })

  invalidateBotCache(updated.slug)

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
        accentSecondary: updated.accentSecondary,
        chatSurfaceTint: updated.chatSurfaceTint,
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
