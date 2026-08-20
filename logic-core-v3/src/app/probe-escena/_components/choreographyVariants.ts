import { CHOREO_KEYFRAMES } from './choreography'
import { CHOREO_ARRAY_DOC, CHOREO_NOTES, CHOREO_SECTIONS } from './choreographyNotes'
import type { ChoreoVariant, ChoreoVariantId } from './choreographyTypes'
import { VARIANT_ARQUITECTONICA } from './variantArquitectonica'
import { VARIANT_DRAMATICA } from './variantDramatica'
import { VARIANT_INTIMA } from './variantIntima'

/**
 * EL REGISTRO DE RECORRIDOS (S7) — cuatro coreografías, una activa.
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 *
 * Un recorrido de cámara no se decide leyendo números: se decide mirando dos
 * versiones seguidas. Hasta acá había una sola, así que la única forma de probar
 * una idea distinta era pisar la calibrada — y la calibrada costó una sesión
 * entera de trabajo humano.
 *
 * Con el registro hay cuatro al mismo tiempo y se cambia en vivo desde el panel.
 * **La base se carga por default y no se toca**; las tres variantes son
 * propuestas con tesis propia, no ajustes de ella.
 *
 * ── La regla que las mantiene comparables ──────────────────────────────────
 *
 * Todas comparten **los seis tramos y las ocho pantallas**, con los bordes en
 * múltiplos de 1/8. Lo que cambia es qué hace la cámara adentro de esa
 * estructura: si no compartieran el andamio, comparar dos variantes sería
 * comparar dos sitios distintos.
 *
 * ── Y la que las mantiene honestas ─────────────────────────────────────────
 *
 * **Cada keyframe de una variante va `derived: true`.** Es el uso literal de esa
 * marca: "esto lo inventó Claude, no lo compuso el humano mirando". En la lista
 * del editor las tres variantes aparecen con todos sus keyframes marcados, que
 * es exactamente el aviso que corresponde cuando lo que se está mirando es una
 * propuesta.
 *
 * ── Qué se lleva cada variante ─────────────────────────────────────────────
 *
 * Su recorrido, su doc, sus separadores de tramo, sus notas Y **el nombre de la
 * constante y el archivo donde se pega**. Sin eso el exportador emitiría siempre
 * `CHOREO_KEYFRAMES` y pegar una variante calibrada pisaría la base — que es el
 * peor error posible en este módulo y el más fácil de cometer.
 */

/** La base: la coreografía calibrada a mano. Es la que se carga por default. */
export const VARIANT_BASE: ChoreoVariant = {
  id: 'base',
  label: 'base',
  thesis: 'La coreografía que el humano calibró mirando la escena. Es la referencia.',
  constName: 'CHOREO_KEYFRAMES',
  file: 'choreography.ts',
  keyframes: CHOREO_KEYFRAMES,
  doc: CHOREO_ARRAY_DOC,
  notes: CHOREO_NOTES,
  sections: CHOREO_SECTIONS,
}

/** En el orden en que se muestran: primero la referencia, después las propuestas. */
export const CHOREO_VARIANTS: readonly ChoreoVariant[] = [
  VARIANT_BASE,
  VARIANT_INTIMA,
  VARIANT_ARQUITECTONICA,
  VARIANT_DRAMATICA,
]

export const DEFAULT_VARIANT_ID: ChoreoVariantId = 'base'

/** Devuelve siempre una variante: un id desconocido cae en la base. */
export function findVariant(id: ChoreoVariantId): ChoreoVariant {
  return CHOREO_VARIANTS.find((variant) => variant.id === id) ?? VARIANT_BASE
}
