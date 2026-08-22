import { CHOREO_KEYFRAMES } from './choreography'
import { CHOREO_ARRAY_DOC, CHOREO_NOTES, CHOREO_SECTIONS } from './choreographyNotes'
import type { ChoreoVariant, ChoreoVariantId } from './choreographyTypes'
import { VARIANT_ARQUITECTONICA } from './variantArquitectonica'
import { VARIANT_CALIBRADA } from './variantCalibrada'
import { VARIANT_DRAMATICA } from './variantDramatica'
import { VARIANT_INTIMA } from './variantIntima'

/**
 * EL REGISTRO DE RECORRIDOS (S7 · ampliado en S9) — cinco coreografías, una
 * activa.
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 *
 * Un recorrido de cámara no se decide leyendo números: se decide mirando dos
 * versiones seguidas. Hasta S7 había una sola, así que la única forma de probar
 * una idea distinta era pisar la calibrada — y la calibrada costó una sesión
 * entera de trabajo humano.
 *
 * ── Qué cambió en S9 ───────────────────────────────────────────────────────
 *
 * La activa por defecto pasó a ser **`definitiva`**, el mix que el dueño del
 * proyecto eligió después de mirar las cuatro. Y la coreografía calibrada a
 * mano —que hasta S8 ERA `CHOREO_KEYFRAMES`— se mudó a `variantCalibrada.ts`
 * en vez de borrarse: sigue en la lista, sigue seleccionable, y sigue teniendo
 * sus comentarios intactos.
 *
 * O sea que ninguna de las cinco se perdió, y `CHOREO_KEYFRAMES` significa hoy
 * lo que su nombre dice: **la coreografía**, no una de cuatro candidatas.
 *
 * ── La regla que las mantiene comparables ──────────────────────────────────
 *
 * Todas comparten **los seis tramos y las ocho pantallas**, con los bordes en
 * múltiplos de 1/8. Lo que cambia es qué hace la cámara adentro de esa
 * estructura: si no compartieran el andamio, comparar dos variantes sería
 * comparar dos sitios distintos.
 *
 * ⚠️ **Lo que NO comparten es el arco del sol.** `LIGHT_ARC` es uno solo y S9
 * lo reapuntó para el recorrido definitivo. Elegir otra variante en el panel la
 * reproduce con ESA luz, que no es la que se compuso para ella: sirve para
 * comparar movimiento, no iluminación.
 *
 * ── Y la que las mantiene honestas ─────────────────────────────────────────
 *
 * **Cada keyframe de las tres propuestas de S7 va `derived: true`.** Es el uso
 * literal de esa marca: "esto lo calculó Claude, no lo compuso el humano
 * mirando". En la lista del editor aparecen con todos sus keyframes marcados,
 * que es exactamente el aviso que corresponde cuando lo que se está mirando es
 * una propuesta.
 *
 * La `definitiva` **no lleva ninguno**, y eso también es literal: sus seis
 * poses son decisiones tomadas, no relleno para guiar el camino. La `calibrada`
 * lleva nueve, que son los dos sub-movimientos de S4 y los siete arcos de S7.
 *
 * ── Qué se lleva cada variante ─────────────────────────────────────────────
 *
 * Su recorrido, su doc, sus separadores de tramo, sus notas Y **el nombre de la
 * constante y el archivo donde se pega**. Sin eso el exportador emitiría siempre
 * `CHOREO_KEYFRAMES` y pegar una variante calibrada pisaría el recorrido
 * definitivo — que es el peor error posible en este módulo y el más fácil de
 * cometer.
 */

/** La definitiva: el mix elegido en S9. Es la que se carga por default. */
export const VARIANT_DEFINITIVA: ChoreoVariant = {
  id: 'definitiva',
  label: 'definitiva',
  thesis:
    'Distancia y encuadre de la arquitectónica, altura y contraste de la dramática. Seis poses, cero relleno.',
  constName: 'CHOREO_KEYFRAMES',
  file: 'choreography.ts',
  keyframes: CHOREO_KEYFRAMES,
  doc: CHOREO_ARRAY_DOC,
  notes: CHOREO_NOTES,
  sections: CHOREO_SECTIONS,
}

/** En el orden en que se muestran: primero la activa, después la referencia. */
export const CHOREO_VARIANTS: readonly ChoreoVariant[] = [
  VARIANT_DEFINITIVA,
  VARIANT_CALIBRADA,
  VARIANT_INTIMA,
  VARIANT_ARQUITECTONICA,
  VARIANT_DRAMATICA,
]

export const DEFAULT_VARIANT_ID: ChoreoVariantId = 'definitiva'

/** Devuelve siempre una variante: un id desconocido cae en la definitiva. */
export function findVariant(id: ChoreoVariantId): ChoreoVariant {
  return CHOREO_VARIANTS.find((variant) => variant.id === id) ?? VARIANT_DEFINITIVA
}
