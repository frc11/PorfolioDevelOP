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
  const c = CAMARA_SIN_EL_MOUSE
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
