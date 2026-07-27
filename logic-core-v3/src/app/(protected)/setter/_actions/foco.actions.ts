'use server'

/**
 * LeadOS 2.1a — Actions del FOCO (sticky D7). Mismas invariantes que el resto de
 * las actions del setter:
 *   - requireSetter() en TODAS.
 *   - ownership puntual vía getOwnedLead ANTES de tocar nada (anti-IDOR): solo se
 *     ancla un lead de la cartera PROPIA.
 *   - solo escribe la cookie del foco (preferencia de navegación). NO toca
 *     status/stage/reactivateAt: el foco PRESENTA y CALCULA, no transiciona.
 *
 * "Pausar" (snooze) y "terminar" (trabajar el lead en el detalle) ya existen:
 * el snooze vive en `cartera.actions.ts#pausarLead` y la terminación es el flujo
 * del wizard. Acá solo manejamos el anclaje del sticky.
 */
import { cookies } from 'next/headers'
import { requireSetter } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { getOwnedLead } from '@/lib/leados/ownership'
import { FOCO_COOKIE_NAME, FOCO_COOKIE_OPTIONS } from '@/lib/leados/foco-cookie'
import { LeadIdSchema } from './dossier.schemas'

function mapError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof Error && error.message === 'Unauthorized') {
    return fail('No autorizado')
  }
  // Nunca exponer mensajes internos al cliente.
  return fail(fallback)
}

/**
 * Ancla un lead como foco (el que el setter va a trabajar). Valida auth +
 * pertenencia antes de escribir la cookie: no se puede anclar un lead ajeno.
 */
export async function anclarFoco(leadIdRaw: unknown): Promise<ActionResult<void>> {
  try {
    const userId = await requireSetter()
    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const lead = await getOwnedLead(leadId.data, userId)
    if (!lead) return fail('Lead no encontrado')

    const jar = await cookies()
    jar.set(FOCO_COOKIE_NAME, leadId.data, FOCO_COOKIE_OPTIONS)
    return ok(undefined)
  } catch (error) {
    return mapError(error, 'No se pudo fijar el foco')
  }
}

/** Suelta el foco anclado: el próximo render vuelve a elegir la cima de la cola. */
export async function soltarFoco(): Promise<ActionResult<void>> {
  try {
    await requireSetter()
    const jar = await cookies()
    jar.delete(FOCO_COOKIE_NAME)
    return ok(undefined)
  } catch (error) {
    return mapError(error, 'No se pudo soltar el foco')
  }
}
