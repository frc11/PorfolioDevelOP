'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendLeadToN8n } from '@/lib/n8n'

export type ContactFormState = {
    success: boolean
    error?: string
}

export async function submitContactForm(
    prevState: ContactFormState,
    formData: FormData
): Promise<ContactFormState> {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string | null
    const company = formData.get('company') as string | null
    const service = formData.get('service') as string | null
    const message = formData.get('message') as string

    if (!name || !email || !message) {
        return { success: false, error: 'Nombre, email y mensaje son requeridos.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return { success: false, error: 'El email no es válido.' }
    }

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPhone = phone?.trim() || null
    const trimmedCompany = company?.trim() || null
    const trimmedService = service?.trim() || null
    const trimmedMessage = message.trim()

    await prisma.contactSubmission.create({
        data: {
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            company: trimmedCompany,
            service: trimmedService,
            message: trimmedMessage,
        },
    })

    revalidatePath('/admin/leads')

    // Fire-and-await webhook — failure never blocks the success response.
    // The lead is already persisted in DB at this point.
    try {
        await sendLeadToN8n({
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            company: trimmedCompany,
            service: trimmedService,
            message: trimmedMessage,
            submittedAt: new Date().toISOString(),
        })
    } catch (err) {
        console.error('[N8N webhook] Error al enviar lead:', err instanceof Error ? err.message : err)
    }

    return { success: true }
}

export async function markLeadAsRead(id: string) {
    await prisma.contactSubmission.update({
        where: { id },
        data: { read: true },
    })
    revalidatePath('/admin/leads')
}
