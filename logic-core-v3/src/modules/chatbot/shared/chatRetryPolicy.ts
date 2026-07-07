/**
 * INFRA.2 — Política PURA de reintento del widget para el cold-start de Neon (branch
 * free). Un fallo transitorio (red / timeout / 5xx) suele ser la DB dormida: el 2º
 * request pega contra la DB ya despierta. Estas funciones deciden QUÉ reintentar y CON
 * QUÉ backoff, sin efectos (ni fetch ni reloj), para poder testearlas con el idioma
 * invariante del repo. El closure del transport en `useChatbot.ts` las orquesta.
 *
 * Reglas duras:
 *  - Reintentar SOLO transitorios: error de red y HTTP 5xx.
 *  - NUNCA reintentar 4xx (validación, y 429: se respeta su Retry-After por NO
 *    martillar, no como retry ciego).
 *  - Acotado: máximo CHAT_RETRY_MAX_ATTEMPTS intentos (1 + reintentos). Un request
 *    exitoso no reintenta.
 */

/** Resultado clasificado de un intento de fetch al endpoint de chat. */
export type FetchOutcome =
  | { kind: 'network-error' }
  | { kind: 'server-error'; status: number } // 5xx → transitorio
  | { kind: 'client-error'; status: number; retryAfterMs: number | null } // 4xx incl. 429 → NO retry
  | { kind: 'success'; status: number } // 2xx (incluye el 200 con JSON degradado del backend)

/** 1 intento inicial + 2 reintentos. */
export const CHAT_RETRY_MAX_ATTEMPTS = 3

/** Backoff antes del reintento nº k (k = intentos ya hechos). */
export const CHAT_RETRY_BACKOFFS_MS = [2000, 4000] as const

/** ¿El outcome es transitorio (candidato a reintento)? */
export function isTransientOutcome(outcome: FetchOutcome): boolean {
  return outcome.kind === 'network-error' || outcome.kind === 'server-error'
}

/**
 * ¿Reintentar? Solo si el outcome es transitorio Y queda presupuesto de intentos.
 * `attemptsMade` = cuántos intentos se hicieron ya (incluye el que produjo `outcome`).
 */
export function shouldRetry(
  outcome: FetchOutcome,
  attemptsMade: number,
  maxAttempts: number = CHAT_RETRY_MAX_ATTEMPTS,
): boolean {
  return attemptsMade < maxAttempts && isTransientOutcome(outcome)
}

/**
 * Backoff en ms antes del próximo reintento, dado cuántos intentos se hicieron ya.
 * Clampa al último valor del schedule si se pidiera un índice más allá.
 */
export function backoffForAttempt(
  attemptsMade: number,
  schedule: readonly number[] = CHAT_RETRY_BACKOFFS_MS,
): number {
  return schedule[attemptsMade - 1] ?? schedule[schedule.length - 1]
}

/** Parsea el header `Retry-After` en segundos → ms. Devuelve null si no es un número
 *  válido (p. ej. un HTTP-date, que no manejamos porque igual no reintentamos 4xx). */
export function parseRetryAfterMs(header: string | null): number | null {
  if (!header) return null
  const seconds = Number(header)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : null
}

/** Clasifica un status HTTP en un `FetchOutcome`. */
export function classifyStatus(status: number, retryAfter: string | null): FetchOutcome {
  if (status >= 500) return { kind: 'server-error', status }
  if (status >= 400) return { kind: 'client-error', status, retryAfterMs: parseRetryAfterMs(retryAfter) }
  return { kind: 'success', status }
}
