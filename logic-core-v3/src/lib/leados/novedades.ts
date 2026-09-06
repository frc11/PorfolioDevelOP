/**
 * LeadOS 0.5.8 — Novedades DIRIGIDAS al setter. Cierra el agujero del flujo
 * invertido: el sistema avisaba SOLO a Franco, y el setter volvía a ciegas a los
 * handoffs (le asignaron un lead, Franco aprobó/rechazó su demo, le sacaron un
 * lead por reasignación). Acá viven:
 *
 *   - la creación ADDRESSED de la novedad (`emitirNovedadSetter`) que las actions
 *     de admin llaman en cada handoff — fire-and-forget, NUNCA rompe el flujo;
 *   - el lector del feed del home (`getNovedadesSetter`) y el contador del badge
 *     (`contarNovedadesSinLeer`), ambos resilientes (un fallo de lectura no
 *     blanquea la cartera);
 *   - la marca "visto" (`marcarNovedadesVistas`);
 *   - el RESUMEN LIVE de la cola en revisión (`derivarColaRevision`), que NO es un
 *     evento sino el estado vigente de las demos EN_REVISION del setter (lo que
 *     Franco ya ve del otro lado vía pipeline/revision). A-06: es un agregado que
 *     informa, no una segunda cola de leads navegables en paralelo al foco.
 *
 * Aislamiento (regla de oro): toda lectura del feed filtra por `setterId`
 * (`ownSetterNoticeWhere`) y la derivación de la cola por `assignedToId` (los
 * leads ya vienen de `listOwnedLeads`). La REGLA de destinatario es única y vive
 * en isolation.ts (`destinatarioNovedad`) — la misma que verifica el invariante.
 *
 * Por qué in-app y no Telegram al setter: `sendTelegram` (sender único) resuelve
 * a UN solo chat (Franco). No hay chatId por setter, así que el canal dirigido al
 * setter es in-app; no se dispara un Telegram redundante por handoffs que Franco
 * mismo ejecuta. El sender único no se duplica.
 */
import type { OsSetterNoticeKind } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  destinatarioNovedad,
  ownSetterNoticeWhere,
  type NovedadDirigida,
} from '@/lib/leados/isolation'
import {
  agruparAvisos,
  FILAS_NOVEDADES,
  type AvisoView,
  type FilaNovedad,
} from '@/lib/leados/novedades-agrupar'
import { formatEspera } from '@/lib/leados/revision'
import type { OwnedLeadWithDossier } from '@/lib/leados/ownership'
import {
  indiceDeEstados,
  vigenciaDeAviso,
  type EstadoDelLead,
  type Vigencia,
} from '@/lib/leados/novedades-vigencia'

/**
 * Cuántos avisos sin leer se LEEN de la base (el contador del badge puede ser
 * mayor). P21 subió el número de 12 a 50 por una razón de honestidad, no de
 * volumen: desde este sprint los avisos sin acción se AGRUPAN («y 31 más
 * iguales»), y ese número sale de las filas leídas. Con `take: 12` el grupo
 * decía «11 más» sobre 32 reales. Es la misma query, el mismo índice
 * (`setterId, read`) y el mismo filtro por destinatario — sólo cambia el corte.
 */
const AVISOS_LEIDOS = 50


/**
 * Copy de cada novedad — SNAPSHOT del momento del handoff (se guarda en
 * title/body, incluye el nombre del negocio) para no releer después un lead que
 * el setter saliente ya no puede ver. Pura: la testea el invariante. El nombre
 * lo escapa React al renderizar (texto plano, sin XSS).
 */
export function copyNovedad(
  kind: OsSetterNoticeKind,
  businessName: string,
): { title: string; body: string } {
  switch (kind) {
    case 'LEAD_ASIGNADO':
      return {
        title: 'Te asignaron un lead',
        body: `${businessName} entró a tu cartera. Arrancá por la ficha.`,
      }
    case 'DEMO_APROBADA':
      return {
        title: 'Franco aprobó tu demo',
        body: `${businessName}: la demo está aprobada. Enviá el link ya, recién aprobada.`,
      }
    case 'DEMO_RECHAZADA':
      return {
        title: 'Franco pidió cambios',
        body: `${businessName}: la demo volvió con correcciones. Reabrí la construcción y rehacé.`,
      }
    case 'LEAD_REASIGNADO_SALIENTE':
      return {
        title: 'Te reasignaron un lead',
        body: `${businessName} pasó a otro setter. Ya no está en tu cartera.`,
      }
    default: {
      // Guard de exhaustividad: si el enum gana un valor y no se mapea acá, esto
      // no compila (kind deja de ser `never`).
      const _exhaustive: never = kind
      throw new Error(`Novedad sin copy: ${String(_exhaustive)}`)
    }
  }
}

/**
 * Crea la novedad dirigida al setter que el handoff concierne. El destinatario
 * sale de la REGLA ÚNICA `destinatarioNovedad` (no de un id pasado a mano): así
 * la dirección que el invariante verifica es EXACTAMENTE la que corre en prod.
 * `null` = sin destinatario (lead sin dueño en ese extremo) → no crea nada.
 * Contrato fire-and-forget: NUNCA lanza — un fallo loguea y el handoff sigue.
 */
