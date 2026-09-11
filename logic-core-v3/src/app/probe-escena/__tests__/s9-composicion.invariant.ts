/**
 * COMPROBACIONES DE S9 · el recorrido definitivo contra la escena.
 *
 *     npx tsx src/app/probe-escena/__tests__/s9-composicion.invariant.ts
 *
 * La otra mitad de `s9-recorrido.invariant.ts`: ésta no mira el dato, mira lo
 * que ese dato produce **dentro del espacio que S5 construyó**.
 *
 *   1. Que NADA se cruce entre la cámara y el logo — con su control positivo, sin
 *      el cual el chequeo quedaría verde por vacío (S10).
 *   2. El corredor que la escena vaciada le deja al efecto Star Wars.
 *   3. La amplitud y la velocidad, contra los otros cuatro recorridos.
 */
import { CHOREO_KEYFRAMES, CHOREO_TRAMOS } from '@/app/v3/_lib/escena/choreography'
import { CHOREO_VARIANTS } from '../_components/choreographyVariants'
import { VARIANT_CALIBRADA_KEYFRAMES } from '../_components/variantCalibrada'
import { cameraAt, check, emptyPose, halfFovDeg, makeTrack, report, section, speedAt } from './harness'
import {
  SCENE_OCCLUDERS,
  backCone,
  backDepth,
  logoOcclusionAt,
  syntheticOccluder,
} from './occlusion'

const ASPECT = 16 / 9
const track = makeTrack(CHOREO_KEYFRAMES)

// ── 4 · Nada se cruza entre la cámara y el logo ─────────────────────────────

section('El instrumento de oclusión DETECTA una oclusión')

/**
 * ⚠️ **Este control existe porque el de abajo no puede fallar solo.**
 *
 * Hasta S9 la escena tenía once planos suspendidos y acá se verificaba que el
 * entorno cruzara por delante del logo entre tres y seis veces — eso era una
 * afirmación con contenido. S10 borró los planos, así que la afirmación se dio
 * vuelta: ahora hay que verificar que **nada** se cruce.
 *
 * Y "nada se cruza" contra una escena sin geometría es verdadero por vacío: el
 * chequeo pasaría igual si el instrumento estuviera roto, y seguiría pasando el
 * día que alguien agregue una masa que sí tape el logo. Por eso primero se le
 * pone al instrumento una losa sintética delante y se comprueba que la ve.
 */
{
  // Una losa encarada al centro, en el azimut del hero y a la mitad de su
  // distancia: no hay forma de que no se cruce.
  const blocker = [syntheticOccluder(0, 9)]
  const occluded = logoOcclusionAt(track, 0, blocker)
  check(
    'control positivo — con una losa sintética delante, la oclusión del logo es TOTAL',
    occluded === 1,
    `${(occluded * 100).toFixed(0)}% de la silueta tapada por ${blocker[0].label}`
  )

  // Una losa chica y descentrada tapa parte y no todo: verifica que el
  // instrumento discrimina y no devuelve 0 ó 1 y nada más.
  const partial = logoOcclusionAt(track, 0, [syntheticOccluder(0, 9, 3.2, 11)])
  check(
    'control positivo — con una losa angosta tapa una PARTE: el instrumento discrimina',
    partial > 0 && partial < 1,
    `${(partial * 100).toFixed(0)}% de la silueta`
  )

  const cone = backCone(track, 0.625, [syntheticOccluder(15, 20)])
  const free = backCone(track, 0.625)
  check(
    'control positivo — una losa en el fondo le come el cono libre',
    cone < free,
    `±${cone.toFixed(0)}° con la losa contra ±${free.toFixed(1)}° sin ella`
  )
}

section('La escena vaciada: el logo nunca queda tapado')

check(
  'la lista de ocluyentes de la escena está vacía, y es la intención',
  SCENE_OCCLUDERS.length === 0,
  'S10 borró los once planos suspendidos, la retícula aérea y los pilares'
)

