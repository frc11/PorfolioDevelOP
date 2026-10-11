import * as THREE from 'three'

import { aimWithFraming } from './cameraFraming'
import { ORBIT_TARGET_Y } from './probeScene'

/**
 * [CIERRE RETOQUE 3D] D1 · LA CÁMARA SIN EL MOUSE — la pose del recorrido de este cuadro (con su inercia), sin lo que el
 * mouse le suma. La escribe `OrbitRig` con la misma cuenta que la cámara viva (la órbita, el blanco y el encuadre) y con
 * ella se colocan los títulos que van con la página (`pantalla`: el hero, «El equipo», las demos). Así quedan fijos en el
 * mundo: el paralaje del mouse deja ver su perspectiva y sus costados, en vez de acompañarlos (antes se colocaban con la
 * cámara viva, mouse incluido, y se veían pegados a la pantalla).
 */
export const CAMARA_SIN_EL_MOUSE = new THREE.PerspectiveCamera()

/** La pose de la cámara sin el mouse: una sola, escribible (cero reservas por cuadro). */
export interface PoseSinElMouse {
  angleDeg: number
  height: number
  distance: number
  frameX: number
  frameY: number
  logoW: number
  logoH: number
}

export function crearPoseSinElMouse(): PoseSinElMouse {
  return { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0, logoW: 0, logoH: 0 }
}

export function posarLaCamaraSinElMouse(viva: THREE.Camera, p: PoseSinElMouse, aspecto: number): void {
  posar(CAMARA_SIN_EL_MOUSE, viva, p, aspecto)
}

/** Una cámara con la proyección de la viva y la pose `p` (la órbita, el blanco y el encuadre), como la arma `OrbitRig`. */
function posar(c: THREE.PerspectiveCamera, viva: THREE.Camera, p: PoseSinElMouse, aspecto: number): void {
  if (viva instanceof THREE.PerspectiveCamera) {
    c.fov = viva.fov
    c.aspect = viva.aspect
    c.near = viva.near
    c.far = viva.far
    c.zoom = viva.zoom
    c.projectionMatrix.copy(viva.projectionMatrix)
    c.projectionMatrixInverse.copy(viva.projectionMatrixInverse)
  }
  const azimut = THREE.MathUtils.degToRad(p.angleDeg)
  c.position.set(Math.sin(azimut) * p.distance, p.height, Math.cos(azimut) * p.distance)
  c.lookAt(0, ORBIT_TARGET_Y, 0)
  if ((p.frameX !== 0 || p.frameY !== 0) && p.logoW > 0 && p.logoH > 0) {
    aimWithFraming(c, aspecto, p.logoW, p.logoH, Math.hypot(p.distance, p.height - ORBIT_TARGET_Y), p.frameX, p.frameY)
  }
  c.updateMatrixWorld()
}

/**
 * [PULIDO 16] N1 · LA CÁMARA CON UNA PARTE DEL MOUSE — la de los planos de Nosotros (`parteDelMouse` del título): un plano
 * colocado con ella sigue esa parte de la órbita del mouse y deja ver el resto (0: fijo en el mundo, con la sin el mouse; 1:
 * pegado a la pantalla, con la viva). `OrbitRig` anota en cada cuadro la pose sin el mouse y lo que el mouse le suma (las
 * mismas referencias, sin copiar); de ahí se arma, sin reservas, cuando alguien la pide.
 */
export const POSE_DEL_CUADRO: { pose: PoseSinElMouse; mouse: { readonly angleDeg: number; readonly height: number }; viva: THREE.Camera | null; aspecto: number } = { pose: crearPoseSinElMouse(), mouse: { angleDeg: 0, height: 0 }, viva: null, aspecto: 1 }

export function anotarLaPoseDelCuadro(viva: THREE.Camera, pose: PoseSinElMouse, mouse: { readonly angleDeg: number; readonly height: number }, aspecto: number): void {
  POSE_DEL_CUADRO.viva = viva
  POSE_DEL_CUADRO.pose = pose
  POSE_DEL_CUADRO.mouse = mouse
  POSE_DEL_CUADRO.aspecto = aspecto
}

const CON_PARTE_DEL_MOUSE = new THREE.PerspectiveCamera()
const POSE_CON_PARTE = crearPoseSinElMouse()

export function camaraConParteDelMouse(parte: number): THREE.PerspectiveCamera {
  const { viva, pose, mouse, aspecto } = POSE_DEL_CUADRO
  if (!(parte > 0) || viva === null) return CAMARA_SIN_EL_MOUSE
  Object.assign(POSE_CON_PARTE, pose)
  POSE_CON_PARTE.angleDeg += parte * mouse.angleDeg
  POSE_CON_PARTE.height += parte * mouse.height
  posar(CON_PARTE_DEL_MOUSE, viva, POSE_CON_PARTE, aspecto)
  return CON_PARTE_DEL_MOUSE
}
