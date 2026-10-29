/**
 * [C2-41e] LOS DEFECTOS DE DEMOS PARA EL BANCO — lo de antes, reintroducido a pedido, para que cada criterio del banco
 * (`scripts-carga/demos-escritorio.ts`) tenga su control positivo. Sólo los pide el banco antes de cargar
 * (`window.__defectosDeDemos = 'a,b'`); en el producto no existen. El molde es `_componentes/gatillos/defectos.ts`.
 *
 *   · `area-movil`     la placa (lo que se levanta con el hover) vuelve a recibir el puntero: el hover se prende y se apaga solo;
 *   · `area-solapada`  el ancla entera vuelve a recibir el puntero: la levantada tapa casi toda la franja de la de al lado, y el clic
 *                      ahí abre la de antes;
 *   · `sin-espejo`     el título y la bajada de Demos sin alinear con los del Portfolio;
 *   · `sin-precarga`   sin preconexión, sin documento precargado y el iframe recién con la ventana abierta;
 *   · `sin-alto`       [L2] el abanico sin el tope del alto (sólo el del ancho): no entra en los cuadros bajos.
 * (La franja de abajo, `CONTROL=franja`, es del revelado de la escena: `window.__defectosDelRevelado`, `_lib/escena/revelado.ts`.)
 */
export type DefectoDeDemos = 'area-movil' | 'area-solapada' | 'sin-espejo' | 'sin-precarga' | 'sin-alto'

export function conElDefectoDeDemos(d: DefectoDeDemos): boolean {
  if (typeof window === 'undefined') return false
  const pedido = (window as Window & { __defectosDeDemos?: unknown }).__defectosDeDemos
  return typeof pedido === 'string' && pedido.split(',').includes(d)
}
