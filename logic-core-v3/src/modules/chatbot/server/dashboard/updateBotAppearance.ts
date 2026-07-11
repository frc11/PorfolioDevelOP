'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/auth'
import { logAdminAction } from '@/lib/audit-log'
import { forOrg } from '@/lib/isolation'
import { resolveOrgId } from '@/lib/preview'
import { invalidateBotCache } from '@/modules/chatbot/server/conversation'
import { CLIENT_AVATAR_STYLE_SCHEMA } from '@/modules/chatbot/components/avatar'
import { avatarImageUrlSchema } from '@/modules/chatbot/server/admin/avatarImageUrlSchema'
import {
  BOT_POSITIONS,
  CURATED_COLORS,
} from '@/modules/chatbot/shared/appearance'

// Cada quick reply lleva label + emoji opcional (espeja el shape del admin en
// saveBotConfig). El cliente no expone promptToSend: se sintetiza = label.
const quickReplySchema = z.object({
  label: z.string().trim().min(1).max(40),
  emoji: z.string().trim().max(8).optional(),
})

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
    // Foto custom del avatar: data URL base64 (o URL http(s)) ≤600KB. Reusa el
    // mismo schema que el admin (saveBotConfig); el uploader comprime a ≤200×200.
    avatarImageUrl: avatarImageUrlSchema.optional(),
    welcomeMessage: z.string().trim().min(10).max(200).optional(),
    quickReplies: z.array(quickReplySchema).max(4).optional(),
  })
  .strict()

type UpdateBotAppearanceInput = z.infer<typeof UpdateBotAppearanceSchema>

function toPublicQuickReplies(replies: { label: string; emoji?: string }[]) {
  return replies.map((reply) => ({
    label: reply.label,
    ...(reply.emoji ? { emoji: reply.emoji } : {}),
    promptToSend: reply.label,
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

  const scope = forOrg(orgId)
  // La org tiene un único bot (BotConfig.organizationId @unique): findFirst scoped.
  const bot = await scope.botConfig.findFirst()

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
  const updated = await scope.botConfig.update(bot.id, {
      ...(data.accentColor !== undefined ? { accentColor: data.accentColor } : {}),
      ...(data.accentSecondary !== undefined ? { accentSecondary: data.accentSecondary } : {}),
      ...(data.chatSurfaceTint !== undefined ? { chatSurfaceTint: data.chatSurfaceTint } : {}),
      ...(data.position !== undefined ? { position: data.position } : {}),
      ...(data.avatarStyle !== undefined ? { avatarStyle: data.avatarStyle } : {}),
      ...(data.avatarEmoji !== undefined ? { avatarEmoji: data.avatarEmoji || null } : {}),
      ...(data.avatarImageUrl !== undefined ? { avatarImageUrl: data.avatarImageUrl } : {}),
      ...(data.welcomeMessage !== undefined ? { welcomeMessage: data.welcomeMessage } : {}),
      ...(data.quickReplies !== undefined
        ? { quickReplies: toPublicQuickReplies(data.quickReplies) as object }
        : {}),
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
