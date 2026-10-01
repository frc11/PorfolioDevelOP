import { filaDelGenie, type Caja, type Lider, type Punto } from '../../_secciones/trabajos/demos/genie'

/**
 * [NAVBAR] RETOQUE 1 · LA SILUETA DEL GENIE — la forma del menú mientras sale del botón y vuelve a él.
 *
 * El vidrio de verdad (con su desenfoque, su tinte y su lente) se ve durante todo el Genie recortado por esta forma
 * (`clip-path: path()`): nace con el material, sin un relevo de una copia plana. La forma es el contorno de las filas del
 * Genie (`filaDelGenie`: los bordes izquierdo y derecho de cada fila, de arriba abajo).
 *
 * Puro y sin DOM: lo prueba `s39-navbar`.
 */

/** Cuántas filas del Genie dibujan el contorno: las mismas que las tiras del texto. */
export const FILAS_DE_LA_SILUETA = 40

export interface Silueta {
  /** El borde izquierdo, de arriba abajo. */
  readonly izquierda: readonly Punto[]
  /** El borde derecho, de arriba abajo. */
  readonly derecha: readonly Punto[]
}

/** El contorno del Genie en el progreso `m` (0 = abierto, 1 = adentro del botón), en coordenadas de la pantalla. */
export function siluetaDelGenie(m: number, ventana: Caja, destino: Caja, lider: Lider, filas = FILAS_DE_LA_SILUETA): Silueta {
  const izquierda: Punto[] = []
  const derecha: Punto[] = []
  for (let k = 0; k <= filas; k += 1) {
    const f = filaDelGenie(k / filas, m, ventana, destino, lider)
    izquierda.push({ x: f.izquierda, y: f.y })
    derecha.push({ x: f.derecha, y: f.y })
  }
  return { izquierda, derecha }
}

/** El camino SVG de la silueta, corrido por `origen` (la esquina de la caja que lo recorta). */
export function caminoDeLaSilueta(s: Silueta, origen: Punto = { x: 0, y: 0 }): string {
  const n = (p: Punto): string => `${(p.x - origen.x).toFixed(1)} ${(p.y - origen.y).toFixed(1)}`
  const borde = [...s.derecha, ...[...s.izquierda].reverse()]
  return `M ${borde.map(n).join(' L ')} Z`
}

/** Lo que la silueta recorta en cada cuadro: el vidrio (en sus coordenadas), el texto de las tiras (en las de la pantalla) y el filo. */
export interface CapasDeLaSilueta {
  readonly vidrio: HTMLElement | null
  readonly texto: HTMLElement | null
  readonly filo: SVGPathElement | null
}

/** Un cuadro de la silueta: la forma en el progreso `m`, recortando el vidrio y el texto, con el filo encima. */
export function aplicarLaSilueta(m: number, ventana: Caja, destino: Caja, lider: Lider, capas: CapasDeLaSilueta): void {
  const s = siluetaDelGenie(m, ventana, destino, lider)
  const enElPanel = caminoDeLaSilueta(s, { x: ventana.x, y: ventana.y })
  capas.vidrio?.style.setProperty('clip-path', `path('${enElPanel}')`)
  capas.texto?.style.setProperty('clip-path', `path('${caminoDeLaSilueta(s)}')`)
  capas.filo?.setAttribute('d', enElPanel)
}

/** Sin silueta: el vidrio con su borde redondeado de siempre. */
export function soltarLaSilueta(capas: CapasDeLaSilueta): void {
  capas.vidrio?.style.removeProperty('clip-path')
  capas.texto?.style.removeProperty('clip-path')
}
