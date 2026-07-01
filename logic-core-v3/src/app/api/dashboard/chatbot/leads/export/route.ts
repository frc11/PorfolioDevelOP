import type { NextRequest } from 'next/server'
import type { ChatbotLeadStatus } from '@prisma/client'
import { logAdminAction } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'
import { getClientChatbotSession } from '@/modules/chatbot/server/admin/getClientSession'
import { listLeadsForDashboard } from '@/modules/chatbot/server/admin/multiTenantQueries'
import {
  getEffectiveScore,
  type LeadScoreClassification,
} from '@/modules/chatbot/server/scoring'
import { buildLeadsCsv, type LeadForCsv } from '@/modules/chatbot/server/leads/csv'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import type { DateRange } from '@/lib/tz-ar'

/**
 * B5.9 — GET /api/dashboard/chatbot/leads/export
 *
 * Devuelve el CSV de leads de la org del dueño autenticado, respetando los
 * filtros activos en la vista (status, range, view, class). DQ excluidos
 * por default — solo se exportan si `view=dq` (vista de descartados activa).
 *
 * Seguridad crítica:
 *  - Auth obligatorio (getClientChatbotSession). 401 si no.
 *  - Multi-tenant: `listLeadsForDashboard(session.organization.id, ...)`
 *    filtra relacionalmente por org. Imposible exportar leads de otra org.
 *  - Audit log LEADS_EXPORTED con count + filtros + orgId.
 *  - El CSV en sí pasa por `csvEscape` celda por celda — anti CSV-injection.
 *
 * NO se exporta:
 *  - score crudo, scoreSignals, internalNotes, botConfigId, notificationSent*.
 *  - Solo lo legible al dueño.
 */

const VALID_STATUSES: ChatbotLeadStatus[] = [
  'NEW',
  'CONTACTED',
  'IN_NEGOTIATION',
  'WON',
  'LOST',
]
const VALID_RANGES: DateRange[] = ['all', 'today', '7d', '30d']
const VALID_CLASSES = ['all', 'hot', 'warm', 'cold'] as const
type ValidClass = (typeof VALID_CLASSES)[number]

// Cap del export. Cubre PyME por años. Si una org excede, paginación queda en
// roadmap-pendientes — no es escenario MVP.
const EXPORT_LIMIT = 10_000

function parseStatus(v: string | null): ChatbotLeadStatus | undefined {
  if (!v) return undefined
  return (VALID_STATUSES as string[]).includes(v)
    ? (v as ChatbotLeadStatus)
    : undefined
}

function parseRange(v: string | null): DateRange {
  if (!v) return 'all'
  return (VALID_RANGES as string[]).includes(v) ? (v as DateRange) : 'all'
}

function parseClass(v: string | null): ValidClass {
  if (!v) return 'all'
  return (VALID_CLASSES as readonly string[]).includes(v) ? (v as ValidClass) : 'all'
}

function formatDateForFilename(d: Date): string {
  // YYYY-MM-DD en TZ Argentina, ordenable cuando el dueño tenga varios exports.
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

function sanitizeFilenameToken(s: string): string {
  return s.replace(/[^a-z0-9-]/gi, '').slice(0, 50) || 'org'
}

export async function GET(request: NextRequest) {
  const session = await getClientChatbotSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const orgId = session.organization.id

  // P0.3 — Mismo gate que la vista: si el plan no incluye priorización, el CSV
  // se exporta SIN la columna de clasificación. El resto del CSV (datos del
  // contacto) y el audit-log quedan intactos.
  const plan = await getPlanForOrg(orgId)
  const showScoring = planAllows(plan, 'leadScoring')

  const params = new URL(request.url).searchParams
  const statusFilter = parseStatus(params.get('status'))
  const rangeFilter = parseRange(params.get('range'))
  const showingDq = params.get('view') === 'dq'
  const classFilter = parseClass(params.get('class'))

  // En modo DQ el status no aplica (los DQ no se gestionan por status CRM).
  // En modo regular el status sí se filtra. Mismo criterio que la vista.
  const rawLeads = await listLeadsForDashboard(
    orgId,
    {
      status: showingDq ? undefined : statusFilter,
      range: rangeFilter,
      onlyDq: showingDq,
    },
    EXPORT_LIMIT,
  )

  // Score efectivo post-decay (replica de page.tsx). El filtro por clase se
  // aplica en memoria porque depende del decay temporal — igual que la vista.
  const now = new Date()
  const enriched = rawLeads.map((lead) => {
    if (lead.score == null || lead.classification == null) {
      return { ...lead, effectiveClassification: null as LeadForCsv['effectiveClassification'] }
    }
    const eff = getEffectiveScore(
      {
        score: lead.score,
        classification: lead.classification as LeadScoreClassification,
        lastActivityAt: new Date(lead.capturedAt),
      },
      now,
    )
    return {
      ...lead,
      effectiveClassification:
        eff.effectiveClassification as LeadForCsv['effectiveClassification'],
    }
  })

  // Filtro por clase efectiva (solo aplica en modo regular).
  const filteredByClass =
    classFilter === 'all' || showingDq
      ? enriched
      : enriched.filter((l) => l.effectiveClassification === classFilter)

  // EV.5 — resolver verticalPack por botConfigId (1 query para el set de bots únicos).
  // ChatbotLead.signals (Json?) ya viene en los rows desde findMany (campo escalar).
  const uniqueBotConfigIds = [...new Set(filteredByClass.map((l) => l.botConfigId))]
  const botConfigs = await prisma.botConfig.findMany({
    where: { id: { in: uniqueBotConfigIds } },
    select: { id: true, verticalPack: true },
  })
  const packByBotId = new Map(botConfigs.map((b) => [b.id, b.verticalPack]))

  const csvRows: LeadForCsv[] = filteredByClass.map((l) => ({
    name: l.name,
    email: l.email,
    phone: l.phone,
    intent: l.intent,
    message: l.message,
    capturedAt: new Date(l.capturedAt),
    status: l.status,
    effectiveClassification: l.effectiveClassification,
    category: l.category,
    verticalPack: packByBotId.get(l.botConfigId) ?? 'base', // EV.5
    signalsV2: l.signals as LeadForCsv['signalsV2'],         // EV.5
  }))

  const csv = buildLeadsCsv(csvRows, {
    includesDq: showingDq,
    includeClassification: showScoring,
  })

  // Audit log de PII export — trazabilidad. Quién, cuándo, qué filtros, cuántos.
  // El audit NO incluye los datos en sí (sería duplicar PII).
  await logAdminAction({
    userId: session.user.id ?? 'unknown',
    userEmail: session.user.email ?? undefined,
    userName: session.user.name ?? undefined,
    actionType: 'LEADS_EXPORTED',
    action: `Cliente exportó ${csvRows.length} contactos${showingDq ? ' (descartados)' : ''}`,
    targetType: 'Organization',
    targetId: orgId,
    metadata: {
      organizationId: orgId,
      count: csvRows.length,
      filters: {
        status: statusFilter ?? null,
        range: rangeFilter,
        view: showingDq ? 'dq' : null,
        class: classFilter,
      },
      source: 'dashboard_cliente',
    },
  })

  const slug = sanitizeFilenameToken(session.organization.slug)
  const fecha = formatDateForFilename(now)
  const filename = showingDq
    ? `contactos-descartados-${slug}-${fecha}.csv`
    : `contactos-${slug}-${fecha}.csv`

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
