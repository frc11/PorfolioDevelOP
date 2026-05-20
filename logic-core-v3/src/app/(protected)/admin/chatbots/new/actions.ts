'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createBot } from '@/modules/chatbot/server/admin/createBot'
import { onboardClientCore } from '@/lib/onboarding/core'

const INDUSTRIES = [
  'legal', 'contable', 'medico_odontologico', 'gimnasio', 'restaurant',
  'inmobiliaria', 'concesionaria', 'distribuidora', 'constructora', 'generico',
] as const

const CreateBotForExistingOrgSchema = z.object({
  mode: z.literal('existing_org'),
  organizationId: z.string().min(1),
  botName: z.string().min(2).max(50),
  industry: z.enum(INDUSTRIES),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  whatsappNumber: z.string().optional(),
})

const CreateBotWithNewOrgSchema = z.object({
  mode: z.literal('new_org'),
  organizationName: z.string().min(2).max(100),
  userEmail: z.string().email(),
  userName: z.string().min(2).max(100),
  industry: z.enum(INDUSTRIES),
  city: z.string().optional(),
  whatsappNumber: z.string().optional(),
})

const CreateBotSchema = z.discriminatedUnion('mode', [
  CreateBotForExistingOrgSchema,
  CreateBotWithNewOrgSchema,
])

export async function createBotAction(
  input: unknown,
): Promise<{ ok: true; botId: string } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { ok: false, error: 'Forbidden' }
  }
  const userId = session.user.id
  if (!userId) return { ok: false, error: 'Forbidden' }

  const parsed = CreateBotSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Datos inválidos' }
  }

  try {
    if (parsed.data.mode === 'existing_org') {
      const bot = await createBot({
        organizationId: parsed.data.organizationId,
        botName: parsed.data.botName,
        industry: parsed.data.industry,
        accentColor: parsed.data.accentColor,
        whatsappNumber: parsed.data.whatsappNumber,
        createdByUserId: userId,
        createdByUserEmail: session.user.email,
        createdByUserName: session.user.name,
      })
      revalidatePath('/admin/chatbots')
      return { ok: true, botId: bot.id }
    } else {
      const result = await onboardClientCore({
        organizationName: parsed.data.organizationName,
        userEmail: parsed.data.userEmail,
        userName: parsed.data.userName,
        industry: parsed.data.industry,
        city: parsed.data.city ?? '',
        whatsappNumber: parsed.data.whatsappNumber,
        adminUserId: userId,
        adminUserEmail: session.user.email,
        adminUserName: session.user.name,
      })
      const bot = await prisma.botConfig.findUnique({
        where: { organizationId: result.organizationId },
        select: { id: true },
      })
      if (!bot) throw new Error('Bot no encontrado después del onboarding')
      revalidatePath('/admin/chatbots')
      return { ok: true, botId: bot.id }
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
