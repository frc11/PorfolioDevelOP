import { CHOREO_KEYFRAMES } from '@/app/probe-escena/_components/choreography'
import type { ChoreoPose } from '@/app/probe-escena/_components/choreographyTypes'
import {
  CAMERA_FOV,
  FRAME_TRAVEL_SAFETY,
  ORBIT_TARGET_Y,
  PROBE_EXTRUDE,
  PROBE_SVG_SCALE,
} from '@/app/probe-escena/_components/probeScene'
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'

/**
 * DÓNDE CAE EL LOGO DE LA ESCENA EN LA PANTALLA — la proyección de una pose del
 * recorrido a píxeles.
 *
 * ── Por qué vive en `lib` y no en el preloader ─────────────────────────────
 *
 * Esto es la matemática de encuadre **de la escena**; el preloader de S8b es su
 * primer consumidor, no su dueño. Cuando la escena se monte en el home va a
 * necesitar exactamente estos números, y hay tres decisiones abiertas
 * (`DIRECCION-ESCENA.md` §7.2 el mapeo del scroll, §7.5 mobile, §7.6 el
 * encuadre por relación de aspecto) que cuando se tomen tienen que aterrizar
 * **acá** para que las dos piezas las hereden juntas. Es lo que evita que el
 * preloader y la escena empiecen a disentir sobre dónde está el logo.
 *
 * ── ⚠ Deuda consciente: esto importa del instrumento de diseño ─────────────
 *
 * `choreography.ts` y `probeScene.ts` viven en `src/app/probe-escena/`, que es
 * la ruta interna de diseño. Leerlos está permitido y es lo correcto —el
 * destino se lee del recorrido, no se hardcodea—, pero **el home pasa a
 * depender de dos módulos del instrumento.** Cuando la escena se monte en el
 * home hay que decidir si esos dos módulos se mudan a `lib`. Está escrito acá a
 * propósito, para que ese sprint lo resuelva en vez de descubrirlo.
 *
 * ── Qué reimplementa y por qué no lo importa ───────────────────────────────
 *
 * La cámara del rig (`OrbitRig.tsx`) y el encuadre (`cameraFraming.ts`) están
 * atados a `three` y a un `useFrame`. Acá se necesita el mismo resultado **sin
 * DOM y sin three**, para poder correrlo en el server, en node y en una
 * comprobación estática. La aritmética es idéntica y está anotada contra su
 * fuente línea por línea.
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

/**
 * ⚠ **RESPUESTA PARCIAL A §7.6 — el encuadre por relación de aspecto.**
 *
 * El `fov` de la cámara es VERTICAL, así que en una ventana angosta el logo
 * **desborda por los lados**: en 390×844 la pose de entrada proyecta una tinta
 * de 525 px de ancho sobre una pantalla de 390. Es el bug que
 * `PROBE-ESCENA.md` §235 ya tenía documentado como "un bug esperando".
 *
 * Este clamp limita el ancho aparente de la tinta a esta fracción del ancho de
 * la ventana. El valor es **el mismo `LOGO_WIDTH_MARGIN` que la calibración A
 * de `logo-footprint.ts` ya usa** — no se inventa un número nuevo para el mismo
 * problema.
 *
 * **La escena va a necesitar el mismo clamp y tiene que leerlo de acá, no
 * reimplementarlo.** Del lado de la escena se aplica subiendo la distancia de
 * cámara; del lado del preloader, achicando el destino. El resultado en
 * pantalla es el mismo y el número tiene que ser uno solo.
 */
export const DEST_WIDTH_MARGIN = 0.86

// ── Vectores, sin three ─────────────────────────────────────────────────────

type Vec3 = readonly [number, number, number]

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

// ── El resultado ────────────────────────────────────────────────────────────

export type SceneFrame = {
  /** Centro de la TINTA en píxeles del viewport (no el del cuadrado de 1024). */
  readonly centerXPx: number
  readonly centerYPx: number
  /** Caja de la tinta proyectada, en píxeles, SIN escorzo por la rotación. */
  readonly inkWidthPx: number
  readonly inkHeightPx: number
  /** Lo que el clamp de ancho recortó. 1 = no hizo falta. */
  readonly widthClamp: number
  /**
   * Desde dónde mira la escena al logo, en grados. Es lo que el preloader usa
   * para rotar su mesh y aterrizar presentando la misma cara.
   */
  readonly yawDeg: number
  readonly pitchDeg: number
}

/**
 * Proyecta una pose del recorrido a píxeles de pantalla.
 *
 * Devuelve `null` con un viewport degenerado. No es paranoia: con la pestaña
 * oculta el navegador reporta `innerWidth`/`innerHeight` en 0 (lección ya
 * documentada en `CLAUDE.md`), y un destino calculado ahí es basura. Quien
 * llame decide qué hacer sin destino — en el preloader, no hay vuelo.
 */
