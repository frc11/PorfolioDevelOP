import * as THREE from 'three'

import { LOGO_BOX_WORLD } from '@/lib/logo-footprint'

import { homografia, matrix3dCss, transformadaNitida } from '../../pie3d/homografia'
import type { MedidasDelAro } from './aro'
import { CAPA_DEL_ARO } from './enVivo'

/**
 * [NOCTURNO B2] EL TEXTO DE CADA PLACA, EN EL FRENTE DE SU PLACA — la tarjeta del DOM (la cita, el retrato y el nombre; un enlace que se
 * enfoca, se toca y lee el lector) va en cada cuadro al cuadrilátero donde la cámara viva ve el frente de su placa: la homografía del pie y
 * del CTA (`pie3d/homografia.ts`), con la transformada 2D nítida cuando la cara está casi de frente (el texto se rasteriza a su escala). Su
 * tamaño de maqueta es el de la placa de frente (`--ancho-de-la-tarjeta`, sólo al cambiar): de frente, escala 1.
 *
 * Lo que se escribe, sólo si cambió: la transformada, la opacidad (cuánto se lee) y la visibilidad. Son del puntero (el teclado y el lector tienen
 * las reseñas enteras en el DOM de la sección).
 */

export interface EstadoDeLaTarjeta {
  css: string
  opacidad: string
  visible: boolean
  /** [C2-70] El orden de dibujo (la más cerca, arriba) y si es la de adelante (`data-al-frente`). */
  z: string
  frente: boolean
}

export const nuevaTarjeta = (): EstadoDeLaTarjeta => ({ css: '', opacidad: '', visible: false, z: '', frente: false })

/** [C2-70] Una caja en el cuadro (px). */
export interface CajaEnElCuadro {
  x0: number
  y0: number
  x1: number
  y1: number
}
export const nuevaCaja = (): CajaEnElCuadro => ({ x0: 0, y0: 0, x1: 0, y1: 0 })

/** [C2-70] Lo opcional de una tarjeta: su escala (la de adelante, más grande), si es la de adelante y la caja del logo en el cuadro. */
export interface ExtrasDeLaTarjeta {
  readonly escala?: number
  readonly destacada?: boolean
  readonly logo?: CajaEnElCuadro | null
}

const PUNTO = new THREE.Vector3()
/** [C2-70] La caja del logo (la de `LOGO_BOX_WORLD`, en el origen) vista por la cámara, en px del cuadro. */
export function cajaDelLogo(camara: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, salida: CajaEnElCuadro): CajaEnElCuadro {
  const h = LOGO_BOX_WORLD / 2
  salida.x0 = Infinity
  salida.y0 = Infinity
  salida.x1 = -Infinity
  salida.y1 = -Infinity
  for (const [x, y] of [[-h, -h], [h, -h], [h, h], [-h, h]] as const) {
    PUNTO.set(x, y, 0).project(camara)
    const px = ((PUNTO.x + 1) / 2) * cuadro.ancho
    const py = ((1 - PUNTO.y) / 2) * cuadro.alto
    salida.x0 = Math.min(salida.x0, px)
    salida.x1 = Math.max(salida.x1, px)
    salida.y0 = Math.min(salida.y0, py)
    salida.y1 = Math.max(salida.y1, py)
  }
  return salida
}

/** [C2-70] Si el cuadrilátero (8 números, px) toca la caja. */
export function tocaLaCaja(q: readonly number[], c: CajaEnElCuadro): boolean {
  const xs = [q[0], q[2], q[4], q[6]]
  const ys = [q[1], q[3], q[5], q[7]]
  return Math.max(...xs) > c.x0 && Math.min(...xs) < c.x1 && Math.max(...ys) > c.y0 && Math.min(...ys) < c.y1
}

const ESQUINAS: THREE.Vector3[] = [0, 1, 2, 3].map(() => new THREE.Vector3())
const DERECHA = new THREE.Vector3()
const ARRIBA = new THREE.Vector3(0, 1, 0)
const FRENTE = new THREE.Vector3()
const NORMAL = new THREE.Vector3()
const HACIA = new THREE.Vector3()
const DESDE = new THREE.Vector3()
const ADELANTE = new THREE.Vector3()
const CUADRILATERO: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
const MATRIZ: number[] = []

/** El tamaño de maqueta de una tarjeta (px): el de la placa de frente vista por la cámara viva. Escribe la variable sólo si cambió. */
export function tamanoDeLasTarjetas(camara: THREE.PerspectiveCamera, alto: number, m: MedidasDelAro, centroY: number, ultimo: { ancho: number }): number {
  camara.getWorldDirection(ADELANTE)
  HACIA.set(0, centroY, m.radio).sub(camara.position)
  const profundidad = Math.max(0.5, HACIA.dot(ADELANTE))
  const pxPorMundo = alto / (2 * profundidad * Math.tan(THREE.MathUtils.degToRad(camara.fov) / 2))
  const ancho = Math.round(m.ancho * pxPorMundo)
  const capa = CAPA_DEL_ARO.el
  if (capa !== null && Math.abs(ancho - ultimo.ancho) >= 2) {
    ultimo.ancho = ancho
    capa.style.setProperty('--ancho-de-la-tarjeta', `${String(ancho)}px`)
    capa.style.setProperty('--alto-de-la-tarjeta', `${String(Math.round((ancho * m.alto) / m.ancho))}px`)
  }
  return ultimo.ancho
}

