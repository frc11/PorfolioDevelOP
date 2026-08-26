import {
  CAMERA_FOV,
  FRAME_TRAVEL_SAFETY,
  ORBIT_TARGET_Y,
  PROBE_EXTRUDE,
  PROBE_SVG_SCALE,
} from '@/app/probe-escena/_components/probeScene'
import type { ChoreoPose } from '@/app/probe-escena/_components/choreographyTypes'
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'

/**
 * LA CÁMARA DE LA ESCENA, SIN THREE — dónde está y cómo proyecta.
 *
 * Salió de `scene-framing.ts` en S13, por el límite de 300 líneas del repo y con
 * una costura limpia: **acá está la cámara, allá el destino del logo.** Lo que
 * obligó el corte fue que el preloader necesitó proyectar puntos que no son el
 * logo —las partículas de la escena, para medir de qué tamaño y en qué lugar de
 * la pantalla caen en la pose inicial— y esa base era una variable local.
 *
 * ── Qué reimplementa y por qué no lo importa ───────────────────────────────
 *
 * La cámara del rig (`OrbitRig.tsx`) y el encuadre (`cameraFraming.ts`) están
 * atados a `three` y a un `useFrame`. Acá se necesita el mismo resultado **sin
 * DOM y sin three**, para poder correrlo en el server, en node y en una
 * comprobación estática. La aritmética es idéntica y está anotada contra su
 * fuente línea por línea.
 *
 *     npx tsx src/lib/scene-framing.invariant.ts
 */

// ── La caja de la tinta, en unidades de mundo ───────────────────────────────

/**
 * Lo que el rig le pasa a `aimWithFraming` como `logoW`/`logoH`: la caja del
 * mesh **extruido**, o sea la de la tinta más el bisel (`PROBE_EXTRUDE.bevelSize`
 * por lado, +2 en cada dimensión). Derivada, no copiada: si el bisel cambia,
 * esto cambia con él.
 *
 * Da 6,863 × 4,779, contra los 6,86 × 4,78 que `PROBE-ESCENA.md` publica de la
 * medición en runtime. Dos caminos independientes al mismo número.
 */
const BEVEL_VB = PROBE_EXTRUDE.bevelSize * 2
export const SCENE_LOGO_MESH_WORLD = {
  width: (LOGO_INK_VIEWBOX.width + BEVEL_VB) * PROBE_SVG_SCALE,
  height: (LOGO_INK_VIEWBOX.height + BEVEL_VB) * PROBE_SVG_SCALE,
} as const


// ── Vectores, sin three ─────────────────────────────────────────────────────

export type SceneVec3 = readonly [number, number, number]
type Vec3 = SceneVec3

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: Vec3): Vec3 => {
  const length = Math.hypot(a[0], a[1], a[2])
  return [a[0] / length, a[1] / length, a[2] / length]
}

/** La base que `Object3D.lookAt` construye, idéntica a la del rig. */
function lookAtBasis(position: Vec3, target: Vec3) {
  const z = norm(sub(position, target))
  const x = norm(cross([0, 1, 0], z))
  const y = cross(z, x)
  return { right: x, up: y, forward: [-z[0], -z[1], -z[2]] as Vec3 }
}

const TAN_HALF_FOV = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180)
const DEG = Math.PI / 180

// ── La cámara de una pose, y la proyección de un punto cualquiera ──────────

/**
 * LA CÁMARA DE UNA POSE — posición y base de pantalla, con el encuadre aplicado.
 *
 * Se separó de `frameScenePose` en S13 porque el preloader necesitó proyectar
 * **puntos que no son el logo**: las partículas de la escena, para poder medir
 * de qué tamaño y en qué lugar de la pantalla caen en la pose inicial. Antes
 * esta base era una variable local y solo el origen podía proyectarse.
 *
 * No hay una segunda cámara: `frameScenePose` pasó a consumir ésta, así que el
 * logo y cualquier otro punto se proyectan con la MISMA base. Es lo que hace que
 * la comprobación pueda exigir que el origen caiga exactamente en el centro de
 * la tinta que `frameScenePose` publica.
 */
export type SceneCamera = {
  readonly position: SceneVec3
  readonly right: SceneVec3
  readonly up: SceneVec3
  readonly forward: SceneVec3
  /** Ancho / alto del viewport. Entra en la proyección horizontal. */
  readonly aspect: number
}

