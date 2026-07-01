/**
 * Utilidades PURAS del código de referido (formato, normalización, link). Sin DB, sin
 * randomness propia: la generación recibe el sufijo aleatorio como argumento para poder
 * testear la forma del código sin depender del reloj ni de crypto.
 */

/** Query param del link de referido: `/contact?ref=CODE`. */
export const REFERRAL_CODE_PARAM = 'ref'

const CODE_PREFIX_LEN = 6
const FALLBACK_PREFIX = 'DEVOP'

/** Deja solo A-Z0-9 en mayúsculas. Idempotente. */
export function normalizeReferralCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/**
 * Arma un código candidato a partir del nombre/slug de la org + un sufijo aleatorio
 * (que provee el caller). Prefijo legible (para que el dueño reconozca "es el mío") +
 * sufijo para unicidad. Todo A-Z0-9, sin guiones (normalización simple del lado entrante).
 */
export function generateReferralCodeCandidate(orgNameOrSlug: string, randomSuffix: string): string {
  const prefix = normalizeReferralCode(orgNameOrSlug).slice(0, CODE_PREFIX_LEN) || FALLBACK_PREFIX
  return `${prefix}${normalizeReferralCode(randomSuffix)}`
}

/** Link compartible del referido. `baseUrl` sin barra final. */
export function buildReferralLink(baseUrl: string, code: string): string {
  const trimmed = baseUrl.replace(/\/+$/, '')
  return `${trimmed}/contact?${REFERRAL_CODE_PARAM}=${encodeURIComponent(code)}`
}
