import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = await params

  try {
    await prisma.emailContact.update({
      where: { id: contactId },
      data: { optedOut: true, optedOutAt: new Date() },
    })
  } catch {
    // Contact not found or already opted out — still show success to avoid enumeration
  }

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Baja de suscripción</title>
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
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 24px;
    }
    h1 { font-size: 16px; font-weight: 800; color: #f4f4f5; margin-bottom: 10px; }
    p { font-size: 13px; color: #71717a; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>Te diste de baja correctamente</h1>
    <p>Tu dirección de email fue removida de esta lista. No recibirás más correos de esta campaña.</p>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    },
  )
}
