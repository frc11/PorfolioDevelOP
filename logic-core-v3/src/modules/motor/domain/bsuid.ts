/**
 * Detección de formato de identificadores de usuario de la Cloud API (B1-S1).
 *
 * Desde jun-2026 Meta migra la identidad del usuario de WhatsApp del teléfono
 * (E.164 sin '+') al BSUID (Business-Scoped User ID): código de país ISO de
 * 2 letras + '.' + hasta 128 alfanuméricos (ej. "AR.1a2b3c"). Datos
 * verificados del sprint:
 *   - `user_id` (BSUID) viene SIEMPRE en los webhooks de mensaje.
 *   - `wa_id`/`from` HOY suelen traer teléfono pero PUEDEN traer un BSUID.
 *   - El teléfono puede NO venir (username sin interacción en 30 días).
 * Regla absoluta: PROHIBIDO asumir E.164 — todo identificador se clasifica
 * por formato antes de usarse.
 */
export const BSUID_PATTERN = /^[A-Z]{2}\.[A-Za-z0-9]{1,128}$/

/** Teléfono estilo Cloud API: solo dígitos, sin '+' (ej. "5491122334455"). */
const PHONE_PATTERN = /^\d{5,20}$/

export type ContactAddressKind = 'bsuid' | 'phone' | 'unknown'

export function isBsuid(value: string): boolean {
  return BSUID_PATTERN.test(value)
}

export function isPhoneLike(value: string): boolean {
  return PHONE_PATTERN.test(value)
}

/**
 * Clasifica un identificador de contacto del payload (wa_id / from /
 * recipient_id). 'unknown' no se trata como teléfono: mejor una identidad
 * sin waId que un waId basura que rompa la reconciliación futura.
 */
export function classifyContactAddress(raw: string): ContactAddressKind {
  if (isBsuid(raw)) return 'bsuid'
  if (isPhoneLike(raw)) return 'phone'
  return 'unknown'
}
