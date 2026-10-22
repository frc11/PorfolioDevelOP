/**
 * [B4] LOS DEFECTOS DE LOS GATILLOS, para el control positivo de los bancos (`scripts-carga/servicios-gatillos.ts` y
 * `servicios-capa.ts`). Sólo los pide el banco ANTES de cargar (`window.__defectosDeLosGatillos`, como `__defectosDelPortfolio`); nunca
 * la URL ni el producto.
 *
 *   `sin-candado`        la máquina sin la transición entera ni el vuelo que traga (cada gesto, aunque llegue en medio, da un paso).
 *   `capa-a-destiempo`   el cambio de capa de los nanobots a destiempo (apenas arranca el traspaso, con la nube detrás del título).
 *   `sin-parada`         [NOCTURNO B5] Demos sin su parada (la de antes: la ráfaga desde el Portfolio sigue de largo a Servicios).
 *   `parada-sin-llegada` [NOCTURNO B5] la parada sin esperar la llegada de Demos (un gesto nuevo la corta a la mitad).
 */
export type DefectoDeLosGatillos = 'sin-candado' | 'capa-a-destiempo' | 'sin-parada' | 'parada-sin-llegada'

export function conElDefectoDeLosGatillos(d: DefectoDeLosGatillos): boolean {
  if (typeof window === 'undefined') return false
  const pedido = (window as Window & { __defectosDeLosGatillos?: unknown }).__defectosDeLosGatillos
  return typeof pedido === 'string' && pedido.split(',').includes(d)
}
