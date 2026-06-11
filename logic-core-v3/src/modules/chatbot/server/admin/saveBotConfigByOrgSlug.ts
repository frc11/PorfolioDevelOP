'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { computeDiff, logAdminAction, omitAuditNoise } from '@/lib/audit-log'
import { AVATAR_STYLE_SCHEMA } from '@/modules/chatbot/components/avatar'
import { invalidateBotCache } from '../conversation'
import { requireSuperAdmin } from './requireSuperAdmin'

const quickReplySchema = z.object({
  id: z.string().optional(),
  emoji: z.string().max(8).optional(),
  label: z.string().min(1).max(40),
  promptToSend: z.string().min(1).max(200),
})

const SaveBotConfigInputSchema = z.object({
  orgSlug: z.string().min(1),
  botName: z.string().min(1).max(50),
  industry: z.string().min(1).max(50),
  tone: z.string().min(1).max(50),
  welcomeMessage: z.string().max(500),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  chatSurfaceTint: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  avatarStyle: AVATAR_STYLE_SCHEMA,
  avatarImageUrl: z.string().url().nullable(),
  avatarEmoji: z.string().max(8).nullable(),
  borderRadius: z.enum(['small', 'medium', 'large']),
  surfaceStyle: z.enum(['glass', 'solid', 'minimal']),
  position: z.enum(['bottom_right', 'bottom_left']),
  fontStyle: z.enum(['sans', 'serif', 'mono']),
  bubbleStyle: z.enum(['sharp', 'rounded', 'pill']),
  // B11.4 — UI envía lowercase, DB es enum UPPER. Zod transforma en el parse.
  intensityLevel: z.enum(['low', 'medium', 'high']).transform((v) => v.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH'),
  whatsappNumber: z.string().max(30).nullable(),
  whatsappMessage: z.string().max(500).nullable(),
  llmProvider: z.enum(['google', 'anthropic', 'openai']).transform((v) => v.toUpperCase() as 'GOOGLE' | 'ANTHROPIC' | 'OPENAI'),
  llmModel: z.string().min(1).max(80),
  temperature: z.number().min(0).max(2),
  maxOutputTokens: z.number().int().min(100).max(8192),
  monthlyQuota: z.number().int().min(0).max(1_000_000),
  quickReplies: z.array(quickReplySchema).max(8),
  proactivePrompts: z.record(z.array(z.string().min(1).max(240)).max(8)).refine(
    (value) => Object.keys(value).length <= 30,
    'Too many proactive prompt routes'
  ),
  routeColorMap: z.record(z.string().regex(/^#[0-9a-fA-F]{6}$/)).refine(
    (value) => Object.keys(value).length <= 30,
    'Too many route colors'
  ),
  leadNotificationEmail: z.string().email().nullable(),
  leadNotificationMode: z.enum(['IMMEDIATE', 'DAILY_DIGEST', 'DISABLED']),
  allowedDomains: z.array(z.string().max(253)).max(50),
})

// Mismo override que BotConfigInput: INPUT lowercase para la UI; .transform() convierte a UPPER antes de Prisma.
type SaveBotConfigByOrgSlugInput = Omit<
  z.infer<typeof SaveBotConfigInputSchema>,
  'intensityLevel' | 'llmProvider'
> & {
  intensityLevel: 'low' | 'medium' | 'high'
  llmProvider: 'google' | 'anthropic' | 'openai'
}

export async function saveBotConfigByOrgSlug(
  input: SaveBotConfigByOrgSlugInput
): Promise<{ success: boolean; error?: string }> {
  const user = await requireSuperAdmin()
  const parsed = SaveBotConfigInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.message }
  }

  const { orgSlug, allowedDomains, ...data } = parsed.data

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { botConfig: true },
  })

  if (!org?.botConfig) {
    return { success: false, error: 'Bot not found for this org' }
  }

  try {
    const { leadNotificationEmail, leadNotificationMode, ...botData } = data
    const before = org.botConfig
    const [after] = await prisma.$transaction([
      prisma.botConfig.update({
        where: { id: org.botConfig.id },
        data: {
          ...botData,
          allowedDomains,
          quickReplies: botData.quickReplies as unknown as object,
          proactivePrompts: botData.proactivePrompts as unknown as object,
          routeColorMap: botData.routeColorMap as unknown as object,
        },
      }),
      prisma.organization.update({
        where: { id: org.id },
        data: {
          leadNotificationEmail,
          leadNotificationMode,
        },
      }),
    ])

    invalidateBotCache(org.botConfig.slug)

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
      metadata: { organizationId: org.id, orgSlug },
    })

    revalidatePath(`/admin/chatbots/${after.id}`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: msg }
  }
}
