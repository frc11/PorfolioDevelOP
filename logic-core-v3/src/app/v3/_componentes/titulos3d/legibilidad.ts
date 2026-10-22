import type { FuenteDePagina } from '../../_lib/titulos3d/registro'

/**
 * [B12a.8] T5 · LAS DOS OPCIONES DE LEGIBILIDAD SIN VELO, para que Valentino eligiera mirando. Medido en el build
 * (`scripts-carga/contraste-de-la-intro.ts`): sin ninguna, 24 de 25 textos de la composición 1 llegaban a AA en el 95 % de sus píxeles; el que
 * no, la parte liviana del título a 1280 (94,1 %): el borde antialiasado de sus trazos finos sobre el fondo oscuro y una arista brillante del
 * domo que le pasa justo detrás. Las dos le dan más cuerpo al trazo, sin tapar la escena:
 *   · `peso`: la parte liviana de la familia 1, un paso más pesada (Archivo 125/400 en vez de 125/300). 9 de 9 en la 1;
 *   · `tamano`: el título más grande en la composición 1 desde 1024 (el 80 % de la intro en vez del 74: ~71 % del cuadro, dentro de T1),
 *     con la parte liviana como es. 8 de 9.
 *
 * [T0 · 2026-10-22] Valentino eligió `peso`: es el defecto (sin la bandera, y con cualquier valor que no sea el otro). `tamano` queda detrás
 * de `?legibilidad=tamano`, para comparar; `?legibilidad=peso` sigue andando (es el defecto).
 */
export type OpcionDeLegibilidad = 'peso' | 'tamano'

/** [T0] La elegida: la de sin bandera, la que pinta el servidor. */
export const LEGIBILIDAD_POR_DEFECTO: OpcionDeLegibilidad = 'peso'

/** `peso`: la instancia un paso más pesada de cada parte liviana (las que no están, quedan). */
export const MAS_PESADA: Readonly<Partial<Record<FuenteDePagina, FuenteDePagina>>> = { 'archivo-125-300': 'archivo-125-400' }

/** La opción de la bandera: `tamano` con `?legibilidad=tamano`; si no, la de por defecto. */
export function legibilidadDeLaBandera(valor: string | null): OpcionDeLegibilidad {
  return valor === 'tamano' ? 'tamano' : LEGIBILIDAD_POR_DEFECTO
}

/** La opción de la URL, leída en el cliente (el servidor pinta la de por defecto). */
export const legibilidadDeLaUrl = (): OpcionDeLegibilidad => legibilidadDeLaBandera(new URLSearchParams(window.location.search).get('legibilidad'))

/** Las dos fuentes del título con la legibilidad: con `peso`, la segunda (la liviana) un paso más pesada; con `tamano`, como son. */
export function fuentesConLaLegibilidad(fuentes: readonly [FuenteDePagina, FuenteDePagina], opcion: OpcionDeLegibilidad): readonly [FuenteDePagina, FuenteDePagina] {
  return opcion === 'peso' ? [fuentes[0], MAS_PESADA[fuentes[1]] ?? fuentes[1]] : fuentes
}
