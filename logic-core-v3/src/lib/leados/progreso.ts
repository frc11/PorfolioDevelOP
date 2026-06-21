/**
 * LeadOS 0.5.x — Señal de avance del setter (home). SOLO presentación de datos
 * que YA existen: los contactos comerciales que el setter hizo, las demos que
 * envió y las reuniones que agendó en los últimos días. NO es gamificación ni
 * ranking ni métrica de vanidad — es un acuse SOBRIO de "esto laburaste", del
 * propio setter y de nadie más. Sin metas, sin comparación, sin racha.
 *
 * Aislamiento (regla de oro):
 *   - contactos → `performedById = userId` (atribución DIRECTA: lo hizo él;
 *     vale aunque el lead se haya reasignado después — el contacto fue suyo);
 *   - demos / reuniones → derivadas de los leads YA filtrados por `assignedToId`
 *     (`listOwnedLeads`), cero queries nuevas y cero campos nuevos. Mismo criterio
 *     de atribución por cartera vigente que el marcador "Demos aprobadas".
 *
 * Ventana MÓVIL de 7 días (no semana calendario): evita el cero-lunes que se
 * sentiría vacío y castigador; siempre refleja el laburo reciente. Pura: `ahora`
 * se inyecta (espejo de `derivarDemosEnCola`).
 */
import { prisma } from '@/lib/prisma'
import { SOLO_CONTACTOS_COMERCIALES } from '@/lib/leados/isolation'
import { AgendaSchema } from '@/lib/leados/contracts'
import type { OwnedLeadWithDossier } from '@/lib/leados/ownership'

/** Días de la ventana móvil de la señal. */
export const PROGRESO_VENTANA_DIAS = 7

export type ProgresoSemana = {
  /** Contactos comerciales que el setter registró en la ventana (openers + follow-ups). */
  contactos: number
  /** Demos aprobadas que el setter envió en la ventana (`dossier.enviadaAt`). */
  demos: number
  /** Reuniones que el setter agendó en la ventana (`agendaJson.agendadaAt`, AGENDADA). */
  reuniones: number
  /** Total — atajo para decidir si la señal se muestra (0 ⇒ oculta, sin ceros que culpen). */
  total: number
  /** Días de la ventana, para el copy ("últimos 7 días"). */
  dias: number
}

function inicioVentana(ahora: Date, dias: number): Date {
  return new Date(ahora.getTime() - dias * 24 * 60 * 60 * 1000)
}

/**
 * Deriva demos enviadas + reuniones agendadas dentro de la ventana, EN MEMORIA,
 * de los leads ya cargados. `contactos` llega contado de la DB. Pura — `ahora`
 * inyectado, sin acceso a Neon (testeable como `derivarDemosEnCola`).
 */
export function derivarProgresoSemana(
  leads: OwnedLeadWithDossier[],
  contactos: number,
  ahora: Date,
): ProgresoSemana {
  const desde = inicioVentana(ahora, PROGRESO_VENTANA_DIAS)
  let demos = 0
  let reuniones = 0

  for (const lead of leads) {
    const dossier = lead.dossier
    if (!dossier) continue

    if (dossier.enviadaAt && dossier.enviadaAt >= desde) {
      demos += 1
    }

    const agenda = AgendaSchema.safeParse(dossier.agendaJson)
    if (agenda.success && agenda.data.estado === 'AGENDADA' && agenda.data.agendadaAt) {
      if (new Date(agenda.data.agendadaAt) >= desde) reuniones += 1
    }
  }

  const total = contactos + demos + reuniones
  return { contactos, demos, reuniones, total, dias: PROGRESO_VENTANA_DIAS }
}

/**
 * La señal de avance del home. Recibe los leads YA cargados (`listOwnedLeads` en
 * el page) — solo suma UNA lectura: el conteo de contactos comerciales propios de
 * la ventana. Resiliente: un fallo de lectura devuelve la señal sin contactos (las
 * demos/reuniones derivadas igual cuentan); nunca rompe el home.
 */
export async function getProgresoSemana(
  userId: string,
  leads: OwnedLeadWithDossier[],
): Promise<ProgresoSemana> {
  const ahora = new Date()
  const desde = inicioVentana(ahora, PROGRESO_VENTANA_DIAS)

  let contactos = 0
  try {
    contactos = await prisma.osLeadActivity.count({
      where: {
        performedById: userId,
        ...SOLO_CONTACTOS_COMERCIALES,
        createdAt: { gte: desde },
      },
    })
  } catch (error) {
    console.error('[progreso] fallo no fatal al contar contactos:', error)
  }

  return derivarProgresoSemana(leads, contactos, ahora)
}
