/**
 * LeadOS — Rastro de reasignación de leads.
 *
 * Cuando el admin reasigna un lead (cambia `assignedToId`), el lead aparece o
 * desaparece de la cartera del setter. Antes eso pasaba MUDO. Acá dejamos
 * rastro: una entrada en el historial del lead (OsLeadActivity), de forma
 * ADITIVA y sin tocar quién puede reasignar ni el aislamiento por ownership.
 *
 * Invariantes (cruzarlos = frenar y avisar):
 *   - SENSIBLE: esto MUESTRA el cambio, no lo causa. El único writer de
 *     `assignedToId` sigue siendo `assignLeadSetter` (requireSuperAdmin).
 *   - El evento se registra como `ActivityChannel.SISTEMA` — NUNCA pasa por
 *     `registrarContactoComercial` (eventos internos jamás, dice os-commercial):
 *     no es un contacto al prospecto, no mueve cadencia ni status, y las
 *     lecturas comerciales lo excluyen (SOLO_CONTACTOS_COMERCIALES).
 *   - La lectura del setter (`getUltimaAsignacion`) pasa por `getOwnedLead`:
 *     un lead ajeno o inexistente devuelve `null`, igual que toda superficie
 *     del setter. Mostrar el rastro no abre ninguna puerta nueva.
 */
import { ActivityChannel } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getOwnedLead } from '@/lib/leados/ownership'

/** Etiqueta para un setter en el rastro; sin setter = "Sin asignar". */
export function etiquetaSetter(nombre: string | null | undefined): string {
  return nombre && nombre.trim() !== '' ? nombre.trim() : 'Sin asignar'
}

export type ReasignacionInput = {
  leadId: string
  fromLabel: string
  toLabel: string
  /** Quién reasignó (admin). Actor del evento, no destinatario. */
  performedById: string
}

/**
 * Registra la reasignación como evento interno en el historial del lead.
 * Crea la OsLeadActivity directo (no vía la maquinaria comercial) con
 * `channel: SISTEMA` y `result: null`: solo deja rastro, sin efectos.
 */
export async function registrarReasignacion(
  input: ReasignacionInput,
): Promise<void> {
  await prisma.osLeadActivity.create({
    data: {
      leadId: input.leadId,
      channel: ActivityChannel.SISTEMA,
      result: null,
      notes: `Reasignado: ${input.fromLabel} → ${input.toLabel}`,
      performedById: input.performedById,
    },
    select: { id: true },
  })
}

export type AsignacionEvento = {
  createdAt: Date
  notes: string | null
}

/**
 * Última reasignación de un lead PROPIO del setter (para el aviso "te
 * asignaron este lead"). Como el setter solo ve leads que hoy son suyos, el
 * evento SISTEMA más reciente es el que lo puso en su cartera. `null` si el
 * lead no es suyo / no existe (404-style) o si no hay rastro (lead legacy).
 */
export async function getUltimaAsignacion(
  leadId: string,
  userId: string,
): Promise<AsignacionEvento | null> {
  const lead = await getOwnedLead(leadId, userId)
  if (!lead) return null

  return prisma.osLeadActivity.findFirst({
    where: { leadId: lead.id, channel: ActivityChannel.SISTEMA },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, notes: true },
  })
}
