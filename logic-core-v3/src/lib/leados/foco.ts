/**
 * LeadOS 2.1a — Selección del FOCO ("modo dirección").
 *
 * Módulo PURO (sin Prisma, sin server-only, sin `Date.now`): elige UN lead
 * accionable a la vez sobre la cola `trabajar` YA ordenada por `ordenUrgencia`
 * (respondió → caliente → resto). NO clasifica ni transiciona — solo decide
 * cuál es el foco y cuál el próximo, respetando el sticky (D7).
 *
 * Sticky (D7): mientras el setter trabaja un lead, ese lead queda FIJO como foco
 * aunque entre uno más urgente. El más urgente aparece como `proximo`, no
 * desplaza al anclado. Si el lead anclado ya NO está en `trabajar` (lo cerró, lo
 * perdió, se lo reasignaron o avanzó de etapa), el sticky se ignora y el foco
 * recae en la cima de la cola — la invalidación es por construcción (no hace
 * falta escribir cookies en el render: un sticky que no matchea simplemente no
 * pesa, y se corrige al anclar el próximo lead real).
 *
 * Aislamiento: `orden` viene de
 * `particionarCartera(buildHomeLeads(listOwnedLeads(userId))).grupos.trabajar`,
 * filtrado por dueño; este módulo nunca lee la DB.
 */
import type { HomeLead } from './flow'

export type FocoSeleccion = {
  /** El lead protagonista a trabajar ahora, o null si no hay nada accionable. */
  foco: HomeLead | null
  /** El siguiente accionable (lo que viene después del foco), o null. */
  proximo: HomeLead | null
  /** Cuántos accionables quedan además del foco. */
  restantes: number
  /** Total de accionables en la cola "trabajar". */
  total: number
  /** El foco lo sostiene un sticky válido (no es solo la cima por defecto). */
  stickyActivo: boolean
}

export function seleccionarFoco(
  orden: readonly HomeLead[],
  stickyId: string | null,
): FocoSeleccion {
  const total = orden.length
  if (total === 0) {
    return { foco: null, proximo: null, restantes: 0, total: 0, stickyActivo: false }
  }

  // El sticky solo vale si el lead anclado sigue en la cola accionable; si no,
  // queda invalidado y el foco recae en la cima (la cola ya viene ordenada por
  // urgencia, así que la cima es lo más urgente).
  const ancladoIdx = stickyId ? orden.findIndex((lead) => lead.id === stickyId) : -1
  const focoIdx = ancladoIdx >= 0 ? ancladoIdx : 0

  const foco = orden[focoIdx]
  const resto = orden.filter((_, indice) => indice !== focoIdx)

  return {
    foco,
    proximo: resto[0] ?? null,
    restantes: resto.length,
    total,
    stickyActivo: ancladoIdx >= 0,
  }
}
