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
 * Por eso la tinta invierte en una ventana angosta y centrada. Acá se **mide en
 * segundos, por interpolación**, cuánto dura el tramo por debajo de un contraste
 * utilizable, y se exige que siga siendo corto. Si alguien ensancha
 * `INK_FLIP_FRAC` para que la transición "se vea más suave", esto se pone rojo —
 * y el control positivo del final lo **demuestra** en vez de prometerlo.
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

section('🔴 el cruce de contraste dura poco — medido en segundos')

/**
 * CUÁNTO DURA EL CRUCE, EN SEGUNDOS.
 *
 * ── Por qué esto ya no cuenta cuadros ──────────────────────────────────────
 *
 * Hasta S8e esto contaba cuántas muestras de una grilla de 60 fps caían por
 * debajo del umbral, y S8e midió por qué eso no servía: **la cuenta depende de
 * la FASE de la grilla y no solo del ancho de la ventana.** Barriendo
 * `INK_FLIP_FRAC` daba 1, 2, 1, 2, 2, 2, 3, 2 — no monótona en el ancho. Un
 * control que compara dos de esas cuentas compara ruido de cuantización, que es
 * por lo que `detecta el cruce estirado` quedó en rojo con `colorS` en 1,4 s.
 *
 * Acá se mide el mismo hecho **en segundos**: la longitud del conjunto
 * `{ t : contraste(t) < umbral }`. La grilla dejó de ser la unidad de la
 * respuesta y pasó a ser solo el *bracket*; el instante exacto en que el
 * contraste cruza el umbral sale de **interpolar linealmente entre las dos
 * muestras que lo encierran**. La medida es continua en las perillas, así que
 * sigue al diseño en vez de seguir a la grilla.
 *
 * **La propiedad que custodia NO cambió**, solo la unidad: los topes son los de
 * S8d traducidos — 3 y 6 cuadros a 60 fps son 0,050 s y 0,100 s.
 */
const FRAME_S = 1 / 60
/** El tope de "indistinguible" (< 1,10): los 3 cuadros de S8d. */
const INVISIBLE_CAP_S = 3 * FRAME_S
/** El tope de "flojo" (< 1,25): los 6 cuadros de S8d. */
const WEAK_CAP_S = 6 * FRAME_S
/**
 * Muestras por segundo del bracket: 67× más fina que la grilla de 60 fps que
 * esto usaba antes. No es la unidad de la respuesta —eso es lo que arregla la
 * interpolación— pero tiene que resolver el cruce más angosto de las once
 * calibraciones (1,3 ms, en `solo color brevísimo`), y la sección de
 * convergencia de más abajo lo verifica en vez de suponerlo.
 */
const CROSSING_HZ = 4_000

function contrastAtS(timeline: IntroTimeline, timeS: number): number {
  const progress = timeS / timeline.totalS
  return contrast(sampleInkColor(timeline, progress), sampleBackgroundColor(timeline, progress))
}

function lowContrastSeconds(
  timeline: IntroTimeline,
  threshold: number,
  hz: number = CROSSING_HZ
): number {
  const steps = Math.ceil(timeline.totalS * hz)
  const dt = timeline.totalS / steps
  let seconds = 0
  let previous = contrastAtS(timeline, 0) - threshold
  for (let i = 1; i <= steps; i += 1) {
    const value = contrastAtS(timeline, i * dt) - threshold
    if (previous < 0 && value < 0) {
      seconds += dt
    } else if (previous < 0 || value < 0) {
      // El umbral se cruza ADENTRO del paso. `root` es la fracción del paso a la
      // que cae, interpolando linealmente entre las dos muestras que lo
      // encierran: es lo único que la grilla de cuadros enteros no podía hacer.
      const root = previous / (previous - value)
      seconds += previous < 0 ? root * dt : (1 - root) * dt
    }
    previous = value
  }
  return seconds
}

/**
 * ⚠ **Por qué cada comprobación exige además que la medida sea MAYOR QUE CERO.**
 *
 * El mínimo de contraste de la secuencia es **exactamente 1,00 en toda
 * calibración**, por el mismo teorema del valor intermedio que crea el problema:
 * las dos luminancias arrancan intercambiadas y terminan intercambiadas, así que
 * se cruzan. O sea que el conjunto **nunca puede estar vacío**, y un 0 no sería
 * un cruce cortísimo: sería la grilla pasando por encima del cruce sin verlo.
 * Con el `> 0` adentro del predicado, **verde por vacío es imposible.**
 */
