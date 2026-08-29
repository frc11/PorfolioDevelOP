/**
 * LA ESCENOGRAFÍA DEL DEMO — cuánto scroll le toca a cada patrón, y de dónde
 * sale ese número.
 *
 * La ruta `/v3/motion` tiene que dejar leer cada patrón **completo, ida y
 * vuelta**. Cuánto scroll hace falta para eso no es una preferencia: sale del
 * ancla del propio patrón, porque el ancla es lo que define el recorrido.
 *
 * Para los nueve, el borde del elemento va de `top` a `bottom`, así que:
 *
 *     recorrido = alto + viewport·(fracciónInicio − fracciónFin)
 *                      + (pxInicio − pxFin)
 *
 * De ahí se despeja el alto que hace falta para un recorrido objetivo. Es una
 * función, no una tabla de números elegidos a ojo, y por eso los `svh` de esta
 * ruta tienen un instrumento que los produce.
 *
 * ⚠ Estos números son geometría del INSTRUMENTO, no del sistema de diseño. No
 * hay —ni tiene que haber— un token para "cuánto scroll gasta una demostración".
 * Los tokens gobiernan color, tipografía, espaciado y duraciones de CSS, y esta
 * ruta no declara ni un color ni un espaciado fuera de ellos.
 */

import type { ParDeAnclas } from './anclas'

/**
 * Recorrido objetivo por patrón, en centésimas de viewport.
 *
 * Medio viewport: alcanza para leer el gesto entero sin que se sienta lento, y
 * es del mismo orden que lo medido en la referencia, donde el grueso de las
 * instancias vive en rangos de un cuarto a media pantalla (0,18 a 0,59).
 */
export const RECORRIDO_OBJETIVO_SVH = 50

/**
 * Viewport nominal para convertir los desplazamientos en píxeles de un ancla a
 * centésimas de viewport. Es el de la medición de la referencia (900 px de alto
 * a 1440 de ancho), así que el demo reparte el scroll como lo repartía el sitio
 * medido. En una ventana más alta el bloque queda un poco corto y en una más
 * baja un poco largo: es una aproximación declarada, no una medición.
 */
export const VIEWPORT_NOMINAL_PX = 900

/**
 * El alto que necesita el bloque de un patrón para que su recorrido dé el
 * objetivo, en `svh`. Puede dar cero o menos —P1 y P2 llegan al objetivo casi
 * con cualquier alto— y ahí manda el contenido.
 */
export function altoDelBloqueSvh(par: ParDeAnclas): number {
  const porViewport = par.inicio.viewport.fraccion - par.fin.viewport.fraccion
  const porPixeles = (par.inicio.viewport.px - par.fin.viewport.px) / VIEWPORT_NOMINAL_PX
  const alto = RECORRIDO_OBJETIVO_SVH / 100 - porViewport - porPixeles
  // De fracción a centésimas de viewport, con un decimal.
  return Math.max(0, Math.round(alto * 1000) / 10)
}

/**
 * Separación entre patrones, en `svh`. Más de medio viewport: dos patrones
 * vecinos no pueden estar animando a la vez en la misma pantalla, que es lo que
 * arruinaría el juicio de cualquiera de los dos.
 */
export const SEPARACION_SVH = 60
