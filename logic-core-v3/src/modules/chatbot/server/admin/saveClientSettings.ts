'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getClientChatbotSession } from './getClientSession'
import { logChatbotEvent } from '../logging'

// SOLO estos campos son editables desde dashboard cliente
const ClientSettingsSchema = z.object({
  isActive: z.boolean(),
  welcomeMessage: z.string().min(10).max(500),
  accentColor: z.enum([
    '#06b6d4', // cyan
    '#8b5cf6', // violet
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
  ]),
  position: z.enum(['bottom_right', 'bottom_left']),
  quickReplies: z.array(z.object({
    id: z.string(),
    label: z.string().min(1).max(40),
    prompt: z.string().min(1).max(200),
  })).max(6),
})

export async function saveClientSettings(input: z.infer<typeof ClientSettingsSchema>) {
  const session = await getClientChatbotSession()
  if (!session) return { ok: false, error: 'No session' }

  const parsed = ClientSettingsSchema.parse(input)

  await prisma.botConfig.update({
    where: { id: session.bot.id },
    data: {
      isActive: parsed.isActive,
      welcomeMessage: parsed.welcomeMessage,
      accentColor: parsed.accentColor,
      position: parsed.position,
      quickReplies: parsed.quickReplies as unknown as object, // Prisma JSON handling
    },
  })

  await logChatbotEvent({
    botConfigId: session.bot.id,
    type: 'bot.settings_updated',
    level: 'info',
    message: 'Client updated bot settings',
    metadata: { userId: session.user.id, fields: Object.keys(parsed) },
  })

  revalidatePath('/dashboard/chatbot/settings')
  return { ok: true }
}
