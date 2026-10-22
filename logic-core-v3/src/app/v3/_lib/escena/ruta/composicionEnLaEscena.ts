import * as THREE from 'three'

import { sampleTrack, type ChoreoTrack } from '../choreographySampler'
import type { MutableChoreoPose } from '../choreographyTypes'
import { armarLaCamara, cajaProyectada } from '../poseDelPortfolio'

import { COMPOSICION_EN_LA_ESCENA, type HuecoDeLaIntro } from './composicion'
import { camaraDelViaje, mezclarConLaPartida } from './viajeDelServicio'

// El rig importa de acá lo de la intro en una sola línea (está en su techo de líneas: s8-montaje).
export { AVANCE_DE_LA_INTRO, luzDeLaPagina, pistaDeLaPagina } from './pistaDeLaIntro'

/**
 * [B12a.8] LA POSE DE LA INTRO CON SU COMPOSICIÓN — la pista de la intro en su avance (la pose 2, girar: el ángulo, la altura y la
 * distancia no se tocan) y, con el hueco del logo medido en el DOM (`COMPOSICION_EN_LA_ESCENA`), el ENCUADRE (`frameX` y `frameY`)
 * que pone el centro del logo en el centro del hueco: el logo no se mueve en la escena, se corre con la cámara, como en el hero del home.
 * El encuadre se resuelve con la misma cámara que arma el rig (`armarLaCamara`: la órbita, el blanco y el encuadre) y la caja del logo
 * proyectada (`cajaProyectada`), por Newton en los dos ejes (casi independientes); se memoriza por cuadro, pose y hueco.
 */

const CAMARA = new THREE.PerspectiveCamera()
const POSE: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
const PASO = 0.05
let ultimaClave = ''
const ULTIMO = { frameX: 0, frameY: 0 }

/** El centro del logo en el cuadro (−1…1) con la pose y un encuadre. */
function centro(aspecto: number, fov: number, logoW: number, logoH: number, frameX: number, frameY: number): { readonly x: number; readonly y: number } {
  POSE.frameX = frameX
  POSE.frameY = frameY
  const c = cajaProyectada(armarLaCamara(CAMARA, POSE, aspecto, fov, logoW, logoH), logoW, logoH)
  return { x: c.x, y: c.y }
}

/** El encuadre que pone el centro del logo en el del hueco, para esta pose (memorizado). */
export function encuadreDelHueco(pose: MutableChoreoPose, hueco: HuecoDeLaIntro, aspecto: number, fov: number, logoW: number, logoH: number): { readonly frameX: number; readonly frameY: number } {
  const clave = `${pose.angleDeg.toFixed(4)}|${pose.height.toFixed(4)}|${pose.distance.toFixed(4)}|${aspecto.toFixed(4)}|${fov.toFixed(3)}|${logoW.toFixed(3)}|${logoH.toFixed(3)}|${hueco.x.toFixed(4)}|${hueco.y.toFixed(4)}`
  if (clave === ultimaClave) return ULTIMO
  POSE.angleDeg = pose.angleDeg
  POSE.height = pose.height
  POSE.distance = pose.distance
  let fx = 0
  let fy = 0
  for (let i = 0; i < 4; i += 1) {
    const c = centro(aspecto, fov, logoW, logoH, fx, fy)
    if (Math.abs(c.x - hueco.x) < 1e-4 && Math.abs(c.y - hueco.y) < 1e-4) break
    const dx = (centro(aspecto, fov, logoW, logoH, fx + PASO, fy).x - c.x) / PASO
    const dy = (centro(aspecto, fov, logoW, logoH, fx, fy + PASO).y - c.y) / PASO
    if (Math.abs(dx) > 1e-6) fx += (hueco.x - c.x) / dx
    if (Math.abs(dy) > 1e-6) fy += (hueco.y - c.y) / dy
    fx = Math.min(2, Math.max(-2, fx))
    fy = Math.min(2, Math.max(-2, fy))
  }
  ULTIMO.frameX = fx
  ULTIMO.frameY = fy
  ultimaClave = clave
  return ULTIMO
}

/** La pose de la intro en su avance y, con el hueco medido, su encuadre: lo llama el rig en su cuadro (una página con pista). */
export function poseDeLaIntro(track: ChoreoTrack, avance: number, objetivo: MutableChoreoPose, aspecto: number, fov: number, logoW: number, logoH: number): void {
  sampleTrack(track, avance, objetivo)
  // [B12b] El viaje desde el CTA de un servicio: la cámara baja de la partida a la composición (fuera de un viaje, nada).
  mezclarConLaPartida(objetivo, camaraDelViaje(performance.now()))
  const hueco = COMPOSICION_EN_LA_ESCENA.hueco
  if (hueco === null || !(logoW > 0) || !(logoH > 0)) return
  const e = encuadreDelHueco(objetivo, hueco, aspecto, fov, logoW, logoH)
  objetivo.frameX = e.frameX
  objetivo.frameY = e.frameY
}
