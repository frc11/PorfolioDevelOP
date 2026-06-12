'use server'

/**
 * LeadOS B7 — Cierre de loop post-reunión. EXCLUSIVO del admin: el setter
 * agenda y traspasa, la venta la cierra Franco — GANADO nunca lo marca el
 * setter (decisión de diseño registrada en el bloque).
 *
 *   - "Reunión realizada": la métrica REAL del piloto (B8 mide realizadas,
 *     no agendadas). La marca Franco post-reunión; no-show = no marcarla.
 *   - Resultado: GANADO → CERRADO (consultable para el 20% futuro, sin
 *     cálculo acá) · PERDIDO → PERDIDO · RE_SEGUIMIENTO → vuelve a
 *     RESPONDIO (la conversación del setter sigue por la maquinaria
 *     existente). Una sola vez por reunión.
 */
import { LeadStatus } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  guardarResultadoReunionAdmin,
  marcarReunionRealizadaAdmin,
} from '@/lib/leados/agenda'
import type { ResultadoReunion } from '@/lib/leados/contracts'
import { MarcarRealizadaSchema, ResultadoReunionInputSchema } from './reunion.schemas'

/** Espejo de updateLeadStatus: a qué estado mueve cada resultado. */
const STATUS_POR_RESULTADO: Record<ResultadoReunion, LeadStatus> = {
  GANADO: LeadStatus.CERRADO,
  PERDIDO: LeadStatus.PERDIDO,
  RE_SEGUIMIENTO: LeadStatus.RESPONDIO,
}

function revalidar(leadId: string) {
  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  revalidateTag('admin-leads', {})
  // El resultado mueve el status: el panel del setter también se refresca.
  revalidatePath('/setter')
  revalidatePath(`/setter/leads/${leadId}`)
}

export async function marcarReunionRealizada(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = MarcarRealizadaSchema.parse(input)

    const marcada = await marcarReunionRealizadaAdmin(parsed.leadId)
    if (!marcada) {
      return fail('No hay reunión agendada para marcar (o ya estaba marcada)')
    }

    revalidar(parsed.leadId)
    return ok({ id: parsed.leadId })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'No se pudo marcar la reunión'
    )
  }
}

export async function registrarResultadoReunion(
  input: unknown
): Promise<ActionResult<{ id: string; status: LeadStatus }>> {
  try {
    await requireSuperAdmin()
    const parsed = ResultadoReunionInputSchema.parse(input)

    const registrado = await guardarResultadoReunionAdmin(
      parsed.leadId,
      parsed.tipo,
      parsed.nota
    )
    if (!registrado) {
      return fail('No hay reunión agendada para cerrar (o ya tiene resultado)')
    }

    const status = STATUS_POR_RESULTADO[parsed.tipo]
    await prisma.osLead.update({
      where: { id: parsed.leadId },
      data: { status, reactivateAt: null },
    })

    revalidar(parsed.leadId)
    return ok({ id: parsed.leadId, status })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'No se pudo registrar el resultado'
    )
  }
}
