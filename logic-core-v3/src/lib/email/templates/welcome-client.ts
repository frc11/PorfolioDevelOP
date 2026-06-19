interface WelcomeClientEmailInput {
  clientName: string
  organizationName: string
  email: string
  tempPassword: string
  loginUrl: string
  /** Si el alta incluye chatbot. Por defecto true (preserva el copy histórico). */
  withBot?: boolean
}

export function welcomeClientEmail(input: WelcomeClientEmailInput): {
  subject: string
  htmlContent: string
  textContent: string
} {
  const withBot = input.withBot ?? true
  const introTail = withBot
    ? ' Ya podés entrar a tu panel y ver tu chatbot funcionando.'
    : ' Ya podés entrar a tu panel.'
  const botBulletHtml = withBot
    ? '<li>Mi Chatbot: métricas en tiempo real de tu bot</li>\n                '
    : ''
  const botBulletText = withBot
    ? '- Mi Chatbot: métricas de tu bot en tiempo real\n'
    : ''

  return {
    subject: `Bienvenido/a a develOP, ${input.clientName}`,
    htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a develOP</title>
</head>
<body style="margin:0; padding:0; background-color:#09090b; color:#e4e4e7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#09090b; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px; background-color:#18181b; border-radius:16px; padding:32px; border:1px solid #27272a;">
          <tr>
            <td>
              <p style="margin:0 0 24px 0; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">develOP</p>
              <h1 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#fafafa; line-height:1.3;">
                Hola ${input.clientName}, tu cuenta está lista
              </h1>
              <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#a1a1aa;">
                Acabamos de armar todo para <strong style="color:#e4e4e7;">${input.organizationName}</strong>.${introTail}
              </p>

              <div style="background-color:#27272a; border-radius:12px; padding:20px; margin:0 0 24px 0; border:1px solid #3f3f46;">
                <p style="margin:0 0 12px 0; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">Tus credenciales</p>
                <p style="margin:0 0 8px 0; font-size:14px; color:#a1a1aa;">
                  <strong style="color:#e4e4e7;">Email:</strong> ${input.email}
                </p>
                <p style="margin:0 0 16px 0; font-size:14px; color:#a1a1aa;">
                  <strong style="color:#e4e4e7;">Contraseña temporal:</strong>&nbsp;
                  <code style="background-color:#3f3f46; padding:4px 10px; border-radius:6px; font-size:15px; color:#06b6d4; letter-spacing:2px; font-family:monospace;">${input.tempPassword}</code>
                </p>
                <p style="margin:0; font-size:12px; color:#71717a;">
                  Te vamos a pedir que la cambies cuando entres por primera vez.
                </p>
              </div>

              <div style="text-align:center; margin:0 0 32px 0;">
                <a href="${input.loginUrl}" style="display:inline-block; background-color:#06b6d4; color:#09090b; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:600; font-size:15px;">
                  Entrar a mi panel →
                </a>
              </div>

              <hr style="border:none; border-top:1px solid #27272a; margin:0 0 24px 0;">

              <p style="margin:0 0 8px 0; font-size:13px; color:#e4e4e7; font-weight:600;">¿Qué vas a encontrar adentro?</p>
              <ul style="margin:0 0 24px 0; padding-left:20px; color:#a1a1aa; font-size:13px; line-height:1.8;">
                ${botBulletHtml}<li>Mis Leads: oportunidades capturadas automáticamente</li>
                <li>Mensajes: contacto directo con nuestro equipo</li>
              </ul>

              <p style="margin:0 0 4px 0; font-size:13px; color:#71717a;">
                Cualquier duda, respondé este email o escribime por WhatsApp.
              </p>
              <p style="margin:0; font-size:13px; color:#71717a;">
                Franco — develOP<br>
                <a href="https://develop.com.ar" style="color:#06b6d4; text-decoration:none;">develop.com.ar</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    textContent: `
Hola ${input.clientName},

Tu cuenta de develOP está lista. Acabamos de armar todo para ${input.organizationName}.

TUS CREDENCIALES
Email: ${input.email}
Contraseña temporal: ${input.tempPassword}

(Te vamos a pedir que la cambies en tu primer login.)

Entrá acá: ${input.loginUrl}

QUÉ VAS A ENCONTRAR:
${botBulletText}- Mis Leads: oportunidades capturadas automáticamente
- Mensajes: contacto directo con develOP

Cualquier duda, respondé este email o escribime por WhatsApp.

Franco — develOP
develop.com.ar
    `.trim(),
  }
}
