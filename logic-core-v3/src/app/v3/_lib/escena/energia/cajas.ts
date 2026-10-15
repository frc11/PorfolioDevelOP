import { coordenadas, type Dominio } from './dominio'
import { TEXTO_EN_PANTALLA } from './textoEnPantalla'

/**
 * [PULIDO 27] Z2 · LO QUE LA RED EN REPOSO NO TAPA: las cajas del cuadro (NDC) de los textos, los botones y los elementos (las mismas de
 * `textoEnPantalla.ts`: títulos, párrafos, enlaces, botones, el estante y el carrusel) y la del logo (su caja del mundo proyectada, que
 * escribe el componente; sin ella, su esfera: las pruebas). La red quieta
 * no se forma delante de ellas: un enlace que cruzaría una (con un margen) no nace, y uno que pasa a cruzarla se poda. Los arcos del
 * mouse sí pueden pasar por ahí. Puro (Node), sin reservas por cuadro.
 */
export const CAJAS = {
  /** Cuántas como mucho (las de los textos y la del logo), el margen alrededor de cada una (NDC) y el radio del logo (u: mide 6,9 de ancho). */
  cuantas: TEXTO_EN_PANTALLA.cajas + 1,
  margen: 0.03,
  logo: 3.9,
} as const

export interface CajasDeLaRed {
  /** Por caja: izquierda, abajo, derecha, arriba (NDC, con el margen ya sumado). */
  readonly bordes: Float32Array
  cuantas: number
  /** La del logo proyectada (NDC: izquierda, abajo, derecha, arriba y 1 si vale: `cajaDelLogo`). */
  readonly logo: Float32Array
}

export function crearCajas(): CajasDeLaRed {
  return { bordes: new Float32Array(CAJAS.cuantas * 4), cuantas: 0, logo: new Float32Array(5) }
}

/** Una caja de un texto (NDC: x, y abajo a la izquierda; z, w arriba a la derecha), como la escribe `cajasDelTexto`. */
interface CajaDeTexto { readonly x: number; readonly y: number; readonly z: number; readonly w: number }

/** Las cajas de este cuadro: las de los textos (las primeras `cuantosTextos`) y la del logo (su centro en el mundo, proyectado con el dominio). */
export function ponerLasCajas(c: CajasDeLaRed, textos: ArrayLike<CajaDeTexto>, cuantosTextos: number, d: Dominio, lx: number, ly: number, lz: number): void {
  const M = CAJAS.margen
  let n = 0
  for (let k = 0; k < Math.min(cuantosTextos, CAJAS.cuantas - 1); k += 1) {
    const t = textos[k]
    c.bordes[n * 4] = t.x - M
    c.bordes[n * 4 + 1] = t.y - M
    c.bordes[n * 4 + 2] = t.z + M
    c.bordes[n * 4 + 3] = t.w + M
    n += 1
  }
  if (c.logo[4] === 1) {
    c.bordes[n * 4] = c.logo[0] - M
    c.bordes[n * 4 + 1] = c.logo[1] - M
    c.bordes[n * 4 + 2] = c.logo[2] + M
    c.bordes[n * 4 + 3] = c.logo[3] + M
    c.cuantas = n + 1
    return
  }
  const p = coordenadas(d, lx, ly, lz)
  if (d.listo && p.w > 0.5) {
    const ru = CAJAS.logo / (p.w * d.tanX) + M
    const rv = CAJAS.logo / (p.w * d.tanY) + M
    c.bordes[n * 4] = p.u - ru
    c.bordes[n * 4 + 1] = p.v - rv
    c.bordes[n * 4 + 2] = p.u + ru
    c.bordes[n * 4 + 3] = p.v + rv
    n += 1
  }
  c.cuantas = n
}

/** ¿El tramo de la pantalla (u1, v1)–(u2, v2) toca alguna caja? (Por los planos de la caja: la parte del tramo entre los cuatro.) */
export function cruzaUnaCaja(c: CajasDeLaRed, u1: number, v1: number, u2: number, v2: number): boolean {
  const du = u2 - u1
  const dv = v2 - v1
  for (let k = 0; k < c.cuantas; k += 1) {
    const B = c.bordes
    let desde = 0
    let hasta = 1
    if (Math.abs(du) < 1e-9) {
      if (u1 < B[k * 4] || u1 > B[k * 4 + 2]) continue
    } else {
      const a = (B[k * 4] - u1) / du
      const b = (B[k * 4 + 2] - u1) / du
      desde = Math.max(desde, Math.min(a, b))
      hasta = Math.min(hasta, Math.max(a, b))
    }
    if (Math.abs(dv) < 1e-9) {
      if (v1 < B[k * 4 + 1] || v1 > B[k * 4 + 3]) continue
    } else {
      const a = (B[k * 4 + 1] - v1) / dv
      const b = (B[k * 4 + 3] - v1) / dv
      desde = Math.max(desde, Math.min(a, b))
      hasta = Math.min(hasta, Math.max(a, b))
    }
    if (desde <= hasta) return true
  }
  return false
}
