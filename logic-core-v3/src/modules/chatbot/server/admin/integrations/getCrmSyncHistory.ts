import { forOrg } from '@/lib/isolation'
import { getEffectiveSyncStatus } from '@/modules/chatbot/server/crm'
import type { CrmSyncStatus } from '@prisma/client'
import { requireSuperAdmin } from '@/modules/chatbot/server/admin/requireSuperAdmin'

export interface SyncHistoryEntry {
  id: string
  leadId: string
  /** Status efectivo: PENDING/RETRYING viejos se reportan como FAILED. */
  status: CrmSyncStatus
  rawStatus: CrmSyncStatus
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

export async function getLeadSyncHistory(
  organizationId: string,
  leadId: string,
): Promise<
  | { ok: true; entries: SyncHistoryEntry[] }
  | { ok: false; error: string }
> {
  await requireSuperAdmin()

  const attempts = await forOrg(organizationId).crmSyncAttempt.findMany({
    where: { leadId },
    orderBy: { attemptedAt: 'desc' },
    take: 20,
    select: ATTEMPT_SELECT,
  })

  return { ok: true, entries: attempts.map(toEntry) }
}

export interface OrgSyncHistoryQuery {
  organizationId: string
  cursor?: string
  limit?: number
  statusFilter?: CrmSyncStatus
}

export async function getOrgSyncHistory(query: OrgSyncHistoryQuery): Promise<
  | { ok: true; entries: SyncHistoryEntry[]; nextCursor: string | null }
  | { ok: false; error: string }
> {
  await requireSuperAdmin()

  const { organizationId } = query
  const limit = Math.min(Math.max(query.limit ?? 20, 1), 100)
  const scope = forOrg(organizationId)

  // El helper prohíbe `cursor` (ancla por unique global → oráculo cross-org).
  // Se reemplaza por paginación KEYSET scoped sobre (attemptedAt, id): se
  // resuelve el ancla DENTRO de la org y se filtra por la tupla ordenada.
  const anchor = query.cursor
    ? await scope.crmSyncAttempt.findFirst({
        where: { id: query.cursor },
        select: { attemptedAt: true, id: true },
      })
    : null

  const attempts = await scope.crmSyncAttempt.findMany({
    where: {
      ...(query.statusFilter ? { status: query.statusFilter } : {}),
      ...(anchor
        ? {
            OR: [
              { attemptedAt: { lt: anchor.attemptedAt } },
              { attemptedAt: anchor.attemptedAt, id: { lt: anchor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ attemptedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: ATTEMPT_SELECT,
  })

  const hasMore = attempts.length > limit
  const page = hasMore ? attempts.slice(0, limit) : attempts
  const nextCursor = hasMore ? page[page.length - 1].id : null

  return { ok: true, entries: page.map(toEntry), nextCursor }
}
