import { cubicBezierEase } from '@/app/v3/_lib/escena/bezier'
import { MOTION_EASE } from '@/components/design-system/motion/tokens'

import type { IntroMote } from './introParticles'
import { introTimeS } from './introSampling'
import { LINE_SETTLE_MARGIN_FRAC, type IntroTimeline } from './introTimeline'

/**
 * EL RITMO DE LAS PARTÍCULAS — cuándo aparece cada una y cuándo se va.
 *
 * Módulo puro, sin React y sin DOM, por la misma regla que separa
 * `introSampling.ts` de `introTimeline.ts`.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * NO ES UNA FASE NUEVA: ES UN CONSUMIDOR MÁS DEL PROGRESO QUE YA EXISTE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Las siete perillas de S8e no se tocan y no aparece una octava. Las dos
 * ventanas de las partículas se **derivan** de instantes que el timeline ya
 * publica, igual que `samplePlace` alimenta desplazamiento, rotación y entrada
 * en la luz con un solo número:
 *
 *   aparecen  →  adentro de la TRANSFORMACIÓN DE COLOR   (`colorStartS` → `colorEndS`)
 *   bajan     →  adentro de la SALIDA DE LA LETRA        (`letterOutStartS` → `letterOutEndS`)
 *
 * **Aparecen con el color porque son de tinta, no de luz:** sobre el fondo
 * oscuro no tendrían contra qué recortarse. Es la misma razón por la que el
 * disco del sol no se veía en S10.
 *
 * **Y bajan con la letra porque ésa es la tapadera.** El fondo recién empieza a
 * disolverse en `veilOutStartS`, así que el campo entero tiene que estar afuera
 * antes de ese instante — no "casi", antes. Ver `PARTICLES_BEFORE_VEIL` en
 * `introTimeline.invariant.ts`.
 *
 * ── El respiro de las dos ventanas es el mismo de las líneas ───────────────
 *
 * Las dos se cierran `LINE_SETTLE_MARGIN_FRAC` antes del final de su fase, que
 * es exactamente el respiro con el que las letras asientan antes de que el trazo
 * cierre. No es un número nuevo: es el mismo, importado.
 *
 * De ahí salen las dos garantías que el sprint pide en una línea cada una:
 * **densidad completa antes de que se vaya la letra**, y **campo afuera antes
 * de que arranque el fondo**.
 */

/**
 * QUÉ PARTE DE CADA VENTANA SE VA EN EL ESCALONADO.
 *
 * El resto es la duración del gesto de cada mota. Con 0,45 sobre la ventana de
 * entrada del default (1,26 s) el desfase entre la primera y la última es de
 * 0,567 s y cada una tarda 0,693 s; sobre la de salida (0,54 s), 0,243 s de
 * desfase y 0,297 s de caída.
 *
 * **Por qué una fracción y no un desfase en segundos:** es la ley del módulo
 * desde S8 —"la coreografía interna se declara en fracciones de su fase, nunca
 * en segundos"—, y es lo que hace que mover una perilla reacomode todo lo de
 * adentro sin desarmar el escalonado. Las dos cotas que importan las verifica la
 * comprobación **sobre las once calibraciones**: que el desfase total quede por
 * encima de `REVEAL_STAGGER_S` (o sea que se lea como secuencia y no como
 * bloque) y que la duración de cada mota quede por encima de
 * `MOTION_DURATION.micro` (o sea que no sea un parpadeo).
 */
export const PARTICLE_STAGGER_FRAC = 0.45

export type IntroParticleWindows = {
  /** Aparecen: adentro de la transformación de color. */
  readonly inStartS: number
  readonly inEndS: number
  /** Bajan: adentro de la salida de la letra. */
  readonly outStartS: number
  readonly outEndS: number
  /** Lo que cada mota tarda en aparecer y en caer, por separado. */
  readonly inDurationS: number
  readonly outDurationS: number
  /** El desfase entre la primera y la última, en cada ventana. */
  readonly inStaggerS: number
  readonly outStaggerS: number
}

