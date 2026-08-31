/**
 * EL CUADRO, PÍXEL POR PÍXEL — el histograma que `sampleFrame` no devuelve.
 *
 * ⚠ **NO es un instrumento nuevo: es el MISMO instrumento con otra salida.**
 * `__tests__/frameProbe.ts` muestrea el cuadro con geometría analítica y el
 * shading real de three, y devuelve **agregados** —cobertura de tinta, valor
 * medio, fracción de cada capa—. Para la pregunta de S8 —*¿cuánto contraste
 * tiene el texto `#111111` de un panel transparente contra la escena que le
 * queda detrás?*— un promedio no sirve: el contraste lo decide el píxel PEOR,
 * no el típico.
 *
 * ── Por qué se escribe acá y no se llama a `sampleFrame` ───────────────────
 *
 * Porque `sampleFrame` acumula en cuatro contadores y descarta el valor de cada
 * rayo; no tiene parámetro de región ni devuelve la distribución. Y
 * `frameProbe.ts` vive en `probe-escena/__tests__/`, que este sprint sólo puede
 * tocar en sus imports.
 *
 * ── LO QUE HACE HONESTA A ESTA COPIA: el control de equivalencia ───────────
 *
 * La media de este muestreador tiene que dar **el mismo número** que
 * `sampleFrame(...).mean` con la misma grilla, pose por pose. Si diverge, no es
 * "otro método": es un error. `s8-tinta.invariant.ts` lo afirma en su §1 sobre
 * las seis poses antes de publicar una sola cifra de contraste, y ése es el
 * único motivo por el que las cifras de acá se pueden comparar contra los
 * valores medios de S10/S11.
 *
 * Lo único que este archivo re-deriva es la marcha contra el ciclorama
 * (`rayCyclorama` es privada en `frameProbe.ts`) y la construcción del rayo.
 * Todo lo demás —piso, logo, cilindros, celosía, shading, composición— entra
 * importado de los módulos que ya existen.
 *
 * ── La ventana de la medición, declarada ───────────────────────────────────
 *
 * 1. **La cámara es la de `harness.ts`, que NO es la del rig** (§7.15 de
 *    `DIRECCION-ESCENA.md`): usa una caja de logo de 7,168 × 7,168 en vez de la
 *    medida en runtime, y el peor caso de desvío es 1,28% del ancho del cuadro
 *    en la pose de Demos. Toda cifra de cuadro de S9 en adelante lo arrastra;
 *    este archivo también. No se arregla acá — arreglarlo obliga a re-correr
 *    once suites.
 * 2. **No modela las partículas** — `sampleFrame` tampoco. En S10/S11 se
 *    descuentan aparte (`PARTICLE_DELTA`) y bajan el valor medio entre 0 y 8
 *    puntos, o sea que **empujan el contraste hacia abajo**: las cifras de acá
 *    son un techo, no un piso.
 * 3. **No modela la sombra proyectada del logo sobre el piso** ni el especular.
 *    Los dos empujan en la misma dirección: hacia abajo.
 * 4. **Es la escena, no la página.** Dónde cae el texto de cada panel es del
 *    frente de las secciones; acá se mide el cuadro entero y se publica la
 *    distribución para que la decisión de composición se tome con la curva y no
 *    con un promedio.
 */

import { celosiaTransmittance } from '../celosiaGeometry'
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
} from '../probeMoire'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import {
  cycloramaRadius,
  rayCylinderInside,
  rayFloor,
  rayLogoInk,
  track,
  type SceneVariant,
} from '@/app/probe-escena/__tests__/frameProbe'
import {
  FLOOR_Y,
  TAN_HALF_V,
  cameraAt,
  emptyPose,
  halfFovDeg,
  type Vec3,
} from '@/app/probe-escena/__tests__/harness'
import {
  over,
  shadeSurface,
  sunDirectionAt,
  type ViewContext,
} from '@/app/probe-escena/__tests__/shading'

const ASPECT = 16 / 9
const half = halfFovDeg(ASPECT)
const TAN_H = Math.tan((half.h * Math.PI) / 180)

/** Copia literal de `layerMeanAlpha` de `frameProbe.ts` — la re-exporta él, se importa de allá. */
function alfaMediaDeCapa(cells: number): number {
  const duty = lineDuty(cells)
  const covered = 1 - (1 - duty) ** 2
  const base = MOIRE_OPACITY * MOIRE_BASE_ALPHA
  return base + (MOIRE_OPACITY - base) * covered
}

/**
 * La marcha contra el ciclorama. Es la única pieza que `frameProbe.ts` no
 * exporta, así que se re-deriva con SU función de radio (`cycloramaRadius`) y
 * con su mismo paso (0,5 hasta 260). El control de equivalencia de la media es
 * lo que prueba que la copia es fiel.
 */
