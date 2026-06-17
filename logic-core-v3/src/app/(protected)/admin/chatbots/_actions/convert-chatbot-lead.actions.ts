'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { ok, fail, type ActionResult } from '@/lib/action-utils'
import { ConvertChatbotLeadSchema } from './convert-chatbot-lead.schemas'

// Convierte un lead capturado por el bot (ChatbotLead) en un Lead del CRM interno
// (OsLead), espejando convertInboundToLead. Solo para el bot propio de develOP
// (slug='develop'), verificado server-side además del gate de UI.
//
// Idempotencia: ChatbotLead no tiene FK a OsLead y el schema está FROZEN, así que
// se deduplica por email (source='Chatbot'); si ya existe, se reusa ese OsLead.
// Leads sin email no se pueden deduplicar de forma persistente — ver lane-LOG.md.
export async function convertChatbotLeadToOsLead(
  chatbotLeadId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const { chatbotLeadId: id } = ConvertChatbotLeadSchema.parse({ chatbotLeadId })

    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.chatbotLead.findUnique({
        where: { id },
        include: { botConfig: { select: { slug: true } } },
      })

      if (!lead) {
        throw new Error('Lead del chatbot no encontrado.')
      }
      if (lead.botConfig.slug !== 'develop') {
        throw new Error('La conversión a Lead CRM solo está disponible para el bot de develOP.')
      }

      const email = lead.email?.trim() || null

      if (email) {
        const existing = await tx.osLead.findFirst({
          where: { source: 'Chatbot', email: { equals: email, mode: 'insensitive' } },
          select: { id: true },
        })
        if (existing) return existing
      }

      return tx.osLead.create({
        data: {
          businessName: lead.name?.trim() || email || 'Lead chatbot',
          contactName: lead.name?.trim() || null,
          email,
          phone: lead.phone?.trim() || null,
          source: 'Chatbot',
          notes: lead.message,
        },
        select: { id: true },
      })
    })

    revalidatePath('/admin/chatbots')
    return ok({ id: result.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'No se pudo convertir el lead.')
  }
}
