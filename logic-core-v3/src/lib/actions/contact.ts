'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendLeadToN8n } from '@/lib/n8n'
import { sendAgencyAlert } from '@/lib/alerts'
import { ContactFormSchema, type ActionResult } from './schemas'

export type ContactFormState = ActionResult | null

export async function contactFormAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ActionResult> {
  const parsed = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    service: formData.get('service'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  const payload = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone?.trim() || null,
    company: parsed.data.company?.trim() || null,
    service: parsed.data.service?.trim() || null,
    message: parsed.data.message,
  }

  try {
    await prisma.contactSubmission.create({
      data: payload,
    })

    sendAgencyAlert({
      type: 'LEAD_EXTERNAL',
      clientName: payload.company || payload.name,
      detail: `Nuevo lead desde formulario. Contacto: ${payload.email}. Servicio: ${payload.service || 'General'}.`,
      link: '/admin/leads',
    }).catch(() => {})

    revalidatePath('/admin/leads')

    try {
      await sendLeadToN8n({
        ...payload,
        submittedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(
        '[N8N webhook] Error al enviar lead:',
        error instanceof Error ? error.message : error
      )
    }

    return { success: true }
  } catch (error) {
    console.error('contactFormAction error:', error)
    return { success: false, error: 'No se pudo enviar el formulario. Intentá de nuevo.' }
  }
}

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ActionResult> {
  return contactFormAction(prevState, formData)
}

export async function markLeadAsRead(id: string): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: 'Lead inválido.' }
  }

  try {
    await prisma.contactSubmission.update({
      where: { id },
      data: { read: true },
    })

    revalidatePath('/admin/leads')
    return { success: true }
  } catch (error) {
    console.error('markLeadAsRead error:', error)
    return { success: false, error: 'No se pudo actualizar el lead.' }
  }
}
