/**
 * Decisión PURA de atribución de un referido — el núcleo anti-abuso, testeable sin DB.
 * El data layer reúne los hechos (código resuelto, emails de la org que refiere, si el
 * email ya es cliente, si ya fue referido) y esta función decide si se atribuye o se
 * rechaza y por qué. Así las guardas quedan explícitas y cubiertas por invariante.
 */

export type AttributionRejectionReason =
  | 'unknown_code' // el código no existe → no atribuir (bloquea códigos falsos)
  | 'self_referral' // el email referido es de la propia org que refiere (auto-referido)
  | 'existing_customer' // el email ya pertenece a un cliente → no es un negocio nuevo
  | 'duplicate' // esta org ya refirió a este email → no inflar con reenvíos

export type AttributionDecision =
  | { attribute: true }
  | { attribute: false; reason: AttributionRejectionReason }

export interface AttributionContext {
  /** ¿El código resolvió a una org que refiere? (lo resuelve el data layer) */
  referrerFound: boolean
  /** Email del negocio referido (entrante). */
  referredEmail: string
  /** Emails de los miembros de la org que refiere (para detectar auto-referido). */
  referrerMemberEmails: readonly string[]
  /** ¿El email referido ya pertenece a un usuario/cliente existente? */
  referredIsExistingCustomer: boolean
  /** ¿Esta org ya tiene un referido registrado para este email? */
  alreadyReferred: boolean
}

const lower = (email: string) => email.trim().toLowerCase()

/**
 * Guardas, en orden de prioridad:
 * 1. unknown_code — sin org que refiere, no hay a quién atribuir.
 * 2. self_referral — el referido es un miembro de la org que refiere (auto-referido).
 * 3. existing_customer — el email ya es cliente (no es un negocio nuevo traído).
 * 4. duplicate — ya se registró este referido para esta org.
 * Si pasa todas → atribuir.
 */
export function decideReferralAttribution(ctx: AttributionContext): AttributionDecision {
  if (!ctx.referrerFound) return { attribute: false, reason: 'unknown_code' }

  const referred = lower(ctx.referredEmail)
  const members = new Set(ctx.referrerMemberEmails.map(lower))
  if (members.has(referred)) return { attribute: false, reason: 'self_referral' }

  if (ctx.referredIsExistingCustomer) return { attribute: false, reason: 'existing_customer' }
  if (ctx.alreadyReferred) return { attribute: false, reason: 'duplicate' }

  return { attribute: true }
}
