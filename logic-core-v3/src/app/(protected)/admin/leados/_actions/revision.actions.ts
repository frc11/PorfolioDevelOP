'use server'

/**
 * LeadOS B5 — Actions de revisión del admin. ÚNICO lugar del repo que expone
 * EN_REVISION→APROBADA / EN_REVISION→RECHAZADA.
 *
 * Invariantes (no negociables):
 *   - requireSuperAdmin() en TODAS — ninguna superficie del setter las alcanza.
 *   - Cambios de stage SOLO vía transitionDossier (valida la transición legal
 *     y appendea el rechazo al historial).
 *   - APROBAR registra finalUrl + aprobadaAt y NADA más: no crea OsDemo, no
 *     toca LeadStatus, no envía — el envío es B6.
 */
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { DossierTransitionError, transitionDossier } from '@/lib/leados/dossier'
import { emitirNovedadSetter } from '@/lib/leados/novedades'
import { AprobarRevisionSchema, RechazarRevisionSchema } from './revision.schemas'

function revalidarRevision(leadId: string) {
  revalidatePath('/admin/leados')
  revalidatePath(`/admin/leados/${leadId}`)
  // El setter ve el resultado en su panel (RECHAZADA cae en "Para trabajar").
  revalidatePath('/setter')
  revalidatePath(`/setter/leads/${leadId}`)
}

/**
 * 0.5.8 — Aviso DIRIGIDO al setter dueño de la demo tras la decisión de Franco.
 * El destinatario es el dueño ACTUAL del lead (`destinatarioNovedad` dentro de
 * emitirNovedadSetter): sin dueño, no hay a quién avisar. Fire-and-forget — la
 * transición ya ocurrió; un fallo del aviso jamás la revierte.
 */
async function avisarDecisionAlSetter(
  leadId: string,
  kind: 'DEMO_APROBADA' | 'DEMO_RECHAZADA',
): Promise<void> {
  try {
    const lead = await prisma.osLead.findUnique({
      where: { id: leadId },
      select: { assignedToId: true, businessName: true },
    })
    if (!lead) return
    await emitirNovedadSetter({
      evento: { kind, ownerActual: lead.assignedToId },
      leadId,
      businessName: lead.businessName,
    })
  } catch (error) {
    console.error('[revision] aviso al setter no fatal:', error)
  }
}

function mapError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof DossierTransitionError) {
    return fail(error.message)
  }
  if (error instanceof Error && error.message === 'Unauthorized') {
    return fail('No autorizado')
  }
  // Nunca exponer mensajes internos al cliente.
  return fail(fallback)
}

export async function aprobarRevision(
  inputRaw: unknown,
): Promise<ActionResult<{ stage: 'APROBADA' }>> {
  try {
    await requireSuperAdmin()

    const input = AprobarRevisionSchema.safeParse(inputRaw)
    if (!input.success) {
      return fail(input.error.issues[0]?.message ?? 'Revisá la URL permanente')
    }

    await transitionDossier(input.data.leadId, {
      to: 'APROBADA',
      finalUrl: input.data.finalUrl,
    })

    // El momento caliente del flujo invertido: que el setter no tarde horas en
    // enviar el link por no enterarse de la aprobación.
    await avisarDecisionAlSetter(input.data.leadId, 'DEMO_APROBADA')

    revalidarRevision(input.data.leadId)
    return ok({ stage: 'APROBADA' })
  } catch (error) {
    return mapError(error, 'No se pudo aprobar la demo')
  }
}

export async function rechazarRevision(
  inputRaw: unknown,
): Promise<ActionResult<{ stage: 'RECHAZADA' }>> {
  try {
    await requireSuperAdmin()

    const input = RechazarRevisionSchema.safeParse(inputRaw)
    if (!input.success) {
      return fail(input.error.issues[0]?.message ?? 'Completá los tres campos del rechazo')
    }

    const { leadId, motivo, donde, arreglo } = input.data
    await transitionDossier(leadId, {
      to: 'RECHAZADA',
      motivo,
      donde,
      arreglo,
    })

    await avisarDecisionAlSetter(leadId, 'DEMO_RECHAZADA')

    revalidarRevision(leadId)
    return ok({ stage: 'RECHAZADA' })
  } catch (error) {
    return mapError(error, 'No se pudo rechazar la demo')
  }
}