const N = 2000
let covered = 0
for (let i = 0; i <= N; i += 1) {
  if (logoOcclusionAt(track, i / N) > 0) covered += 1
}
check(
  'nada cruza por delante del logo en ningún punto del recorrido',
  covered === 0,
  `0% del recorrido, contra el 9,7% en cinco pasadas que publicó S9`
)
check(
  'y tampoco en las ocho poses',
  CHOREO_KEYFRAMES.every((keyframe) => logoOcclusionAt(track, keyframe.at) === 0),
  'oclusión 0% en las ocho entradas'
)

// ── 5 · El corredor de Trabajos (la plataforma del Star Wars) ───────────────

section('El corredor que hereda el efecto Star Wars')

/**
 * ⚠️ **S10 invalidó la nota de §7.1 de S9, y ésta es la cifra nueva.**
 *
 * S9 publicó que el corredor libre era exclusivo de Trabajos y Números (±29°,
 * contra ±10° en el hero y ±0° en los otros tres): el límite eran los planos. Sin
 * ellos, **el cuadro entero queda libre hacia el fondo en los SEIS tramos**, así
 * que dejó de ser una propiedad de Trabajos y pasó a ser una propiedad de la
 * escena.
 *
 * Lo que sí sigue variando por pose es la PROFUNDIDAD, y ahora la limitan dos
 * cosas distintas: la envolvente cuando la cámara mira nivelada o hacia arriba, y
 * **el piso** cuando mira hacia abajo. En el hero y en Números el eje óptico se
 * clava en el papel a 13,8 y a 10,0 unidades, mucho antes de llegar a la pared.
 */
let worstCone = 99
let worstAt = 0
for (let i = 0; i <= 240; i += 1) {
  const progress = i / 240
  const cone = backCone(track, progress)
  if (cone < worstCone) {
    worstCone = cone
    worstAt = progress
  }
}
check(
  'el cuadro entero queda libre hacia el fondo en TODO el recorrido, no solo en Trabajos',
  worstCone >= halfFovDeg(ASPECT).h - 1e-9,
  `cono libre mínimo ±${worstCone.toFixed(1)}° (medio cuadro horizontal es ±${halfFovDeg(ASPECT).h.toFixed(1)}°), peor punto p=${worstAt.toFixed(3)}`
)

const trabajos = CHOREO_TRAMOS.find((tramo) => tramo.name === 'trabajos')!
const depths = CHOREO_TRAMOS.map((tramo) => {
  const middle = (tramo.from + tramo.to) / 2
  const probe = backDepth(track, middle)
  return `${tramo.name} ${probe.depth.toFixed(1)} (${probe.limit})`
})
const trabajosDepth = backDepth(track, (trabajos.from + trabajos.to) / 2)
check(
  'y la profundidad del corredor la limita la envolvente o el piso, nunca una masa',
  trabajosDepth.depth > 15,
  depths.join(' · ')
)

// ── 6 · Amplitud y velocidad ────────────────────────────────────────────────

section('Amplitud: el mix contra los cinco recorridos')

function amplitude(keyframes: readonly { pose: { height: number; distance: number } }[]) {
  let jump = 0
  for (let i = 1; i < keyframes.length; i += 1) {
    jump = Math.max(jump, Math.abs(keyframes[i].pose.height - keyframes[i - 1].pose.height))
  }
  const distances = keyframes.map((keyframe) => keyframe.pose.distance)
  const near = Math.min(...distances)
  return { jump, near, span: Math.max(...distances) - near }
}