type Crossing = {
  readonly name: string
  readonly timeline: IntroTimeline
  readonly invisibleS: number
  readonly weakS: number
}

const CROSSINGS: readonly Crossing[] = CALIBRATIONS.map(([name, phases]) => {
  const timeline = buildTimeline(phases)
  return {
    name,
    timeline,
    invisibleS: lowContrastSeconds(timeline, 1.1),
    weakS: lowContrastSeconds(timeline, 1.25),
  }
})

for (const { name, invisibleS, weakS } of CROSSINGS) {
  check(
    `${name} — indistinguible (< 1,10) por ${s(INVISIBLE_CAP_S)} o menos`,
    invisibleS > 0 && invisibleS <= INVISIBLE_CAP_S,
    s(invisibleS)
  )
  check(
    `${name} — flojo (< 1,25) por ${s(WEAK_CAP_S)} o menos`,
    weakS > 0 && weakS <= WEAK_CAP_S,
    s(weakS)
  )
}

check(
  'y el resto de la secuencia se lee',
  contrast(sampleInkColor(d, 0), sampleBackgroundColor(d, 0)) > 15 &&
    contrast(sampleInkColor(d, 1), sampleBackgroundColor(d, 1)) > 15,
  `${contrast(sampleInkColor(d, 0), sampleBackgroundColor(d, 0)).toFixed(1)}:1 al arrancar · ${contrast(sampleInkColor(d, 1), sampleBackgroundColor(d, 1)).toFixed(1)}:1 al terminar`
)

section('y la grilla es bracket, no unidad: el instrumento converge')

/**
 * Si la respuesta dependiera de la grilla, seguiría siendo un conteo de muestras
 * disfrazado de segundos. Se remide con una grilla **5× más fina** y tiene que
 * dar lo mismo, en los dos casos que importan: el default —que es el número que
 * el reporte publica— y **el cruce más angosto de las once**, que es donde una
 * grilla demasiado gruesa fallaría primero. La tolerancia es una milésima de
 * cuadro a 60 fps.
 */
const TOLERANCE_S = FRAME_S / 1000
const tightest = CROSSINGS.reduce((a, b) => (b.invisibleS < a.invisibleS ? b : a))

for (const { name, timeline, invisibleS, weakS } of [CROSSINGS[0], tightest]) {
  const fineInvisibleS = lowContrastSeconds(timeline, 1.1, CROSSING_HZ * 5)
  const fineWeakS = lowContrastSeconds(timeline, 1.25, CROSSING_HZ * 5)
  check(
    `${name} — con la grilla 5× más fina da el mismo número`,
    Math.abs(fineInvisibleS - invisibleS) < TOLERANCE_S &&
      Math.abs(fineWeakS - weakS) < TOLERANCE_S,
    `Δ ${(Math.abs(fineInvisibleS - invisibleS) * 1e6).toFixed(2)} µs y ${(Math.abs(fineWeakS - weakS) * 1e6).toFixed(2)} µs · tolerancia ${(TOLERANCE_S * 1e6).toFixed(0)} µs`
  )
}

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

// ── Control positivo ────────────────────────────────────────────────────────

section('control positivo — el instrumento detecta el cruce estirado')

