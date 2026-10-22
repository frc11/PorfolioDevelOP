/**
 * [B6] LA PINTURA DEL TÍTULO — de gris claro a tinta, palabra por palabra, atada al scroll. Funciones puras: las usa
 * `TituloQueSePinta.tsx` en cada cuadro y `s6-tu-panel` las barre.
 *
 * El avance sale de DÓNDE está el centro del título en la pantalla, no de un ancla del sistema de motion: arranca cuando el
 * centro asoma por abajo (el título, a medias a la vista) y termina con el centro en la MITAD de la pantalla, no arriba.
 * Cada palabra tiene su tramo del avance (`[i/n, (i+1)/n]`): ninguna empieza antes de que termine la anterior.
 */

/** Dónde termina de pintarse: el centro del título, en fracción del alto de la pantalla desde arriba. */
export const FIN_DEL_PINTADO = 0.5

/** Cuánto de la tinta lleva una palabra sin pintar (el resto es papel): el gris claro. */
export const PRESENCIA_SIN_PINTAR = 18

/** El avance (0 → 1) con el centro del título en `centro` (px desde arriba de la pantalla) y una pantalla de `alto`. */
export function avanceDelPintado(centro: number, alto: number): number {
  if (!(alto > 0)) return 1
  const t = (alto - centro) / (alto * (1 - FIN_DEL_PINTADO))
  return t <= 0 ? 0 : t >= 1 ? 1 : t
}

/** Lo pintada que está la palabra `indice` de `cuantas` con un avance dado (0 → 1). */
export function avanceDeLaPalabra(avance: number, indice: number, cuantas: number): number {
  const local = avance * cuantas - indice
  return local <= 0 ? 0 : local >= 1 ? 1 : local
}

/** El gris de una palabra sin pintar: la tinta mezclada con el papel. */
export const grisSinPintar = (): string => `color-mix(in oklab, var(--color-tinta) ${PRESENCIA_SIN_PINTAR}%, var(--color-fondo))`
