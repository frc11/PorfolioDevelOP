/**
 * LA CÁMARA DEL PRELOADER CON EL RECORRIDO CORREGIDO — sólo para MEDIR §7.44.
 *
 * ⚠ **ESTO NO ES PRODUCCIÓN Y NO LO IMPORTA NADIE DEL SITIO VIVO.** Es el
 * contrafactual de `scene-camera.ts`, que SITIO-S12 tiene prohibido editar
 * porque su arreglo mueve el punto donde aterriza el logo del preloader en un
 * teléfono en vertical, y eso se juzga por grabación y no por un invariante.
 *
 * ── Por qué hace falta un módulo y no una resta ────────────────────────────
 *
 * Porque `travelX` vale **0** debajo del codo, y un cero no se puede escalar:
 * no hay pose, ni `frameX`, ni combinación de argumentos de `frameScenePose`
 * que reproduzca lo que devolvería `abs(·)`. El contrafactual hay que
 * componerlo, y componerlo consumiendo **la fuente única** —
 * `recorridoDeEncuadre` de `_lib/escena/encuadre.ts`— que es exactamente lo que
 * §7.44 pide: *«`encuadre.ts` es three-free justamente para que las cinco puedan
 * importarlo»*.
 *
 * Es la misma forma que `_lib/escena/__tests__/camaraDelCuadro.ts` ya usa con la
 * cámara del arnés, y por la misma razón.
 *
 * ── LO QUE LO HACE HONESTO: la equivalencia donde la corrección es un no-op ─
 *
 * `abs(h − m/2)` y `max(0, h − m/2)` devuelven el **mismo número** con el
 * argumento positivo, o sea en todo aspecto arriba del codo. Ahí esta cámara y
 * `sceneCameraAt` tienen que coincidir **hasta el último bit**, y también con
 * `frameX: 0`, donde ninguna de las dos apunta. `scene-framing.invariant.ts` lo
 * afirma con las dos comprobaciones: si esta composición se hubiera equivocado
 * en un signo o en el orden de la base, no cerrarían.
 */

import { CAMERA_FOV, ORBIT_TARGET_Y } from '@/app/v3/_lib/escena/probeScene'
import { recorridoDeEncuadre } from '@/app/v3/_lib/escena/encuadre'
import type { ChoreoPose } from '@/app/v3/_lib/escena/choreographyTypes'
import { SCENE_LOGO_MESH_WORLD, type SceneCamera, type SceneVec3 } from '@/lib/scene-camera'

type Vec3 = SceneVec3

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: Vec3): Vec3 => {
  const largo = Math.hypot(a[0], a[1], a[2])
  return [a[0] / largo, a[1] / largo, a[2] / largo]
}

/** La misma base que `Object3D.lookAt` construye, y que `scene-camera.ts` copia. */
function baseDeLookAt(posicion: Vec3, objetivo: Vec3) {
  const z = norm(sub(posicion, objetivo))
  const x = norm(cross([0, 1, 0], z))
  const y = cross(z, x)
  return { right: x, up: y, forward: [-z[0], -z[1], -z[2]] as Vec3 }
}

const TAN_MEDIO_FOV = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180)
const GRADO = Math.PI / 180

/**
 * La cámara de una pose con el recorrido de `encuadre.ts`.
 *
 * Misma firma y misma forma de vuelta que `sceneCameraAt`, para que se pueda
 * intercambiar sin tocar a quien la llama — que es lo que hace comparable el
 * antes con el después.
 */
export function camaraCorregidaEn(
  pose: ChoreoPose,
  anchoPx: number,
  altoPx: number,
): SceneCamera | null {
  if (!(anchoPx > 0) || !(altoPx > 0)) return null

  const aspecto = anchoPx / altoPx
  const azimut = pose.angleDeg * GRADO
  const posicion: Vec3 = [
    Math.sin(azimut) * pose.distance,
    pose.height,
    Math.cos(azimut) * pose.distance,
  ]
  const objetivo: Vec3 = [0, ORBIT_TARGET_Y, 0]

  let base = baseDeLookAt(posicion, objetivo)
  if (pose.frameX !== 0 || pose.frameY !== 0) {
    const distanciaAlOjo = Math.hypot(pose.distance, pose.height - ORBIT_TARGET_Y)
    const medioAlto = TAN_MEDIO_FOV * distanciaAlOjo
    const recorridoX = recorridoDeEncuadre(medioAlto * aspecto, SCENE_LOGO_MESH_WORLD.width)
    const recorridoY = recorridoDeEncuadre(medioAlto, SCENE_LOGO_MESH_WORLD.height)
    const mira: Vec3 = [
      objetivo[0] + base.right[0] * -pose.frameX * recorridoX + base.up[0] * -pose.frameY * recorridoY,
      objetivo[1] + base.right[1] * -pose.frameX * recorridoX + base.up[1] * -pose.frameY * recorridoY,
      objetivo[2] + base.right[2] * -pose.frameX * recorridoX + base.up[2] * -pose.frameY * recorridoY,
    ]
    base = baseDeLookAt(posicion, mira)
  }

  return { position: posicion, ...base, aspect: aspecto }
}

/** ¿Las dos cámaras coinciden en posición y en las tres direcciones de pantalla? */
export function mismaCamaraDelPreloader(
  a: SceneCamera,
  b: SceneCamera,
  tolerancia = 1e-12,
): boolean {
  const ejes = ['position', 'right', 'up', 'forward'] as const
  return ejes.every((eje) =>
    a[eje].every((componente, i) => Math.abs(componente - b[eje][i]) <= tolerancia),
  )
}
