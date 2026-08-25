import { sampleLightArc } from '../_components/choreographySampler'
import type { MutableLightLevels } from '../_components/choreographyTypes'
import { FOG_COLOR, FOG_FAR, FOG_NEAR } from '../_components/probeAtmosphere'
import {
  FILL_AZIMUTH_DEG,
  FILL_ELEVATION_DEG,
  FILL_INTENSITY,
  FOG_DIM_GAMMA,
  HEMI_DIM_GAMMA,
  HEMI_INTENSITY,
  KEY_INTENSITY,
  RIM_AZIMUTH_OFFSET_DEG,
  RIM_DIM_SHARE,
  RIM_DISTANCE,
  RIM_HEIGHT_BASE,
  RIM_HEIGHT_TRACK,
  RIM_INTENSITY,
} from '../_components/probeLighting'
import { BOUNCE_COLOR, PAPER_COLOR } from '../_components/probeScene'

import type { Vec3 } from './harness'

/**
 * EL SHADING DE THREE, REIMPLEMENTADO — para poder decir con un número si la
 * escena queda lavada y contra qué se recorta el sol.
 *
 * Es el método con el que S7 publicó "el sol 254, la pared del ciclorama 213, el
 * papel 248": irradiancia de las cuatro luces → BRDF de Lambert → tone mapping →
 * sRGB → niebla. Reimplementarlo en vez de renderizar es lo que permite medirlo
 * sin navegador.
 *
 * ── Las cuatro piezas, contra su fuente ────────────────────────────────────
 *
 * - **Directas.** `RE_Direct_Lambert` hace `irradiance = dotNL × lightColor` y
 *   `directDiffuse += irradiance × BRDF_Lambert(diffuse)`, con
 *   `BRDF_Lambert = RECIPROCAL_PI × diffuse`. De ahí el `/π`.
 * - **Hemisférico.** Mezcla suelo y cielo con `0,5 × N.y + 0,5` y entra por el
 *   mismo BRDF.
 * - **Tone mapping.** `NeutralToneMapping` copiado de
 *   `tonemapping_pars_fragment.glsl.js` (Khronos PBR Neutral).
 * - **Niebla.** `smoothstep(near, far, depth)`, y el `#include <fog_fragment>` va
 *   DESPUÉS de tone mapping y de la conversión de espacio, así que la mezcla
 *   ocurre sobre el valor de salida ya convertido. Es la corrección de S7.
 *
 * ── Lo que NO modela, dicho en voz alta ────────────────────────────────────
 *
 * El lóbulo especular (los materiales que importan acá son mates o Lambert), el
 * matiz de la temperatura de color (se mide VALOR, no color) y la sombra
 * proyectada. Los tres empujan en la misma dirección —hacia abajo— así que los
 * valores medidos son un TECHO: la escena real es igual o más oscura.
 */

const RAD = Math.PI / 180
const arc: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }

export function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
}

export function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055
}

export function hexToLinear(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16)
  return [
    srgbToLinear(((value >> 16) & 255) / 255),
    srgbToLinear(((value >> 8) & 255) / 255),
    srgbToLinear((value & 255) / 255),
  ]
}

/** Khronos PBR Neutral, copiado de `tonemapping_pars_fragment.glsl.js`. */
export function neutralToneMap(color: readonly [number, number, number]): [number, number, number] {
  const startCompression = 0.8 - 0.04
  const desaturation = 0.15
  let [r, g, b] = color
  const smallest = Math.min(r, Math.min(g, b))
  const offset = smallest < 0.08 ? smallest - 6.25 * smallest * smallest : 0.04
  r -= offset
  g -= offset
  b -= offset
  const peak = Math.max(r, Math.max(g, b))
  if (peak < startCompression) return [r, g, b]
  const d = 1 - startCompression
  const newPeak = 1 - (d * d) / (peak + d - startCompression)
  const scale = newPeak / peak
  r *= scale
  g *= scale
  b *= scale
  const mix = 1 - 1 / (desaturation * (peak - newPeak) + 1)
  return [r + (newPeak - r) * mix, g + (newPeak - g) * mix, b + (newPeak - b) * mix]
}

function direction(azimuthDeg: number, elevationDeg: number): Vec3 {
  const azimuth = azimuthDeg * RAD
  const elevation = elevationDeg * RAD
  return [
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    Math.cos(azimuth) * Math.cos(elevation),
  ]
}

export type ViewContext = {
  readonly progress: number
  readonly cameraAzimuthDeg: number
  readonly cameraHeight: number
}

