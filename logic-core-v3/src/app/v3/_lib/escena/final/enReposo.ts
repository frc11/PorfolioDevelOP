/**
 * [NOCTURNO FINAL] A2 · EL FINAL EN REPOSO, sin `three` (lo lee el viaje del menú, del lado del DOM): si el final del pie
 * no tiene nada aplicado (`fin` en cero, sin el giro ni el alejamiento del quieto). Lo escribe el cuadro del final en
 * cada cuadro; sin final (abajo de 1024, con movimiento reducido), siempre. Un viaje que sale desde el pie con la
 * cinemática avanzada no mueve el scroll hasta que esto es cierto: primero se deshace la cinemática (la cámara baja del
 * cenit, con tope) y después se viaja.
 */
export const FINAL_EN_REPOSO = { valor: true }
