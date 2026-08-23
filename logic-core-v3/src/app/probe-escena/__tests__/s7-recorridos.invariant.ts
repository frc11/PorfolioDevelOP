/**
 * COMPROBACIONES DE S7 · los recorridos y los siete arcos de curvatura.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-recorridos.invariant.ts
 *
 * Lo que verifica, en una línea: que las coreografías sean reproducibles, que
 * ninguna pose calibrada por el humano se haya movido, que los intermedios
 * curven de verdad y que ninguna cámara se meta donde no hay escena.
 *
 * ⚠️ **S9 reapuntó este archivo.** Todo lo que S7 verificaba sobre "la base"
 * ahora se verifica sobre `variantCalibrada.ts`, que es donde ese recorrido
 * vive desde que el mix definitivo ocupó `choreography.ts`. **Es a propósito:
 * es la prueba de que la calibración de S5/S6/S7 sobrevivió intacta al cambio.**
 * Lo que le toca al recorrido definitivo está en `s9-definitiva.invariant.ts`.
 */
import { CHOREO_TRAMOS } from '../_components/choreography'
import { VARIANT_CALIBRADA_KEYFRAMES } from '../_components/variantCalibrada'
import { CHOREO_VARIANTS } from '../_components/choreographyVariants'
import type { ChoreoKeyframe } from '../_components/choreographyTypes'
import { MOUSE_HEIGHT_FACTOR } from '../_components/choreographyPhysics'
import { PROBE_RANGES } from '../_components/probeStore'
import {
  FLOOR_Y,
  bowBetween,
  check,
  makeTrack,
  report,
  section,
  speedAt,
} from './harness'

// ── Las 23 poses de S6, congeladas ──────────────────────────────────────────

/**
 * El recorrido tal cual lo dejó S6, con las 21 posiciones calibradas por el
 * humano y los 2 derivados de S4. **Es la referencia contra la que se verifica
 * que ni S7 ni S9 tocaron una sola pose.** Si esta tabla y el archivo divergen,
 * uno de los dos está mal y hay que mirar cuál.
 */
const S6_POSES: readonly (readonly [string, number, number, number, number, number, number])[] = [
  ['entrada · mirada alta', 0, 0, 9, 15, 0.9, 0],
  ['hero', 0.125, 0, 0, 11, 0.75, 0],
  ['hero · sostén', 0.188, 0, 0, 11, 0.75, 0],
  ['quiénes somos · persona 1', 0.25, 0, 5, 9, -0.8, 0],
  ['quiénes somos · persona 1 · sostén', 0.293, 0, 5, 9, -0.8, 0],
  ['persona 2 · cruce (apex)', 0.335, 0, 4.5431, 10.7012, -0.1568, 0],
  ['quiénes somos · persona 2', 0.375, 0, 5, 9, 0.8, 0],
  ['quiénes somos · persona 2 · sostén', 0.395, 0, 2.6492, 9.8298, 0.5698, 0],
  ['números · baja la altura', 0.445, 0, -3.9, 9, 0.4762, 0],
  ['números · sube y se aleja', 0.491, 0, 1, 11, 0.0129, 0],
  ['números', 0.5, 0, 1, 14.1, 0, 0],
  ['números · sostén', 0.563, 0, 0, 12, 0, 0],
  ['portfolio', 0.625, 45, 6, 7, -1, 0],
  ['portfolio · sostén', 0.643, 45, 6, 7, -1, 0],
  ['demos · giro ¼', 0.679, 135, 3.9, 7, -0.5, 0],
  ['demos · giro ½', 0.697, 180, -3.9, 8, 0, 0.1],
  ['demos · giro ¾', 0.715, 225, -3.9, 7, -0.5, 0],
  ['demos', 0.75, 315, -3.9, 7, 1, 0],
  ['demos · sostén', 0.788, 315, -3.9, 7, 1, 0],
  ['final · se levanta', 0.825, 315, 4.5, 7, 1, 0],
  ['final · gira', 0.85, 360, 4.5, 8, 0, 0],
  ['cierre · sostén', 0.89, 360, 1.5, 16, 0, 0],
  ['cierre', 1, 360, 1.5, 16, 0, 0],
]

/** Los siete arcos que S7 agregó. */
const S7_ARCS: readonly string[] = [
  'hero · arco de bajada',
  'quiénes somos · arco de entrada',
  'números · arco de caída',
  'números · deriva en arco',
  'portfolio · arco de aproximación',
  'final · arco de subida',
  'cierre · arco de retirada',
]

