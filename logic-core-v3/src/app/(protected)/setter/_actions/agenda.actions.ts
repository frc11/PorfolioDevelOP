'use server'

/**
 * LeadOS B7 — Actions del Paso 10: ofrecer horarios reales y agendar la
 * reunión (booking REAL en el calendario de Franco vía Cal.com v2).
 *
 * Invariantes (no negociables):
 *   - requireSetter() + ownership vía getOwnedLead/getOwnedDossier en TODAS.
 *   - El status se mueve a CALL_AGENDADA SOLO tras el OK de Cal.com, por la
 *     puerta existente (registrarContactoComercial). Si la API falla, el
 *     lead NO avanza y el setter ve el error real.
 *   - Slots re-validados al momento de confirmar (fetch fresco) — jamás se
 *     confía en la oferta vieja.
 *   - Idempotente: claim atómico AGENDANDO antes del booking (patrón B6);
 *     doble click = UN solo booking. Si el registro local falla DESPUÉS del
 *     booking, se compensa cancelando en Cal.com — nada queda mentiroso.
 *   - Notas de traspaso obligatorias (zod) antes de confirmar.
 */
import { ActivityChannel, ActivityResult, LeadStatus } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireSetter } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  cancelBooking,
  createBooking,
  getSlots,
  CalComV2Error,
} from '@/lib/integrations/cal-com-v2'
import {
  elegirTresSlots,
  getCalConfigLeadOS,
  guardarAgendaOwned,
  marcarAgendandoOwned,
  rangoOferta,
  revertirAgendaConfirmadaOwned,
  revertirAgendandoOwned,
  slotSigueLibre,
} from '@/lib/leados/agenda'
import { getOwnedDossier } from '@/lib/leados/dossier'
import { formatFechaHora, parseAgenda, reunionAgendada } from '@/lib/leados/flow'
import { notificarReunionAgendada } from '@/lib/leados/notify'
import { getOwnedLead } from '@/lib/leados/ownership'
import { registrarContactoComercial } from '@/lib/os-commercial'
import type { Agenda } from '@/lib/leados/contracts'
import { LeadIdSchema } from './dossier.schemas'
import { ConfirmarReunionSchema } from './agenda.schemas'

function revalidarSetter(leadId: string) {
  revalidatePath('/setter')
  revalidatePath(`/setter/leads/${leadId}`)
}

/** El booking muta OsLead/activities: el pipeline admin también se refresca. */
function revalidarPipelineAdmin(leadId: string) {
  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  revalidateTag('admin-leads', {})
}

function mapError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof CalComV2Error) {
    return fail(error.message)
  }
  if (error instanceof Error && error.message === 'Unauthorized') {
    return fail('No autorizado')
  }
  // Nunca exponer mensajes internos al cliente.
  return fail(fallback)
}

/**
 * Gate del Paso 10: lead propio, en RESPONDIO (la conversación llegó a
 * "sí, reunámonos" — lo indica el setter, no un trigger automático) y sin
 * reunión ya agendada. Devuelve el dossier para no re-leerlo.
 */
async function gateAgenda(
  leadIdRaw: unknown,
  userId: string,
): Promise<
  | { ok: true; leadId: string }
  | { ok: false; resultado: ActionResult<never> }
> {
  const leadId = LeadIdSchema.safeParse(leadIdRaw)
  if (!leadId.success) return { ok: false, resultado: fail('Lead inválido') }

  const lead = await getOwnedLead(leadId.data, userId)
  if (!lead) return { ok: false, resultado: fail('Lead no encontrado') }
  if (lead.status === LeadStatus.CALL_AGENDADA) {
    return { ok: false, resultado: fail('Este lead ya tiene la reunión agendada') }
  }
  if (lead.status !== LeadStatus.RESPONDIO) {
    return {
      ok: false,
      resultado: fail('Los horarios se ofrecen cuando el negocio respondió y acepta reunirse'),
    }
  }

  const dossier = await getOwnedDossier(leadId.data, userId)
  if (!dossier) return { ok: false, resultado: fail('Lead no encontrado') }
  if (reunionAgendada(parseAgenda(dossier.agendaJson))) {
    return { ok: false, resultado: fail('Este lead ya tiene la reunión agendada') }
  }

  return { ok: true, leadId: leadId.data }
}

/**
 * Paso 10a — Ofrecer horarios: pide los slots REALES de la agenda de Franco
 * (próximos días, huso BA) y devuelve 3 para pasarle al prospecto. Solo
 * lectura: no muta nada. Si falta el setup B7.0, lo dice claro.
 */