export function introParticleWindows(timeline: IntroTimeline): IntroParticleWindows {
  const colorS = timeline.colorEndS - timeline.colorStartS
  const letterOutS = timeline.letterOutEndS - timeline.letterOutStartS

  const inStartS = timeline.colorStartS
  const inEndS = timeline.colorEndS - colorS * LINE_SETTLE_MARGIN_FRAC
  const outStartS = timeline.letterOutStartS
  const outEndS = timeline.letterOutEndS - letterOutS * LINE_SETTLE_MARGIN_FRAC

  const inSpanS = Math.max(0, inEndS - inStartS)
  const outSpanS = Math.max(0, outEndS - outStartS)

  return {
    inStartS,
    inEndS,
    outStartS,
    outEndS,
    inDurationS: inSpanS * (1 - PARTICLE_STAGGER_FRAC),
    outDurationS: outSpanS * (1 - PARTICLE_STAGGER_FRAC),
    inStaggerS: inSpanS * PARTICLE_STAGGER_FRAC,
    outStaggerS: outSpanS * PARTICLE_STAGGER_FRAC,
  }
}

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
 * 0 → 1: cuánto lleva caída una mota. **Un solo número para las dos cosas que
 * pasan al bajar** —el desplazamiento y el apagado—, por la misma razón por la
 * que `samplePlace` es uno solo: que arranquen y terminen juntos no puede ser
 * una calibración que se desajuste.
 *
 * ⚠ **`linear`, y hay un número detrás.** No es pereza ni una curva nueva: es la
 * tercera de este repo, "no aplicar ninguna" (`ChoreoEase` en
 * `choreographyTypes.ts`, y el trazo del propio intro por escrito en
 * `sampleStrokeDraw`). La razón es que **la ventana de salida es cortísima** —
 * 0,297 s en el default— y sobre una ventana así la curva no elige el carácter
 * del gesto sino cuánto STROBEA:
 *
 * · El paso por cuadro de una mota, en diámetros propios, es
 *   `INTRO_FALL_WORLD / (PARTICLE_SIZE × tan(fov/2) × cuadros)` — **y no depende
 *   de la profundidad**, porque el desplazamiento y el tamaño se dividen los dos
 *   por ella. Un solo número gobierna el campo entero.
 * · Con `linear` ese paso es el mínimo posible para una distancia dada. Con
 *   `shift` la pendiente máxima es **2,7346×** —medida sobre el evaluador que el
 *   repo embarca, en `introParticleField.invariant.ts`—, o sea que el mismo
 *   recorrido se ve a más del doble de velocidad en el medio del gesto.
 *
 * ⚠ **S14 cambió el peso de este argumento, no su conclusión.** Con las motas de
 * S13 el paso era 1,90 por cuadro con `linear` y **5,20 con `shift`**: un punto
 * de 3 px saltando cinco veces su tamaño, que es una fila de puntos y está fuera
 * de la banda. Con las motas de S14 —el doble de grandes— los dos números se
 * dividen por la escala: **0,93 y 2,54**, y `shift` ya NO se saldría de la banda.
 * `linear` sigue siendo lo correcto porque sigue siendo el mínimo posible, pero
 * el modo de falla del que protegía no ocurre a esta escala.
 *
 * Y el apagado, que cuelga del mismo número, queda lineal — que es lo que hace
 * verdadero "bajan de verdad, no se desvanecen en el lugar": la mota **ya
 * recorrió el 92% de su caída** cuando deja de ser legible. Medido, no supuesto.
 */
export function sampleParticleOut(
  timeline: IntroTimeline,
  progress: number,
  phase: number
): number {
  const w = introParticleWindows(timeline)
  return phased(
    null,
    introTimeS(timeline, progress),
    w.outStartS,
    w.outStaggerS,
    w.outDurationS,
    phase
  )
}

export type IntroMoteSample = {
  /** Opacidad final, material incluido. 0 = no hay nada que dibujar. */
  readonly alpha: number
  readonly xPx: number
  readonly yPx: number
  readonly sizePx: number
}

/**
 * Dónde está y cuánto se ve una mota en un instante. Espejo exacto de
 * `sampleLineOpacity`: entra por un lado, sale por el otro, y el producto es lo
 * que queda.
 */
export function sampleMote(
  timeline: IntroTimeline,
  progress: number,
  mote: IntroMote
): IntroMoteSample {
  const entered = sampleParticleIn(timeline, progress, mote.phase)
  const gone = sampleParticleOut(timeline, progress, mote.phase)
  return {
    alpha: mote.materialAlpha * entered * (1 - gone),
    xPx: mote.xPx + mote.dxPx * gone,
    yPx: mote.yPx + mote.dyPx * gone,
    sizePx: mote.sizePx + mote.dSizePx * gone,
  }
}
