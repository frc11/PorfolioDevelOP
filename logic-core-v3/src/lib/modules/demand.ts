import type { PremiumModuleStatus } from '@prisma/client'

/**
 * "Demanda medida" (P5.2): cada solicitud de un módulo (incluidos los COMING_SOON,
 * vía el CTA "avisame cuando esté") queda registrada en `OrganizationModule`. Este
 * módulo agrega esas filas para que develOP lea, ordenado, QUÉ construir/ofrecer
 * después. Es lógica pura y admin-only (el ranking cruza orgs a propósito: no es una
 * superficie de tenant, se sirve detrás de `requireSuperAdmin`).
 */

/** Una fila cruda: un `OrganizationModule` con demanda (upsellRequestCount > 0). */
export interface ModuleDemandRow {
  moduleId: string
  slug: string
  name: string
  status: PremiumModuleStatus
  organizationId: string
  organizationName: string
  upsellRequestCount: number
  upsellLastRequestedAt: Date | null
}

/** Demanda agregada de UN módulo, lista para rankear. */
export interface ModuleDemand {
  moduleId: string
  slug: string
  name: string
  status: PremiumModuleStatus
  /** Cuántas organizaciones distintas lo pidieron. Señal PRINCIPAL: deduplicada por
   *  org (una org = una unidad de demanda), robusta al rage-click de un solo cliente. */
  distinctOrgs: number
  /** Suma de solicitudes. Señal SECUNDARIA de intensidad (puede inflarse con clicks). */
  totalRequests: number
  /** Última vez que alguien lo pidió (o null si ninguna fila tiene fecha). */
  lastRequestedAt: Date | null
  /** Orgs que lo pidieron, más recientes primero. */
  organizations: Array<{
    organizationId: string
    organizationName: string
    requestCount: number
    lastRequestedAt: Date | null
  }>
}

/** Versión serializada (Dates → ISO) para cruzar el límite server → client. */
export interface SerializedModuleDemand {
  moduleId: string
  slug: string
  name: string
  status: PremiumModuleStatus
  distinctOrgs: number
  totalRequests: number
  lastRequestedAt: string | null
  organizations: Array<{
    organizationId: string
    organizationName: string
    requestCount: number
    lastRequestedAt: string | null
  }>
}

/** `a` es más reciente que `b`; los `null` van al final. */
function moreRecent(a: Date | null, b: Date | null): number {
  if (a && b) return b.getTime() - a.getTime()
  if (a) return -1
  if (b) return 1
  return 0
}

/** El más reciente de dos fechas (o el que exista; `null` si ninguna). */
function maxDate(a: Date | null, b: Date | null): Date | null {
  if (!a) return b
  if (!b) return a
  return a.getTime() >= b.getTime() ? a : b
}

/**
 * Agrega y rankea la demanda por módulo.
 *
 * Orden del ranking: más orgs distintas primero (interés real y ancho), luego más
 * solicitudes totales (intensidad), luego nombre A→Z (desempate estable y determinista).
 * Dentro de cada módulo, las orgs se ordenan por última solicitud (más reciente primero),
 * con más solicitudes como desempate.
 *
 * Pura y determinista: mismas filas → mismo resultado. No lee reloj ni DB.
 */
export function rankModuleDemand(rows: readonly ModuleDemandRow[]): ModuleDemand[] {
  const byModule = new Map<string, ModuleDemand>()

  for (const row of rows) {
    const existing = byModule.get(row.moduleId)
    const orgEntry = {
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      requestCount: row.upsellRequestCount,
      lastRequestedAt: row.upsellLastRequestedAt,
    }

    if (existing) {
      existing.distinctOrgs += 1
      existing.totalRequests += row.upsellRequestCount
      existing.lastRequestedAt = maxDate(existing.lastRequestedAt, row.upsellLastRequestedAt)
      existing.organizations.push(orgEntry)
    } else {
      byModule.set(row.moduleId, {
        moduleId: row.moduleId,
        slug: row.slug,
        name: row.name,
        status: row.status,
        distinctOrgs: 1,
        totalRequests: row.upsellRequestCount,
        lastRequestedAt: row.upsellLastRequestedAt,
        organizations: [orgEntry],
      })
    }
  }

  const ranked = Array.from(byModule.values())

  for (const demand of ranked) {
    demand.organizations.sort(
      (a, b) => moreRecent(a.lastRequestedAt, b.lastRequestedAt) || b.requestCount - a.requestCount,
    )
  }

  ranked.sort(
    (a, b) =>
      b.distinctOrgs - a.distinctOrgs ||
      b.totalRequests - a.totalRequests ||
      a.name.localeCompare(b.name),
  )

  return ranked
}

/** Serializa una demanda agregada (Dates → ISO) para pasarla a un componente. */
export function serializeModuleDemand(demand: ModuleDemand): SerializedModuleDemand {
  return {
    moduleId: demand.moduleId,
    slug: demand.slug,
    name: demand.name,
    status: demand.status,
    distinctOrgs: demand.distinctOrgs,
    totalRequests: demand.totalRequests,
    lastRequestedAt: demand.lastRequestedAt?.toISOString() ?? null,
    organizations: demand.organizations.map((org) => ({
      organizationId: org.organizationId,
      organizationName: org.organizationName,
      requestCount: org.requestCount,
      lastRequestedAt: org.lastRequestedAt?.toISOString() ?? null,
    })),
  }
}
