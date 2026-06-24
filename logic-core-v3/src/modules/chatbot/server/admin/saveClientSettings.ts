'use server'

import { z } from 'zod'
import { updateBotAppearance } from '@/modules/chatbot/server/dashboard/updateBotAppearance'
import { CLIENT_AVATAR_STYLE_SCHEMA } from '@/modules/chatbot/components/avatar'
import {
  BOT_POSITIONS,
  CURATED_COLORS,
} from '@/modules/chatbot/shared/appearance'

const legacyQuickReplySchema = z.union([
  z.string().trim().min(1).max(40),
  z.object({
    label: z.string().trim().min(1).max(40),
    prompt: z.string().optional(),
    promptToSend: z.string().optional(),
  }),
])

const ClientSettingsSchema = z.object({
  isActive: z.boolean().optional(),
  welcomeMessage: z.string().trim().min(10).max(200),
  accentColor: z.enum(CURATED_COLORS),
  position: z.enum(BOT_POSITIONS),
  avatarStyle: CLIENT_AVATAR_STYLE_SCHEMA.optional(),
  avatarEmoji: z.string().trim().max(2).nullable().optional(),
  quickReplies: z.array(legacyQuickReplySchema).max(4),
})

function quickReplyToText(reply: z.infer<typeof legacyQuickReplySchema>) {
  return typeof reply === 'string' ? reply : reply.label
}

export async function saveClientSettings(input: z.infer<typeof ClientSettingsSchema>) {
  const parsed = ClientSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: 'Datos invalidos' }
  }

  return updateBotAppearance({
    accentColor: parsed.data.accentColor,
    position: parsed.data.position,
    avatarStyle: parsed.data.avatarStyle,
    avatarEmoji: parsed.data.avatarEmoji ?? undefined,
    welcomeMessage: parsed.data.welcomeMessage,
    quickReplies: parsed.data.quickReplies.map((reply) => ({ label: quickReplyToText(reply) })),
  })
}
