import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

/**
 * State firmado para flujos OAuth (Tiendanube, Google Business Profile, etc).
 *
 * Modelo de amenaza que cierra (SEC-AUTH-01/02, B11 C1/F3):
 * un atacante autenticado con una cuenta OAuth propia que reemplaza el
 * `state` en la URL de callback por el `orgId` de una org víctima, asociando
 * sus tokens a esa org. Sin firma, el callback no podía distinguir un state
 * legítimo emitido por nuestro `start` de uno construido a mano.
 *
 * Replica el patrón de `lib/email/unsubscribe-token.ts` (HMAC-SHA256 + secret
 * de env, fallback a AUTH_SECRET), extendido con nonce y expiry porque el
 * payload de un flujo OAuth no es estático como el de un unsubscribe.
 *
 * Formato del state: `<payload>.<sig>`
 *   - payload = base64url(JSON.stringify({ o: orgId, n: nonce, e: expiresAt }))
 *   - sig     = base64url(HMAC-SHA256(secret, `${scope}:${payload}`)).slice(0, 32)
 *
 * No persistimos nonces consumidos: el flow es SUPER_ADMIN-only, el TTL es
 * corto (10 min), y el modelo de amenaza es anti state-swap, no anti-replay.
 */

const STATE_TTL_MS = 10 * 60 * 1000

function getSecret(): string {
  const secret =
    process.env.OAUTH_STATE_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim()
  if (!secret) {
    throw new Error(
      '[oauth-state] OAUTH_STATE_SECRET (o AUTH_SECRET) no configurada',
    )
  }
  return secret
}

function sign(scope: string, payload: string): string {
  return createHmac('sha256', getSecret())
    .update(`${scope}:${payload}`)
    .digest('base64url')
    .slice(0, 32)
}

/**
 * Firma un state para un OAuth flow. `scope` namespacea por integración
 * (`'tiendanube:v1'`, `'google-business:v1'`) — un state firmado para una
 * integración no es reutilizable para otra.
 */
export function signOAuthState(scope: string, organizationId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      o: organizationId,
      n: randomBytes(16).toString('hex'),
      e: Date.now() + STATE_TTL_MS,
    }),
  ).toString('base64url')
  return `${payload}.${sign(scope, payload)}`
}

export type VerifyResult =
  | { valid: true; organizationId: string }
  | { valid: false; reason: 'malformed' | 'bad_signature' | 'expired' | 'bad_payload' }

/**
 * Verifica el state recibido del callback. Devuelve `valid: true` con el
 * `organizationId` extraído SOLO si la firma valida y el state no expiró.
 *
 * El caller debe rechazar el callback en cualquier `valid: false` antes de
 * tocar la DB. NUNCA usar el `state` crudo sin pasar por esta función.
 */
export function verifyOAuthState(scope: string, state: unknown): VerifyResult {
  if (typeof state !== 'string' || state.length === 0) {
    return { valid: false, reason: 'malformed' }
  }

  const dot = state.indexOf('.')
  if (dot <= 0 || dot === state.length - 1) {
    return { valid: false, reason: 'malformed' }
  }

  const payload = state.slice(0, dot)
  const sig = state.slice(dot + 1)
  const expected = sign(scope, payload)

  if (expected.length !== sig.length) {
    return { valid: false, reason: 'bad_signature' }
  }

  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
      return { valid: false, reason: 'bad_signature' }
    }
  } catch {
    return { valid: false, reason: 'bad_signature' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return { valid: false, reason: 'bad_payload' }
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof (parsed as { o?: unknown }).o !== 'string' ||
    typeof (parsed as { e?: unknown }).e !== 'number'
  ) {
    return { valid: false, reason: 'bad_payload' }
  }

  const { o: organizationId, e: expiresAt } = parsed as { o: string; e: number }
  if (Date.now() > expiresAt) {
    return { valid: false, reason: 'expired' }
  }

  return { valid: true, organizationId }
}
