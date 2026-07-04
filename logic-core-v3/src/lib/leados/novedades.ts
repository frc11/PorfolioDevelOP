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
import { formatEspera } from '@/lib/leados/revision'
import type { OwnedLeadWithDossier } from '@/lib/leados/ownership'

/** Cuántos avisos sin leer se muestran en el panel (el contador puede ser mayor). */
const AVISOS_VISIBLES = 12

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
        body: `${businessName}: la demo está aprobada. Enviá el link ya — es el momento caliente.`,
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

export type AvisoView = {
  id: string
  kind: OsSetterNoticeKind
  title: string
  body: string
  /** "hace 20 min" / "hace 3 h" — antigüedad del aviso. */
  hace: string
  /**
   * A-06 — el lead que "Abrir" ANCLA como foco (no un href de navegación
   * directa): abrir desde un aviso pasa por el MISMO mecanismo del foco, no
   * reconstituye una segunda cola. `null` cuando no hay lead abrible
   * (reasignación-saliente: el setter ya no es dueño → el aviso solo informa).
   */
  leadId: string | null
}

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
  avisos: AvisoView[]
  /** Resumen de la cola en revisión, o null si no hay ninguna. */
  revision: ColaRevisionResumen | null
  /** Avisos sin leer (badge). Puede superar `avisos.length` (que está capado). */
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
 * 2.2 — `excludeLeadId` deduplica contra el foco: el aviso cuyo lead YA es el
 * protagonista del home (el foco, arriba) NO se repite en la lista. Es solo
 * presentación: ese aviso sigue SIN LEER (el badge `totalSinLeer` lo cuenta igual)
 * — cuando el foco cambie, reaparece. El aislamiento (`setterId`) no se toca.
 */
export async function getNovedadesSetter(
  userId: string,
  leads: OwnedLeadWithDossier[],
  opts?: { excludeLeadId?: string | null },
): Promise<NovedadesView> {
  const ahora = new Date()
  const revision = derivarColaRevision(leads, ahora)
  const excluido = opts?.excludeLeadId ?? null

  try {
    const [rows, totalSinLeer] = await Promise.all([
      prisma.osSetterNotice.findMany({
        where: { ...ownSetterNoticeWhere(userId), read: false },
        orderBy: { createdAt: 'desc' },
        take: AVISOS_VISIBLES,
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

    // Dedup del foco: se filtra solo lo VISIBLE (la lista), nunca el conteo del
    // badge (que refleja lo realmente sin leer, foco incluido).
    const visibles = excluido ? rows.filter((row) => row.leadId !== excluido) : rows

    const avisos: AvisoView[] = visibles.map((row) => ({
      id: row.id,
      kind: row.kind,
      title: row.title,
      body: row.body,
      hace: formatEspera(row.createdAt, ahora),
      leadId: leadAbrible(row.kind, row.leadId),
    }))

    return { avisos, revision, totalSinLeer }
  } catch (error) {
    console.error('[novedades] fallo no fatal al leer avisos:', error)
    return { avisos: [], revision, totalSinLeer: 0 }
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