function rayoCiclorama(origin: Vec3, dir: Vec3): { t: number; n: Vec3 } | null {
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

export type Histograma = {
  /** Media del cuadro, 0..255. Tiene que igualar a `sampleFrame(...).mean`. */
  readonly media: number
  /** Cuántos rayos se muestrearon. */
  readonly total: number
  /** Cuántos cayeron sobre la tinta del logo 3D. */
  readonly enLogo: number
  /**
   * Valores 0..255 de los píxeles que **no** son el logo, ordenados de menor a
   * mayor. Es la distribución sobre la que se decide el contraste del texto.
   */
  readonly sinLogo: Float64Array
}

/** Percentil (0..1) sobre un array YA ordenado. */
export function percentil(ordenado: Float64Array, p: number): number {
  if (ordenado.length === 0) return Number.NaN
  const i = Math.min(ordenado.length - 1, Math.max(0, Math.round(p * (ordenado.length - 1))))
  return ordenado[i]
}

/**
 * Muestrea el cuadro y devuelve la distribución completa.
 *
 * La grilla por defecto es la de `sampleFrame` (320×180 = 57.600 rayos). Los
 * invariantes usan 200×113 cuando comparan contra S10/S11, que es la grilla con
 * la que esas cifras se publicaron.
 */
export function muestrearCuadro(
  progress: number,
  view: ViewContext,
  variant: SceneVariant,
  columns = 320,
  rows = 180,
): Histograma {
  const pose = emptyPose()
  const cam = cameraAt(track, progress, ASPECT, pose)
  const fine = fineCells(variant.mismatch ?? 0)
  const alphaFar = alfaMediaDeCapa(MOIRE_COARSE_CELLS)
  const alphaNear = alfaMediaDeCapa(fine)
  const celosia = variant.celosia
  const sun = celosia ? sunDirectionAt(progress) : null
  const sky = celosia ? celosia.sky : 1

  const total = columns * rows
  const sinLogo = new Float64Array(total)
  let cuantosSinLogo = 0
  let enLogo = 0
  let suma = 0

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

      let depth = rayFloor(cam.position, dir)
      let color = PAPER_COLOR
      let normal: Vec3 = [0, 1, 0]
      if (!isFinite(depth)) {
        const ciclorama = rayoCiclorama(cam.position, dir)
        if (ciclorama) {
          depth = ciclorama.t
          normal = ciclorama.n
        }
      }
      const tInk = rayLogoInk(cam.position, dir)
      const onLogo = tInk < depth
      if (onLogo) {
        depth = tInk
        color = INK_COLOR
        normal = [0, 0, dir[2] < 0 ? 1 : -1]
        enLogo += 1
      }

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
          celosia.spread ?? 0,
        )
      }

      let value = shadeSurface(color, normal, view, isFinite(depth) ? depth : 200, gobo, sky)

      if (variant.backdrop) {
        for (const [radius, bottom, top, alpha] of [
          [MOIRE_FAR_RADIUS, MOIRE_FAR_BOTTOM, MOIRE_FAR_TOP, alphaFar],
          [MOIRE_NEAR_RADIUS, MOIRE_NEAR_BOTTOM, MOIRE_NEAR_TOP, alphaNear],
        ] as const) {
          const t = rayCylinderInside(cam.position, dir, radius, bottom, top)
          if (!isFinite(t) || t > depth) continue
          const n: Vec3 = [
            -(cam.position[0] + dir[0] * t) / radius,
            0,
            -(cam.position[2] + dir[2] * t) / radius,
          ]
          value = over(shadeSurface(MOIRE_COLOR, n, view, t, 1, sky), alpha, value)
        }
      }

      suma += value
      if (!onLogo) {
        sinLogo[cuantosSinLogo] = value
        cuantosSinLogo += 1
      }
    }
  }

  const recortado = sinLogo.slice(0, cuantosSinLogo)
  recortado.sort()

  return { media: suma / total, total, enLogo, sinLogo: recortado }
}

/** La vista que le corresponde a un progreso: azimut y altura salen del track. */
export function vistaEn(progress: number): ViewContext {
  const pose = emptyPose()
  cameraAt(track, progress, ASPECT, pose)
  return { progress, cameraAzimuthDeg: pose.angleDeg, cameraHeight: pose.height }
}

/** Un valor 0..255 escrito como gris `#RRGGBB`, para pasárselo a `razonDeContraste`. */
export function grisHex(valor: number): string {
  const v = Math.min(255, Math.max(0, Math.round(valor)))
  const h = v.toString(16).padStart(2, '0')
  return `#${h}${h}${h}`
}
