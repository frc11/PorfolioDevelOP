/**
 * EL NIVEL DE CALIDAD DE LA ESCENA — la etiqueta, y nada más.
 *
 * ── Por qué este archivo no tiene UN SOLO import ──────────────────────────
 *
 * Porque lo consume `_componentes/EscenarioCompuerta.tsx`, **que viaja en la
 * carga inicial de `/v3` en todos los anchos**. Cualquier cosa que este módulo
 * importara viajaría con él, y el contrato de la escena
 * (`contrato.ts`, `PAQUETES_DE_TRES`) prohíbe que `three` o `@react-three/*`
 * aparezcan ahí. Con cero imports la propiedad se cumple por construcción y no
 * por vigilancia.
 *
 * Los NÚMEROS de cada nivel viven en `ajustes.ts`, que sí importa del árbol de
 * la escena y por eso sólo se alcanza **desde adentro del chunk perezoso**. La
 * partición es exactamente esa: acá la decisión, allá los valores.
 *
 * ── Qué cambió, y qué NO ──────────────────────────────────────────────────
 *
 * Hasta este sprint el umbral de 1025 decidía DOS cosas con una sola lectura:
 * si la escena se montaba y si la coreografía se descargaba. **Se separaron.**
 *
 *   · **La escena se monta en TODO ancho.** Es la decisión del dueño, y es la
 *     que toma la referencia: manda el mundo a 390 y no manda la coreografía.
 *     `EscenarioCompuerta` ya no devuelve `null`.
 *   · **La coreografía sigue en 1025, sin moverse un píxel.** La deciden
 *     `_secciones/CompuertaDelHome.tsx`, `_lib/cursor.ts` y
 *     `_lib/scrollSuave.ts`, las tres contra `ESCENARIO_MIN_ANCHO_PX`, que no
 *     se tocó.
 *
 * Lo que el umbral decide AHORA para la escena no es si existe: es **con cuánto
 * presupuesto de píxel corre**. La misma lectura, el mismo hook, otra pregunta.
 *
 * ⚠️ **DEUDA DE NOMBRE, DECLARADA Y NO PAGADA.** `ESCENARIO_MIN_ANCHO_PX` ya no
 * gobierna el montaje del escenario, así que su nombre quedó describiendo algo
 * que no hace. Renombrarlo es mecánico y es de 19 archivos —10 de producto y 9
 * de instrumentos, varios de los cuales afirman el literal
 * `'ESCENARIO_MIN_ANCHO_PX'` sobre el FUENTE— y **no movería un byte de
 * comportamiento**. Este sprint no lo hace: la constante sigue atada por
 * invariante a `--breakpoint-escritorio` (`tokens.invariant.ts`) y ése es el
 * significado que le queda, que es verdadero. Queda anotado para quien lo tome.
 */

/**
 * Los dos niveles. Son dos y no una escala continua a propósito: la referencia
 * degrada por escalones (apaga el post, baja una subdivisión, clava el
 * `pixelRatio`), no con una perilla.
 *
 * `plena` son **exactamente los valores de hoy**, sin mover uno: es el nivel con
 * el que se compuso y se aprobó el hero a 1440 y a 1920, y este sprint tiene
 * prohibido re-componerlo.
 */
export type NivelDeCalidad = 'plena' | 'compacta'

/**
 * LA DECISIÓN, como función pura — para poder afirmarla sin montar React ni
 * tocar un DOM, que es la misma razón por la que `deberiaCorrerElScrollSuave` y
 * `deberiaMontarseElCursor` viven fuera de sus componentes.
 *
 * ⚠ **Recibe el booleano; no lee el ancho.** Quien lee es `useAnchoMinimo` con
 * `CONSULTA_ESCENARIO`, o sea el MISMO umbral y el MISMO hook que las otras tres
 * compuertas. Si alguien mueve el 1025, se mueve también el escalón de calidad,
 * que es la propiedad que hace que siga siendo un solo número.
 */
export function calidadPorAncho(arribaDelUmbral: boolean): NivelDeCalidad {
  return arribaDelUmbral ? 'plena' : 'compacta'
}
