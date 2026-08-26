import { INTRO_COLORS } from './introTimeline'

/**
 * EL COLOR Y LA LUZ DEL LOGO — una sola fuente de verdad para las dos capas.
 *
 * ── Por qué el color se interpola acá y no en `motion` ─────────────────────
 *
 * Durante la transformación conviven el SVG y el mesh, y **la sustitución solo
 * es invisible si en cada instante los dos tienen exactamente el mismo color.**
 * Si el SVG lo interpolara `motion` y el mesh lo calculara three, serían dos
 * implementaciones que hay que confiar en que coincidan. Acá se calcula UNA vez
 * por frame, y de ese único triplete salen el `fill` del SVG y la emisiva del
 * mesh.
 *
 * La mezcla va en **luz lineal**, no en sRGB: sRGB comprime los tonos medios y
 * el cruce oscuro→claro pasaría por un gris embarrado. Es además el espacio en
 * el que trabaja el shader, así que las dos capas hacen la misma cuenta.
 *
 * ── ⚠ La LUZ no vive acá: S13 la mudó a `introRig.ts` ───────────────────────
 *
 * `sampleInkShading` y su tipo se fueron a `home-intro/introRig.ts`, y no fue
 * cosmético: al resolver el escalón de exposición de §7.11 el rig pasó a
 * necesitar `probeCelosia.ts` —cinco módulos y una integral de hemisferio— y
 * este archivo lo consume el bundle de la PRIMERA visita. Con la mudanza esa
 * cadena viaja en el chunk diferido de `three` y **`probeLighting.ts` salió del
 * grafo de primera carga**. El porqué completo está allá.
 *
 * Lo que quedó acá es solo color, y no importa una sola luz.
 *
 * ── La emisiva está resuelta contra el tone mapping ────────────────────────
 *
 * El canvas usa `NeutralToneMapping`, el mismo del probe. Para un gris por
 * debajo del codo ese operador es exactamente `6,25·x²` — un toe que aplasta los
 * negros: emitir la tinta cruda daría #010101 en vez de #111111. Así que la
 * emisiva se despeja **hacia atrás desde el resultado**, por bisección.
 *
 *     npx tsx src/components/layout/home-intro/introShading.invariant.ts
 */

/** Un color en sRGB, cada canal en [0,1]. */
export type Srgb = readonly [number, number, number]

// ── Espacio de color, tal cual lo hace three ────────────────────────────────

/** `SRGBToLinear` de `ColorManagement.js`. */
export function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
}

/** `LinearToSRGB` de `ColorManagement.js`. */
export function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055
}

export function hexToSrgb(hex: string): Srgb {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]
}

const byte = (channel: number) => Math.round(Math.min(1, Math.max(0, channel)) * 255)

/** El `#RRGGBB` que termina en el DOM. */
export function srgbToHex(color: Srgb): string {
  return `#${color.map((c) => byte(c).toString(16).padStart(2, '0')).join('')}`
}

/** Los tres bytes que termina viendo el ojo. */
export function srgbToBytes(color: Srgb): readonly [number, number, number] {
  return [byte(color[0]), byte(color[1]), byte(color[2])]
}

/** Mezcla en luz lineal. Ver el docblock. */
export function mixSrgbInLinearLight(from: Srgb, to: Srgb, t: number): Srgb {
  const p = Math.min(1, Math.max(0, t))
  return [0, 1, 2].map((i) =>
    linearToSrgb(srgbToLinear(from[i]) * (1 - p) + srgbToLinear(to[i]) * p)
  ) as unknown as Srgb

}

// ── Contraste, que es como se decide si algo se ve ──────────────────────────

/**
 * Luminancia relativa (WCAG) de un color sRGB.
 *
 * Vive acá desde S13 y no en una comprobación: la usan **dos** —el cruce de
 * tinta de `introSampling.invariant.ts` y la legibilidad de las partículas en
 * `introParticleTiming.invariant.ts`—, y el umbral con el que se decide "esto ya
 * no se ve" tiene que ser uno solo en las dos.
 */
export function luminance(color: Srgb): number {
  return (
    0.2126 * srgbToLinear(color[0]) +
    0.7152 * srgbToLinear(color[1]) +
    0.0722 * srgbToLinear(color[2])
  )
}

/** Razón de contraste WCAG. 1 = indistinguibles. */
export function contrastRatio(a: Srgb, b: Srgb): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// ── Los dos recorridos de color ─────────────────────────────────────────────

export const INTRO_BG_FROM = hexToSrgb(INTRO_COLORS.bgDark)
export const INTRO_BG_TO = hexToSrgb(INTRO_COLORS.bgLight)
export const INTRO_INK_FROM = hexToSrgb(INTRO_COLORS.inkOnDark)
export const INTRO_INK_TO = hexToSrgb(INTRO_COLORS.inkOnLight)

// ── El tone mapping, y su inversa ───────────────────────────────────────────

const NEUTRAL_START_COMPRESSION = 0.8 - 0.04
const NEUTRAL_KNEE = 0.24 // 1 − StartCompression

/**
 * `NeutralToneMapping` de three (`tonemapping_pars_fragment.glsl.js`), para una
 * entrada gris y con `toneMappingExposure` en 1.
 *
 * Con los tres canales iguales el operador se simplifica solo: `x` es el mínimo
 * Y el pico a la vez, y la desaturación final mezcla un valor consigo mismo.
 * Se aplica por canal: los colores en juego son grises salvo por un punto de
 * tinte en el papel, y tratarlos canal por canal es exacto para grises y una
 * aproximación de un byte para ese tinte.
 */
export function neutralToneMapGray(value: number): number {
  const offset = value < 0.08 ? value - 6.25 * value * value : 0.04
  const shifted = value - offset
  if (shifted < NEUTRAL_START_COMPRESSION) return shifted
  return 1 - (NEUTRAL_KNEE * NEUTRAL_KNEE) / (shifted + NEUTRAL_KNEE - NEUTRAL_START_COMPRESSION)
}

/**
 * Qué valor lineal hay que emitir para que el operador devuelva `target`.
 *
 * Por bisección y no con la fórmula analítica del toe (`√t / 2,5`) a propósito:
 * esa rama solo vale por debajo del codo, y acá la tinta arranca en **blanco**,
 * que necesita emitir ~1,5 en lineal. El intervalo llega a 16 por eso.
 */
export function solveNeutralToneMapGray(target: number): number {
  let low = 0
  let high = 16
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2
    if (neutralToneMapGray(mid) < target) low = mid
    else high = mid
  }
  return (low + high) / 2
}

/**
 * La emisiva, en lineal, que hace que el mesh salga por pantalla exactamente en
 * `color`. Es lo que mantiene pegadas las dos capas durante el relevo.
 */
export function solveEmissiveForSrgb(color: Srgb): readonly [number, number, number] {
  return [
    solveNeutralToneMapGray(srgbToLinear(color[0])),
    solveNeutralToneMapGray(srgbToLinear(color[1])),
    solveNeutralToneMapGray(srgbToLinear(color[2])),
  ]
}

/** La tinta final del sistema, resuelta. El número que la comprobación verifica. */
export const INTRO_FLAT_EMISSIVE_LINEAR = solveNeutralToneMapGray(
  srgbToLinear(hexToSrgb(INTRO_COLORS.inkOnLight)[0])
)
