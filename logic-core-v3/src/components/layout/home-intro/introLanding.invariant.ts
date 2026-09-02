import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import { PROBE_SVG_SCALE } from '@/app/v3/_lib/escena/probeScene'
import { projectScenePoint, sceneCameraAt, type SceneVec3 } from '@/lib/scene-camera'
import { SCENE_ENTRY_POSE, SCENE_ENTRY_VIEW, frameSceneEntry } from '@/lib/scene-framing'

import { check, px, report, section } from './introChecks'
import { planIntroFlight, sampleLogoPose } from './introFlight'
import { HOME_INTRO_TIMELINE } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA — **DÓNDE ATERRIZA EL LOGO DEL INTRO CONTRA DÓNDE ESTÁ
 * EL DE LA ESCENA.** La medición que V3-A pide, en tres ventanas.
 *
 *     npx tsx src/components/layout/home-intro/introLanding.invariant.ts
 *
 * ── Por qué hacía falta un instrumento nuevo ───────────────────────────────
 *
 * `introFlight.invariant.ts` afirma que el último cuadro **llega al destino** —
 * o sea que el vuelo cierra contra su propio plan. Lo que nadie medía es la otra
 * mitad: que ese plan sea el lugar donde la escena **dibuja** su logo. Las dos
 * cosas se derivan del mismo keyframe, así que coincidir era una expectativa
 * razonable; pero una expectativa razonable no es una cifra, y el requisito del
 * sprint es literal: *«si están a más de unos pocos píxeles, el relevo se ve»*.
 *
 * ── Las DOS distancias, porque son dos cosas distintas ─────────────────────
 *
 *  1. **El CENTRO.** El preloader proyecta el origen con la misma cámara que la
 *     escena, así que coincide por construcción. Se afirma igual: es lo que se
 *     pondría en rojo el día que alguien toque una de las dos cámaras.
 *  2. **La SILUETA.** Acá sí hay una diferencia real y no es sub-píxel. La
 *     escena mira el logo con una cámara de PERSPECTIVA y desde el 70,7% del
 *     ancho, así que su caja de tinta sale **acuñada** —el borde de arriba mide
 *     distinto que el de abajo—. El canvas del preloader es ORTOGRÁFICO
 *     (`IntroLogoCanvas.tsx`: una unidad de mundo = un píxel, que es lo que hace
 *     que la silueta del mesh y la del SVG coincidan durante el relevo) y sólo
 *     puede dibujar un rectángulo rígido, escorzado por la inclinación pero
 *     igual arriba que abajo.
 *
 * **Las dos se publican.** La del centro es la que el requisito nombra; la de la
 * silueta es la que se va a ver en el cuadro en que el overlay se desmonta, y
 * está acá para que exista con su número en vez de descubrirse mirando.
 */

const T = HOME_INTRO_TIMELINE
const DEG = Math.PI / 180

/** Las tres ventanas de escritorio. Abajo de 1025 la escena no se monta. */
const VENTANAS: readonly (readonly [string, number, number])[] = [
  ['1440×810', 1440, 810],
  ['1920×1080', 1920, 1080],
  ['1280×800', 1280, 800],
]

/** La caja de la TINTA en unidades de mundo, centrada en el origen. */
const INK_W = LOGO_INK_VIEWBOX.width * PROBE_SVG_SCALE
const INK_H = LOGO_INK_VIEWBOX.height * PROBE_SVG_SCALE

type Punto = { readonly x: number; readonly y: number }

/** Las cuatro esquinas de la tinta, tal como la ESCENA las proyecta. */
function esquinasDeLaEscena(w: number, h: number): readonly Punto[] | null {
  const camera = sceneCameraAt(SCENE_ENTRY_POSE, w, h)
  if (!camera) return null
  const salida: Punto[] = []
  for (const [sx, sy] of [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ] as const) {
    const punto: SceneVec3 = [(sx * INK_W) / 2, (sy * INK_H) / 2, 0]
    const at = projectScenePoint(camera, punto, w, h)
    if (!at) return null
    salida.push({ x: at.xPx, y: at.yPx })
  }
  return salida
}

/**
 * Las cuatro esquinas tal como el PRELOADER las dibuja al aterrizar.
 *
 * Cámara ortográfica: la caja es un rectángulo rígido centrado en el destino,
 * del ancho de la tinta y con el alto escorzado por la inclinación de
 * revelación —el mismo `pitchDeg` que la escena tiene, aplicado como rotación
 * del objeto (`IntroLogoCanvas.tsx`)—. El orden de las esquinas es el mismo.
 */
