'use server'

import { z } from 'zod'
import { sendLeadNotificationEmail } from '../notifications'

const SendTestNotificationSchema = z.object({
  orgSlug: z.string().min(1),
  email: z.string().email(),
})

export async function sendTestNotification(input: z.infer<typeof SendTestNotificationSchema>) {
  const parsed = SendTestNotificationSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.message }
  }

  const result = await sendLeadNotificationEmail({
    to: parsed.data.email,
    organizationName: 'develOP Test',
    botName: 'Lucia',
    lead: {
      name: 'Cliente de Prueba',
      email: 'test@example.com',
      phone: '+541112345678',
      intent: 'demo',
      message: 'Este es un email de prueba para verificar que las notificaciones funcionan.',
      createdAt: new Date(),
    },
    dashboardUrl: 'https://develop-portfolio.netlify.app/dashboard/chatbot/leads',
  })

  if (!result.ok) {
    return {
      success: false,
      error: 'skipped' in result && result.skipped ? 'RESEND_API_KEY no configurada' : 'No se pudo enviar el email',
    }
  }

  return { success: true, emailId: result.emailId }
}
