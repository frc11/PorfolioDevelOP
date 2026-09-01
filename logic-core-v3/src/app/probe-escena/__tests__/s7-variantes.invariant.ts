/**
 * COMPROBACIONES DE S7 · las tres variantes de recorrido.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-variantes.invariant.ts
 *
 * Cada variante afirma una tesis en su doc —"el logo llena el cuadro", "el logo
 * nunca desborda", "recorre el rango vertical entero"— y eso es exactamente el
 * tipo de afirmación que envejece mal en cuanto alguien mueve un número. Acá se
 * verifica que las tres sigan siendo ciertas, contra los datos.
 *
 * ⚠️ **S9: la referencia contra la que se comparan es `calibrada`, no la activa.**
 * Las tres tesis se escribieron contra la coreografía calibrada a mano, que
 * hasta S8 era `CHOREO_KEYFRAMES` y hoy vive en `variantCalibrada.ts`. Comparar
 * contra el recorrido definitivo diría otra cosa y no sería lo que las tesis
 * afirman. Lo que le toca al definitivo se verifica en `s9-definitiva`.
 */
import { CHOREO_TRAMOS } from '@/app/v3/_lib/escena/choreography'
import { CHOREO_VARIANTS } from '../_components/choreographyVariants'
import type { ChoreoKeyframe, ChoreoVariantId } from '@/app/v3/_lib/escena/choreographyTypes'
import { LOGO_H, check, frameHeight, report, section } from './harness'

// ── 5 · Las tesis de las variantes son ciertas ──────────────────────────────

section('Las variantes hacen lo que su doc dice')

function occupancy(keyframes: readonly ChoreoKeyframe[]): { min: number; max: number; over: number } {
  let min = Infinity
  let max = -Infinity
  let over = 0
  for (const keyframe of keyframes) {
    const eye = Math.hypot(keyframe.pose.distance, keyframe.pose.height)
    const share = LOGO_H / frameHeight(eye)
    min = Math.min(min, share)
    max = Math.max(max, share)
    if (share > 1) over += 1
  }
  return { min, max, over }
}

const byId = new Map(CHOREO_VARIANTS.map((variant) => [variant.id, variant]))
const calibrada = occupancy(byId.get('calibrada')!.keyframes)
const intima = occupancy(byId.get('intima')!.keyframes)
const arq = occupancy(byId.get('arquitectonica')!.keyframes)

const intimaShare = intima.over / byId.get('intima')!.keyframes.length
const calibradaShare = calibrada.over / byId.get('calibrada')!.keyframes.length
check(
  'íntima: el logo desborda el cuadro en más proporción de poses que la calibrada',
  intimaShare > calibradaShare,
  `${(intimaShare * 100).toFixed(0)}% (${intima.over}/${byId.get('intima')!.keyframes.length}) contra ${(calibradaShare * 100).toFixed(0)}% (${calibrada.over}/${byId.get('calibrada')!.keyframes.length})`
)
check(
  'íntima: ocupa más alto de cuadro que la calibrada en su pose más chica',
  intima.min > calibrada.min,
  `mínimo ${(intima.min * 100).toFixed(0)}% contra ${(calibrada.min * 100).toFixed(0)}%`
)
check(
  'arquitectónica: el logo NUNCA desborda',
  arq.over === 0,
  `ocupa entre ${(arq.min * 100).toFixed(0)}% y ${(arq.max * 100).toFixed(0)}% del alto`
)

/**
 * ⚠️ **LOS CONTROLES POSITIVOS DE ESTE ARCHIVO (SITIO-S10).** Las tesis de arriba
 * corrían sin una sola entrada equivocada: `occupancy()` podía estar devolviendo
 * cualquier cosa y "nunca desborda" habría salido en verde igual. Se le dan dos
 * recorridos FABRICADOS —uno pegado al logo y otro lejano— y se corre la MISMA
 * función.
 */
function fabricar(distance: number, heights: readonly number[]): ChoreoKeyframe[] {
  return heights.map((height, i) => ({
    name: `f${i}`,
    at: i / Math.max(1, heights.length - 1),
    pose: { angleDeg: 0, height, distance, frameX: 0, frameY: 0 },
  }))
}
const pegado = occupancy(fabricar(1, [0, 0]))
check(
  'control positivo — `occupancy` VE un recorrido pegado al logo: desborda en todas sus poses',
  pegado.over === 2 && pegado.min > 1,
  `${(pegado.min * 100).toFixed(0)}% del alto a distancia 1 — el predicado de "nunca desborda" da falso acá`
)
const lejano = occupancy(fabricar(200, [0, 0]))
check(
  'control positivo — y VE uno lejano: no desborda nunca, y ocupa dos órdenes menos',
  lejano.over === 0 && lejano.max * 100 < pegado.min,
  `${(lejano.max * 100).toFixed(2)}% del alto a distancia 200 contra ${(pegado.min * 100).toFixed(0)}% a distancia 1 — si los dos dieran lo mismo, la función no estaría midiendo la distancia`
)
check(
  'arquitectónica: siempre más lejos que la calibrada en su pose más lejana',
  Math.max(...byId.get('arquitectonica')!.keyframes.map((k) => k.pose.distance)) >
    Math.max(...byId.get('calibrada')!.keyframes.map((k) => k.pose.distance))
)
check(
  'íntima: siempre más cerca que la calibrada en su pose más cercana',
  Math.min(...byId.get('intima')!.keyframes.map((k) => k.pose.distance)) <
    Math.min(...byId.get('calibrada')!.keyframes.map((k) => k.pose.distance))
)

