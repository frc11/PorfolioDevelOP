import type { Brasas } from '../brasas'
import { ARCOS, extremo, golpeEn, residualEn, type Arco, type EstadoDeLosArcos } from './arcos'
import { CAMINO, TRAMOS_DEL_CAMINO, TRAMOS_DE_RAMA, puntoDelCamino } from './camino'

/**
 * [PULIDO 17] O3 · LA CINTA DE LOS ARCOS (`arcos.ts`): un búfer fijo con un lugar por arco, y en cada lugar UNA TIRA CONTINUA por el
 * camino (y una por rama): dos vértices por punto, a los dos lados, que el sombreador abre en la pantalla con la unión en inglete
 * (`dibujo/arcos.ts`). Así el canal no tiene tramos superpuestos (de noche la luz se sumaba dos veces en cada junta: cuentas
 * brillantes a lo largo) ni muescas. Cada vértice lleva su punto, el anterior y el siguiente, el destello de los golpes, el
 * resplandor, dónde está a lo largo (las puntas se afinan, la luz corre por el canal) y una semilla. Un lugar sin arco tiene ancho 0
 * (no pinta nada) y la cinta entera se dibuja siempre: el programa está armado desde el primer cuadro. Nada se reserva por cuadro.
 */
const PUNTOS_DEL_CAMINO = TRAMOS_DEL_CAMINO + 1
const PUNTOS_DE_RAMA = TRAMOS_DE_RAMA + 1
export const PUNTOS_POR_ARCO = PUNTOS_DEL_CAMINO + CAMINO.ramas.maximo * PUNTOS_DE_RAMA
export const VERTICES_DE_LA_CINTA = ARCOS.lugares * PUNTOS_POR_ARCO * 2

export interface Cinta {
  readonly punto: Float32Array
  readonly antes: Float32Array
  readonly despues: Float32Array
  /** Por vértice: (lado −1/1, ancho, golpe, residual) y (dónde a lo largo 0 a 1, semilla, rama 0/1, 0). */
  readonly forma: Float32Array
  readonly extra: Float32Array
  readonly indices: Uint16Array
  /** Los lugares ya apagados (no se reescriben) y si algo cambió en el último relleno (si no, no se sube). */
  readonly apagados: Uint8Array
  cambio: boolean
}

/** Los índices de una tira de `n` puntos que empieza en el vértice `v0`, desde `o` en `indices`; devuelve dónde sigue. */
function tira(indices: Uint16Array, o: number, v0: number, n: number): number {
  let k = o
  for (let p = 0; p < n - 1; p += 1) {
    const a = v0 + p * 2
    indices[k] = a
    indices[k + 1] = a + 1
    indices[k + 2] = a + 2
    indices[k + 3] = a + 2
    indices[k + 4] = a + 1
    indices[k + 5] = a + 3
    k += 6
  }
  return k
}

export function crearCinta(): Cinta {
  const v = VERTICES_DE_LA_CINTA
  const tramos = ARCOS.lugares * (TRAMOS_DEL_CAMINO + CAMINO.ramas.maximo * TRAMOS_DE_RAMA)
  const indices = new Uint16Array(tramos * 6)
  let o = 0
  for (let n = 0; n < ARCOS.lugares; n += 1) {
    const v0 = n * PUNTOS_POR_ARCO * 2
    o = tira(indices, o, v0, PUNTOS_DEL_CAMINO)
    for (let r = 0; r < CAMINO.ramas.maximo; r += 1) o = tira(indices, o, v0 + (PUNTOS_DEL_CAMINO + r * PUNTOS_DE_RAMA) * 2, PUNTOS_DE_RAMA)
  }
  return { punto: new Float32Array(v * 3), antes: new Float32Array(v * 3), despues: new Float32Array(v * 3), forma: new Float32Array(v * 4), extra: new Float32Array(v * 4), indices, apagados: new Uint8Array(ARCOS.lugares).fill(1), cambio: true }
}

/** Lo que cada punto escribe además de su lugar (un solo objeto, reescrito). */
const T = { golpe: 0, residual: 0, semilla: 0, rama: 0, ancho: 0 }

