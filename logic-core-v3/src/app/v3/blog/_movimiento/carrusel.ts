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
