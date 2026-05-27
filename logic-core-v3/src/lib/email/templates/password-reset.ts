interface PasswordResetEmailInput {
  clientName: string
  resetUrl: string
  expiresInMinutes: number
}

export function passwordResetEmail(input: PasswordResetEmailInput): {
  subject: string
  htmlContent: string
  textContent: string
} {
  const safeName = input.clientName?.trim() || 'Hola'
  const minutes = input.expiresInMinutes

  return {
    subject: 'Restablecé tu contraseña de develOP',
    htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña</title>
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
                ${safeName}, recibimos tu pedido
              </h1>
              <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#a1a1aa;">
                Alguien pidió restablecer la contraseña de tu cuenta develOP. Si fuiste vos, hacé click acá abajo y vas a poder elegir una nueva en menos de un minuto.
              </p>

              <div style="text-align:center; margin:0 0 24px 0;">
                <a href="${input.resetUrl}" style="display:inline-block; background-color:#06b6d4; color:#09090b; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:600; font-size:15px;">
                  Crear nueva contraseña →
                </a>
              </div>

              <div style="background-color:#27272a; border-radius:12px; padding:16px 20px; margin:0 0 24px 0; border:1px solid #3f3f46;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:#a1a1aa;">
                  <strong style="color:#e4e4e7;">El enlace vence en ${minutes} minutos</strong> y solo se puede usar una vez.
                  Si no fuiste vos, ignorá este mensaje — tu cuenta sigue protegida.
                </p>
              </div>

              <p style="margin:0 0 8px 0; font-size:12px; color:#71717a;">
                Si el botón no funciona, copiá y pegá este link en tu navegador:
              </p>
              <p style="margin:0 0 24px 0; font-size:11px; color:#52525b; word-break:break-all; font-family:monospace;">
                ${input.resetUrl}
              </p>

              <hr style="border:none; border-top:1px solid #27272a; margin:0 0 24px 0;">

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
${safeName},

Recibimos un pedido para restablecer la contraseña de tu cuenta develOP.
Si fuiste vos, abrí este link y vas a poder elegir una nueva:

${input.resetUrl}

El enlace vence en ${minutes} minutos y solo se puede usar una vez.
Si no fuiste vos, ignorá este mensaje — tu cuenta sigue protegida.

Franco — develOP
develop.com.ar
    `.trim(),
  }
}
