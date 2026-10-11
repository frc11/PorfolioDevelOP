import { ESPECIE, type Particulas } from '../especies'
import { ENLACE, type Gas } from '../fisica/fisica'
import { LINEAS, type LineasDeCampo } from '../interaccion/lineasDeCampo'
import { extremo, golpeEn, residualEn, type Arco, type EstadoDeLosArcos } from './arcos'
import { CAMINO, PUNTOS_DEL_CAMINO, PUNTOS_DE_RAMA } from './camino'

/**
 * [PULIDO 16] N2 · EL BÚFER DE LOS TRAMOS (`arcos.ts`: los arcos). Un solo búfer fijo, una sola llamada: los canales de los arcos
 * con sus ramas (llevados con sus extremos: cada punto, con lo que se movieron, repartido a lo largo), los ENLACES (una línea
 * tenue entre los dos de una molécula o de un par ligado, que vibra con ellos) y las LÍNEAS DE CAMPO (`?plasma-campo=si`). Lo
 * que no se usa queda fuera del rango de dibujo: nada se reserva por cuadro.
 */
const TRAMOS_DEL_CANAL = PUNTOS_DEL_CAMINO - 1
const TRAMOS_DE_RAMA = PUNTOS_DE_RAMA - 1
export const TRAMOS = {
  arcos: 6 * (TRAMOS_DEL_CANAL + CAMINO.ramas.maximo * TRAMOS_DE_RAMA),
  enlaces: 96,
  lineas: LINEAS.semillas * LINEAS.pasos,
} as const
export const TRAMOS_DEL_BUFER = TRAMOS.arcos + TRAMOS.enlaces + TRAMOS.lineas

/** Por vértice: los dos extremos del tramo, la forma (extremo 0/1, lado −1/1, ancho, golpe) y el resplandor. */
export interface BuferDeTramos {
  readonly a: Float32Array
  readonly b: Float32Array
  readonly forma: Float32Array
  readonly extra: Float32Array
  readonly indices: Uint16Array
}

export function crearBuferDeTramos(): BuferDeTramos {
  const v = TRAMOS_DEL_BUFER * 4
  const indices = new Uint16Array(TRAMOS_DEL_BUFER * 6)
  // En sentido antihorario en la pantalla (el lado −1 queda a la derecha del avance): con el horario, el descarte de caras los tira.
  for (let s = 0; s < TRAMOS_DEL_BUFER; s += 1) {
    const o = s * 6
    indices[o] = s * 4
    indices[o + 1] = s * 4 + 2
    indices[o + 2] = s * 4 + 1
    indices[o + 3] = s * 4 + 1
    indices[o + 4] = s * 4 + 2
    indices[o + 5] = s * 4 + 3
  }
  return { a: new Float32Array(v * 3), b: new Float32Array(v * 3), forma: new Float32Array(v * 4), extra: new Float32Array(v * 2), indices }
}

function tramo(b: BuferDeTramos, s: number, px: number, py: number, pz: number, qx: number, qy: number, qz: number, ancho: number, golpe: number, residual: number): void {
  for (let v = 0; v < 4; v += 1) {
    const k = s * 4 + v
    b.a[k * 3] = px
    b.a[k * 3 + 1] = py
    b.a[k * 3 + 2] = pz
    b.b[k * 3] = qx
    b.b[k * 3 + 1] = qy
    b.b[k * 3 + 2] = qz
    b.forma[k * 4] = v < 2 ? 0 : 1
    b.forma[k * 4 + 1] = v % 2 === 0 ? -1 : 1
    b.forma[k * 4 + 2] = ancho
    b.forma[k * 4 + 3] = golpe
    b.extra[k * 2] = residual
    b.extra[k * 2 + 1] = 0
  }
}

const A = new Float32Array(3)
const B = new Float32Array(3)
const Q = new Float32Array(6)

/** El punto `k` del canal, llevado con sus extremos de ahora (en `A` y `B`), en `Q` desde `o`. */
function llevar(arco: Arco, k: number, o: number): void {
  const t = k / (PUNTOS_DEL_CAMINO - 1)
  for (let c = 0; c < 3; c += 1) Q[o + c] = arco.canal[k * 3 + c] + (1 - t) * (A[c] - arco.a0[c]) + t * (B[c] - arco.b0[c])
}

