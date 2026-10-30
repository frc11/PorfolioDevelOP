/**
 * [M3] LOS TEXTOS DE «LA PANTALLA QUE SE DIBUJA» — sólo lo que la página ya promete (05-TEXTOS, Desarrollo web: «Pensamos cada pantalla para
 * que se entienda sola […] y se vea bien en el celular, que es donde te van a encontrar») y, por trabajo, la frase del caso de la página
 * (`prueba.casos`). Ninguna cifra ni resultado.
 */

/** El título del bloque: lo que vende la página (MOMENTOS.md, W1: «la pantalla pensada antes que hecha»). */
export const TITULO_DE_LA_PANTALLA = 'Pensada antes que hecha' // C2: provisorio (M3)

/** Lo que acompaña cada fase: el plano, la pantalla real (con el nombre del trabajo) y el celular. */
export const TEXTOS_DE_LAS_FASES = {
  plano: 'Antes de construirla, la pensamos: qué se ve primero, qué se lee después y dónde se toca.', // C2: provisorio (M3)
  real: (nombre: string): string => `Después, la de verdad: la de ${nombre}.`, // C2: provisorio (M3)
  celular: 'Y la misma, pensada para el celular, que es donde te van a encontrar.', // 05-TEXTOS, Desarrollo web
} as const

/** El menú de los trabajos. */
export const ROTULO_DEL_MENU = 'Elegí el trabajo' // C2: provisorio (M3)

/** Lo que pausa el botón de teclado (`BotonPausa` arma «Pausar …»). */
export const DE_LA_PAUSA_DE_LA_PANTALLA = 'los videos del trabajo'
