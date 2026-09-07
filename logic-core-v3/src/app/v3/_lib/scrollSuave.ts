import { ESCENARIO_MIN_ANCHO_PX } from './compuerta'

/**
 * EL SCROLL SUAVE DE /v3 — los datos y la compuerta, sin React.
 *
 * Vive aparte del componente por la misma razón que `compuerta.ts`: una
 * decisión que sólo existe adentro de un `if` de JSX **no se puede afirmar sin
 * montar React con un DOM**, y montar un DOM para comprobar una conjunción de
 * dos booleanos es una comprobación peor que la lógica que comprueba.
 *
 * ── ⚠️ POR QUÉ /v3 CONSTRUYE SU PROPIA INSTANCIA ─────────────────────────
 *
 * `SmoothScroll` —el del layout RAÍZ, que envuelve al sitio vivo entero— se
 * sale de `/v3` con un `return` temprano desde S1. Esa exclusión era correcta
 * cuando se escribió: el esqueleto de v3 pinnea con `position: sticky` y la
 * afirmación que había que poder juzgar era *«el ritmo funciona SIN UNA LÍNEA
 * DE JS»*. Con un motor de scroll encima, esa afirmación no se podía sostener
 * ni desmentir.
 *
 * **B5 la revisó y la dio vuelta**, y el `return` NO se toca. Prender Lenis
 * desde acá y no desde allá compra tres cosas a la vez:
 *
 *   1. **El sitio vivo no cambia de comportamiento**, ni por un camino nuevo ni
 *      por una condición nueva. `SmoothScroll.tsx` recibe un solo cambio
 *      aditivo —la configuración pasa a ser un `export const`— y sigue
 *      construyendo exactamente lo que construía, cuando lo construía.
 *   2. **`TransitionContext.tsx` sigue congelado y sigue viendo `null`.** Es él
 *      quien consume `useLenis()`, y en `/v3` el contexto de `SmoothScroll`
 *      seguirá vacío porque `SmoothScroll` sigue sin construir nada ahí. Que
 *      `triggerTransition` no se use en /v3 deja de ser una condición de la que
 *      dependemos: no hay instancia que pudiera detener.
 *   3. **Las compuertas quedan donde ya viven.** El umbral de 1025 y
 *      `prefers-reduced-motion` son de /v3 y están en `/v3/_lib`. Llevarlos a
 *      `SmoothScroll` habría metido una condición de /v3 adentro de un archivo
 *      que gobierna seis rutas de producto.
 *
 * ── ⚠️ EL MODO DE LENIS, MEDIDO ANTES DE PRENDERLA ────────────────────────
 *
 * Lenis no «suaviza el scroll»: **reemplaza el valor de la posición**, y toda la
 * coreografía de /v3 lee esa posición. Hay dos modos y hacen cosas opuestas —
 * si conduce el scroll NATIVO todo se suaviza gratis; si transforma un
 * ENVOLTORIO, el `sticky` deja de pegarse y se caen Servicios, Trabajos y el
 * anclaje entero.
 *
 * **Corre el primero, y está medido, no deducido.** Sobre `lenis@1.3.25`:
 * `wrapper` cae por default en `window` y `setScroll` hace
 * `wrapper.scrollTo({ top, behavior: 'instant' })`. Y sobre el DOM renderizado
 * del sitio donde ya corría, un paso de rueda de 1000 px muestreado por `rAF`:
 * `window.scrollY` interpola 0 → 1000 mientras el `transform` de `<html>`,
 * `<body>` y el primer hijo del `<body>` lee `none` en **las 138 muestras**.
 * Con control positivo: al ponerle una transformada a mano al `<body>`, el
 * mismo lector la ve.
 *
 * ── La otra vía por la que Lenis podría romper el `sticky`, acotada ────────
 *
 * `lenis/dist/lenis.css` trae `.lenis:not(.lenis-autoToggle).lenis-stopped {
 * overflow: clip }` sobre el `<html>`. La regla necesita la clase
 * `lenis-stopped`, y esa clase la escribe Lenis **sólo al llamar `stop()`**.
 * En /v3 nadie lo llama: no hay `stop()` en el árbol, y el único consumidor del
 * contexto que lo usaba —`TransitionContext`— ve `null` acá. Se afirma sobre el
 * fuente y se verifica sobre el `<html>` vivo.
 */

/**
 * El umbral de montaje: **el mismo 1025 de la compuerta del escenario**.
 *
 * Se importa en vez de reescribirse para que exista UNA sola definición. No es
 * una coincidencia estética: abajo de 1025 la referencia usa el scroll nativo y
 * es decisión tomada, y es el mismo ancho al que /v3 deja de montar el
 * escenario y el cursor. Las tres fuentes de movimiento de B5 cruzan el umbral
 * juntas o no cruzan.
 */
export const SCROLL_SUAVE_MIN_ANCHO_PX = ESCENARIO_MIN_ANCHO_PX

/** La consulta de ancho que se le pasa a `matchMedia`. */
export const CONSULTA_SCROLL_SUAVE = `(min-width: ${SCROLL_SUAVE_MIN_ANCHO_PX}px)`

/**
 * LAS DOS COMPUERTAS, COMO FUNCIÓN PURA — la misma forma que
 * `deberiaMontarseElCursor`, y a propósito: las tres piezas de B5 se prenden
 * con la misma tabla de verdad, y que se lea igual es la mitad de poder
 * afirmar que se comportan igual.
 */
export function deberiaCorrerElScrollSuave(
  arribaDelUmbral: boolean,
  prefiereMenosMovimiento: boolean,
): boolean {
  if (!arribaDelUmbral) return false
  if (prefiereMenosMovimiento) return false
  return true
}

/**
 * El atributo que el módulo perezoso escribe en el `<html>` mientras corre.
 *
 * No es decoración: es lo único que un instrumento del NAVEGADOR puede leer
 * para saber si la instancia existe. La clase `lenis` que la propia librería
 * agrega no alcanza —la escribe `SmoothScroll` también, en toda ruta vieja— así
 * que no distingue «Lenis corre» de «Lenis corre POR /v3».
 */
export const ATRIBUTO_SCROLL_SUAVE = 'data-v3-scroll-suave'
