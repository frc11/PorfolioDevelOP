import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { getEffectiveSyncStatus } from '@/modules/chatbot/server/crm'
import type { CrmSyncStatus } from '@prisma/client'

/**
 * B5.8 — Lectura del historial de syncs a CRM.
 *
 * Dos modos:
 *   - getLeadSyncHistory(leadId) → todos los attempts de un lead (max 20).
 *     Usado en LeadDetail para mostrar trazabilidad por lead.
 *   - getOrgSyncHistory({ cursor, limit }) → historial paginado de la org.
 *     Usado en CrmIntegrationCard (settings) para ver el panorama global.
 *
 * Multi-tenant: ambas queries filtran por organizationId resuelto del session.
 * Imposible leer attempts de otra org.
 *
 * PENDING zombie: cada attempt pasa por getEffectiveSyncStatus antes de salir,
 * así un PENDING/RETRYING viejo (>5min) se reporta como FAILED a la UI sin
 * necesidad de un cron que actualice la DB.
 */

export interface SyncHistoryEntry {
  id: string
  leadId: string
  /** Status efectivo: PENDING/RETRYING viejos se reportan como FAILED. */
  status: CrmSyncStatus
  rawStatus: CrmSyncStatus // status crudo en DB (para debug si hace falta)
  attemptNumber: number
  httpStatus: number | null
  errorMessage: string | null
  attemptedAt: Date
  completedAt: Date | null
  durationMs: number | null
}

interface AttemptRow {
  id: string
  leadId: string
  status: CrmSyncStatus
  attemptNumber: number
  httpStatus: number | null
  errorMessage: string | null
  attemptedAt: Date
  completedAt: Date | null
  durationMs: number | null
}

function toEntry(attempt: AttemptRow): SyncHistoryEntry {
  return {
    id: attempt.id,
    leadId: attempt.leadId,
    status: getEffectiveSyncStatus(attempt),
    rawStatus: attempt.status,
    attemptNumber: attempt.attemptNumber,
    httpStatus: attempt.httpStatus,
    errorMessage: attempt.errorMessage,
    attemptedAt: attempt.attemptedAt,
    completedAt: attempt.completedAt,
    durationMs: attempt.durationMs,
  }
}

const ATTEMPT_SELECT = {
  id: true,
  leadId: true,
  status: true,
  attemptNumber: true,
  httpStatus: true,
  errorMessage: true,
  attemptedAt: true,
  completedAt: true,
  durationMs: true,
} as const

/**
 * Historial de un lead específico. Verifica multi-tenant: el lead debe
 * pertenecer a la org actual.
 */
export async function getLeadSyncHistory(leadId: string): Promise<{
  ok: true
  entries: SyncHistoryEntry[]
} | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'No autenticado' }

  const orgId = await resolveOrgId()
  if (!orgId) return { ok: false, error: 'Sin organización' }

  // Filtro doble: leadId + organizationId denormalizado en la tabla.
  const attempts = await prisma.crmSyncAttempt.findMany({
    where: {
      leadId,
      organizationId: orgId,
    },
    orderBy: { attemptedAt: 'desc' },
    take: 20,
    select: ATTEMPT_SELECT,
  })

  return { ok: true, entries: attempts.map(toEntry) }
}

export interface OrgSyncHistoryQuery {
  cursor?: string
  limit?: number
  statusFilter?: CrmSyncStatus
}

/**
 * Historial global de la org, paginado por cursor (id del último attempt visto).
 */
export async function getOrgSyncHistory(query: OrgSyncHistoryQuery = {}): Promise<{
  ok: true
  entries: SyncHistoryEntry[]
  nextCursor: string | null
} | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user) return { ok: false, error: 'No autenticado' }

  const orgId = await resolveOrgId()
  if (!orgId) return { ok: false, error: 'Sin organización' }

  const limit = Math.min(Math.max(query.limit ?? 20, 1), 100)

  const attempts = await prisma.crmSyncAttempt.findMany({
    where: {
      organizationId: orgId,
      ...(query.statusFilter ? { status: query.statusFilter } : {}),
    },
    orderBy: { attemptedAt: 'desc' },
    take: limit + 1, // +1 para detectar nextCursor sin segunda query
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    select: ATTEMPT_SELECT,
  })

  const hasMore = attempts.length > limit
  const page = hasMore ? attempts.slice(0, limit) : attempts
  const nextCursor = hasMore ? page[page.length - 1].id : null

  return { ok: true, entries: page.map(toEntry), nextCursor }
}