const mine = amplitude(CHOREO_KEYFRAMES)
const others = CHOREO_VARIANTS.filter((variant) => variant.id !== 'definitiva').map((variant) => ({
  label: variant.label,
  ...amplitude(variant.keyframes),
}))
check(
  'el salto de altura entre poses vecinas es el más grande de los cinco',
  others.every((other) => mine.jump > other.jump),
  `${mine.jump.toFixed(1)} contra ${others.map((o) => `${o.label} ${o.jump.toFixed(1)}`).join(' · ')}`
)
/**
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠️ **B13 · ESTA AFIRMACIÓN PERDIÓ SU OBJETO, Y SE REEMPLAZA POR LA QUE EL
 * SPRINT SÍ COMPRÓ.** Autorizado por el dueño del proyecto al cerrar la PARADA 1
 * de B13; se REESCRIBE contra la propiedad nueva, no se afloja ni se borra.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * **Qué custodiaba.** «Y el rango de distancias también [es el más grande de los
 * cinco]»: con las poses de S9 el track iba de **9 a 27**, o sea 18,0 de rango,
 * contra los 17,5 de la arquitectónica. Ganaba por medio punto, y junto con el
 * salto de altura era la evidencia de que el mix elegido tiene MÁS amplitud que
 * cualquiera de los cuatro candidatos — que es de lo que trata esta sección.
 *
 * **Por qué cambió.** B13 alejó las dos poses más cercanas —`quiénes somos` de
 * 11,5 a 14 y `demos` de 9 a 14— porque el logo llegaba al **36,10 % del cuadro**
 * en 1025×900 y el humano pidió bajarlo a ~15 %. El extremo CERCANO del rango es
 * exactamente lo que ese pedido mueve: el mínimo pasa de 9 a 14 y el rango de
 * **18,0 a 13,0**, así que la arquitectónica (17,5) lo pasa.
 *
 * **Por qué no alcanza con actualizar la cifra.** «Rango grande» era un proxy de
 * «la cámara recorre», y el recorrido no se acortó: `s9-composicion` mide dos
 * líneas más abajo que la cámara hace **121,7 unidades de mundo** contra las
 * 119,1 de la calibrada. Lo que se comprimió es el rango porque su punta cercana
 * se retiró A PROPÓSITO. Afirmar «el rango es el mayor» con otro número sería
 * afirmar lo contrario de lo que el sprint hizo.
 *
 * **Contra qué compara ahora, y por qué ésa es la comparación que vale.** Contra
 * los mismos cuatro candidatos y sobre el mismo eje —la distancia— pero en el
 * extremo que B13 movió: **nuestro punto MÁS CERCANO es el más lejano de los
 * cinco.** Ninguna de las otras cuatro coreografías mantiene la cámara tan lejos
 * del logo en su acercamiento máximo, y eso es literalmente «el objeto no tapa el
 * cuadro», que es el pedido. La amplitud sigue afirmada arriba, sobre el eje que
 * no se tocó: el salto de altura de 12,6 sigue siendo el mayor de los cinco.
 */
check(
  'B13 — y la cámara nunca se acerca tanto como en ninguno de los otros cuatro: nuestro MÍNIMO es el mayor de los cinco',
  others.every((other) => mine.near > other.near),
  `${mine.near.toFixed(1)} contra ${others.map((o) => `${o.label} ${o.near.toFixed(1)}`).join(' · ')}`
)
check(
  '  y el rango de distancias YA NO es el mayor, porque se retiró su punta cercana: se publica, no se afirma',
  mine.span < Math.max(...others.map((o) => o.span)),
  `${mine.span.toFixed(1)} (era 18,0 con las poses de S9) contra ${others.map((o) => `${o.label} ${o.span.toFixed(1)}`).join(' · ')}`
)

section('Velocidad: menos pico y menos tirón que la calibrada')

function peak(keyframes: readonly (typeof CHOREO_KEYFRAMES)[number][]): number {
  const built = makeTrack(keyframes)
  let best = 0
  for (let i = 0; i <= 2000; i += 1) best = Math.max(best, speedAt(built, i / 2000))
  return best
}
function worstJump(keyframes: readonly (typeof CHOREO_KEYFRAMES)[number][]): number {
  const built = makeTrack(keyframes)
  let worst = 0
  for (let i = 1; i < keyframes.length - 1; i += 1) {
    const at = keyframes[i].at
    worst = Math.max(worst, Math.abs(speedAt(built, at + 1e-3) - speedAt(built, at - 1e-3)))
  }
  return worst
}

