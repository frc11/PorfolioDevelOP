/**
 * LeadOS — Aislamiento del setter y separación contacto-comercial / evento-interno.
 *
 * Fuente ÚNICA de dos invariantes que NO se tocan al agregar el rastro de
 * reasignación:
 *
 *   1. Ownership: el setter solo alcanza lo SUYO. Todo `where` de lectura del
 *      setter se arma con estos helpers — si un día cambia el aislamiento,
 *      cambia acá y en un solo lugar.
 *   2. Un evento interno (reasignación, `ActivityChannel.SISTEMA`) NO es un
 *      contacto comercial: queda registrado en el historial pero las lecturas
 *      comerciales (cron "último contacto", `contactos`, `_count.activities`,
 *      cadencia de follow-up) lo EXCLUYEN con `SOLO_CONTACTOS_COMERCIALES`.
 *
 * Módulo puro (solo tipos/enum de Prisma, sin acceso a DB) para que el chequeo
 * de invariante (`assignment-trail.invariant.ts`) lo verifique sin tocar Neon.
 */
import { ActivityChannel, type OsSetterNoticeKind, type Prisma } from '@prisma/client'

/** Filtro de un lead individual del setter (anti-IDOR: id + dueño). */
export function ownedLeadWhere(
  leadId: string,
  userId: string,
): Prisma.OsLeadWhereInput {
  return { id: leadId, assignedToId: userId }
}

/** Filtro de la LISTA del setter: solo los leads asignados a él. */
export function ownedListWhere(userId: string): Prisma.OsLeadWhereInput {
  return { assignedToId: userId }
}

/**
 * Filtro del meta PRIVADO del setter (pin / snooze / nota propia): SOLO la fila
 * de ESTE setter. Es la garantía de privacidad a nivel lectura — usado tanto en
 * el `include` de la lista como en cualquier acceso al meta. Otro setter, aunque
 * comparta el lead por reasignación, nunca alcanza esta fila: su `setterId` no
 * coincide. Espejo de `ownedListWhere` para un dato nuevo, suyo y aislado.
 */
export function ownSetterMetaWhere(userId: string): Prisma.OsLeadSetterMetaWhereInput {
  return { setterId: userId }
}

/**
 * Fragmento `where` reutilizable: SOLO contactos comerciales (excluye eventos
 * internos del sistema). Se usa tanto en `findMany` como en `_count` filtrado.
 */
export const SOLO_CONTACTOS_COMERCIALES: Prisma.OsLeadActivityWhereInput = {
  channel: { not: ActivityChannel.SISTEMA },
}

/**
 * Predicado puro espejo de `SOLO_CONTACTOS_COMERCIALES` — para derivaciones
 * in-memory y para el chequeo de invariante.
 */
export function esContactoComercial(channel: ActivityChannel): boolean {
  return channel !== ActivityChannel.SISTEMA
}

/**
 * Fragmento `where` del TIMELINE del lead (la "memoria del lead"): TODOS los
 * canales, incluido `SISTEMA` (la reasignación es parte del historial). Es el
 * contraste deliberado de `SOLO_CONTACTOS_COMERCIALES` — acá NO se filtra canal:
 * mostrar el evento de sistema en el historial NO lo vuelve un contacto comercial
 * (eso lo decide el conteo, que sí filtra y no se toca). La lectura es una lectura
 * NUEVA y separada de los conteos/gates.
 *
 * Es lead-scoped (`leadId`), NUNCA por `performedById`: los eventos `SISTEMA` los
 * registra el ADMIN al reasignar, así que keyear por performer dejaría AFUERA la
 * reasignación — justo lo que el timeline debe mostrar. El gate de ownership va
 * aparte (`ownedLeadWhere`/`getOwnedLead`), igual que toda lectura del setter, así
 * que el setter solo alcanza el timeline de un lead suyo.
 */
export function timelineActivityWhere(
  leadId: string,
): Prisma.OsLeadActivityWhereInput {
  return { leadId }
}

// ── Novedades dirigidas al setter (OsSetterNotice) ───────────────────────────

/**
 * Filtro del feed de novedades dirigidas al setter: SOLO las suyas (por
 * `setterId`). Espejo de `ownSetterMetaWhere` para un dato ADDRESSED — no
 * derivable por ownership cuando el lead ya no es del setter (el caso
 * reasignación-saliente). Es la garantía de aislamiento a nivel lectura: otro
 * setter, aunque comparta el lead, nunca alcanza esta fila (su `setterId` no
 * coincide). A diferencia de la cartera (`ownedListWhere`, por `assignedToId`),
 * acá la dimensión es el DESTINATARIO, no el dueño actual.
 */
export function ownSetterNoticeWhere(
  userId: string,
): Prisma.OsSetterNoticeWhereInput {
  return { setterId: userId }
}

/**
 * A quién va dirigida cada novedad — la REGLA ÚNICA de destinatario, compartida
 * entre la creación (las actions de admin) y el chequeo de invariante (que la
 * verifica sin DB). Captura el "por assignedToId" del aislamiento + cierra el
 * cabo de la reasignación-saliente:
 *
 *   - asignación / aprobación / rechazo → el dueño ACTUAL del lead (el setter
 *     cuyo `assignedToId` es el lead en ese momento);
 *   - reasignación-saliente → el dueño PREVIO (ya NO es `assignedToId` — por eso
 *     no se puede derivar de su cartera y necesita una fila addressed).
 *
 * `null` = nadie a quien avisar (lead sin dueño en ese extremo) → no se crea fila.
 */
export type NovedadDirigida =
  | {
      kind: Exclude<OsSetterNoticeKind, 'LEAD_REASIGNADO_SALIENTE'>
      ownerActual: string | null
    }
  | { kind: 'LEAD_REASIGNADO_SALIENTE'; ownerPrevio: string | null }

export function destinatarioNovedad(evento: NovedadDirigida): string | null {
  return evento.kind === 'LEAD_REASIGNADO_SALIENTE'
    ? evento.ownerPrevio
    : evento.ownerActual
}
