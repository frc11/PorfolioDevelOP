/**
 * COMPROBACIONES DE S7 · qué le hace el arco del sol al modelado y a la
 * visibilidad de la fuente.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-modelado.invariant.ts
 *
 * Las dos cosas que el arco tiene que resolver a la vez, y que tiran en
 * direcciones opuestas: **un sol solo entra en cuadro cuando está detrás del
 * objeto desde donde se lo mira**, y eso es exactamente el peor lugar para
 * modelarlo. Acá se verifica que el arco elegido no le saque modelado a ninguna
 * de las seis ventanas de contenido, y que aun así el sol se vea más que con la
 * key fija de S6.
 *
 * La métrica de modelado es γ: el ángulo 3D entre la dirección a la luz y la
 * dirección al observador, medido desde el objeto. Es el número que usa un
 * fotógrafo — γ→0 luz plana desde atrás de la cámara · 45–70 tres cuartos ·
 * ≈90 luz lateral · >130 contraluz.
 */
import { CHOREO_KEYFRAMES } from '../_components/choreography'
import { sampleLightArc } from '../_components/choreographySampler'
import type { MutableLightLevels } from '../_components/choreographyTypes'
import { SUN_RADIUS, SUN_SPRITE_RADIUS } from '../_components/probeSun'
import {
  angularOffset,
  cameraAt,
  check,
  emptyPose,
  halfFovDeg,
  makeTrack,
  report,
  section,
  type Vec3,
} from './harness'

const RAD = Math.PI / 180
const arc: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }

function sunAt(p: number, radius = SUN_RADIUS): Vec3 {
  sampleLightArc(p, arc)
  const horizontal = Math.cos(arc.elevationDeg * RAD) * radius
  return [
    Math.sin(arc.azimuthDeg * RAD) * horizontal,
    Math.sin(arc.elevationDeg * RAD) * radius,
    Math.cos(arc.azimuthDeg * RAD) * horizontal,
  ]
}

// ── 5 · Modelado y visibilidad ──────────────────────────────────────────────

section('Modelado: γ entre la luz y el observador')

/** γ: ángulo 3D entre la dirección a la luz y la dirección al observador. */
function gammaAt(p: number, fixed = false): number {
  const pose = emptyPose()
  const cam = cameraAt(makeTrack(CHOREO_KEYFRAMES), p, 16 / 9, pose)
  const view = cam.position
  const length = Math.hypot(view[0], view[1], view[2])
  sampleLightArc(p, arc)
  const az = (fixed ? -42 : arc.azimuthDeg) * RAD
  const el = (fixed ? 36 : arc.elevationDeg) * RAD
  const light: Vec3 = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]
  const cosine = (view[0] * light[0] + view[1] * light[1] + view[2] * light[2]) / length
  return (Math.acos(Math.min(1, Math.max(-1, cosine))) * 180) / Math.PI
}

/** Las ventanas donde el logo TIENE que estar modelado. */
const PROTECTED: readonly [string, number, number][] = [
  ['entrada', 0, 0.02],
  ['hero', 0.125, 0.188],
  ['quiénes somos', 0.25, 0.395],
  ['números', 0.478, 0.575],
  ['portfolio', 0.625, 0.643],
  ['cierre', 0.89, 1],
]

let protectedOk = true
const bands: string[] = []
for (const [name, from, to] of PROTECTED) {
  let min = 999
  let max = -1
  for (let i = 0; i <= 40; i += 1) {
    const g = gammaAt(from + ((to - from) * i) / 40)
    min = Math.min(min, g)
    max = Math.max(max, g)
  }
  bands.push(`${name} ${min.toFixed(0)}–${max.toFixed(0)}°`)
  if (min < 24 || max > 105) protectedOk = false
}
check(
  'en las seis ventanas de contenido la luz queda en tres cuartos',
  protectedOk,
  bands.join(' · ')
)

let gammaMinArc = 999
let gammaMinFixed = 999
for (let i = 0; i <= 500; i += 1) {
  gammaMinArc = Math.min(gammaMinArc, gammaAt(i / 500))
  gammaMinFixed = Math.min(gammaMinFixed, gammaAt(i / 500, true))
}
check(
  'el arco ARREGLA el punto de luz plana que tenía la key fija',
  gammaMinArc > gammaMinFixed + 15,
  `γ mínimo ${gammaMinFixed.toFixed(0)}° con la key fija → ${gammaMinArc.toFixed(0)}° con el arco`
)

section('Visibilidad del sol')

function coverage(p: number, fixed: boolean, radius: number): number {
  const pose = emptyPose()
  const cam = cameraAt(makeTrack(CHOREO_KEYFRAMES), p, 16 / 9, pose)
  const half = halfFovDeg(16 / 9)
  let center: Vec3
  if (fixed) {
    const horizontal = Math.cos(36 * RAD) * SUN_RADIUS
    center = [Math.sin(-42 * RAD) * horizontal, Math.sin(36 * RAD) * SUN_RADIUS, Math.cos(-42 * RAD) * horizontal]
  } else {
    center = sunAt(p)
  }
  let inside = 0
  let total = 0
  for (let i = 0; i <= 10; i += 1) {
    const rr = (i / 10) * radius
    const spokes = i === 0 ? 1 : 20
    for (let j = 0; j < spokes; j += 1) {
      const a = (j / spokes) * Math.PI * 2
      const q: Vec3 = [
        center[0] + cam.right[0] * Math.cos(a) * rr + cam.up[0] * Math.sin(a) * rr,
        center[1] + cam.right[1] * Math.cos(a) * rr + cam.up[1] * Math.sin(a) * rr,
        center[2] + cam.right[2] * Math.cos(a) * rr + cam.up[2] * Math.sin(a) * rr,
      ]
      const o = angularOffset(cam, q)
      const w = i === 0 ? 1 : i
      total += w
      if (o.depth > 0 && Math.abs(o.h) <= half.h && Math.abs(o.v) <= half.v) inside += w
    }
  }
  return inside / total
}

{
  const N = 2000
  let arcVisible = 0
  let fixedVisible = 0
  let arcLate = 0
  let lateSteps = 0
  let from = 1
  let to = 0
  for (let i = 0; i <= N; i += 1) {
    const p = i / N
    const seen = coverage(p, false, SUN_SPRITE_RADIUS) > 0.005
    if (seen) {
      arcVisible += 1
      from = Math.min(from, p)
      to = Math.max(to, p)
    }
    if (coverage(p, true, SUN_SPRITE_RADIUS) > 0.005) fixedVisible += 1
    if (p >= 0.625) {
      lateSteps += 1
      if (seen) arcLate += 1
    }
  }
  check(
    'el sol entra en cuadro más tiempo con el arco que con la key fija',
    arcVisible > fixedVisible,
    `${((fixedVisible / (N + 1)) * 100).toFixed(1)}% → ${((arcVisible / (N + 1)) * 100).toFixed(1)}% del recorrido`
  )
  check(
    'y la ventana cae donde el sprint la pide: Demos y el movimiento final',
    from >= 0.625 && to <= 1,
    `p=[${from.toFixed(3)} → ${to.toFixed(3)}] · ${((arcLate / lateSteps) * 100).toFixed(1)}% de Demos+final`
  )
  check(
    'el halo NUNCA entra entero en el cuadro',
    (() => {
      for (let i = 0; i <= N; i += 1) if (coverage(i / N, false, SUN_SPRITE_RADIUS) > 0.98) return false
      return true
    })(),
    'parcial siempre, que es la regla del sprint'
  )
}

report('s7 · modelado y visibilidad')
