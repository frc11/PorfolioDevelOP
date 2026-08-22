/**
 * COMPROBACIONES DE S9 · el dato del recorrido definitivo.
 *
 *     npx tsx src/app/probe-escena/__tests__/s9-recorrido.invariant.ts
 *
 * Esta mitad mira el recorrido **por dentro**: su forma, su relación con los
 * seis tramos, y el margen contra el piso. Cómo se compone contra la escena
 * —los planos que cruzan, el corredor de Trabajos, la amplitud contra los otros
 * cuatro recorridos— está en `s9-composicion.invariant.ts`.
 *
 * Lo que S7 verificaba sobre la coreografía calibrada sigue corriendo en
 * `s7-recorridos.invariant.ts`, apuntado a `variantCalibrada.ts`.
 *
 * Lo que se verifica acá:
 *
 *   1. Seis poses, ocho entradas, cero derivados — y los dos sostenes son
 *      copias exactas, no "casi iguales".
 *   2. Una pose por tramo, cada una en el borde de su tramo.
 *   3. Las dos pantallas que llevan texto están QUIETAS de verdad.
 *   4. El margen contra el piso, recalculado para la distancia de la pose baja
 *      y verificado además simulando la inercia (Parte 4 del sprint).
 *
 * ── Lo que este archivo NO verifica, a propósito ───────────────────────────
 *
 * **La regla de amplitud de los 90° por tramo quedó anulada.** Era
 * aritméticamente imposible —cinco tramos que se mueven × 90° son 450° sobre
 * una vuelta de 360— y el dueño del proyecto la retiró. No se comprueba en
 * ningún lado y no se publica como propiedad.
 */
import { CHOREO_KEYFRAMES, CHOREO_TRAMOS } from '../_components/choreography'
import {
  MOUSE_HEIGHT_FACTOR,
  MOUSE_TAU,
  SETTLE_EPSILON,
  SETTLE_TAU,
} from '../_components/choreographyPhysics'
import { buildTrack, sampleTrack } from '../_components/choreographySampler'
import { FLOOR_Y, check, emptyPose, makeTrack, report, section, speedAt } from './harness'

const track = makeTrack(CHOREO_KEYFRAMES)

// ── 1 · La forma del recorrido ──────────────────────────────────────────────

section('Seis poses, ocho entradas, cero relleno')

check(
  'ocho entradas en el array',
  CHOREO_KEYFRAMES.length === 8,
  `${CHOREO_KEYFRAMES.length} keyframes`
)
check(
  'ninguna lleva la marca `derived`',
  CHOREO_KEYFRAMES.every((keyframe) => keyframe.derived !== true)
)

/** Un sostén es una copia EXACTA de la pose anterior, no una parecida. */
const SOSTENES: readonly [string, string][] = [
  ['hero', 'hero · sostén'],
  ['cierre', 'cierre · sostén'],
]
const byName = new Map(CHOREO_KEYFRAMES.map((keyframe) => [keyframe.name, keyframe]))
for (const [from, to] of SOSTENES) {
  const a = byName.get(from)
  const b = byName.get(to)
  check(
    `"${to}" es una copia exacta de "${from}"`,
    a !== undefined &&
      b !== undefined &&
      a.pose.angleDeg === b.pose.angleDeg &&
      a.pose.height === b.pose.height &&
      a.pose.distance === b.pose.distance &&
      a.pose.frameX === b.pose.frameX &&
      a.pose.frameY === b.pose.frameY,
    a && b ? `en ${a.at} y en ${b.at}` : 'falta uno de los dos'
  )
}

const distinct = new Set(
  CHOREO_KEYFRAMES.map(
    (keyframe) =>
      `${keyframe.pose.angleDeg}|${keyframe.pose.height}|${keyframe.pose.distance}|${keyframe.pose.frameX}|${keyframe.pose.frameY}`
  )
)
check('son seis poses distintas', distinct.size === 6, `${distinct.size} poses`)

