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

// ── 6 · Notas y separadores, sin huérfanos ──────────────────────────────────

section('Notas y separadores')

for (const variant of CHOREO_VARIANTS) {
  const names = new Set(variant.keyframes.map((keyframe) => keyframe.name))

  const orphanNotes = Object.keys(variant.notes).filter((name) => !names.has(name))
  check(
    `${variant.label}: ninguna nota apunta a un keyframe que no existe`,
    orphanNotes.length === 0,
    orphanNotes.join(', ')
  )

  const orphanSections = Object.keys(variant.sections).filter((name) => !names.has(name))
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