const peakMix = peak(CHOREO_KEYFRAMES)
const peakCalibrada = peak(VARIANT_CALIBRADA_KEYFRAMES)
check(
  'el pico de velocidad instantánea baja a menos de la mitad',
  peakMix < peakCalibrada / 2,
  `${peakCalibrada.toFixed(1)} → ${peakMix.toFixed(1)} alturas de cuadro por unidad de progreso`
)

const jumpMix = worstJump(CHOREO_KEYFRAMES)
const jumpCalibrada = worstJump(VARIANT_CALIBRADA_KEYFRAMES)
check(
  'y el mayor tirón entre segmentos, también a menos de la mitad',
  jumpMix < jumpCalibrada / 2,
  `${jumpCalibrada.toFixed(1)} → ${jumpMix.toFixed(1)}`
)

/**
 * ⚠️ **El contrapeso, escrito como comprobación para que no se pierda.**
 *
 * Bajar el pico es una mejora de suavidad, no de amplitud: lo que se percibe es
 * velocidad instantánea, y este recorrido es más amplio y más lento a la vez.
 * Si en la grabación se siente lento, **la palanca es reducir pantallas de
 * scroll**, no volver a meter tirones. Con las ocho de hoy, el recorrido entero
 * mide esto:
 */
let travelled = 0
const pose = emptyPose()
let previous = cameraAt(track, 0, ASPECT, pose).position
for (let i = 1; i <= 2000; i += 1) {
  const current = cameraAt(track, i / 2000, ASPECT, pose).position
  travelled += Math.hypot(
    current[0] - previous[0],
    current[1] - previous[1],
    current[2] - previous[2]
  )
  previous = current
}
let travelledCalibrada = 0
const calibradaTrack = makeTrack(VARIANT_CALIBRADA_KEYFRAMES)
previous = cameraAt(calibradaTrack, 0, ASPECT, pose).position
for (let i = 1; i <= 2000; i += 1) {
  const current = cameraAt(calibradaTrack, i / 2000, ASPECT, pose).position
  travelledCalibrada += Math.hypot(
    current[0] - previous[0],
    current[1] - previous[1],
    current[2] - previous[2]
  )
  previous = current
}
check(
  'la cámara recorre el MISMO camino que en la calibrada',
  Math.abs(travelled - travelledCalibrada) / travelledCalibrada < 0.05,
  `${travelled.toFixed(1)} contra ${travelledCalibrada.toFixed(1)} unidades de mundo — o sea que el pico no bajó recortando recorrido`
)

/**
 * Dónde se gasta ese camino: la fracción del total que la cámara recorre
 * dentro de la pantalla más cargada. **Es el número que explica el pico.**
 */
function busiestScreen(keyframes: readonly (typeof CHOREO_KEYFRAMES)[number][]): number {
  const built = makeTrack(keyframes)
  const steps = 2000
  const scratch = emptyPose()
  const lengths: number[] = []
  let last = cameraAt(built, 0, ASPECT, scratch).position
  for (let i = 1; i <= steps; i += 1) {
    const point = cameraAt(built, i / steps, ASPECT, scratch).position
    lengths.push(Math.hypot(point[0] - last[0], point[1] - last[1], point[2] - last[2]))
    last = point
  }
  const totalLength = lengths.reduce((a, b) => a + b, 0)
  const window = steps / 8
  let best = 0
  for (let start = 0; start + window <= steps; start += 1) {
    let sum = 0
    for (let i = start; i < start + window; i += 1) sum += lengths[i]
    if (sum > best) best = sum
  }
  return best / totalLength
}
const mixBusiest = busiestScreen(CHOREO_KEYFRAMES)
const calibradaBusiest = busiestScreen(VARIANT_CALIBRADA_KEYFRAMES)
check(
  'pero repartido: la pantalla más cargada se lleva menos del recorrido',
  mixBusiest < calibradaBusiest,
  `${(mixBusiest * 100).toFixed(0)}% del camino en su pantalla más cargada, contra ${(calibradaBusiest * 100).toFixed(0)}% en la calibrada`
)

report('s9 · el recorrido contra la escena')