export async function ofrecerHorarios(
  leadIdRaw: unknown,
): Promise<ActionResult<{ slots: string[] }>> {
  try {
    const userId = await requireSetter()

    const gate = await gateAgenda(leadIdRaw, userId)
    if (!gate.ok) return gate.resultado

    const config = await getCalConfigLeadOS()
    if (!config.ok) return fail(config.motivo)

    const rango = rangoOferta()
    const slotsPorDia = await getSlots({
      username: config.username,
      eventTypeSlug: config.eventTypeSlug,
      start: rango.start,
      end: rango.end,
    })

    const slots = elegirTresSlots(slotsPorDia)
    if (slots.length === 0) {
      return fail('La agenda de Franco no tiene horarios libres en los próximos días — avisale directo')
    }
    return ok({ slots })
  } catch (error) {
    return mapError(error, 'No se pudieron pedir los horarios')
  }
}

/**
 * Paso 10b — Confirmar la reunión: re-valida el slot AL MOMENTO, toma el
 * claim atómico, crea el booking real en Cal.com (mails nativos + Google
 * Calendar de Franco) y SOLO con el OK encadena la puerta comercial
 * existente (CALL_AGENDADA) + persiste uid y notas de traspaso + Telegram.
 */
export async function confirmarReunion(
  leadIdRaw: unknown,
  inputRaw: unknown,
): Promise<ActionResult<{ slotStart: string }>> {
  try {
    const userId = await requireSetter()

    const gate = await gateAgenda(leadIdRaw, userId)
    if (!gate.ok) return gate.resultado
    const leadId = gate.leadId

    const input = ConfirmarReunionSchema.safeParse(inputRaw)
    if (!input.success) {
      return fail(input.error.issues[0]?.message ?? 'Revisá los datos de la reunión')
    }
    const { slotStart, nombre, email, notasTraspaso } = input.data

    const config = await getCalConfigLeadOS()
    if (!config.ok) return fail(config.motivo)

    // Re-validación fresca del slot elegido: solo el día puntual.
    const dia = slotStart.slice(0, 10)
    const slotsDelDia = await getSlots({
      username: config.username,
      eventTypeSlug: config.eventTypeSlug,
      start: dia,
      end: dia,
    })
    if (!slotSigueLibre(slotsDelDia, slotStart)) {
      return fail('Ese horario se acaba de ocupar — pedí los horarios de nuevo y ofrecé otro')
    }

    // Claim atómico ANTES de llamar a Cal.com: doble click = un solo booking.
    const claim = await marcarAgendandoOwned(leadId, userId)
    if (claim === null) return fail('Lead no encontrado')
    if (claim === 'agendada') return fail('Este lead ya tiene la reunión agendada')
    if (claim === 'agendando') {
      return fail('Ya hay una confirmación en curso para este lead — recargá en unos segundos')
    }

    let bookingUid: string
    try {
      const booking = await createBooking({
        username: config.username,
        eventTypeSlug: config.eventTypeSlug,
        startUtc: new Date(slotStart).toISOString(),
        attendee: { name: nombre, email },
        metadata: { leadId },
      })
      bookingUid = booking.uid
    } catch (error) {
      // Cal.com falló: el claim se libera y el lead NO avanza.
      await revertirAgendandoOwned(leadId, userId).catch(() => undefined)
      return mapError(error, 'Cal.com no pudo crear la reunión — el lead no avanzó, reintentá')
    }

    try {
      const agenda: Agenda = {
        estado: 'AGENDADA',
        calBookingUid: bookingUid,
        slotStart,
        attendee: { nombre, email },
        notasTraspaso,
        agendadaAt: new Date().toISOString(),
      }
      await guardarAgendaOwned(leadId, userId, agenda)

      // La puerta comercial EXISTENTE: mueve a CALL_AGENDADA y frena follow-ups.
      await registrarContactoComercial({
        leadId,
        channel: ActivityChannel.INSTAGRAM_DM,
        result: ActivityResult.CALL_AGENDADA,
        notes: `Reunión agendada vía Cal.com — ${formatFechaHora(slotStart)} · booking ${bookingUid}`,
        performedById: userId,
      })
    } catch (error) {
      // El booking existe pero el registro local falló: se compensa en
      // Cal.com (cancela + mail nativo de cancelación) y se libera el claim.
      // B8A/H1: se revierte tanto el claim AGENDANDO (si guardarAgendaOwned no
      // llegó a escribir) como la agenda ya AGENDADA con ESTE uid (si falló
      // recién en registrarContactoComercial) — antes la segunda quedaba sin
      // limpiar y el lead exhibía una reunión mentirosa.
      await cancelBooking(bookingUid, 'LeadOS no pudo registrar la reunión — reintentar').catch(
        () => undefined,
      )
      await revertirAgendandoOwned(leadId, userId).catch(() => undefined)
      await revertirAgendaConfirmadaOwned(leadId, userId, bookingUid).catch(() => undefined)
      console.error('[b7 confirmarReunion] registro local falló, booking compensado:', error)
      return fail('No se pudo registrar la reunión — el booking se canceló solo, reintentá')
    }

    // Traspaso a Franco — fire-and-forget (notificar* nunca lanza).
    await notificarReunionAgendada(leadId)

    revalidarSetter(leadId)
    revalidarPipelineAdmin(leadId)
    return ok({ slotStart })
  } catch (error) {
    return mapError(error, 'No se pudo agendar la reunión')
  }
}
