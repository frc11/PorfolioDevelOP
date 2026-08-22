import { readFileSync } from 'node:fs'

import { CALIBRATIONS, at, check, report, section, sweep } from './introChecks'
import { planIntroFlight } from './introFlight'
import { sampleFill } from './introSampling'
import {
  CENTERED_LEGACY,
  CENTERED_WITHOUT_CLIP,
  CLIPPED,
  MESH_OUTSET_VB,
  STROKE_VISIBLE_WIDTH_VB,
  STROKE_WIDTH_VB,
  sampleSilhouetteOutsetVb,
  strokeOpacityForFill,
  vbToPx,
} from './introSilhouette'
import { HOME_INTRO_PHASES, buildTimeline } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DE LA SILUETA — **que apagar el contorno no cambie la
 * forma ni un píxel**, y que lo que quede siga calzando con el mesh 3D.
 *
 *     npx tsx src/components/layout/home-intro/introSilhouette.invariant.ts
 *
 * ── Por qué hace falta ─────────────────────────────────────────────────────
 *
 * El bug que esto guarda no era de la secuencia sino de SVG: un `stroke` se
 * pinta centrado sobre el borde, así que la mitad de su ancho queda por fuera de
 * lo que el `fill` cubre, y al apagarlo la silueta se achicaba de golpe. Se veía
 * a ojo, pero **no se puede ver en una verificación automatizada** — el intro no
 * corre bajo `navigator.webdriver`. Lo que sí se puede es modelar cuánto pinta
 * cada capa por fuera del path y exigir que ese número no cambie.
 *
 * El control negativo no es decorativo: mide el bug real, en píxeles, con el
 * modelo `CENTERED`. Si alguien saca el clip, esto se pone rojo con el número
 * que el humano vio en pantalla.
 */

const FRAME_S = 1 / 60

const VIEWPORTS: readonly (readonly [string, number, number])[] = [
  ['desktop 1440×810', 1440, 810],
  ['desktop 1920×1080', 1920, 1080],
  ['mobile 390×844', 390, 844],
]

// ── El apagado del contorno ─────────────────────────────────────────────────

section('🔴 el cuadro anterior y el posterior al apagado tienen la MISMA silueta')

for (const [name, phases] of CALIBRATIONS) {
  const t = buildTimeline(phases)
  const before = at(t, t.fillEndS - FRAME_S)
  const after = at(t, t.fillEndS + FRAME_S)

  check(
    `${name} — los dos cuadros straddlean el apagado`,
    strokeOpacityForFill(sampleFill(t, before)) === 1 &&
      strokeOpacityForFill(sampleFill(t, after)) === 0,
    'si no, la comprobación no estaría mirando el momento'
  )
  check(
    `${name} — y la silueta es idéntica`,
    sampleSilhouetteOutsetVb(CLIPPED, t, before) === sampleSilhouetteOutsetVb(CLIPPED, t, after)
  )
}

section('y no cambia en ningún otro instante tampoco')

for (const [name, phases] of CALIBRATIONS) {
  const t = buildTimeline(phases)
  let constant = true
  sweep((p) => {
    if (sampleSilhouetteOutsetVb(CLIPPED, t, p) !== 0) constant = false
  })
  check(`${name} — lo pintado nunca sale del path`, constant)
}

// ── El calce con el mesh ────────────────────────────────────────────────────

section('🔴 la silueta rellena sigue calzando con el mesh 3D')

const d = buildTimeline(HOME_INTRO_PHASES)

check(
  'el SVG pinta exactamente el path',
  sampleSilhouetteOutsetVb(CLIPPED, d, 1) === 0,
  'desfase 0 unidades de viewBox'
)
check(
  'el mesh asoma solo su bisel',
  MESH_OUTSET_VB === 1,
  `${MESH_OUTSET_VB} unidad de viewBox por lado — geometría real del objeto`
)

