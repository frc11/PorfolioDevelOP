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

  const { role, organizationId: sessionOrganizationId } = session.user

  // ── Params ────────────────────────────────────────────────────────────────
  const { searchParams } = req.nextUrl
  const requestedOrganizationId = searchParams.get('organizationId')
  const month = searchParams.get('month') ?? currentMonth()

  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'Formato de mes inválido. Use YYYY-MM.' }, { status: 400 })
  }

  // Determine which organizationId to use
  let organizationId: string
  if (role === 'SUPER_ADMIN') {
    if (!requestedOrganizationId) {
      return NextResponse.json({ error: 'organizationId requerido para admin.' }, { status: 400 })
    }
    organizationId = requestedOrganizationId
  } else {
    // ORG_MEMBER: can only access their own report
    if (!sessionOrganizationId) {
      return NextResponse.json({ error: 'Sin organización asociada.' }, { status: 403 })
    }
    if (requestedOrganizationId && requestedOrganizationId !== sessionOrganizationId) {
      return NextResponse.json({ error: 'Sin permisos.' }, { status: 403 })
    }
    organizationId = sessionOrganizationId
  }

  // ── Fetch organization ────────────────────────────────────────────────────
  const client = await prisma.organization.findUnique({
    where: { id: organizationId },
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
      where: { organizationId },
      orderBy: [{ status: 'asc' }, { id: 'desc' }],
      include: { tasks: { select: { status: true } } },
    }),

    prisma.service.findMany({
      where: { organizationId },
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