/** Cuántas veces el recorrido cruza el nivel del objeto (altura 0). */
function crossings(keyframes: readonly ChoreoKeyframe[]): number {
  let count = 0
  for (let i = 1; i < keyframes.length; i += 1) {
    const a = keyframes[i - 1].pose.height
    const b = keyframes[i].pose.height
    if ((a > 0 && b < 0) || (a < 0 && b > 0)) count += 1
  }
  return count
}
check(
  'dramática: cruza el nivel del objeto más veces que la calibrada',
  crossings(byId.get('dramatica')!.keyframes) > crossings(byId.get('calibrada')!.keyframes),
  `${crossings(byId.get('dramatica')!.keyframes)} contra ${crossings(byId.get('calibrada')!.keyframes)}`
)
check(
  'control positivo — `crossings` da CERO en un recorrido que nunca baja del nivel del objeto',
  crossings(fabricar(9, [1, 2, 3, 4])) === 0 && crossings(fabricar(9, [1, -1, 1, -1])) === 3,
  'el contador cuenta cambios de signo, no keyframes: un recorrido alto da 0 y uno alternado da 3'
)

// ── 6 · Notas y separadores, sin huérfanos ──────────────────────────────────

section('Notas y separadores')

/**
 * El buscador de huérfanos, contra un nombre que NINGUNA variante tiene. Sin
 * esto, "ninguna nota apunta a un keyframe que no existe" sale en verde también
 * si el `Set` de nombres estuviera mal armado y aceptara cualquier cosa.
 */
const huerfanos = (nombres: ReadonlySet<string>, claves: readonly string[]): string[] =>
  claves.filter((name) => !nombres.has(name))
check(
  'control positivo — el buscador de huérfanos VE una nota que apunta a un keyframe inexistente',
  CHOREO_VARIANTS.every(
    (variant) =>
      huerfanos(new Set(variant.keyframes.map((k) => k.name)), ['este-keyframe-no-existe']).length === 1
  ),
  'la misma función que arriba devuelve vacío, corrida contra una clave inventada'
)


for (const variant of CHOREO_VARIANTS) {
  const names = new Set(variant.keyframes.map((keyframe) => keyframe.name))

  const orphanNotes = huerfanos(names, Object.keys(variant.notes))
  check(
    `${variant.label}: ninguna nota apunta a un keyframe que no existe`,
    orphanNotes.length === 0,
    orphanNotes.join(', ')
  )

  const orphanSections = huerfanos(names, Object.keys(variant.sections))
  check(
    `${variant.label}: ningún separador apunta a un keyframe que no existe`,
    orphanSections.length === 0,
    orphanSections.join(', ')
  )

  check(
    `${variant.label}: tiene un separador por cada uno de los seis tramos`,
    Object.keys(variant.sections).length === CHOREO_TRAMOS.length,
    `${Object.keys(variant.sections).length} separadores`
  )
}

const constNames = new Set(CHOREO_VARIANTS.map((variant) => variant.constName))
check('cada variante exporta a una constante distinta', constNames.size === CHOREO_VARIANTS.length)
const files = new Set(CHOREO_VARIANTS.map((variant) => variant.file))
check('cada variante se pega en un archivo distinto', files.size === CHOREO_VARIANTS.length)
/**
 * Las tres PROPUESTAS de S7 llevan todo marcado; los dos recorridos que un
 * humano decidió, no. `definitiva` no tiene un solo derivado —sus seis poses
 * son decisiones— y `calibrada` tiene los nueve que S4 y S7 le agregaron.
 */
const PROPUESTAS: readonly ChoreoVariantId[] = ['intima', 'arquitectonica', 'dramatica']
check(
  'las tres propuestas de S7 llevan todas sus poses marcadas `derived`',
  CHOREO_VARIANTS.filter((variant) => PROPUESTAS.includes(variant.id)).every((variant) =>
    variant.keyframes.every((keyframe) => keyframe.derived === true)
  )
)
check(
  'la definitiva no tiene un solo keyframe derivado',
  byId.get('definitiva')!.keyframes.every((keyframe) => keyframe.derived !== true),
  `${byId.get('definitiva')!.keyframes.length} keyframes`
)
check(
  'la calibrada conserva sus nueve derivados',
  byId.get('calibrada')!.keyframes.filter((keyframe) => keyframe.derived === true).length === 9
)

report('s7 · variantes')
