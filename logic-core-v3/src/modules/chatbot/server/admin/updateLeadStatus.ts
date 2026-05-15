'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logChatbotEvent } from '../logging'
import { getClientChatbotSession } from './getClientSession'

const UpdateLeadStatusSchema = z.object({
  leadId: z.string(),
  status: z.enum(['NEW', 'CONTACTED', 'IN_NEGOTIATION', 'WON', 'LOST']),
  notes: z.string().max(2000).optional(),
})

export async function updateLeadStatus(input: z.infer<typeof UpdateLeadStatusSchema>) {
  const session = await getClientChatbotSession()
  if (!session) return { ok: false, error: 'No session' }

  const parsed = UpdateLeadStatusSchema.parse(input)

  // Confirmar que el lead pertenece a la org del usuario
  const lead = await prisma.chatbotLead.findUnique({
    where: { id: parsed.leadId },
    include: { botConfig: true },
  })

  if (!lead || lead.botConfig.organizationId !== session.organization.id) {
    return { ok: false, error: 'Lead not found or unauthorized' }
  }

  await prisma.chatbotLead.update({
    where: { id: parsed.leadId },
    data: {
      status: parsed.status,
      internalNotes: parsed.notes ?? lead.internalNotes,
      lastStatusChangeAt: new Date(),
    },
  })

  await logChatbotEvent({
    botConfigId: lead.botConfigId,
    type: 'lead.status_changed',
    level: 'info',
    message: `Lead ${parsed.leadId} status changed to ${parsed.status}`,
    metadata: { leadId: parsed.leadId, newStatus: parsed.status, userId: session.user.id },
  })

  revalidatePath('/dashboard/chatbot/leads')
  return { ok: true }
}
