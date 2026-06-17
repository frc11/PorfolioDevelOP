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
// Idempotencia: el vínculo persistente vive en ChatbotLead.convertedToOsLeadId
// (id del OsLead). Es fiable por ID — sobrevive recargas/cierre de sesión y aplica
// también a leads sin email. Al crear, además se deduplica por email
// (source='Chatbot') para no generar OsLeads duplicados del mismo contacto.
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

      // Idempotencia por ID: si este lead ya quedó vinculado a un OsLead, lo
      // devolvemos sin recrear (funciona también para leads sin email).
      if (lead.convertedToOsLeadId) {
        return { id: lead.convertedToOsLeadId }
      }

      const email = lead.email?.trim() || null

      let osLead: { id: string } | null = null
      if (email) {
        osLead = await tx.osLead.findFirst({
          where: { source: 'Chatbot', email: { equals: email, mode: 'insensitive' } },
          select: { id: true },
        })
      }

      if (!osLead) {
        osLead = await tx.osLead.create({
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
      }

      // Vínculo persistente por ID → el badge "Ya convertido" sobrevive recargas
      // y cierre de sesión, y aplica también a leads sin email.
      await tx.chatbotLead.update({
        where: { id },
        data: { convertedToOsLeadId: osLead.id },
      })

      return { id: osLead.id }
    })

    revalidatePath('/admin/chatbots')
    return ok({ id: result.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'No se pudo convertir el lead.')
  }
}
