import { sendTransactionalEmail } from '@/lib/email/brevo-service'

interface InsightsNotificationInput {
  to: string
  organizationName: string
  botName: string
  insightsCount: number
  dashboardUrl: string
}

export async function sendInsightsNotificationEmail(input: InsightsNotificationInput) {
  const result = await sendTransactionalEmail({
    to: { email: input.to },
    subject: `${input.insightsCount} insights nuevos para ${input.botName}`,
    htmlContent: renderInsightsNotificationHtml(input),
  })

  if (!result.ok) {
    console.error('[notifications] Failed to send insights email', result.error)
    return { ok: false, error: result.error }
  }

  return { ok: true }
}

export function renderInsightsNotificationHtml(input: InsightsNotificationInput): string {
  const { organizationName, botName, insightsCount, dashboardUrl } = input

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, sans-serif; background: #f5f5f5; padding: 24px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 24px;">
            <h1 style="margin: 0; font-size: 18px;">${insightsCount} insights nuevos</h1>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">para ${botName} en ${organizationName}</p>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 14px; color: #333; line-height: 1.6;">
              Tu chatbot detectó ${insightsCount} ${insightsCount === 1 ? 'oportunidad' : 'oportunidades'} de mejora
              basadas en las conversaciones de los últimos 30 días.
            </p>
            <p style="font-size: 14px; color: #333; line-height: 1.6;">
              Pueden incluir: gaps en la información del bot, dónde se pierden leads,
              o sugerencias de contenido nuevo.
            </p>
            <a href="${dashboardUrl}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
              Ver mis insights →
            </a>
          </div>
          <div style="padding: 16px 24px; background: #fafafa; font-size: 11px; color: #999;">
            Powered by develOP · ${new Date().getFullYear()}
          </div>
        </div>
      </body>
    </html>
  `
}
