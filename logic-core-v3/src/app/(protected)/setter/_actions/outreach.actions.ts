'use server'

/**
 * LeadOS B6 — Actions de outreach del setter (pasos 7 y 9 del flujo).
 *
 * Invariantes (no negociables):
 *   - requireSetter() + ownership vía getOwnedLead/getOwnedDossier en TODAS.
 *   - La lógica comercial NO vive acá: vive en lib/os-commercial — la MISMA
 *     que usan las actions admin. El setter no inventa cálculos de fechas ni
 *     movidas de status; acá solo se valida QUIÉN y CUÁNDO.
 *   - Solo el contacto real al prospecto genera OsLeadActivity (el cron lee
 *     activities[0] como "último contacto" — no se ensucia ese orden).
 *   - El envío del link: SOLO con gateEnvioDemo (respondió o caliente +
 *     APROBADA + finalUrl), idempotente vía el claim de dossier.enviadaAt.
 */
import { ActivityChannel, ActivityResult } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireSetter } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  DossierTransitionError,
  getOwnedDossier,
  marcarDemoEnviadaOwned,
  revertirDemoEnviadaOwned,
} from '@/lib/leados/dossier'
import { copyOperativo } from '@/lib/leados/error-copy'
import { gateEnvioDemo, leadRespondio } from '@/lib/leados/flow'
import { contarDmsHoy, listOwnedLeadActivities } from '@/lib/leados/outreach'
import { getOwnedLead } from '@/lib/leados/ownership'
import { leadActivo } from '@/lib/leados/revision'
import {
  crearDemoComercial,
  postergarLead,
  registrarContactoComercial,
} from '@/lib/os-commercial'
import { LeadIdSchema } from './dossier.schemas'
import { OpenerInputSchema, ResultadoInputSchema } from './outreach.schemas'

function revalidarSetter(leadId: string) {
  revalidatePath('/setter')
  revalidatePath(`/setter/leads/${leadId}`)
}

/** El outreach muta OsLead/activities: el pipeline admin también se refresca. */
function revalidarPipelineAdmin(leadId: string) {
  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  revalidateTag('admin-leads', {})
}

/** 4.1 — Idéntico criterio que en `dossier.actions`: el motor no habla al setter. */
function mapError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof DossierTransitionError) {
    return fail(copyOperativo(error.message))
  }
  if (error instanceof Error && error.message === 'Unauthorized') {
    return fail('No autorizado')
  }
  // Nunca exponer mensajes internos al cliente.
  return fail(fallback)
}

type EstadoToque = {
  /** ISO del próximo toque que armó la maquinaria (null = sin próximo). */
  proximoToque: string | null
  /** DMs del día del setter, ya contando este (capa informativa de canal). */
  dmsHoy: number
}

async function estadoToque(leadId: string, userId: string): Promise<EstadoToque> {
  const [lead, dmsHoy] = await Promise.all([
    getOwnedLead(leadId, userId),
    contarDmsHoy(userId),
  ])
  return {
    proximoToque: lead?.nextFollowUpAt?.toISOString() ?? null,
    dmsHoy,
  }
}

/**
 * Paso 7 — "Mandé el opener": registra el primer contacto real
 * (INSTAGRAM_DM + SIN_RESPUESTA, la convención existente) y deja que la
 * maquinaria arme el follow-up. El texto del opener queda en notes como
 * evidencia de qué se mandó. Solo una vez: si ya hay contactos registrados,
 * la conversación sigue por el Paso 9.
 */
export async function registrarOpener(
  leadIdRaw: unknown,
  inputRaw: unknown,
): Promise<ActionResult<EstadoToque>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const input = OpenerInputSchema.safeParse(inputRaw)
    if (!input.success) {
      return fail(input.error.issues[0]?.message ?? 'Revisá el texto del opener')
    }

    const lead = await getOwnedLead(leadId.data, userId)
    if (!lead) return fail('Lead no encontrado')
    if (leadRespondio(lead.status)) {
      return fail('Este lead ya respondió — registrá la conversación en Seguimiento')
    }

    const dossier = await getOwnedDossier(leadId.data, userId)
    if (!dossier || dossier.stage === 'FICHA') {
      // P9/este sprint: el paréntesis nombraba la pantalla y el mensaje ya dice
      // qué falta. A dónde ir lo resuelve el panel, no un nombre interno.
      return fail('Primero evaluá el lead — el opener sale con veredicto')
    }
    if (dossier.stage === 'DESCARTADA') {
      return fail('Este lead quedó descartado en la evaluación')
    }

    const actividades = await listOwnedLeadActivities(leadId.data, userId)
    if (actividades === null) return fail('Lead no encontrado')
    if (actividades.length > 0) {
      return fail('El primer contacto ya está registrado — seguí en Seguimiento')
    }

    await registrarContactoComercial({
      leadId: leadId.data,
      channel: ActivityChannel.INSTAGRAM_DM,
      result: ActivityResult.SIN_RESPUESTA,
      notes: `Opener: ${input.data.mensaje}`,
      performedById: userId,
    })

    revalidarSetter(leadId.data)
    revalidarPipelineAdmin(leadId.data)
    return ok(await estadoToque(leadId.data, userId))
  } catch (error) {
    return mapError(error, 'No se pudo registrar el opener')
  }
}

