import type { OrganizationModuleStatus, PremiumModuleStatus } from '@prisma/client'

/**
 * Estado de un módulo del catálogo tal como lo ve UNA organización en su vitrina.
 *
 * - `owned`      → la org ya lo tiene contratado (ACTIVE) o pausado (PAUSED). No se
 *                  ofrece contratar: ya es suyo (honestidad P5.2).
 * - `available`  → módulo vendible (catálogo ACTIVE) que la org todavía no tiene.
 * - `coming_soon`→ módulo en construcción (catálogo COMING_SOON). No es contratable;
 *                  solo admite registrar interés ("avisame cuando esté" = demanda medida).
 */
export type ShowroomState = 'owned' | 'available' | 'coming_soon'

/**
 * Clasifica UN módulo del catálogo para UNA org a partir de dos señales: el estado
 * del catálogo (global) y el estado del módulo EN esa org (o `null` si no lo tiene).
 *
 * Reglas, en orden:
 * 1. La tenencia gana sobre todo: ACTIVE/PAUSED en la org → `owned`. Nunca ofrecer
 *    contratar algo que el cliente ya tiene (aunque esté pausado).
 * 2. Un `OrganizationModule` INACTIVE es DEMANDA (una solicitud de upsell registrada),
 *    NO tenencia → no cuenta como `owned`. CANCELLED tampoco (puede recontratarse).
 * 3. Sin tenencia: COMING_SOON → `coming_soon`; el resto (ACTIVE del catálogo) → `available`.
 *
 * Función pura: solo ve las señales de ESTA org. No puede cruzar tenant (anti-IDOR
 * estructural): el estado de otra org jamás entra a este cálculo.
 */
export function classifyModuleState(
  catalogStatus: PremiumModuleStatus,
  orgModuleStatus: OrganizationModuleStatus | null | undefined,
): ShowroomState {
  if (orgModuleStatus === 'ACTIVE' || orgModuleStatus === 'PAUSED') return 'owned'
  if (catalogStatus === 'COMING_SOON') return 'coming_soon'
  return 'available'
}

/** Mínimo que necesita un módulo del catálogo para clasificarse. */
export interface CatalogModuleLike {
  id: string
  status: PremiumModuleStatus
}

/** Las tres secciones de la vitrina, ya agrupadas. */
export interface Showroom<T extends CatalogModuleLike> {
  owned: T[]
  available: T[]
  comingSoon: T[]
}

/**
 * Agrupa el catálogo en las tres secciones de la vitrina para una org.
 *
 * `orgStatusByModuleId` es el conjunto de módulos de ESA org (mapa moduleId → estado).
 * La función nunca consulta otras orgs, así que estructuralmente no puede filtrar datos
 * de otro tenant. Preserva el orden de entrada dentro de cada grupo (el catálogo llega
 * ordenado por `sortOrder`).
 */
export function buildShowroom<T extends CatalogModuleLike>(
  catalog: readonly T[],
  orgStatusByModuleId: ReadonlyMap<string, OrganizationModuleStatus>,
): Showroom<T> {
  const owned: T[] = []
  const available: T[] = []
  const comingSoon: T[] = []

  for (const mod of catalog) {
    const state = classifyModuleState(mod.status, orgStatusByModuleId.get(mod.id) ?? null)
    if (state === 'owned') owned.push(mod)
    else if (state === 'coming_soon') comingSoon.push(mod)
    else available.push(mod)
  }

  return { owned, available, comingSoon }
}
