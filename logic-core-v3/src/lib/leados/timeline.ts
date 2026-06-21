/**
 * LeadOS FG-0.5 — Lectura del TIMELINE del lead (la "memoria del lead"), aislada.
 *
 * SOLO PRESENTA el historial que YA vive en `OsLeadActivity` — cero eventos
 * nuevos. Trae los contactos comerciales (Instagram/WhatsApp/llamada/…) Y los
 * eventos internos `SISTEMA` (reasignación, rastro de 0.5.3), del más nuevo al
 * más viejo. Es una lectura NUEVA y SEPARADA de las comerciales:
 *
 *   - `listOwnedLeadActivities` (outreach.ts) filtra `SOLO_CONTACTOS_COMERCIALES`
 *     porque alimenta `contactos`/`ultimoContacto` y el gate que abre Seguimiento.
 *     Esa lectura NO se toca.
 *   - El timeline NO filtra canal (`timelineActivityWhere`): el evento de sistema
 *     es memoria del lead y se MUESTRA — pero sigue SIN contar como contacto (los
 *     conteos/gates leen la otra query). La invariante lo constata ejecutable.
 *
 * Aislamiento (#1): pasa por `getOwnedLead` — un lead ajeno o inexistente devuelve
 * `null` (404-style, sin leakear), igual que toda superficie del setter. Mostrar
 * el historial no abre ninguna puerta nueva.
 *
 * Índice: el where es lead-scoped y lo sirve `@@index([leadId, createdAt])` (range
 * por lead + orden por fecha). NOTA: el índice "T6" `@@index([performedById,
 * createdAt])` de FG-0.5 Parte 1 sirve las lecturas POR-PERFORMER (contarDmsHoy /
 * "mis números"); el timeline per-lead keyea por `leadId` —no por performer— para
 * INCLUIR la reasignación `SISTEMA`, que la hace el admin (ver bitácora).
 */
import type { ActivityChannel, ActivityResult } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { timelineActivityWhere } from '@/lib/leados/isolation'
import { getOwnedLead } from '@/lib/leados/ownership'

export type TimelineEvento = {
  id: string
  channel: ActivityChannel
  result: ActivityResult | null
  notes: string | null
  createdAt: Date
  /** Quién lo registró: el setter para los contactos, el admin para SISTEMA. */
  performedBy: { name: string | null } | null
}

/**
 * Historial completo del lead PROPIO del setter (contactos + eventos de sistema,
 * el más nuevo primero). `null` si el lead no existe o no es suyo.
 */
export async function listOwnedLeadTimeline(
  leadId: string,
  userId: string,
): Promise<TimelineEvento[] | null> {
  const lead = await getOwnedLead(leadId, userId)
  if (!lead) return null
  return prisma.osLeadActivity.findMany({
    where: timelineActivityWhere(lead.id),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      channel: true,
      result: true,
      notes: true,
      createdAt: true,
      performedBy: { select: { name: true } },
    },
  })
}
