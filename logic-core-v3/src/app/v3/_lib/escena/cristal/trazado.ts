import { CRISTAL } from './cristal'
import { GRIETAS } from './grietas'

/**
 * [NOCTURNO B9] EL TRAZADO DE LAS GRIETAS (puro). Todo en el muro DESENROLLADO, alrededor de un centro: `x` es la distancia a lo largo
 * del muro desde el centro (u, con signo, por la vuelta más corta) y `y` la altura desde el piso. El centro es donde la cámara mira el
 * muro cuando se agrieta (`ventanaEnElMuro`): las grietas nacen a la vista y después quedan fijas en el cristal.
 *
 * Cada tramo lleva cuándo le llega el frente a cada punta (`t0`, `t1`: 0 a 1 de la formación), así se forman desde los impactos hacia
 * las puntas y se cierran al revés; y su grosor. Las tres formas, en `formas.ts`; `empaquetar` los reparte en la rejilla que lee el
 * sombreador (`grietasDelVidrio.ts`).
 */
type P = readonly [number, number]
type V3 = readonly [number, number, number]

export interface Ventana {
  /** El u del centro (absoluto, en el muro desenrollado). */
  readonly centro: number
  /** La caja que se ve, en coordenadas locales. */
  readonly desde: P
  readonly hasta: P
}

export interface Tramo {
  readonly a: P
  readonly b: P
  readonly t0: number
  readonly t1: number
  readonly grosor: number
}

const VUELTA = 2 * Math.PI * CRISTAL.muro.radio
/** Lo mínimo de la ventana (u): una cámara que casi no ve el muro igual tiene dónde agrietarlo. */
const VENTANA_MINIMA = 6

/** La distancia con signo alrededor del muro, desde `centro`, por la vuelta más corta. */
export function alrededor(u: number, centro: number): number {
  return ((((u - centro + VUELTA / 2) % VUELTA) + VUELTA) % VUELTA) - VUELTA / 2
}

/** Dónde cruza el muro un rayo que sale de adentro (`o`, dirección `d`): u absoluto y altura desde el piso; o `null`. */
export function enElMuro(o: V3, d: V3, piso: number): P | null {
  const R = CRISTAL.muro.radio
  const a = d[0] * d[0] + d[2] * d[2]
  if (a < 1e-9) return null
  const b = 2 * (o[0] * d[0] + o[2] * d[2])
  const c = o[0] * o[0] + o[2] * o[2] - R * R
  const disc = b * b - 4 * a * c
  if (disc < 0) return null
  const t = (-b + Math.sqrt(disc)) / (2 * a)
  if (!(t > 0)) return null
  return [Math.atan2(o[0] + d[0] * t, o[2] + d[2] * t) * R, o[1] + d[1] * t - piso]
}

/**
 * Lo que la cámara ve del muro: los rayos de una grilla del cuadro (el primero, el del centro) donde cruzan el muro. Acotada al alto del
 * muro, a `ventanaMaxima` de la vuelta y a un mínimo.
 */
export function ventanaEnElMuro(ojo: V3, rayos: readonly V3[], piso: number): Ventana | null {
  const centro = rayos[0] === undefined ? null : enElMuro(ojo, rayos[0], piso)
  if (centro === null) return null
  let x0 = 0
  let x1 = 0
  let y0 = centro[1]
  let y1 = centro[1]
  for (const r of rayos) {
    const p = enElMuro(ojo, r, piso)
    if (p === null) continue
    const x = alrededor(p[0], centro[0])
    x0 = Math.min(x0, x)
    x1 = Math.max(x1, x)
    y0 = Math.min(y0, p[1])
    y1 = Math.max(y1, p[1])
  }
  const mitad = (GRIETAS.ventanaMaxima * VUELTA) / 2
  const alto = CRISTAL.muro.alto
  x0 = Math.max(-mitad, Math.min(x0, -VENTANA_MINIMA / 2))
  x1 = Math.min(mitad, Math.max(x1, VENTANA_MINIMA / 2))
  y0 = Math.min(Math.max(0, y0), alto - VENTANA_MINIMA)
  y1 = Math.max(Math.min(alto, y1), y0 + VENTANA_MINIMA)
  return { centro: centro[0], desde: [x0, y0], hasta: [x1, y1] }
}

// ── La rejilla ──────────────────────────────────────────────────────────────

export interface RejillaDeLasGrietas {
  /** La esquina de la rejilla y el lado de cada celda (u, locales); cuántas celdas a lo ancho y a lo alto. */
  readonly esquina: P
  readonly ladoDeLaCelda: P
  readonly nx: number
  readonly ny: number
  readonly entradas: number
  readonly maximoPorCelda: number
  /** Las entradas que no entraron en la tabla (tiene que ser 0). */
  readonly sobran: number
}

