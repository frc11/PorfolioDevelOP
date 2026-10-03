import * as THREE from 'three'

import { FLOOR_Y, ORBIT_TARGET_Y } from '../probeScene'

/**
 * [RETOQUE DEL PIE] P2 · DÓNDE VA UNA PIEZA DEL PIE — como un título que va con la página (`titulos3d/colocacion.ts`,
 * `pantalla`): en cada cuadro, donde la cámara SIN el mouse la ve en su lugar del DOM, de frente a ella y del tamaño del
 * DOM. Fija en el mundo: el paralaje del mouse (la cámara viva) deja ver su perspectiva y sus costados; la pieza no gira
 * ni se mueve con el mouse.
 *
 * **A qué profundidad.** La del centro del logo, como los títulos (el paralaje entre los dos es el de dos objetos de la
 * misma sala, y es casi el pivote de la órbita del mouse: quietas). Salvo que ahí quede debajo del piso: en la pose del
 * pie, a la profundidad del logo, todo lo que está más abajo que su base está bajo el piso. Entonces viene hacia la
 * cámara hasta quedar `holgura` sobre el piso (su borde de abajo): apoyada adelante, con su sombra justo debajo. Pura salvo
 * los objetos de three que recibe (el invariante la prueba sin navegador).
 */
export const COLOCACION_DEL_PIE = {
  /** Cuánto flota sobre el piso, como mínimo (u): las olas del piso vivo no la tocan. */
  holgura: 0.6,
} as const

const ADELANTE = new THREE.Vector3()
const RAYO = new THREE.Vector3()
const CENTRO = new THREE.Vector3()

/** La profundidad (a lo largo de la mirada) del centro del logo. */
export function profundidadDelLogo(camara: THREE.Camera): number {
  camara.getWorldDirection(ADELANTE)
  return CENTRO.set(0, ORBIT_TARGET_Y, 0).sub(camara.position).dot(ADELANTE)
}

/** El rayo de la cámara por un punto del cuadro (px), normalizado. */
function rayo(camara: THREE.Camera, x: number, y: number, ancho: number, alto: number): THREE.Vector3 {
  return RAYO.set((2 * x) / ancho - 1, 1 - (2 * y) / alto, 0.5).unproject(camara).sub(camara.position).normalize()
}

/** La profundidad a la que el rayo del punto (px) toca el piso más la holgura; infinita si no lo toca. */
export function profundidadDelPiso(camara: THREE.Camera, x: number, y: number, ancho: number, alto: number, holgura: number = COLOCACION_DEL_PIE.holgura): number {
  const r = rayo(camara, x, y, ancho, alto)
  if (r.y >= -1e-6) return Number.POSITIVE_INFINITY
  const t = (FLOOR_Y + holgura - camara.position.y) / r.y
  if (t <= 0) return 0
  camara.getWorldDirection(ADELANTE)
  return t * r.dot(ADELANTE)
}

/** La profundidad de una pieza cuyo borde de abajo (en el medio) está en (x, y) del cuadro. */
export function profundidadDeLaPieza(camara: THREE.Camera, x: number, y: number, ancho: number, alto: number): number {
  return Math.min(profundidadDelLogo(camara), profundidadDelPiso(camara, x, y, ancho, alto))
}

/**
 * Pone el grupo (geometría en px, origen arriba a la izquierda, y hacia arriba) donde la cámara ve esa esquina del cuadro
 * (px) a la profundidad `d`, de frente y en escala: un px de la geometría mide lo que un px del cuadro a esa profundidad.
 * Devuelve cuánto mundo es un px.
 */
export function colocarLaPieza(grupo: THREE.Object3D, camara: THREE.PerspectiveCamera, izquierda: number, arriba: number, ancho: number, alto: number, d: number): number {
  camara.getWorldDirection(ADELANTE)
  const r = rayo(camara, izquierda, arriba, ancho, alto)
  grupo.position.copy(camara.position).addScaledVector(r, d / r.dot(ADELANTE))
  grupo.quaternion.copy(camara.quaternion)
  const mundoPorPx = (2 * d * Math.tan(THREE.MathUtils.degToRad(camara.fov) / 2)) / (alto * camara.zoom)
  grupo.scale.setScalar(mundoPorPx)
  return mundoPorPx
}

const ESQUINA = new THREE.Vector3()

/**
 * Las cuatro esquinas de una cara de la pieza (px de su geometría: de (0,0) a (ancho,−alto), a la altura `z`), como las ve
 * la cámara viva, en px del cuadro y relativas a `origen` (la esquina del DOM sin transformar). Escribe en `destino`.
 */
export function caraEnElCuadro(objeto: THREE.Object3D, camara: THREE.Camera, ancho: number, alto: number, z: number, cuadro: { readonly ancho: number; readonly alto: number }, origen: { readonly x: number; readonly y: number }, destino: number[]): void {
  const esquinas = [0, 0, ancho, 0, ancho, -alto, 0, -alto]
  destino.length = 8
  for (let k = 0; k < 4; k += 1) {
    ESQUINA.set(esquinas[2 * k], esquinas[2 * k + 1], z).applyMatrix4(objeto.matrixWorld).project(camara)
    destino[2 * k] = ((ESQUINA.x + 1) / 2) * cuadro.ancho - origen.x
    destino[2 * k + 1] = ((1 - ESQUINA.y) / 2) * cuadro.alto - origen.y
  }
}
