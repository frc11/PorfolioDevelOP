import { CALIBRATIONS, at, check, report, s, section, sweep } from './introChecks'
import {
  introPhaseName,
  introTimeS,
  sampleBackgroundColor,
  sampleBackgroundShift,
  sampleFill,
  sampleInkColor,
  sampleInkFlip,
  sampleLetterOut,
  sampleLineOpacity,
  samplePlace,
  sampleStrokeDraw,
  sampleSwap,
  sampleVeilOpacity,
} from './introSampling'
import { srgbToHex, srgbToLinear, type Srgb } from './introShading'
import {
  HOME_INTRO_PHASES,
  INTRO_COLORS,
  buildTimeline,
  type IntroTimeline,
} from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DE LA FORMA DE LA SECUENCIA.
 *
 *     npx tsx src/components/layout/home-intro/introSampling.invariant.ts
 *
 * `introTimeline.invariant.ts` verifica los INSTANTES; esto verifica lo que
 * pasa ENTRE los instantes, evaluando la secuencia en 601 puntos y en las once
 * calibraciones.
 *
 * ── El cruce de contraste, que es el problema difícil de S8d ───────────────
 *
 * "El fondo va de oscuro a claro **y** el logo de blanco a negro" tiene una
 * consecuencia inevitable: los dos arrancan en valores opuestos y terminan en
 * los opuestos cambiados, así que por el teorema del valor intermedio **son
 * iguales en algún instante**, y ahí el logo desaparece. No se puede evitar con
 * dos recorridos continuos; lo único elegible es cuánto dura.
 *
 * Por eso la tinta invierte en una ventana angosta y centrada. Acá se **mide**
 * cuántos cuadros a 60 fps quedan por debajo de un contraste utilizable, y se
 * exige que sigan siendo pocos. Si alguien ensancha `INK_FLIP_FRAC` para que la
 * transición "se vea más suave", esto se pone rojo.
 */

const EPS = 1e-12

/** Luminancia relativa (WCAG) de un color sRGB. */
function luminance(color: Srgb): number {
  return (
    0.2126 * srgbToLinear(color[0]) +
    0.7152 * srgbToLinear(color[1]) +
    0.0722 * srgbToLinear(color[2])
  )
}

/** Razón de contraste WCAG. 1 = indistinguibles. */
function contrast(a: Srgb, b: Srgb): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// ── Monotonicidad ───────────────────────────────────────────────────────────

section('cada canal avanza y nunca retrocede')

const CHANNELS: readonly (readonly [string, (t: IntroTimeline, p: number) => number])[] = [
  ['trazo', sampleStrokeDraw],
  ['relleno', sampleFill],
  ['fondo (color)', sampleBackgroundShift],
  ['tinta (color)', sampleInkFlip],
  ['relevo', sampleSwap],
  ['sale la letra', sampleLetterOut],
  ['acomodo', samplePlace],
]

for (const [name, phases] of CALIBRATIONS) {
  const t = buildTimeline(phases)
  for (const [label, sampler] of CHANNELS) {
    let ok = true
    let previous = 0
    sweep((p) => {
      const value = sampler(t, p)
      if (value < previous - EPS || value < 0 || value > 1) ok = false
      previous = value
    })
    check(`${name} — ${label} monótono y en [0,1]`, ok)
  }
}

// ── El orden de las dos salidas ─────────────────────────────────────────────

section('la letra se va ENTERA antes de que el fondo empiece')

for (const [name, phases] of CALIBRATIONS) {
  const t = buildTimeline(phases)
  let veilIntact = true
  let letterGone = true
  sweep((p) => {
    const time = introTimeS(t, p)
    // Mientras la letra todavía está, el fondo no se movió ni un poco.
    if (time <= t.veilOutStartS && sampleVeilOpacity(t, p) !== 1) veilIntact = false
    // Y cuando el fondo empieza, de la letra no queda nada.
    if (time >= t.veilOutStartS && sampleLineOpacity(t, p, t.sloganInS) !== 0) letterGone = false
  })
  check(`${name} — el velo está entero hasta que la letra se fue`, veilIntact)
  check(`${name} — no queda letra cuando el fondo arranca`, letterGone)
}

section('y el acomodamiento arranca con la pantalla limpia')

for (const [name, phases] of CALIBRATIONS) {
  const t = buildTimeline(phases)
  let quiet = true
  sweep((p) => {
    if (introTimeS(t, p) < t.placeStartS && samplePlace(t, p) !== 0) quiet = false
  })
  const atPlace = at(t, t.placeStartS)
  check(`${name} — el acomodamiento vale 0 hasta su instante`, quiet)
  check(
    `${name} — sin velo ni letra al arrancar`,
    sampleVeilOpacity(t, atPlace) === 0 && sampleLineOpacity(t, atPlace, t.sloganInS) === 0
  )
}

// ── Los dos colores ─────────────────────────────────────────────────────────

section('los extremos de la transformación son los tokens del sistema')

const d = buildTimeline(HOME_INTRO_PHASES)

