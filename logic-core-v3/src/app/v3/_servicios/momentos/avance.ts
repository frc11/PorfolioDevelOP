/**
 * [M3] EL AVANCE DE UN MOMENTO — puro (sin react), para que los tests lo prueben en Node. Dos maneras de leer el scroll:
 *   · `avanceClavado`: un tramo alto con un escenario `sticky` adentro; 0 con el tope del tramo arriba de la pantalla, 1 con su final abajo;
 *   · `avanceDelCruce`: un elemento que cruza la pantalla; 0 con su tope en `desde` del alto, 1 con su tope en `hasta`.
 */

import { acotar01 } from '../../_lib/acotar'

export function avanceClavado(tope: number, alto: number, altoDePantalla: number): number {
  const recorrido = alto - altoDePantalla
  return recorrido > 0 ? acotar01(-tope / recorrido) : 1
}

export function avanceDelCruce(tope: number, altoDePantalla: number, desde = 0.9, hasta = 0.45): number {
  if (!(altoDePantalla > 0) || !(desde > hasta)) return 1
  return acotar01((desde * altoDePantalla - tope) / ((desde - hasta) * altoDePantalla))
}

/** El tramo `[desde, hasta]` de un avance, llevado a 0 → 1. */
export function tramo(v: number, desde: number, hasta: number): number {
  return hasta > desde ? acotar01((v - desde) / (hasta - desde)) : v >= hasta ? 1 : 0
}