export async function emitirNovedadSetter(input: {
  evento: NovedadDirigida
  /** Lead de referencia (para linkear desde el aviso). null en el saliente: el
   *  setter ya no lo puede abrir, el snapshot del nombre alcanza. */
  leadId: string | null
  businessName: string
}): Promise<void> {
  const setterId = destinatarioNovedad(input.evento)
  if (!setterId) return

  const { title, body } = copyNovedad(input.evento.kind, input.businessName)
  try {
    await prisma.osSetterNotice.create({
      data: {
        setterId,
        leadId: input.leadId,
        kind: input.evento.kind,
        title,
        body,
      },
      select: { id: true },
    })
  } catch (error) {
    console.error('[novedades] fallo no fatal al emitir novedad:', error)
  }
}

// ── Lectura del feed (home) ──────────────────────────────────────────────────

// El agrupamiento vive en un módulo PURO (`novedades-agrupar.ts`) para que el
// chequeo de invariante lo ejecute de verdad; se re-exporta acá para que los
// call-sites que ya importaban desde `novedades` no cambien.
export { agruparAvisos, FILAS_NOVEDADES }
export type { AvisoView, FilaNovedad }

/**
 * A-06 — RESUMEN (no lista navegable) de las demos del setter EN_REVISION.
 * Antes era una segunda cola: cada demo un link directo al lead, en paralelo al
 * foco. Ahora informa cuántas esperan a Franco y hace cuánto la más vieja; el
 * acceso a esas demos es por la cartera (filtro «Esperando revisión»), no por una
 * cola propia. `null` = ninguna en revisión (el bloque no se muestra).
 */
export type ColaRevisionResumen = {
  total: number
  /** Hace cuánto espera la demo MÁS vieja (la que más urge que Franco mire). */
  hace: string
}

export type NovedadesView = {
  /** Las filas ya agrupadas y acotadas — lo que el panel dibuja. */
  filas: FilaNovedad[]
  /** Avisos que no entraron en las filas visibles (ninguna acción se pierde). */
  ocultos: number
  /** Resumen de la cola en revisión, o null si no hay ninguna. */
  revision: ColaRevisionResumen | null
  /** Avisos sin leer (badge). Puede superar lo visible (que está acotado). */
  totalSinLeer: number
}

/**
 * Lead que "Abrir" ancla como foco: el saliente NUNCA abre (el setter ya no es
 * dueño → sólo informa); el resto sí. Mismo criterio de "abrible" que antes
 * decidía el link directo, ahora al servicio del anclaje del foco.
 */
function leadAbrible(kind: OsSetterNoticeKind, leadId: string | null): string | null {
  if (kind === 'LEAD_REASIGNADO_SALIENTE' || !leadId) return null
  return leadId
}

/** Aplana la `Vigencia` a los dos campos que viaja la vista. */
function vigenciaComoCampos(v: Vigencia): { vigente: boolean; enSuLugar: string | null } {
  return v.vigente ? { vigente: true, enSuLugar: null } : { vigente: false, enSuLugar: v.enSuLugar }
}

/**
 * Resumen de las demos del setter EN_REVISION: cuántas y hace cuánto la más
 * vieja. Derivado (cero campos nuevos) de los leads YA filtrados por
 * `assignedToId` (`listOwnedLeads`): el aislamiento es el de la cartera. El proxy
 * de "desde cuándo espera" es `dossier.updatedAt` — la transición a EN_REVISION
 * es su último write, mismo criterio que `ordenarCola` (revision.ts). A-06: ya no
 * emite una lista navegable — sólo el agregado. Pura: `ahora` se inyecta.
 */
export function derivarColaRevision(
  leads: OwnedLeadWithDossier[],
  ahora: Date,
): ColaRevisionResumen | null {
  let total = 0
  let esperaMasVieja: Date | null = null
  for (const lead of leads) {
    const dossier = lead.dossier
    if (dossier?.stage === 'EN_REVISION') {
      total += 1
      if (!esperaMasVieja || dossier.updatedAt < esperaMasVieja) {
        esperaMasVieja = dossier.updatedAt
      }
    }
  }
  if (total === 0 || !esperaMasVieja) return null
  return { total, hace: formatEspera(esperaMasVieja, ahora) }
}

