'use server'

import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { listLocationsForOrg, setActiveLocationForOrg } from '@/lib/integrations/gbp-connection'
import type { AvailableLocation, ConnectionStatus } from '@/lib/integrations/gbp-connection-logic'
import { type ActionResult, SetActiveLocationSchema } from './schemas'

// Ruta real del módulo de reseñas en el panel del cliente — se revalida tras fijar la location.
const REVIEWS_MODULE_PATH = '/dashboard/modules/motor-resenas'

/**
 * P3-A.1 — Servicio server para el selector de location de P3-A.2. Deriva la org de la
 * SESIÓN (nunca de un parámetro): un cliente solo lista las locations de SU org (anti-IDOR).
 * SUPER_ADMIN no tiene organizationId → no puede usarlo; es self-service del dueño.
 */
export async function listAvailableLocations(): Promise<ActionResult<AvailableLocation[]>> {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  if (!organizationId) return { success: false, error: 'Sesión inválida.' }

  try {
    const data = await listLocationsForOrg(organizationId)
    return { success: true, data }
  } catch (error) {
    console.error('listAvailableLocations error:', error)
    return { success: false, error: 'No se pudieron listar las ubicaciones.' }
  }
}

/**
 * P3-A.1 — Servicio server para fijar la location activa (P3-A.2). Org de la SESIÓN + Zod +
 * validación de pertenencia server-side (`setActiveLocationForOrg` re-descubre con los tokens
 * de la propia org). Anti-IDOR: jamás acepta orgId por parámetro.
 */
export async function setActiveLocation(
  locationId: string,
): Promise<ActionResult<{ status: ConnectionStatus }>> {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  if (!organizationId) return { success: false, error: 'Sesión inválida.' }

  const parsed = SetActiveLocationSchema.safeParse({ locationId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    const result = await setActiveLocationForOrg(organizationId, parsed.data.locationId)
    if (!result.ok) return { success: false, error: result.error }

    revalidatePath(REVIEWS_MODULE_PATH)
    return { success: true, data: { status: result.status } }
  } catch (error) {
    console.error('setActiveLocation error:', error)
    return { success: false, error: 'No se pudo fijar la ubicación.' }
  }
}
