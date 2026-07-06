import { sendTransactionalEmail } from '@/lib/email/brevo-service'

interface LeadNotificationInput {
  to: string
  organizationName: string
  botName: string
  lead: {
    name: string
    email: string | null
    phone: string | null
    intent: string
    message: string
    createdAt: Date
  }
  dashboardUrl: string
}

export async function sendLeadNotificationEmail(input: LeadNotificationInput) {
  const html = renderLeadNotificationHtml(input)

  const result = await sendTransactionalEmail({
    to: { email: input.to },
    subject: `Nuevo lead: ${input.lead.name}`,
    htmlContent: html,
  })

  if (!result.ok) {
    // Motor no configurado (falta BREVO_API_KEY) → se preserva el contrato
    // "skipped" que el botón admin (sendTestNotification) ya interpreta;
    // cualquier otro fallo de envío se reporta como error.
    if (result.error === 'EMAIL_NOT_CONFIGURED') {
      return { ok: false, skipped: true }
    }
    console.error('[notifications] Failed to send lead notification', result.error)
    return { ok: false, error: result.error }
  }

  return { ok: true, emailId: result.messageId }
}

export function renderLeadNotificationHtml(input: LeadNotificationInput): string {
  const { organizationName, botName, lead, dashboardUrl } = input
  const emailRow = lead.email
    ? `<p style="margin:6px 0;color:#334155;"><strong>Email:</strong> ${escapeHtml(lead.email)}</p>`
    : ''
  const phoneRow = lead.phone
    ? `<p style="margin:6px 0;color:#334155;"><strong>Telefono:</strong> ${escapeHtml(lead.phone)}</p>`
    : ''

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px;background:#0f172a;color:#ffffff;">
                    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#67e8f9;">Nuevo lead capturado</p>
                    <h1 style="margin:0;font-size:22px;line-height:1.25;">${escapeHtml(botName)} en ${escapeHtml(organizationName)}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    <h2 style="margin:0 0 16px;font-size:20px;">${escapeHtml(lead.name)}</h2>
                    ${emailRow}
                    ${phoneRow}
                    <p style="margin:6px 0;color:#334155;"><strong>Interes:</strong> ${escapeHtml(lead.intent)}</p>
                    <p style="margin:6px 0;color:#334155;"><strong>Fecha:</strong> ${escapeHtml(lead.createdAt.toLocaleString('es-AR'))}</p>
                    <div style="margin:20px 0;padding:16px;background:#f1f5f9;border-left:4px solid #06b6d4;border-radius:8px;color:#1e293b;">
                      ${escapeHtml(lead.message)}
                    </div>
                    <a href="${escapeAttribute(dashboardUrl)}" style="display:inline-block;padding:12px 16px;background:#06b6d4;color:#020617;text-decoration:none;border-radius:8px;font-weight:700;">
                      Ver en mi panel
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">
                    Powered by develOP · ${new Date().getFullYear()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#096;')
}
