/**
 * B4.1 / B4.2 — Default seguro de plan.
 *
 * Lo que `getPlanForOrg()` devuelve cuando una org no tiene `planId`
 * asignado (Subscription sin plan, o sin Subscription siquiera).
 *
 * Decisión lockeada (memoria del proyecto):
 *   "Org sin plan asignado: comportamiento mínimo funcional (equivalente
 *    a Starter), NUNCA bot apagado ni todo gratis. Un bot muerto en una
 *    demo es peor que uno limitado."
 *
 * Este NO es un plan asignado: es un fallback virtual. Tiene la misma
 * shape que un row de `Plan` para que el runtime lo trate igual, pero
 * `id === null` y `isFallback === true` lo distinguen en logs/telemetría.
 *
 * Los valores son ESPEJO del plan STARTER sembrado en
 * `prisma/seeds/sync-plans.ts`. Si cambia STARTER (raro), actualizar acá
 * en paralelo — la constante existe aún cuando la DB esté caída y eso
 * es deseable.
 */
import type { PlanKey, SupportTier } from '@prisma/client'

export type EffectivePlan = {
  /** `null` cuando es fallback (no proviene de la tabla Plan). */
  id: string | null
  key: PlanKey
  name: string
  monthlyPrice: number
  setupFloorPrice: number
  quota: number
  llmModel: string
  tools: string[]
  /** `null` = uso justo / sin cap explícito. */
  maxDomains: number | null
  reportsEnabled: boolean
  insightEnabled: boolean
  crmEnabled: boolean
  supportTier: SupportTier
  active: boolean
  /** `true` cuando es el fallback virtual (no hay plan real asignado). */
  isFallback: boolean
}

export const PLAN_FALLBACK: EffectivePlan = {
  id: null,
  key: 'STARTER',
  name: 'Starter (fallback)',
  monthlyPrice: 49,
  setupFloorPrice: 700,
  quota: 500,
  llmModel: 'gemini-2.5-flash',
  // CONTACT-PATH — `confirm_contact_request` va también en el fallback: es el
  // único tool que hace que el camino "que me contacten" cierre con texto (su
  // `execute` fuerza el step final). Sin él acá, una org sin plan real
  // reproduciría el bug. Espejo de STARTER_TOOLS en `prisma/seeds/sync-plans.ts`.
  tools: ['capture_lead', 'show_whatsapp_handoff', 'confirm_contact_request'],
  maxDomains: 1,
  reportsEnabled: false,
  insightEnabled: false,
  crmEnabled: false,
  supportTier: 'STANDARD',
  active: true,
  isFallback: true,
}
