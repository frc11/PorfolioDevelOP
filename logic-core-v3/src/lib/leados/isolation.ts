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
 * Campos de alta que el setter SÍ controla: lo que sabe del negocio que cargó.
 * Explícitamente SIN `assignedToId`, `caliente` ni `source` — esos los fija el
 * sistema en `ownedLeadCreateData`, nunca el cliente. Es el contrato de entrada
 * del alta propia (A.1): el output del `NuevoProspectoSchema` calza con este shape.
 */
export type OwnedLeadFields = {
  businessName: string
  contactName?: string
  phone?: string
  email?: string
  industry?: string
  zone?: string
  instagramUrl?: string
  currentWebUrl?: string
  notes?: string
}

/**
 * Marca de la SEGUNDA fuente de leads: auto-cargado por el setter. La otra fuente
 * es la asignación de Franco (que además marca `caliente`). No cambia el modelo de
 * dos fuentes — solo deja el origen anotado, como hacen 'Chatbot' / 'Inbound'.
 */
export const FUENTE_SETTER = 'Setter'

/**
 * Datos de alta de un lead PROPIO del setter — el espejo de ESCRITURA de
 * `ownedLeadWhere`/`ownedListWhere`. La misma frontera de aislamiento (el dueño
 * es `assignedToId`), ahora aplicada al CREAR:
 *
 *   1. `assignedToId` se DERIVA del `userId` de la sesión, SIEMPRE — jamás de un
 *      campo del cliente. El registro se arma campo por campo (no `...fields`), así
 *      que un `assignedToId` inyectado en `fields` ni se lee: el dueño se fuerza.
 *      Es el anti-IDOR de escritura — el setter no puede crear un lead de otro.
 *   2. `caliente: false`: el lead entra FRÍO. El caliente lo marca Franco al
 *      asignar (admin-1b), nunca el setter al cargar.
 *   3. `source`: marca la segunda fuente.
 *
 * El estado inicial (status PROSPECTO, dossier FICHA lazy) sale de los defaults de
 * Prisma — un lead así entra a la cola `trabajar` del foco como cualquier otro.
 * Verificado, sin DB, por `alta-propia.invariant.ts`.
 */
export function ownedLeadCreateData(
  fields: OwnedLeadFields,
  userId: string,
): Prisma.OsLeadUncheckedCreateInput {
  return {
    businessName: fields.businessName,
    contactName: fields.contactName,
    phone: fields.phone,
    email: fields.email,
    industry: fields.industry,
    zone: fields.zone,
    instagramUrl: fields.instagramUrl,
    currentWebUrl: fields.currentWebUrl,
    notes: fields.notes,
    // ── Reglas del SISTEMA (no del cliente) ──
    assignedToId: userId,
    caliente: false,
    source: FUENTE_SETTER,
  }
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
