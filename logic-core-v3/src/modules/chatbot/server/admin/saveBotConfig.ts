'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { chatbotLog } from '../logging'
import { requireSuperAdmin } from './requireSuperAdmin'

const quickReplySchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(40),
  prompt: z.string().min(1).max(200),
})

const botConfigInputSchema = z.object({
  botConfigId: z.string().min(1),
  // Identity
  botName: z.string().min(1).max(50),
  isActive: z.boolean(),
  welcomeMessage: z.string().max(500),
  // Visual
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  avatarStyle: z.enum(['neuro', 'legacy_neuro', 'simple', 'image', 'emoji']),
  avatarImageUrl: z.string().url().nullable(),
  avatarEmoji: z.string().max(8).nullable(),
  borderRadius: z.enum(['small', 'medium', 'large']),
  surfaceStyle: z.string().max(50),
  position: z.enum(['bottom_right', 'bottom_left']),
  bubbleStyle: z.enum(['sharp', 'rounded', 'pill']),
  intensityLevel: z.enum(['low', 'medium', 'high']),
  // Behavior
  tone: z.string().min(1).max(50),
  // Handoff
  whatsappNumber: z.string().max(30).nullable(),
  // Quick replies (JSON column)
  quickReplies: z.array(quickReplySchema).max(8),
  // Lead notifications
  leadNotificationEmail: z.string().email().nullable(),
  leadNotificationMode: z.enum(['IMMEDIATE', 'DAILY_DIGEST', 'DISABLED']),
})

export type BotConfigInput = z.infer<typeof botConfigInputSchema>

export async function saveBotConfig(input: BotConfigInput): Promise<{ success: boolean; error?: string }> {
  await requireSuperAdmin()
  const parsed = botConfigInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.message }
  }
  try {
    const { botConfigId, leadNotificationEmail, leadNotificationMode, ...data } = parsed.data
    await prisma.$transaction(async (tx) => {
      const bot = await tx.botConfig.update({
        where: { id: botConfigId },
        data: {
          ...data,
          quickReplies: data.quickReplies as unknown as object,
        },
        select: { organizationId: true },
      })

      await tx.organization.update({
        where: { id: bot.organizationId },
        data: {
          leadNotificationEmail,
          leadNotificationMode,
        },
      })
    })
    chatbotLog('admin.bot_config_updated', { botConfigId })
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown error'
    chatbotLog('admin.bot_config_update_error', { error: msg }, 'error')
    return { success: false, error: msg }
  }
}
