/**
 * COMPROBACIONES · qué le hace el arco del sol al modelado y a la visibilidad
 * de la fuente. Nació en S7 y **S9 la volvió a medir contra el recorrido
 * definitivo**, que es el único que corre.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-modelado.invariant.ts
 *
 * Las dos cosas que el arco tiene que resolver a la vez, y que tiran en
 * direcciones opuestas: **un sol solo entra en cuadro cuando está detrás del
 * objeto desde donde se lo mira**, y eso es exactamente el peor lugar para
 * modelarlo. Acá se verifica que el arco elegido no le saque modelado a ninguna
 * de las ventanas que llevan contenido, y que el contraluz caiga donde el
 * sprint lo pide.
 *
 * La métrica de modelado es γ: el ángulo 3D entre la dirección a la luz y la
 * dirección al observador, medido desde el objeto. Es el número que usa un
 * fotógrafo — γ→0 luz plana desde atrás de la cámara · 45–70 tres cuartos ·
 * ≈90 luz lateral · >130 contraluz.
 *
 * ── Lo que S9 dio vuelta, y por qué ────────────────────────────────────────
 *
 * En S7 la cámara vivía en azimut 0 durante más de medio recorrido y el
 * contraluz se gastaba entero adentro de Demos. El recorrido definitivo lee
 * contenido en seis azimuts repartidos por toda la vuelta, así que **el ángulo
 * relativo entre el sol y el observador recorre 180° sí o sí** y el contraluz
 * cae en algún lado. Cae donde la tabla del sprint lo pide: el fondo de Demos y
 * el cierre, que es el sol poniéndose detrás del logo.
 *
 * Por eso las ventanas están partidas en dos listas y no en una.
 */
import { CHOREO_KEYFRAMES } from '../_components/choreography'
import { sampleLightArc } from '../_components/choreographySampler'
import type { MutableLightLevels } from '../_components/choreographyTypes'
import { SUN_CORE, SUN_RADIUS, SUN_SPRITE_RADIUS } from '../_components/probeSun'
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

const track = makeTrack(CHOREO_KEYFRAMES)

// ── 5 · Modelado y visibilidad ──────────────────────────────────────────────

section('Modelado: γ entre la luz y el observador')

/** γ: ángulo 3D entre la dirección a la luz y la dirección al observador. */
function gammaAt(p: number, fixed = false): number {
  const pose = emptyPose()
  const cam = cameraAt(track, p, 16 / 9, pose)
  const view = cam.position
  const length = Math.hypot(view[0], view[1], view[2])
  sampleLightArc(p, arc)
  const az = (fixed ? -42 : arc.azimuthDeg) * RAD
  const el = (fixed ? 36 : arc.elevationDeg) * RAD
  const light: Vec3 = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]
  const cosine = (view[0] * light[0] + view[1] * light[1] + view[2] * light[2]) / length
  return (Math.acos(Math.min(1, Math.max(-1, cosine))) * 180) / Math.PI
}

function band(from: number, to: number, fixed = false): { min: number; max: number } {
  let min = 999
  let max = -1
  for (let i = 0; i <= 40; i += 1) {
    const g = gammaAt(from + ((to - from) * i) / 40, fixed)
    min = Math.min(min, g)
    max = Math.max(max, g)
  }
  return { min, max }
}

/**
 * Las ventanas donde el logo TIENE que estar modelado: las que llevan texto que
 * alguien lee. Son los tramos de reposo o de llegada, no el tramo entero — la
 * cámara pasa por muchos ángulos en el camino y ahí la luz hace lo que puede.
 */
const MODELADAS: readonly [string, number, number][] = [
  ['entrada', 0, 0.02],
  ['hero', 0.06, 0.125],
  ['quiénes somos', 0.35, 0.375],
  ['números', 0.478, 0.5],
  ['trabajos', 0.6, 0.625],
]

let modeladasOk = true
const bands: string[] = []
for (const [name, from, to] of MODELADAS) {
  const { min, max } = band(from, to)
  bands.push(`${name} ${min.toFixed(0)}–${max.toFixed(0)}°`)
  if (min < 24 || max > 105) modeladasOk = false
}
check(
  'en las cinco ventanas que llevan texto la luz modela (tres cuartos o lateral)',
  modeladasOk,
  bands.join(' · ')
)

/**
 * Y las dos donde el contraluz es la intención. Demos lo pide explícitamente
 * ("bajo, contraluz, sol visible en cuadro") y el cierre lo hereda: el sol se
 * está poniendo justo detrás del logo.
 */
const CONTRALUZ: readonly [string, number, number][] = [
  ['demos', 0.7, 0.75],
  ['cierre', 0.93, 1],
]

let contraluzOk = true
const contraluzBands: string[] = []
for (const [name, from, to] of CONTRALUZ) {
  const { min } = band(from, to)
  contraluzBands.push(`${name} ${min.toFixed(0)}°`)
  if (min < 130) contraluzOk = false
}
check(
  'en Demos y en el cierre la luz viene de atrás, que es lo que el sprint pide',
  contraluzOk,
  contraluzBands.join(' · ')
)

