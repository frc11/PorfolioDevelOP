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
import {
  ownedLeadWhere,
  ownedListWhere,
  ownSetterMetaWhere,
  SOLO_CONTACTOS_COMERCIALES,
} from '@/lib/leados/isolation'

export async function getOwnedLead(
  leadId: string,
  userId: string,
): Promise<OsLead | null> {
  return prisma.osLead.findFirst({
    where: ownedLeadWhere(leadId, userId),
  })
}

export type OwnedLeadWithDossier = Prisma.OsLeadGetPayload<{
  include: {
    dossier: true
    _count: { select: { activities: true } }
    setterMetas: true
  }
}>

/**
 * B3 — Única puerta de LISTAS para el setter (home-hub). El filtro por
 * `assignedToId` vive acá, no en el caller; orden por antigüedad asc (el
 * agrupado del home asume ese orden de base). B6 suma el conteo de
 * actividades (contactos reales) para las próximas acciones de outreach.
 *
 * B-beta — adjunta el meta PRIVADO del setter (pin / snooze / nota propia)
 * filtrado por `ownSetterMetaWhere(userId)`: cada lead trae como máximo UNA fila,
 * la de este setter. Es la privacidad a nivel lectura — un lead reasignado no
 * arrastra la nota del setter anterior, porque sólo se incluye la fila propia.
 */
export async function listOwnedLeads(userId: string): Promise<OwnedLeadWithDossier[]> {
  return prisma.osLead.findMany({
    where: ownedListWhere(userId),
    include: {
      dossier: true,
      // `contactos` del home (agrupado) = contactos comerciales reales; el
      // rastro de reasignación (SISTEMA) NO cuenta — si lo contara, un lead
      // recién reasignado saltaría de grupo sin que el setter lo trabajara.
      _count: { select: { activities: { where: SOLO_CONTACTOS_COMERCIALES } } },
      setterMetas: { where: ownSetterMetaWhere(userId) },
    },
    orderBy: { createdAt: 'asc' },
  })
}
