import * as THREE from 'three'

/**
 * [PULIDO 3B] B2 · EN EL PIE, EL MOUSE DEJA VER LA ESCENA EN DIAGONAL — en escritorio (puntero fino), la cámara del final orbita
 * alrededor del logo con el mouse: llevarlo a un costado muestra la escena en diagonal desde ese lado (con la energía bajo el
 * piso, se ven los costados de los bloques y las rendijas). Desde arriba (la cámara del final mira casi vertical) la órbita es
 * en el plano de la pantalla: alrededor de su eje vertical (`horizontal`, grados a cada lado) y del horizontal (`vertical`).
 * Amortiguada (`amortiguaS`) y de vuelta al centro cuando el mouse sale de la ventana. Mientras corre la cinemática del
 * encastre (o el rebobinado, o un viaje) se atenúa (`enLaCinematica`): no pelea con la cámara; en el quieto vuelve entera. En
 * el teléfono y la tablet, nada. El techo del domo nunca entra en el rango (`s54` B2).
 */
export const ORBITA_DEL_MOUSE = { horizontal: 17, vertical: 6, amortiguaS: 0.3, enLaCinematica: 0.2 } as const

/** Lo que lleva la órbita: dónde va (grados), cuánto la deja la cinemática (0 a 1) y si el mouse salió de la ventana. */
export interface EstadoDeLaOrbita {
  h: number
  v: number
  deja: number
}

export const nuevaOrbita = (): EstadoDeLaOrbita => ({ h: 0, v: 0, deja: 0 })

/** [PULIDO 3B] B2 · lo que escribe el DOM: dónde está el mouse (de −1 a 1, como el cuadro) y si salió de la ventana (vuelve al centro). */
export const ORBITA_EN_VIVO = { x: 0, y: 0, fuera: true }

/**
 * Un paso de la órbita: hacia el mouse (`puntero`, de −1 a 1 en los dos ejes; `null`: sin mouse o afuera, al centro), con la
 * cinemática (`entera`: el final entero, en el quieto; atenuada mientras corre, rebobina o viaja) y amortiguada en `dt` s.
 */
export function pasoDeLaOrbita(o: EstadoDeLaOrbita, puntero: { readonly x: number; readonly y: number } | null, entera: boolean, dt: number): void {
  const O = ORBITA_DEL_MOUSE
  const a = 1 - Math.exp(-Math.max(0, dt) / O.amortiguaS)
  o.deja += ((entera ? 1 : O.enLaCinematica) - o.deja) * a
  const h = puntero === null ? 0 : Math.max(-1, Math.min(1, puntero.x)) * O.horizontal * o.deja
  const v = puntero === null ? 0 : Math.max(-1, Math.min(1, puntero.y)) * O.vertical * o.deja
  o.h += (h - o.h) * a
  o.v += (v - o.v) * a
}

const ARRIBA = new THREE.Vector3()
const DERECHA = new THREE.Vector3()
const GIRO = new THREE.Quaternion()
const GIRO_V = new THREE.Quaternion()
const DESDE = new THREE.Vector3()

/**
 * La órbita aplicada a la cámara: alrededor de `blanco` (el logo), girando en el plano de la pantalla: `h` grados alrededor de
 * su eje vertical (a la derecha, la cámara va a la derecha) y `v` alrededor del horizontal (arriba, va arriba). Rígida: la
 * cámara sigue mirando al logo.
 */
export function ponerLaOrbita(c: THREE.Camera, blanco: THREE.Vector3, h: number, v: number): void {
  if (h === 0 && v === 0) return
  ARRIBA.set(0, 1, 0).applyQuaternion(c.quaternion)
  DERECHA.set(1, 0, 0).applyQuaternion(c.quaternion)
  GIRO.setFromAxisAngle(ARRIBA, THREE.MathUtils.degToRad(h)).multiply(GIRO_V.setFromAxisAngle(DERECHA, THREE.MathUtils.degToRad(-v)))
  DESDE.copy(c.position).sub(blanco).applyQuaternion(GIRO)
  c.position.copy(blanco).add(DESDE)
  c.quaternion.premultiply(GIRO)
  c.updateMatrixWorld()
}
