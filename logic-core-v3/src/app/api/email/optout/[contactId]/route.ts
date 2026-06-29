import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyEmailContactOptOutToken } from '@/lib/email/unsubscribe-token'

export const dynamic = 'force-dynamic'

function page(opts: { title: string; message: string; ok: boolean }): string {
  const accent = opts.ok ? '#10b981' : '#f43f5e'
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #09090b;
      color: #f4f4f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 380px;
      width: 100%;
      text-align: center;
    }
    .icon {
      width: 56px;
      height: 56px;
      background: ${opts.ok ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)'};
      border: 1px solid ${opts.ok ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'};
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 24px;
      color: ${accent};
    }
    h1 { font-size: 16px; font-weight: 800; color: #f4f4f5; margin-bottom: 10px; }
    p { font-size: 13px; color: #71717a; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${opts.ok ? '✓' : '!'}</div>
    <h1>${opts.title}</h1>
    <p>${opts.message}</p>
  </div>
</body>
</html>`
}

const html = (body: string, status: number) =>
  new NextResponse(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })

export async function GET(req: Request, { params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = await params
  const token = new URL(req.url).searchParams.get('token')

  // El token es un HMAC del contactId: sin un token válido NO se actúa sobre
  // ningún contacto. La verificación es PREVIA a tocar la DB, así que un id
  // ajeno o adivinado no permite baja ni revela si el contacto existe
  // (anti-IDOR / anti-enumeración). Mismo patrón que /unsubscribe-executive.
  if (!token || !verifyEmailContactOptOutToken(contactId, token)) {
    return html(
      page({
        title: 'Link inválido',
        message:
          'El link de baja no es válido o fue modificado. Si necesitás ayuda, escribinos a hola@develop.com.ar.',
        ok: false,
      }),
      403,
    )
  }

  // updateMany (no update): idempotente y no lanza si el id no existe, de modo
  // que la respuesta es idéntica exista o no el contacto (cero leak).
  await prisma.emailContact.updateMany({
    where: { id: contactId },
    data: { optedOut: true, optedOutAt: new Date() },
  })

  return html(
    page({
      title: 'Te diste de baja correctamente',
      message:
        'Tu dirección de email fue removida de esta lista. No recibirás más correos de esta campaña.',
      ok: true,
    }),
    200,
  )
}
