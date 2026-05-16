'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const quickReplySchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(40),
  prompt: z.string().min(1).max(200),
})

const SaveBotConfigInputSchema = z.object({
  orgSlug: z.string().min(1),
  botName: z.string().min(1).max(50),
  isActive: z.boolean(),
  welcomeMessage: z.string().max(500),
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
  tone: z.string().min(1).max(50),
  whatsappNumber: z.string().max(30).nullable(),
  quickReplies: z.array(quickReplySchema).max(8),
  leadNotificationEmail: z.string().email().nullable(),
  leadNotificationMode: z.enum(['IMMEDIATE', 'DAILY_DIGEST', 'DISABLED']),
})

export async function saveBotConfigByOrgSlug(
  input: z.infer<typeof SaveBotConfigInputSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = SaveBotConfigInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.message }
  }

  const { orgSlug, ...data } = parsed.data

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { botConfig: true },
  })

  if (!org?.botConfig) {
    return { success: false, error: 'Bot not found for this org' }
  }

  try {
    const { leadNotificationEmail, leadNotificationMode, ...botData } = data
    await prisma.$transaction([
      prisma.botConfig.update({
        where: { id: org.botConfig.id },
        data: {
          ...botData,
          quickReplies: botData.quickReplies as unknown as object,
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

    revalidatePath(`/admin/clients/${orgSlug}/chatbot/config`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: msg }
  }
}
