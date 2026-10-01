import { MENU_DE_LA_INTERFAZ } from '../../_lib/escena/interfaz/pedidos'

/**
 * [INTERFAZ 2] T1 · EL MENÚ DEL TELÉFONO ABIERTO: la sala se desenfoca y se oscurece apenas detrás.
 *
 * Es el único menú que se abre (en escritorio es la barra, siempre a la vista). Con la bandera, el velo del menú pasa
 * a desenfocar POCO el DOM (un tercio de `--blur-panel`) y la que se va de foco es la SALA: el lienzo de la escena
 * toma el desenfoque entero, con el tiempo del menú, y su luz baja un poco (`interfaz/respuesta.ts`: es la luz de la
 * sala, no un velo encima). La página queda cerca y la sala lejos: una profundidad de campo, no un vidrio parejo.
 *
 * El lienzo es `[data-escena]` (el envoltorio de `EscenaDelHome`, `fixed`, fuera del flujo y sin hijos del DOM: no es
 * ancestro de ningún texto, así que la cadena de mezcla de abajo de 1025 no se toca).
 */
export const DESENFOQUE_DE_LA_SALA = 'blur(var(--blur-panel))'
/** La del menú (380 ms): la duración media del tema (400), con la curva de salida. */
export const TRANSICION_DE_LA_SALA = 'filter var(--duracion-media) var(--ease-salida)'

export function salaDetrasDelMenu(abierto: boolean): void {
  MENU_DE_LA_INTERFAZ.abierto = abierto
  const lienzo = document.querySelector<HTMLElement>('[data-escena]')
  if (lienzo === null) return
  lienzo.style.transition = TRANSICION_DE_LA_SALA
  lienzo.style.filter = abierto ? DESENFOQUE_DE_LA_SALA : ''
}
