/**
 * P2.C — "Descargá el informe del mes". GET devuelve el PDF como adjunto.
 *
 * Org-scoping estricto: el organizationId sale EXCLUSIVAMENTE de la sesión vía
 * `resolveOrgId()` — esta ruta no lee ni acepta ningún parámetro de query/body
 * para identificar la org (a diferencia de `/api/reports/monthly`, que valida
 * un `organizationId` de query contra la sesión). Acá no hay ESE parámetro en
 * absoluto: no hay superficie donde inyectar el id de otra organización.
 *
 * Gate de plan: mismo `planAllows(plan, 'insight')` que la tab P0.2 — chequeo
 * server-side de todas formas (nunca confiar en que el botón se ocultó bien).
 */
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { resolveOrgId } from '@/lib/preview'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { getClientMonthlyReportData } from '@/lib/reports/client-monthly/get-client-monthly-report-data'
import { ClientMonthlyReportPdf } from '@/lib/reports/client-monthly/ClientMonthlyReportPdf'

export const runtime = 'nodejs'

export async function GET() {
  const organizationId = await resolveOrgId()
  if (!organizationId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const plan = await getPlanForOrg(organizationId)
  if (!planAllows(plan, 'insight')) {
    return NextResponse.json({ error: 'Tu plan no incluye este informe.' }, { status: 403 })
  }

  const now = new Date()

  try {
    const data = await getClientMonthlyReportData(organizationId, now)

    const buffer = await renderToBuffer(
      React.createElement(ClientMonthlyReportPdf, { data, now }) as never,
    )

    const filenameCompany = data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const filenameMonth = data.monthLabel.toLowerCase().replace(/\s+/g, '-')
    const filename = `informe-${filenameCompany}-${filenameMonth}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[client-monthly-report] PDF generation error', error)
    return NextResponse.json(
      { error: 'Error al generar el informe. Intentá de nuevo.' },
      { status: 500 },
    )
  }
}