/**
 * Paso 9 — Resultado de un toque de la conversación. Cada resultado dispara
 * la MISMA lógica que la action admin (SIN_RESPUESTA reagenda solo vía
 * calculateNextFollowUp; RESPONDIO abre el gate y limpia el follow-up;
 * CALL_AGENDADA mueve a agendada; RECHAZADO solo registra — el cierre
 * PERDIDO lo decide Franco). POSTERGADO suma la pausa existente
 * (status POSTERGADO + reactivateAt, espejo de updateLeadStatus).
 */
export async function registrarResultado(
  leadIdRaw: unknown,
  inputRaw: unknown,
): Promise<ActionResult<EstadoToque & { resultado: string }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const input = ResultadoInputSchema.safeParse(inputRaw)
    if (!input.success) {
      return fail(input.error.issues[0]?.message ?? 'Revisá lo que registraste')
    }

    const lead = await getOwnedLead(leadId.data, userId)
    if (!lead) return fail('Lead no encontrado')
    // 2.3 (B-02, aditivo): un lead terminal (CERRADO/PERDIDO) no recibe más
    // toques. Endurece, no habilita — rebota antes de tocar nada. El manual ya
    // no ofrece m5 para estos, pero la action no confía en la UI.
    if (!leadActivo(lead.status)) {
      return fail('Este negocio ya está cerrado — seguí con el próximo')
    }

    const actividades = await listOwnedLeadActivities(leadId.data, userId)
    if (actividades === null) return fail('Lead no encontrado')
    if (actividades.length === 0) {
      // P11 — el paréntesis nombraba la pantalla; el mensaje ya dice qué falta.
      return fail('Primero registrá el opener — ahí arranca la conversación')
    }

    const { resultado, nota, reactivateAt } = input.data

    // B7: CALL_AGENDADA ya no entra a mano por acá — el estado lo mueve SOLO
    // el booking confirmado por Cal.com (Paso 10, confirmarReunion).
    if (resultado === 'CALL_AGENDADA') {
      return fail('La reunión se agenda en Agenda con horarios reales — ahí se mueve el estado')
    }

    await registrarContactoComercial({
      leadId: leadId.data,
      channel: ActivityChannel.INSTAGRAM_DM,
      result: ActivityResult[resultado],
      notes: nota,
      performedById: userId,
    })

    if (resultado === 'POSTERGADO' && reactivateAt) {
      await postergarLead(leadId.data, reactivateAt)
    }

    revalidarSetter(leadId.data)
    revalidarPipelineAdmin(leadId.data)
    const estado = await estadoToque(leadId.data, userId)
    return ok({ ...estado, resultado })
  } catch (error) {
    return mapError(error, 'No se pudo registrar el resultado')
  }
}

/**
 * Paso 9 — "Envié la demo" (el segundo mensaje, con el link). Server-side se
 * re-valida el gate completo (la UI no lo ofrece antes, pero no se confía en
 * la UI): lead respondió (o caliente —campo de Franco—, camino preventivo) +
 * dossier APROBADA + finalUrl. Idempotente: el claim atómico de
 * dossier.enviadaAt garantiza UN solo OsDemo aunque se marque dos veces;
 * si la creación falla después del claim, se compensa y se puede reintentar.
 */
export async function enviarDemoAprobada(
  leadIdRaw: unknown,
): Promise<ActionResult<{ yaEnviada: boolean }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const lead = await getOwnedLead(leadId.data, userId)
    if (!lead) return fail('Lead no encontrado')

    const dossier = await getOwnedDossier(leadId.data, userId)
    if (!dossier) return fail('Lead no encontrado')

    const finalUrl = dossier.finalUrl
    // admin-1b: el gate del envío sigue el campo caliente (lo marca Franco), no
    // el score del setter — mismo criterio que el gate del brief.
    if (
      !finalUrl ||
      !gateEnvioDemo({ status: lead.status, caliente: lead.caliente, stage: dossier.stage, finalUrl })
    ) {
      return fail(
        'La demo se envía con el negocio respondido (o lead caliente) y la demo aprobada por Franco',
      )
    }

    const claim = await marcarDemoEnviadaOwned(leadId.data, userId)
    if (claim === null) return fail('Lead no encontrado')
    if (claim === 'ya-enviada') {
      return ok({ yaEnviada: true })
    }

    try {
      await crearDemoComercial({
        leadId: leadId.data,
        demoUrl: finalUrl,
        serviceType: lead.serviceType ?? undefined,
        notes: 'Enviada por el setter desde LeadOS (B6)',
      })
    } catch (error) {
      await revertirDemoEnviadaOwned(leadId.data, userId).catch(() => undefined)
      throw error
    }

    revalidarSetter(leadId.data)
    revalidarPipelineAdmin(leadId.data)
    return ok({ yaEnviada: false })
  } catch (error) {
    return mapError(error, 'No se pudo registrar el envío de la demo')
  }
}
