/**
 * EL CURSOR DE DOS CAPAS — los datos y las dos compuertas.
 *
 * Sin React: `s3-cursor.invariant.ts` importa esto y afirma las dos compuertas
 * sin montar nada ni tocar el DOM.
 *
 * ── Qué es ────────────────────────────────────────────────────────────────
 *
 * Dos `div` de DOM, no canvas. Núcleo de 4×4 y halo de 36×36 con
 * `blur`, los dos circulares, los dos con `pointer-events: none`, y los dos
 * **interpolando hacia el puntero**, no clavados a él. [medido, COMPONENTS.md §4]
 *
 * ── Las tres reglas que transfieren, y una que corregimos ─────────────────
 *
 *   1. Sobre cualquier control interactivo el cursor propio **se apaga** y el
 *      nativo toma el relevo. Opacidad 0 en las dos capas.
 *   2. **El cursor nativo NUNCA se oculta.** `cursor: none` aparece en 0 de
 *      los 4.270 elementos que la medición recorrió. El propio se dibuja
 *      encima, no en su lugar: es lo que evita el problema de accesibilidad
 *      clásico del cursor custom. Hay un instrumento que afirma que la cadena
 *      `cursor: none` no existe en ningún archivo de este sprint.
 *   3. El color acompaña **a la sección, no a la página**. Con la paleta de
 *      develOP eso no cuesta un token: la capa raíz copia el
 *      `data-seccion="invertida"` de lo que hay debajo del puntero, y el
 *      bloque que S0 ya trae redefine `--color-tinta` y `--color-borde` sobre
 *      el propio cursor.
 *
 * Y la corrección: **con `prefers-reduced-motion` no se monta.** La referencia
 * no lo midió (`COMPONENTS.md`, hueco 4) y la interpolación ES movimiento —
 * un puntero que persigue al puntero es exactamente lo que la preferencia
 * pide apagar.
 *
 * ── Las dos compuertas ────────────────────────────────────────────────────
 *
 * Las dos son de MONTAJE, no de CSS: el componente devuelve `null` y el
 * `import()` perezoso no se ejecuta. Abajo de 1025 no se baja el chunk, igual
 * que el escenario de S1.
 */

import { ESCENARIO_MIN_ANCHO_PX } from './compuerta'

/**
 * El umbral de montaje: **el mismo 1025 de la compuerta del escenario**.
 *
 * No es una coincidencia ni una copia: es el único breakpoint estructural del
 * sistema —87,8% de las 5.118 reglas de media query medidas cuelgan de él— y
 * es el ancho al que la referencia deja de montar el cursor. Se importa en vez
 * de reescribirse para que exista UNA sola definición: si alguien mueve el
 * umbral, se mueve también acá.
 */
export const CURSOR_MIN_ANCHO_PX = ESCENARIO_MIN_ANCHO_PX

/** La consulta de ancho que se le pasa a `matchMedia`. */
export const CONSULTA_CURSOR = `(min-width: ${CURSOR_MIN_ANCHO_PX}px)`

/** La consulta de preferencia. La segunda compuerta. */
export const CONSULTA_MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)'

/**
 * LAS DOS COMPUERTAS, COMO FUNCIÓN PURA.
 *
 * Está separada del componente a propósito, y no por prolijidad: una decisión
 * que sólo existe adentro de un `if` de JSX **no se puede afirmar sin montar
 * React con un DOM**, y montar un DOM para comprobar una conjunción de dos
 * booleanos es una comprobación peor que la lógica que comprueba. Acá la tabla
 * de verdad se recorre entera —las cuatro combinaciones— y el componente
 * llama a esta función, que es lo que hace que la comprobación signifique algo.
 *
 * `s3-cursor.invariant.ts` verifica además, sobre el texto del componente, que
 * efectivamente la llame: una función pura que nadie usa no es una compuerta.
 */
export function deberiaMontarseElCursor(
  arribaDelUmbral: boolean,
  prefiereMenosMovimiento: boolean,
): boolean {
  if (!arribaDelUmbral) return false
  if (prefiereMenosMovimiento) return false
  return true
}

/**
 * Las medidas de las dos capas. [medido, COMPONENTS.md §4.1]
 *
 * Están acá como números para que el instrumento pueda contrastar contra ellos
 * lo que el CSS compone con tokens. El CSS **no escribe ninguno de estos
 * valores**: escribe `var(--spacing-1)`, `calc(var(--spacing-8) + var(--spacing-1))`
 * y `calc(var(--blur-panel) / 3)`, que dan 4, 36 y 4.
 */
export const CAPAS_MEDIDAS = {
  nucleo: { ladoPx: 4, desenfoquePx: 0 },
  halo: { ladoPx: 36, desenfoquePx: 4 },
  transicionMs: 400,
} as const

/**
 * Cuánto se acerca cada capa al puntero por fotograma.
 *
 * `[decidido]`, y es lo único de este componente que no sale de una medición:
 * la referencia interpola —con un `mousemove` sintético el núcleo avanzaba
 * ~10px cada 300ms con la razón decreciendo, y a los 3,1s no había convergido—
 * pero el coeficiente exacto no se midió, porque hacía falta movimiento real
 * sostenido y el instrumento de CDP no lo produce.
 *
 * Lo que sí está medido y acá se respeta es la RELACIÓN: **el halo va
 * sistemáticamente por detrás del núcleo**. Por eso son dos coeficientes y no
 * uno, y el del halo es menor.
 */
export const SEGUIMIENTO = { nucleo: 0.22, halo: 0.12 } as const

/** Distancia en px por debajo de la cual se considera convergido y se corta
 *  el bucle de animación. Evita un `requestAnimationFrame` eterno con el
 *  puntero quieto. */
export const EPSILON_PX = 0.05

/** Lo que se considera "un control interactivo" para apagar el cursor propio.
 *  Es la misma familia que el instrumento de foco usa para buscar focalizables,
 *  y por eso vive en un solo lugar. */
export const SELECTOR_DE_CONTROLES =
  'a[href], button, input, select, textarea, summary, [role="button"], [role="link"], [contenteditable="true"]'

/** El atributo que la sección invertida escribe, y que el cursor copia. */
export const ATRIBUTO_SECCION = 'data-seccion'
export const VALOR_SECCION_INVERTIDA = 'invertida'
