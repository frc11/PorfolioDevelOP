import { PARTICLE_NEAR_COLOR } from '@/app/probe-escena/_components/probeParticles'
import { PAPER_COLOR } from '@/app/probe-escena/_components/probeScene'
import { CELOSIA_BAR, celosiaSkyFactor } from '@/app/probe-escena/_components/probeCelosia'
import { shadeSurface } from '@/app/probe-escena/__tests__/shading'
import {
  MOTION_DURATION,
  REVEAL_STAGGER_S,
} from '@/components/design-system/motion/tokens'

import { CALIBRATIONS, check, report, s, section } from './introChecks'
import { DUST_MATERIAL_ALPHA } from './introParticles'
import { buildIntroParticles } from './introParticleField'
import { over } from './introParticleProbe'
import { crossingS, introLegibility, sceneContrastAt } from './introLegibilityProbe'
import {
  introParticleWindows,
  sampleMote,
  sampleParticleIn,
  sampleParticleOut,
} from './introParticleTiming'
import { hexToSrgb, type Srgb } from './introShading'
import { HOME_INTRO_TIMELINE, buildTimeline, type IntroTimeline } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DEL RITMO — **el número que decide si el sprint funciona.**
 *
 *     npx tsx src/components/layout/home-intro/introParticleTiming.invariant.ts
 *
 * ════════════════════════════════════════════════════════════════════════════
 * EN NINGÚN INSTANTE PUEDEN SER LEGIBLES DOS POBLACIONES DE PARTÍCULAS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * El mecanismo entero se apoya en eso y en nada más. Se mide **en segundos**,
 * con el criterio y el umbral con los que `introSampling.invariant.ts` mide el
 * cruce de tinta: la razón de contraste de WCAG, y 1,10 como el punto donde algo
 * deja de distinguirse del fondo. El umbral es conservador en las DOS
 * direcciones — les exige a las del intro bajar de un contraste con el que un
 * logo entero ya no se ve, y declara legibles a las de la escena apenas lo
 * cruzan. El instrumento vive en `introLegibilityProbe.ts`.
 */

const W = 1440
const H = 810
const T = HOME_INTRO_TIMELINE
const WIN = introParticleWindows(T)
const FIELD = buildIntroParticles(W, H)

// ── 1 · Las dos ventanas, derivadas de instantes que ya existían ───────────

section('1 · Las dos ventanas salen del timeline, no de una perilla nueva')

check(
  'aparecen con la transformación de color',
  WIN.inStartS === T.colorStartS,
  `${s(WIN.inStartS)} — el mismo instante en que el fondo empieza a aclararse`
)
check(
  'y la densidad está completa ANTES de que se vaya la letra',
  WIN.inEndS < T.letterOutStartS,
  `${s(WIN.inEndS)} contra ${s(T.letterOutStartS)} · ${s(T.letterOutStartS - WIN.inEndS)} de campo quieto`
)
check(
  'bajan cuando se va la letra',
  WIN.outStartS === T.letterOutStartS,
  `${s(WIN.outStartS)}`
)
check(
  '🔴 y el campo está afuera ANTES de que el fondo empiece a disolverse',
  WIN.outEndS < T.veilOutStartS,
  `${s(WIN.outEndS)} contra ${s(T.veilOutStartS)} · ${s(T.veilOutStartS - WIN.outEndS)} de margen`
)

section('y las dos propiedades valen en las once calibraciones')

let densityBefore = true
let outBeforeVeil = true
let worstMargin = Infinity
for (const [, phases] of CALIBRATIONS) {
  const timeline = buildTimeline(phases)
  const windows = introParticleWindows(timeline)
  if (!(windows.inEndS < timeline.letterOutStartS)) densityBefore = false
  if (!(windows.outEndS < timeline.veilOutStartS)) outBeforeVeil = false
  worstMargin = Math.min(worstMargin, timeline.veilOutStartS - windows.outEndS)
}
check('la densidad completa siempre cae antes de que se vaya la letra', densityBefore)
check(
  'y el campo siempre está afuera antes del fondo',
  outBeforeVeil,
  `peor margen de las once: ${s(worstMargin)}`
)

