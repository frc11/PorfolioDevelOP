/**
 * [C2-41e] LOS DEFECTOS DE DEMOS PARA EL BANCO — lo de antes, reintroducido a pedido, para que cada criterio del banco
 * (`scripts-carga/demos-escritorio.ts`) tenga su control positivo. Sólo los pide el banco antes de cargar
 * (`window.__defectosDeDemos = 'a,b'`); en el producto no existen. El molde es `_componentes/gatillos/defectos.ts`.
 *
 *   · `franja`       en Demos la cámara vuelve a la pose del scroll (la de antes): la franja clara del piso abajo;
 *   · `area-movil`   la placa (lo que se levanta con el hover) vuelve a recibir el puntero: el hover se prende y se apaga solo;
 *   · `sin-espejo`   el título y la bajada de Demos sin alinear con los del Portfolio;
 *   · `sin-precarga` sin preconexión, sin documento precargado y el iframe recién con la ventana abierta.
 */
export type DefectoDeDemos = 'franja' | 'area-movil' | 'sin-espejo' | 'sin-precarga'

export function conElDefectoDeDemos(d: DefectoDeDemos): boolean {
  if (typeof window === 'undefined') return false
  const pedido = (window as Window & { __defectosDeDemos?: unknown }).__defectosDeDemos
  return typeof pedido === 'string' && pedido.split(',').includes(d)
}
