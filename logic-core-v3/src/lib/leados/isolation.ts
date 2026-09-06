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
import {
  ActivityChannel,
  ActivityResult,
  type OsSetterNoticeKind,
  type Prisma,
} from '@prisma/client'

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
 * Fragmento `where` de los DMs que el setter EFECTIVAMENTE MANDÓ — el conteo de
 * la capa de seguridad de canal (`contarDmsHoy`), que cuida la cuenta de
 * Instagram contra el spam de outreach en frío.
 *
 * El discriminador es `result`, y no lo inventa esta pieza: `countFollowUps`
 * (lib/follow-up) ya define «un toque mandado» como una fila `SIN_RESPUESTA`, y
 * sobre ese conteo corre la cadencia. Acá se usa la MISMA definición.
 *
 * Los demás resultados registran lo que hizo el PROSPECTO —respondió, pidió
 * esperar, rechazó— o un evento (reunión confirmada por Cal.com): son reacciones
 * a un mensaje que ya se contó cuando se mandó, no mensajes nuevos. Sin este
 * filtro, postergar un contacto inflaba el contador sin que saliera un solo DM.
 */
export const SOLO_MENSAJES_ENVIADOS = {
  result: ActivityResult.SIN_RESPUESTA,
} as const satisfies Prisma.OsLeadActivityWhereInput

/**
 * Predicado puro espejo de `SOLO_MENSAJES_ENVIADOS` — para derivaciones
 * in-memory y para el chequeo de invariante. `result` es opcional en el modelo:
 * una fila sin resultado no acredita un mensaje mandado.
 */
export function esMensajeEnviado(result: ActivityResult | null): boolean {
  return result === SOLO_MENSAJES_ENVIADOS.result
}

/**
 * El `where` del CONTADOR de la capa de seguridad de canal, entero: canal +
 * discriminador de mensaje mandado. `contarDmsHoy` NO arma ninguno propio.
 *
 * ── Por qué existe (P8, caso 1) ─────────────────────────────────────────────
 * Hasta acá el eje de CANAL estaba escrito dos veces: literal `channel:
 * 'INSTAGRAM_DM'` inline en la consulta, y otra vez —a mano— en la réplica
 * in-memory que `contador-dms.invariant.ts` usaba para afirmar. El invariante
 * nunca tocaba la consulta real: afirmaba sobre `SOLO_MENSAJES_ENVIADOS` (un
 * fragmento exportado) y sobre su propia réplica. Medido en P1: revertir SOLO
 * el `where` de `contarDmsHoy` —sacarle el discriminador de resultado, que es
 * exactamente el bug que F1 arregló— dejaba el invariante en verde y `tsc` en 0.
 * Era el quinto falso verde del repo.
 *
 * Ahora hay UNA fuente. El discriminador vive acá y en ningún otro lado: la
 * consulta lo consume entero y el invariante afirma sobre ESTE objeto y sobre
 * `esDmMandado`, que lo LEE. Sacarle el `result` para reintroducir el bug pone
 * en rojo las dos mitades a la vez.
 */
export const SOLO_DMS_MANDADOS = {
  channel: ActivityChannel.INSTAGRAM_DM,
  ...SOLO_MENSAJES_ENVIADOS,
} as const satisfies Prisma.OsLeadActivityWhereInput

/**
 * Predicado puro del contador: LEE `SOLO_DMS_MANDADOS` en vez de repetirlo, así
 * el `where` que va a Prisma y la derivación in-memory no pueden divergir.
 */
export function esDmMandado(fila: {
  channel: ActivityChannel
  result: ActivityResult | null
}): boolean {
  return fila.channel === SOLO_DMS_MANDADOS.channel && fila.result === SOLO_DMS_MANDADOS.result
}

/**
 * El `where` COMPLETO que `contarDmsHoy` le pasa a Prisma: performer + canal +
 * mensaje mandado + la ventana del día. Es pura construcción de objeto (sin
 * cliente Prisma), así que el invariante puede afirmar sobre el MISMO objeto que
 * ve la base — no sobre una réplica que él mismo escribe.
 *
 * La ventana entra por parámetro a propósito: el borde del día argentino se
 * calcula en `outreach.ts` y este módulo no toca fechas.
 */
export function dmsMandadosHoyWhere(
  userId: string,
  desde: Date,
  hasta: Date,
): Prisma.OsLeadActivityWhereInput {
  return {
    performedById: userId,
    ...SOLO_DMS_MANDADOS,
    createdAt: { gte: desde, lte: hasta },
  }
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
