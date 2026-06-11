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

export type PlanFeatureKey = 'reports' | 'insight' | 'crm' | 'leadScoring'

export function planAllows(plan: EffectivePlan, feature: PlanFeatureKey): boolean {
  switch (feature) {
    case 'reports':
      return plan.reportsEnabled
    case 'insight':
      return plan.insightEnabled
    case 'crm':
      return plan.crmEnabled
    // P0.3 — La clasificación de leads (caliente/tibio/frío + score) se vende
    // como feature de Pro y Business. NO existe una columna dedicada en el modelo
    // `Plan` y este sprint NO agrega migraciones: la dimensión se mapea sobre el
    // flag `insightEnabled`, que ya es exactamente {Starter:false, Pro:true,
    // Business:true} — la misma población comercial. Es presentación, no cómputo:
    // el scoring se sigue computando y guardando para todos los planes; este gate
    // solo decide si se MUESTRA. Si en el futuro hay que desacoplarla de "insight",
    // se cambia esta única línea (o se agrega la columna en su propia migración).
    case 'leadScoring':
      return plan.insightEnabled
  }
}
