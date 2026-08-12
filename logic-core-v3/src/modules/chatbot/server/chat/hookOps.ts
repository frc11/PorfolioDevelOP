/**
 * MS-E6.2 — Plomería de los hooks del stream con techo de tiempo
 * (DEADLINE-ONFINISH).
 *
 * Movido VERBATIM desde `handleChatRequest.ts` (costura A del refactor). Cero
 * cambio de comportamiento: `runHookOp` y `phaseOutcome` son puras (no tocan
 * DB ni estado del request; reciben la operación ya construida por el llamador).
 */
import {
  isDeadlineExceeded,
  withDeadline,
  DeadlineExceededError,
  type LateSettleInfo,
} from './withDeadline'

/** Desenlace de una operación corrida con deadline. `ok:false` NO se lanza. */
export type HookOpResult<T> =
  | { ok: true; value: T; ms: number }
  | { ok: false; error: unknown; timedOut: boolean; noBudget: boolean; ms: number }

/** Desenlace de una fase, para el log agregado `chat.onfinish_phases`. */
export type PhaseOutcome = 'ok' | 'deadline' | 'error' | 'skipped' | 'no_budget'

export interface PhaseRecord {
  ms: number
  outcome: PhaseOutcome
}

/**
 * Por qué NO se reintentó la persistencia. `null` = se reintentó (o no hizo
 * falta). Sin este campo, "no reintenté" y "reintenté y falló" serían
 * indistinguibles en el log — y son diagnósticos opuestos.
 */
export type RetrySkipReason = 'deadline' | 'budget' | 'max_attempts' | null

/**
 * Corre una operación de hook con techo de tiempo y NUNCA lanza: devuelve el
 * desenlace para que el llamador decida. El bucle de persistencia necesita
 * distinguir `timedOut` (cuelgue abandonado → NO reintentar, ya retuvo una
 * conexión del pool) de un error real de Prisma (transitorio → sí reintentar).
 *
 * `deadlineMs <= 0` (presupuesto agotado) NO arranca la operación: disparar una
 * query para abandonarla en el mismo tick cuesta una conexión del pool a cambio
 * de nada.
 */
export async function runHookOp<T>(
  label: string,
  deadlineMs: number,
  start: () => Promise<T>,
  onLateSettle?: (info: LateSettleInfo) => void,
): Promise<HookOpResult<T>> {
  if (deadlineMs <= 0) {
    return {
      ok: false,
      error: new DeadlineExceededError(label, 0),
      timedOut: true,
      noBudget: true,
      ms: 0,
    }
  }
  const startedAt = Date.now()
  try {
    const value = await withDeadline(
      start(),
      deadlineMs,
      label,
      onLateSettle ? { onLateSettle } : undefined,
    )
    return { ok: true, value, ms: Date.now() - startedAt }
  } catch (error) {
    return {
      ok: false,
      error,
      timedOut: isDeadlineExceeded(error),
      noBudget: false,
      ms: Date.now() - startedAt,
    }
  }
}

/** Traduce el desenlace de una operación a la etiqueta que va al log de fases. */
export function phaseOutcome<T>(result: HookOpResult<T>): PhaseOutcome {
  if (result.ok) return 'ok'
  if (result.noBudget) return 'no_budget'
  return result.timedOut ? 'deadline' : 'error'
}