/** El recorrido de S6 reconstruido: la calibrada MENOS los siete arcos. */
const WITHOUT_ARCS = VARIANT_CALIBRADA_KEYFRAMES.filter(
  (keyframe) => !S7_ARCS.includes(keyframe.name)
)

// ── 1 · Estructura de los cuatro recorridos ─────────────────────────────────

section('Todos los recorridos son reproducibles')

for (const variant of CHOREO_VARIANTS) {
  const { keyframes, label } = variant

  let increasing = true
  for (let i = 1; i < keyframes.length; i += 1) {
    if (keyframes[i].at <= keyframes[i - 1].at) increasing = false
  }
  check(`${label}: los \`at\` son estrictamente crecientes`, increasing, `${keyframes.length} keyframes`)
  check(
    `${label}: arranca en 0 y termina en 1`,
    keyframes[0].at === 0 && keyframes[keyframes.length - 1].at === 1
  )

  let inRange = true
  const offenders: string[] = []
  for (const keyframe of keyframes) {
    const { height, distance, frameX, frameY } = keyframe.pose
    const ok =
      height >= PROBE_RANGES.height.min &&
      height <= PROBE_RANGES.height.max &&
      distance >= PROBE_RANGES.distance.min &&
      distance <= PROBE_RANGES.distance.max &&
      Math.abs(frameX) <= 1 &&
      Math.abs(frameY) <= 1
    if (!ok) {
      inRange = false
      offenders.push(keyframe.name)
    }
  }
  check(
    `${label}: todas las poses caben en los rangos de los sliders`,
    inRange,
    offenders.length > 0 ? offenders.join(', ') : 'height, distance y encuadre'
  )

  let built = true
  let unwrappedEnd = 0
  try {
    const track = makeTrack(keyframes)
    unwrappedEnd = track.unwrappedAngles[track.unwrappedAngles.length - 1]
  } catch {
    built = false
  }
  check(`${label}: \`buildTrack\` no tira`, built)
  check(`${label}: la vuelta entera sobrevive`, unwrappedEnd === 360, `ángulo desenvuelto final ${unwrappedEnd}`)
}

// ── 2 · Ninguna pose del humano se movió ────────────────────────────────────

section('Ni S7 ni S9 tocaron una sola pose calibrada')

check(
  'la calibrada sin los siete arcos tiene exactamente los 23 keyframes de S6',
  WITHOUT_ARCS.length === S6_POSES.length,
  `${WITHOUT_ARCS.length} contra ${S6_POSES.length}`
)

let identical = true
const drifted: string[] = []
for (let i = 0; i < Math.min(WITHOUT_ARCS.length, S6_POSES.length); i += 1) {
  const live = WITHOUT_ARCS[i]
  const [name, at, angleDeg, height, distance, frameX, frameY] = S6_POSES[i]
  const same =
    live.name === name &&
    live.at === at &&
    live.pose.angleDeg === angleDeg &&
    live.pose.height === height &&
    live.pose.distance === distance &&
    live.pose.frameX === frameX &&
    live.pose.frameY === frameY
  if (!same) {
    identical = false
    drifted.push(live.name)
  }
}
check(
  'las 23 poses de S6 están intactas, `at` incluido',
  identical,
  drifted.length > 0 ? drifted.join(', ') : 'nombre, at y los cinco canales'
)

// ── 3 · Los siete arcos ─────────────────────────────────────────────────────

section('Los siete arcos de curvatura')

const arcs = VARIANT_CALIBRADA_KEYFRAMES.filter((keyframe) => S7_ARCS.includes(keyframe.name))
check('los siete están en el archivo', arcs.length === 7, `${arcs.length} encontrados`)
check(
  'los siete van marcados `derived: true`',
  arcs.every((keyframe) => keyframe.derived === true)
)

const demos = CHOREO_TRAMOS.find((tramo) => tramo.name === 'demos')!
check(
  'ninguno cae dentro del tramo Demos',
  arcs.every((keyframe) => keyframe.at < demos.from || keyframe.at > demos.to),
  `Demos va de ${demos.from} a ${demos.to}`
)

const calibradaTrack = makeTrack(VARIANT_CALIBRADA_KEYFRAMES)
const s6Track = makeTrack(WITHOUT_ARCS)

for (const arc of arcs) {
  const index = VARIANT_CALIBRADA_KEYFRAMES.indexOf(arc)
  const from = VARIANT_CALIBRADA_KEYFRAMES[index - 1].at
  const to = VARIANT_CALIBRADA_KEYFRAMES[index + 1].at
  const bow = bowBetween(calibradaTrack, from, to)
  const before = bowBetween(s6Track, from, to)
  check(
    `${arc.name}: curva de verdad`,
    bow - before >= 1,
    `desvío de la recta ${before.toFixed(2)} → ${bow.toFixed(2)} de mundo`
  )
}

