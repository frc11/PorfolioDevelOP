'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { computeDiff, logAdminAction, omitAuditNoise } from '@/lib/audit-log'
import { AVATAR_STYLE_SCHEMA } from '@/modules/chatbot/components/avatar'
import { chatbotLog } from '../logging'
import { invalidateBotCache } from '../conversation'
import { requireSuperAdmin } from './requireSuperAdmin'
import { avatarImageUrlSchema } from './avatarImageUrlSchema'

const quickReplySchema = z.object({
  id: z.string().optional(),
  emoji: z.string().max(8).optional(),
  label: z.string().min(1).max(40),
  promptToSend: z.string().min(1).max(200),
})

const botConfigInputSchema = z.object({
  botConfigId: z.string().min(1),
  // Identity
  botName: z.string().min(1).max(50),
  industry: z.string().min(1).max(50),
  tone: z.string().min(1).max(50),
  welcomeMessage: z.string().max(500),
  // Visual
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  chatSurfaceTint: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  avatarStyle: AVATAR_STYLE_SCHEMA,
  avatarImageUrl: avatarImageUrlSchema,
  avatarEmoji: z.string().max(8).nullable(),
  borderRadius: z.enum(['small', 'medium', 'large']),
  surfaceStyle: z.enum(['glass', 'solid', 'minimal']),
  position: z.enum(['bottom_right', 'bottom_left']),
  fontStyle: z.enum(['sans', 'serif', 'mono']),
  bubbleStyle: z.enum(['sharp', 'rounded', 'pill']),
  // B11.4 — UI envía lowercase, DB es enum UPPER. Zod transforma en el parse.
  intensityLevel: z.enum(['low', 'medium', 'high']).transform((v) => v.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH'),
  // Handoff
  whatsappNumber: z.string().max(30).nullable(),
  whatsappMessage: z.string().max(500).nullable(),
  // LLM
  llmProvider: z.enum(['google', 'anthropic', 'openai']).transform((v) => v.toUpperCase() as 'GOOGLE' | 'ANTHROPIC' | 'OPENAI'),
  llmModel: z.string().min(1).max(80),
  temperature: z.number().min(0).max(2),
  maxOutputTokens: z.number().int().min(100).max(8192),
  monthlyQuota: z.number().int().min(0).max(1_000_000),
  // Quick replies (JSON column)
  quickReplies: z.array(quickReplySchema).max(8),
  proactivePrompts: z.record(z.array(z.string().min(1).max(240)).max(8)).refine(
    (value) => Object.keys(value).length <= 30,
    'Too many proactive prompt routes'
  ),
  routeColorMap: z.record(z.string().regex(/^#[0-9a-fA-F]{6}$/)).refine(
    (value) => Object.keys(value).length <= 30,
    'Too many route colors'
  ),
  // Lead notifications
  leadNotificationEmail: z.string().email().nullable(),
  leadNotificationMode: z.enum(['IMMEDIATE', 'DAILY_DIGEST', 'DISABLED']),
  // Dominios autorizados a embeber el widget
  allowedDomains: z.array(z.string().max(253)).max(50),
})

// z.infer da el tipo OUTPUT (post-.transform → UPPERCASE). Sobreescribimos a INPUT lowercase
// para que el estado del form, el parámetro del action y el call site sean consistentes.
// El .transform() sigue siendo el único lugar que convierte a UPPERCASE antes de Prisma.
export type BotConfigInput = Omit<
  z.infer<typeof botConfigInputSchema>,
  'intensityLevel' | 'llmProvider'
> & {
  intensityLevel: 'low' | 'medium' | 'high'
  llmProvider: 'google' | 'anthropic' | 'openai'
}

export async function saveBotConfig(input: BotConfigInput): Promise<{ success: boolean; error?: string }> {
  const user = await requireSuperAdmin()
  const parsed = botConfigInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.message }
  }
  try {
    const { botConfigId, leadNotificationEmail, leadNotificationMode, allowedDomains, ...data } = parsed.data
    const before = await prisma.botConfig.findUnique({
      where: { id: botConfigId },
      include: {
        organization: {
          select: { leadNotificationEmail: true, leadNotificationMode: true },
        },
      },
    })

    if (!before) {
      return { success: false, error: 'Bot not found' }
    }

    const after = await prisma.$transaction(async (tx) => {
      const bot = await tx.botConfig.update({
        where: { id: botConfigId },
        data: {
          ...data,
          allowedDomains,
          quickReplies: data.quickReplies as unknown as object,
          proactivePrompts: data.proactivePrompts as unknown as object,
          routeColorMap: data.routeColorMap as unknown as object,
        },
      })

      const organization = await tx.organization.update({
        where: { id: bot.organizationId },
        data: {
          leadNotificationEmail,
          leadNotificationMode,
        },
        select: { leadNotificationEmail: true, leadNotificationMode: true },
      })

      return { ...bot, organization }
    })

    invalidateBotCache(after.slug)

    await logAdminAction({
      userId: user.id ?? 'unknown',
      userEmail: user.email,
      userName: user.name,
      actionType: 'BOT_CONFIG_UPDATED',
      action: `Actualizo config del bot "${after.botName}"`,
      targetType: 'BotConfig',
      targetId: after.id,
      diff: computeDiff(
        omitAuditNoise(before as unknown as Record<string, unknown>),
        omitAuditNoise(after as unknown as Record<string, unknown>),
      ),
      metadata: { organizationId: after.organizationId },
    })
    chatbotLog('admin.bot_config_updated', { botConfigId })
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown error'
    chatbotLog('admin.bot_config_update_error', { error: msg }, 'error')
    return { success: false, error: msg }
  }
}
