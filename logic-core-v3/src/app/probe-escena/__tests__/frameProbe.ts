import { CHOREO_KEYFRAMES } from '../_components/choreography'
import {
  MOIRE_BASE_ALPHA,
  MOIRE_COARSE_CELLS,
  MOIRE_COLOR,
  MOIRE_FAR_BOTTOM,
  MOIRE_FAR_RADIUS,
  MOIRE_FAR_TOP,
  MOIRE_NEAR_BOTTOM,
  MOIRE_NEAR_RADIUS,
  MOIRE_NEAR_TOP,
  MOIRE_OPACITY,
  fineCells,
  lineDuty,
} from '../_components/probeMoire'
import { celosiaTransmittance } from '../_components/celosiaGeometry'
import { FLOOR_RADIUS, INK_COLOR, PAPER_COLOR, PROBE_SVG_SCALE } from '../_components/probeScene'

import { FLOOR_Y, TAN_HALF_V, cameraAt, emptyPose, halfFovDeg, makeTrack, type Vec3 } from './harness'
import { buildLogoMask } from './logoInk'
import { over, shadeSurface, sunDirectionAt, type ViewContext } from './shading'

/**
 * EL MUESTREO DEL CUADRO — una grilla de rayos y qué toca cada uno.
 *
 * Es lo que contesta "qué fracción del cuadro queda en tinta" y "qué valor medio
 * tiene la escena", que son las dos preguntas que S10 tenía que responder con un
 * número y no con una impresión.
 *
 * **No es un render.** Lo que hay es geometría analítica: el piso como disco, el
 * ciclorama como superficie de revolución, el logo como una losa con la máscara
 * de su tinta real, y las dos capas de la envolvente como cilindros. Cada impacto
 * se sombrea con `shading.ts`. Es exacto donde importa —cobertura y valor— y no
 * modela sombras proyectadas ni especular, que empujan hacia abajo: los valores
 * son un techo.
 */

const ASPECT = 16 / 9
const half = halfFovDeg(ASPECT)
const TAN_H = Math.tan((half.h * Math.PI) / 180)

export const track = makeTrack(CHOREO_KEYFRAMES)
export const mask = buildLogoMask(1024)

/** La caja de la tinta en unidades de mundo, y el espesor de la extrusión. */
export const INK_WIDTH = mask.width * PROBE_SVG_SCALE
export const INK_HEIGHT = mask.height * PROBE_SVG_SCALE
const INK_DEPTH = 0.56

/** El perfil del ciclorama: radio de la superficie a una altura dada. */
export function cycloramaRadius(y: number): number {
  const h = y - FLOOR_Y
  if (h <= 0) return FLOOR_RADIUS
  if (h >= 42) return FLOOR_RADIUS + 42
  return FLOOR_RADIUS + 42 * Math.sqrt(Math.max(0, 1 - ((42 - h) / 42) ** 2))
}

/** t contra el papel, o Infinity. */
export function rayFloor(origin: Vec3, dir: Vec3): number {
  if (Math.abs(dir[1]) < 1e-9) return Infinity
  const t = (FLOOR_Y - origin[1]) / dir[1]
  if (t <= 1e-4) return Infinity
  return Math.hypot(origin[0] + dir[0] * t, origin[2] + dir[2] * t) <= FLOOR_RADIUS ? t : Infinity
}

/** t contra un cilindro vertical visto DESDE ADENTRO, o Infinity. */
export function rayCylinderInside(
  origin: Vec3,
  dir: Vec3,
  radius: number,
  yMin: number,
  yMax: number
): number {
  const a = dir[0] * dir[0] + dir[2] * dir[2]
  if (a <= 1e-12) return Infinity
  const b = 2 * (origin[0] * dir[0] + origin[2] * dir[2])
  const c = origin[0] * origin[0] + origin[2] * origin[2] - radius * radius
  const discriminant = b * b - 4 * a * c
  if (discriminant < 0) return Infinity
  const t = (-b + Math.sqrt(discriminant)) / (2 * a)
  if (t <= 1e-4) return Infinity
  const y = origin[1] + dir[1] * t
  return y >= yMin && y <= yMax ? t : Infinity
}

