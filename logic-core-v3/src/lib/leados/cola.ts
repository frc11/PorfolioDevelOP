/**
 * LeadOS P21 — LA COLA DE TRABAJO del panel.
 *
 * Por qué existe: hasta este sprint el grupo `trabajar` de la partición tenía UN
 * solo consumidor —`seleccionarFoco`— y ninguna superficie. "Entrar a la cola"
 * era, literalmente, ser el foco: un lead de los 49 que el panel tenía para
 * trabajar. Los otros 48 no se renderizaban en ninguna parte; se llegaba a ellos
 * por la cartera, que es la lista de TODO (84) y no discrimina trabajo de espera.
 *
 * Este módulo NO clasifica, NO prioriza y NO transiciona. Es POSICIONAL, igual
 * que `foco.ts`: recibe el foco ya elegido y `resto` (la misma cola ordenada,
 * sin el foco) y arma la lista que el panel muestra. El criterio de orden vive
 * en `flow.ts` (`trabajoTier`/`ordenFoco`) y el de selección en `foco.ts`;
 * cambiar cualquiera de los dos NO toca este archivo.
 *
 * El FOCO ES EL PRIMER ÍTEM DE LA COLA — no un bloque aparte que la duplique.
 * Se marca `esFoco` para que la superficie lo destaque (es el mismo lead, con la
 * misma acción, presentado más grande), y por eso `items[0].lead === foco`
 * siempre que haya foco. Un lead NUNCA aparece dos veces: `resto` es la cola sin
 * el foco (`foco.ts`), así que la concatenación es disjunta por construcción.
 *
 * Aislamiento: este módulo nunca lee la DB. La cola que recibe viene de
 * `particionarCartera(buildHomeLeads(listOwnedLeads(userId))).grupos.trabajar`,
 * filtrada por `assignedToId` en la única query. Un lead ajeno no puede entrar
 * acá porque no puede entrar en `orden`.
 */
import { motivoOrden, type HomeLead } from './flow.ts'

/**
 * Cuántos ítems muestra la cola, foco incluido.
 *
 * No es "todo lo accionable": con 49 leads para trabajar, mostrarlos todos
 * devuelve una segunda cartera —una lista que no discrimina no orienta— y hunde
 * el resto del panel. Cinco es el trabajo de un rato: el foco destacado y cuatro
 * que se leen de un vistazo. Lo que no entra NO se pierde ni se esconde: la cola
 * dice cuántos quedan y por dónde se llega (`ocultos`).
 */
export const TOPE_COLA = 5

export type ItemCola = {
  lead: HomeLead
  /** El primero: el mismo lead que el foco, presentado destacado. */
  esFoco: boolean
  /** Por qué ocupa ese lugar (`motivoOrden`, el MISMO rótulo de la cartera). */
  motivo: string | null
}

export type ColaDelDia = {
  /** El foco primero, después la cola en orden. Vacío = nada para trabajar. */
  items: ItemCola[]
  /** Todo lo accionable de la cartera (puede ser mayor que `items.length`). */
  total: number
  /** Accionables que no entran en la cola visible. `total - items.length`. */
  ocultos: number
}

/**
 * Arma la cola visible. `foco` null (nada accionable) devuelve la cola vacía con
 * total 0 — el panel muestra el "todo en espera", que ya existía.
 *
 * `tope` se inyecta (no se lee de la constante adentro) para que el chequeo de
 * invariante pueda barrer topes chicos sin depender del valor de producción.
 */
export function armarCola(
  foco: HomeLead | null,
  resto: readonly HomeLead[],
  tope: number = TOPE_COLA,
): ColaDelDia {
  if (!foco) return { items: [], total: 0, ocultos: 0 }

  const total = 1 + resto.length
  // `tope` chico o cero no puede devolver una cola sin foco: la cola SIN su
  // primer ítem no es una cola más corta, es otra cosa (el panel perdería la
  // única acción destacada). El mínimo real es 1.
  const cupo = Math.max(1, tope)

  const items: ItemCola[] = [{ lead: foco, esFoco: true, motivo: motivoOrden(foco) }]
  for (const lead of resto.slice(0, cupo - 1)) {
    items.push({ lead, esFoco: false, motivo: motivoOrden(lead) })
  }

  return { items, total, ocultos: total - items.length }
}

/**
 * Los ids de los leads que la cola RENDERIZA. Es la llave del dedup contra las
 * novedades: un aviso cuyo lead ya aparece como tarea no se repite como noticia
 * (`getNovedadesSetter#excludeLeadIds`).
 *
 * Se deriva de `items`, NO de `total` ni del grupo entero, y esa diferencia es el
 * punto: excluir por "está en trabajar" escondería el aviso de un lead que la
 * cola no llegó a mostrar (quedó entre los `ocultos`) — el aviso desaparecería
 * sin que apareciera la tarea. Excluir por lo VISIBLE no puede perder nada.
 */
export function idsEnCola(cola: ColaDelDia): string[] {
  return cola.items.map((item) => item.lead.id)
}
