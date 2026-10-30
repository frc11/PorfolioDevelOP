import type { FormaDeLaTarjeta } from '../../_componentes/carrusel/asoma'

/**
 * [M2] LO PROPIO DEL CARRUSEL DE DESTACADAS, PURO (`CarruselDeDestacadas.tsx` lo usa; `m2-blog` lo prueba sin navegador).
 *
 *   · más rápido: `MS_POR_DESTACADA` (el carrusel común trae 10 s; Valentino: «lo quiero más rápido»);
 *   · la tarjeta: apaisada (la foto arriba, el título abajo), a lo sumo el 86 % del ancho (asoma la siguiente), del alto de la vista;
 *   · la foto de una tarjeta vecina, corrida al revés de su lado (en % de su capa, que sobra 8 % por lado): al volverse la de ahora, la foto
 *     vuelve a su lugar mientras la tarjeta se mueve, más despacio que su marco (la profundidad).
 */
export const MS_POR_DESTACADA = 5500

export const FORMA_DE_LA_DESTACADA: FormaDeLaTarjeta = { proporcion: 1.7, fraccion: 0.86 }

export const CORRIDA_DE_LA_FOTO = 6

/** El corrimiento de la foto (en %) de una tarjeta a `relativo` de la de ahora: 0 la de ahora, al revés de su lado las vecinas. Acotado. */
export function corridaDeLaFoto(relativo: number): number {
  const r = relativo < -1 ? -1 : relativo > 1 ? 1 : relativo
  return r === 0 ? 0 : -r * CORRIDA_DE_LA_FOTO
}

/**
 * Cuánto tiene que durar un apoyo para que, al soltar, el clic NO abra la nota (ms). Más que el `mantenerMs` del carrusel (200, lo que pausa):
 * un toque lento (200–450 ms) igual entra; un apoyo largo pausó para mirar y soltar no navega.
 */
export const APOYO_LARGO_MS = 450

/** Un apoyo del puntero sobre la tarjeta: cuándo y con qué. */
export interface ApoyoDelPuntero {
  readonly desde: number
  readonly tipo: string
}

/**
 * Si el clic que llega tiene que cancelarse: sólo el que cierra un apoyo LARGO de ese mismo puntero. El clic del teclado o de un lector de
 * pantalla (`detalle` 0) nunca, aunque haya quedado un apoyo viejo de un arrastre.
 */
export const bloqueaElClic = (apoyo: ApoyoDelPuntero | null, ahora: number, detalle: number): boolean =>
  detalle !== 0 && apoyo !== null && ahora - apoyo.desde >= APOYO_LARGO_MS
