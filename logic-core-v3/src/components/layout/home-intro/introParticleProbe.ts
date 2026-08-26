import { readFileSync } from 'node:fs'

import {
  BOKEH_COUNT,
  BOKEH_RADIUS_BIAS,
  BOKEH_R_MAX,
  BOKEH_R_MIN,
  BOKEH_SEED,
  BOKEH_SHELLS,
  BOKEH_SIZE,
  DUST_SHELLS,
  PARTICLES_MAX,
  PARTICLE_R_MAX,
  PARTICLE_R_MIN,
  PARTICLE_SEED,
  PARTICLE_SIZE,
  buildParticleField,
} from '@/app/probe-escena/_components/probeParticles'
import { FLOOR_Y } from '@/app/probe-escena/_components/probeScene'
import { PROBE_DEFAULTS } from '@/app/probe-escena/_components/probeStore'
import {
  pointSizePx,
  projectScenePoint,
  sceneCameraAt,
  type SceneVec3,
} from '@/lib/scene-camera'
import { SCENE_ENTRY_POSE } from '@/lib/scene-framing'

import {
  DUST_RADIUS_BIAS,
  FLOOR_CLEARANCE,
  type IntroMote,
} from './introParticles'
import { sampleMote } from './introParticleTiming'
import { sampleBackgroundColor, sampleVeilOpacity } from './introSampling'
import { contrastRatio, hexToSrgb, type Srgb } from './introShading'
import type { IntroTimeline } from './introTimeline'

/**
 * EL BANCO DE MEDICIÓN DE LAS PARTÍCULAS — no es código de la aplicación.
 *
 * Lo importan los tres `*.invariant.ts` del sprint y **nadie más**: no hay un
 * solo `import` desde un componente, un hook o una ruta, así que no viaja a
 * ningún bundle. Es el mismo reparto que `__tests__/harness.ts` y
 * `__tests__/frameProbe.ts` hacen del lado de la escena — **el instrumento de un
 * lado, las comprobaciones del otro**, para que las tres suites midan con
 * exactamente el mismo método.
 *
 * Dos cosas viven acá:
 *
 *  1. **El campo de la ESCENA, proyectado**, contra el que se compara la especie.
 *  2. **La legibilidad**, que es cómo se decide si una mota se ve: la razón de
 *     contraste de WCAG, con el mismo umbral que `introSampling.invariant.ts`
 *     usa para el cruce de tinta.
 */

/** El umbral de "ya no se distingue del fondo". El del cruce de tinta. */
export const LEGIBLE = 1.1
/** Muestras por segundo del bracket. La misma grilla fina del cruce de tinta. */
export const CROSSING_HZ = 4_000

export const quantile = (values: readonly number[], t: number): number => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(t * (sorted.length - 1))))]
}

export const near = (a: number, b: number, tolerance: number): boolean =>
  Math.abs(a - b) <= tolerance

/** Composición alfa, como la hace un canvas 2D: en sRGB, no en luz lineal. */
export const over = (top: Srgb, alpha: number, bottom: Srgb): Srgb =>
  [0, 1, 2].map((i) => top[i] * alpha + bottom[i] * (1 - alpha)) as unknown as Srgb

/** Lee un archivo del repo normalizando fin de línea, para poder grepearlo. */
export const readSource = (path: string): string =>
  readFileSync(path, 'utf8').split(String.fromCharCode(13)).join('')

// ── El campo de la escena, proyectado por la cámara de la pose inicial ─────

export type ProjectedMote = {
  readonly xPx: number
  readonly yPx: number
  readonly sizePx: number
  readonly kind: 'dust' | 'bokeh'
}

/**
 * El campo de la ESCENA con SUS semillas y su fracción dibujada, proyectado por
 * la misma cámara que usa el del intro. Es la referencia de la especie.
 */
