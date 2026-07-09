'use server'

import { z } from 'zod'
import { forOrg } from '@/lib/isolation'
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

  const scope = forOrg(session.organization.id)

  // Scoped por org: un insight de otra org devuelve null (el chequeo de
  // pertenencia queda enforced por el helper, no por código de aplicación).
  const insight = await scope.chatbotInsight.findFirst({
    where: { id: parsed.insightId },
    include: { botConfig: true },
  })

  if (!insight || insight.botConfig.organizationId !== session.organization.id) {
    return { ok: false, error: 'Insight not found or unauthorized' }
  }

  const newStatus = parsed.action === 'APPLY' ? 'APPLIED' : 'DISMISSED'
  const timestamp = new Date()

  await scope.chatbotInsight.update(parsed.insightId, {
    status: newStatus,
    appliedAt: newStatus === 'APPLIED' ? timestamp : null,
    dismissedAt: newStatus === 'DISMISSED' ? timestamp : null,
  })

  await logChatbotEvent({
    organizationId: session.organization.id,
    botConfigId: insight.botConfigId,
    type: `insight.${parsed.action.toLowerCase()}d`,
    level: 'info',
    message: `Client ${parsed.action.toLowerCase()}d insight: ${insight.title}`,
    metadata: { insightId: insight.id, userId: session.user.id },
  })

  revalidatePath('/dashboard/chatbot')
  return { ok: true }
}
