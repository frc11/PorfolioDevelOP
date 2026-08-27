'use server'

/**
 * LeadOS B-beta — Actions de organización de la cartera del setter: fijar,
 * pausar (snooze personal) y la nota propia. Invariantes (no negociables, mismo
 * patrón que las actions de outreach):
 *   - requireSetter() en TODAS.
 *   - ownership puntual vía getOwnedLead ANTES de tocar nada (anti-IDOR): el
 *     setter sólo organiza leads de SU cartera.
 *   - el meta se escribe SIEMPRE keyed por (leadId, setterId) — un setter no
 *     puede pisar la organización de otro ni leer su nota.
 *   - esto NO toca status/reactivateAt comerciales. POSTERGAR es otra cosa y se
 *     llama distinto a propósito: lo pide el NEGOCIO («contactame el 25»), mueve
 *     `status`+`reactivateAt` del lead —lo ve el admin, lo levanta el cron— y
 *     vive en `os-commercial.ts#postergarLead`. Esto de acá es la PAUSA personal:
 *     privada del setter, no toca el lead, el cron no la mira. Dos palabras para
 *     dos cosas; cada una tiene su filtro en la cartera (`vistaDeLead`).
 */
import { revalidatePath } from 'next/cache'
import { requireSetter } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { getOwnedLead } from '@/lib/leados/ownership'
import { upsertSetterMeta } from '@/lib/leados/setter-meta'
import { LeadIdSchema } from './dossier.schemas'
import { finDePausaAR, NotaSchema, PinSchema, SnoozeSchema } from './cartera.schemas'

function mapError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof Error && error.message === 'Unauthorized') {
    return fail('No autorizado')
  }
  // Nunca exponer mensajes internos al cliente.
  return fail(fallback)
}

/**
 * Resuelve auth + ownership de un lead de la cartera. Devuelve el contexto listo
 * o un error ya formateado. `requireSetter()` tira si no hay sesión válida — el
 * caller lo atrapa en su try/catch.
 */
async function resolverLeadPropio(
  leadIdRaw: unknown,
): Promise<
  { ok: true; userId: string; leadId: string } | { ok: false; error: string }
> {
  const userId = await requireSetter()
  const leadId = LeadIdSchema.safeParse(leadIdRaw)
  if (!leadId.success) return { ok: false, error: 'Lead inválido' }
  const lead = await getOwnedLead(leadId.data, userId)
  if (!lead) return { ok: false, error: 'Lead no encontrado' }
  return { ok: true, userId, leadId: leadId.data }
}

/** Fija o suelta un lead en la cartera del setter (flota arriba mientras esté fijado). */
export async function fijarLead(
  leadIdRaw: unknown,
  pinnedRaw: unknown,
): Promise<ActionResult<{ pinned: boolean }>> {
  try {
    const pin = PinSchema.safeParse(pinnedRaw)
    if (!pin.success) return fail('Valor inválido')

    const owned = await resolverLeadPropio(leadIdRaw)
    if (!owned.ok) return fail(owned.error)

    await upsertSetterMeta(owned.leadId, owned.userId, { pinned: pin.data })
    revalidatePath('/setter')
    return ok({ pinned: pin.data })
  } catch (error) {
    return mapError(error, 'No se pudo fijar el lead')
  }
}

/**
 * Pausa personal hasta la fecha elegida (inclusive): la guarda como fin de ese
 * día, así el lead reaparece recién al día siguiente. NO mueve el status
 * comercial — es la vista privada del setter, sólo él la ve.
 */
export async function pausarLead(
  leadIdRaw: unknown,
  hastaRaw: unknown,
): Promise<ActionResult<{ snoozedUntil: string }>> {
  try {
    const hasta = SnoozeSchema.safeParse(hastaRaw)
    if (!hasta.success) {
      return fail(hasta.error.issues[0]?.message ?? 'Elegí una fecha válida')
    }
    // Fin del día elegido → pausado durante toda esa fecha, retoma al siguiente.
    // El borde sale de la hora ARGENTINA (`finDePausaAR`), no del huso del proceso:
    // el `new Date('...T23:59:59')` que estaba acá se parsea en hora local, así que
    // daba lo correcto en la máquina de Franco y tres horas antes en el servidor.
    // `null` = día de calendario imposible (31-feb), que el regex de SnoozeSchema
    // deja pasar; cae en la misma rama que antes tomaba el `Invalid Date`.
    const until = finDePausaAR(hasta.data)
    if (until === null || until.getTime() <= Date.now()) {
      return fail('Elegí una fecha futura para la pausa')
    }

    const owned = await resolverLeadPropio(leadIdRaw)
    if (!owned.ok) return fail(owned.error)

    await upsertSetterMeta(owned.leadId, owned.userId, { snoozedUntil: until })
    revalidatePath('/setter')
    return ok({ snoozedUntil: until.toISOString() })
  } catch (error) {
    return mapError(error, 'No se pudo pausar el lead')
  }
}

/** Reanuda un lead pausado: lo vuelve a su cola natural ya mismo. */
export async function reanudarLead(
  leadIdRaw: unknown,
): Promise<ActionResult<void>> {
  try {
    const owned = await resolverLeadPropio(leadIdRaw)
    if (!owned.ok) return fail(owned.error)

    await upsertSetterMeta(owned.leadId, owned.userId, { snoozedUntil: null })
    revalidatePath('/setter')
    return ok(undefined)
  } catch (error) {
    return mapError(error, 'No se pudo reanudar el lead')
  }
}

/** Guarda (o borra, con texto vacío) la nota privada del setter sobre el lead. */
export async function guardarNota(
  leadIdRaw: unknown,
  notaRaw: unknown,
): Promise<ActionResult<{ note: string | null }>> {
  try {
    const nota = NotaSchema.safeParse(notaRaw)
    if (!nota.success) {
      return fail(nota.error.issues[0]?.message ?? 'Revisá la nota')
    }
    const note = nota.data.trim() === '' ? null : nota.data.trim()

    const owned = await resolverLeadPropio(leadIdRaw)
    if (!owned.ok) return fail(owned.error)

    await upsertSetterMeta(owned.leadId, owned.userId, { note })
    revalidatePath('/setter')
    return ok({ note })
  } catch (error) {
    return mapError(error, 'No se pudo guardar la nota')
  }
}