/** [C2-70] La opacidad de una tarjeta: siempre entera (sólidas). Se esconde con `visibility`, nunca a medias. */
export const OPACIDAD_DE_LA_TARJETA = '1'

/**
 * Lleva la tarjeta `el` a la cara de la placa que mira a la cámara (su centro `centro`, el frente mirando hacia `mira` rad) si `texto` > 0
 * (se lee o no: sin medias tintas, C2-70). De espaldas va en la nuca, con la derecha dada vuelta (no sale espejada), salvo que la nuca caiga
 * sobre la caja del logo (el DOM no lo tapa: el logo está adelante). `ancho` es su tamaño de maqueta. Fuera del cuadro o detrás de la
 * cámara, escondida.
 */
export function llevarLaTarjeta(el: HTMLElement | null, s: EstadoDeLaTarjeta, centro: THREE.Vector3, mira: number, m: MedidasDelAro, texto: number, camara: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, ancho: number, extras: ExtrasDeLaTarjeta = {}): void {
  if (el === null) return
  const alto = (ancho * m.alto) / m.ancho
  const escala = extras.escala ?? 1
  let visible = texto > 0.02 && ancho > 0
  let deEspaldas = false
  if (visible) {
    NORMAL.set(Math.sin(mira), 0, Math.cos(mira))
    DERECHA.set(Math.cos(mira), 0, -Math.sin(mira))
    camara.getWorldPosition(DESDE)
    camara.getWorldDirection(ADELANTE)
    FRENTE.copy(centro).addScaledVector(NORMAL, (m.espesor * escala) / 2 + 0.002)
    if (HACIA.copy(DESDE).sub(FRENTE).dot(NORMAL) < 0) {
      deEspaldas = true
      NORMAL.negate()
      DERECHA.negate()
      FRENTE.copy(centro).addScaledVector(NORMAL, (m.espesor * escala) / 2 + 0.002)
    }
    // Arriba a la izquierda, arriba a la derecha, abajo a la derecha, abajo a la izquierda (el orden de `homografia`).
    const signos = [[-1, 1], [1, 1], [1, -1], [-1, -1]] as const
    for (let k = 0; k < 4 && visible; k += 1) {
      const p = ESQUINAS[k].copy(FRENTE).addScaledVector(DERECHA, (signos[k][0] * m.ancho * escala) / 2).addScaledVector(ARRIBA, (signos[k][1] * m.alto * escala) / 2)
      if (HACIA.copy(p).sub(DESDE).dot(ADELANTE) <= 0.05) visible = false
      p.project(camara)
      CUADRILATERO[2 * k] = ((p.x + 1) / 2) * cuadro.ancho
      CUADRILATERO[2 * k + 1] = ((1 - p.y) / 2) * cuadro.alto
    }
    if (visible && deEspaldas && extras.logo !== undefined && extras.logo !== null && tocaLaCaja(CUADRILATERO, extras.logo)) visible = false
  }
  let css = ''
  if (visible) {
    css = transformadaNitida(ancho, alto, CUADRILATERO, 4) ?? (homografia(ancho, alto, CUADRILATERO, MATRIZ) ? matrix3dCss(MATRIZ) : '')
    visible = css !== ''
  }
  if (css !== s.css && visible) {
    s.css = css
    el.style.transform = css
  }
  if (s.opacidad !== OPACIDAD_DE_LA_TARJETA) {
    s.opacidad = OPACIDAD_DE_LA_TARJETA
    el.style.opacity = OPACIDAD_DE_LA_TARJETA
  }
  // La más cerca de la cámara, arriba (las de los costados y las de atrás no tapan a las de adelante).
  const z = visible ? String(Math.max(1, Math.round(1000 - FRENTE.distanceTo(DESDE) * 10))) : s.z
  if (z !== s.z) {
    s.z = z
    el.style.zIndex = z
  }
  const frente = visible && extras.destacada === true
  if (frente !== s.frente) {
    s.frente = frente
    if (frente) el.setAttribute('data-al-frente', 'si')
    else el.removeAttribute('data-al-frente')
  }
  if (visible !== s.visible) {
    s.visible = visible
    el.style.visibility = visible ? 'visible' : 'hidden'
  }
}

/** Esconde todas (el aro no está): con `visibility`, nunca con la opacidad. */
export function esconderLasTarjetas(tarjetas: readonly (HTMLElement | null)[], estados: readonly EstadoDeLaTarjeta[]): void {
  tarjetas.forEach((el, i) => {
    const s = estados[i]
    if (el === null || !s.visible) return
    s.visible = false
    el.style.visibility = 'hidden'
  })
}
