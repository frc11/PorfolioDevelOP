import { acotar01 } from '../../_lib/acotar'
import type { SegmentoDelTrazo } from '../../_lib/titulos3d/registro'
import { CORTE_DE_LA_VENTANA_DEL_TRAZO, DESFASE_DE_LAS_BARRAS } from '../_contrato/bloqueAnimado'
import { TRAZOS_DEL_SIGNO, type TipoDeTrazo } from '../_contrato/canales'

/**
 * [RETOQUE PANEL] T4 · LAS RAYAS DEL TITULAR EN VOLUMEN — el subrayado de «algo distinto», el tachado de «lo mismo de
 * siempre» y los trazos del ≠, como barras extruidas del título de la escena: crecen con la MISMA cuenta que las del DOM
 * (`coreografia-animada.tsx`, `TrazoAnimado` y `SignoDistintoAnimado`: el mismo corte de la ventana, el mismo desfase de
 * las barras y la misma curva), así que se dibujan en el mismo orden y al mismo ritmo. La curva va escrita acá (el árbol
 * quieto no importa valores del sistema de motion): es `CURVAS.principal`, power1.out, y `s46` afirma que es la misma.
 * Dónde va cada una se mide en el DOM una vez, al armarse el título (`SegmentoDelTrazo`: px de la caja de su lugar, sin
 * transformaciones).
 */

const CORTE = CORTE_DE_LA_VENTANA_DEL_TRAZO

/** `CURVAS.principal` (power1.out: la cuadrática de salida). */
export const principal = (t: number): number => 1 - (1 - t) ** 2

/** El avance de la raya de un tramo (0 a 1) con el progreso de la ventana del trazo: el subrayado primero, después el tachado. */
export function avanceDelTrazo(tipo: TipoDeTrazo, p: number): number {
  return principal(acotar01(tipo === 'tachado' ? (p - CORTE) / (1 - CORTE) : p / CORTE))
}

/** Los avances de los trazos del ≠: la barra de arriba, la de abajo (un poco después) y las dos mitades de la diagonal (con el tachado). */
export function avancesDelSigno(p: number): readonly [number, number, number] {
  const tramo = CORTE * (1 - DESFASE_DE_LAS_BARRAS)
  return [principal(acotar01(p / tramo)), principal(acotar01((p - CORTE * DESFASE_DE_LAS_BARRAS) / tramo)), principal(acotar01((p - CORTE) / (1 - CORTE)))]
}

/** La escala con que se ve un elemento (una transformación de más arriba): las medidas en pantalla, a px de su caja. */
function escalaDe(el: HTMLElement, caja: DOMRect): number {
  return el.offsetWidth > 0 && caja.width > 0 ? caja.width / el.offsetWidth : 1
}

/** La raya de un `Trazo` del DOM (su `[data-parte="linea"]`) en la caja de su lugar: de la punta de la izquierda a la de la derecha. */
export function rayaDelTrazo(lugar: HTMLElement | null): SegmentoDelTrazo | null {
  const linea = lugar?.querySelector<HTMLElement>('[data-parte="linea"]') ?? null
  if (lugar === null || linea === null) return null
  const c = lugar.getBoundingClientRect()
  const r = linea.getBoundingClientRect()
  const k = escalaDe(lugar, c)
  // La raya del DOM crece con `scaleX` desde la izquierda: su izquierda es la de siempre; su largo, el de su caja.
  const x1 = (r.left - c.left) / k
  const y = (r.top - c.top) / k + linea.offsetHeight / 2
  return { x1, y1: y, x2: x1 + linea.offsetWidth, y2: y, grosor: linea.offsetHeight }
}

/** Los cuatro trazos del ≠ en la caja de su lugar: las dos barras y las dos mitades de la diagonal (cada una desde su punta de afuera). */
export function trazosDelSigno(lugar: HTMLElement | null): readonly (SegmentoDelTrazo | null)[] {
  const svg = lugar?.querySelector<SVGSVGElement>('[data-signo="distinto"]') ?? null
  const linea = svg?.querySelector('line') ?? null
  if (lugar === null || svg === null || linea === null) return [null, null, null, null]
  const c = lugar.getBoundingClientRect()
  const s = svg.getBoundingClientRect()
  const k = escalaDe(lugar, c)
  const lado = s.width / k / TRAZOS_DEL_SIGNO.lado
  const x0 = (s.left - c.left) / k
  const y0 = (s.top - c.top) / k
  const grosor = parseFloat(getComputedStyle(linea).strokeWidth) || 0
  const segmento = (t: { readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number }): SegmentoDelTrazo => ({ x1: x0 + t.x1 * lado, y1: y0 + t.y1 * lado, x2: x0 + t.x2 * lado, y2: y0 + t.y2 * lado, grosor })
  return [...TRAZOS_DEL_SIGNO.barras.map(segmento), ...TRAZOS_DEL_SIGNO.mitadesDeLaDiagonal.map(segmento)]
}
