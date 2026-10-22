/**
 * [B4] LOS DEFECTOS DE LOS GATILLOS, para el control positivo de los bancos (`scripts-carga/servicios-gatillos.ts` y
 * `servicios-capa.ts`). Sólo los pide el banco ANTES de cargar (`window.__defectosDeLosGatillos`, como `__defectosDelPortfolio`); nunca
 * la URL ni el producto.
 *
 *   `sin-candado`        la máquina sin la transición entera ni el vuelo que traga (cada gesto, aunque llegue en medio, da un paso).
 *   `capa-a-destiempo`   el cambio de capa de los nanobots a destiempo (apenas arranca el traspaso, con la nube detrás del título).
 */
export type DefectoDeLosGatillos = 'sin-candado' | 'capa-a-destiempo'

export function conElDefectoDeLosGatillos(d: DefectoDeLosGatillos): boolean {
  if (typeof window === 'undefined') return false
  const pedido = (window as Window & { __defectosDeLosGatillos?: unknown }).__defectosDeLosGatillos
  return typeof pedido === 'string' && pedido.split(',').includes(d)
}
