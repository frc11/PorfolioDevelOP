import { createHash } from 'crypto'
import { headers } from 'next/headers'
import { checkRateLimit, type RateLimitResult } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'

// Re-exporto para compatibilidad con imports históricos del módulo.
export { RATE_LIMIT_PRESETS as AUTH_RATE_LIMITS }

// Sólo los presets aplicables a auth — el resto (chatbot) vive en el mismo
// objeto centralizado pero no se expone como scope válido acá.
type AuthRateLimitScope = Extract<
  keyof typeof RATE_LIMIT_PRESETS,
  | 'forgotPasswordPerIp'
  | 'forgotPasswordPerEmail'
  | 'resetPasswordPerIp'
  | 'resendCredentialsPerAdmin'
  | 'sendExecutiveReportNowPerAdmin'
>

export type AuthRateLimitOutcome =
  | { allowed: true; remaining: number; retryAfterSeconds: 0 }
  | { allowed: false; remaining: 0; retryAfterSeconds: number }

function hashIdentifier(scope: string, raw: string): string {
  // No queremos IPs ni emails en claro dentro de la tabla.
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
  scope: AuthRateLimitScope
  identifier: string
}

export async function applyAuthRateLimit(
  input: AuthRateLimitInput,
): Promise<AuthRateLimitOutcome> {
  const preset = RATE_LIMIT_PRESETS[input.scope]
  const key = hashIdentifier(input.scope, input.identifier)
  const result = await checkRateLimit({
    key,
    limit: preset.limit,
    windowMs: preset.windowMs,
  })
  return toOutcome(result)
}
