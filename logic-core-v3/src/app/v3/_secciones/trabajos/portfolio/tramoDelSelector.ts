/**
 * [B1] EL SELECTOR, ANOTADO A LA ESCENA — la REGLA DE ALTURAS del Portfolio (`pasos.ts`, plan §5.3).
 *
 * La tabla de secciones no cambia; la sección mide los pasos del selector de más. Así que el selector se anota como un tramo
 * estirado (`TRAMO_ESTIRADO`, `_lib/escena/tramoEstirado.ts`, el mecanismo que usaba el túnel desde 1024): arranca en el pin
 * (900 de la regla), la escena lo ve medir lo que veía hoy entre el pin y la salida en ese ancho, y él mide `k` veces eso. Antes
 * del pin y en la cola, la escena ve los mismos píxeles que hoy, en los tres anchos.
 *
 * En las dos ramas (con y sin coreografía): la sección mide lo mismo en las dos.
 */

import { TRAMO_ESTIRADO, type TramoEstirado } from '../../../_lib/escena/tramoEstirado'

import { PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA, PX_DE_LA_APROXIMACION, anchoDelValor, kDelAncho, type AnchoDelPortfolio } from './pasos'

/** El tramo del selector para un ancho y un paso. */
export function tramoDelSelector(panel: Element, ancho: AnchoDelPortfolio, paso: number): TramoEstirado {
  return { panel, k: kDelAncho(paso, ancho), arranque: PX_DE_LA_APROXIMACION, largo: PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho] }
}

/** El ancho que decidió el CSS de la sección (`--ancho-del-portfolio`). */
export function anchoDe(caja: Element): AnchoDelPortfolio {
  return anchoDelValor(getComputedStyle(caja).getPropertyValue('--ancho-del-portfolio'))
}

/** [B1.3] Si el CSS de la sección decidió las historias del teléfono (`--modo-del-portfolio: historias`, abajo de 768). */
export function historiasDe(caja: Element): boolean {
  return getComputedStyle(caja).getPropertyValue('--modo-del-portfolio').trim() === 'historias'
}

/** Anota el selector y lo sigue al cambiar de ancho (relee la variable en cada `resize`). Devuelve cómo soltarlo. */
export function anotarElSelector(caja: Element, panel: Element, paso: number): () => void {
  let tramo: TramoEstirado | null = null
  const anotar = (): void => {
    tramo = tramoDelSelector(panel, anchoDe(caja), paso)
    TRAMO_ESTIRADO.valor = tramo
  }
  anotar()
  window.addEventListener('resize', anotar)
  return () => {
    window.removeEventListener('resize', anotar)
    if (TRAMO_ESTIRADO.valor === tramo) TRAMO_ESTIRADO.valor = null
  }
}
