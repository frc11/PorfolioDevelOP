'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getClientChatbotSession } from '../admin/getClientSession'
import { logChatbotEvent } from '../logging'

const InsightActionSchema = z.object({
  insightId: z.string(),
  action: z.enum(['APPLY', 'DISMISS']),
  applicationNote: z.string().max(500).optional(),
})

export async function actOnInsight(input: z.infer<typeof InsightActionSchema>) {
  const session = await getClientChatbotSession()
  if (!session) return { ok: false, error: 'No session' }

  const parsed = InsightActionSchema.parse(input)

  const insight = await prisma.chatbotInsight.findUnique({
    where: { id: parsed.insightId },
    include: { botConfig: true },
  })

  if (!insight || insight.botConfig.organizationId !== session.organization.id) {
    return { ok: false, error: 'Insight not found or unauthorized' }
  }

  const newStatus = parsed.action === 'APPLY' ? 'APPLIED' : 'DISMISSED'
  const timestamp = new Date()

  await prisma.chatbotInsight.update({
    where: { id: parsed.insightId },
    data: {
      status: newStatus,
      appliedAt: newStatus === 'APPLIED' ? timestamp : null,
      dismissedAt: newStatus === 'DISMISSED' ? timestamp : null,
    },
  })

  await logChatbotEvent({
    botConfigId: insight.botConfigId,
    type: `insight.${parsed.action.toLowerCase()}d`,
    level: 'info',
    message: `Client ${parsed.action.toLowerCase()}d insight: ${insight.title}`,
    metadata: { insightId: insight.id, userId: session.user.id },
  })

  revalidatePath('/dashboard/chatbot')
  return { ok: true }
}
