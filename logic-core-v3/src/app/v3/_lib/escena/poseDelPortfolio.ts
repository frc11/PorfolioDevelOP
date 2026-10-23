import * as THREE from 'three'

import { aimWithFraming } from './cameraFraming'
import type { MutableChoreoPose } from './choreographyTypes'
import { recorridoDeEncuadre } from './encuadre'
import { PORTFOLIO_EN_LA_ESCENA, avanzarElPeso, huecoQueVale, mezclarLaPose, objetivoDeLaPose, type HuecoDelLogo, type PoseDelPortfolio } from './portfolioEnLaEscena'
import { CAMERA_FAR, CAMERA_NEAR, ORBIT_TARGET_Y } from './probeScene'

/**
 * [B1.2c] LA POSE DEL PORTFOLIO, RESUELTA PARA CADA CUADRO (plan §13, punto 1) — una sola, DE FRENTE AL PLANO DEL LOGO.
 *
 * En B1.2b la cámara era la del pin, alejada y con el encuadre corrido: miraba al logo desde arriba (~22°) y el encuadre la giraba
 * para correrlo, así que el logo se veía girado al lado de un título de frente. Ahora la mirada es PERPENDICULAR al plano del logo
 * (+z: la cámara está del lado de atrás, como en todo el tramo de Trabajos) y el logo se corre en el cuadro MOVIENDO la cámara en
 * ese plano, no girándola: un plano paralelo al cuadro se proyecta sin perspectiva en cualquier lugar del cuadro. Con la misma pose de
 * cinco números del rig: la órbita (azimut, altura y distancia) pone la cámara en su lugar y el encuadre apunta al blanco que deja la
 * mirada en +z (`aimWithFraming` mueve el blanco en la base de la pantalla: se resuelven sus dos números). El título 3D se coloca con
 * ESTA pose (`titulos3d/colocacion.ts`, la lectura del Portfolio) a la profundidad del centro del logo sobre la mirada: queda EN el
 * plano del logo y de frente, los dos con la misma normal.
 *
 * El logo va adentro de su HUECO (`HuecoDelLogo`: lo guarda el DOM debajo del título y la bajada, en el eje de la columna): la
 * distancia lo encaja por la medida que manda (su ancho o su alto) y la cámara se corre para que su centro caiga en el del hueco. Se
 * memoriza por cuadro (aspecto, campo, medidas y hueco).
 */

/** Las medidas del logo medido (el mesh: `ProbeLogo`) mientras la escena todavía no las publicó. */
const LOGO_POR_DEFECTO = { ancho: 6.863, alto: 4.779 } as const
export const ESPESOR_DEL_LOGO = 0.56
/** La mirada del Portfolio: +z (la cámara del lado de atrás del logo, como en el tramo de Trabajos). */
export const MIRADA_DEL_PORTFOLIO = new THREE.Vector3(0, 0, 1)

const CAMARA = new THREE.PerspectiveCamera()
const PUNTO = new THREE.Vector3()
const DERECHA = new THREE.Vector3()
const ARRIBA = new THREE.Vector3()

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

/**
 * La pose del Portfolio para un cuadro y un hueco (memorizada: se recalcula sólo si cambia algo).
 *
 *   1 · la profundidad D (la del plano del logo sobre la mirada): la cara de adelante entra en el hueco por su ancho y por su alto
 *       (con la mirada en +z, un ancho W a la profundidad d ocupa W / (d · tan(fov/2) · aspecto) del cuadro);
 *   2 · la cámara en (x, y, −D): con la mirada en +z el centro del logo cae en x / (D · t · aspecto) y en (y₀ − y) / (D · t), así que
 *       se despeja para que caiga en el centro del hueco;
 *   3 · la órbita: el azimut, la altura y la distancia que ponen la cámara ahí;
 *   4 · el encuadre: el rig mira primero al logo y después al blanco corrido en la base de esa pantalla (`aimWithFraming`); el blanco
 *       que deja la mirada en +z está a la misma x y la misma y que la cámara, y los dos números del encuadre salen de ahí.
 */
