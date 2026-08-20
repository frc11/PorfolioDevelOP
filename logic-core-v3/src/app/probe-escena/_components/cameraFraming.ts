import * as THREE from 'three'

import { CAMERA_FOV, FRAME_TRAVEL_SAFETY, ORBIT_TARGET_Y } from './probeScene'

/**
 * EL ENCUADRE — correr el logo a un costado de la pantalla sin mover la cámara.
 *
 * Salió del `useFrame` en S6 por tamaño, y de paso quedó donde se lee mejor: es
 * geometría pura sobre la cámara, sin nada del rig alrededor.
 *
 * ── Lo que hay que entender para no romperlo ───────────────────────────────
 *
 * **Se mueve el TARGET, no la cámara.** La posición la fijan ángulo, altura y
 * distancia, así que `angleDeg` sigue significando exactamente "desde qué ángulo
 * se lo mira" por más corrido que esté el logo en pantalla. Si en vez de esto se
 * desplazara la cámara, el encuadre y la órbita serían el mismo control con dos
 * nombres.
 *
 * **El offset va en la base de PANTALLA de la cámara** (su derecha y su arriba),
 * no en ejes de mundo. Con ejes de mundo el control se rompería al orbitar: en
 * 90° un offset en X mundo apunta hacia la cámara, así que "correr a la derecha"
 * pasaría a ser "acercar".
 *
 * **El signo.** Para que el logo se vea a la DERECHA hay que apuntar a su
 * IZQUIERDA — de ahí el menos.
 *
 * **La caja es la del logo QUIETO**, no su ancho proyectado en este ángulo. A
 * propósito: si el recorrido disponible se achicara al pasar por el perfil, el
 * objeto se deslizaría solo en pantalla mientras la órbita corre.
 */

// Temporales izados al módulo: esto corre 60+ veces por segundo y no puede ir
// dejando tres Vector3 por frame para el recolector.
const SCREEN_RIGHT = new THREE.Vector3()
const SCREEN_UP = new THREE.Vector3()
const AIM_TARGET = new THREE.Vector3()

/**
 * Apunta la cámara de forma que el logo caiga en (`frameX`, `frameY`) de la
 * pantalla. La cámara ya tiene que estar posicionada y mirando al origen.
 *
 * `eyeDistance` es la distancia real ojo-objeto (no la de la órbita): es lo que
 * hace que ±1 signifique "pegado al costado" a cualquier altura.
 */
export function aimWithFraming(
  camera: THREE.Camera,
  aspect: number,
  logoWidth: number,
  logoHeight: number,
  eyeDistance: number,
  frameX: number,
  frameY: number
): void {
  // Recorrido disponible: cuánto puede correrse el centro del logo antes de que
  // su caja toque el borde. Se calcula por frame porque depende de la distancia
  // y del aspecto del canvas — por eso ±1 es "pegado al costado" en cualquier
  // ventana, y no un desplazamiento fijo en unidades de mundo.
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV) / 2) * eyeDistance
  const halfWidth = halfHeight * aspect

  const travelX = Math.max(0, halfWidth - logoWidth / 2) * FRAME_TRAVEL_SAFETY
  const travelY = Math.max(0, halfHeight - logoHeight / 2) * FRAME_TRAVEL_SAFETY

  SCREEN_RIGHT.set(1, 0, 0).applyQuaternion(camera.quaternion)
  SCREEN_UP.set(0, 1, 0).applyQuaternion(camera.quaternion)

  AIM_TARGET.set(0, ORBIT_TARGET_Y, 0)
    .addScaledVector(SCREEN_RIGHT, -frameX * travelX)
    .addScaledVector(SCREEN_UP, -frameY * travelY)

  camera.lookAt(AIM_TARGET)
}
