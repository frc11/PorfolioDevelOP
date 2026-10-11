/**
 * [PULIDO 14] L2 a · el modelo de la cámara del pie para el invariante (s65): la cámara viva y la de sin el mouse, cuadro a cuadro,
 * con las funciones del cuadro del final (`cuadroDelFinal.ts`), y su velocidad angular: dónde arranca, si se detiene a mitad de
 * camino, si salta (la prueba de los dos pasos: un salto no se achica con el paso, una aceleración sí) y el desvío al golpe.
 */
import * as THREE from 'three'

import { CAIDA_AL_HUECO, anguloEnElReloj } from '../escena/final/caidaAlHueco'
import { LOGO_DE_SIEMPRE, RELOJ_DEL_FINAL, blancoDelFinal, camaraDelFinal, elevacionDe } from '../escena/final/recorridoDelFinal'
import { ORBIT_TARGET_Y } from '../escena/probeScene'

/** Lo que hace el cuadro con la cámara viva: la sin el mouse (pose E) y la viva, que se tocan. */
export type PasoDeLaCamara = (fin: number, viva: THREE.PerspectiveCamera, sinMouse: THREE.PerspectiveCamera) => void

export interface Recorrido {
  /** La velocidad angular del eje de la cámara (°/s) en cada paso y el ángulo del logo (°). */
  readonly w: readonly number[]
  readonly a: readonly number[]
  /** Desde qué paso se mueve (sobre 1 °/s) y hasta cuál se mira (el logo a 85°: después llega arriba con el golpe). */
  readonly arranca: number
  readonly hasta: number
  /** Las detenciones a mitad de camino (pasos debajo de 0,5 °/s después de arrancar). */
  readonly detenidos: number
  /** El mayor cambio de la velocidad angular entre dos pasos (°/s). */
  readonly salto: number
  /** El desvío de frente al golpe (°). */
  readonly alGolpe: number
}

const BLANCO = new THREE.Vector3()
const ADELANTE = new THREE.Vector3()
const ANTES = new THREE.Vector3()

/** Una cámara de la pose E (azimut y altura con el paralaje del mouse), mirando al centro de la órbita. */
export function poseE(destino: THREE.PerspectiveCamera, azimutGrados = 0, altura = 5, distancia = 40): THREE.PerspectiveCamera {
  const az = THREE.MathUtils.degToRad(azimutGrados)
  destino.position.set(Math.sin(az) * distancia, altura, Math.cos(az) * distancia)
  destino.up.set(0, 1, 0)
  destino.lookAt(0, ORBIT_TARGET_Y, 0)
  destino.updateMatrixWorld()
  return destino
}

/** El recorrido de `paso` desde el arranque del final hasta el golpe, de a `dt` segundos del reloj. */
export function recorrerLaCaida(paso: PasoDeLaCamara, mouse: { readonly azimut: number; readonly altura: number }, dt: number): Recorrido {
  const viva = new THREE.PerspectiveCamera(32, 1440 / 900, 0.1, 400)
  const sinMouse = new THREE.PerspectiveCamera(32, 1440 / 900, 0.1, 400)
  const w: number[] = []
  const a: number[] = []
  let alGolpe = 0
  for (let s = 0; s <= CAIDA_AL_HUECO.golpeS + 1e-9; s += dt) {
    const fin = s / RELOJ_DEL_FINAL.duracionS
    poseE(viva, mouse.azimut, 5 + mouse.altura)
    poseE(sinMouse)
    paso(fin, viva, sinMouse)
    ADELANTE.set(0, 0, -1).applyQuaternion(viva.quaternion)
    w.push(w.length === 0 ? 0 : THREE.MathUtils.radToDeg(ADELANTE.angleTo(ANTES)) / dt)
    ANTES.copy(ADELANTE)
    const ang = anguloEnElReloj(LOGO_DE_SIEMPRE, s)
    a.push(THREE.MathUtils.radToDeg(ang.a))
    if (ang.toco && alGolpe === 0) alGolpe = THREE.MathUtils.radToDeg(Math.acos(Math.min(1, -(ADELANTE.y * Math.sin(ang.a) + ADELANTE.z * Math.cos(ang.a)))))
  }
  const arranca = w.findIndex((x) => x > 1)
  const hasta = a.findIndex((x) => x >= 85)
  let detenidos = 0
  let salto = 0
  for (let i = Math.max(1, arranca); arranca >= 0 && i < hasta; i += 1) {
    if (w[i] < 0.5) detenidos += 1
    salto = Math.max(salto, Math.abs(w[i] - w[i - 1]))
  }
  return { w, a, arranca, hasta, detenidos, salto, alGolpe }
}

/** El cuadro de hoy (`cuadroDelFinal.ts`): la viva gira al azimut sin el mouse con el acercamiento y sube con `alturaDeLaCaida`. */
export function pasoDeHoy(funciones: {
  readonly acercamiento: (fin: number) => number
  readonly altura: (fin: number, e: number) => number
  readonly haciaElAzimut: (viva: THREE.Camera, sinMouse: THREE.Camera, w: number) => void
}): PasoDeLaCamara {
  return (fin, viva, sinMouse) => {
    funciones.haciaElAzimut(viva, sinMouse, funciones.acercamiento(fin))
    camaraDelFinal(viva, funciones.altura(fin, elevacionDe(viva.position)), blancoDelFinal(fin, BLANCO), 0, 0, null)
  }
}

/** La cámara de PULIDO 13 (K4): el paralaje se iba atado al ángulo hasta la altura de la cámara y desde ahí la subida de frente. */
export function pasoDeK4(subida: (fin: number, e: number) => number): PasoDeLaCamara {
  return (fin, viva, sinMouse) => {
    const e0 = elevacionDe(sinMouse.position)
    const { a, toco } = anguloEnElReloj(LOGO_DE_SIEMPRE, fin * RELOJ_DEL_FINAL.duracionS)
    const sin = fin <= 0 ? 0 : toco ? 1 : Math.min(1, Math.max(0, a / Math.max(1e-3, e0)))
    if (sin > 0) {
      viva.position.lerp(sinMouse.position, sin)
      viva.quaternion.slerp(sinMouse.quaternion, sin)
    }
    camaraDelFinal(viva, subida(fin, e0), blancoDelFinal(fin, BLANCO), 0, 0, null)
  }
}
