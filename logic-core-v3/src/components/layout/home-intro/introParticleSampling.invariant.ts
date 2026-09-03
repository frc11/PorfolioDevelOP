import { check, report, s, section } from './introChecks'
import { DUST_MATERIAL_ALPHA } from './introParticles'
import { buildIntroParticles } from './introParticleField'
import { introLegibility } from './introLegibilityProbe'
import {
  sampleMote,
  sampleParticleHandoff,
  sampleParticleIn,
  sampleParticleSettle,
} from './introParticleSampling'
import { introParticleWindows } from './introParticleTiming'
import { HOME_INTRO_TIMELINE } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DE LOS MUESTREADORES DE LAS PARTÍCULAS.
 *
 *     npx tsx src/components/layout/home-intro/introParticleSampling.invariant.ts
 *
 * Salió de `introParticleTiming.invariant.ts` en V3-A, con la misma costura con
 * la que se partió el módulo que verifica: **allá las dos ventanas y el margen
 * entre las dos poblaciones, acá la aritmética que las lee.** El corte es por
 * tema y no por tamaño, aunque el límite de 300 líneas del repo haya sido lo
 * que lo forzó.
 *
 * Las dos propiedades que custodia son las que el acomodamiento agregó:
 *
 *  · **cada mota entra una vez, se acomoda una vez y se releva una vez**, y
 *    ninguna de las tres rampas retrocede;
 *  · **el orden**: la mota llega ENTERA y recién entonces se releva. Si las dos
 *    mitades se pisaran, se apagaría mientras viaja — que es exactamente lo que
 *    el humano pidió cambiar.
 */

const T = HOME_INTRO_TIMELINE
const WIN = introParticleWindows(T)
const FIELD = buildIntroParticles(1440, 810)
/** La fracción del acomodamiento que cada mota llevaba al dejar de ser legible. */
const { travelAtLast } = introLegibility(T, WIN, FIELD.motes)

// ── 3 · Los muestreadores ───────────────────────────────────────────────────

section('3 · Cada mota entra una vez, se acomoda una vez, y no vuelve')

let monotone = true
for (const phase of [0, 0.5, 1]) {
  let previousIn = -Infinity
  let previousSettle = -Infinity
  let previousGone = -Infinity
  for (let i = 0; i <= 600; i += 1) {
    const p = i / 600
    const entered = sampleParticleIn(T, p, phase)
    const settled = sampleParticleSettle(T, p, phase)
    const gone = sampleParticleHandoff(T, p, phase)
    if (
      entered < previousIn - 1e-12 ||
      settled < previousSettle - 1e-12 ||
      gone < previousGone - 1e-12
    ) {
      monotone = false
    }
    previousIn = entered
    previousSettle = settled
    previousGone = gone
  }
}
check('las tres rampas solo avanzan', monotone)

/**
 * 🔴 **Y el ORDEN de las dos mitades, que es lo que V3-A agrega.** La mota tiene
 * que estar acomodada ANTES de empezar a relevarse; si las dos rampas se
 * solaparan, se apagaría mientras viaja y el gesto no se vería — que es
 * exactamente lo que el humano pidió cambiar.
 */
let ordenadas = true
for (const phase of [0, 0.5, 1]) {
  for (let i = 0; i <= 600; i += 1) {
    const p = i / 600
    if (sampleParticleHandoff(T, p, phase) > 0 && sampleParticleSettle(T, p, phase) < 1) {
      ordenadas = false
    }
  }
}
check(
  'primero se acomoda y RECIÉN DESPUÉS se releva: las dos mitades no se pisan',
  ordenadas,
  `acomodarse ${s(WIN.settleDurationS)} · relevarse ${s(WIN.handoffDurationS)} de los ${s(WIN.outDurationS)} de cada mota`
)
check(
  'antes de la transformación no hay una sola mota',
  FIELD.motes.every((m) => sampleMote(T, (WIN.inStartS - 0.001) / T.totalS, m).alpha === 0)
)
check(
  'y cuando el campo terminó de relevarse tampoco',
  FIELD.motes.every((m) => sampleMote(T, WIN.outEndS / T.totalS, m).alpha === 0)
)
check(
  'en el medio están todas, con la opacidad de su material',
  FIELD.motes.every((m) => {
    const alpha = sampleMote(T, WIN.inEndS / T.totalS, m).alpha
    return Math.abs(alpha - m.materialAlpha) < 1e-9
  }),
  `polvo ${DUST_MATERIAL_ALPHA} · el bokeh el suyo`
)

// ── 5 · Se acomodan de verdad ───────────────────────────────────────────────

section('5 · Se acomodan de verdad: llegan enteras antes de relevarse')

/**
 * 🔴 **Esta sección midió lo contrario hasta V3-A, y la cifra queda al lado.**
 * Con la caída de S13 la pregunta era *«¿bajan de verdad o se desvanecen en el
 * lugar?»* y la respuesta era **92% del recorrido** al dejar de ser legible: la
 * mota se apagaba MIENTRAS viajaba, que era lo correcto para un gesto de salida.
 *
 * Con el acomodamiento la pregunta se da vuelta: la mota tiene que **llegar
 * entera** y recién después relevarse, o no se lee que se quedó. La cota pasa de
 * «más de la mitad» a «el 100%».
 */
const travelSorted = [...travelAtLast].sort((a, b) => a - b)
const minTravel = travelSorted[0]
check(
  'al dejar de ser legible, la mota YA está acomodada del todo',
  minTravel >= 1 - 1e-9,
  `la peor llegó al ${(minTravel * 100).toFixed(1)}% de su acomodamiento · antes de V3-A la mediana era 92%`
)
check(
  'la posición cuelga del acomodamiento y la alfa del relevo, cada una de la suya',
  FIELD.motes.every((mote) => {
    const p = (WIN.outStartS + WIN.settleDurationS * 0.5) / T.totalS
    const settled = sampleParticleSettle(T, p, mote.phase)
    const sample = sampleMote(T, p, mote)
    return (
      Math.abs(sample.xPx - (mote.xPx + mote.settleDxPx * settled)) < 1e-9 &&
      Math.abs(sample.sizePx - (mote.sizePx + mote.settleDSizePx * settled)) < 1e-9
    )
  }),
  'posición, tamaño y color viajan con un solo número; la opacidad, con el otro'
)
check(
  'control positivo — a mitad del acomodamiento la alfa todavía está ENTERA',
  FIELD.motes.every((mote) => {
    // Cada mota en SU propio medio del acomodamiento: el escalonado las corre.
    const p =
      (WIN.outStartS + mote.phase * WIN.outStaggerS + WIN.settleDurationS * 0.5) / T.totalS
    return sampleMote(T, p, mote).alpha >= mote.materialAlpha - 1e-9
  }),
  'si el relevo se solapara con el viaje, esto se caería'
)

report('introParticleSampling')
