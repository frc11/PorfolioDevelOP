import * as THREE from 'three'

import { homografia, matrix3dCss, transformadaNitida } from '../../pie3d/homografia'
import type { MedidasDelAro } from './aro'
import { CAPA_DEL_ARO } from './enVivo'

/**
 * [NOCTURNO B2] EL TEXTO DE CADA PLACA, EN EL FRENTE DE SU PLACA — la tarjeta del DOM (la cita, el retrato y el nombre; un enlace que se
 * enfoca, se toca y lee el lector) va en cada cuadro al cuadrilátero donde la cámara viva ve el frente de su placa: la homografía del pie y
 * del CTA (`pie3d/homografia.ts`), con la transformada 2D nítida cuando la cara está casi de frente (el texto se rasteriza a su escala). Su
 * tamaño de maqueta es el de la placa de frente (`--ancho-de-la-tarjeta`, sólo al cambiar): de frente, escala 1.
 *
 * Lo que se escribe, sólo si cambió: la transformada, la opacidad (cuánto se lee), la visibilidad y si entra en el orden del teclado.
 */

export interface EstadoDeLaTarjeta {
  css: string
  opacidad: string
  visible: boolean
}

export const nuevaTarjeta = (): EstadoDeLaTarjeta => ({ css: '', opacidad: '', visible: false })

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

/**
 * Lleva la tarjeta `el` al frente de la placa (su centro `centro`, mirando hacia `mira` rad) con `texto` (0 a 1, cuánto se lee). `ancho`
 * es su tamaño de maqueta. Fuera del cuadro o detrás de la cámara, escondida.
 */
export function llevarLaTarjeta(el: HTMLElement | null, s: EstadoDeLaTarjeta, centro: THREE.Vector3, mira: number, m: MedidasDelAro, texto: number, camara: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, ancho: number): void {
  if (el === null) return
  const alto = (ancho * m.alto) / m.ancho
  let visible = texto > 0.02 && ancho > 0
  if (visible) {
    NORMAL.set(Math.sin(mira), 0, Math.cos(mira))
    DERECHA.set(Math.cos(mira), 0, -Math.sin(mira))
    FRENTE.copy(centro).addScaledVector(NORMAL, m.espesor / 2 + 0.002)
    camara.getWorldPosition(DESDE)
    camara.getWorldDirection(ADELANTE)
    // Arriba a la izquierda, arriba a la derecha, abajo a la derecha, abajo a la izquierda (el orden de `homografia`).
    const signos = [[-1, 1], [1, 1], [1, -1], [-1, -1]] as const
    for (let k = 0; k < 4 && visible; k += 1) {
      const p = ESQUINAS[k].copy(FRENTE).addScaledVector(DERECHA, (signos[k][0] * m.ancho) / 2).addScaledVector(ARRIBA, (signos[k][1] * m.alto) / 2)
      if (HACIA.copy(p).sub(DESDE).dot(ADELANTE) <= 0.05) visible = false
      p.project(camara)
      CUADRILATERO[2 * k] = ((p.x + 1) / 2) * cuadro.ancho
      CUADRILATERO[2 * k + 1] = ((1 - p.y) / 2) * cuadro.alto
    }
  }
  let css = ''
  if (visible) {
    css = transformadaNitida(ancho, alto, CUADRILATERO, 4) ?? (homografia(ancho, alto, CUADRILATERO, MATRIZ) ? matrix3dCss(MATRIZ) : '')
    visible = css !== ''
  }
  const opacidad = visible ? Math.min(1, texto).toFixed(3) : '0'
  if (css !== s.css && visible) {
    s.css = css
    el.style.transform = css
  }
  if (opacidad !== s.opacidad) {
    s.opacidad = opacidad
    el.style.opacity = opacidad
  }
  if (visible !== s.visible) {
    s.visible = visible
    el.style.visibility = visible ? 'visible' : 'hidden'
    // Se enfoca sólo la que se lee; la que se va, si tenía el foco, lo suelta.
    el.tabIndex = visible ? 0 : -1
    if (!visible && document.activeElement === el) el.blur()
  }
}

/** Esconde todas (el aro no está). */
export function esconderLasTarjetas(tarjetas: readonly (HTMLElement | null)[], estados: readonly EstadoDeLaTarjeta[]): void {
  tarjetas.forEach((el, i) => {
    const s = estados[i]
    if (el === null || !s.visible) return
    s.visible = false
    s.opacidad = '0'
    el.style.visibility = 'hidden'
    el.style.opacity = '0'
    el.tabIndex = -1
  })
}
