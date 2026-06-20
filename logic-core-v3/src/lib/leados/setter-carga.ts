/**
 * LeadOS — Carga y ratio por setter para la asignación admin.
 *
 * Franco asigna leads desde el detalle (`/admin/leads/[id]`). Antes el dropdown
 * de "Setter asignado" no mostraba a quién le estaba cargando trabajo: la carga
 * (leads activos) y el ratio descarte/avance YA se calculaban, pero enterrados
 * en `/admin/leados`. Este módulo junta ambos por setter para que la asignación
 * no sea a ciegas. Reusa `calcularRatioSetters` (no recalcula el ratio) — misma
 * fuente que la cola de revisión, así los dos lados cuentan igual.
 *
 *   - Carga activa: leads asignados que NO están en estado terminal
 *     (CERRADO / PERDIDO). Es el trabajo VIVO del setter — lo que sube si le
 *     cargás otro lead.
 *   - Ratio: % de descarte total + alarma anti-rubber-stamp, derivados del
 *     mismo cálculo puro (`revision.ts`) que `/admin/leados`.
 *
 * `ahora` se estampa ACÁ (función async de lib, no en el render del Server
 * Component) para no disparar `react-hooks/purity` en la página que lo consume.
 */
import type { LeadStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseEvaluacion } from '@/lib/leados/flow'
import {
  alarmaNuncaDescarta,
  calcularRatioSetters,
  pctDescarte,
  type EvaluacionDeSetter,
} from '@/lib/leados/revision'

/** Estados donde el lead ya salió del trabajo activo del setter (no suma carga). */
const ESTADOS_TERMINALES: LeadStatus[] = ['CERRADO', 'PERDIDO']

export type RatioResumen = {
  evaluadas: number
  /** % de descarte sobre el total (0–100). null si todavía no evaluó nada. */
  pctDescarte: number | null
  /** Volumen suficiente y cero descartes: criterio a revisar. */
  alarma: boolean
}

export type CargaSetter = {
  setterId: string
  /** Leads asignados activos (no terminales). */
  activos: number
  /** Resumen del ratio descarte/avance. null si no hay evaluaciones. */
  ratio: RatioResumen | null
}

function setterLabel(assignedTo: { name: string | null; email: string }): string {
  return assignedTo.name ?? assignedTo.email
}

/**
 * Carga + ratio para un conjunto de setters, indexado por id para join O(1) en
 * el caller. Un setter sin actividad → `activos: 0` y `ratio: null` (no rompe el
 * render; el caller decide cómo mostrar "sin datos").
 */
export async function cargarCargaSetters(
  setterIds: string[],
): Promise<Map<string, CargaSetter>> {
  if (setterIds.length === 0) return new Map()

  const ahora = new Date()
  const [cargaRows, dossiersEvaluados] = await Promise.all([
    // Carga viva: leads no terminales por dueño (un solo agregado, no N counts).
    prisma.osLead.groupBy({
      by: ['assignedToId'],
      where: {
        assignedToId: { in: setterIds },
        status: { notIn: ESTADOS_TERMINALES },
      },
      _count: { _all: true },
    }),
    // Insumo del ratio: mismas filas que `/admin/leados`, filtradas en JS con el
    // contrato zod. Volumen chico (pocos setters) → barato.
    prisma.osLeadDossier.findMany({
      where: { lead: { assignedToId: { in: setterIds } } },
      select: {
        evaluacionJson: true,
        lead: {
          select: { assignedTo: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
  ])

  const activosPorSetter = new Map<string, number>()
  for (const row of cargaRows) {
    if (row.assignedToId === null) continue
    activosPorSetter.set(row.assignedToId, row._count._all)
  }

  const filasMetrica = dossiersEvaluados.flatMap<EvaluacionDeSetter>((dossier) => {
    const evaluacion = parseEvaluacion(dossier.evaluacionJson)
    const assignedTo = dossier.lead.assignedTo
    if (!evaluacion || !assignedTo) return []
    return [
      {
        setterId: assignedTo.id,
        setterLabel: setterLabel(assignedTo),
        evaluacion,
      },
    ]
  })
  const ratioPorSetter = new Map(
    calcularRatioSetters(filasMetrica, ahora).map((ratio) => [ratio.setterId, ratio]),
  )

  const out = new Map<string, CargaSetter>()
  for (const setterId of setterIds) {
    const ratio = ratioPorSetter.get(setterId)
    out.set(setterId, {
      setterId,
      activos: activosPorSetter.get(setterId) ?? 0,
      ratio: ratio
        ? {
            evaluadas: ratio.total.evaluadas,
            pctDescarte: pctDescarte(ratio.total),
            alarma: alarmaNuncaDescarta(ratio.total),
          }
        : null,
    })
  }
  return out
}
