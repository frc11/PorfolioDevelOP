/**
 * [B12a.8] LA COMPOSICIÓN DE LA INTRO DE UNA PÁGINA — dónde va el título y dónde el logo, en tres variantes para que Valentino elija
 * (`?composicion=1|2|3`; sin la bandera, `COMPOSICION_POR_DEFECTO`). Elegida, la bandera se va y la elegida queda: la firma no cambia.
 *
 *   1 · el título centrado, ARRIBA del logo;
 *   2 · el título a la DERECHA, el logo a la izquierda;
 *   3 · el título a la IZQUIERDA, el logo a la derecha (como el hero del home).
 *
 * Abajo de 1024 no entra de costado: las tres son la 1. El logo no se mueve en la escena: lo corre el ENCUADRE de la cámara (`frameX` y
 * `frameY`, como el hero del home), con la pose de la intro (girar) intacta. El DOM de la intro deja un HUECO para el logo (al lado de
 * la columna del texto, o debajo en la 1) y lo mide; la escena resuelve el encuadre en cada cuadro para que el centro del logo caiga en
 * el del hueco (`composicionEnLaEscena.ts`). La columna del texto (el título, la bajada y «de qué se trata») es la misma en los dos
 * tramos: el mismo eje. Puro, sin three ni react: lo leen el DOM de la intro y el rig.
 */

export type IdDeComposicion = '1' | '2' | '3'

export const COMPOSICIONES: Readonly<Record<IdDeComposicion, string>> = {
  '1': 'el título centrado, arriba del logo',
  '2': 'el título a la derecha, el logo a la izquierda',
  '3': 'el título a la izquierda, el logo a la derecha (como el hero del home)',
}

/** Sin bandera: la 3, la del hero del home (el título donde estaba, a la izquierda), hasta que Valentino elija. */
export const COMPOSICION_POR_DEFECTO: IdDeComposicion = '3'

/** La composición de `?composicion=` (1, 2 o 3); cualquier otra cosa, la de por defecto. */
export function composicionDeLaBandera(valor: string | null): IdDeComposicion {
  return valor === '1' || valor === '2' || valor === '3' ? valor : COMPOSICION_POR_DEFECTO
}

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
