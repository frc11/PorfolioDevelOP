'use server'

import { revalidatePath } from 'next/cache'
import { requireSetter } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { marcarNovedadesVistas } from '@/lib/leados/novedades'

/**
 * Marca como vistas TODAS las novedades sin leer del setter de la sesión.
 *
 * Aislamiento: la acción NO recibe ids del cliente — el destinatario es el
 * `userId` de la sesión (`requireSetter`), así que un setter solo puede marcar
 * las SUYAS (anti-IDOR trivial: nada del cliente alcanza la fila de otro).
 */
export async function marcarNovedadesVistasAction(): Promise<
  ActionResult<{ marcadas: number }>
> {
  try {
    const userId = await requireSetter()
    const marcadas = await marcarNovedadesVistas(userId)
    revalidatePath('/setter')
    return ok({ marcadas })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'No se pudieron marcar las novedades',
    )
  }
}
