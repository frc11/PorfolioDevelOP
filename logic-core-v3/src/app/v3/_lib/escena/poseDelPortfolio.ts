import * as THREE from 'three'

import { aimWithFraming } from './cameraFraming'
import type { MutableChoreoPose } from './choreographyTypes'
import { recorridoDeEncuadre } from './encuadre'
import { PORTFOLIO_EN_LA_ESCENA, avanzarElPeso, mezclarLaPose, type PoseDelPortfolio } from './portfolioEnLaEscena'
import { CAMERA_FAR, CAMERA_NEAR, ORBIT_TARGET_Y } from './probeScene'

/**
 * [B1.2b] LA POSE DEL PORTFOLIO, RESUELTA PARA CADA CUADRO (plan §12, punto 1) — una sola, calma y frontal.
 *
 * Es la cámara del PIN (la viva en p 0,475, cuando entra el panel) con el mismo azimut y la misma dirección de la mirada: la
 * cámara no gira, sólo se aleja y corre el encuadre. El logo cae centrado en la mitad de abajo de la columna que deja el panel
 * (`PORTFOLIO_EN_LA_ESCENA.columna`: la mitad del ancho desde 1024, el 40 % en tablet), con su alto y su ancho acotados a esa
 * mitad. Como el encuadre mueve el logo en FRACCIONES DEL RECORRIDO (`encuadre.ts`) y el recorrido depende del aspecto y del
 * campo de visión (la banda portátil lo abre), un encuadre fijo corría el centro del logo un 1,8 % del ancho entre 1440 y 1024:
 * acá se resuelve para el cuadro de ahora proyectando la caja del logo con la cámara armada como la arma el rig, y se corrige en
 * unos pasos. Se memoriza por cuadro (aspecto, campo, medidas y columna): por cuadro no cuesta nada.
 *
 * Con ESTA pose se coloca también el título 3D (la lectura del Portfolio, `titulos3d/colocacion.ts`): con el panel adentro y el
 * mouse quieto, el título queda en su lugar del DOM y de frente, sin perspectiva.
 */

/**
 * La cámara viva en el pin (p 0,475, que el rig muestrea como la de entonces en 0,4479: `camaraDeEntonces.ts`): azimut, altura y
 * distancia. s76 la compara con la coreografía.
 */
export const CAMARA_DEL_PIN = { angleDeg: 177.434, height: 7.267, distance: 17.881 } as const

/**
 * Dónde y de qué tamaño va el logo, en coordenadas del cuadro (−1…1, y hacia arriba): su centro a tres cuartos del alto (el
 * medio de la mitad de abajo) y en el medio de la columna; su alto, a lo sumo el 60 % de esa mitad; su ancho, el 70 % de la
 * columna.
 */
export const LOGO_EN_SU_MITAD = { centroY: -0.5, alto: 0.6, anchoDeLaColumna: 0.7 } as const

/** Las medidas del logo medido (el mesh: `ProbeLogo`) mientras la escena todavía no las publicó. */
const LOGO_POR_DEFECTO = { ancho: 6.863, alto: 4.779 } as const
const ESPESOR_DEL_LOGO = 0.56
const PASOS_DE_LA_CORRECCION = 3

const CAMARA = new THREE.PerspectiveCamera()
const PUNTO = new THREE.Vector3()

/** Arma la cámara como el rig (la órbita, el blanco y el encuadre) para una pose y un cuadro. */
export function armarLaCamara(c: THREE.PerspectiveCamera, pose: PoseDelPortfolio, aspecto: number, fovDeg: number, logoW: number, logoH: number): THREE.PerspectiveCamera {
  c.fov = fovDeg
  c.aspect = aspecto
  c.near = CAMERA_NEAR
  c.far = CAMERA_FAR
  c.updateProjectionMatrix()
  const azimut = THREE.MathUtils.degToRad(pose.angleDeg)
  c.position.set(Math.sin(azimut) * pose.distance, pose.height, Math.cos(azimut) * pose.distance)
  c.lookAt(0, ORBIT_TARGET_Y, 0)
  if (pose.frameX !== 0 || pose.frameY !== 0) aimWithFraming(c, aspecto, logoW, logoH, Math.hypot(pose.distance, pose.height - ORBIT_TARGET_Y), pose.frameX, pose.frameY)
  c.updateMatrixWorld(true)
  return c
}