/**
 * Valor sRGB 0..255 de una superficie mate de albedo `hex` con normal `n`.
 *
 * ── Los dos parámetros que agregó S11 ──────────────────────────────────────
 *
 * `keyGobo` es la transmitancia de la celosía hacia el sol en ESTE punto, o sea
 * el patrón de la rendija; `sky` es cuánto del hemisférico llega con la celosía
 * rodeando la sala. **Los dos valen 1 por default y con eso esta función es
 * exactamente la de S10**, así que los seis valores medios que aquel reporte
 * publicó se siguen reproduciendo con el mismo instrumento — que es el control
 * con el que se mide lo que S11 cambió.
 *
 * El reparto no es arbitrario: la key es el sol y está afuera de la celosía, el
 * hemisférico es "el cielo del estudio" y también, y el relleno ("el rebote de la
 * sala") y el contraluz ("solidario a la cámara") están adentro y no se tocan.
 * Ver `probeCelosia.ts`.
 */
export function shadeSurface(
  hex: string,
  n: Vec3,
  view: ViewContext,
  depth: number,
  keyGobo = 1,
  sky = 1
): number {
  sampleLightArc(view.progress, arc)
  const level = arc.level
  const albedo = hexToLinear(hex)

  const sun = direction(arc.azimuthDeg, arc.elevationDeg)
  const fill = direction(FILL_AZIMUTH_DEG, FILL_ELEVATION_DEG)

  const rimAzimuth = (view.cameraAzimuthDeg + RIM_AZIMUTH_OFFSET_DEG) * RAD
  const rimX = Math.sin(rimAzimuth) * RIM_DISTANCE
  const rimZ = Math.cos(rimAzimuth) * RIM_DISTANCE
  const rimY = RIM_HEIGHT_BASE + view.cameraHeight * RIM_HEIGHT_TRACK
  const rimLength = Math.hypot(Math.hypot(rimX, rimZ), rimY)
  const rim: Vec3 = [rimX / rimLength, rimY / rimLength, rimZ / rimLength]

  const dotSun = Math.max(0, n[0] * sun[0] + n[1] * sun[1] + n[2] * sun[2])
  const dotFill = Math.max(0, n[0] * fill[0] + n[1] * fill[1] + n[2] * fill[2])
  const dotRim = Math.max(0, n[0] * rim[0] + n[1] * rim[1] + n[2] * rim[2])

  const direct =
    (KEY_INTENSITY * level * dotSun * keyGobo +
      FILL_INTENSITY * level * dotFill +
      RIM_INTENSITY * (1 - (1 - level) * RIM_DIM_SHARE) * dotRim) /
    Math.PI

  const skyColor = hexToLinear(PAPER_COLOR)
  const ground = hexToLinear(BOUNCE_COLOR)
  const hemisphereMix = 0.5 * n[1] + 0.5
  // El factor de cielo va sobre la INTENSIDAD, igual que en `lightRig.ts`: sobre
  // el color de cielo invertiría el gradiente que dibuja la cove.
  const hemisphere = HEMI_INTENSITY * sky * Math.pow(level, HEMI_DIM_GAMMA)

  const linear: [number, number, number] = [0, 0, 0]
  for (let c = 0; c < 3; c += 1) {
    const indirect =
      ((ground[c] + (skyColor[c] - ground[c]) * hemisphereMix) * hemisphere) / Math.PI
    linear[c] = albedo[c] * (direct + indirect)
  }

  const mapped = neutralToneMap(linear)
  const value = linearToSrgb(Math.max(0, Math.min(1, mapped[1])))

  const t = Math.max(0, Math.min(1, (depth - FOG_NEAR) / (FOG_FAR - FOG_NEAR)))
  const fogFactor = t * t * (3 - 2 * t)
  const fogValue = linearToSrgb(
    Math.max(0, Math.min(1, hexToLinear(FOG_COLOR)[1] * Math.pow(level, FOG_DIM_GAMMA)))
  )

  return (value + (fogValue - value) * fogFactor) * 255
}

/**
 * Valor de una superficie SIN luz — `PointsMaterial` y `SpriteMaterial` no
 * reciben iluminación, así que su color pasa directo al tone mapping.
 */
export function shadeUnlit(hex: string): number {
  const mapped = neutralToneMap(hexToLinear(hex))
  return linearToSrgb(Math.max(0, Math.min(1, mapped[1]))) * 255
}

/** Composición alfa de una capa sobre un fondo, en 0..255. */
export function over(top: number, alpha: number, bottom: number): number {
  return top * alpha + bottom * (1 - alpha)
}

/**
 * La dirección al sol en un progreso, unitaria.
 *
 * Vive acá y no en `frameProbe.ts` porque no es del muestreo del cuadro: es del
 * ARCO, igual que `levelAt`, y desde S11 la consumen las cuatro suites de la
 * celosía además del sampler. Es el mismo dato que `applyLightRig` le escribe a
 * la key y al gobo en cada frame.
 */
export function sunDirectionAt(progress: number): Vec3 {
  sampleLightArc(progress, arc)
  const azimuth = arc.azimuthDeg * RAD
  const elevation = arc.elevationDeg * RAD
  return [
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    Math.cos(azimuth) * Math.cos(elevation),
  ]
}

/** El nivel del arco en este progreso. Lo comparten las dos suites de S10. */
export function levelAt(progress: number): number {
  sampleLightArc(progress, arc)
  return arc.level
}
