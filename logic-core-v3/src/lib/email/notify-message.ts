import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

interface NotifyParams {
  recipientUserId: string
  senderName: string
  messagePreview: string
  organizationId: string
}

export async function notifyClientOfNewMessage(params: NotifyParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('[notify-message] RESEND_API_KEY missing, skipping')
      return
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const member = await prisma.orgMember.findFirst({
      where: { 
        userId: params.recipientUserId,
        organizationId: params.organizationId,
      },
      include: { 
        user: { 
          select: { 
            email: true, 
            name: true,
          } 
        } 
      },
    })

    if (!member?.user?.email) {
      console.log('[notify-message] User has no email, skipping')
      return
    }

    if (!member.emailNotificationsOnMessage) {
      console.log('[notify-message] User opted out of email notifications')
      return
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages`
    const truncatedPreview = params.messagePreview.length > 200
      ? params.messagePreview.substring(0, 200) + '...'
      : params.messagePreview

    await resend.emails.send({
      from: 'develOP <hola@develop.com.ar>',  // ⚠️ Franco, ajustar al dominio real verificado en Resend
      to: member.user.email,
      subject: `Nuevo mensaje de ${params.senderName} en tu panel develOP`,
      html: buildEmailHtml({
        recipientName: member.user.name ?? 'Hola',
        senderName: params.senderName,
        preview: truncatedPreview,
        dashboardUrl,
      }),
    })

    console.log(`[notify-message] Email sent to ${member.user.email}`)
  } catch (err) {
    console.error('[notify-message] Failed to send email:', err)
    // No re-throw — esto es best-effort, no debe romper el flow del mensaje
  }
}

function buildEmailHtml(params: {
  recipientName: string
  senderName: string
  preview: string
  dashboardUrl: string
}): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Nuevo mensaje en develOP</title>
</head>
<body style="margin:0; padding:40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; color: #18181b;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    
    <div style="margin-bottom: 32px;">
      <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #0891b2; margin: 0;">
        develOP
      </p>
    </div>

    <h1 style="font-size: 22px; font-weight: 800; color: #18181b; margin: 0 0 16px 0;">
      Nuevo mensaje de ${params.senderName}
    </h1>

    <p style="font-size: 15px; color: #52525b; line-height: 1.6; margin: 0 0 24px 0;">
      Hola ${params.recipientName}, ${params.senderName} te escribió en tu panel develOP:
    </p>

    <div style="background: #f4f4f5; border-left: 3px solid #06b6d4; padding: 16px 20px; border-radius: 6px; margin-bottom: 32px;">
      <p style="font-size: 14px; color: #27272a; line-height: 1.6; margin: 0; white-space: pre-wrap;">${params.preview}</p>
    </div>

    <a href="${params.dashboardUrl}" style="display: inline-block; background: #06b6d4; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">
      Responder en el panel →
    </a>

    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 40px 0 24px 0;">

    <p style="font-size: 11px; color: #a1a1aa; line-height: 1.6; margin: 0;">
      Recibís este email porque tenés activadas las notificaciones de mensajes en tu cuenta develOP.
      Podés desactivarlas desde tu perfil en el panel.
    </p>
  </div>
</body>
</html>
  `.trim()
}
