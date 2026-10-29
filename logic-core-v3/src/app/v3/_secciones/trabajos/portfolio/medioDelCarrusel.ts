/**
 * [B1.2e] EL PORTFOLIO DEBAJO DE 1024, PURO — el alto, el paso y el reloj de Demos cuando el selector es el carrusel (plan:
 * `docs/rediseno/SPRINT-B12E-NOCTURNO.md`). Todo en px de la regla (contra un alto de 900, como `pasos.ts`).
 *
 * Debajo de 1024 la sección deja de ser un pin de pasos: es un FLUJO que se scrollea (el título con el carrusel y «la tuya») y después
 * Demos. [L2] Demos es UNA pantalla que pasa con el scroll como cualquier sección (antes, pegada 3,3 pantallas: la cola de escritorio) y
 * el flujo mide lo que mide su contenido (antes, nunca menos que el medio de la tabla). El scroll de Portfolio a Servicios es uno solo.
 *
 *   0 → 900                 la aproximación, igual que hoy (el flujo empieza en el tope de la sección: el título entra desde abajo)
 *   900 → 900 + medio       el flujo pasa y Demos llega (el medio es el alto del flujo: Demos mide una pantalla, la del pie)
 *
 * ── LA REGLA DE ALTURAS ───────────────────────────────────────────────────
 *
 * La escena sigue viendo, en cada ancho, lo que veía desde el pin hasta el final de la sección: el medio de ese ancho
 * (`PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA`) y la cola (`PX_DE_LA_COLA`, 2.931). [L2] Todo lo que la sección mide después del pin se le anota
 * como el tramo del selector con `k = medio / (lo que veía + la cola)`: afuera de la sección, el progreso de la escena es el de hoy, bit
 * a bit, con el flujo que sea. El panel suelta su piso de la tabla (`useMedioDelCarrusel`): la sección mide su contenido.
 */

import { ANTES_DEL_PIN, EN_LA_COLA, PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA, PX_DE_LA_APROXIMACION, PX_DE_LA_COLA, type AnchoDelPortfolio, type IndiceDePaso } from './pasos'

/** Lo que mide una pantalla en la regla. */
const PANTALLA = PX_DE_LA_APROXIMACION

/** [L2] Lo que la sección sigue después del pie del flujo (pantallas): la pantalla de Demos, nada más. */
export const PANTALLAS_DESPUES_DEL_FLUJO = 1

/** El medio en px de la regla para un flujo que mide `altoPx` en una ventana de `ventanaPx` de alto. */
export function medioDelFlujo(altoPx: number, ventanaPx: number): number | null {
  if (!(altoPx > 0) || !(ventanaPx > 0)) return null
  return (altoPx * PANTALLA) / ventanaPx
}

/** Dónde termina el flujo con el carrusel (px de la regla): ahí Demos llena el cuadro y la sección se va (el reloj de Demos cuenta desde acá). */
export const pxDeLaSalidaDelCarrusel = (medio: number): number => PX_DE_LA_APROXIMACION + medio

/** [L2] Lo que la escena ve desde el pin hasta el final de la sección en este ancho (px de la regla): el medio de entonces y la cola. */
export const pxQueVeLaEscenaDespuesDelPin = (ancho: AnchoDelPortfolio): number => PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho] + PX_DE_LA_COLA

/** El factor del tramo anotado a la escena con el carrusel: lo que mide la sección después del pin sobre lo que la escena veía ahí. */
export const kDelCarrusel = (medio: number, ancho: AnchoDelPortfolio): number => medio / pxQueVeLaEscenaDespuesDelPin(ancho)

/** Lo que mide la sección con el carrusel (px de la regla): la aproximación y el medio (el flujo y Demos menos la pantalla del pin). */
export const pxDeLaSeccionConElCarrusel = (medio: number): number => PX_DE_LA_APROXIMACION + medio

/**
 * El paso con el carrusel: −1 en la aproximación, 0 mientras pasa el flujo (no hay pasos: el carrusel rota por su cuenta) y la «cola» al
 * final de la sección. Sin histéresis: nadie dispara nada en estos bordes (el título y «la tuya» tienen su propio gatillo, por línea).
 */
export function pasoDelCarrusel(px: number, medio: number): IndiceDePaso {
  if (px < PX_DE_LA_APROXIMACION) return ANTES_DEL_PIN
  if (px < pxDeLaSalidaDelCarrusel(medio)) return 0
  return EN_LA_COLA
}
