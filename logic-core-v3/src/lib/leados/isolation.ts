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
import { ActivityChannel, type Prisma } from '@prisma/client'

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
