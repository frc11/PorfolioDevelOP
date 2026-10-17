/**
 * TRABAJOS · LA GEOMETRÍA QUE QUEDÓ VIVA. **[B1]**
 *
 * El túnel se fue al archivo (`_archivo/tunel-portfolio/`, con su copia de este archivo entera) y con él la geometría del cartel,
 * las capas, la espera, la salida y los rieles del regulador. Quedan acá tres cosas que no eran del túnel:
 *
 *   · **las medidas de la sección según la tabla** (`secciones.ts`): lo que la escena lee para sus nudos. La sección nueva mide más
 *     (los pasos del selector, `portfolio/pasos.ts`) y la escena lo descuenta;
 *   · **las dos líneas del disparo de la noche** (la gota, `CapaDeLaGota.tsx`);
 *   · **el foco de la escena** (lo usa la placa del contacto).
 */

import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'
import { PANTALLAS_DE_NUMEROS } from '../../_lib/secciones'
import { pantallasDe, seccionDe } from '../_contrato/forma'

/**
 * Cuántas pantallas se monta la sección sobre Números, leídas de la tabla. Es lo que adelanta a Portfolio al cambio de plano de
 * la cámara (`secciones.ts`).
 */
export const SOLAPE_DE_LA_SECCION = seccionDe('trabajos').solape ?? 0

/**
 * Las pantallas que la sección mide SEGÚN LA TABLA: su alto más el solape. El progreso de P7 va de «tope abajo» a «pie abajo»
 * sobre la caja real, que arranca el solape antes. [B1] La sección real suma los pasos del selector; esto es lo que la escena ve.
 */
export const PANTALLAS_DE_LA_SECCION = pantallasDe(seccionDe('trabajos')) + SOLAPE_DE_LA_SECCION

/** Las pantallas de la tabla en px de la regla (contra 900, `ALTO_DE_VIEWPORT_DE_LA_REFERENCIA`): 6.813. */
export const PX_DE_LA_SECCION = PANTALLAS_DE_LA_SECCION * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA

/** Una fracción del progreso de la sección de la tabla, a partir de píxeles de la regla. */
export function fraccionDeScroll(px: number): number {
  return px / PX_DE_LA_SECCION
}

/**
 * ⚠️ **LAS DOS LÍNEAS DEL BARRIDO, en porcentaje del alto de la ventana.**
 *
 * Son el `rootMargin` de dos `IntersectionObserver` sobre el panel de Trabajos, o sea **cuánto se BAJA el borde de abajo de la
 * raíz**. Positivo = la raíz se estira hacia abajo, así que la sección cruza la línea **antes de asomar**.
 *
 * `ida` se deriva: cuando el pie de Quiénes somos toca el tope del cuadro, el tope de Trabajos está exactamente
 * `(PANTALLAS_DE_NUMEROS − 1)` alturas de ventana por debajo del pie. Estirar la raíz justo eso hace que la noche empiece en el
 * mismo píxel de scroll en que termina Quiénes somos. Si Números cambia de alto, la línea lo sigue sola.
 *
 * ⚠️ **`vuelta` es MÁS GRANDE, y el orden importa.** Una raíz más estirada se cruza ANTES bajando y se abandona DESPUÉS subiendo:
 * esos ocho puntos entre una y otra son la histéresis (sin ellos, un dedo apoyado en el umbral hace ir y venir el barrido).
 *
 * ⚠️ **SIN EL SOLAPE, y es a propósito.** La gota no observa el panel sino la caja que `Panel` pone donde el panel estaría sin
 * subir sobre Números: las líneas son las de siempre a cualquier ancho.
 */
export const DISPARO_DE_LA_NOCHE = {
  ida: (PANTALLAS_DE_NUMEROS - 1) * 100,
  vuelta: (PANTALLAS_DE_NUMEROS - 1) * 100 + 8,
} as const

/** [NAVBAR] La línea de la ida en píxeles: la caja sin el solape la cruza con su tope a esta distancia del cuadro. */
export const lineaDeLaNoche = (alto: number): number => alto * (1 + DISPARO_DE_LA_NOCHE.ida / 100)

/**
 * El foco de la cámara de la escena, en px a 900 de alto: la perspectiva con la que el DOM se encuentra con el 3D (el túnel
 * huía la mitad de esto; hoy lo usa la placa del contacto, `_chrome/contacto/placa.ts`).
 */
export const FOCO_DE_LA_ESCENA_PX = 1427