/** t contra el ciclorama, por marcha. Suficiente para el valor. */
function rayCyclorama(origin: Vec3, dir: Vec3): { t: number; n: Vec3 } | null {
  for (let t = 0.5; t < 260; t += 0.5) {
    const x = origin[0] + dir[0] * t
    const y = origin[1] + dir[1] * t
    const z = origin[2] + dir[2] * t
    if (Math.hypot(x, z) >= cycloramaRadius(y)) {
      const s = Math.min(1, Math.max(0, (y - FLOOR_Y) / 42))
      const length = Math.hypot(x, z) || 1
      return { t, n: [(-x / length) * s, Math.sqrt(Math.max(0, 1 - s * s)), (-z / length) * s] }
    }
  }
  return null
}

/** ¿El rayo atraviesa TINTA del logo? Devuelve el t de entrada, o Infinity. */
export function rayLogoInk(origin: Vec3, dir: Vec3): number {
  const half3: Vec3 = [INK_WIDTH / 2, INK_HEIGHT / 2, INK_DEPTH / 2]
  let tMin = 0
  let tMax = Infinity
  for (let axis = 0; axis < 3; axis += 1) {
    const o = origin[axis]
    const d = dir[axis]
    if (Math.abs(d) < 1e-9) {
      if (-o - half3[axis] > 0 || -o + half3[axis] < 0) return Infinity
      continue
    }
    const t1 = (-o - half3[axis]) / d
    const t2 = (-o + half3[axis]) / d
    const lo = Math.min(t1, t2)
    const hi = Math.max(t1, t2)
    if (lo > tMin) tMin = lo
    if (hi < tMax) tMax = hi
    if (tMin > tMax) return Infinity
  }

  // El espesor es el 8% del ancho, así que muestrear el tramo interno alcanza:
  // si alguna de las muestras cae en tinta, el rayo atraviesa la pieza.
  for (let i = 0; i <= 6; i += 1) {
    const t = tMin + ((tMax - tMin) * i) / 6
    const u = 0.5 + (origin[0] + dir[0] * t) / INK_WIDTH
    const v = 0.5 - (origin[1] + dir[1] * t) / INK_HEIGHT
    if (mask.at(u, v)) return tMin
  }
  return Infinity
}

export type FrameSample = {
  /** Fracción del cuadro cubierta por la tinta del logo. */
  readonly ink: number
  /** Valor medio del cuadro, 0..255. */
  readonly mean: number
  /** Fracción del cuadro que ve cada capa de la envolvente. */
  readonly nearLayer: number
  readonly farLayer: number
  /**
   * Fracción del cuadro que es **la losa de papel**, y no el ciclorama ni el
   * fondo. Es el número que dice hasta dónde puede llegar la envolvente: donde
   * hay piso, no hay envolvente detrás que valga.
   */
  readonly floor: number
  /** Fracción del PISO EN CUADRO que queda bajo una barra de la celosía (S11). */
  readonly floorShaded: number
}

/** Alfa medio de una capa de la envolvente: hueco y línea, pesados por cobertura. */
export function layerMeanAlpha(cells: number): number {
  const duty = lineDuty(cells)
  const covered = 1 - (1 - duty) ** 2
  const base = MOIRE_OPACITY * MOIRE_BASE_ALPHA
  return base + (MOIRE_OPACITY - base) * covered
}

export type SceneVariant = {
  /** ¿Se compone la envolvente encima? */
  readonly backdrop: boolean
  readonly mismatch?: number
  /**
   * LA CELOSÍA (S11). Ausente = la escena de S10 exactamente, que es lo que hace
   * que los seis valores medios de aquel reporte se sigan reproduciendo con este
   * mismo instrumento.
   */
  readonly celosia?: {
    /** La barra. 0 apaga el patrón. */
    readonly bar: number
    /** El factor de cielo que le corresponde a esa barra. */
    readonly sky: number
    /** La deriva de la capa gruesa, en celdas. Default 0: el cuadro en reposo. */
    readonly drift?: number
    /**
     * EL TAMAÑO ANGULAR DEL SOL (S12), ya como `2·tan(α)`. Default 0: el sol sin
     * diámetro de S11, o sea borde filoso. Ver `celosiaPenumbra.ts`.
     */
    readonly spread?: number
  }
}

/**
 * Muestrea el cuadro en una pose: cobertura de tinta y valor medio.
 *
 * `columns`/`rows` fijan la grilla. 320×180 da 57.600 rayos, que es donde el
 * número de cobertura deja de moverse en la tercera cifra.
 */
