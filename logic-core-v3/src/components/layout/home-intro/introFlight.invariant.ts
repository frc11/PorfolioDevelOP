import { readFileSync } from 'node:fs'

import { CALIBRATIONS, check, px, report, section, sweep } from './introChecks'
import { introLockupText, planIntroFlight, sampleLogoPose } from './introFlight'
import { introTimeS, samplePlace } from './introSampling'
import { HOME_INTRO_PHASES, buildTimeline } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DEL ACOMODAMIENTO — **que el logo no cambie de tamaño**
 * y que el desplazamiento y la rotación sean un solo gesto.
 *
 *     npx tsx src/components/layout/home-intro/introFlight.invariant.ts
 *
 * ── Por qué esto se puede comprobar ────────────────────────────────────────
 *
 * Porque el plan de vuelo no mide el DOM: la marca está centrada por layout, así
 * que su centro es el centro de la ventana, y el tamaño lo fija la escena. El
 * plan entero es **función pura del tamaño de la pantalla**.
 *
 * ── Las dos propiedades que S8d pide por escrito ───────────────────────────
 *
 *  1. **El tamaño es constante.** Se evalúa en 601 puntos de la secuencia y en
 *     las once calibraciones: el alto de la tinta tiene que ser el mismo número
 *     siempre, y tiene que ser el del destino.
 *  2. **Mover y girar son un solo gesto.** No se comprueba que dos curvas
 *     "coincidan" —eso sería frágil—: se comprueba que la fracción del camino
 *     recorrido y la fracción de la rotación sean **el mismo número** en todo
 *     instante. Arrancan juntos y terminan juntos porque son lo mismo.
 */

const EPS = 1e-9

const VIEWPORTS: readonly (readonly [string, number, number])[] = [
  ['desktop 1440×810', 1440, 810],
  ['desktop 1920×1080', 1920, 1080],
  ['mobile 390×844', 390, 844],
]

// ── 1 · El logo no cambia de tamaño ─────────────────────────────────────────

section('🔴 el alto de la tinta es el mismo en toda la secuencia')

for (const [label, w, h] of VIEWPORTS) {
  const plan = planIntroFlight(w, h)
  for (const [name, phases] of CALIBRATIONS) {
    const t = buildTimeline(phases)
    let constant = true
    sweep((p) => {
      if (sampleLogoPose(plan, t, p).inkHeightPx !== plan.ink.heightPx) constant = false
    })
    check(`${label} / ${name}`, constant)
  }
}

section('y ese tamaño es el que el logo va a tener en la escena')

for (const [label, w, h] of VIEWPORTS) {
  const plan = planIntroFlight(w, h)
  const destination = plan.destination
  check(
    `${label} — la tinta mide lo que mide el destino`,
    destination !== null &&
      plan.ink.heightPx === destination.inkHeightPx &&
      plan.ink.widthPx === destination.inkWidthPx,
    `${px(plan.ink.widthPx)}×${px(plan.ink.heightPx)}`
  )
}

section('el texto se deriva del logo, no de la ventana')

for (const [label, w, h] of VIEWPORTS) {
  const plan = planIntroFlight(w, h)
  const text = introLockupText(plan.ink.heightPx)
  const total =
    text.wordmarkPx * 1.05 + text.gapPx * 2 + plan.ink.heightPx + text.sloganPx * 1.55
  check(
    `${label} — el lockup entra cómodo en la ventana`,
    total < h * 0.8,
    `${px(total)} de ${px(h)} · ${((100 * total) / h).toFixed(0)}%`
  )
  check(
    `${label} — la proporción texto/logo no depende de la resolución`,
    Math.abs(text.wordmarkPx / plan.ink.heightPx - 0.22) < EPS
  )
}

// ── 2 · Mover y girar son un solo gesto ─────────────────────────────────────

section('🔴 el desplazamiento y la rotación son el MISMO número')

/**
 * Se compara componente por componente y no por la distancia recorrida, porque
 * **el desplazamiento puede ser cero**: en una ventana angosta el encuadre de la
 * escena no tiene margen lateral para correr el logo y el destino cae en el
 * centro exacto, así que el acomodamiento es una rotación en el lugar. Dividir
 * por la distancia ahí daría `NaN` y la comprobación pasaría sin comprobar nada.
 */
for (const [label, w, h] of VIEWPORTS) {
  const plan = planIntroFlight(w, h)
  const destination = plan.destination
  if (!destination) {
    check(`${label} — hay destino`, false)
    continue
  }
  const deltaX = destination.centerXPx - plan.originXPx
  const deltaY = destination.centerYPx - plan.originYPx
  for (const [name, phases] of CALIBRATIONS) {
    const t = buildTimeline(phases)
    let locked = true
    sweep((p) => {
      const pose = sampleLogoPose(plan, t, p)
      const place = samplePlace(t, p)
      if (pose.reveal !== place) locked = false
      if (Math.abs(pose.dxPx - deltaX * place) > 1e-9) locked = false
      if (Math.abs(pose.dyPx - deltaY * place) > 1e-9) locked = false
    })
    check(`${label} / ${name} — camino y giro en lockstep`, locked)
  }
}

