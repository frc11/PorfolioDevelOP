/**
 * [B12a.8] LA COMPOSICIÓN DE LA INTRO DE UNA PÁGINA — dónde va el título y dónde el logo. [L6] Valentino eligió la 3 y quedó fija (la bandera
 * `?composicion=` y las otras dos se fueron): el título a la IZQUIERDA, el logo a la derecha (como el hero del home).
 *
 * Abajo de 1024 no entra de costado: el título va centrado, ARRIBA del logo. El logo no se mueve en la escena: lo corre el ENCUADRE de la
 * cámara (`frameX` y `frameY`, como el hero del home), con la pose de la intro (girar) intacta. El DOM de la intro deja un HUECO para el logo
 * (al lado de la columna del texto, o debajo abajo de 1024) y lo mide; la escena resuelve el encuadre en cada cuadro para que el centro del logo
 * caiga en el del hueco (`composicionEnLaEscena.ts`). La columna del texto (el título, la bajada y «de qué se trata») es la misma en los dos
 * tramos: el mismo eje. Puro, sin three ni react: lo leen el DOM de la intro y el rig.
 */

/** El hueco del logo en el cuadro, con la intro fija arriba: su centro en coordenadas del cuadro (−1…1, y hacia arriba). */
export interface HuecoDeLaIntro {
  readonly x: number
  readonly y: number
}

/** Lo que el DOM de la intro le dice a la escena: el hueco medido, o `null` (sin intro, o sin medir: el encuadre de la pista). */
export const COMPOSICION_EN_LA_ESCENA: { hueco: HuecoDeLaIntro | null } = { hueco: null }

/** El centro de una caja del cuadro (px, con la intro fija arriba) en coordenadas del cuadro. */
export function huecoEnElCuadro(caja: { readonly izquierda: number; readonly arriba: number; readonly ancho: number; readonly alto: number }, ancho: number, alto: number): HuecoDeLaIntro {
  return { x: ((caja.izquierda + caja.ancho / 2) / ancho) * 2 - 1, y: 1 - ((caja.arriba + caja.alto / 2) / alto) * 2 }
}
