/**
 * LO QUE MIDIÓ OTRO INSTRUMENTO — el contraste del texto sobre la escena.
 *
 * No se vuelve a calcular acá y no se puede: el fondo de una sección
 * transparente es la escena, que es un cuadro dibujado y no un token. Cada
 * cifra la midió el instrumento que la firma y acá se CITA, con la atribución
 * adentro del dato para que no se pueda copiar sin ella.
 *
 * ── B6-A · POR QUÉ ES UN MÓDULO APARTE ───────────────────────────────────────
 *
 * Hasta B6-A esta tabla vivía al pie de `s10-acceso-color.ts`, con dos filas.
 * La cuarta superficie (`oscuro-transparente`, ver `_lib/superficies.ts`) le
 * agregó a ese modelo la derivación «¿deja ver la escena?» leída de la tabla de
 * superficies —antes comparaba contra el literal `papel-transparente`—, y con
 * eso el archivo cruzó las 300 líneas del repo. El corte es por tema: todo lo
 * demás de `s10-acceso-color.ts` CALCULA una razón a partir de tokens; esta
 * tabla es lo único que CITA una razón medida en el navegador.
 *
 * ── B8 · SEIS SECCIONES, CADA TINTA CON SU FILA, Y LAS DEUDAS CON SU NÚMERO ──
 *
 * B8 sacó el velo y abrió Quiénes somos y Números: seis secciones escriben
 * sobre la sala. Cada (sección, tinta) tiene su fila, derivada del barrido de
 * `scripts-b8/c-las-ocho.ts --etiqueta=despues` (1440×900, cinco capturas por
 * posición, el peor píxel bajo el glifo, logo incluido) con
 * `scripts-b8/d-filas-de-acceso.ts` — nunca escrita a mano. Lo que no llega a
 * AA lleva su deuda (`deudas-b8.ts`) y corre como `deudaDeclarada`, no como
 * falla: B8 rompe el contraste a propósito y lo declara. ⚠️ Las cifras de S9
 * (9,73 y 6,07) eran el modelo de CPU SIN el logo; la captura real, con el
 * logo detrás del texto, dice otra cosa y es la que manda acá.
 *
 * ⚠️ El Cierre pasa en la captura (18:1) porque su pie pinta #0E0E0E y tapa la
 * sala: está abierto en la tabla y cerrado por su pie (`B8-LUZ.md` §11.1). Por
 * el modelo —la sala detrás, sin el pie— es la deuda D-B8.4, en `s8-tinta` §4.
 */

import type { DEUDAS_DE_B8 } from './deudas-b8'

