import type { FuenteDePagina } from '../../_lib/titulos3d/registro'

/**
 * [B12a.8] T5 · LAS DOS OPCIONES DE LEGIBILIDAD SIN VELO (`?legibilidad=peso|tamano`), para que Valentino elija mirando. Sin la bandera,
 * ninguna: el título en volumen se lee por su volumen, su material y su luz. Medido en el build (`scripts-carga/contraste-de-la-intro.ts`):
 * sin velo, 24 de 25 textos de la composición 1 llegan a AA en el 95 % de sus píxeles; el que no, la parte liviana del título a 1280 (94,1 %).
 * Lo que le falta es el borde antialiasado de sus trazos finos sobre el fondo oscuro y una arista brillante del domo que le pasa justo detrás
 * (medido: con más luz en su cara o menos motas detrás, el número no se mueve; con el título más grande, cambia según qué le pase detrás).
 * Las dos le dan más cuerpo al trazo, sin tapar la escena:
 *   · `peso`: la parte liviana de la familia 1, un paso más pesada (Archivo 125/400 en vez de 125/300);
 *   · `tamano`: el título más grande en la composición 1 desde 1024 (el 80 % de la intro en vez del 74: ~71 % del cuadro, dentro de T1).
 * Elegida una (o ninguna), la bandera se va.
 */
export type OpcionDeLegibilidad = 'peso' | 'tamano'

/** `peso`: la instancia un paso más pesada de cada parte liviana (las que no están, quedan). */
export const MAS_PESADA: Readonly<Partial<Record<FuenteDePagina, FuenteDePagina>>> = { 'archivo-125-300': 'archivo-125-400' }

export function legibilidadDeLaBandera(valor: string | null): OpcionDeLegibilidad | null {
  return valor === 'peso' || valor === 'tamano' ? valor : null
}

/** La opción de la URL, leída en el cliente (el servidor pinta sin ninguna). */
export const legibilidadDeLaUrl = (): OpcionDeLegibilidad | null => legibilidadDeLaBandera(new URLSearchParams(window.location.search).get('legibilidad'))
