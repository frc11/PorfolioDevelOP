import { BrevoClient } from '@getbrevo/brevo'

function getClient(): BrevoClient {
  return new BrevoClient({ apiKey: process.env.BREVO_API_KEY ?? '' })
}

interface SendEmailInput {
  to: { email: string; name?: string }
  subject: string
  htmlContent: string
  textContent?: string
  // RFC 8058 compliance + cabeceras custom (ej. List-Unsubscribe / List-Unsubscribe-Post
  // para 1-click unsubscribe). Opcional para no romper callers existentes.
  headers?: Record<string, string>
}

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<{ ok: true; messageId: string | undefined } | { ok: false; error: string }> {
  if (!process.env.BREVO_API_KEY) {
    console.error('[Brevo] BREVO_API_KEY no configurada')
    return { ok: false, error: 'EMAIL_NOT_CONFIGURED' }
  }

  try {
    const client = getClient()
    const result = await client.transactionalEmails.sendTransacEmail({
      subject: input.subject,
      htmlContent: input.htmlContent,
      textContent: input.textContent,
      sender: {
        name: process.env.BREVO_FROM_NAME ?? 'develOP',
        email: process.env.BREVO_FROM_EMAIL ?? 'hola@develop.com.ar',
      },
      to: [input.to],
      headers: input.headers,
    })

    return { ok: true, messageId: result.messageId }
  } catch (error) {
    console.error('[Brevo] Error sending email:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'UNKNOWN',
    }
  }
}
