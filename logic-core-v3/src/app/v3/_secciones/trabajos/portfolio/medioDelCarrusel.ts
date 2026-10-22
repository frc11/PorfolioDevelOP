/**
 * [B1.2e] EL PORTFOLIO DEBAJO DE 1024, PURO — el alto, el paso y el reloj de Demos cuando el selector es el carrusel (plan:
 * `docs/rediseno/SPRINT-B12E-NOCTURNO.md`). Todo en px de la regla (contra un alto de 900, como `pasos.ts`).
 *
 * Debajo de 1024 la sección deja de ser un pin de pasos: es un FLUJO que se scrollea (el título, el carrusel y «la tuya», cada uno en su
 * pantalla) y después la cola de siempre (la salida y Demos, al píxel). El medio —lo que hay entre el pin y la cola— ya no son los cuatro
 * pasos: es lo que mide el flujo, medido en el DOM.
 *
 *   0 → 900                 la aproximación, igual que hoy (el flujo empieza en el tope de la sección: el título entra desde abajo)
 *   900 → 900 + medio       el flujo pasa: el medio es su alto (cuando su pie llega arriba del cuadro, arranca la cola)
 *   → + 2.931               la cola de hoy, al píxel: la salida y Demos
 *
 * ── LA REGLA DE ALTURAS ───────────────────────────────────────────────────
 *
 * La escena sigue viendo, en cada ancho, el medio que veía (`PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA`): el flujo se le anota como el tramo del
 * selector con `k = medio / lo que veía`, así que afuera del flujo el progreso de la escena es el de hoy, bit a bit. Y el flujo nunca
 * mide menos que el medio de la tabla (`PANTALLAS_MINIMAS_DEL_FLUJO`, las 3,31 pantallas de 2.982 px): si midiera menos, la sección
 * quedaría más corta que lo que declara la tabla y el alto mínimo del panel (757svh) la estiraría por el final, donde nadie lo anota.
 */

import {
  ANTES_DEL_PIN, EN_LA_COLA, PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA, PX_DE_LA_APROXIMACION, PX_DE_LA_COLA, PX_DE_LA_SECCION_EN_LA_TABLA,
  type AnchoDelPortfolio, type IndiceDePaso,
} from './pasos'

/** Lo que mide una pantalla en la regla. */
const PANTALLA = PX_DE_LA_APROXIMACION

/** Lo menos que mide el flujo (pantallas): el medio que declara la tabla (2.982 px de la regla). Va en línea, en `svh`. */
export const PANTALLAS_MINIMAS_DEL_FLUJO = PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA.escritorio / PANTALLA

/**
 * Lo que la sección sigue después del pie del flujo (pantallas): la pantalla que se ve cuando arranca la cola y la cola entera (la salida y
 * Demos, 2.931 px de la regla). El pin de Demos vive ahí.
 */
export const PANTALLAS_DESPUES_DEL_FLUJO = 1 + PX_DE_LA_COLA / PANTALLA

/**
 * Lo que la sección suma sobre el alto de la tabla con el carrusel (pantallas): nada. El flujo en su mínimo y lo que sigue suman justo la
 * tabla (2.982 + 900 + 2.931 = 6.813, lo que declara); si el flujo crece, la sección crece con él por su contenido, no por esta variable.
 */
export const PANTALLAS_EXTRA_CON_EL_CARRUSEL = Math.max(0, PANTALLAS_MINIMAS_DEL_FLUJO + PANTALLAS_DESPUES_DEL_FLUJO - PX_DE_LA_SECCION_EN_LA_TABLA / PANTALLA)

/** El medio en px de la regla para un flujo que mide `altoPx` en una ventana de `ventanaPx` de alto. */
export function medioDelFlujo(altoPx: number, ventanaPx: number): number | null {
  if (!(altoPx > 0) || !(ventanaPx > 0)) return null
  return (altoPx * PANTALLA) / ventanaPx
}

/** Dónde arranca la cola con el carrusel (px de la regla). */
export const pxDeLaSalidaDelCarrusel = (medio: number): number => PX_DE_LA_APROXIMACION + medio

/** El factor del tramo anotado a la escena con el carrusel: lo que mide el medio sobre lo que la escena veía en ese ancho. */
export const kDelCarrusel = (medio: number, ancho: AnchoDelPortfolio): number => medio / PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho]

/** Lo que mide la sección con el carrusel (px de la regla): la aproximación, el medio y la cola. */
export const pxDeLaSeccionConElCarrusel = (medio: number): number => PX_DE_LA_APROXIMACION + medio + PX_DE_LA_COLA

/**
 * El paso con el carrusel: −1 en la aproximación, 0 mientras pasa el flujo (no hay pasos: el carrusel rota por su cuenta) y la cola
 * después. Sin histéresis: nadie dispara nada en estos bordes (el título y «la tuya» tienen su propio gatillo, por línea).
 */
export function pasoDelCarrusel(px: number, medio: number): IndiceDePaso {
  if (px < PX_DE_LA_APROXIMACION) return ANTES_DEL_PIN
  if (px < pxDeLaSalidaDelCarrusel(medio)) return 0
  return EN_LA_COLA
}