section('arrancan juntos y terminan juntos')

for (const [label, w, h] of VIEWPORTS) {
  const plan = planIntroFlight(w, h)
  const t = buildTimeline(HOME_INTRO_PHASES)
  const deltaX = (plan.destination?.centerXPx ?? 0) - plan.originXPx
  const deltaY = (plan.destination?.centerYPx ?? 0) - plan.originYPx
  const travels = Math.hypot(deltaX, deltaY) > EPS

  let firstMove = Infinity
  let firstTurn = Infinity
  sweep((p) => {
    const pose = sampleLogoPose(plan, t, p)
    if (firstMove === Infinity && Math.hypot(pose.dxPx, pose.dyPx) > 0) firstMove = p
    if (firstTurn === Infinity && pose.reveal > 0) firstTurn = p
  })
  const end = sampleLogoPose(plan, t, 1)

  if (travels) {
    check(`${label} — el primer frame es el mismo`, firstMove === firstTurn)
  } else {
    // No es un caso raro: es la ventana angosta. Se dice en voz alta para que
    // "el logo no se movió" no se lea como un bug al mirarlo en el teléfono.
    check(
      `${label} — el destino ES el centro: el acomodamiento gira en el lugar`,
      firstMove === Infinity && firstTurn < Infinity,
      `desplazamiento ${px(Math.hypot(deltaX, deltaY))}`
    )
  }
  check(
    `${label} — y el último frame llega al destino`,
    end.reveal === 1 &&
      Math.abs(end.centerXPx - (plan.destination?.centerXPx ?? 0)) < EPS &&
      Math.abs(end.centerYPx - (plan.destination?.centerYPx ?? 0)) < EPS,
    `(${px(end.centerXPx)}, ${px(end.centerYPx)})`
  )
}

section('antes del acomodamiento el logo está quieto y de frente')

for (const [label, w, h] of VIEWPORTS) {
  const plan = planIntroFlight(w, h)
  const t = buildTimeline(HOME_INTRO_PHASES)
  let still = true
  sweep((p) => {
    if (introTimeS(t, p) >= t.placeStartS) return
    const pose = sampleLogoPose(plan, t, p)
    if (pose.dxPx !== 0 || pose.dyPx !== 0 || pose.reveal !== 0) still = false
    if (pose.centerXPx !== plan.originXPx || pose.centerYPx !== plan.originYPx) still = false
  })
  check(`${label} — centrado, sin girar`, still)
}

// ── La estructura del lockup ────────────────────────────────────────────────

section('🔴 no hay ni un transform de escala en el lockup')

const lockupSource = readFileSync(new URL('./IntroLockup.tsx', import.meta.url), 'utf8')

check(
  'ningún `scale:` en IntroLockup.tsx',
  !/\bscale:/.test(lockupSource),
  'el logo no cambia de tamaño: no hay dónde escribirlo'
)
check(
  'el texto sale de las proporciones y no de la ventana',
  lockupSource.includes('text.wordmarkPx') &&
    lockupSource.includes('text.sloganPx') &&
    lockupSource.includes('text.gapPx')
)
check(
  'y el único transform es el desplazamiento',
  lockupSource.includes('x: logoX, y: logoY') &&
    (lockupSource.match(/style=\{\{ x:/g) ?? []).length === 1
)

// ── Sin destino ─────────────────────────────────────────────────────────────

section('pestaña oculta: sin destino no hay nada')

const blind = planIntroFlight(0, 0)
const t = buildTimeline(HOME_INTRO_PHASES)
check('no hay destino', blind.destination === null)
check('la tinta mide 0', blind.ink.heightPx === 0 && blind.ink.widthPx === 0)

let neverMoves = true
sweep((p) => {
  const pose = sampleLogoPose(blind, t, p)
  if (pose.dxPx !== 0 || pose.dyPx !== 0 || pose.reveal !== 0) neverMoves = false
})
check('el logo no se mueve ni gira', neverMoves)

section('mobile: el clamp de ancho actúa')

const mobile = planIntroFlight(390, 844)
check(
  'el destino se recortó por ancho',
  (mobile.destination?.widthClamp ?? 1) < 1,
  `clamp ${(mobile.destination?.widthClamp ?? 1).toFixed(3)}`
)
check('y la tinta entra en la pantalla', mobile.ink.widthPx <= 390, px(mobile.ink.widthPx))

report('introFlight')