/**
 * Control negativo: una derivación que cerrara la salida **junto** con la letra
 * —o sea sin el respiro— tocaría el instante en que el velo arranca, y esta
 * comprobación tiene que verlo. Es la forma de datos del bug que el sprint
 * prohíbe.
 */
const sinRespiro = (timeline: IntroTimeline) => timeline.letterOutEndS < timeline.veilOutStartS
check(
  'control negativo — sin el respiro, la salida toca el arranque del velo',
  !sinRespiro(T),
  `${s(T.letterOutEndS)} es exactamente ${s(T.veilOutStartS)}`
)

// ── 2 · El escalonado ───────────────────────────────────────────────────────

section('2 · Escalonadas de verdad, y cada una con un gesto y no un parpadeo')

/**
 * ⚠ **Estas dos corren solo sobre el DEFAULT, fuera de las once.** No son
 * propiedades: son cotas de lectura. `solo color brevísimo` (colorS 0,12) y
 * `corto` (letterOutS 0,3) las violan las dos, y con razón — con una
 * transformación de color de 0,12 s no hay nada que se lea bien. Es el mismo
 * criterio con el que el peso del acomodamiento quedó fuera de `PROPERTIES`.
 */
check(
  'el desfase de entrada se lee como secuencia, no como bloque',
  WIN.inStaggerS > REVEAL_STAGGER_S,
  `${s(WIN.inStaggerS)} contra los ${s(REVEAL_STAGGER_S)} que el sistema llama perceptible`
)
check(
  'y el de salida también',
  WIN.outStaggerS > REVEAL_STAGGER_S,
  `${s(WIN.outStaggerS)}`
)
check(
  'cada mota tarda en aparecer más que un `micro`',
  WIN.inDurationS > MOTION_DURATION.micro,
  `${s(WIN.inDurationS)} contra ${s(MOTION_DURATION.micro)}`
)
check(
  'y en caer también',
  WIN.outDurationS > MOTION_DURATION.micro,
  `${s(WIN.outDurationS)}`
)
const halfway = (WIN.inStartS + WIN.inDurationS / 2) / T.totalS
check(
  'la primera y la última no comparten ventana: hay orden',
  sampleParticleIn(T, halfway, 0) > 0.5 && sampleParticleIn(T, halfway, 1) === 0,
  `a mitad de la entrada de la primera: ${(sampleParticleIn(T, halfway, 0) * 100).toFixed(0)}% contra ${(sampleParticleIn(T, halfway, 1) * 100).toFixed(0)}% de la última`
)

// ── 3 · Los muestreadores ───────────────────────────────────────────────────

section('3 · Cada mota entra una vez, sale una vez, y no vuelve')

