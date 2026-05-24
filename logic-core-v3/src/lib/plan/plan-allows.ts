/**
 * B4.2 — Helper `planAllows(plan, feature)`.
 *
 * Función pura — sin side effects, sin queries — que mapea
 * (plan efectivo, feature key) → boolean. La usa el gating del bot y la
 * van a usar las features de otras superficies (B4.4 admin UI, reportes,
 * insights, CRM) para gatekeep sin duplicar lógica.
 *
 * Para checks complejos que necesitan más contexto (ej. "¿puede usar
 * esta tool específica?") usar `plan.tools.includes(slug)` directo.
 * Este helper cubre las dimensiones boolean del plan (5, 6, 7 de B4.1).
 */
import type { EffectivePlan } from './fallback'

export type PlanFeatureKey = 'reports' | 'insight' | 'crm'

export function planAllows(plan: EffectivePlan, feature: PlanFeatureKey): boolean {
  switch (feature) {
    case 'reports':
      return plan.reportsEnabled
    case 'insight':
      return plan.insightEnabled
    case 'crm':
      return plan.crmEnabled
  }
}
