import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'

/**
 * [PULIDO 20] R1 · LA DISTANCIA DE LA CÁMARA DEL FINAL EN ESCRITORIO, DE COSTADO Y LEJOS: el humano quiere ver gran parte de la escena al
 * final (no la cámara cerca desde arriba de PULIDO 19). La cámara sube hasta `elevacionGrados` mirando el centro del logo acostado desde el
 * frente (la base del pie: `atras` se aleja de ella) y se queda a la distancia más corta en la que la huella entera (las columnas acostadas
 * y el logo: el rectángulo de sus medias extensiones en la base) cae adentro de `ocupa` del cuadro (NDC): lo que sobra es piso y domo.
 * Una búsqueda por mitades sobre una cámara de trabajo (sin reservas por cuadro).
 */
const CAMARA = new THREE.PerspectiveCamera()
const BLANCO = new THREE.Vector3()
const PUNTO = new THREE.Vector3()

/** ¿La huella entra en `ocupa` del cuadro desde la distancia `r`? */
function entra(r: number, e: number, ax: number, az: number, cx: number, cz: number, dx: number, dz: number, mediaDerecha: number, mediaAtras: number, ocupa: number): boolean {
  CAMARA.position.set(cx - ax * r * Math.cos(e), FLOOR_Y + r * Math.sin(e), cz - az * r * Math.cos(e))
  CAMARA.lookAt(BLANCO)
  CAMARA.updateMatrixWorld(true)
  for (let k = 0; k < 4; k += 1) {
    const sd = k % 2 === 0 ? -1 : 1
    const sa = k < 2 ? -1 : 1
    PUNTO.set(cx + dx * mediaDerecha * sd + ax * mediaAtras * sa, FLOOR_Y, cz + dz * mediaDerecha * sd + az * mediaAtras * sa).project(CAMARA)
    if (Math.abs(PUNTO.x) > ocupa || Math.abs(PUNTO.y) > ocupa || PUNTO.z > 1) return false
  }
  return true
}

/**
 * La distancia (u) desde el centro del logo (`cx`, `cz`, en el piso) a la que la huella (medias extensiones a lo largo de `derecha` y de
 * `atras`, u) entra en `ocupa` del cuadro, con la cámara a `elevacionGrados` del lado de adelante; el campo vertical (grados) y el aspecto.
 */
export function distanciaDeLaVista(fovGrados: number, aspecto: number, elevacionGrados: number, ocupa: number, cx: number, cz: number, derechaX: number, derechaZ: number, atrasX: number, atrasZ: number, mediaDerecha: number, mediaAtras: number): number {
  CAMARA.fov = fovGrados
  CAMARA.aspect = aspecto
  CAMARA.near = 0.1
  CAMARA.far = 2000
  CAMARA.updateProjectionMatrix()
  BLANCO.set(cx, FLOOR_Y, cz)
  const e = THREE.MathUtils.degToRad(elevacionGrados)
  let cerca = 1
  let lejos = 400
  for (let k = 0; k < 28; k += 1) {
    const r = (cerca + lejos) / 2
    if (entra(r, e, atrasX, atrasZ, cx, cz, derechaX, derechaZ, mediaDerecha, mediaAtras, ocupa)) lejos = r
    else cerca = r
  }
  return lejos
}
