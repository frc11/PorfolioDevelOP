/**
 * Simple in-memory rate limiter.
 *
 * MVP scope:
 * - Stored in a single Map (per Node.js process).
 * - Cold starts reset the state (acceptable for MVP traffic levels).
 * - Multiple serverless instances run independently — a determined
 *   attacker can bypass by hitting different instances. Mitigation:
 *   move to Upstash Redis in Phase 1.5+.
 *
 * Defaults: 10 messages per minute per identifier (ipHash).
 */

interface Bucket {
  count: number
  resetAt: number  // epoch ms
}

const buckets = new Map<string, Bucket>()

const DEFAULT_LIMIT = 10
const DEFAULT_WINDOW_MS = 60_000  // 1 minute

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(identifier)

  // Reset window expired
  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs }
    buckets.set(identifier, fresh)
    return { allowed: true, remaining: limit - 1, resetAt: fresh.resetAt }
  }

  // Within window
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  }
}

/**
 * Test-only: resets the in-memory state.
 */
export function resetRateLimits(): void {
  buckets.clear()
}