let monotone = true
for (const phase of [0, 0.5, 1]) {
  let previousIn = -Infinity
  let previousOut = -Infinity
  for (let i = 0; i <= 600; i += 1) {
    const p = i / 600
    const entered = sampleParticleIn(T, p, phase)
    const gone = sampleParticleOut(T, p, phase)
    if (entered < previousIn - 1e-12 || gone < previousOut - 1e-12) monotone = false
    previousIn = entered
    previousOut = gone
  }
}
check('las dos rampas solo avanzan', monotone)
check(
  'antes de la transformación no hay una sola mota',
  FIELD.motes.every((m) => sampleMote(T, (WIN.inStartS - 0.001) / T.totalS, m).alpha === 0)
)
check(
  'y cuando el campo terminó de bajar tampoco',
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

// ── 4 · 🔴 La legibilidad, y el número que decide ──────────────────────────

section('4 · 🔴 La superposición: cuándo deja de verse una y cuándo se ve la otra')

const { everLegible, peakContrast, firstLegibleS, lastLegibleS, travelAtLast } =
  introLegibility(T, WIN, FIELD.motes)

/**
 * 🔴 **CONTROL POSITIVO, ANTES DEL NÚMERO.** "Ninguna del intro es legible
 * después de X" es verde por vacío si NINGUNA fue legible nunca. Lo primero que
 * se verifica es que el instrumento las vea.
 */
check(
  'control positivo — las del intro SÍ son legibles mientras tienen que serlo',
  everLegible === FIELD.motes.length && peakContrast > 2,
  `las ${everLegible} cruzan el umbral · contraste máximo ${peakContrast.toFixed(2)}:1`
)
check(
  'la primera se vuelve legible apenas arranca la transformación de color',
  firstLegibleS > T.colorStartS && firstLegibleS < T.colorStartS + 0.1,
  `${s(firstLegibleS)} — ${((firstLegibleS - T.colorStartS) * 1000).toFixed(0)} ms después`
)

/**
 * Y del otro lado: **cuándo se vuelve legible la primera de la ESCENA**, vista a
 * través del velo que se disuelve.
 *
 * Se toma el par de contraste MÁXIMO posible —la mota cercana del polvo sobre el
 * papel iluminado de la escena—, que da el instante más TEMPRANO en que algo de
 * la escena puede leerse. Cualquier otro par cruza el umbral después.
 */
const litPaper = shadeSurface(PAPER_COLOR, [0, 1, 0], { progress: 0, cameraAzimuthDeg: 0, cameraHeight: 6.4 }, 19, 1, celosiaSkyFactor(CELOSIA_BAR)) / 255
const paper: Srgb = [litPaper, litPaper, litPaper]
const sceneMote = over(hexToSrgb(PARTICLE_NEAR_COLOR), DUST_MATERIAL_ALPHA, paper)

const sceneAt = (timeS: number) => sceneContrastAt(T, sceneMote, paper, timeS)
const sceneFirstS = crossingS(sceneAt, T.veilOutStartS, T.veilOutEndS, false)

check(
  'control positivo — las de la escena SÍ se vuelven legibles al irse el velo',
  Number.isFinite(sceneFirstS) && sceneAt(T.veilOutEndS) > 2,
  `${s(sceneFirstS)} · con el velo ya ido, ${sceneAt(T.veilOutEndS).toFixed(2)}:1`
)
check(
  'y antes de que el velo arranque no aportan NADA: el contraste es exactamente 1',
  sceneAt(T.veilOutStartS) === 1,
  'el velo está en opacidad 1 hasta ese instante'
)

check(
  '🔴 la última del intro deja de ser legible ANTES que la primera de la escena',
  lastLegibleS < sceneFirstS,
  `${s(lastLegibleS)} contra ${s(sceneFirstS)} — ${((sceneFirstS - lastLegibleS) * 1000).toFixed(1)} ms de margen`
)
check(
  'y ese margen no es de suerte: la escena se vuelve legible muy pronto',
  sceneFirstS - T.veilOutStartS < 0.05,
  `${((sceneFirstS - T.veilOutStartS) * 1000).toFixed(1)} ms después de que el velo arranca — por eso la salida NO podía derramarse`
)

/**
 * Control negativo: si el campo se fuera **con** el velo en vez de antes —que es
 * la forma obvia y la que el sprint prohíbe—, las dos poblaciones se solaparían,
 * y esta comprobación tiene que decirlo.
 */
const conDerrame = lastLegibleS + (T.veilOutEndS - T.veilOutStartS) * 0.5
check(
  'control negativo — con la salida derramada adentro del velo, se solapan',
  conDerrame > sceneFirstS,
  `saldría a ${s(conDerrame)}, ${((conDerrame - sceneFirstS) * 1000).toFixed(0)} ms DESPUÉS de que la escena ya se lee`
)

// ── 5 · Bajan de verdad ─────────────────────────────────────────────────────

section('5 · Bajan de verdad: no se desvanecen en el lugar')

const travelSorted = [...travelAtLast].sort((a, b) => a - b)
const medianTravel = travelSorted[Math.floor(travelSorted.length / 2)]
check(
  'al dejar de ser legible, la mota ya recorrió el grueso de su caída',
  medianTravel > 0.5,
  `mediana ${(medianTravel * 100).toFixed(0)}% del recorrido · máximo ${(travelSorted[travelSorted.length - 1] * 100).toFixed(0)}%`
)
check(
  'y el apagado cuelga del MISMO número que el desplazamiento',
  FIELD.motes.every((mote) => {
    const p = (WIN.outStartS + WIN.outDurationS * 0.5) / T.totalS
    const gone = sampleParticleOut(T, p, mote.phase)
    const sample = sampleMote(T, p, mote)
    return Math.abs(sample.xPx - (mote.xPx + mote.dxPx * gone)) < 1e-9
  }),
  'posición y opacidad no pueden desfasarse: son el mismo valor'
)

report('introParticleTiming')
