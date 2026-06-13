/**
 * LeadOS B1 — Aislamiento por ownership del setter.
 *
 * REGLA DE ORO de toda superficie del setter, sin excepción:
 *   1. Toda lectura de LISTAS filtra `where: { assignedToId: userId }`.
 *   2. Toda server action del setter llama `requireSetter()` (auth-guards) Y
 *      re-verifica ownership del lead puntual vía `getOwnedLead()` antes de
 *      leer o mutar — nunca confiar en un leadId que vino del cliente
 *      (mismo razonamiento anti-IDOR que `src/lib/auth/assert-ownership.ts`).
 *
 * `getOwnedLead` es la única puerta de acceso a un OsLead individual desde el
 * contexto setter. Devuelve `null` si el lead no existe o no es suyo — el
 * caller trata ambos casos igual (404-style) para no leakear existencia.
 */
import type { OsLead, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function getOwnedLead(
  leadId: string,
  userId: string,
): Promise<OsLead | null> {
  return prisma.osLead.findFirst({
    where: { id: leadId, assignedToId: userId },
  })
}

export type OwnedLeadWithDossier = Prisma.OsLeadGetPayload<{
  include: { dossier: true; _count: { select: { activities: true } } }
}>

/**
 * B3 — Única puerta de LISTAS para el setter (home-hub). El filtro por
 * `assignedToId` vive acá, no en el caller; orden por antigüedad asc (el
 * agrupado del home asume ese orden de base). B6 suma el conteo de
 * actividades (contactos reales) para las próximas acciones de outreach.
 */
export async function listOwnedLeads(userId: string): Promise<OwnedLeadWithDossier[]> {
  return prisma.osLead.findMany({
    where: { assignedToId: userId },
    include: { dossier: true, _count: { select: { activities: true } } },
    orderBy: { createdAt: 'asc' },
  })
}
