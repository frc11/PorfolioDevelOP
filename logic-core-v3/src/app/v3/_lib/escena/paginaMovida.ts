/**
 * [CIERRE RETOQUE 3D] B2 · CUÁNTAS VECES SE MOVIÓ LA PÁGINA — lo cuenta el evento de scroll (`ataduraAlScroll.ts`) y lo lee
 * la física del polvo: cualquier scroll, por chico que sea, despierta el polvo posado, también donde el progreso del
 * recorrido ya no avanza (después del último nudo queda en 1, y una muesca no lo cambiaba).
 */
let veces = 0

export function avisarQueSeMovioLaPagina(): void {
  veces += 1
}

export function vecesQueSeMovioLaPagina(): number {
  return veces
}
