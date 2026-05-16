import { Resend } from 'resend'

interface InsightsNotificationInput {
  to: string
  organizationName: string
  botName: string
  insightsCount: number
  dashboardUrl: string
}

export async function sendInsightsNotificationEmail(input: InsightsNotificationInput) {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, skipped: true }
  }

  const { to, organizationName, botName, insightsCount, dashboardUrl } = input

  const html = `
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

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'develOP <insights@develop.com.ar>',
      to,
      subject: `${insightsCount} insights nuevos para ${botName}`,
      html,
    })
    return { ok: true }
  } catch (error) {
    console.error('[notifications] Failed to send insights email', error)
    return { ok: false, error: String(error) }
  }
}