let gammaMinArc = 999
let gammaMinFixed = 999
for (let i = 0; i <= 500; i += 1) {
  gammaMinArc = Math.min(gammaMinArc, gammaAt(i / 500))
  gammaMinFixed = Math.min(gammaMinFixed, gammaAt(i / 500, true))
}
check(
  'no hay un solo punto del recorrido con luz plana',
  gammaMinArc > 24,
  `γ mínimo ${gammaMinArc.toFixed(1)}° con el arco, contra ${gammaMinFixed.toFixed(1)}° que dejaría una key fija en −42°/36°`
)

/**
 * ⚠️ **El control negativo cambió de forma en S9, y hay que decir por qué.**
 *
 * En S7 el arco ganaba en el γ MÍNIMO del track: la key fija tenía un punto de
 * luz plana (4°) en `final · se levanta` y el arco lo subía a 29°. Sobre el
 * recorrido definitivo eso ya no es cierto —una key fija en −42°/36° da un
 * mínimo de 40,8° contra los 35,5° del arco— y forzar la comparación vieja
 * sería mentir con un número.
 *
 * Lo que el arco compra en este recorrido es OTRA cosa, y es la que importa:
 * con la cámara leyendo contenido en seis azimuts repartidos por toda la
 * vuelta, **una key fija deja dos de las cinco ventanas de texto fuera de
 * rango** —Quiénes somos a 160° es contraluz puro— y deja una tercera
 * (Números, 104°) rozando el límite. Eso es lo que se verifica acá.
 */
const rotas = MODELADAS.filter(([, from, to]) => {
  const { min, max } = band(from, to, true)
  return min < 24 || max > 105
})
check(
  'una key fija dejaría ventanas de texto sin modelar, y el arco no',
  rotas.length >= 2 && modeladasOk,
  `key fija: ${rotas.map(([name, from, to]) => `${name} ${band(from, to, true).min.toFixed(0)}–${band(from, to, true).max.toFixed(0)}°`).join(' · ')}`
)

section('Visibilidad del sol')

function coverage(p: number, radius: number): number {
  const pose = emptyPose()
  const cam = cameraAt(track, p, 16 / 9, pose)
  const half = halfFovDeg(16 / 9)
  const center = sunAt(p)
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
  let visible = 0
  let core = 0
  let from = 1
  let to = 0
  for (let i = 0; i <= N; i += 1) {
    const p = i / N
    if (coverage(p, SUN_SPRITE_RADIUS) > 0.005) {
      visible += 1
      from = Math.min(from, p)
      to = Math.max(to, p)
    }
    if (coverage(p, SUN_SPRITE_RADIUS * SUN_CORE) > 0.005) core += 1
  }
  check(
    'el sol entra en cuadro, y entra donde el sprint lo pide: Demos',
    from >= 0.625 && from < 0.75,
    `ventana p=[${from.toFixed(3)} → ${to.toFixed(3)}] · ${((visible / (N + 1)) * 100).toFixed(1)}% del recorrido (halo) · ${((core / (N + 1)) * 100).toFixed(1)}% (núcleo)`
  )
  check(
    'y no se va: se pone dentro del cuadro',
    to > 0.99,
    `sigue en cuadro en p=${to.toFixed(3)}`
  )
  check(
    'el halo NUNCA entra entero en el cuadro',
    (() => {
      for (let i = 0; i <= N; i += 1) {
        if (coverage(i / N, SUN_SPRITE_RADIUS) > 0.98) return false
      }
      return true
    })(),
    'parcial siempre, que es la regla del sprint'
  )
  /**
   * Dónde cae el sol respecto del logo, que es la pregunta de composición de
   * verdad: "en cuadro" no dice nada si está encima del wordmark.
   */
  const separation = (p: number) => {
    const pose = emptyPose()
    const cam = cameraAt(track, p, 16 / 9, pose)
    const o = angularOffset(cam, sunAt(p))
    const logoHalfDeg = (Math.atan(3.4315 / Math.hypot(pose.distance, pose.height)) * 180) / Math.PI
    return { sep: Math.hypot(o.h, o.v), logoHalfDeg }
  }
  const CORE_HALF_DEG = (Math.atan((SUN_SPRITE_RADIUS * SUN_CORE) / SUN_RADIUS) * 180) / Math.PI

  const demos = separation(0.75)
  check(
    'en Demos el sol está DETRÁS del logo: es un eclipse, con la corona alrededor',
    demos.sep < demos.logoHalfDeg,
    `separación ${demos.sep.toFixed(1)}° contra un logo de ±${demos.logoHalfDeg.toFixed(1)}°`
  )

  const cierre = separation(1)
  check(
    'en el cierre ya se separó: el disco no le pisa el lugar al wordmark',
    cierre.sep > cierre.logoHalfDeg + CORE_HALF_DEG,
    `separación ${cierre.sep.toFixed(1)}° contra ${(cierre.logoHalfDeg + CORE_HALF_DEG).toFixed(1)}° que hace falta · el núcleo queda a ${(cierre.sep - CORE_HALF_DEG).toFixed(1)}–${(cierre.sep + CORE_HALF_DEG).toFixed(1)}° del eje`
  )
}

report('modelado y visibilidad · recorrido definitivo')
