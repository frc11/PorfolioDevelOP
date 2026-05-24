/**
 * B5.3 — Validador de teléfono argentino. Helper reusable.
 *
 * Filosofía: permisivo con formatos REALES, estricto solo contra placeholders
 * y prefijos internacionales no-AR. La regla de oro del sprint es "no
 * descartar números válidos por ser estricta de más", así que cualquier
 * combinación razonable de espacios, guiones, paréntesis, código país,
 * código de área, 9 móvil o no, 0 inicial o no, debe pasar.
 *
 * Acepta (todos los formatos del manual real de AR):
 *   +54 9 11 1234-5678       móvil internacional con 9
 *   +54 11 1234-5678         fijo internacional sin 9
 *   +54 9 381 555-1234       móvil interior (código área 3 dígitos)
 *   +54 2944 12-3456         interior (código área 4 dígitos)
 *   011 1234-5678            local con 0
 *   11 1234-5678             móvil/fijo CABA sin 0
 *   0381 555-1234            interior con 0
 *   381 555-1234             interior sin 0
 *   1234-5678                local sin código área (raro pero válido)
 *   (011) 4567-8900          con paréntesis
 *   +54-11-1234-5678         con guiones en todo
 *
 * Rechaza:
 *   < 7 dígitos          → muy corto para cualquier número AR
 *   > 14 dígitos         → más largo que +5491112345678 + un dígito
 *   Todos iguales        → 0000000, 1111111, etc. (placeholders)
 *   Secuencias triviales → 1234567(89), 7654321
 *   Prefijo +XX no-AR    → +1, +44, +55, etc.
 */

const MIN_DIGITS = 7
const MAX_DIGITS = 14

// Sólo placeholders evidentes — secuencias completas 0-9 o 9-0.
// `12345678` / `123456789` quedaron AFUERA: un local AR de 8 dígitos sin
// código de área puede coincidir con ese patrón sin ser placeholder
// (la regla del sprint es "no descartar números válidos por ser estricta
// de más"). Para los placeholders obvios queda el resto de checks.
const TRIVIAL_SEQUENCES = ['0123456789', '987654321', '9876543210']

export interface PhoneValidationResult {
  valid: boolean
  reason?:
    | 'too_short'
    | 'too_long'
    | 'all_same_digit'
    | 'trivial_sequence'
    | 'non_argentine_prefix'
    | 'empty'
}

export function validateArgentinePhone(raw: string | null | undefined): PhoneValidationResult {
  if (!raw) return { valid: false, reason: 'empty' }
  const trimmed = raw.trim()
  if (trimmed.length === 0) return { valid: false, reason: 'empty' }

  // Si arranca con `+`, debe ser `+54` (Argentina). Tolera espacio después del +.
  if (trimmed.startsWith('+')) {
    const normalized = trimmed.replace(/^\+\s*/, '+')
    if (!normalized.startsWith('+54')) {
      return { valid: false, reason: 'non_argentine_prefix' }
    }
  }

  // Quitar todo lo que no sea dígito (espacios, guiones, paréntesis, +).
  const digits = trimmed.replace(/\D/g, '')

  if (digits.length < MIN_DIGITS) return { valid: false, reason: 'too_short' }
  if (digits.length > MAX_DIGITS) return { valid: false, reason: 'too_long' }

  // Todos los dígitos iguales (000..., 111...).
  if (/^(\d)\1+$/.test(digits)) return { valid: false, reason: 'all_same_digit' }

  // Secuencias triviales — buscamos si la versión "core" del número
  // (sin código país 54) coincide con un placeholder ascendente/descendente.
  const core = digits.startsWith('54') ? digits.slice(2) : digits
  if (TRIVIAL_SEQUENCES.includes(core)) return { valid: false, reason: 'trivial_sequence' }

  return { valid: true }
}

/** Versión booleana para el path crítico del scoring. */
export function isValidArgentinePhone(raw: string | null | undefined): boolean {
  return validateArgentinePhone(raw).valid
}
