import type { CrmSyncStatus } from '@prisma/client'

/**
 * B5.8 — PENDING zombie resolution.
 *
 * Si el proceso muere entre crear un CrmSyncAttempt PENDING y marcar SUCCESS/FAILED
 * (cold start cortando after(), proceso killed, exception no atrapada, etc.), el
 * attempt quedaría eternamente como PENDING y la UI lo mostraría "sincronizando"
 * para siempre.
 *
 * En vez de un cron que barra zombies, lo resolvemos EN LECTURA: cualquier attempt
 * en PENDING/RETRYING cuyo attemptedAt es más viejo que SYNC_STALE_THRESHOLD_MS
 * se considera FAILED (stale). Mismo patrón que el decay del score (B5.4).
 *
 * El umbral es ajustable. 5 min cubre el peor escenario realista: 3 reintentos con
 * backoff 1s + 3s + timeout ~10s c/u ≈ 33s. 5 min es ~10x margen.
 */
export const SYNC_STALE_THRESHOLD_MS = 5 * 60 * 1000

interface AttemptForStatus {
  status: CrmSyncStatus
  attemptedAt: Date
}

export function getEffectiveSyncStatus(
  attempt: AttemptForStatus,
  now: Date = new Date()
): CrmSyncStatus {
  if (attempt.status !== 'PENDING' && attempt.status !== 'RETRYING') {
    return attempt.status
  }
  const elapsed = now.getTime() - attempt.attemptedAt.getTime()
  if (elapsed > SYNC_STALE_THRESHOLD_MS) {
    return 'FAILED'
  }
  return attempt.status
}

export function isStaleSync(
  attempt: AttemptForStatus,
  now: Date = new Date()
): boolean {
  if (attempt.status !== 'PENDING' && attempt.status !== 'RETRYING') {
    return false
  }
  return now.getTime() - attempt.attemptedAt.getTime() > SYNC_STALE_THRESHOLD_MS
}
