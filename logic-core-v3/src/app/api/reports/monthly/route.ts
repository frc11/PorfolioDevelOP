import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAnalyticsData } from '@/lib/analytics'
import { getSearchConsoleData } from '@/lib/searchconsole'
import { MonthlyReport } from '@/lib/reports/MonthlyReport'
import type { MonthlyReportData } from '@/lib/reports/MonthlyReport'

// Force Node.js runtime — @react-pdf/renderer requires it
export const runtime = 'nodejs'

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7) // "YYYY-MM"
}

function isValidMonth(month: string): boolean {
  return /^\d{4}-\d{2}$/.test(month)
}

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { role, clientId: sessionClientId } = session.user

  // ── Params ────────────────────────────────────────────────────────────────
  const { searchParams } = req.nextUrl
  const requestedClientId = searchParams.get('clientId')
  const month = searchParams.get('month') ?? currentMonth()

  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'Formato de mes inválido. Use YYYY-MM.' }, { status: 400 })
  }

  // Determine which clientId to use
  let clientId: string
  if (role === 'SUPER_ADMIN') {
    if (!requestedClientId) {
      return NextResponse.json({ error: 'clientId requerido para admin.' }, { status: 400 })
    }
    clientId = requestedClientId
  } else {
    // CLIENT: can only access their own report
    if (!sessionClientId) {
      return NextResponse.json({ error: 'Sin cliente asociado.' }, { status: 403 })
    }
    if (requestedClientId && requestedClientId !== sessionClientId) {
      return NextResponse.json({ error: 'Sin permisos.' }, { status: 403 })
    }
    clientId = sessionClientId
  }

  // ── Fetch client ──────────────────────────────────────────────────────────
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      companyName: true,
      analyticsPropertyId: true,
      siteUrl: true,
    },
  })

  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 })
  }

  // ── Fetch all data in parallel ────────────────────────────────────────────
  const [analyticsResult, searchConsoleResult, project, services] = await Promise.all([
    client.analyticsPropertyId
      ? getAnalyticsData(client.analyticsPropertyId)
      : Promise.resolve(null),

    client.siteUrl
      ? getSearchConsoleData(client.siteUrl)
      : Promise.resolve(null),

    prisma.project.findFirst({
      where: { clientId },
      orderBy: [{ status: 'asc' }, { id: 'desc' }],
      include: { tasks: { select: { status: true } } },
    }),

    prisma.service.findMany({
      where: { clientId },
      select: { type: true, status: true },
    }),
  ])

  // ── Build report data ─────────────────────────────────────────────────────
  const reportData: MonthlyReportData = {
    companyName: client.companyName,
    month,
    analytics: analyticsResult?.ok ? analyticsResult.data : null,
    searchConsole: searchConsoleResult?.ok ? searchConsoleResult.data : null,
    project: project
      ? {
          name: project.name,
          status: project.status,
          totalTasks: project.tasks.length,
          doneTasks: project.tasks.filter((t) => t.status === 'DONE').length,
        }
      : null,
    services: services.map((s) => ({ type: s.type, status: s.status })),
  }

  // ── Generate PDF ──────────────────────────────────────────────────────────
  try {
    const buffer = await renderToBuffer(
      React.createElement(MonthlyReport, { data: reportData })
    )

    const [year, mon] = month.split('-')
    const filename = `reporte-${client.companyName.toLowerCase().replace(/\s+/g, '-')}-${year}-${mon}.pdf`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[PDF generation error]', err)
    return NextResponse.json(
      { error: 'Error al generar el PDF. Intentá de nuevo.' },
      { status: 500 }
    )
  }
}