/** La caja del logo proyectada (centro y medidas, en coordenadas del cuadro): los extremos de su tinta, de cara a cara. */
export function cajaProyectada(c: THREE.PerspectiveCamera, logoW: number, logoH: number): { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number } {
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (const z of [-ESPESOR_DEL_LOGO / 2, ESPESOR_DEL_LOGO / 2]) {
    for (const [x, y] of [[-logoW / 2, 0], [logoW / 2, 0], [0, -logoH / 2], [0, logoH / 2]] as const) {
      PUNTO.set(x, ORBIT_TARGET_Y + y, z).project(c)
      x0 = Math.min(x0, PUNTO.x)
      x1 = Math.max(x1, PUNTO.x)
      y0 = Math.min(y0, PUNTO.y)
      y1 = Math.max(y1, PUNTO.y)
    }
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, ancho: x1 - x0, alto: y1 - y0 }
}

let ultimaClave = ''
const ULTIMA: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }

/** La pose del Portfolio para un cuadro (memorizada: se recalcula sólo si cambia el cuadro, el campo, el logo o la columna). */
export function poseDelPortfolio(aspecto: number, fovDeg: number, logoW: number, logoH: number, columna: number): PoseDelPortfolio {
  const w = logoW > 0 ? logoW : LOGO_POR_DEFECTO.ancho
  const h = logoH > 0 ? logoH : LOGO_POR_DEFECTO.alto
  const clave = `${aspecto.toFixed(4)}|${fovDeg.toFixed(4)}|${w.toFixed(3)}|${h.toFixed(3)}|${columna.toFixed(3)}`
  if (clave === ultimaClave) return ULTIMA
  const p = ULTIMA
  // 1 · El tamaño: desde la cámara del pin, alejarla (o acercarla) hasta que el logo entre en su mitad, sin cambiar la dirección de la mirada.
  Object.assign(p, CAMARA_DEL_PIN, { frameX: 0, frameY: 0 })
  const caja = cajaProyectada(armarLaCamara(CAMARA, p, aspecto, fovDeg, w, h), w, h)
  const escala = Math.max(caja.alto / LOGO_EN_SU_MITAD.alto, caja.ancho / (LOGO_EN_SU_MITAD.anchoDeLaColumna * 2 * columna))
  p.distance = CAMARA_DEL_PIN.distance * escala
  p.height = ORBIT_TARGET_Y + (CAMARA_DEL_PIN.height - ORBIT_TARGET_Y) * escala
  // 2 · El encuadre: el centro de la columna y tres cuartos del alto; primero la cuenta del recorrido, después unos pasos medidos.
  const objetivo = { x: columna - 1, y: LOGO_EN_SU_MITAD.centroY }
  const ojo = Math.hypot(p.distance, p.height - ORBIT_TARGET_Y)
  const medioAlto = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2) * ojo
  const medioAncho = medioAlto * aspecto
  const porX = medioAncho / recorridoDeEncuadre(medioAncho, w)
  const porY = medioAlto / recorridoDeEncuadre(medioAlto, h)
  p.frameX = objetivo.x * porX
  p.frameY = objetivo.y * porY
  for (let k = 0; k < PASOS_DE_LA_CORRECCION; k += 1) {
    const ahora = cajaProyectada(armarLaCamara(CAMARA, p, aspecto, fovDeg, w, h), w, h)
    p.frameX += (objetivo.x - ahora.x) * porX
    p.frameY += (objetivo.y - ahora.y) * porY
  }
  ultimaClave = clave
  return p
}

/**
 * El cuadro del rig: avanza el peso hacia lo que pide la sección y mezcla la pose del Portfolio (la de este cuadro). Un
 * desplazamiento sobre la pose del scroll: el progreso no se toca (la regla de B5). Devuelve el peso.
 */
export function mezclarConElPortfolio(objetivo: MutableChoreoPose, dt: number, aspecto: number, fovDeg: number, logoW: number, logoH: number): number {
  const e = PORTFOLIO_EN_LA_ESCENA
  e.peso = avanzarElPeso(e.peso, e.adentro ? 1 : 0, dt, e.reducido)
  if (e.peso > 0) mezclarLaPose(objetivo, poseDelPortfolio(aspecto, fovDeg, logoW, logoH, e.columna), e.peso)
  return e.peso
}
