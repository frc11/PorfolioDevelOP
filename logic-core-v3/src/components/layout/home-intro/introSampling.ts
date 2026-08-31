import { cubicBezierEase } from '@/app/v3/_lib/escena/bezier'
import { MOTION_EASE } from '@/components/design-system/motion/tokens'

import {
  INTRO_BG_FROM,
  INTRO_BG_TO,
  INTRO_INK_FROM,
  INTRO_INK_TO,
  mixSrgbInLinearLight,
  type Srgb,
} from './introShading'
import { type IntroTimeline } from './introTimeline'

/**
 * CÓMO SE LEE EL RITMO EN UN INSTANTE — los muestreadores.
 *
 * Salió de `introTimeline.ts` por la misma regla que separa `choreography.ts`
 * de `choreographySampler.ts` en el probe: **el archivo que se abre para
 * calibrar tiene que ser todo dato.** Acá vive la matemática que lo consume, y
 * no cambia al mover un número.
 *
 * Todo es función pura de un progreso 0→1. Es lo que hace que la secuencia se
 * pueda **scrubear** y lo que le permite a la comprobación estática evaluarla
 * entera en vez de solo en sus bordes.
 *
 * Módulo puro: sin React, sin `motion`, sin DOM. Corre en node.
 */

/** Progreso local dentro de un tramo, recortado a [0,1]. Tramo nulo = escalón. */
function span(value: number, from: number, to: number): number {
  if (to <= from) return value >= to ? 1 : 0
  return Math.min(1, Math.max(0, (value - from) / (to - from)))
}

/** El instante de la secuencia, en segundos, para un progreso 0→1. */
export function introTimeS(timeline: IntroTimeline, progress: number): number {
  return Math.min(1, Math.max(0, progress)) * timeline.totalS
}

function ease(
  curve: readonly [number, number, number, number],
  timeline: IntroTimeline,
  progress: number,
  fromS: number,
  toS: number
): number {
  return cubicBezierEase(curve, span(introTimeS(timeline, progress), fromS, toS))
}

/** 0 → 1: cuánto lleva dibujado el contorno. Lineal — ver el docblock del trazo. */
export function sampleStrokeDraw(timeline: IntroTimeline, progress: number): number {
  return span(introTimeS(timeline, progress), 0, timeline.strokeEndS)
}

/** 0 → 1: cuánto lleva rellenado. */
export function sampleFill(timeline: IntroTimeline, progress: number): number {
  return ease(MOTION_EASE.arrive, timeline, progress, timeline.strokeEndS, timeline.fillEndS)
}

// ── La transformación de color ──────────────────────────────────────────────

/**
 * El fondo, de oscuro a claro. `shift` —el ease-in-out del sistema— porque esto
 * es un cambio de estado: sale de quieto y llega a quieto.
 */
export function sampleBackgroundShift(timeline: IntroTimeline, progress: number): number {
  return ease(MOTION_EASE.shift, timeline, progress, timeline.colorStartS, timeline.colorEndS)
}

/**
 * La tinta, de blanca a negra. **Misma curva, ventana más angosta y centrada.**
 * El porqué está en `INK_FLIP_FRAC` (`introTimeline.ts`): el cruce de contraste
 * con el fondo es inevitable, así que lo que se hace es atravesarlo rápido.
 */
export function sampleInkFlip(timeline: IntroTimeline, progress: number): number {
  return ease(MOTION_EASE.shift, timeline, progress, timeline.inkFlipStartS, timeline.inkFlipEndS)
}

/** El color del fondo en este instante. */
export function sampleBackgroundColor(timeline: IntroTimeline, progress: number): Srgb {
  return mixSrgbInLinearLight(INTRO_BG_FROM, INTRO_BG_TO, sampleBackgroundShift(timeline, progress))
}

/** El color de la tinta: lo comparten el trazo, el relleno, las letras y el mesh. */
export function sampleInkColor(timeline: IntroTimeline, progress: number): Srgb {
  return mixSrgbInLinearLight(INTRO_INK_FROM, INTRO_INK_TO, sampleInkFlip(timeline, progress))
}

/**
 * EL RELEVO 2D→3D. 0 = todo SVG · 1 = todo mesh.
 *
 * Cae en el centro de la inversión de la tinta, que es donde el contraste con
 * el fondo es mínimo. Durante el cruce las dos capas se suman con alfa, así que
 * la cobertura baja hasta un 75% en el peor punto; como las dos llevan el MISMO
 * color, lo único que ese déficit puede hacer visible es la diferencia entre el
 * logo y el fondo — y justo ahí es la más chica de toda la secuencia.
 */
export function sampleSwap(timeline: IntroTimeline, progress: number): number {
  return ease(MOTION_EASE.shift, timeline, progress, timeline.swapStartS, timeline.swapEndS)
}

