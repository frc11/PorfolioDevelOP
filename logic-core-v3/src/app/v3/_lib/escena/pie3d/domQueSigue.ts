import type * as THREE from 'three'

import { homografia, matrix3dCss, nitidaEn } from '../../pie3d/homografia'
import type { Armada, EstadoDelPie } from './armadas'
import { caraEnElCuadro } from './colocacion'

/**
 * [PULIDO 27] Y1 a · LO INTERACTIVO SIGUE A SU PIEZA (salió de `armadas.ts`). La letra de los campos del form TITILABA: con la cámara en
 * movimiento (el paralaje del mouse de pie, la órbita del final acostado) la transformada cambiaba en cada cuadro y Chrome volvía a
 * rasterizar la letra en cada uno, a otra escala y en otro subpíxel: cada cuadro con otro grosor y otra nitidez. Ahora el DOM que sigue a
 * una pieza es una CAPA PROPIA (`will-change`, la pone `armar`): la letra se rasteriza una vez (y al escribir, sólo lo nuevo) y la cámara
 * sólo la lleva.
 * [PULIDO 28] AA1 · SEGUÍA TITILANDO: la capa se rasteriza una vez, pero el compositor la muestrea con la transformada de cada cuadro, y
 * con la órbita del mouse esa transformada cambiaba en cada uno (medido en el sitio: una `matrix3d` nueva por cuadro): la letra caía en
 * otra fase del píxel y cambiaba de grosor de un cuadro al otro. Ahora LA FASE FIJA: la forma de la transformada (la escala, el sesgo,
 * la perspectiva) se sostiene mientras lo escrito y lo que ve la cámara no se aparten en ninguna esquina más de `linealPx` (salvo una
 * traslación); la traslación va de a píxeles enteros. La letra se mueve como un texto que se desplaza (de a píxel, siempre igual) y sólo
 * cambia de forma cuando la cara cambió de verdad.
 */
export const DOM_QUE_SIGUE = { linealPx: 0.5 } as const

/** En `escrito` (17): la transformada escrita (16, como `homografia`) y su tipo (0: nada, 1: la 2D nítida, 2: la `matrix3d`). */
const TIPO = 16
/** La transformada que pide la cámara en este cuadro, lo que se aparta cada esquina y el paso (sin reservas por cuadro). */
const PEDIDA: number[] = []
const D = new Float64Array(8)
const PASO: [number, number] = [0, 0]

/** El DOM de una pieza en su capa propia (o de vuelta como estaba). */
export function capaPropia(el: HTMLElement, propia: boolean): void {
  el.style.willChange = propia ? 'transform' : ''
}

/** Lo interactivo, sobre la cara de su pieza como la ve la cámara viva (la placa, hundida con ella). */
export function seguirLaPieza(a: Armada, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, izquierda: number, arriba: number, s: EstadoDelPie): void {
  const { ancho, alto } = a.medida.caja
  caraEnElCuadro(a.pieza.forma === 'placa' ? a.cuerpo : a.grupo, viva, ancho, alto, 0, cuadro, { x: izquierda, y: arriba }, s.cuadrilatero)
  const tipo = nitidaEn(ancho, alto, s.cuadrilatero, PEDIDA) ? 1 : homografia(ancho, alto, s.cuadrilatero, PEDIDA) ? 2 : 0
  if (tipo !== 0 && fijarLaFase(a.escrito, PEDIDA, tipo, ancho, alto, a.css !== '')) escribir(a, a.escrito, tipo)
}

/**
 * Lleva lo escrito (`w`: la transformada y su tipo) hacia lo pedido con la fase fija (`hay`: ya hay algo escrito): `true` si cambió.
 * Una traslación, de a píxeles enteros; si la cara cambió de forma (o de tipo), la pedida entera con la traslación redondeada.
 */
export function fijarLaFase(w: Float64Array, pedida: ArrayLike<number>, tipo: number, ancho: number, alto: number, hay: boolean): boolean {
  if (hay && w[TIPO] === tipo) {
    const paso = pasoDeLaFase(w, pedida, ancho, alto)
    if (paso !== null) {
      if (paso[0] === 0 && paso[1] === 0) return false
      w[12] += paso[0]
      w[13] += paso[1]
      return true
    }
  }
  for (let k = 0; k < 16; k += 1) w[k] = pedida[k]
  w[12] = Math.round(w[12])
  w[13] = Math.round(w[13])
  w[TIPO] = tipo
  return true
}

/**
 * Lo que se aparta lo escrito (`w`) de lo pedido en las cuatro esquinas: si es una traslación (cada esquina, a menos de `linealPx` de la
 * del promedio), los píxeles enteros que hay que correrlo (0, 0: nada); si no (la cara cambió de forma), `null`.
 */
export function pasoDeLaFase(w: ArrayLike<number>, pedida: ArrayLike<number>, ancho: number, alto: number): readonly [number, number] | null {
  let [tx, ty] = [0, 0]
  for (let k = 0; k < 4; k += 1) {
    const [x, y] = [k === 1 || k === 2 ? ancho : 0, k >= 2 ? alto : 0]
    const [pw, ew] = [pedida[3] * x + pedida[7] * y + pedida[15], w[3] * x + w[7] * y + w[15]]
    D[k * 2] = (pedida[0] * x + pedida[4] * y + pedida[12]) / pw - (w[0] * x + w[4] * y + w[12]) / ew
    D[k * 2 + 1] = (pedida[1] * x + pedida[5] * y + pedida[13]) / pw - (w[1] * x + w[5] * y + w[13]) / ew
    tx += D[k * 2] / 4
    ty += D[k * 2 + 1] / 4
  }
  for (let k = 0; k < 4; k += 1) if (Math.abs(D[k * 2] - tx) > DOM_QUE_SIGUE.linealPx || Math.abs(D[k * 2 + 1] - ty) > DOM_QUE_SIGUE.linealPx) return null
  PASO[0] = Math.round(tx)
  PASO[1] = Math.round(ty)
  return PASO
}

/** La transformada en CSS: la 2D nítida (`matrix`, que Chrome rasteriza a su escala) o la `matrix3d`. */
function escribir(a: Armada, w: ArrayLike<number>, tipo: number): void {
  const css = tipo === 1 ? `matrix(${[w[0], w[1], w[4], w[5]].map((v) => v.toFixed(5)).join(',')},${String(w[12])},${String(w[13])})` : matrix3dCss(w)
  if (css === a.css) return
  a.css = css
  a.pieza.elemento.style.transform = css
}
