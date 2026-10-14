import * as THREE from 'three'

import type { BaseDelPie, LugarEnElPiso, PiezaDePie } from '../final/caidaDelPie'
import { FLOOR_Y } from '../probeScene'

/**
 * [PULIDO 24] V3 · La caja del pie acostado con el logo, en la base del pie: su centro (x, z del mundo) y sus medias extensiones a lo largo
 * de `derecha` y de `atras` (u), en `destino` (4). Las columnas caen donde están (delante del logo): la caja no está centrada en él.
 */
export function cajaDelPieAcostado(columnas: readonly PiezaDePie[], cuantas: number, lugares: readonly LugarEnElPiso[], b: BaseDelPie, destino: Float64Array): void {
  let [d0, d1, a0, a1] = [-b.logoAncho / 2, b.logoAncho / 2, -b.logoFondo / 2, b.logoFondo / 2]
  for (let i = 0; i < Math.min(cuantas, columnas.length, lugares.length); i += 1) {
    const p = columnas[i]
    const l = lugares[i]
    const d = (l.x - b.logoX) * b.derechaX + (l.z - b.logoZ) * b.derechaZ
    const a = (l.x - b.logoX) * b.atrasX + (l.z - b.logoZ) * b.atrasZ
    d0 = Math.min(d0, d - p.ancho / 2)
    d1 = Math.max(d1, d + p.ancho / 2)
    a0 = Math.min(a0, a)
    a1 = Math.max(a1, a + p.alto)
  }
  const [dc, ac] = [(d0 + d1) / 2, (a0 + a1) / 2]
  destino[0] = b.logoX + b.derechaX * dc + b.atrasX * ac
  destino[1] = b.logoZ + b.derechaZ * dc + b.atrasZ * ac
  destino[2] = (d1 - d0) / 2
  destino[3] = (a1 - a0) / 2
}

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
