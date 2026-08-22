/**
 * COMPROBACIONES DE S9 · el recorrido definitivo contra la escena.
 *
 *     npx tsx src/app/probe-escena/__tests__/s9-composicion.invariant.ts
 *
 * La otra mitad de `s9-recorrido.invariant.ts`: ésta no mira el dato, mira lo
 * que ese dato produce **dentro del espacio que S5 construyó**.
 *
 *   1. El entorno pasa por delante del logo —que acá es la INTENCIÓN, no un
 *      defecto— pero nunca en una pose de keyframe y nunca por mucho tiempo.
 *   2. El corredor que Trabajos le deja al efecto Star Wars.
 *   3. La amplitud y la velocidad, contra los otros cuatro recorridos.
 */
import { CHOREO_KEYFRAMES, CHOREO_TRAMOS } from '../_components/choreography'
import { CHOREO_VARIANTS } from '../_components/choreographyVariants'
import { VARIANT_CALIBRADA_KEYFRAMES } from '../_components/variantCalibrada'
import { cameraAt, check, emptyPose, halfFovDeg, makeTrack, report, section, speedAt } from './harness'
import { backCone, logoOcclusionAt } from './occlusion'

const ASPECT = 16 / 9
const track = makeTrack(CHOREO_KEYFRAMES)

// ── 4 · El entorno por delante del logo ─────────────────────────────────────

section('El entorno pasa por delante del logo, y eso es la intención')

check(
  'en las seis poses el logo está limpio: nunca queda tapado cuando la cámara para',
  CHOREO_KEYFRAMES.every((keyframe) => logoOcclusionAt(track, keyframe.at) === 0),
  'oclusión 0% en las ocho entradas'
)

const N = 2000
const windows: { from: number; to: number }[] = []
let open = -1
let covered = 0
for (let i = 0; i <= N; i += 1) {
  const progress = i / N
  const occluded = logoOcclusionAt(track, progress) > 0
  if (occluded) covered += 1
  if (occluded && open < 0) open = progress
  if (!occluded && open >= 0) {
    windows.push({ from: open, to: progress })
    open = -1
  }
}
if (open >= 0) windows.push({ from: open, to: 1 })

const total = covered / (N + 1)
const longest = Math.max(...windows.map((window) => window.to - window.from))
check(
  'el entorno cruza por delante del logo, y cruza pocas veces',
  windows.length >= 3 && windows.length <= 6,
  `${windows.length} pasadas: ${windows.map((w) => `${w.from.toFixed(3)}→${w.to.toFixed(3)}`).join(' · ')}`
)
check(
  'ninguna pasada dura más de media pantalla de scroll',
  longest < 0.0625,
  `la más larga ${longest.toFixed(3)} de progreso, contra 0,0625 que vale media pantalla`
)
check(
  'y en total tapan menos de una pantalla del recorrido',
  total < 0.125,
  `${(total * 100).toFixed(1)}% del recorrido`
)

// ── 5 · El corredor de Trabajos (la plataforma del Star Wars) ───────────────

section('Trabajos: el corredor que hereda el efecto Star Wars')

const trabajos = CHOREO_TRAMOS.find((tramo) => tramo.name === 'trabajos')!
let worstCone = 99
let worstAt = 0
for (let i = 0; i <= 40; i += 1) {
  const progress = trabajos.from + ((trabajos.to - trabajos.from) * i) / 40
  const cone = backCone(track, progress)
  if (cone < worstCone) {
    worstCone = cone
    worstAt = progress
  }
}
check(
  'el cuadro entero queda libre hacia el fondo durante todo el tramo',
  worstCone >= halfFovDeg(ASPECT).h - 1,
  `cono libre mínimo ±${worstCone.toFixed(1)}° (medio cuadro horizontal es ±${halfFovDeg(ASPECT).h.toFixed(1)}°) en p=${worstAt.toFixed(3)}`
)
check(
  'y el logo no queda tapado en ningún punto del tramo',
  (() => {
    for (let i = 0; i <= 60; i += 1) {
      const progress = trabajos.from + ((trabajos.to - trabajos.from) * i) / 60
      if (logoOcclusionAt(track, progress) > 0) return false
    }
    return true
  })(),
  'oclusión 0% de p=0,500 a p=0,625'
)

// ── 6 · Amplitud y velocidad ────────────────────────────────────────────────

section('Amplitud: el mix contra los cinco recorridos')

function amplitude(keyframes: readonly { pose: { height: number; distance: number } }[]) {
  let jump = 0
  for (let i = 1; i < keyframes.length; i += 1) {
    jump = Math.max(jump, Math.abs(keyframes[i].pose.height - keyframes[i - 1].pose.height))
  }
  const distances = keyframes.map((keyframe) => keyframe.pose.distance)
  return { jump, span: Math.max(...distances) - Math.min(...distances) }
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
check(
  'y el rango de distancias también',
  others.every((other) => mine.span > other.span),
  `${mine.span.toFixed(1)} contra ${others.map((o) => `${o.label} ${o.span.toFixed(1)}`).join(' · ')}`
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
