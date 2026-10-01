import { filaDelGenie, type Caja, type Lider, type Punto } from '../../_secciones/trabajos/demos/genie'

/**
 * [NAVBAR] RETOQUE 1 Y 2 · LA SILUETA DEL GENIE — la forma del menú mientras sale del botón y vuelve a él.
 *
 * El vidrio de verdad (con su desenfoque, su tinte y su lente) se ve durante todo el Genie recortado por esta forma
 * (`clip-path: path()`): nace con el material, sin un relevo de una copia plana. La forma es el contorno de las filas del
 * Genie (`filaDelGenie`: los bordes izquierdo y derecho de cada fila, de arriba abajo) con las cuatro esquinas
 * redondeadas: el radio va del del panel (abierto) al del botón (adentro), y como el destino es el botón —48 × 48—, con
 * su radio la forma ES el círculo. No se ve una punta en ningún momento: todo sale del botón y vuelve a él.
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

/** El radio de las esquinas en el progreso `m`: el del panel abierto, el del botón adentro. */
export const radioDeLaSilueta = (m: number, radioDelPanel: number, radioDelBoton: number): number => radioDelPanel + (radioDelBoton - radioDelPanel) * Math.min(1, Math.max(0, m))

const distancia = (a: Punto, b: Punto): number => Math.hypot(b.x - a.x, b.y - a.y)

function largo(linea: readonly Punto[]): number {
  let total = 0
  for (let i = 1; i < linea.length; i += 1) total += distancia(linea[i - 1], linea[i])
  return total
}

/** El punto de la línea a `d` de su comienzo, medido sobre ella. */
function puntoA(linea: readonly Punto[], d: number): Punto {
  let resto = Math.max(0, d)
  for (let i = 1; i < linea.length; i += 1) {
    const tramo = distancia(linea[i - 1], linea[i])
    if (resto <= tramo) {
      const t = tramo === 0 ? 0 : resto / tramo
      return { x: linea[i - 1].x + (linea[i].x - linea[i - 1].x) * t, y: linea[i - 1].y + (linea[i].y - linea[i - 1].y) * t }
    }
    resto -= tramo
  }
  return linea[linea.length - 1]
}

/** Los vértices de la línea estrictamente entre `d0` y `d1` de su comienzo. */
function entre(linea: readonly Punto[], d0: number, d1: number): Punto[] {
  const salida: Punto[] = []
  let recorrido = 0
  for (let i = 1; i < linea.length - 1; i += 1) {
    recorrido += distancia(linea[i - 1], linea[i])
    if (recorrido > d0 && recorrido < d1) salida.push(linea[i])
  }
  return salida
}

/** La constante del cuarto de círculo con una cúbica: con ella el 48 × 48 de radio 24 ES el círculo del botón. */
const KAPPA = 0.5523

/** Una esquina redondeada: de `p` (ya en el camino) a `q`, doblando en `esquina`. */
function esquina(p: Punto, punta: Punto, q: Punto, n: (x: Punto) => string): string {
  const c1 = { x: p.x + (punta.x - p.x) * KAPPA, y: p.y + (punta.y - p.y) * KAPPA }
  const c2 = { x: q.x + (punta.x - q.x) * KAPPA, y: q.y + (punta.y - q.y) * KAPPA }
  return `C ${n(c1)} ${n(c2)} ${n(q)}`
}

/** Hacia `b` desde `a`, de largo `r`. */
function hacia(a: Punto, b: Punto, r: number): Punto {
  const d = distancia(a, b)
  return d === 0 ? a : { x: a.x + ((b.x - a.x) / d) * r, y: a.y + ((b.y - a.y) / d) * r }
}

/**
 * El camino SVG de la silueta, con las cuatro esquinas redondeadas a `radio` (cada una acotada a la mitad de los lados
 * que la tocan: una forma angosta no se dobla sobre sí misma), corrido por `origen` (la esquina de la caja que lo recorta).
 */
export function caminoDeLaSilueta(s: Silueta, radio: number, origen: Punto = { x: 0, y: 0 }): string {
  const iz = s.izquierda
  const de = s.derecha
  const [a, b] = [iz[0], de[0]]
  const [c, d] = [de[de.length - 1], iz[iz.length - 1]]
  const [largoIz, largoDe] = [largo(iz), largo(de)]
  const rArriba = Math.max(0, Math.min(radio, distancia(a, b) / 2, largoIz / 2, largoDe / 2))
  const rAbajo = Math.max(0, Math.min(radio, distancia(d, c) / 2, largoIz / 2, largoDe / 2))
  const izArriba = [...iz].reverse()
  const n = (p: Punto): string => `${(p.x - origen.x).toFixed(1)} ${(p.y - origen.y).toFixed(1)}`
  const [p1, p2] = [hacia(a, b, rArriba), hacia(b, a, rArriba)]
  const [p3, p4] = [puntoA(de, rArriba), puntoA(de, largoDe - rAbajo)]
  const [p5, p6] = [hacia(c, d, rAbajo), hacia(d, c, rAbajo)]
  const [p7, p8] = [puntoA(izArriba, rAbajo), puntoA(izArriba, largoIz - rArriba)]
  const partes = [
    `M ${n(p1)}`,
    `L ${n(p2)}`,
    esquina(p2, b, p3, n),
    ...entre(de, rArriba, largoDe - rAbajo).map((p) => `L ${n(p)}`),
    `L ${n(p4)}`,
    esquina(p4, c, p5, n),
    `L ${n(p6)}`,
    esquina(p6, d, p7, n),
    ...entre(izArriba, rAbajo, largoIz - rArriba).map((p) => `L ${n(p)}`),
    `L ${n(p8)}`,
    esquina(p8, a, p1, n),
    'Z',
  ]
  return partes.join(' ')
}

/** Lo que la silueta recorta en cada cuadro: el vidrio (en sus coordenadas), el texto de las tiras (en las de la pantalla) y el filo. */
export interface CapasDeLaSilueta {
  readonly vidrio: HTMLElement | null
  readonly texto: HTMLElement | null
  readonly filo: SVGPathElement | null
}

/** Un cuadro de la silueta: la forma en el progreso `m`, recortando el vidrio y el texto, con el filo encima. */
export function aplicarLaSilueta(m: number, ventana: Caja, destino: Caja, lider: Lider, radioDelPanel: number, capas: CapasDeLaSilueta): void {
  const s = siluetaDelGenie(m, ventana, destino, lider)
  const r = radioDeLaSilueta(m, radioDelPanel, destino.ancho / 2)
  const enElPanel = caminoDeLaSilueta(s, r, { x: ventana.x, y: ventana.y })
  capas.vidrio?.style.setProperty('clip-path', `path('${enElPanel}')`)
  capas.texto?.style.setProperty('clip-path', `path('${caminoDeLaSilueta(s, r)}')`)
  capas.filo?.setAttribute('d', enElPanel)
}

/** Sin silueta: el vidrio con su borde redondeado de siempre. */
export function soltarLaSilueta(capas: CapasDeLaSilueta): void {
  capas.vidrio?.style.removeProperty('clip-path')
  capas.texto?.style.removeProperty('clip-path')
}