function esquinasDelIntro(w: number, h: number): readonly Punto[] | null {
  const plan = planIntroFlight(w, h)
  if (!plan.destination) return null
  const pose = sampleLogoPose(plan, T, 1)
  const media = plan.ink.widthPx / 2
  const medioAlto = (plan.ink.heightPx * Math.cos(SCENE_ENTRY_VIEW.pitchDeg * DEG)) / 2
  return [
    { x: pose.centerXPx - media, y: pose.centerYPx - medioAlto },
    { x: pose.centerXPx + media, y: pose.centerYPx - medioAlto },
    { x: pose.centerXPx + media, y: pose.centerYPx + medioAlto },
    { x: pose.centerXPx - media, y: pose.centerYPx + medioAlto },
  ]
}

const dist = (a: Punto, b: Punto) => Math.hypot(a.x - b.x, a.y - b.y)

// ── 1 · El centro ───────────────────────────────────────────────────────────

section('1 · el CENTRO — dónde aterriza contra dónde está el de la escena')

for (const [nombre, w, h] of VENTANAS) {
  const destino = frameSceneEntry(w, h)
  const plan = planIntroFlight(w, h)
  const pose = sampleLogoPose(plan, T, 1)
  if (!destino) {
    check(`${nombre} — hay destino`, false)
    continue
  }
  const d = Math.hypot(pose.centerXPx - destino.centerXPx, pose.centerYPx - destino.centerYPx)
  check(
    `${nombre} — el logo del intro aterriza EN el logo de la escena`,
    d < 0.001,
    `${d.toFixed(4)} px · (${pose.centerXPx.toFixed(1)}, ${pose.centerYPx.toFixed(1)})`
  )
  check(
    `${nombre} — y con el mismo alto de tinta`,
    Math.abs(pose.inkHeightPx - destino.inkHeightPx) < 0.001,
    `${pose.inkHeightPx.toFixed(2)} px contra ${destino.inkHeightPx.toFixed(2)} px`
  )
}

// ── 2 · La silueta ──────────────────────────────────────────────────────────

section('2 · la SILUETA — el escorzo que el rig ortográfico no puede reproducir')

for (const [nombre, w, h] of VENTANAS) {
  const escena = esquinasDeLaEscena(w, h)
  const intro = esquinasDelIntro(w, h)
  if (!escena || !intro) {
    check(`${nombre} — hay las dos siluetas`, false)
    continue
  }
  const peor = Math.max(...escena.map((punto, i) => dist(punto, intro[i])))
  const anchoArribaEscena = escena[1].x - escena[0].x
  const anchoAbajoEscena = escena[2].x - escena[3].x
  const anchoIntro = intro[1].x - intro[0].x

  check(
    `${nombre} — la escena acuña la caja y el preloader no puede`,
    anchoArribaEscena - anchoAbajoEscena > 1,
    `escena arriba ${px(anchoArribaEscena)} contra abajo ${px(anchoAbajoEscena)} · preloader ${px(anchoIntro)} parejo`
  )
  check(
    `${nombre} — ⚠ la peor esquina queda a esta distancia, y es lo que se ve al desmontar`,
    Number.isFinite(peor),
    `${peor.toFixed(1)} px`
  )
  check(
    `${nombre} — el alto PROMEDIO sí coincide: la inclinación es la misma`,
    Math.abs((escena[3].y - escena[0].y + (escena[2].y - escena[1].y)) / 2 - (intro[3].y - intro[0].y)) <
      1,
    `escena ${px((escena[3].y - escena[0].y + (escena[2].y - escena[1].y)) / 2)} · preloader ${px(intro[3].y - intro[0].y)}`
  )
}

// ── Controles positivos ─────────────────────────────────────────────────────

section('Que estas comprobaciones puedan fallar')

/** El mismo instrumento, contra un destino corrido a mano. */
const corrido = 12
const [, w0, h0] = VENTANAS[0]
const escena0 = esquinasDeLaEscena(w0, h0)
const intro0 = esquinasDelIntro(w0, h0)
check(
  'control positivo — el comparador ve un corrimiento de 12 px donde lo hay',
  escena0 !== null &&
    intro0 !== null &&
    Math.abs(
      Math.max(...escena0.map((p, i) => dist(p, { x: intro0[i].x + corrido, y: intro0[i].y }))) -
        Math.max(...escena0.map((p, i) => dist(p, intro0[i])))
    ) > 1,
  'si el comparador devolviera siempre lo mismo, esto no se movería'
)

check(
  'control positivo — la caja de la tinta que se proyecta NO es la del cuadrado de 1024',
  Math.abs(INK_W - LOGO_INK_VIEWBOX.width * PROBE_SVG_SCALE) < 1e-12 && INK_W < 1024 * PROBE_SVG_SCALE,
  `${INK_W.toFixed(4)} × ${INK_H.toFixed(4)} de mundo`
)

check(
  'control positivo — sin ventana medible no hay silueta que comparar',
  esquinasDelIntro(0, 0) === null,
  'el destino es null y el instrumento lo dice en vez de inventar una caja'
)

report('introLanding')
