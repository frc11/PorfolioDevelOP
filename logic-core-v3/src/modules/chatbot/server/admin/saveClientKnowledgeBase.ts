'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getClientChatbotSession } from './getClientSession'
import { logChatbotEvent } from '../logging'

// SOLO 5 de los 7 campos son editables. toneExamples y forbiddenStatements son read-only
// para el cliente (los maneja develOP)
const ClientKBSchema = z.object({
  businessInfo: z.string().min(20).max(20000),
  servicesOrProducts: z.string().min(20).max(20000),
  faq: z.string().min(10).max(20000),
  policies: z.string().min(10).max(10000),
  salesGuidance: z.string().min(10).max(10000),
})

export async function saveClientKnowledgeBase(input: z.infer<typeof ClientKBSchema>) {
  const session = await getClientChatbotSession()
  if (!session) return { ok: false, error: 'No session' }

  const parsed = ClientKBSchema.parse(input)

  const kb = await prisma.knowledgeBase.findUnique({
    where: { botConfigId: session.bot.id },
  })

  if (!kb) return { ok: false, error: 'KB not found' }

  await prisma.knowledgeBase.update({
    where: { id: kb.id },
    data: parsed,
  })

  await logChatbotEvent({
    botConfigId: session.bot.id,
    type: 'kb.client_updated',
    level: 'info',
    message: 'Client updated KB',
    metadata: { userId: session.user.id },
  })

  revalidatePath('/dashboard/chatbot/knowledge')
  return { ok: true }
}