export function poseDelPortfolio(aspecto: number, fovDeg: number, logoW: number, logoH: number, hueco: HuecoDelLogo): PoseDelPortfolio {
  const w = logoW > 0 ? logoW : LOGO_POR_DEFECTO.ancho
  const h = logoH > 0 ? logoH : LOGO_POR_DEFECTO.alto
  const clave = `${aspecto.toFixed(4)}|${fovDeg.toFixed(4)}|${w.toFixed(3)}|${h.toFixed(3)}|${hueco.x.toFixed(4)}|${hueco.y.toFixed(4)}|${hueco.ancho.toFixed(4)}|${hueco.alto.toFixed(4)}`
  if (clave === ultimaClave) return ULTIMA
  const p = ULTIMA
  const t = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2)
  // 1 · La profundidad: la cara de adelante (medio espesor más cerca) entra en el hueco.
  const D = Math.max(w / (hueco.ancho * t * aspecto), h / (hueco.alto * t)) + ESPESOR_DEL_LOGO / 2
  // 2 · La cámara en el plano paralelo al del logo.
  const x = hueco.x * D * t * aspecto
  const y = ORBIT_TARGET_Y - hueco.y * D * t
  // 3 · La órbita que la pone ahí (del lado de atrás: el azimut cerca de 180°).
  p.distance = Math.hypot(x, D)
  p.height = y
  p.angleDeg = ((THREE.MathUtils.radToDeg(Math.atan2(x, -D)) % 360) + 360) % 360
  // 4 · El encuadre: el blanco a la x y la y de la cámara (la mirada queda en +z).
  p.frameX = 0
  p.frameY = 0
  armarLaCamara(CAMARA, p, aspecto, fovDeg, w, h)
  DERECHA.set(1, 0, 0).applyQuaternion(CAMARA.quaternion)
  ARRIBA.set(0, 1, 0).applyQuaternion(CAMARA.quaternion)
  const ojo = Math.hypot(p.distance, p.height - ORBIT_TARGET_Y)
  const medioAlto = t * ojo
  const recorridoX = recorridoDeEncuadre(medioAlto * aspecto, w)
  const recorridoY = recorridoDeEncuadre(medioAlto, h)
  // El blanco es (0, y₀, 0) − a·DERECHA − b·ARRIBA; la DERECHA de mirar al logo es horizontal, así que la y la fija `b` sola.
  const b = (ORBIT_TARGET_Y - y) / ARRIBA.y
  const a = -(x + b * ARRIBA.x) / DERECHA.x
  p.frameX = recorridoX > 1e-9 ? a / recorridoX : 0
  p.frameY = recorridoY > 1e-9 ? b / recorridoY : 0
  ultimaClave = clave
  return p
}

/**
 * El cuadro del rig: avanza el peso hacia lo que pide la sección y mezcla la pose del Portfolio (la de este cuadro). Un
 * desplazamiento sobre la pose del scroll: el progreso no se toca (la regla de B5). Devuelve el peso.
 */
export function mezclarConElPortfolio(objetivo: MutableChoreoPose, dt: number, aspecto: number, fovDeg: number, logoW: number, logoH: number): number {
  const e = PORTFOLIO_EN_LA_ESCENA
  // [C2-41e] La pose también con Demos a la vista (su espejo); el oscurecido, sólo con el panel.
  e.peso = avanzarElPeso(e.peso, objetivoDeLaPose(e), dt, e.reducido)
  e.pesoDelOscurecido = avanzarElPeso(e.pesoDelOscurecido, e.adentro ? 1 : 0, dt, e.reducido)
  if (e.peso > 0) mezclarLaPose(objetivo, poseDelPortfolio(aspecto, fovDeg, logoW, logoH, huecoQueVale()), e.peso)
  return e.peso
}