export const TEXELES_DE_LAS_CELDAS = GRIETAS.rejilla.celdas * 4
export const TEXELES_DE_LOS_TRAMOS = GRIETAS.rejilla.ancho * GRIETAS.rejilla.filas * 4

/**
 * Reparte los tramos en la rejilla (sobre su caja, con el margen; celdas casi cuadradas: la caja suele ser una franja): cada celda, la
 * lista de los que pasan a menos del margen de ella (`celdas`: inicio y cuántos, la celda `iy·nx + ix`); la tabla, dos téxeles por
 * entrada (las puntas; los tiempos y el grosor). Escribe en los arreglos dados.
 */
export function empaquetar(tramos: readonly Tramo[], celdas: Float32Array, tabla: Float32Array): RejillaDeLasGrietas {
  const m = GRIETAS.dibujo.margen
  celdas.fill(0)
  tabla.fill(0)
  if (tramos.length === 0) return { esquina: [0, 0], ladoDeLaCelda: [1, 1], nx: 1, ny: 1, entradas: 0, maximoPorCelda: 0, sobran: 0 }
  let x0 = Number.POSITIVE_INFINITY
  let y0 = Number.POSITIVE_INFINITY
  let x1 = Number.NEGATIVE_INFINITY
  let y1 = Number.NEGATIVE_INFINITY
  for (const t of tramos) {
    x0 = Math.min(x0, t.a[0], t.b[0])
    y0 = Math.min(y0, t.a[1], t.b[1])
    x1 = Math.max(x1, t.a[0], t.b[0])
    y1 = Math.max(y1, t.a[1], t.b[1])
  }
  x0 -= m
  y0 -= m
  const ancho = Math.max(1e-3, x1 + m - x0)
  const alto = Math.max(1e-3, y1 + m - y0)
  const total = Math.min(GRIETAS.rejilla.celdas, celdas.length / 4)
  const nx = Math.min(total, Math.max(1, Math.round(Math.sqrt((total * ancho) / alto))))
  const ny = Math.max(1, Math.floor(total / nx))
  const lx = ancho / nx
  const ly = alto / ny
  const medioDiagonal = Math.hypot(lx, ly) / 2
  const listas: number[][] = Array.from({ length: nx * ny }, () => [])
  tramos.forEach((t, i) => {
    const desdeX = Math.max(0, Math.floor((Math.min(t.a[0], t.b[0]) - m - x0) / lx))
    const hastaX = Math.min(nx - 1, Math.floor((Math.max(t.a[0], t.b[0]) + m - x0) / lx))
    const desdeY = Math.max(0, Math.floor((Math.min(t.a[1], t.b[1]) - m - y0) / ly))
    const hastaY = Math.min(ny - 1, Math.floor((Math.max(t.a[1], t.b[1]) + m - y0) / ly))
    for (let iy = desdeY; iy <= hastaY; iy += 1) {
      for (let ix = desdeX; ix <= hastaX; ix += 1) {
        if (distanciaAlTramo([x0 + (ix + 0.5) * lx, y0 + (iy + 0.5) * ly], t) <= m + medioDiagonal) listas[iy * nx + ix].push(i)
      }
    }
  })
  const capacidad = tabla.length / 8
  let entradas = 0
  let sobran = 0
  let maximoPorCelda = 0
  listas.forEach((lista, c) => {
    celdas[c * 4] = entradas
    maximoPorCelda = Math.max(maximoPorCelda, lista.length)
    for (const i of lista) {
      if (entradas >= capacidad) {
        sobran += 1
        continue
      }
      const t = tramos[i]
      tabla.set([t.a[0], t.a[1], t.b[0], t.b[1], t.t0, t.t1, t.grosor, 0], entradas * 8)
      entradas += 1
    }
    celdas[c * 4 + 1] = entradas - celdas[c * 4]
  })
  return { esquina: [x0, y0], ladoDeLaCelda: [lx, ly], nx, ny, entradas, maximoPorCelda, sobran }
}

/** La distancia de un punto a un tramo entero. */
export function distanciaAlTramo(p: P, t: Tramo): number {
  const bx = t.b[0] - t.a[0]
  const by = t.b[1] - t.a[1]
  const h = Math.min(1, Math.max(0, ((p[0] - t.a[0]) * bx + (p[1] - t.a[1]) * by) / Math.max(1e-12, bx * bx + by * by)))
  return Math.hypot(p[0] - t.a[0] - bx * h, p[1] - t.a[1] - by * h)
}
