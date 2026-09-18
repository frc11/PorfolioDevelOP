/**
 * COMPROBACIONES DE S7 · el bookkeeping de las variantes de recorrido: notas y
 * separadores sin huérfanos, nombre de export único, y el flag `derived`.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-variantes.invariant.ts
 *
 * ⚠️ **Modo pulido sacó las tesis de ocupación/desborde/distancia/cruces entre
 * variantes** —"el logo llena el cuadro", "el logo nunca desborda", "recorre
 * el rango vertical entero"—: eran composición.
 */
import { CHOREO_TRAMOS } from '@/app/v3/_lib/escena/choreography'
import { CHOREO_VARIANTS } from '../_components/choreographyVariants'
import type { ChoreoVariantId } from '@/app/v3/_lib/escena/choreographyTypes'
import { check, report, section } from './harness'

const byId = new Map(CHOREO_VARIANTS.map((variant) => [variant.id, variant]))

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