export function sampleFrame(
  progress: number,
  view: ViewContext,
  variant: SceneVariant,
  columns = 320,
  rows = 180
): FrameSample {
  const pose = emptyPose()
  const cam = cameraAt(track, progress, ASPECT, pose)
  const fine = fineCells(variant.mismatch ?? 0)
  const alphaFar = layerMeanAlpha(MOIRE_COARSE_CELLS)
  const alphaNear = layerMeanAlpha(fine)
  const celosia = variant.celosia
  const sun = celosia ? sunDirectionAt(progress) : null
  const sky = celosia ? celosia.sky : 1

  let ink = 0
  let sum = 0
  let near = 0
  let far = 0
  let paper = 0
  let shaded = 0
  const total = columns * rows

  for (let iy = 0; iy < rows; iy += 1) {
    const ny = (((iy + 0.5) / rows) * 2 - 1) * TAN_HALF_V
    for (let ix = 0; ix < columns; ix += 1) {
      const nx = (((ix + 0.5) / columns) * 2 - 1) * TAN_H
      const raw: Vec3 = [
        cam.forward[0] + cam.right[0] * nx + cam.up[0] * ny,
        cam.forward[1] + cam.right[1] * nx + cam.up[1] * ny,
        cam.forward[2] + cam.right[2] * nx + cam.up[2] * ny,
      ]
      const length = Math.hypot(raw[0], raw[1], raw[2])
      const dir: Vec3 = [raw[0] / length, raw[1] / length, raw[2] / length]

      // Lo opaco: piso, ciclorama y logo.
      let depth = rayFloor(cam.position, dir)
      let color = PAPER_COLOR
      let normal: Vec3 = [0, 1, 0]
      const hitsFloor = isFinite(depth)
      if (!isFinite(depth)) {
        const cyclorama = rayCyclorama(cam.position, dir)
        if (cyclorama) {
          depth = cyclorama.t
          normal = cyclorama.n
        }
      }
      const tInk = rayLogoInk(cam.position, dir)
      const onLogo = tInk < depth
      if (onLogo) {
        depth = tInk
        color = INK_COLOR
        normal = [0, 0, dir[2] < 0 ? 1 : -1]
        ink += 1
      } else if (hitsFloor) {
        paper += 1
      }

      // LA CELOSÍA. Se evalúa en el punto de impacto, que es donde el shader la
      // evalúa: la misma cuenta, el mismo gemelo (`celosiaGeometry.ts`).
      let gobo = 1
      if (celosia && sun && isFinite(depth)) {
        gobo = celosiaTransmittance(
          [
            cam.position[0] + dir[0] * depth,
            cam.position[1] + dir[1] * depth,
            cam.position[2] + dir[2] * depth,
          ],
          sun,
          celosia.bar,
          variant.mismatch ?? 0,
          celosia.drift ?? 0,
          celosia.spread ?? 0
        )
        if (!onLogo && hitsFloor && gobo < 0.5) shaded += 1
      }

      let value = shadeSurface(color, normal, view, isFinite(depth) ? depth : 200, gobo, sky)

      if (variant.backdrop) {
        for (const [radius, bottom, top, alpha] of [
          [MOIRE_FAR_RADIUS, MOIRE_FAR_BOTTOM, MOIRE_FAR_TOP, alphaFar],
          [MOIRE_NEAR_RADIUS, MOIRE_NEAR_BOTTOM, MOIRE_NEAR_TOP, alphaNear],
        ] as const) {
          const t = rayCylinderInside(cam.position, dir, radius, bottom, top)
          if (!isFinite(t) || t > depth) continue
          if (radius === MOIRE_NEAR_RADIUS) near += 1
          else far += 1
          const n: Vec3 = [
            -(cam.position[0] + dir[0] * t) / radius,
            0,
            -(cam.position[2] + dir[2] * t) / radius,
          ]
          // La envolvente no se proyecta sombra a sí misma: es la celosía.
          value = over(shadeSurface(MOIRE_COLOR, n, view, t, 1, sky), alpha, value)
        }
      }

      sum += value
    }
  }

  return {
    ink: ink / total,
    mean: sum / total,
    nearLayer: near / total,
    farLayer: far / total,
    floor: paper / total,
    floorShaded: paper > 0 ? shaded / paper : 0,
  }
}
