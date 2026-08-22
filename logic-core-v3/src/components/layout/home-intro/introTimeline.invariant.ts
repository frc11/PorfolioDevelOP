import { MOTION_DURATION, REVEAL_STAGGER_S } from '@/components/design-system/motion/tokens'

import { CALIBRATIONS, check, report, s, section } from './introChecks'
import { HOME_INTRO_PHASES, buildTimeline, type IntroTimeline } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DEL RITMO — que las siete perillas no puedan romper la
 * secuencia.
 *
 *     npx tsx src/components/layout/home-intro/introTimeline.invariant.ts
 *
 * ── Qué protege y de quién ─────────────────────────────────────────────────
 *
 * Las perillas las calibra el dueño del proyecto **mirando la pantalla**, con
 * siete sliders y sin leer el razonamiento detrás de las fracciones. Lo que se
 * rompe al mover un número no se ve compilando. Las propiedades que S8d pide
 * por escrito son las que un slider puede romper sin avisar:
 *
 *   1. La letra termina de irse ANTES de que el fondo empiece.
 *   2. El acomodamiento es lo último, con la pantalla ya limpia.
 *   3. El relevo 2D→3D cae adentro de la inversión de la tinta, y ésta adentro
 *      de la transformación de color.
 *   4. Ninguna calibración rompe el orden.
 *
 * (Que el logo no cambie de tamaño y que el acomodamiento mueva y gire a la vez
 * son del vuelo: viven en `introFlight.invariant.ts`.)
 *
 * ── Por qué los controles negativos son timelines armados a mano ───────────
 *
 * Hallazgo de S8b que sigue valiendo: **ninguna combinación de las perillas
 * puede romper el orden.** Los tramos derivados se calculan como FRACCIONES de
 * las fases, así que la secuencia es invariante de escala — es exactamente por
 * eso que las perillas son seguras. Un control negativo hecho con perillas
 * absurdas no probaría nada: hay que romper el timeline resultante a mano.
 */

const EPS = 1e-9

// ── Las propiedades, como predicados sobre un timeline cualquiera ───────────

const ORDER = (t: IntroTimeline): boolean =>
  0 < t.strokeEndS &&
  t.strokeEndS < t.fillEndS &&
  t.fillEndS < t.colorStartS &&
  t.colorStartS < t.colorEndS &&
  t.colorEndS < t.letterOutEndS &&
  t.letterOutEndS < t.veilOutEndS &&
  t.veilOutEndS < t.totalS

/** 1 · La letra se va PRIMERO. Un solo número con dos nombres. */
const LETTER_BEFORE_VEIL = (t: IntroTimeline): boolean =>
  t.veilOutStartS === t.letterOutEndS && t.letterOutStartS === t.colorEndS

/** 2 · Y el acomodamiento arranca con la pantalla ya limpia. */
const PLACE_IS_LAST = (t: IntroTimeline): boolean => t.placeStartS === t.veilOutEndS

/** 3a · La inversión de la tinta vive adentro de la transformación, centrada. */
const INK_INSIDE_COLOR = (t: IntroTimeline): boolean =>
  t.inkFlipStartS > t.colorStartS &&
  t.inkFlipEndS < t.colorEndS &&
  Math.abs(
    (t.inkFlipStartS + t.inkFlipEndS) / 2 - (t.colorStartS + t.colorEndS) / 2
  ) < EPS

/** 3b · Y el relevo adentro de la inversión, en el mismo centro. */
const SWAP_INSIDE_INK = (t: IntroTimeline): boolean =>
  t.swapStartS > t.inkFlipStartS &&
  t.swapEndS < t.inkFlipEndS &&
  Math.abs((t.swapStartS + t.swapEndS) / 2 - (t.inkFlipStartS + t.inkFlipEndS) / 2) < EPS

/** Las letras asientan antes de que la línea del trazo se cierre. */
const LINES_SETTLE = (t: IntroTimeline): boolean =>
  t.wordmarkInS < t.sloganInS && t.sloganInS + t.lineInDurationS <= t.strokeEndS + EPS

const PROPERTIES: readonly (readonly [string, (t: IntroTimeline) => boolean])[] = [
  ['4 · orden estricto de los siete tramos', ORDER],
  ['1 · la letra se va antes que el fondo', LETTER_BEFORE_VEIL],
  ['2 · el acomodamiento es lo último', PLACE_IS_LAST],
  ['3a · la tinta invierte adentro del color', INK_INSIDE_COLOR],
  ['3b · el relevo, adentro de la inversión', SWAP_INSIDE_INK],
  ['las letras asientan antes del cierre', LINES_SETTLE],
]

// ── Las once calibraciones ──────────────────────────────────────────────────

section('las seis propiedades, en las once calibraciones')

for (const [name, phases] of CALIBRATIONS) {
  const t = buildTimeline(phases)
  for (const [label, holds] of PROPERTIES) {
    check(`${name} — ${label}`, holds(t))
  }
}

section('el total es la suma de las siete perillas')

for (const [name, phases] of CALIBRATIONS) {
  const t = buildTimeline(phases)
  const sum =
    phases.strokeS +
    phases.fillS +
    phases.holdS +
    phases.colorS +
    phases.letterOutS +
    phases.veilOutS +
    phases.placeS
  check(`${name}`, Math.abs(t.totalS - sum) < EPS, s(t.totalS))
}