export const CONTRASTE_CONTRA_LA_ESCENA: readonly {
  readonly seccion: string
  /**
   * La tinta que la fila mide, como `token@alfa`, o nada si vale para toda la
   * sección (y entonces la sección tiene que usar UNA sola tinta sobre la
   * escena, que es lo que hace válida la cita de S9). B8: sin velo no hay piso
   * de tokens, así que TODA tinta sobre la escena se cita por fila.
   */
  readonly tinta?: string
  readonly razon: number
  readonly instrumento: string
  /**
   * B8: una fila por debajo de AA lleva su deuda declarada (`deudas-b8.ts`) y
   * corre como `deudaDeclarada`, no como falla. Sin deuda, una fila bajo AA es
   * rojo; con deuda y ya arriba de AA, también — para que la lista no envejezca.
   */
  readonly deuda?: keyof typeof DEUDAS_DE_B8
}[] = [
  {
    seccion: 'hero',
    tinta: '--color-tinta@1',
    razon: 2.94,
    instrumento: 'B8 — c-las-ocho despues, y=0: 7 bloques, 3 bajo AA; el peor es «piloto automático.» (6.769 px de glifo, 2 bajo AA), con el logo detrás. S9 citaba 9,73 del modelo sin el logo',
    deuda: 'hero',
  },
  {
    seccion: 'quienes-somos',
    tinta: '--color-tinta@1',
    razon: 1.0,
    instrumento: 'B8 — c-las-ocho despues, cinco posiciones: 15 bloques, 12 bajo AA; el peor es «Trabajamos desde Tucumán…» en y=1800 (7.015 px de glifo, 3.069 bajo AA), con el logo detrás',
    deuda: 'quienesSomos',
  },
  {
    seccion: 'quienes-somos',
    tinta: '--color-tinta@0.6',
    razon: 1.97,
    instrumento: 'B8 — c-las-ocho despues: «Tucumán, Argentina» y «Qué hace en un proyecto», a opacity-casi (0,6); a tinta plena 2,77 — también bajo AA, el logo detrás',
    deuda: 'quienesSomos',
  },
  {
    seccion: 'numeros',
    tinta: '--color-tinta@1',
    razon: 1.0,
    instrumento: 'B8 — c-las-ocho despues, siete posiciones: 8 bloques, 6 bajo AA; el peor es el titular «Lo que se puede contar» en y=4050 (5.999 px de glifo, 1.250 bajo AA), con el logo detrás',
    deuda: 'numeros',
  },
  {
    seccion: 'numeros',
    tinta: '--color-tinta-media@1',
    razon: 1.02,
    instrumento: 'B8 — c-las-ocho despues: los cinco rótulos de las cifras en tinta media, 4 bajo AA; el peor es «Años en el mercado» en y=5400 (434 px de glifo, 247 bajo AA)',
    deuda: 'numeros',
  },
  {
    seccion: 'trabajos',
    tinta: '--color-tinta@1',
    razon: 2.53,
    instrumento: 'B8 — c-las-ocho despues, la noche (sala a 0,020–0,059): 7 bloques de tinta clara, 3 bajo AA; el peor es «Lo que cambió» en y=9000 (412 px de glifo, 5 bajo AA); «Trabajos» 4,30 y el cuerpo 3,78 — las partículas que brillan, debajo de los glifos',
    deuda: 'trabajos',
  },
  {
    seccion: 'trabajos',
    tinta: '--color-tinta@0.87',
    razon: 5.29,
    instrumento: 'B8 — c-las-ocho despues: «[MÉTRICA]» y «El Garage» en tránsito del revelado (opacidad 0,87); a tinta plena 6,38 y 12,14',
  },
  {
    seccion: 'por-que-develop',
    tinta: '--color-tinta@1',
    razon: 1.11,
    instrumento: 'B8 — c-las-ocho despues, y=14400 (la pantalla 16: el ancla, p=0,8525, nivel 0,643; sala a 0,323): 7 bloques, 5 bajo AA; el peor es «El diferencial no está en el diseño…» (9.872 px de glifo, 1.423 bajo AA), con el logo detrás. S9 citaba 6,07 del modelo sin el logo en p=0,750; B6-A ya medía 6 de 7',
    deuda: 'diferencial',
  },
  {
    seccion: 'cierre',
    tinta: '--color-tinta@1',
    razon: 18.0,
    instrumento: 'B8 — c-las-ocho despues, y=15300: 20 bloques, ninguno bajo AA — sobre el pie que pinta #0E0E0E; la sala (0,304) no se ve. Con el pie sin relleno, 25 de 25 bajo AA (peor 1,00:1): B8-LUZ.md §6.3',
  },
  {
    seccion: 'cierre',
    tinta: '--color-tinta@0.6',
    razon: 6.85,
    instrumento: 'B8 — c-las-ocho despues: los tres textos a opacity-casi del pie, sobre el pie que pinta #0E0E0E; a plena 18,00',
  },
  {
    seccion: 'cierre',
    tinta: '--color-tinta-tenue@1',
    razon: 6.44,
    instrumento: 'B8 — c-las-ocho despues: la ayuda y el placeholder del formulario (2.989 y 807 px de glifo, ninguno bajo AA), sobre el pie que pinta #0E0E0E',
  },
]
