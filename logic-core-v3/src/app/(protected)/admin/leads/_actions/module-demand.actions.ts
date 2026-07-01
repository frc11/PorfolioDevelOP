'use server'

import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { ok, fail, type ActionResult } from '@/lib/action-utils'
import {
  rankModuleDemand,
  serializeModuleDemand,
  type ModuleDemandRow,
  type SerializedModuleDemand,
} from '@/lib/modules/demand'

/**
 * Demanda medida (P5.2). Agrega los `OrganizationModule` con `upsellRequestCount > 0`
 * para que develOP lea, ordenado, QUÉ módulos piden los clientes — el verdadero valor
 * del sprint: qué construir/ofrecer después, dejando de mezclar los upsells con el
 * resto de los leads inbound.
 *
 * Admin-only: el ranking cruza organizaciones a propósito (no es una superficie de
 * tenant), y queda detrás de `requireSuperAdmin()` — verificación de rol en la propia
 * action, no solo en el layout.
 */
export async function listModuleDemand(): Promise<ActionResult<SerializedModuleDemand[]>> {
  try {
    await requireSuperAdmin()

    const rows = await prisma.organizationModule.findMany({
      where: { upsellRequestCount: { gt: 0 } },
      select: {
        moduleId: true,
        organizationId: true,
        upsellRequestCount: true,
        upsellLastRequestedAt: true,
        organization: { select: { companyName: true } },
        module: { select: { slug: true, name: true, status: true } },
      },
    })

    const demandRows: ModuleDemandRow[] = rows.map((row) => ({
      moduleId: row.moduleId,
      slug: row.module.slug,
      name: row.module.name,
      status: row.module.status,
      organizationId: row.organizationId,
      organizationName: row.organization.companyName,
      upsellRequestCount: row.upsellRequestCount,
      upsellLastRequestedAt: row.upsellLastRequestedAt,
    }))

    return ok(rankModuleDemand(demandRows).map(serializeModuleDemand))
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'No se pudo cargar la demanda de módulos.')
  }
}