export function frameScenePose(
  pose: ChoreoPose,
  viewportWidthPx: number,
  viewportHeightPx: number
): SceneFrame | null {
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
  const eyeDistance = Math.hypot(pose.distance, pose.height - ORBIT_TARGET_Y)
  const halfHeight = TAN_HALF_FOV * eyeDistance
  const halfWidth = halfHeight * aspect
  const travelX =
    Math.max(0, halfWidth - SCENE_LOGO_MESH_WORLD.width / 2) * FRAME_TRAVEL_SAFETY
  const travelY =
    Math.max(0, halfHeight - SCENE_LOGO_MESH_WORLD.height / 2) * FRAME_TRAVEL_SAFETY

  if (pose.frameX !== 0 || pose.frameY !== 0) {
    const aim: Vec3 = [0, 1, 2].map(
      (i) =>
        target[i] +
        basis.right[i] * -pose.frameX * travelX +
        basis.up[i] * -pose.frameY * travelY
    ) as unknown as Vec3
    basis = lookAtBasis(position, aim)
  }

  // 3 · Proyección real del origen (= el centro de la tinta) sobre la pantalla.
  //     NO la aproximación lineal "frameX × travel / halfWidth": el `lookAt` con
  //     el target corrido ROTA la cámara, y esa rotación mete una componente
  //     vertical que la aproximación no ve. Medido en la pose de entrada: 5 px
  //     de error en X, 14 px en el alto y 61 px en Y.
  const toTarget = sub(target, position)
  const depth = dot(toTarget, basis.forward)
  if (!(depth > 0)) return null

  const ndcX = dot(toTarget, basis.right) / depth / (TAN_HALF_FOV * aspect)
  const ndcY = dot(toTarget, basis.up) / depth / TAN_HALF_FOV

  // 4 · Tamaño: cuántos píxeles mide una unidad de mundo a esa profundidad.
  const pxPerWorld = viewportHeightPx / (2 * TAN_HALF_FOV * depth)
  const pxPerViewBoxUnit = pxPerWorld * PROBE_SVG_SCALE
  const rawInkWidthPx = LOGO_INK_VIEWBOX.width * pxPerViewBoxUnit
  const rawInkHeightPx = LOGO_INK_VIEWBOX.height * pxPerViewBoxUnit

  // 5 · El clamp de ancho (§7.6). Achica el destino, no lo mueve: el centro es
  //     el mismo, así que el logo sigue cayendo donde la composición lo pide.
  const maxInkWidthPx = DEST_WIDTH_MARGIN * viewportWidthPx
  const widthClamp = rawInkWidthPx > maxInkWidthPx ? maxInkWidthPx / rawInkWidthPx : 1

  return {
    centerXPx: (0.5 + ndcX / 2) * viewportWidthPx,
    centerYPx: (0.5 - ndcY / 2) * viewportHeightPx,
    inkWidthPx: rawInkWidthPx * widthClamp,
    inkHeightPx: rawInkHeightPx * widthClamp,
    widthClamp,
    yawDeg: pose.angleDeg,
    pitchDeg: (Math.atan2(pose.height - ORBIT_TARGET_Y, pose.distance) * 180) / Math.PI,
  }
}

/**
 * La pose con la que la escena ARRANCA: el primer keyframe del recorrido.
 *
 * Se lee del recorrido, no se hardcodea — si el humano recalibra ese keyframe,
 * el preloader lo sigue sin que nadie edite un segundo lugar.
 *
 * Hoy el recorrido activo es el definitivo de S9 (`DEFAULT_VARIANT_ID` en
 * `choreographyVariants.ts`, cuyo `VARIANT_DEFINITIVA.keyframes` ES este
 * array). Se importa `choreography.ts` y no el registro de variantes porque el
 * registro arrastra los otros cuatro recorridos con todos sus comentarios
 * —decenas de KB de strings— y esto viaja en el bundle de la primera visita. La
 * comprobación estática verifica que el atajo siga siendo cierto.
 */
export const SCENE_ENTRY_POSE: ChoreoPose = CHOREO_KEYFRAMES[0].pose

export function frameSceneEntry(
  viewportWidthPx: number,
  viewportHeightPx: number
): SceneFrame | null {
  return frameScenePose(SCENE_ENTRY_POSE, viewportWidthPx, viewportHeightPx)
}

/**
 * Desde dónde mira la escena al logo en su pose de entrada. No depende del
 * viewport —solo del keyframe—, así que es constante y el preloader la puede
 * usar para rotar su mesh sin recalcular nada por frame.
 *
 * Con la pose definitiva de S9: **azimut 0°, elevación 18,6°** (era 31,0° con
 * la coreografía calibrada, que estaba más alta y más cerca). El preloader
 * aterriza el logo rotado exactamente así, o sea presentando la misma cara que
 * la escena va a presentar. La rotación del objeto es la INVERSA del movimiento de la
 * cámara: la cámara subiendo `p` equivale al objeto inclinando su parte de
 * arriba `p` hacia el observador, y la cámara girando `a` equivale al objeto
 * girando `−a`.
 */
export const SCENE_ENTRY_VIEW = {
  yawDeg: SCENE_ENTRY_POSE.angleDeg,
  pitchDeg:
    (Math.atan2(SCENE_ENTRY_POSE.height - ORBIT_TARGET_Y, SCENE_ENTRY_POSE.distance) * 180) /
    Math.PI,
} as const
