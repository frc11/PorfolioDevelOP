import type { FuenteDePagina } from '../../_lib/titulos3d/registro'

/**
 * [B12a.8] T5 · LA LEGIBILIDAD SIN VELO — medido en el build (`scripts-carga/contraste-de-la-intro.ts`): sin ninguna, 24 de 25 textos de la
 * composición 1 llegaban a AA en el 95 % de sus píxeles; el que no, la parte liviana del título a 1280 (94,1 %): el borde antialiasado de sus
 * trazos finos sobre el fondo oscuro y una arista brillante del domo que le pasa justo detrás.
 *
 * [L6] Valentino eligió `peso` (T0) y quedó fija: la parte liviana de la familia 1, un paso más pesada (Archivo 125/400 en vez de 125/300). La
 * bandera `?legibilidad=` y la otra opción (`tamano`) se fueron.
 */

/** La instancia un paso más pesada de cada parte liviana (las que no están, quedan). */
export const MAS_PESADA: Readonly<Partial<Record<FuenteDePagina, FuenteDePagina>>> = { 'archivo-125-300': 'archivo-125-400' }

/** Las dos fuentes del título con el peso elegido: la segunda (la liviana) un paso más pesada. */
export function fuentesConLaLegibilidad(fuentes: readonly [FuenteDePagina, FuenteDePagina]): readonly [FuenteDePagina, FuenteDePagina] {
  return [fuentes[0], MAS_PESADA[fuentes[1]] ?? fuentes[1]]
}
