// Reglas puras de estado de leads del chatbot (P1.B). ISOMÓRFICO: sin 'use
// server', sin imports server-only, solo `import type` de Prisma (se borra en
// runtime). Por eso lo pueden importar TANTO el server action (`updateLeadStatus`)
// COMO el componente client (`LeadStatusActions`) sin cruzar el boundary de Next.
//
// Acá vive la lógica que se testea sin DB: el mapeo de las acciones de DUEÑO a
// los valores del enum, la regla de sellado de `firstContactedAt`, y el gate de
// pertenencia (anti-IDOR). El server action las consume; el invariant las verifica.

import type { ChatbotLeadStatus } from '@prisma/client'

/**
 * Las tres acciones de UN TAP en lenguaje de dueño (NO jerga de CRM) y su estado
 * destino en el enum `ChatbotLeadStatus`. El enum tiene además NEW (inicial) e
 * IN_NEGOTIATION (vía el Select del detalle), que NO son acciones rápidas.
 *
 *   "Lo contacté" → CONTACTED
 *   "Vendido"     → WON
 *   "No avanzó"   → LOST
 */
export type OwnerLeadAction = 'contacted' | 'sold' | 'no_progress'

export const OWNER_ACTION_STATUS = {
  contacted: 'CONTACTED',
  sold: 'WON',
  no_progress: 'LOST',
} as const satisfies Record<OwnerLeadAction, ChatbotLeadStatus>

/**
 * Estados que IMPLICAN que hubo contacto con el lead. Todo lo que no es NEW
 * significa que el dueño ya lo tocó (lo contactó, está negociando, lo vendió o
 * no avanzó) → sella el primer contacto. NEW es el único estado "sin tocar".
 */
export function statusImpliesContact(status: ChatbotLeadStatus): boolean {
  return status !== 'NEW'
}

/**
 * Decide si esta transición debe SELLAR `firstContactedAt` con la hora actual.
 *
 * Regla central del sprint: el primer contacto es un dato HISTÓRICO e INMUTABLE
 * (alimenta la métrica de velocidad de respuesta). Se sella la PRIMERA vez que
 * el lead pasa a un estado que implica contacto, y los taps siguientes NO lo
 * pisan. Como esta función nunca devuelve true cuando ya hay un timestamp, y el
 * action solo SETEA (jamás escribe null), "deshacer" (volver a NEW) preserva el
 * primer contacto automáticamente.
 *
 * @param nextStatus estado al que se transiciona
 * @param currentFirstContactedAt valor actual en DB (null = aún sin sellar)
 */
export function shouldSealFirstContact(
  nextStatus: ChatbotLeadStatus,
  currentFirstContactedAt: Date | null,
): boolean {
  return statusImpliesContact(nextStatus) && currentFirstContactedAt == null
}

/**
 * Gate de pertenencia (anti-IDOR) a nivel dato: el lead solo es operable si su
 * organización coincide con la de la sesión. Sesión sin org (null) nunca opera.
 * Mismo criterio que `resolveScopedOrgId` pero a nivel "este lead es tuyo".
 *
 * @param leadOrgId organizationId resuelto del lead (vía botConfig)
 * @param sessionOrgId organizationId de la sesión actual
 */
export function leadBelongsToOrg(
  leadOrgId: string | null | undefined,
  sessionOrgId: string | null | undefined,
): boolean {
  if (!sessionOrgId || !leadOrgId) return false
  return leadOrgId === sessionOrgId
}
