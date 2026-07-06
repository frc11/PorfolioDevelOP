import type { ConnectionStatus } from '@/lib/integrations/gbp-connection-logic'

/**
 * P3-A.2 — Resolución PURA de la vista del módulo motor-resenas (módulo × conexión).
 *
 * Módulo PURO, cero prisma/next (el import de arriba es type-only: se borra en build
 * y en tsx) — único import del invariante (`motor-resenas-view.invariant.ts`), igual
 * que `showroom.ts` con `modules.invariant.ts`.
 *
 * El cliente ve exactamente UNO de estos tres estados:
 * - `locked`      → NO tiene el módulo contratado. Superficie de venta (LockedView).
 * - `connecting`  → tiene el módulo, pero la conexión GBP todavía no está operativa
 *                   (develOP la hace a mano; cubre NOT_CONNECTED y CONNECTED_NO_LOCATION
 *                   sin distinción — para el dueño es la misma verdad y no es su problema).
 * - `operational` → módulo contratado + conexión OPERATIONAL → vista operativa real.
 *
 * NUNCA se muestra la vista operativa vacía cuando en realidad falta que develOP
 * termine de conectar — eso sería mentira, no degradación honesta.
 */
export type MotorResenasView = 'locked' | 'connecting' | 'operational'

export interface MotorResenasViewInput {
  /** `isModuleActive(orgId, 'motor-resenas')` — tenencia ACTIVE en la org. */
  moduleActive: boolean
  /** `deriveConnectionStatus({ gbpConnectedAt, gbpLocationId })` — estado unificado P3-A.1. */
  connection: ConnectionStatus
}

/**
 * Reglas, en orden:
 * 1. Sin módulo → `locked` gana a TODO: el gating comercial manda sobre el técnico
 *    (aunque la org tenga GBP operativo, sin contratar no hay vista operativa).
 * 2. Con módulo pero conexión no operativa → `connecting`.
 * 3. Resto (módulo + OPERATIONAL) → `operational`.
 *
 * Función pura: solo ve las dos señales de ESTA org (ya org-scoped por sus fuentes).
 */
export function resolveMotorResenasView(input: MotorResenasViewInput): MotorResenasView {
  if (!input.moduleActive) return 'locked'
  if (input.connection !== 'OPERATIONAL') return 'connecting'
  return 'operational'
}
