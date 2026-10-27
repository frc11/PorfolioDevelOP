/**
 * [B8] EL MOIRÉ QUIETO — puro: la rendija y lo único que todavía la mueve (el puntero).
 *
 * **Lo que mareaba** (CIERRE-HOME-V3, B8): el moiré se movía con la cámara y se aceleraba con el scroll. Tenía dos causas:
 * - **el paralaje:** las dos capas en radios distintos (la fina en 38, la gruesa en 44) se desalinean con cada pose de la
 *   cámara, y el batido corre de 6 a 12 veces más rápido que la pared (`probeMoire.ts`);
 * - **el moiré vivo de ESCENA 5** (M1a a M4): la gruesa bajaba sola, el scroll la aceleraba (M2), el pulso corría la fina
 *   (M3) y el desajuste cambiaba con el progreso (M4). Se borró, con la deriva que el rig le escribía a la gruesa.
 *
 * **[C2-31m] Queda una sola: la que era `?moire=mouse`** (la eligió Valentino). Una rendija, la gruesa (la retícula del hero), en
 * la pared y quieta, salvo el corrimiento chico que le da el puntero (`MOUSE_DEL_MOIRE`), o una entrada de afuera con su mismo
 * rango (`entrada.ts`: la inclinación del teléfono, la conecta la tarea 81). No lee la cámara, el scroll ni el reloj. Las otras
 * (`0` sin trama, `1` la gruesa quieta, `2` las dos coplanares) se borraron con su código (la capa fina y su desajuste) y con la
 * bandera: `?moire=` ya no pide nada.
 */

/**
 * Cuánto se corre la rendija con el puntero en un borde de la ventana, en grados de vuelta vistos desde el eje, a lo
 * ancho y a lo alto (la celda es cuadrada: un grado es la misma fracción de celda en las dos direcciones). 1° es 0,14 de
 * celda gruesa: de 14 a 19 px a 1440×900 en todo el recorrido (medido en `s78-b8`). Lo suaviza el amortiguador del puntero de la
 * cámara (`MOUSE_TAU`, 0,45 s), en `MoireDelMouse.tsx`.
 */
export const MOUSE_DEL_MOIRE = { topeGrados: 1 } as const

const enRango = (x: number): number => Math.min(1, Math.max(-1, x))

/**
 * El corrimiento de la textura de una capa de `celdas` por vuelta para un puntero (de −1 a 1, ya suavizado), escrito en
 * `destino` (sin reservas): hacia donde va el puntero, con tope. Desde adentro del cilindro la vuelta crece hacia la izquierda
 * de la pantalla y la textura corrida en `+x` se ve corrida a la derecha; en `+y`, hacia abajo.
 */
export function corrimientoPorElMouse(destino: { x: number; y: number }, puntero: { readonly x: number; readonly y: number }, celdas: number): void {
  const tope = (MOUSE_DEL_MOIRE.topeGrados / 360) * celdas
  destino.x = tope * enRango(puntero.x)
  destino.y = -tope * enRango(puntero.y)
}