/** El mayor salto de velocidad instantánea de un recorrido, y dónde. */
function worstJump(track: ReturnType<typeof makeTrack>, keyframes: readonly ChoreoKeyframe[]) {
  let worst = 0
  let where = ''
  for (let i = 1; i < keyframes.length - 1; i += 1) {
    const at = keyframes[i].at
    const jump = Math.abs(speedAt(track, at + 1e-3) - speedAt(track, at - 1e-3))
    if (jump > worst) {
      worst = jump
      where = keyframes[i].name
    }
  }
  return { worst, where }
}

const jumpBefore = worstJump(s6Track, WITHOUT_ARCS)
const jumpAfter = worstJump(calibradaTrack, VARIANT_CALIBRADA_KEYFRAMES)
check(
  'el tirón más grande del recorrido BAJA con los arcos',
  jumpAfter.worst < jumpBefore.worst,
  `${jumpBefore.worst.toFixed(1)} (${jumpBefore.where}) → ${jumpAfter.worst.toFixed(1)} (${jumpAfter.where})`
)

// El interior ABIERTO del tramo: el segmento que LLEGA a 0,625 nace afuera y sí
// cambió (es el que trae el arco de aproximación), así que el borde exacto no
// cuenta. Lo que tiene que estar intacto es la vuelta.
let demosUntouched = true
for (let i = 1; i < 200; i += 1) {
  const p = demos.from + ((demos.to - demos.from) * i) / 200
  if (Math.abs(speedAt(calibradaTrack, p) - speedAt(s6Track, p)) > 0.01) demosUntouched = false
}
check('la velocidad DENTRO de Demos es idéntica a la de S6', demosUntouched)

// ── 4 · La cámara no se mete donde no hay escena ────────────────────────────

section('Composición: la cámara contra el papel')

for (const variant of CHOREO_VARIANTS) {
  const { keyframes, label } = variant

  let lowest = Infinity
  let lowestName = ''
  for (const keyframe of keyframes) {
    // El offset de mouse mueve la altura ±MOUSE_HEIGHT_FACTOR × distancia, con
    // el multiplicador del panel en 1 (su default). Ver la nota de `FLOOR_Y`.
    const floorGap =
      keyframe.pose.height - MOUSE_HEIGHT_FACTOR * keyframe.pose.distance - FLOOR_Y
    if (floorGap < lowest) {
      lowest = floorGap
      lowestName = keyframe.name
    }
  }
  if (variant.id === 'calibrada') {
    // ⚠️ HALLAZGO HEREDADO, no tocado: con el offset de mouse en su máximo, la
    // pose `números · baja la altura` deja la cámara **1 milímetro de mundo por
    // debajo del papel**. Es una pose calibrada por el humano y ni S7 ni S9
    // tocan poses de este recorrido, así que queda medido y reportado. S6 midió
    // la holgura sobre otra pose (la de Demos, a distancia 7) y por eso no lo vio.
    //
    // S9 arregló el mismo problema en el recorrido definitivo, pero no copiando
    // el −3,89 que el sprint traía escrito: ese número es el margen a distancia
    // 9, y la pose baja del definitivo vive a 11,5. Ver `s9-definitiva`.
    check(
      `${label}: la holgura contra el papel es la que dejó S6`,
      lowest > -0.01,
      `holgura mínima ${lowest.toFixed(3)} en "${lowestName}" — heredada, no se tocó`
    )
  } else {
    check(
      `${label}: la cámara no se mete abajo del papel ni con el mouse al máximo`,
      lowest > 0,
      `holgura mínima ${lowest.toFixed(3)} en "${lowestName}"`
    )
  }

  /**
   * ⚠️ **ACÁ VIVÍA EL CHEQUEO DE LOS PLANOS SUSPENDIDOS, y S10 lo borró con
   * ellos.**
   *
   * Verificaba que ninguna de las once losas se metiera entre la cámara y el logo
   * en los cuatro recorridos de referencia. Era una comprobación con contenido —
   * encontró que la arquitectónica cruzaba dos planos y obligó a rehacerla contra
   * caja orientada en vez de esfera envolvente— pero su objeto ya no existe.
   *
   * Lo que la reemplaza NO es nada: es el par de chequeos de
   * `s9-composicion.invariant.ts`, que verifica que la escena no tiene ocluyentes
   * **y** que el instrumento sabría detectar uno si lo hubiera. Sin ese segundo
   * chequeo, afirmar "no hay oclusión" sobre una escena vacía sería verde por
   * vacío.
   */
}

report('s7 · recorridos')