/** Escribe los tramos vivos (arcos, enlaces, líneas de campo) y devuelve cuántos (el resto no se dibuja). */
export function rellenarTramos(e: EstadoDeLosArcos, g: Gas, lineas: LineasDeCampo | null, b: BuferDeTramos): number {
  const p: Particulas = g.p
  let s = 0
  for (const arco of e.arcos) {
    if (!arco.activo) continue
    extremo(arco, p, true, A)
    extremo(arco, p, false, B)
    const golpe = golpeEn(arco, arco.edad) * arco.brillo
    const residual = residualEn(arco, arco.edad) * arco.brillo
    for (let k = 0; k < TRAMOS_DEL_CANAL; k += 1) {
      llevar(arco, k, 0)
      llevar(arco, k + 1, 3)
      tramo(b, s, Q[0], Q[1], Q[2], Q[3], Q[4], Q[5], arco.ancho, golpe, residual)
      s += 1
    }
    for (let r = 0; r < arco.ramas; r += 1) {
      // La rama, llevada con el punto del canal de donde sale.
      const k = arco.ramaDesde[r]
      const t = k / (PUNTOS_DEL_CAMINO - 1)
      const dx = (1 - t) * (A[0] - arco.a0[0]) + t * (B[0] - arco.b0[0])
      const dy = (1 - t) * (A[1] - arco.a0[1]) + t * (B[1] - arco.b0[1])
      const dz = (1 - t) * (A[2] - arco.a0[2]) + t * (B[2] - arco.b0[2])
      const o = r * PUNTOS_DE_RAMA * 3
      const fuerza = arco.ramaHalla[r] === 1 ? 0.8 : 0.55
      for (let m = 0; m < TRAMOS_DE_RAMA; m += 1) {
        const afina = 1 - (m / TRAMOS_DE_RAMA) * 0.55
        const i = o + m * 3
        tramo(b, s, arco.ramaPuntos[i] + dx, arco.ramaPuntos[i + 1] + dy, arco.ramaPuntos[i + 2] + dz, arco.ramaPuntos[i + 3] + dx, arco.ramaPuntos[i + 4] + dy, arco.ramaPuntos[i + 5] + dz, arco.ancho * 0.55 * afina, golpe * fuerza * afina, residual * fuerza * afina)
        s += 1
      }
    }
  }
  // Los enlaces: una línea tenue entre los dos (la molécula, más tenue; el par ligado, un poco más).
  let enlaces = 0
  for (let i = 0; i < p.n && enlaces < TRAMOS.enlaces; i += 1) {
    const j = g.pareja[i]
    if (j <= i || p.especie[i] === ESPECIE.vacio || p.especie[j] === ESPECIE.vacio) continue
    const tenue = (g.tipo[i] === ENLACE.ligado ? 0.42 : 0.3) * Math.min(p.alfa[i], p.alfa[j])
    tramo(b, s, p.lugar[i * 3], p.lugar[i * 3 + 1], p.lugar[i * 3 + 2], p.lugar[j * 3], p.lugar[j * 3 + 1], p.lugar[j * 3 + 2], 0.26, 0, tenue)
    s += 1
    enlaces += 1
  }
  // Las líneas de campo, con su fundido (y más tenues hacia la punta).
  if (lineas !== null && lineas.visible > 0.01) {
    for (let l = 0; l < LINEAS.semillas; l += 1) {
      const o = l * (LINEAS.pasos + 1) * 3
      for (let k = 0; k < lineas.largos[l]; k += 1) {
        const i = o + k * 3
        const tenue = lineas.visible * LINEAS.brillo * (1 - k / LINEAS.pasos)
        tramo(b, s, lineas.puntos[i], lineas.puntos[i + 1], lineas.puntos[i + 2], lineas.puntos[i + 3], lineas.puntos[i + 4], lineas.puntos[i + 5], LINEAS.ancho, 0, tenue)
        s += 1
      }
    }
  }
  return s
}
