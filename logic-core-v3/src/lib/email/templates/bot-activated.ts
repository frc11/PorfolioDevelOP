interface BotActivatedEmailInput {
  clientName: string
  botName: string
  botSlug: string
  appUrl: string
}

export function botActivatedEmail(input: BotActivatedEmailInput): {
  subject: string
  htmlContent: string
  textContent: string
} {
  const snippet = `&lt;script src="${input.appUrl}/widget.js" data-bot="${input.botSlug}" data-theme="dark"&gt;&lt;/script&gt;`
  const installUrl = `${input.appUrl}/dashboard/chatbot/install`

  return {
    subject: `Tu chatbot ${input.botName} está listo para instalar`,
    htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu chatbot está listo</title>
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
                ${input.botName} está listo
              </h1>
              <p style="margin:0 0 24px 0; font-size:15px; line-height:1.6; color:#a1a1aa;">
                Hola ${input.clientName}, tu chatbot ya está activo. Solo tenés que pegar este código en tu sitio para que aparezca en todas las páginas.
              </p>

              <div style="background-color:#09090b; border-radius:12px; padding:16px 20px; margin:0 0 24px 0; border:1px solid #3f3f46;">
                <p style="margin:0 0 8px 0; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; color:#71717a;">Pegá esto antes de &lt;/body&gt;</p>
                <code style="font-size:12px; color:#06b6d4; font-family:monospace; word-break:break-all; line-height:1.6;">${snippet}</code>
              </div>

              <div style="text-align:center; margin:0 0 32px 0;">
                <a href="${installUrl}" style="display:inline-block; background-color:#06b6d4; color:#09090b; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:600; font-size:15px;">
                  Ver instrucciones completas →
                </a>
              </div>

              <hr style="border:none; border-top:1px solid #27272a; margin:0 0 24px 0;">

              <p style="margin:0 0 8px 0; font-size:13px; color:#e4e4e7; font-weight:600;">¿Dónde pegar el código?</p>
              <ul style="margin:0 0 24px 0; padding-left:20px; color:#a1a1aa; font-size:13px; line-height:1.8;">
                <li><strong style="color:#e4e4e7;">WordPress:</strong> plugin Insert Headers and Footers → Scripts in Footer</li>
                <li><strong style="color:#e4e4e7;">Tiendanube:</strong> Configuración → Códigos externos → antes de &lt;/body&gt;</li>
                <li><strong style="color:#e4e4e7;">Shopify:</strong> theme.liquid → antes de &lt;/body&gt;</li>
                <li><strong style="color:#e4e4e7;">HTML estático:</strong> directamente antes de &lt;/body&gt;</li>
              </ul>

              <p style="margin:0 0 4px 0; font-size:13px; color:#71717a;">
                Cualquier duda, respondé este email.
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

Tu chatbot ${input.botName} ya está activo.

INSTALACIÓN
Pegá este código en tu sitio antes de </body>:

<script src="${input.appUrl}/widget.js" data-bot="${input.botSlug}" data-theme="dark"></script>

Instrucciones por plataforma: ${installUrl}

DÓNDE PEGAR EL CÓDIGO:
- WordPress: plugin Insert Headers and Footers → Scripts in Footer
- Tiendanube: Configuración → Códigos externos → antes de </body>
- Shopify: theme.liquid → antes de </body>
- HTML estático: directamente antes de </body>

Cualquier duda, respondé este email.

Franco — develOP
develop.com.ar
    `.trim(),
  }
}