// ── Los números del default, los que el reporte publica ─────────────────────

section('los números publicados del default')

const d = buildTimeline(HOME_INTRO_PHASES)

check('el trazo cierra', Math.abs(d.strokeEndS - 1.4) < EPS, s(d.strokeEndS))
check('el relleno termina', Math.abs(d.fillEndS - 1.75) < EPS, s(d.fillEndS))
check('arranca la transformación', Math.abs(d.colorStartS - 2.35) < EPS, s(d.colorStartS))
check('termina la transformación', Math.abs(d.colorEndS - 3.25) < EPS, s(d.colorEndS))
check('la letra terminó de irse', Math.abs(d.letterOutEndS - 3.85) < EPS, s(d.letterOutEndS))
check('el fondo terminó de irse', Math.abs(d.veilOutEndS - 4.55) < EPS, s(d.veilOutEndS))
check('arranca el acomodamiento', Math.abs(d.placeStartS - 4.55) < EPS, s(d.placeStartS))
check('la secuencia dura', Math.abs(d.totalS - 8.15) < EPS, s(d.totalS))

check(
  'la inversión de la tinta es corta',
  d.inkFlipEndS - d.inkFlipStartS < (d.colorEndS - d.colorStartS) / 2,
  `${s(d.inkFlipEndS - d.inkFlipStartS)} de ${s(d.colorEndS - d.colorStartS)}`
)
check(
  'y el relevo, más corto todavía',
  d.swapEndS - d.swapStartS < d.inkFlipEndS - d.inkFlipStartS,
  `${s(d.swapEndS - d.swapStartS)} · ${((d.swapEndS - d.swapStartS) * 60).toFixed(0)} cuadros a 60 fps`
)
check(
  'el acomodamiento se lleva el grueso de la secuencia',
  (d.totalS - d.placeStartS) / d.totalS > 0.4,
  `${((100 * (d.totalS - d.placeStartS)) / d.totalS).toFixed(0)}% del total`
)

section('las líneas usan los tokens del sistema, no números sueltos')

check(
  'cada línea entra en MOTION_DURATION.elemento',
  Math.abs(d.lineInDurationS - MOTION_DURATION.elemento) < EPS,
  s(d.lineInDurationS)
)
check(
  'el desfase entre las dos es REVEAL_STAGGER_S',
  Math.abs(d.sloganInS - d.wordmarkInS - REVEAL_STAGGER_S) < EPS,
  s(d.sloganInS - d.wordmarkInS)
)
check(
  'y la salida dura lo mismo que la entrada',
  Math.abs(d.letterOutEndS - d.letterOutStartS - MOTION_DURATION.elemento) < EPS,
  s(d.letterOutEndS - d.letterOutStartS)
)
check(
  'las letras quedan quietas antes del cierre del trazo',
  Math.abs(d.strokeEndS - (d.sloganInS + d.lineInDurationS) - 0.14) < EPS,
  s(d.strokeEndS - (d.sloganInS + d.lineInDurationS))
)

// ── Controles negativos ─────────────────────────────────────────────────────

section('controles negativos — timelines rotos a mano')

/** El fondo empezando a irse con la letra todavía en pantalla. */
const fondoTemprano: IntroTimeline = { ...d, veilOutStartS: d.letterOutEndS - 0.3 }
check('detecta el fondo yéndose antes de tiempo', !LETTER_BEFORE_VEIL(fondoTemprano))

/** El acomodamiento arrancando con el fondo todavía disolviéndose. */
const acomodoTemprano: IntroTimeline = { ...d, placeStartS: d.veilOutEndS - 0.4 }
check('detecta el acomodamiento pisando al fondo', !PLACE_IS_LAST(acomodoTemprano))

/** Un hueco muerto entre el fondo y el acomodamiento. */
const conHueco: IntroTimeline = { ...d, placeStartS: d.veilOutEndS + 0.5 }
check('detecta el hueco antes del acomodamiento', !PLACE_IS_LAST(conHueco))

/** La tinta invirtiendo fuera de la transformación de color. */
const tintaFuera: IntroTimeline = { ...d, inkFlipStartS: d.colorStartS - 0.2 }
check('detecta la inversión saliéndose del color', !INK_INSIDE_COLOR(tintaFuera))

/** El relevo asomando fuera de la inversión, donde el contraste ya es alto. */
const relevoFuera: IntroTimeline = { ...d, swapEndS: d.inkFlipEndS + 0.05 }
check('detecta el relevo fuera de la inversión', !SWAP_INSIDE_INK(relevoFuera))

/** Las letras todavía apareciendo cuando la línea se cierra. */
const letrasTarde: IntroTimeline = { ...d, sloganInS: d.strokeEndS - 0.1 }
check('detecta las letras sin asentar', !LINES_SETTLE(letrasTarde))

/** Y el orden, roto por el lado del relleno. */
const ordenRoto: IntroTimeline = { ...d, fillEndS: d.colorStartS + 0.5 }
check('detecta el orden roto', !ORDER(ordenRoto))

report('introTimeline')