export function sceneParticleField(width: number, height: number): ProjectedMote[] {
  const camera = sceneCameraAt(SCENE_ENTRY_POSE, width, height)
  if (!camera) return []
  const out: ProjectedMote[] = []

  const take = (
    positions: Float32Array,
    from: number,
    to: number,
    size: number,
    kind: 'dust' | 'bokeh'
  ): void => {
    for (let i = from; i < to; i += 1) {
      const point: SceneVec3 = [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]
      const at = projectScenePoint(camera, point, width, height)
      if (!at) continue
      if (at.xPx < 0 || at.xPx > width || at.yPx < 0 || at.yPx > height) continue
      out.push({
        xPx: at.xPx,
        yPx: at.yPx,
        sizePx: pointSizePx(size, at.depth, height),
        kind,
      })
    }
  }

  const dust = buildParticleField(
    PARTICLES_MAX,
    PARTICLE_R_MIN,
    PARTICLE_R_MAX,
    DUST_RADIUS_BIAS,
    PARTICLE_SEED,
    FLOOR_Y + FLOOR_CLEARANCE,
    DUST_SHELLS
  )
  const share = PROBE_DEFAULTS.particleCount / PARTICLES_MAX
  for (let s = 0; s < DUST_SHELLS.length - 1; s += 1) {
    const from = Math.round(DUST_SHELLS[s] * PARTICLES_MAX)
    const to = Math.round(DUST_SHELLS[s + 1] * PARTICLES_MAX)
    take(dust.positions, from, from + Math.round((to - from) * share), PARTICLE_SIZE, 'dust')
  }

  const bokeh = buildParticleField(
    BOKEH_COUNT,
    BOKEH_R_MIN,
    BOKEH_R_MAX,
    BOKEH_RADIUS_BIAS,
    BOKEH_SEED,
    FLOOR_Y + FLOOR_CLEARANCE,
    BOKEH_SHELLS
  )
  take(bokeh.positions, 0, BOKEH_COUNT, BOKEH_SIZE, 'bokeh')
  return out
}

/** Un campo cualquiera, con la semilla que se le pase. Para la divergencia. */
export function seededDustField(
  seed: number,
  width: number,
  height: number,
  share: number
): { xPx: number; yPx: number }[] {
  const camera = sceneCameraAt(SCENE_ENTRY_POSE, width, height)
  if (!camera) return []
  const field = buildParticleField(
    PARTICLES_MAX,
    PARTICLE_R_MIN,
    PARTICLE_R_MAX,
    DUST_RADIUS_BIAS,
    seed,
    FLOOR_Y + FLOOR_CLEARANCE,
    DUST_SHELLS
  )
  const out: { xPx: number; yPx: number }[] = []
  for (let i = 0; i < Math.round(PARTICLES_MAX * share); i += 1) {
    const at = projectScenePoint(
      camera,
      [field.positions[i * 3], field.positions[i * 3 + 1], field.positions[i * 3 + 2]],
      width,
      height
    )
    if (at && at.xPx >= 0 && at.xPx <= width && at.yPx >= 0 && at.yPx <= height) {
      out.push({ xPx: at.xPx, yPx: at.yPx })
    }
  }
  return out
}

/** Distancia de cada mota de `a` a la más cercana de `b`, en píxeles. */
export function nearestDistances(
  a: readonly { xPx: number; yPx: number }[],
  b: readonly { xPx: number; yPx: number }[]
): number[] {
  return a.map((one) => {
    let best = Infinity
    for (const other of b) {
      const distance = Math.hypot(one.xPx - other.xPx, one.yPx - other.yPx)
      if (distance < best) best = distance
    }
    return best
  })
}

// ── La legibilidad ──────────────────────────────────────────────────────────

/** El contraste de una mota del intro contra el fondo del velo, en un instante. */
export function introContrastAt(
  timeline: IntroTimeline,
  mote: IntroMote,
  timeS: number
): number {
  const progress = timeS / timeline.totalS
  const sample = sampleMote(timeline, progress, mote)
  if (sample.alpha <= 0) return 1
  const background = sampleBackgroundColor(timeline, progress)
  return contrastRatio(over(hexToSrgb(mote.color), sample.alpha, background), background)
}

/**
 * El contraste de una mota de la ESCENA contra su fondo, **vista a través del
 * velo que se disuelve**. Las dos capas —la mota y su fondo— se componen contra
 * el mismo velo, así que la diferencia se achica con la opacidad que queda.
 */
export function sceneContrastAt(
  timeline: IntroTimeline,
  mote: Srgb,
  background: Srgb,
  timeS: number
): number {
  const progress = timeS / timeline.totalS
  const alpha = sampleVeilOpacity(timeline, progress)
  const veil = sampleBackgroundColor(timeline, progress)
  return contrastRatio(over(veil, alpha, mote), over(veil, alpha, background))
}

/**
 * El instante exacto de un cruce del umbral, **interpolando entre las dos
 * muestras que lo encierran**. Es la técnica que S8e dejó escrita: contar
 * cuadros hace que la respuesta dependa de la fase de la grilla y no del diseño.
 */
export function crossingS(
  valueAt: (timeS: number) => number,
  fromS: number,
  toS: number,
  last: boolean
): number {
  const steps = Math.ceil((toS - fromS) * CROSSING_HZ)
  const dt = (toS - fromS) / steps
  let found = NaN
  for (let i = 0; i <= steps; i += 1) {
    const timeS = fromS + i * dt
    const previous = valueAt(timeS - dt) - LEGIBLE
    const current = valueAt(timeS) - LEGIBLE
    if (previous < 0 !== current < 0) {
      const root = previous / (previous - current)
      found = timeS - dt + root * dt
      if (!last) break
    }
  }
  return found
}
