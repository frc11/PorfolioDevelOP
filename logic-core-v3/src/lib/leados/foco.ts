/**
 * LeadOS 2.1a — Selección del FOCO ("modo dirección").
 *
 * Módulo PURO (sin Prisma, sin server-only, sin `Date.now`): elige UN lead
 * accionable a la vez sobre la cola `trabajar` YA ordenada por `ordenFoco`
 * (P8: fijado → construir → espera tu acción → contactar con demo → evaluar →
 * contacto sin demo; la urgencia vieja quedó como desempate dentro del tier).
 * NO clasifica, NO prioriza y NO transiciona: es POSICIONAL — toma la cima de la
 * cola que le entregan y respeta el sticky (D7). El criterio vive en `flow.ts`
 * (`trabajoTier`); cambiarlo NO toca este archivo.
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
  /**
   * Todo lo accionable MENOS el foco, en el orden de la cola. Es el array que
   * esta función ya construía para derivar `proximo` y `restantes`; se expone
   * porque la COLA del panel (`cola.ts`) necesita el orden completo, no solo la
   * cima. Exponerlo evita la única alternativa: reconstruir en otro módulo el
   * mismo "sacá el foco de la cola", que es exactamente cómo dos criterios
   * empiezan a divergir. `proximo === resto[0]` y `restantes === resto.length`
   * por construcción — no son tres decisiones, es una.
   */
  resto: HomeLead[]
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
    return { foco: null, proximo: null, resto: [], restantes: 0, total: 0, stickyActivo: false }
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
    resto,
    restantes: resto.length,
    total,
    stickyActivo: ancladoIdx >= 0,
  }
}