check(
  '`frameY` sigue en cero en todas',
  CHOREO_KEYFRAMES.every((keyframe) => keyframe.pose.frameY === 0)
)

section('Una pose por tramo, en el borde de su tramo')

/** El keyframe que cada tramo TERMINA. El hero termina en su sostén. */
const CIERRA_TRAMO: readonly [string, string][] = [
  ['hero', 'hero · sostén'],
  ['quiénes somos', 'quiénes somos'],
  ['números', 'números'],
  ['trabajos', 'trabajos'],
  ['demos', 'demos'],
  ['cierre', 'cierre · sostén'],
]
check(
  'hay un tramo por cada nombre de la tabla del sprint',
  CHOREO_TRAMOS.map((tramo) => tramo.name).join(' · ') ===
    'hero · quiénes somos · números · trabajos · demos · cierre',
  CHOREO_TRAMOS.map((tramo) => tramo.name).join(' · ')
)
let bordesOk = true
const bordes: string[] = []
for (const [tramoName, keyframeName] of CIERRA_TRAMO) {
  const tramo = CHOREO_TRAMOS.find((candidate) => candidate.name === tramoName)
  const keyframe = byName.get(keyframeName)
  if (!tramo || !keyframe || keyframe.at !== tramo.to) bordesOk = false
  bordes.push(`${tramoName} → ${keyframe?.at ?? '?'}`)
}
check('cada tramo termina exactamente en su pose', bordesOk, bordes.join(' · '))

const unwrapped = track.unwrappedAngles[track.unwrappedAngles.length - 1]
check('la vuelta acumula 360 exacto', unwrapped === 360, `ángulo desenvuelto final ${unwrapped}`)

// ── 2 · Las dos pantallas de texto están quietas ────────────────────────────

section('Los dos sostenes sostienen de verdad')

/**
 * Se muestrea hasta 0,1245 y no hasta 0,125 a propósito: `speedAt` es una
 * diferencia centrada con una ventana de ±5×10⁻⁴, así que EN el borde del
 * tramo la ventana se mete en el segmento siguiente y mide su arranque. Eso es
 * el instrumento, no la cámara.
 */
let heroStill = 0
for (let i = 0; i <= 200; i += 1) heroStill = Math.max(heroStill, speedAt(track, (i / 200) * 0.1245))
check(
  'la cámara no se mueve en toda la pantalla del hero',
  heroStill < 1e-6,
  `velocidad máxima ${heroStill.toExponential(1)} alturas de cuadro por unidad de progreso`
)

let closeStill = 0
for (let i = 0; i <= 100; i += 1) {
  closeStill = Math.max(closeStill, speedAt(track, 0.96 + (i / 100) * 0.04))
}
check(
  'y se clava desde 0,96 hasta el final, que es donde va el wordmark',
  closeStill < 1e-6,
  `velocidad máxima ${closeStill.toExponential(1)}`
)

// ── 3 · El piso (Parte 4 del sprint) ────────────────────────────────────────

section('El margen contra el papel, recalculado')

/**
 * ⚠️ **El −3,89 del sprint no se copió, y es el punto de la Parte 4.**
 *
 * El offset de mouse baja la cámara `MOUSE_HEIGHT_FACTOR × distancia`, así que
 * la altura mínima segura DEPENDE DE LA DISTANCIA:
 *
 *     altura mínima = FLOOR_Y + MOUSE_HEIGHT_FACTOR × distancia
 *
 * A distancia 9 —donde vivía la pose baja del recorrido calibrado— eso da
 * −3,899, y de ahí sale el −3,89 que el sprint traía escrito. La pose baja del
 * recorrido definitivo vive a **11,5**, donde el piso está en **−3,787**:
 * copiar el −3,89 habría metido la cámara 10 cm abajo del papel.
 */
