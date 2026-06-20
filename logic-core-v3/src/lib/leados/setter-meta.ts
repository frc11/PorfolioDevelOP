/**
 * LeadOS B-beta — Acceso al meta PRIVADO del setter sobre su cartera.
 *
 * `OsLeadSetterMeta` es dato NUEVO, SUYO y AISLADO: pin, snooze personal y nota
 * propia, keyed por (leadId, setterId). NO es `OsLead.notes` (campo del admin,
 * otro dueño). Toda lectura/escritura va por (leadId, setterId), nunca por leadId
 * solo — la privacidad entre setters es estructural, no por convención.
 *
 * El ownership del lead se valida ARRIBA (en la action, vía `getOwnedLead`): este
 * módulo asume que el caller ya probó que el lead es del setter. El upsert sólo
 * toca la fila de ESE setter, así que ni siquiera puede escribir sobre la de otro.
 */
import type { OsLeadSetterMeta } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/** Vista plana del meta para la UI — sin la fila Prisma cruda. */
export type SetterMetaView = {
  pinned: boolean
  snoozedUntil: Date | null
  note: string | null
}

/** Sin meta = todo en su valor neutro (lead nunca tocado por el setter). */
export const EMPTY_SETTER_META: SetterMetaView = {
  pinned: false,
  snoozedUntil: null,
  note: null,
}

/**
 * Colapsa el array `setterMetas` del lead (filtrado por setterId en la query,
 * 0 o 1 fila) a su vista. Cero filas → meta vacío.
 */
export function toSetterMetaView(
  metas: Pick<OsLeadSetterMeta, 'pinned' | 'snoozedUntil' | 'note'>[],
): SetterMetaView {
  const meta = metas[0]
  if (!meta) return EMPTY_SETTER_META
  return {
    pinned: meta.pinned,
    snoozedUntil: meta.snoozedUntil,
    note: meta.note,
  }
}

/** Campos que el setter controla de su meta (el resto es de la maquinaria). */
export type SetterMetaPatch = Partial<Pick<OsLeadSetterMeta, 'pinned' | 'snoozedUntil' | 'note'>>

/**
 * Crea o actualiza la fila propia del setter para un lead. Idempotente por la
 * unique (leadId, setterId). El caller YA validó ownership del lead.
 */
export async function upsertSetterMeta(
  leadId: string,
  setterId: string,
  patch: SetterMetaPatch,
): Promise<void> {
  await prisma.osLeadSetterMeta.upsert({
    where: { leadId_setterId: { leadId, setterId } },
    create: { leadId, setterId, ...patch },
    update: patch,
  })
}
