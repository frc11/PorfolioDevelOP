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

/**
 * P41 — Lo que el panel del setter lee del dossier, y nada más.
 *
 * Hasta P41 la cartera traía el dossier ENTERO de cada lead en cada carga del
 * panel (`dossier: true`): el brief, el chequeo final y el progreso de
 * construcción incluidos, que el panel no lee. Con el documento de cuatro vueltas
 * de P40 el brief pasa a pesar ~10 KB, y viajaba por cada lead de la cartera.
 *
 * Estos ocho son el censo de P41; quién lee cada uno está en
 * `tests/leados/consulta-cartera.spec.ts`, que falla si la consulta trae uno de
 * más o uno de menos. Los blobs Json viajan enteros: sus lectores los validan
 * enteros con zod.
 *
 * El tipo sale de este mismo objeto, así que un consumidor nuevo que lea un campo
 * que no está acá NO compila. El arreglo es sumar el campo acá y al censo — nunca
 * ensanchar el tipo: un tipo que promete un campo que la consulta no trae lee
 * `undefined` sin avisar.
 */
export const DOSSIER_DEL_PANEL = {
  stage: true,
  fichaJson: true,
  evaluacionJson: true,
  rechazos: true,
  agendaJson: true,
  finalUrl: true,
  enviadaAt: true,
  updatedAt: true,
} as const satisfies Prisma.OsLeadDossierSelect

export type OwnedLeadWithDossier = Prisma.OsLeadGetPayload<{
  include: {
    dossier: { select: typeof DOSSIER_DEL_PANEL }
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
      dossier: { select: DOSSIER_DEL_PANEL },
      // `contactos` del home (agrupado) = contactos comerciales reales; el
      // rastro de reasignación (SISTEMA) NO cuenta — si lo contara, un lead
      // recién reasignado saltaría de grupo sin que el setter lo trabajara.
      _count: { select: { activities: { where: SOLO_CONTACTOS_COMERCIALES } } },
      setterMetas: { where: ownSetterMetaWhere(userId) },
    },
    orderBy: { createdAt: 'asc' },
  })
}
