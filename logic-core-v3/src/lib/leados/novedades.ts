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
 *   - la derivación LIVE de "tu demo en cola hace X" (`derivarDemosEnCola`), que
 *     NO es un evento sino el estado vigente de las demos EN_REVISION del setter
 *     (lo que Franco ya ve del otro lado vía pipeline/revision).
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
  /** Link al lead, o null cuando ya no es abrible (reasignación-saliente). */
  href: string | null
}

export type DemoEnColaView = {
  leadId: string
  businessName: string
  /** Hace cuánto la demo espera revisión de Franco (lo que él ve del otro lado). */
  hace: string
  href: string
}

export type NovedadesView = {
  avisos: AvisoView[]
  enCola: DemoEnColaView[]
  /** Avisos sin leer (badge). Puede superar `avisos.length` (que está capado). */
  totalSinLeer: number
}

/** Link del aviso: el saliente NUNCA linkea (el setter no es dueño); el resto sí. */
function hrefNovedad(kind: OsSetterNoticeKind, leadId: string | null): string | null {
  if (kind === 'LEAD_REASIGNADO_SALIENTE' || !leadId) return null
  return `/setter/leads/${leadId}`
}

/**
 * Demos del setter EN_REVISION, de la que más espera a la que menos. Derivada
 * (cero campos nuevos) de los leads YA filtrados por `assignedToId`
 * (`listOwnedLeads`): el aislamiento de la cola es el de la cartera. El proxy de
 * "desde cuándo espera" es `dossier.updatedAt` — la transición a EN_REVISION es
 * su último write, mismo criterio que `ordenarCola` (revision.ts). Pura: `ahora`
 * se inyecta.
 */
export function derivarDemosEnCola(
  leads: OwnedLeadWithDossier[],
  ahora: Date,
): DemoEnColaView[] {
  const enCola: { leadId: string; businessName: string; esperaDesde: Date }[] = []
  for (const lead of leads) {
    const dossier = lead.dossier
    if (dossier?.stage === 'EN_REVISION') {
      enCola.push({
        leadId: lead.id,
        businessName: lead.businessName,
        esperaDesde: dossier.updatedAt,
      })
    }
  }
  enCola.sort((a, b) => a.esperaDesde.getTime() - b.esperaDesde.getTime())
  return enCola.map((demo) => ({
    leadId: demo.leadId,
    businessName: demo.businessName,
    hace: formatEspera(demo.esperaDesde, ahora),
    href: `/setter/leads/${demo.leadId}`,
  }))
}

/**
 * El panorama de novedades del home: avisos dirigidos sin leer + las demos en
 * cola (live). Recibe los leads YA cargados (`listOwnedLeads` en el page) para no
 * pegarle dos veces a la cartera. Resiliente: si la lectura de avisos falla, la
 * cola (derivada de los leads) igual se muestra y la cartera no se rompe.
 */
export async function getNovedadesSetter(
  userId: string,
  leads: OwnedLeadWithDossier[],
): Promise<NovedadesView> {
  const ahora = new Date()
  const enCola = derivarDemosEnCola(leads, ahora)

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

    const avisos: AvisoView[] = rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      title: row.title,
      body: row.body,
      hace: formatEspera(row.createdAt, ahora),
      href: hrefNovedad(row.kind, row.leadId),
    }))

    return { avisos, enCola, totalSinLeer }
  } catch (error) {
    console.error('[novedades] fallo no fatal al leer avisos:', error)
    return { avisos: [], enCola, totalSinLeer: 0 }
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
