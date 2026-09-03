import { readFileSync } from 'node:fs'

const DEG = Math.PI / 180

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
} from '@/app/v3/_lib/escena/probeParticles'
import { FLOOR_Y } from '@/app/v3/_lib/escena/probeScene'
import {
  DUST_BOB_AMPLITUDE,
  DUST_BOB_PERIOD_S,
  DUST_SPIN_DEG_S,
} from '@/app/v3/_lib/escena/choreographyPhysics'
import { PROBE_DEFAULTS } from '@/app/v3/_lib/escena/probeStore'
import {
  pointSizePx,
  projectScenePoint,
  sceneCameraAt,
  type SceneVec3,
} from '@/lib/scene-camera'
import { SCENE_ENTRY_POSE } from '@/lib/scene-framing'

import { DUST_RADIUS_BIAS, FLOOR_CLEARANCE, SCENE_DUST_SHARE } from './introParticles'
import type { Srgb } from './introShading'

/**
 * EL BANCO DE MEDICIÓN DE LAS PARTÍCULAS — no es código de la aplicación.
 *
 * Lo importan los `*.invariant.ts` de las partículas y **nadie más**: no hay un
 * solo `import` desde un componente, un hook o una ruta, así que no viaja a
 * ningún bundle. Es el mismo reparto que `__tests__/harness.ts` y
 * `__tests__/frameProbe.ts` hacen del lado de la escena — **el instrumento de un
 * lado, las comprobaciones del otro**, para que todas las suites midan con
 * exactamente el mismo método.
 *
 * Acá vive **el campo de la ESCENA, proyectado** —contra el que se compara la
 * especie— más los utilitarios que comparten todas. **La legibilidad** salió a
 * `introLegibilityProbe.ts` en S14 (el archivo cruzaba las 300 líneas) y **la
 * lectura** a `introReadingProbe.ts`.
 */

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

/**
 * Cuánto se corre en pantalla una mota de la escena por segundo del reloj de SU
 * canvas, con la rotación de concha y el cabeceo que `driftShells` aplica.
 *
 * Se reconstruye acá con las constantes reales de `choreographyPhysics.ts` y la
 * misma cámara: es la deriva que el preloader NO puede compensar, porque el
 * canvas de la escena arranca su reloj cuando termina de bajar el chunk de
 * `three` y nada lo ata al reloj del intro.
 */
export function derivaDelCampoDeLaEscena(segundos: number, W: number, H: number): number[] {
  const camera = sceneCameraAt(SCENE_ENTRY_POSE, W, H)
  if (!camera) return []
  const campo = buildParticleField(
    PARTICLES_MAX,
    PARTICLE_R_MIN,
    PARTICLE_R_MAX,
    1.4,
    PARTICLE_SEED,
    FLOOR_Y + FLOOR_CLEARANCE,
    DUST_SHELLS
  )
  const salida: number[] = []
  for (let shell = 0; shell < DUST_SHELLS.length - 1; shell += 1) {
    const from = Math.round(DUST_SHELLS[shell] * PARTICLES_MAX)
    const to = Math.round(DUST_SHELLS[shell + 1] * PARTICLES_MAX)
    const hasta = from + Math.round((to - from) * SCENE_DUST_SHARE)
    const giro = segundos * DUST_SPIN_DEG_S[Math.min(shell, DUST_SPIN_DEG_S.length - 1)] * DEG
    const amp = DUST_BOB_AMPLITUDE[Math.min(shell, DUST_BOB_AMPLITUDE.length - 1)]
    const periodo = DUST_BOB_PERIOD_S[Math.min(shell, DUST_BOB_PERIOD_S.length - 1)]
    for (let i = from; i < hasta; i += 1) {
      const x = campo.positions[i * 3]
      const y = campo.positions[i * 3 + 1]
      const z = campo.positions[i * 3 + 2]
      const quieta = projectScenePoint(camera, [x, y, z], W, H)
      if (!quieta || quieta.xPx < 0 || quieta.xPx > W || quieta.yPx < 0 || quieta.yPx > H) continue
      const movida = projectScenePoint(
        camera,
        [
          x * Math.cos(giro) + z * Math.sin(giro),
          y + Math.sin((segundos / periodo) * 2 * Math.PI) * amp,
          -x * Math.sin(giro) + z * Math.cos(giro),
        ],
        W,
        H
      )
      if (!movida) continue
      salida.push(Math.hypot(movida.xPx - quieta.xPx, movida.yPx - quieta.yPx))
    }
  }
  return salida
}
