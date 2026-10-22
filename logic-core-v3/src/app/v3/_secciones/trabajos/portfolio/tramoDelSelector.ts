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
 * veía`. Hasta que el flujo se mide, el de los pasos.
 *
 * En las dos ramas (con y sin coreografía): la sección mide lo mismo en las dos.
 */

import { TRAMO_ESTIRADO, type TramoEstirado } from '../../../_lib/escena/tramoEstirado'

import { kDelCarrusel } from './medioDelCarrusel'
import { PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA, PX_DE_LA_APROXIMACION, anchoDelValor, kDelAncho, type AnchoDelPortfolio } from './pasos'

/** El tramo del selector para un ancho y un paso. */
export function tramoDelSelector(panel: Element, ancho: AnchoDelPortfolio, paso: number): TramoEstirado {
  return { panel, k: kDelAncho(paso, ancho), arranque: PX_DE_LA_APROXIMACION, largo: PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho] }
}

/** [B1.2e] El tramo del carrusel para un ancho y el medio que mide su flujo (px de la regla). */
export function tramoDelCarrusel(panel: Element, ancho: AnchoDelPortfolio, medio: number): TramoEstirado {
  return { panel, k: kDelCarrusel(medio, ancho), arranque: PX_DE_LA_APROXIMACION, largo: PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho] }
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
