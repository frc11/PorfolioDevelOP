'use server'

import { z } from 'zod'
import { logAdminAction } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { sendLeadNotificationEmail } from '../notifications'
import { requireSuperAdmin } from './requireSuperAdmin'

const SendTestNotificationSchema = z.object({
  orgSlug: z.string().min(1),
  email: z.string().email(),
})

export async function sendTestNotification(input: z.infer<typeof SendTestNotificationSchema>) {
  const adminUser = await requireSuperAdmin()
  const parsed = SendTestNotificationSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' }
  }

  const rate = await checkRateLimit({
    key: `testNotificationPerAdmin:${adminUser.id ?? adminUser.email ?? 'unknown'}`,
    limit: RATE_LIMIT_PRESETS.testNotificationPerAdmin.limit,
    windowMs: RATE_LIMIT_PRESETS.testNotificationPerAdmin.windowMs,
  })
  if (!rate.allowed) {
    const waitSeconds = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))
    return { success: false, error: `Esperá ${waitSeconds}s antes de volver a probar` }
  }

  // Datos reales de la org/bot para un preview realista. Si el slug no
  // matchea, el test de entrega igual sale con los nombres genéricos.
  const bot = await prisma.botConfig.findFirst({
    where: { organization: { slug: parsed.data.orgSlug } },
    select: { botName: true, organization: { select: { id: true, companyName: true } } },
  })

  const result = await sendLeadNotificationEmail({
    to: parsed.data.email,
    organizationName: bot?.organization.companyName ?? 'develOP Test',
    botName: bot?.botName ?? 'Lucia',
    lead: {
      name: 'Cliente de Prueba',
      email: 'test@example.com',
      phone: '+541112345678',
      intent: 'demo',
      message: 'Este es un email de prueba para verificar que las notificaciones funcionan.',
      createdAt: new Date(),
    },
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard/chatbot/leads`,
  })

  await logAdminAction({
    userId: adminUser.id ?? 'unknown',
    userEmail: adminUser.email ?? undefined,
    userName: adminUser.name ?? undefined,
    actionType: 'EMAIL_SENT',
    action: 'develOP envió un email de prueba de notificación de leads',
    targetType: 'Organization',
    targetId: bot?.organization.id ?? parsed.data.orgSlug,
    metadata: {
      source: 'admin_test_notification',
      orgSlug: parsed.data.orgSlug,
      result: result.ok ? 'success' : 'failed',
    },
  })

  if (!result.ok) {
    return {
      success: false,
      error: 'skipped' in result && result.skipped ? 'Email no configurado (BREVO_API_KEY)' : 'No se pudo enviar el email',
    }
  }

  return { success: true, emailId: result.emailId }
}