export function sceneCameraAt(
  pose: ChoreoPose,
  viewportWidthPx: number,
  viewportHeightPx: number
): SceneCamera | null {
  if (!(viewportWidthPx > 0) || !(viewportHeightPx > 0)) return null

  const aspect = viewportWidthPx / viewportHeightPx
  const azimuth = pose.angleDeg * DEG
  const position: Vec3 = [
    Math.sin(azimuth) * pose.distance,
    pose.height,
    Math.cos(azimuth) * pose.distance,
  ]
  const target: Vec3 = [0, ORBIT_TARGET_Y, 0]

  // 1 · La cámara mira al origen; 2 · el encuadre corre el TARGET, no la cámara
  //     (`cameraFraming.ts`: el offset va en la base de pantalla, y el signo es
  //     negativo porque para ver el logo a la derecha hay que apuntar a su
  //     izquierda).
  let basis = lookAtBasis(position, target)
  if (pose.frameX !== 0 || pose.frameY !== 0) {
    const eyeDistance = Math.hypot(pose.distance, pose.height - ORBIT_TARGET_Y)
    const halfHeight = TAN_HALF_FOV * eyeDistance
    const halfWidth = halfHeight * aspect
    const travelX =
      Math.max(0, halfWidth - SCENE_LOGO_MESH_WORLD.width / 2) * FRAME_TRAVEL_SAFETY
    const travelY =
      Math.max(0, halfHeight - SCENE_LOGO_MESH_WORLD.height / 2) * FRAME_TRAVEL_SAFETY
    const aim: Vec3 = [0, 1, 2].map(
      (i) =>
        target[i] +
        basis.right[i] * -pose.frameX * travelX +
        basis.up[i] * -pose.frameY * travelY
    ) as unknown as Vec3
    basis = lookAtBasis(position, aim)
  }

  return { position, ...basis, aspect }
}

/** Dónde cae un punto de la escena en la pantalla. `null` si está detrás. */
export type ScenePointProjection = {
  readonly xPx: number
  readonly yPx: number
  /** Profundidad óptica, en unidades de mundo. Nunca ≤ 0. */
  readonly depth: number
  /** Cuántos píxeles mide UNA UNIDAD DE MUNDO a esa profundidad. */
  readonly pxPerWorld: number
}

/**
 * Proyecta un punto del mundo a píxeles del viewport.
 *
 * Es la proyección real —`dot` contra la base y división por la profundidad—,
 * no la aproximación lineal del encuadre: el `lookAt` con el target corrido
 * ROTA la cámara, y esa rotación mete una componente que la aproximación no ve.
 *
 * ⚠ **`pxPerWorld` NO es el tamaño de un `<points>`.** Un sprite de
 * `PointsMaterial` con `sizeAttenuation` mide `size × (altoCSS / 2) / depth`
 * píxeles, **sin el `1/tan(fov/2)`** — la corrección que S10 §6.2 midió contra
 * `points.glsl.js`. Para eso está `pointSizePx`.
 */
export function projectScenePoint(
  camera: SceneCamera,
  point: SceneVec3,
  viewportWidthPx: number,
  viewportHeightPx: number
): ScenePointProjection | null {
  const toPoint = sub(point, camera.position)
  const depth = dot(toPoint, camera.forward)
  if (!(depth > 0)) return null

  const ndcX = dot(toPoint, camera.right) / depth / (TAN_HALF_FOV * camera.aspect)
  const ndcY = dot(toPoint, camera.up) / depth / TAN_HALF_FOV

  return {
    xPx: (0.5 + ndcX / 2) * viewportWidthPx,
    yPx: (0.5 - ndcY / 2) * viewportHeightPx,
    depth,
    pxPerWorld: viewportHeightPx / (2 * TAN_HALF_FOV * depth),
  }
}

/**
 * El diámetro en píxeles CSS de un sprite de `PointsMaterial` con
 * `sizeAttenuation`, a una profundidad dada.
 *
 * `gl_PointSize = size × dpr × (altoCSS / 2) / profundidad`
 * (`points.glsl.js` + `WebGLMaterials.refreshUniformsPoints`), y **el FOV no
 * interviene**: un punto de tamaño S a profundidad d ocupa S/(2d) del alto del
 * viewport sea cual sea la lente. El `dpr` queda afuera a propósito — acá se
 * devuelven píxeles CSS, que es la unidad en la que se dibuja.
 */
export function pointSizePx(size: number, depth: number, viewportHeightPx: number): number {
  return (size * (viewportHeightPx / 2)) / depth
}
