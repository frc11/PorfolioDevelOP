import { over } from './introParticleProbe'
import type { IntroMote } from './introParticles'
import { sampleMote, sampleParticleOut } from './introParticleTiming'
import { sampleBackgroundColor, sampleVeilOpacity } from './introSampling'
import { contrastRatio, hexToSrgb, type Srgb } from './introShading'
import type { IntroTimeline } from './introTimeline'

/**
 * EL BANCO DE LA LEGIBILIDAD — no es código de la aplicación.
 *
 * Salió de `introParticleProbe.ts` en S14 por el límite de 300 líneas del repo,
 * por la costura que su propio docblock ya declaraba: **allá el campo de la
 * escena proyectado, acá cómo se decide si una mota se ve.**
 *
 * El criterio es la razón de contraste de WCAG con **1,10** como el punto donde
 * algo deja de distinguirse del fondo — el mismo umbral y el mismo instrumento
 * con el que `introSampling.invariant.ts` mide el cruce de tinta.
 *
 * ⚠ **Es un criterio de CONTRASTE, y por lo tanto ciego al tamaño.** Eso no es
 * un descuido: la alfa de la caída multiplica a la mota entera por igual y el
 * sprite del polvo es opaco adentro del 75% de su radio, así que todas las motas
 * de un mismo color cruzan el umbral **en el mismo instante**, midan 2 px o 15.
 * Una mota más grande pone más tinta por encima del umbral en cada instante,
 * pero no lo cruza más tarde. Medido en `introParticleReading.invariant.ts` §5.
 */

/** El umbral de "ya no se distingue del fondo". El del cruce de tinta. */
export const LEGIBLE = 1.1
/** Muestras por segundo del bracket. La misma grilla fina del cruce de tinta. */
export const CROSSING_HZ = 4_000

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

/**
 * LA LEGIBILIDAD DE UN CAMPO ENTERO, en una sola pasada.
 *
 * Salió de `introParticleTiming.invariant.ts` en S14 porque
 * `introParticleReading.invariant.ts` necesita el MISMO instrumento para
 * responder una pregunta distinta: si el tamaño de la mota mueve el instante en
 * que deja de ser legible. Dos implementaciones de "la última legible" habrían
 * hecho incomparables las dos respuestas.
 *
 * La salida de la suite que la consumía quedó **idéntica**, verificada con
 * `diff` antes de tocar las perillas — el procedimiento de S13 §8.2.
 */
export type IntroLegibility = {
  /** Cuántas motas cruzaron el umbral alguna vez. El control positivo. */
  readonly everLegible: number
  /** El contraste más alto que alcanzó cualquier mota. */
  readonly peakContrast: number
  /** Cuándo se vuelve legible la PRIMERA. */
  readonly firstLegibleS: number
  /** Cuándo deja de serlo la ÚLTIMA. **El número del mecanismo.** */
  readonly lastLegibleS: number
  /** Qué fracción de su caída llevaba cada una al dejar de ser legible. */
  readonly travelAtLast: readonly number[]
}

/** Las cuatro esquinas de las dos ventanas. `introParticleWindows` las produce. */
export type LegibilityWindows = {
  readonly inStartS: number
  readonly inEndS: number
  readonly outStartS: number
  readonly outEndS: number
}

export function introLegibility(
  timeline: IntroTimeline,
  windows: LegibilityWindows,
  motes: readonly IntroMote[]
): IntroLegibility {
  let firstLegibleS = Infinity
  let lastLegibleS = -Infinity
  let everLegible = 0
  let peakContrast = 1
  const travelAtLast: number[] = []

  for (const mote of motes) {
    const at = (timeS: number) => introContrastAt(timeline, mote, timeS)
    let seen = false
    for (let i = 0; i <= 400; i += 1) {
      const timeS = windows.inStartS + ((windows.outEndS - windows.inStartS) * i) / 400
      const value = at(timeS)
      if (value > peakContrast) peakContrast = value
      if (value >= LEGIBLE) seen = true
    }
    if (!seen) continue
    everLegible += 1
    const first = crossingS(at, windows.inStartS, windows.inEndS, false)
    const last = crossingS(at, windows.outStartS, windows.outEndS, true)
    if (Number.isFinite(first)) firstLegibleS = Math.min(firstLegibleS, first)
    if (Number.isFinite(last)) {
      lastLegibleS = Math.max(lastLegibleS, last)
      travelAtLast.push(sampleParticleOut(timeline, last / timeline.totalS, mote.phase))
    }
  }

  return { everLegible, peakContrast, firstLegibleS, lastLegibleS, travelAtLast }
}
