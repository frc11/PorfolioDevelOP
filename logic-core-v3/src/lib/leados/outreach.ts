/**
 * LeadOS B6 — Lecturas de outreach del setter, con aislamiento.
 *
 * Mismo criterio que ownership.ts: las actividades de un lead se alcanzan
 * SOLO vía el lead propio (`getOwnedLead`), y el conteo de DMs del día se
 * filtra por `performedById` (los DMs del PROPIO setter — alimenta la capa
 * de seguridad de canal, que informa y nunca bloquea). Derivado de
 * OsLeadActivity: cero tablas nuevas.
 */
import type { OsLeadActivity } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { SOLO_CONTACTOS_COMERCIALES, dmsMandadosHoyWhere } from '@/lib/leados/isolation'
import { getOwnedLead } from '@/lib/leados/ownership'

const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires'

/**
 * Límites del día argentino — mismo criterio de calendario que el cron
 * os-follow-up (que tiene su propia copia privada; el cron NO se toca).
 */
function limitesDelDiaArgentino(ahora: Date): { desde: Date; hasta: Date } {
  const fecha = new Intl.DateTimeFormat('en-CA', {
    timeZone: ARGENTINA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora)

  return {
    desde: new Date(`${fecha}T00:00:00.000-03:00`),
    hasta: new Date(`${fecha}T23:59:59.999-03:00`),
  }
}

/**
 * Actividades del lead (contactos reales, las más nuevas primero), solo si
 * el lead es del setter. `null` si no existe o no es suyo (404-style, sin
 * leakear existencia — mismo criterio que getOwnedLead).
 */
export async function listOwnedLeadActivities(
  leadId: string,
  userId: string,
): Promise<OsLeadActivity[] | null> {
  const lead = await getOwnedLead(leadId, userId)
  if (!lead) return null
  // Solo contactos comerciales reales: el rastro de reasignación (SISTEMA)
  // queda fuera para no inflar `contactos`/`ultimoContacto` ni abrir el paso
  // de seguimiento antes del primer contacto real.
  return prisma.osLeadActivity.findMany({
    where: { leadId: lead.id, ...SOLO_CONTACTOS_COMERCIALES },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * DMs de Instagram que ESTE setter MANDÓ hoy (día argentino, todos sus leads).
 * Conteo derivado para la capa de seguridad de canal.
 *
 * El `where` NO se arma acá: sale entero de `dmsMandadosHoyWhere` (isolation.ts),
 * que es lo que `contador-dms.invariant.ts` afirma. Antes el eje de canal estaba
 * inline y el discriminador de resultado se spreadeaba en esta misma expresión;
 * revertir esa línea —el bug que F1 arregló: sin el filtro de resultado, postergar
 * un contacto subía el número sin que saliera un solo DM— dejaba el invariante en
 * verde, porque afirmaba sobre una réplica y nunca sobre esta consulta.
 * Sigue siendo informativo: nada acá bloquea.
 */
export async function contarDmsHoy(userId: string): Promise<number> {
  const { desde, hasta } = limitesDelDiaArgentino(new Date())
  return prisma.osLeadActivity.count({
    where: dmsMandadosHoyWhere(userId, desde, hasta),
  })
}