/**
 * **UNA COMPROBACIÓN QUE NO PUEDE FALLAR NO COMPRUEBA NADA**, y un instrumento
 * que mide por interpolación puede pasar por construcción si nunca se lo enfrenta
 * a un cruce que SÍ viola la propiedad. Antes de creerle que el cruce real es
 * corto, hay que verlo rechazar uno estirado.
 *
 * El estirado es el bug que S8d tuvo que esquivar, en su forma de datos: si la
 * tinta usa la ventana entera de la transformación en vez de su centro, las dos
 * luminancias se acompañan y el logo queda invisible mucho más tiempo.
 *
 * ⚠ **Lo que el instrumento nuevo dio vuelta.** El control viejo afirmaba
 * `lentoFrames > weak * 2`, y S8e lo dejó en rojo culpando al ruido de
 * cuantización. Medido en segundos el ruido efectivamente desaparece — y con él
 * la afirmación: **el factor real del estirado es ×1,863, no ×2.** No es una
 * tolerancia aflojada para que pase; es el número que el estirado tiene, y sale
 * idéntico en las once calibraciones porque es un cociente de velocidades y no
 * depende de `colorS`. Lo que se verifica ahora es esa **constancia**, que es más
 * fuerte que un umbral elegido a ojo.
 *
 * ⚠ **Y el segundo hallazgo: sobre el `colorS` que este repo embarca (1,4 s),
 * NINGÚN ancho de `INK_FLIP_FRAC` alcanza para violar el tope.** El estirado
 * máximo da 0,070 s contra un tope de 0,100 s, y ensanchar más allá de la
 * ventana entera satura en 0,075 s. El tope empieza a morder con `colorS` ≈ 2,0 s
 * — y ahí sí muerde, con una calibración que este repo ya embarca.
 *
 * Se verifican, entonces, tres cosas:
 *
 *  1. El estirado **alarga** el cruce, por el mismo factor en las once.
 *  2. Ese estirado **viola el tope** donde el color es largo: el tope muerde, y
 *     el punto de quiebre queda acotado por los dos lados. Si el instrumento
 *     devolviera números chicos por construcción, acá se caería.
 *  3. Y la medida es **monótona en el ancho de la ventana**: al ensanchar la
 *     inversión el cruce crece, sin excepciones. Eso es exactamente lo que el
 *     conteo de cuadros enteros NO hacía —daba 1, 2, 1, 2, 2, 2, 3, 2— y es la
 *     prueba de que esto sigue al diseño y no a la fase de la grilla.
 *
 * La fracción real no se copia de `INK_FLIP_FRAC`: se **lee del timeline**, así
 * que el barrido arranca de lo que el repo embarca de verdad.
 */
const stretch = (timeline: IntroTimeline): IntroTimeline => ({
  ...timeline,
  inkFlipStartS: timeline.colorStartS,
  inkFlipEndS: timeline.colorEndS,
})

type Stretched = {
  readonly name: string
  readonly narrowS: number
  readonly stretchedS: number
}

const STRETCHED: readonly Stretched[] = CROSSINGS.map(({ name, timeline, weakS }) => ({
  name,
  narrowS: weakS,
  stretchedS: lowContrastSeconds(stretch(timeline), 1.25),
}))

const factors = STRETCHED.map((row) => row.stretchedS / row.narrowS)
const factorSpread = Math.max(...factors) - Math.min(...factors)
check(
  'la tinta a la par del fondo alarga el cruce, y por el MISMO factor en las once',
  factors.every((factor) => factor > 1) && factorSpread < 1e-3,
  `×${Math.min(...factors).toFixed(3)} · dispersión ${factorSpread.toExponential(1)}`
)

const violators = STRETCHED.filter((row) => row.stretchedS > WEAK_CAP_S)
check(
  'y donde el color es largo ese estirado VIOLA el tope: el tope muerde',
  violators.length > 0,
  `${violators.map((row) => `${row.name} ${s(row.stretchedS)}`).join(' · ')} contra el tope de ${s(WEAK_CAP_S)}`
)

const stretchedAtColorS = (colorS: number): number =>
  lowContrastSeconds(stretch(buildTimeline({ ...HOME_INTRO_PHASES, colorS })), 1.25)
const belowBite = stretchedAtColorS(1.8)
const aboveBite = stretchedAtColorS(2.2)
check(
  'y el punto de quiebre está acotado por los dos lados, no estimado',
  belowBite <= WEAK_CAP_S && aboveBite > WEAK_CAP_S,
  `colorS 1,8 s → ${s(belowBite)} pasa · 2,2 s → ${s(aboveBite)} falla · tope ${s(WEAK_CAP_S)}`
)

const colorSpanS = d.colorEndS - d.colorStartS
const colorMidS = (d.colorStartS + d.colorEndS) / 2
const inkFrac = (d.inkFlipEndS - d.inkFlipStartS) / colorSpanS

let widensMonotonically = true
let previousS = 0
const trace: string[] = []
for (const frac of [inkFrac, 0.3, 0.4, 0.5, 0.7, 1]) {
  const halfS = (colorSpanS * frac) / 2
  const widened: IntroTimeline = {
    ...d,
    inkFlipStartS: colorMidS - halfS,
    inkFlipEndS: colorMidS + halfS,
  }
  const value = lowContrastSeconds(widened, 1.25)
  if (value <= previousS) widensMonotonically = false
  previousS = value
  trace.push(`${(100 * frac).toFixed(1)}%→${(value * 1000).toFixed(1)}ms`)
}
check('el cruce CRECE con el ancho de la ventana, sin excepción', widensMonotonically, trace.join(' · '))

report('introSampling')