// ── Las dos salidas, en orden ───────────────────────────────────────────────

/** Se va la letra. Espejo exacto de su entrada. **Aprobado, no se toca.** */
export function sampleLetterOut(timeline: IntroTimeline, progress: number): number {
  return ease(
    MOTION_EASE.arrive,
    timeline,
    progress,
    timeline.letterOutStartS,
    timeline.letterOutEndS
  )
}

/** Y recién después, el fondo. */
export function sampleVeilOut(timeline: IntroTimeline, progress: number): number {
  return ease(MOTION_EASE.arrive, timeline, progress, timeline.veilOutStartS, timeline.veilOutEndS)
}

/** La entrada de una línea de texto. **Aprobada en S8b — no se toca.** */
export function sampleLineIn(
  timeline: IntroTimeline,
  progress: number,
  startS: number
): number {
  return ease(MOTION_EASE.arrive, timeline, progress, startS, startS + timeline.lineInDurationS)
}

/**
 * Opacidad de una línea. Entra y sale **solo con opacidad**: sin desplazamiento,
 * sin escala, sin blur. Un desvanecimiento sin dirección.
 */
export function sampleLineOpacity(
  timeline: IntroTimeline,
  progress: number,
  startS: number
): number {
  return sampleLineIn(timeline, progress, startS) * (1 - sampleLetterOut(timeline, progress))
}

/** Opacidad del fondo. */
export function sampleVeilOpacity(timeline: IntroTimeline, progress: number): number {
  return 1 - sampleVeilOut(timeline, progress)
}

// ── El acomodamiento ────────────────────────────────────────────────────────

/**
 * EL ÚNICO NÚMERO DEL GESTO FINAL. 0 = donde estaba y de frente · 1 = en su
 * lugar de la escena y presentando su cara.
 *
 * **De acá cuelgan el desplazamiento, la rotación y la entrada en la luz.** Que
 * arranquen y terminen juntos no es una calibración que se pueda desajustar: es
 * que son el mismo valor. En S8c eran dos curvas distintas sobre la misma
 * ventana —expo-out para la posición, `arrive` para la rotación— y por eso se
 * leía como dos movimientos pegados.
 *
 * `shift` es el ease-in-out del sistema, y es la curva de mover algo de un lugar
 * a otro: sale de quieto, acelera, y llega a quieto. El expo-out de S8c cubría
 * el 28% del camino en los primeros 90 ms, que es lo que se veía como "rápido"
 * incluso a tres segundos.
 */
export function samplePlace(timeline: IntroTimeline, progress: number): number {
  return ease(MOTION_EASE.shift, timeline, progress, timeline.placeStartS, timeline.totalS)
}

export type IntroSample = {
  readonly timeS: number
  readonly strokeDraw: number
  readonly fill: number
  readonly backgroundShift: number
  readonly inkFlip: number
  readonly swap: number
  readonly wordmarkOpacity: number
  readonly sloganOpacity: number
  readonly veilOpacity: number
  readonly place: number
  readonly ink: Srgb
  readonly background: Srgb
}

/** Todos los canales de una vez. Lo usan la comprobación y el controlador. */
export function sampleIntro(timeline: IntroTimeline, progress: number): IntroSample {
  return {
    timeS: introTimeS(timeline, progress),
    strokeDraw: sampleStrokeDraw(timeline, progress),
    fill: sampleFill(timeline, progress),
    backgroundShift: sampleBackgroundShift(timeline, progress),
    inkFlip: sampleInkFlip(timeline, progress),
    swap: sampleSwap(timeline, progress),
    wordmarkOpacity: sampleLineOpacity(timeline, progress, timeline.wordmarkInS),
    sloganOpacity: sampleLineOpacity(timeline, progress, timeline.sloganInS),
    veilOpacity: sampleVeilOpacity(timeline, progress),
    place: samplePlace(timeline, progress),
    ink: sampleInkColor(timeline, progress),
    background: sampleBackgroundColor(timeline, progress),
  }
}

export type IntroPhaseName =
  | 'trazo'
  | 'relleno'
  | 'espera'
  | 'color'
  | 'letra'
  | 'fondo'
  | 'acomodo'

/** El nombre del momento, para la lectura en vivo del controlador. */
export function introPhaseName(timeline: IntroTimeline, progress: number): IntroPhaseName {
  const t = introTimeS(timeline, progress)
  if (t < timeline.strokeEndS) return 'trazo'
  if (t < timeline.fillEndS) return 'relleno'
  if (t < timeline.colorStartS) return 'espera'
  if (t < timeline.colorEndS) return 'color'
  if (t < timeline.letterOutEndS) return 'letra'
  if (t < timeline.veilOutEndS) return 'fondo'
  return 'acomodo'
}
