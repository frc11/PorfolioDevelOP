import { createHmac, timingSafeEqual } from 'crypto'

// Secret HMAC para los tokens de unsubscribe del executive report. Si la env
// var dedicada no está, caemos a AUTH_SECRET (que el proyecto exige como
// REQUERIDA). De esa forma los tokens funcionan en dev sin agregar config.
function getSecret(): string {
  const secret =
    process.env.EMAIL_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim()
  if (!secret) {
    throw new Error(
      '[unsubscribe-token] EMAIL_UNSUBSCRIBE_SECRET (o AUTH_SECRET) no configurada',
    )
  }
  return secret
}

// Namespacing del HMAC: si en el futuro firmamos otros payloads, no colisionan.
const SCOPE = 'executive-report:unsubscribe:v1'

/**
 * Firma un token corto para unsubscribe de 1 click. El orgId viaja en la URL
 * como query param — el token solo garantiza que NO se puede dar de baja a
 * otra org sin saber el secret.
 */
export function signUnsubscribeToken(organizationId: string): string {
  const mac = createHmac('sha256', getSecret())
    .update(`${SCOPE}:${organizationId}`)
    .digest('base64url')
  // 32 chars de base64url ~ 192 bits — suficiente para resistir brute-force,
  // corto para que el link entre bien en un email.
  return mac.slice(0, 32)
}

/**
 * Verifica un token contra el orgId esperado. `timingSafeEqual` para evitar
 * timing attacks.
 */
export function verifyUnsubscribeToken(
  organizationId: string,
  token: string,
): boolean {
  if (!token || typeof token !== 'string') return false
  const expected = signUnsubscribeToken(organizationId)
  if (expected.length !== token.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token))
  } catch {
    return false
  }
}

/**
 * URL absoluta de unsubscribe lista para meter en el email. Usa
 * NEXT_PUBLIC_APP_URL (también consumido por el resto de los emails).
 */
export function buildUnsubscribeUrl(organizationId: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  )
  const token = signUnsubscribeToken(organizationId)
  return `${base}/api/email/unsubscribe-executive?org=${encodeURIComponent(
    organizationId,
  )}&token=${token}`
}

// ============================================================
// Opt-out POR CONTACTO del módulo email-marketing.
// Mismo mecanismo HMAC que arriba, pero con un SCOPE distinto: un token de
// opt-out NO sirve para el unsubscribe del executive report aunque el
// identificador coincida. El token cierra el IDOR del endpoint
// `/api/email/optout/[contactId]`: sin un token válido NO se actúa sobre
// ningún contacto y el contactId crudo deja de ser una llave de acción.
// ============================================================

const CONTACT_OPTOUT_SCOPE = 'email-contact:optout:v1'

/**
 * Firma un token corto, opaco y por-contacto para el link "Darme de baja" de
 * las campañas de email-marketing. NO se persiste: es un HMAC determinístico
 * del `contactId`, así que no requiere columna nueva en el modelo. Sin el
 * secret no se puede forjar para ningún `contactId`.
 */
export function signEmailContactOptOutToken(contactId: string): string {
  const mac = createHmac('sha256', getSecret())
    .update(`${CONTACT_OPTOUT_SCOPE}:${contactId}`)
    .digest('base64url')
  return mac.slice(0, 32)
}

/**
 * Verifica un token contra el `contactId` esperado. `timingSafeEqual` para
 * evitar timing attacks. El chequeo es PURO (no toca la DB), así que un token
 * inválido se rechaza sin revelar si el contacto existe (cero enumeración).
 */
export function verifyEmailContactOptOutToken(
  contactId: string,
  token: string,
): boolean {
  if (!token || typeof token !== 'string') return false
  const expected = signEmailContactOptOutToken(contactId)
  if (expected.length !== token.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token))
  } catch {
    return false
  }
}

/**
 * URL absoluta de baja por-contacto. En el envío real por Brevo el link se
 * arma con merge tags por destinatario (`{{contact.CONTACT_ID}}` /
 * `{{contact.OPTOUT_TOKEN}}`); este helper documenta la forma del link y lo
 * consumen los tests.
 */
export function buildEmailContactOptOutUrl(contactId: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  )
  const token = signEmailContactOptOutToken(contactId)
  return `${base}/api/email/optout/${encodeURIComponent(contactId)}?token=${token}`
}
