/**
 * Actualización de estado de un mensaje OUT a partir del webhook de statuses
 * (B1-S1, paso g). Reglas:
 *   - Solo aplica sobre mensajes OUT propios (dirección + scope de la org).
 *   - Monotónico: SENT → DELIVERED → READ. Un status tardío o repetido
 *     (retry del BSP, entrega fuera de orden) se descarta como 'stale' en
 *     vez de retroceder el estado.
 *   - FAILED es terminal y aplica desde cualquier estado NO terminal; guarda
 *     el detalle del error del BSP (código/título/mensaje, truncado).
 *   - Los status `failed` llegan SIN bloque contacts (dato verificado) — este
 *     handler no depende de contacts en ningún caso.
 */
import type { MotorMessageStatus } from '@prisma/client'
import type { OrgScope } from '@/lib/isolation'
import type { StatusEvent, StatusEventError } from './payload'

const STATUS_MAP: Readonly<Record<string, MotorMessageStatus>> = {
  sent: 'SENT',
  delivered: 'DELIVERED',
  read: 'READ',
  failed: 'FAILED',
}

// Progresión del pipeline OUT. FAILED/RECEIVED no rankean: FAILED es
// terminal (se maneja aparte) y RECEIVED es exclusivo de los IN.
const STATUS_RANK: Readonly<Partial<Record<MotorMessageStatus, number>>> = {
  PENDING: 0,
  SENT: 1,
  DELIVERED: 2,
  READ: 3,
}

const ERROR_DETAIL_MAX_LENGTH = 500

export type StatusUpdateOutcome = 'applied' | 'unknown-message' | 'unsupported-status' | 'stale'

export async function handleStatusUpdate(scope: OrgScope, status: StatusEvent): Promise<StatusUpdateOutcome> {
  const next = STATUS_MAP[status.status]
  if (next === undefined) return 'unsupported-status'

  const message = await scope.motorMessage.findFirst({
    where: { providerMessageId: status.id, direction: 'OUT' },
    select: { id: true, status: true },
  })
  if (message === null) return 'unknown-message'
  if (message.status === 'FAILED') return 'stale'

  if (next === 'FAILED') {
    await scope.motorMessage.update(message.id, { status: next, error: formatStatusError(status.errors) })
    return 'applied'
  }

  const currentRank = STATUS_RANK[message.status]
  const nextRank = STATUS_RANK[next]
  if (currentRank !== undefined && nextRank !== undefined && nextRank <= currentRank) {
    return 'stale'
  }
  await scope.motorMessage.update(message.id, { status: next })
  return 'applied'
}

function formatStatusError(errors: readonly StatusEventError[] | undefined): string {
  const first = errors?.[0]
  if (first === undefined) return 'failed (el BSP no envió detalle de error)'
  const parts = [
    first.code !== undefined ? `code ${first.code}` : null,
    first.title ?? null,
    first.message ?? null,
  ].filter((part): part is string => part !== null)
  const detail = parts.length > 0 ? parts.join(' — ') : 'failed (el BSP no envió detalle de error)'
  return detail.slice(0, ERROR_DETAIL_MAX_LENGTH)
}
