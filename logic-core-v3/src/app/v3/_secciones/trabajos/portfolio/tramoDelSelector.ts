/**
 * [B1] EL SELECTOR, ANOTADO A LA ESCENA — la REGLA DE ALTURAS del Portfolio (`pasos.ts`, plan §5.3).
 *
 * La tabla de secciones no cambia; la sección mide los pasos del selector de más. Así que el selector se anota como un tramo
 * estirado (`TRAMO_ESTIRADO`, `_lib/escena/tramoEstirado.ts`, el mecanismo que usaba el túnel desde 1024): arranca en el pin
 * (900 de la regla), la escena lo ve medir lo que veía hoy entre el pin y la salida en ese ancho, y él mide `k` veces eso. Antes
 * del pin y en la cola, la escena ve los mismos píxeles que hoy, en los tres anchos.
 *
 * [B1.2e] Debajo de 1024 el selector es el carrusel: el medio no son los pasos sino el flujo (el título, el carrusel y «la tuya»), medido en
 * el DOM (`medioDelCarrusel.ts`). El tramo es el mismo —arranca en el pin y la escena lo ve medir lo que veía— con `k = medio / lo que
 * veía`. Hasta que el flujo se mide, el de los pasos. [L2] Con Demos de una pantalla, el tramo del carrusel llega al final de la sección: la
 * escena lo ve medir el medio que veía y la cola (`medioDelCarrusel.ts`).
 *
 * En las dos ramas (con y sin coreografía): la sección mide lo mismo en las dos.
 */

import { TRAMO_ESTIRADO, type TramoEstirado } from '../../../_lib/escena/tramoEstirado'

import { pxQueVeLaEscenaDespuesDelPin } from './medioDelCarrusel'
import { PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA, PX_DE_LA_APROXIMACION, anchoDelValor, kDelAncho, type AnchoDelPortfolio } from './pasos'

/** El tramo del selector para un ancho y un paso. */
export function tramoDelSelector(panel: Element, ancho: AnchoDelPortfolio, paso: number): TramoEstirado {
  return { panel, k: kDelAncho(paso, ancho), arranque: PX_DE_LA_APROXIMACION, largo: PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho] }
}

/**
 * [INT] La parte de cada punta del tramo del carrusel en la que la escena acelera y frena (`TramoEstirado.rampa`): sin ella pasaba de golpe
 * de su velocidad a ~4,5 veces (390×844) al llegar el pin, y de vuelta al llegar Demos.
 */
export const RAMPA_DEL_CARRUSEL = 0.3

/**
 * [B1.2e] El tramo del carrusel para un ancho y el medio que mide su flujo (px de la regla). [L2] Hasta el final de la sección (con la cola).
 * [INT] Desde que la sección asoma (la aproximación entra al tramo: lo que la escena tiene que recuperar se reparte en una pantalla más) y
 * con rampa en las dos puntas. Afuera de la sección, lo mismo que antes.
 */
export function tramoDelCarrusel(panel: Element, ancho: AnchoDelPortfolio, medio: number): TramoEstirado {
  const largo = PX_DE_LA_APROXIMACION + pxQueVeLaEscenaDespuesDelPin(ancho)
  return { panel, k: (PX_DE_LA_APROXIMACION + medio) / largo, arranque: 0, largo, rampa: RAMPA_DEL_CARRUSEL }
}

/** El ancho que decidió el CSS de la sección (`--ancho-del-portfolio`). */
export function anchoDe(caja: Element): AnchoDelPortfolio {
  return anchoDelValor(getComputedStyle(caja).getPropertyValue('--ancho-del-portfolio'))
}

/** [B1.2e] Si el CSS de la sección decidió el carrusel (`--modo-del-portfolio: carrusel`, debajo de 1024). */
export function carruselDe(caja: Element): boolean {
  return getComputedStyle(caja).getPropertyValue('--modo-del-portfolio').trim() === 'carrusel'
}

/**
 * Anota el selector y lo sigue al cambiar de ancho (relee la variable en cada `resize`). [B1.2e] Con el carrusel, el medio que mide su
 * flujo (`medioDelCarrusel`, `null` sin medir); `reanotar` vuelve a anotar cuando el flujo cambia de alto. Devuelve cómo soltarlo.
 */
export function anotarElSelector(caja: Element, panel: Element, paso: number, medioDelCarrusel: () => number | null): { readonly reanotar: () => void; readonly soltar: () => void } {
  let tramo: TramoEstirado | null = null
  const anotar = (): void => {
    const ancho = anchoDe(caja)
    const medio = carruselDe(caja) ? medioDelCarrusel() : null
    tramo = medio === null ? tramoDelSelector(panel, ancho, paso) : tramoDelCarrusel(panel, ancho, medio)
    TRAMO_ESTIRADO.valor = tramo
  }
  anotar()
  window.addEventListener('resize', anotar)
  return {
    reanotar: anotar,
    soltar: () => {
      window.removeEventListener('resize', anotar)
      if (TRAMO_ESTIRADO.valor === tramo) TRAMO_ESTIRADO.valor = null
    },
  }
}