check(
  'antes de la transformación: tinta clara sobre fondo oscuro',
  srgbToHex(sampleInkColor(d, at(d, d.colorStartS))) === INTRO_COLORS.inkOnDark.toLowerCase() &&
    srgbToHex(sampleBackgroundColor(d, at(d, d.colorStartS))) === INTRO_COLORS.bgDark.toLowerCase(),
  `${srgbToHex(sampleInkColor(d, 0))} sobre ${srgbToHex(sampleBackgroundColor(d, 0))}`
)
check(
  'después: tinta oscura sobre papel',
  srgbToHex(sampleInkColor(d, 1)) === INTRO_COLORS.inkOnLight.toLowerCase() &&
    srgbToHex(sampleBackgroundColor(d, 1)) === INTRO_COLORS.bgLight.toLowerCase(),
  `${srgbToHex(sampleInkColor(d, 1))} sobre ${srgbToHex(sampleBackgroundColor(d, 1))}`
)
check(
  'el fondo no se mueve antes de tiempo',
  sampleBackgroundShift(d, at(d, d.colorStartS)) === 0 &&
    sampleInkFlip(d, at(d, d.inkFlipStartS)) === 0
)

section('🔴 el cruce de contraste dura pocos cuadros')

/**
 * Cuántos cuadros a 60 fps tienen el logo indistinguible del fondo. Se mide
 * sobre la secuencia entera y con la razón de contraste de WCAG: 1,0 es
 * invisible, y por debajo de 1,25 no se puede leer una forma.
 */
const FRAME_S = 1 / 60
function lowContrastFrames(timeline: IntroTimeline, threshold: number): number {
  let frames = 0
  const total = Math.ceil(timeline.totalS / FRAME_S)
  for (let i = 0; i <= total; i += 1) {
    const p = (i * FRAME_S) / timeline.totalS
    if (contrast(sampleInkColor(timeline, p), sampleBackgroundColor(timeline, p)) < threshold) {
      frames += 1
    }
  }
  return frames
}

const invisible = lowContrastFrames(d, 1.1)
const weak = lowContrastFrames(d, 1.25)
check('indistinguible (contraste < 1,10) en 3 cuadros o menos', invisible <= 3, `${invisible} cuadros`)
check('flojo (contraste < 1,25) en 6 cuadros o menos', weak <= 6, `${weak} cuadros`)
check(
  'y el resto de la secuencia se lee',
  contrast(sampleInkColor(d, 0), sampleBackgroundColor(d, 0)) > 15 &&
    contrast(sampleInkColor(d, 1), sampleBackgroundColor(d, 1)) > 15,
  `${contrast(sampleInkColor(d, 0), sampleBackgroundColor(d, 0)).toFixed(1)}:1 al arrancar · ${contrast(sampleInkColor(d, 1), sampleBackgroundColor(d, 1)).toFixed(1)}:1 al terminar`
)

section('el relevo cae donde el contraste es mínimo')

let worstT = 0
let worst = Infinity
sweep((p) => {
  const value = contrast(sampleInkColor(d, p), sampleBackgroundColor(d, p))
  if (value < worst) {
    worst = value
    worstT = introTimeS(d, p)
  }
})
check(
  'el mínimo de contraste está adentro del relevo',
  worstT >= d.swapStartS && worstT <= d.swapEndS,
  `mínimo ${worst.toFixed(2)}:1 en ${s(worstT)} · relevo ${s(d.swapStartS)}–${s(d.swapEndS)}`
)

// ── Los bordes y las letras ─────────────────────────────────────────────────

section('los bordes de la secuencia')

check('en 0 no hay nada dibujado', sampleStrokeDraw(d, 0) === 0 && sampleFill(d, 0) === 0)
check('en 0 el fondo está entero', sampleVeilOpacity(d, 0) === 1)
check(
  'en 1 todo llegó',
  sampleStrokeDraw(d, 1) === 1 && sampleFill(d, 1) === 1 && samplePlace(d, 1) === 1
)
check(
  'en 1 no queda ni fondo ni texto',
  sampleVeilOpacity(d, 1) === 0 && sampleLineOpacity(d, 1, d.sloganInS) === 0
)

section('el texto está lleno durante la espera y toda la transformación')

let full = true
sweep((p) => {
  const time = introTimeS(d, p)
  if (time < d.fillEndS || time > d.colorEndS) return
  if (Math.abs(sampleLineOpacity(d, p, d.sloganInS) - 1) > 1e-9) full = false
  if (Math.abs(sampleLineOpacity(d, p, d.wordmarkInS) - 1) > 1e-9) full = false
})
check('las dos líneas en 1 entre el relleno y el fin del color', full)

section('los siete nombres de fase')

const NAMED: readonly (readonly [number, string])[] = [
  [0, 'trazo'],
  [d.strokeEndS + 0.01, 'relleno'],
  [d.fillEndS + 0.01, 'espera'],
  [d.colorStartS + 0.01, 'color'],
  [d.colorEndS + 0.01, 'letra'],
  [d.letterOutEndS + 0.01, 'fondo'],
  [d.placeStartS + 0.01, 'acomodo'],
]
for (const [time, name] of NAMED) {
  check(`en ${s(time)} la fase es "${name}"`, introPhaseName(d, at(d, time)) === name)
}

// ── Control negativo ────────────────────────────────────────────────────────

section('control negativo — la tinta invirtiendo tan lento como el fondo')

/**
 * El bug que S8d tuvo que esquivar, en su forma de datos: si la tinta usa la
 * ventana entera de la transformación en vez de su centro, el cruce se estira y
 * el logo queda invisible durante decenas de cuadros.
 */
const lento: IntroTimeline = { ...d, inkFlipStartS: d.colorStartS, inkFlipEndS: d.colorEndS }
const lentoFrames = lowContrastFrames(lento, 1.25)
check(
  'detecta el cruce estirado',
  lentoFrames > weak * 2,
  `${lentoFrames} cuadros flojos contra ${weak} con la ventana angosta`
)

report('introSampling')