const A = new Float32Array(3)
const B = new Float32Array(3)
/** Los puntos de una tira (el camino o una rama), antes de escribirlos: hasta `PUNTOS_DEL_CAMINO`. */
const PUNTOS = new Float32Array(PUNTOS_DEL_CAMINO * 3)
const BASE = new Float32Array(3)
const Q = new Float32Array(3)

/** Escribe una tira de `n` puntos (de `PUNTOS`) desde el punto `p0` de la cinta; `ancho` 0 la apaga. */
function escribir(c: Cinta, p0: number, n: number, ancho: number): void {
  for (let p = 0; p < n; p += 1) {
    const an = Math.max(0, p - 1)
    const de = Math.min(n - 1, p + 1)
    for (let lado = 0; lado < 2; lado += 1) {
      const k = (p0 + p) * 2 + lado
      for (let e = 0; e < 3; e += 1) {
        c.punto[k * 3 + e] = PUNTOS[p * 3 + e]
        c.antes[k * 3 + e] = PUNTOS[an * 3 + e]
        c.despues[k * 3 + e] = PUNTOS[de * 3 + e]
      }
      c.forma[k * 4] = lado === 0 ? -1 : 1
      c.forma[k * 4 + 1] = ancho
      c.forma[k * 4 + 2] = T.golpe
      c.forma[k * 4 + 3] = T.residual
      c.extra[k * 4] = p / (n - 1)
      c.extra[k * 4 + 1] = T.semilla
      c.extra[k * 4 + 2] = T.rama
      c.extra[k * 4 + 3] = 0
    }
  }
}

/** Escribe el lugar `n` de la cinta con el arco (o lo apaga, si no está activo). */
function lugar(c: Cinta, n: number, arco: Arco, brasas: Brasas): void {
  const p0 = n * PUNTOS_POR_ARCO
  if (!arco.activo) {
    if (c.apagados[n] === 1) return
    for (let k = p0 * 2; k < (p0 + PUNTOS_POR_ARCO) * 2; k += 1) c.forma[k * 4 + 1] = 0
    c.apagados[n] = 1
    c.cambio = true
    return
  }
  c.apagados[n] = 0
  c.cambio = true
  extremo(arco, brasas, true, A)
  extremo(arco, brasas, false, B)
  T.golpe = golpeEn(arco, arco.edad) * arco.brillo
  T.residual = residualEn(arco, arco.edad) * arco.brillo
  T.semilla = n * 7.31 + arco.golpes * 1.7
  T.rama = 0
  for (let k = 0; k < PUNTOS_DEL_CAMINO; k += 1) {
    puntoDelCamino(arco.forma, A, B, k, Q)
    PUNTOS.set(Q, k * 3)
  }
  escribir(c, p0, PUNTOS_DEL_CAMINO, arco.ancho)
  T.rama = 1
  const f = arco.forma
  for (let r = 0; r < CAMINO.ramas.maximo; r += 1) {
    const q0 = p0 + PUNTOS_DEL_CAMINO + r * PUNTOS_DE_RAMA
    if (r >= f.ramas) {
      escribir(c, q0, PUNTOS_DE_RAMA, 0)
      continue
    }
    puntoDelCamino(f, A, B, f.ramaDesde[r], BASE)
    const o = r * PUNTOS_DE_RAMA * 3
    for (let m = 0; m < PUNTOS_DE_RAMA; m += 1) for (let e = 0; e < 3; e += 1) PUNTOS[m * 3 + e] = BASE[e] + (f.ramaDir[r * 3 + e] * f.ramaLargo[r] * m) / TRAMOS_DE_RAMA + f.ramaDesvios[o + m * 3 + e]
    escribir(c, q0, PUNTOS_DE_RAMA, arco.ancho * 0.6)
  }
}

/** Escribe todos los lugares de la cinta y devuelve cuántos arcos hay vivos (`cambio`: si hay que subirla). */
export function rellenarCinta(e: EstadoDeLosArcos, brasas: Brasas, c: Cinta): number {
  c.cambio = false
  let vivos = 0
  for (let n = 0; n < e.arcos.length; n += 1) {
    lugar(c, n, e.arcos[n], brasas)
    if (e.arcos[n].activo) vivos += 1
  }
  return vivos
}