const floorLimit = (distance: number) => FLOOR_Y + MOUSE_HEIGHT_FACTOR * distance
check(
  'el margen depende de la distancia, y el de la pose baja se recalculó',
  Math.abs(floorLimit(9) + 3.899) < 0.001 && Math.abs(floorLimit(11.5) + 3.7865) < 0.001,
  `a distancia 9 el piso está en ${floorLimit(9).toFixed(3)} · a 11,5 en ${floorLimit(11.5).toFixed(3)}`
)

let lowest = Infinity
let lowestName = ''
for (const keyframe of CHOREO_KEYFRAMES) {
  const gap = keyframe.pose.height - MOUSE_HEIGHT_FACTOR * keyframe.pose.distance - FLOOR_Y
  if (gap < lowest) {
    lowest = gap
    lowestName = keyframe.name
  }
}
check(
  'ninguna pose se mete abajo del papel con el mouse al máximo',
  lowest > 0,
  `holgura mínima ${lowest.toFixed(4)} en "${lowestName}"`
)

/**
 * Y ahora con inercia. La altura y la distancia se persiguen con τ distintos
 * (0,24 y 0,26), así que un frame puede combinar una altura ya baja con una
 * distancia todavía alta — que es exactamente el peor caso para el piso. Se
 * barre el progreso a diez velocidades, en los dos sentidos, con el mouse
 * clavado abajo del todo.
 *
 * La persecución es `1 − e^(−dt/τ)`: una combinación convexa, así que NUNCA
 * sobrepasa el objetivo. Lo único que puede empeorar el margen es el desfasaje
 * entre los dos canales, y es lo que esto mide.
 */
function damp(current: number, target: number, tau: number, epsilon: number, dt: number): number {
  if (tau <= 0 || dt <= 0) return target
  const diff = target - current
  if (Math.abs(diff) <= epsilon) return target
  return current + diff * (1 - Math.exp(-dt / tau))
}

function simulatedGap(settleScale: number): { gap: number; at: number } {
  const simulated = buildTrack(CHOREO_KEYFRAMES)
  const target = emptyPose()
  const live = emptyPose()
  const dt = 1 / 60
  let worst = Infinity
  let worstAt = 0
  for (const speed of [0.02, 0.05, 0.1, 0.2, 0.35, 0.6, 1, 2, 5, 20]) {
    for (const direction of [1, -1]) {
      let progress = direction > 0 ? 0 : 1
      sampleTrack(simulated, progress, target)
      live.height = target.height
      live.distance = target.distance
      let mouse = 0
      const steps = Math.ceil(1 / (speed * dt)) + 300
      for (let i = 0; i < steps; i += 1) {
        progress = Math.min(1, Math.max(0, progress + direction * speed * dt))
        sampleTrack(simulated, progress, target)
        live.height = damp(
          live.height,
          target.height,
          SETTLE_TAU.height * settleScale,
          SETTLE_EPSILON.height,
          dt
        )
        live.distance = damp(
          live.distance,
          target.distance,
          SETTLE_TAU.distance * settleScale,
          SETTLE_EPSILON.distance,
          dt
        )
        mouse = damp(mouse, -1, MOUSE_TAU, 1e-6, dt)
        const gap = live.height + mouse * MOUSE_HEIGHT_FACTOR * live.distance - FLOOR_Y
        if (gap < worst) {
          worst = gap
          worstAt = progress
        }
      }
    }
  }
  return { gap: worst, at: worstAt }
}

const simulated = simulatedGap(1)
check(
  'y tampoco con la inercia en el peor desfasaje entre altura y distancia',
  simulated.gap > 0,
  `holgura mínima ${simulated.gap.toFixed(4)} en p=${simulated.at.toFixed(3)}`
)
check(
  'ni con el slider de inercia al doble',
  simulatedGap(2).gap > 0,
  `holgura mínima ${simulatedGap(2).gap.toFixed(4)}`
)

report('s9 · el dato del recorrido definitivo')
