import type * as THREE from 'three'

import { homografia, matrix3dCss, transformadaNitida } from '../../pie3d/homografia'
import type { Armada, EstadoDelPie } from './armadas'
import { caraEnElCuadro } from './colocacion'

/**
 * [PULIDO 27] Y1 a · LO INTERACTIVO SIGUE A SU PIEZA (salió de `armadas.ts`). La letra de los campos del form TITILABA: con la cámara en
 * movimiento (el paralaje del mouse de pie, la órbita del final acostado) la transformada cambiaba en cada cuadro y Chrome volvía a
 * rasterizar la letra en cada uno, a otra escala y en otro subpíxel: cada cuadro con otro grosor y otra nitidez. Ahora el DOM que sigue a
 * una pieza es una CAPA PROPIA (`will-change`, la pone `armar`): la letra se rasteriza una vez (y al escribir, sólo lo nuevo) y la cámara
 * sólo la lleva. Y debajo de `quietoPx` (en la esquina que más se movió desde lo último escrito) no se reescribe: la cola del amortiguado
 * de la cámara no la hace temblar.
 */
export const DOM_QUE_SIGUE = { quietoPx: 0.15 } as const

/** El DOM de una pieza en su capa propia (o de vuelta como estaba). */
export function capaPropia(el: HTMLElement, propia: boolean): void {
  el.style.willChange = propia ? 'transform' : ''
}

/** Lo interactivo, sobre la cara de su pieza como la ve la cámara viva (la placa, hundida con ella). */
export function seguirLaPieza(a: Armada, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, izquierda: number, arriba: number, s: EstadoDelPie): void {
  const { ancho, alto } = a.medida.caja
  caraEnElCuadro(a.pieza.forma === 'placa' ? a.cuerpo : a.grupo, viva, ancho, alto, 0, cuadro, { x: izquierda, y: arriba }, s.cuadrilatero)
  if (a.css !== '' && quieta(a.escrito, s.cuadrilatero)) return
  const nitida = transformadaNitida(ancho, alto, s.cuadrilatero)
  if (nitida === null && !homografia(ancho, alto, s.cuadrilatero, s.matriz)) return
  const css = nitida ?? matrix3dCss(s.matriz)
  for (let k = 0; k < 8; k += 1) a.escrito[k] = s.cuadrilatero[k]
  if (css === a.css) return
  a.css = css
  a.pieza.elemento.style.transform = css
}

/** Si ninguna esquina se movió más de `quietoPx` desde lo último escrito. */
function quieta(escrito: ArrayLike<number>, ahora: ArrayLike<number>): boolean {
  for (let k = 0; k < 8; k += 1) if (Math.abs(escrito[k] - ahora[k]) > DOM_QUE_SIGUE.quietoPx) return false
  return true
}
