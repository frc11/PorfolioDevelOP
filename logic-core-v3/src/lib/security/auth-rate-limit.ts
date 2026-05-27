import { createHash } from 'crypto'
import { headers } from 'next/headers'
import { checkRateLimit, type RateLimitResult } from '@/modules/chatbot/server/rate-limit/inMemoryLimiter'

// Presets pensados para endpoints de auth. Se afinan con datos reales.
export const AUTH_RATE_LIMITS = {
  // Solicitud de reset (público): protege contra spam de "olvidé contraseña"
  forgotPasswordPerIp: { limit: 5, windowMs: 15 * 60_000 },
  forgotPasswordPerEmail: { limit: 3, windowMs: 60 * 60_000 },
  // Completar reset (público): protege contra brute force del token
  resetPasswordPerIp: { limit: 10, windowMs: 15 * 60_000 },
  // Admin: re-envío de credenciales
  resendCredentialsPerAdmin: { limit: 10, windowMs: 60 * 60_000 },
} as const

export type AuthRateLimitOutcome =
  | { allowed: true; remaining: number; retryAfterSeconds: 0 }
  | { allowed: false; remaining: 0; retryAfterSeconds: number }

function hashIdentifier(scope: string, raw: string): string {
  // No queremos IPs ni emails en claro dentro del Map del proceso.
  return `${scope}:${createHash('sha256').update(raw.toLowerCase()).digest('hex').slice(0, 24)}`
}

function toOutcome(result: RateLimitResult): AuthRateLimitOutcome {
  if (result.allowed) {
    return { allowed: true, remaining: result.remaining, retryAfterSeconds: 0 }
  }
  const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
  return { allowed: false, remaining: 0, retryAfterSeconds }
}

export async function getClientIpHash(): Promise<string> {
  const headersList = await headers()
  const fwd = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
  const real = headersList.get('x-real-ip')?.trim()
  const ip = fwd || real || 'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24)
}

export interface AuthRateLimitInput {
  scope: keyof typeof AUTH_RATE_LIMITS
  identifier: string
}

export function applyAuthRateLimit(input: AuthRateLimitInput): AuthRateLimitOutcome {
  const preset = AUTH_RATE_LIMITS[input.scope]
  const key = hashIdentifier(input.scope, input.identifier)
  const result = checkRateLimit(key, preset.limit, preset.windowMs)
  return toOutcome(result)
}
