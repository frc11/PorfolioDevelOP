/**
 * [B4] LOS DEFECTOS DE LOS GATILLOS, para el control positivo de los bancos (`scripts-carga/servicios-gatillos.ts` y
 * `servicios-capa.ts`). Sólo los pide el banco ANTES de cargar (`window.__defectosDeLosGatillos`, como `__defectosDelPortfolio`); nunca
 * la URL ni el producto.
 *
 *   `sin-candado`        la máquina sin la transición entera ni el vuelo que traga (cada gesto, aunque llegue en medio, da un paso).
 *   `capa-a-destiempo`   el cambio de capa de los nanobots a destiempo (apenas arranca el traspaso, con la nube detrás del título).
 *   `sin-parada`         [NOCTURNO B5] Demos sin su parada (la de antes: la ráfaga desde el Portfolio sigue de largo a Servicios).
 *   `parada-sin-llegada` [NOCTURNO B5] la parada sin esperar la llegada de Demos (un gesto nuevo la corta a la mitad).
 *   `con-gatillo-al-final` [C2-51] Servicios con la salida de abajo de B4 (el último gesto vuela al recomendador; IA aterriza en su centro).
 *   `con-gatillo-arriba` [L2] Servicios en el teléfono con la entrada y la salida de arriba de antes (el gesto vuela entre Demos y la entrada).
 *   `con-candado`        [L3] Servicios con la transición entera que traga el gesto siguiente (sin `candadoMs`).
 *   `con-salto`          [L3] el escenario que SALTA cuando la posición queda a más de uno de la vista (el gesto rápido se teletransporta).
 */
export type DefectoDeLosGatillos = 'sin-candado' | 'capa-a-destiempo' | 'sin-parada' | 'parada-sin-llegada' | 'sin-objetivo-nativo' | 'con-gatillo-al-final' | 'con-gatillo-arriba' | 'con-candado' | 'con-salto'

export function conElDefectoDeLosGatillos(d: DefectoDeLosGatillos): boolean {
  if (typeof window === 'undefined') return false
  const pedido = (window as Window & { __defectosDeLosGatillos?: unknown }).__defectosDeLosGatillos
  return typeof pedido === 'string' && pedido.split(',').includes(d)
}