for (const [label, w, h] of VIEWPORTS) {
  const plan = planIntroFlight(w, h)
  const meshPx = vbToPx(MESH_OUTSET_VB, plan.ink.heightPx)
  check(
    `${label} — la diferencia es sub-píxel`,
    meshPx < 1,
    `${meshPx.toFixed(2)} px con la tinta de ${plan.ink.heightPx.toFixed(0)} px`
  )
}

check(
  'y el arreglo no la tocó: el mesh escala igual que antes',
  readFileSync(new URL('./IntroLogoCanvas.tsx', import.meta.url), 'utf8').includes(
    'inkHeightPx.get() / LOGO_INK_VIEWBOX.height'
  ),
  'mapea el PATH a inkHeightPx, que es lo que scene-framing proyecta como destino'
)

// ── Que el 0 no sea una mentira: el clip existe de verdad ──────────────────

section('🔴 el contorno está realmente clipeado contra la silueta')

const source = readFileSync(new URL('./IntroLogoStroke.tsx', import.meta.url), 'utf8')

check('hay un <clipPath>', source.includes('<clipPath id={clipId}>'))
check(
  'y recorta con el MISMO path que rellena',
  (source.match(/d=\{LOGO_PATH_D\}/g) ?? []).length === 3,
  'relleno + contorno + recorte'
)
check('el contorno está adentro del grupo recortado', /<g clipPath=\{`url\(#\$\{clipId\}\)`\}>/.test(source))
check('usa el ancho declarado del módulo', source.includes('strokeWidth={STROKE_WIDTH_VB}'))
check(
  'y ya no necesita overflow visible',
  !source.includes("overflow: 'visible'"),
  'nada se pinta fuera de la caja'
)

section('el grosor aparente del hairline no cambió')

check(
  'se ve la mitad del ancho declarado',
  STROKE_VISIBLE_WIDTH_VB === STROKE_WIDTH_VB / 2 && STROKE_VISIBLE_WIDTH_VB === 7,
  `${STROKE_VISIBLE_WIDTH_VB} unidades, las mismas que antes del arreglo`
)
for (const [label, w, h] of VIEWPORTS) {
  const plan = planIntroFlight(w, h)
  const widthPx = vbToPx(STROKE_VISIBLE_WIDTH_VB, plan.ink.heightPx)
  check(`${label} — hairline de ${widthPx.toFixed(2)} px`, widthPx > 1 && widthPx < 6)
}

// ── Control negativo: el bug, medido ───────────────────────────────────────

section('control negativo — el contorno centrado, que es lo que fallaba')

const before = at(d, d.fillEndS - FRAME_S)
const after = at(d, d.fillEndS + FRAME_S)

for (const model of [CENTERED_LEGACY, CENTERED_WITHOUT_CLIP]) {
  const jumpVb =
    sampleSilhouetteOutsetVb(model, d, before) - sampleSilhouetteOutsetVb(model, d, after)
  check(
    `${model.name} — detecta que la silueta cambiaba al apagar el contorno`,
    jumpVb > 0,
    `${jumpVb} unidades de viewBox por lado`
  )
  for (const [label, w, h] of VIEWPORTS) {
    const plan = planIntroFlight(w, h)
    const jumpPx = vbToPx(jumpVb, plan.ink.heightPx)
    check(
      `${model.name} / ${label} — el salto era visible`,
      jumpPx > 1,
      `${jumpPx.toFixed(2)} px por lado · ${(jumpPx * 2).toFixed(2)} px de ancho total`
    )
  }
}

check(
  'mientras que el modelo vigente no salta',
  sampleSilhouetteOutsetVb(CLIPPED, d, before) - sampleSilhouetteOutsetVb(CLIPPED, d, after) === 0
)

section('la regla del apagado, sola')

check('con el relleno a medias el contorno está', strokeOpacityForFill(0.99) === 1)
check('y en cuanto termina, se va', strokeOpacityForFill(1) === 0)
check('sin estados intermedios', strokeOpacityForFill(0) === 1 && strokeOpacityForFill(1.5) === 0)

report('introSilhouette')
