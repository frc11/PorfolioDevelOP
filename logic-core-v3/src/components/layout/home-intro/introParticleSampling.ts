import { cubicBezierEase } from '@/app/v3/_lib/escena/bezier'
import { MOTION_EASE } from '@/components/design-system/motion/tokens'

import type { IntroMote } from './introParticles'
import { introTimeS } from './introSampling'
import { introParticleWindows } from './introParticleTiming'
import type { IntroTimeline } from './introTimeline'

/**
 * CÓMO SE LEE EL RITMO DE LAS PARTÍCULAS EN UN INSTANTE — los muestreadores.
 *
 * Salió de `introParticleTiming.ts` en V3-A por el límite de 300 líneas del
 * repo, y con la costura donde el repo ya la tiene puesta: **el archivo que se
 * abre para calibrar tiene que ser todo dato** (`introTimeline.ts` contra
 * `introSampling.ts`). Allá quedan las dos ventanas y las dos fracciones que las
 * reparten; acá, la aritmética que las consume, que no cambia al mover un
 * número.
 *
 * Todo es función pura de un progreso 0→1: es lo que hace que la secuencia se
 * pueda **scrubear** y lo que le permite a la comprobación estática evaluarla
 * entera en vez de sólo en sus bordes.
 *
 * Módulo puro: sin React, sin `motion`, sin DOM. Corre en node.
 */

/** Progreso local dentro de un tramo, recortado a [0,1]. Tramo nulo = escalón. */
function span(value: number, from: number, to: number): number {
  if (to <= from) return value >= to ? 1 : 0
  return Math.min(1, Math.max(0, (value - from) / (to - from)))
}

function phased(
  curve: readonly [number, number, number, number] | null,
  timeS: number,
  startS: number,
  staggerS: number,
  durationS: number,
  phase: number
): number {
  const from = startS + phase * staggerS
  const local = span(timeS, from, from + durationS)
  return curve ? cubicBezierEase(curve, local) : local
}

/**
 * 0 → 1: cuánto lleva aparecida una mota. `arrive`, la curva del sistema para
 * todo lo que ENTRA — la misma con la que entran las dos líneas del lockup.
 */
export function sampleParticleIn(
  timeline: IntroTimeline,
  progress: number,
  phase: number
): number {
  const w = introParticleWindows(timeline)
  return phased(
    MOTION_EASE.arrive,
    introTimeS(timeline, progress),
    w.inStartS,
    w.inStaggerS,
    w.inDurationS,
    phase
  )
}

/**
 * 0 → 1: **cuánto lleva acomodada una mota.** De acá cuelgan las TRES cosas del
 * viaje —la posición, el diámetro y el color—, con un solo número, por la misma
 * razón por la que `samplePlace` es uno solo: que arranquen y terminen juntas no
 * puede ser una calibración que se desajuste.
 *
 * ⚠ **`arrive`, y el cambio de curva tiene su número.** S13 usaba `linear` para
 * la caída y la razón estaba medida: la ventana era cortísima y sobre una
 * ventana así la curva no elige el carácter del gesto sino **cuánto ESTROBEA**.
 * El paso por cuadro de una mota, en diámetros propios, era 0,93 con `linear` y
 * 2,54 con `shift` (pendiente máxima ×2,7346, medida sobre el evaluador que el
 * repo embarca).
 *
 * 🔴 **Ese argumento se evaporó con el mecanismo, y hay que decir por qué en vez
 * de cambiar la curva en silencio.** La caída recorría **109 px de mediana** —el
 * campo entero bajando—; el acomodamiento recorre **16,2 px de mediana**, porque
 * cada mota va a la mota de la escena MÁS CERCANA de su concha y no a un punto
 * elegido por una traslación. Con casi siete veces menos recorrido, el paso por
 * cuadro cae en la misma proporción y el estrobo deja de ser el criterio.
 *
 * Lo que pasa a decidir es el carácter, y ahí `arrive` es la curva del sistema
 * para todo lo que LLEGA — la misma con la que entran las dos líneas del lockup
 * y con la que entra cada mota. Una mota que se acomoda llega y se queda: sale
 * rápido y frena. Los dos números están medidos en
 * `introParticleSettle.invariant.ts`.
 */
export function sampleParticleSettle(
  timeline: IntroTimeline,
  progress: number,
  phase: number
): number {
  const w = introParticleWindows(timeline)
  return phased(
    MOTION_EASE.arrive,
    introTimeS(timeline, progress),
    w.outStartS,
    w.outStaggerS,
    w.settleDurationS,
    phase
  )
}

/**
 * 0 → 1: **el relevo con el campo de la escena** — la alfa de la mota yéndose,
 * y nada más.
 *
 * Arranca donde el acomodamiento termina, adentro del MISMO lugar del
 * escalonado: la mota llega primero y se releva después. Sin esa separación el
 * acomodamiento no se vería — la mota se apagaría mientras viaja, que es
 * exactamente lo que el humano no quiere.
 *
 * ⚠ **`linear`, y acá la razón no es el estrobo sino que no es un gesto.** Una
 * extinción no tiene carácter que elegir: lo único que una curva decidiría es
 * dónde se concentra el apagado, y concentrarlo es lo contrario de lo que se
 * busca. Es la tercera curva de este repo, "no aplicar ninguna" (`ChoreoEase` en
 * `choreographyTypes.ts`, y el trazo del propio intro en `sampleStrokeDraw`).
 */
export function sampleParticleHandoff(
  timeline: IntroTimeline,
  progress: number,
  phase: number
): number {
  const w = introParticleWindows(timeline)
  return phased(
    null,
    introTimeS(timeline, progress),
    w.outStartS + w.settleDurationS,
    w.outStaggerS,
    w.handoffDurationS,
    phase
  )
}

export type IntroMoteSample = {
  /** Opacidad final, material incluido. 0 = no hay nada que dibujar. */
  readonly alpha: number
  readonly xPx: number
  readonly yPx: number
  readonly sizePx: number
  /**
   * El escalón de la rampa con el que se la dibuja AHORA. Se mueve con el
   * acomodamiento, del suyo al de la mota de la escena que la recibe. −1 = bokeh.
   */
  readonly tint: number
}

/**
 * Dónde está, de qué tamaño, de qué color y cuánto se ve una mota en un
 * instante. Espejo exacto de `sampleLineOpacity`: entra por un lado, sale por el
 * otro, y el producto es lo que queda.
 */
export function sampleMote(
  timeline: IntroTimeline,
  progress: number,
  mote: IntroMote
): IntroMoteSample {
  const entered = sampleParticleIn(timeline, progress, mote.phase)
  const settled = sampleParticleSettle(timeline, progress, mote.phase)
  const gone = sampleParticleHandoff(timeline, progress, mote.phase)
  return {
    alpha: mote.materialAlpha * entered * (1 - gone),
    xPx: mote.xPx + mote.settleDxPx * settled,
    yPx: mote.yPx + mote.settleDyPx * settled,
    sizePx: mote.sizePx + mote.settleDSizePx * settled,
    // El color viaja con el resto, pero el DIBUJO está cuantizado en 24
    // escalones (`introParticleTint.ts`: `drawImage` no tiñe, hace falta un
    // sprite por color). Interpolar el índice y redondear es exacto contra esa
    // cuantización — el error ya está acotado y medido en media escalón.
    tint:
      mote.tint < 0 || mote.settleTint < 0
        ? mote.tint
        : Math.round(mote.tint + (mote.settleTint - mote.tint) * settled),
  }
}
