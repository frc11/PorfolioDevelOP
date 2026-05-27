import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe-token'

export const dynamic = 'force-dynamic'

// HTML mínimo, mismo lenguaje visual que los emails. No es una página de la app,
// es un acuse de baja después del click del usuario.
function renderResponse(opts: {
  title: string
  message: string
  ok: boolean
}): string {
  const accent = opts.ok ? '#10b981' : '#f43f5e'
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title} · develOP</title>
  <style>
    body{margin:0;padding:40px 20px;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fafafa;min-height:100vh;display:flex;align-items:center;justify-content:center;}
    .card{max-width:440px;width:100%;background:#18181b;border-radius:20px;padding:40px;text-align:center;}
    .dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:${accent};margin-bottom:24px;}
    h1{margin:0 0 12px;font-size:22px;font-weight:600;}
    p{margin:0;color:#a1a1aa;line-height:1.6;font-size:15px;}
  </style>
</head>
<body>
  <div class="card">
    <span class="dot"></span>
    <h1>${opts.title}</h1>
    <p>${opts.message}</p>
  </div>
</body>
</html>`
}

async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const orgId = url.searchParams.get('org')
  const token = url.searchParams.get('token')

  const html = (body: string, status: number) =>
    new NextResponse(body, {
      status,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })

  if (!orgId || !token) {
    return html(
      renderResponse({
        title: 'Link inválido',
        message:
          'El link de cancelación no es válido. Si el problema persiste, escribinos a hola@develop.com.ar.',
        ok: false,
      }),
      400,
    )
  }

  if (!verifyUnsubscribeToken(orgId, token)) {
    return html(
      renderResponse({
        title: 'Link inválido',
        message:
          'No pudimos verificar el link. Puede haber expirado o haber sido modificado. Escribinos si necesitás ayuda.',
        ok: false,
      }),
      403,
    )
  }

  try {
    await prisma.organization.update({
      where: { id: orgId },
      data: { executiveReportOptOut: true },
    })
  } catch (err) {
    console.error('[unsubscribe-executive] update failed:', err)
    return html(
      renderResponse({
        title: 'Algo salió mal',
        message:
          'No pudimos procesar tu pedido en este momento. Intentá de nuevo en unos minutos.',
        ok: false,
      }),
      500,
    )
  }

  return html(
    renderResponse({
      title: 'Listo, te dimos de baja',
      message:
        'Ya no vas a recibir el reporte semanal de tu negocio. Si cambiás de opinión, escribinos cuando quieras.',
      ok: true,
    }),
    200,
  )
}

export async function GET(request: Request) {
  return handle(request)
}

// RFC 8058: clientes como Gmail / Apple Mail mandan POST automático al
// `List-Unsubscribe` cuando el usuario clickea el botón nativo de "Cancelar
// suscripción". Mismo handler — la operación es idempotente.
export async function POST(request: Request) {
  return handle(request)
}
