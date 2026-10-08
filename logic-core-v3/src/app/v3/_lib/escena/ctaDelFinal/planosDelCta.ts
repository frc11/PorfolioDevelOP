import * as THREE from 'three'

import { homografia, matrix3dCss } from '../../pie3d/homografia'
import { LECTURA } from '../../titulos3d/registro'
import { camaraDeLaLectura } from '../titulos3d/colocacion'
import { MARCO_DEL_CTA, lugarDelMarco, nuevoLugarDelMarco, type LugarDelMarco } from './armadoDelCta'

/**
 * [PULIDO 5] D1 · EL CTA ANCLADO EN EL MUNDO — la frase del CTA y «HABLANOS» quedan quietos en la sala, como los títulos de
 * volumen (`titulos3d/colocacion.ts`): en el plano donde la cámara del nudo `cta` (la pose C, la del CTA, sin el mouse) los ve
 * en su lugar del DOM. Cuando la cámara se mueve (el scroll, el paralaje del mouse, el acercamiento al llegar) se ven en
 * perspectiva; antes iban pegados a la pantalla (con la cámara viva) y la seguían.
 *
 * Tres planos, todos con un px por unidad y el origen en la esquina de arriba a la izquierda del cuadro:
 *   · `frase`: el del título «Seis razones para elegirnos» (la cámara de su lectura, a la profundidad del logo): de ahí sale
 *     el giro, sin saltar donde el título lo deja.
 *   · `cta`: el del CTA, un poco más lejos que el logo (`MARCO_DEL_CTA.cerca`): ahí termina todo.
 *   · `pantalla`: el de la cámara viva: de ahí salen los valores de la metamorfosis (son del DOM, que va en la pantalla).
 * En el primer tramo (`ANCLAJE_DEL_CTA`), el marco del giro va de `frase` a `cta` y el lienzo de la metamorfosis de `pantalla`
 * a `cta`: después, los dos quedan fijos en el mundo.
 *
 * Y lo que se toca (A1, la regla del texto 2D en el plano de su título): el enlace del DOM se lleva con una homografía al
 * cuadrilátero donde la cámara viva ve la caja de «HABLANOS» en su plano (`homografiaDelCta`).
 */

/** El nudo de la coreografía con cuya cámara se coloca el CTA: la pose C. */
export const LECTURA_DEL_CTA = 'cta'

/** El tramo del progreso en que el marco y el lienzo pasan a su lugar en el mundo (el de PULIDO 2 para el marco). */
export const ANCLAJE_DEL_CTA = { desde: 0.02, hasta: 0.35 } as const

export interface PlanosDelCta {
  readonly frase: LugarDelMarco
  readonly cta: LugarDelMarco
  readonly pantalla: LugarDelMarco
}
export const nuevosPlanosDelCta = (): PlanosDelCta => ({ frase: nuevoLugarDelMarco(), cta: nuevoLugarDelMarco(), pantalla: nuevoLugarDelMarco() })

const DE_LA_FRASE = new THREE.PerspectiveCamera()
const DEL_CTA = new THREE.PerspectiveCamera()

/** Los tres planos de este cuadro (la cámara viva, el alto del cuadro, su proporción y el tamaño medido del logo). */
export function ponerLosPlanos(p: PlanosDelCta, viva: THREE.PerspectiveCamera, alto: number, aspecto: number, logo: { readonly logoW: number; readonly logoH: number }): void {
  lugarDelMarco(camaraDeLaLectura(LECTURA.frase, aspecto, logo.logoW, logo.logoH, DE_LA_FRASE), alto, 1, p.frase)
  lugarDelMarco(camaraDeLaLectura(LECTURA_DEL_CTA, aspecto, logo.logoW, logo.logoH, DEL_CTA), alto, MARCO_DEL_CTA.cerca, p.cta)
  lugarDelMarco(viva, alto, MARCO_DEL_CTA.cerca, p.pantalla)
}

const ARRIBA = new THREE.Vector3()

/**
 * Corre un plano `d` px hacia abajo de la pantalla (`d` positivo; negativo, hacia arriba), en su propio plano: el CTA se va con su
 * sección, como los títulos de volumen que se quedan (`titulos3d/acompanantes.ts`: el corrimiento de su escenario). Mientras
 * corre la transformación el escenario está clavado (`d` = 0); al soltarse, el CTA sube con él y no queda en la sala, a la vista
 * de la cámara del pie (de canto, desde arriba).
 */
export function correrElPlano(lugar: LugarDelMarco, d: number): void {
  if (d === 0) return
  ARRIBA.set(0, 1, 0).applyQuaternion(lugar.giro)
  lugar.posicion.addScaledVector(ARRIBA, -d * lugar.escala)
}

/** La cámara con que se colocó el CTA (para el banco). */
export const camaraDelCta = (): THREE.PerspectiveCamera => DEL_CTA

/** Una caja (px, desde la esquina de arriba a la izquierda del cuadro). */
export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

const PLANO = new THREE.Object3D()
const PUNTO = new THREE.Vector3()
const HACIA = new THREE.Vector3()
const DESDE = new THREE.Vector3()
const ADELANTE = new THREE.Vector3()
const ESQUINAS = [0, 0, 1, 0, 1, 1, 0, 1] as const
const CUADRILATERO: number[] = []
const MATRIZ: number[] = []

/**
 * La transformada del enlace (`matrix3d` con el origen en 0 0): lleva su caja de ahora (`dom`, sin transformar) al cuadrilátero
 * donde la cámara viva ve `caja` (la de «HABLANOS», px de su plano) puesta en el plano `cta`. `''`: si algo queda detrás de la
 * cámara o el cuadrilátero no sirve (el enlace, en su lugar).
 */
export function homografiaDelCta(cta: LugarDelMarco, caja: Caja, dom: Caja, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }): string {
  PLANO.position.copy(cta.posicion)
  PLANO.quaternion.copy(cta.giro)
  PLANO.scale.setScalar(cta.escala)
  PLANO.updateMatrixWorld(true)
  viva.getWorldPosition(DESDE)
  viva.getWorldDirection(ADELANTE)
  CUADRILATERO.length = 8
  for (let k = 0; k < 4; k += 1) {
    PUNTO.set(caja.x + ESQUINAS[2 * k] * caja.ancho, -(caja.y + ESQUINAS[2 * k + 1] * caja.alto), 0).applyMatrix4(PLANO.matrixWorld)
    if (HACIA.copy(PUNTO).sub(DESDE).dot(ADELANTE) <= 0.05) return ''
    PUNTO.project(viva)
    CUADRILATERO[2 * k] = ((PUNTO.x + 1) / 2) * cuadro.ancho - dom.x
    CUADRILATERO[2 * k + 1] = ((1 - PUNTO.y) / 2) * cuadro.alto - dom.y
  }
  return homografia(dom.ancho, dom.alto, CUADRILATERO, MATRIZ) ? matrix3dCss(MATRIZ) : ''
}