/**
 * El panorama de novedades del home: avisos dirigidos sin leer + el resumen de la
 * cola en revisión (live). Recibe los leads YA cargados (`listOwnedLeads` en el
 * page) para no pegarle dos veces a la cartera. Resiliente: si la lectura de
 * avisos falla, el resumen (derivado de los leads) igual se muestra y la cartera
 * no se rompe.
 *
 * 2.2 / P21 — `excludeLeadIds` deduplica contra LA COLA: el aviso cuyo lead ya
 * aparece como tarea (arriba, en la cola de hoy) NO se repite abajo como
 * noticia. Hasta P21 el dedup era contra UN lead —el foco— porque la cola no se
 * renderizaba en ninguna parte; renderizarla sin ensanchar el dedup habría dado
 * exactamente lo que este sprint prohíbe: un aviso y una tarea diciendo lo
 * mismo. Se pasan los ids de lo VISIBLE en la cola, no el grupo `trabajar`
 * entero: un lead que no llegó a mostrarse conserva su aviso (ver
 * `cola.ts#idsEnCola`).
 *
 * Es solo presentación: esos avisos siguen SIN LEER (el badge `totalSinLeer` los
 * cuenta igual) y reaparecen cuando el lead deja la cola. El aislamiento
 * (`setterId`) no se toca.
 */
export async function getNovedadesSetter(
  userId: string,
  leads: OwnedLeadWithDossier[],
  opts?: {
    excludeLeadIds?: readonly string[]
    /**
     * P23 — los leads YA clasificados por el page (`buildHomeLeads`), para poder
     * decir si la orden de cada aviso sigue en pie. Se pasan en vez de
     * re-clasificar acá: el dato que decide es `proximaAccion`, el MISMO que
     * ordena la cola, y calcularlo dos veces es exactamente cómo dos superficies
     * terminan diciendo cosas distintas. Sin ellos, ningún aviso caduca (el
     * comportamiento previo).
     */
    estados?: readonly (EstadoDelLead & { id: string })[]
  },
): Promise<NovedadesView> {
  const ahora = new Date()
  const revision = derivarColaRevision(leads, ahora)
  const excluidos = new Set(opts?.excludeLeadIds ?? [])
  // Sin `estados` no hay contra qué contrastar: TODO queda vigente (el
  // comportamiento previo a P23). Un índice vacío diría lo contrario —«este lead
  // ya no es tuyo» sobre cada aviso—, que es peor que no chequear.
  const puedeCaducar = opts?.estados !== undefined
  const estados = indiceDeEstados(opts?.estados ?? [])

  try {
    const [rows, totalSinLeer] = await Promise.all([
      prisma.osSetterNotice.findMany({
        where: { ...ownSetterNoticeWhere(userId), read: false },
        orderBy: { createdAt: 'desc' },
        take: AVISOS_LEIDOS,
        select: {
          id: true,
          kind: true,
          title: true,
          body: true,
          createdAt: true,
          leadId: true,
        },
      }),
      prisma.osSetterNotice.count({
        where: { ...ownSetterNoticeWhere(userId), read: false },
      }),
    ])

    // Dedup contra la cola: se filtra solo lo VISIBLE (la lista), nunca el
    // conteo del badge (que refleja lo realmente sin leer, cola incluida).
    const visibles =
      excluidos.size > 0
        ? rows.filter((row) => !(row.leadId && excluidos.has(row.leadId)))
        : rows

    const avisos: AvisoView[] = visibles.map((row) => ({
      id: row.id,
      kind: row.kind,
      title: row.title,
      body: row.body,
      hace: formatEspera(row.createdAt, ahora),
      leadId: leadAbrible(row.kind, row.leadId),
      // P23 — la ORDEN del aviso se contrasta contra el estado de AHORA del
      // lead. El aviso es un snapshot y no se entera de que el lead se movió:
      // así es como «Enviá el link ya» sobrevivía sobre un lead que la cola
      // mandaba a esperar, y como un rechazo viejo seguía pidiendo retrabajo al
      // lado de la aprobación que lo dejó sin efecto.
      ...vigenciaComoCampos(
        puedeCaducar
          ? vigenciaDeAviso(row.kind, estados.get(row.leadId ?? '') ?? null)
          : { vigente: true },
      ),
    }))

    const { filas, ocultos } = agruparAvisos(avisos, FILAS_NOVEDADES)
    return { filas, ocultos, revision, totalSinLeer }
  } catch (error) {
    console.error('[novedades] fallo no fatal al leer avisos:', error)
    return { filas: [], ocultos: 0, revision, totalSinLeer: 0 }
  }
}

/**
 * Contador del badge (topbar) — lectura liviana e indexada, sin traer los leads.
 * Resiliente: nunca rompe el layout (devuelve 0 ante un fallo).
 */
export async function contarNovedadesSinLeer(userId: string): Promise<number> {
  try {
    return await prisma.osSetterNotice.count({
      where: { ...ownSetterNoticeWhere(userId), read: false },
    })
  } catch (error) {
    console.error('[novedades] fallo no fatal al contar avisos:', error)
    return 0
  }
}

/**
 * Marca TODAS las novedades sin leer del setter como vistas. Aislada por
 * `setterId` (un setter jamás marca las de otro). Devuelve cuántas marcó.
 */
export async function marcarNovedadesVistas(userId: string): Promise<number> {
  const result = await prisma.osSetterNotice.updateMany({
    where: { ...ownSetterNoticeWhere(userId), read: false },
    data: { read: true },
  })
  return result.count
}
