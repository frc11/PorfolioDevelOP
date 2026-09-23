/**
 * LA VENTANA ABIERTA — dónde termina, y el fundido de movimiento reducido. **[DEMOS]**
 *
 * El viaje de la pieza a la ventana es el Genie (`genie.ts`); acá queda la caja en
 * la que termina y lo que reemplaza al Genie cuando se pide menos movimiento.
 */

export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

/** Movimiento reducido: sin Genie, un fundido con una escala corta. */
export const MS_DEL_FUNDIDO = 200
export const ESCALA_DEL_FUNDIDO = 0.96

/** La proporción de la ventana: la de la ventana del CTA, 16:10. */
export const RELACION_DE_LA_VENTANA = 16 / 10
/** Grande pero no a pantalla completa: la escena atenuada se ve alrededor. */
export const FRACCION_DEL_ANCHO = 0.8
export const FRACCION_DEL_ALTO = 0.82

export function cajaFinal(anchoDeLaPantalla: number, altoDeLaPantalla: number): Caja {
  const ancho = Math.min(anchoDeLaPantalla * FRACCION_DEL_ANCHO, altoDeLaPantalla * FRACCION_DEL_ALTO * RELACION_DE_LA_VENTANA)
  const alto = ancho / RELACION_DE_LA_VENTANA
  return { x: (anchoDeLaPantalla - ancho) / 2, y: (altoDeLaPantalla - alto) / 2, ancho, alto }
}
