'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSetter } from '@/lib/auth-guards'
import { fail, ok, toErrorMessage, type ActionResult } from '@/lib/action-utils'
import { ownedLeadCreateData } from '@/lib/leados/isolation'
import { NuevoProspectoSchema } from './prospecto.schemas'

/**
 * Sprint A.1 — Alta de un prospecto PROPIO del setter (la SEGUNDA fuente de leads,
 * junto a la asignación de Franco). El lead entra FRÍO, en FICHA, asignado al
 * setter de la SESIÓN. De ahí lo evalúa (descarte/avance) como cualquier otro.
 *
 * Aislamiento (invariante #1, lado escritura): el dueño lo deriva
 * `ownedLeadCreateData` del `userId` de `requireSetter()` — jamás de un campo del
 * cliente. El `z.object` ya descartó cualquier `assignedToId`/`caliente` inyectado;
 * el builder lo vuelve a forzar (anti-IDOR de escritura). Verificado por
 * `alta-propia.invariant.ts`. El setter NO marca caliente: lo fuerza `false`.
 */
export async function cargarProspecto(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireSetter()
    const parsed = NuevoProspectoSchema.parse(input)

    const lead = await prisma.osLead.create({
      data: ownedLeadCreateData(parsed, userId),
      select: { id: true },
    })

    // Entra a la cartera/foco del setter (cola `trabajar`) y a la lista de Franco.
    // El home del setter es force-dynamic; revalidamos por prolijidad y refrescamos
    // la vista del admin.
    revalidatePath('/setter')
    revalidatePath('/admin/leados')

    return ok({ id: lead.id })
  } catch (error) {
    return fail(toErrorMessage(error, 'No se pudo cargar el prospecto'))
  }
}
