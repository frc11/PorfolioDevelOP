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
 * posición, el peor píxel bajo el glifo, logo incluido). Lo que no llega a AA
 * lleva su deuda y corre como `deudaDeclarada`, no como falla: B8 rompió el
 * contraste a propósito y lo declaró. ⚠️ Las cifras de S9 (9,73 y 6,07) eran
 * el modelo de CPU SIN el logo; la captura real, con el logo detrás del texto,
 * dice otra cosa y es la que manda acá.
 *
 * ── B11 · TRES ANCHOS, EL TRAMO ENTERO, Y LA PASTILLA RECORTADA ──────────────
 *
 * B11 movió el texto de donde pasa el logo y volvió a medir las seis con el
 * mismo instrumento —`scripts-b11/b-bloques.ts` ES `c-las-ocho.ts`: importa su
 * máscara de glifo, sus lectores, su ocultamiento y su evaluación— con tres
 * diferencias que no son del método: paso de un cuarto de pantalla, los tres
 * anchos de la instrucción (1440, 1920 y el 2560 local de `b11-comun.ts`), y
 * **la pastilla de navegación recortada de las cajas**: B8 leía el texto de la
 * pastilla como glifo del bloque que tenía debajo, y la fila de Números de B8
 * (1,00:1, «Lo que se puede contar» en y=4050 con 1.250 px bajo AA) llevaba
 * adentro 540 px de pastilla. Cada fila es la PEOR de los tres anchos, derivada
 * con `scripts-b11/d-filas.ts --etiqueta=despues` de
 * `outputs/b11/bloques-despues-{1440,1920,2560}.json` — nunca escrita a mano;
 * lo que sigue al «·» final es la atribución de la causa, leída de
 * `cruce-despues.json`. Las filas de B8 quedan en el historial de este archivo.
 *
 * Lo que las filas dicen, en una línea: **el logo ya no está detrás de ninguna
 * fila** —0 % del tramo en las cuatro secciones que lo tenían, tres anchos—, y
 * lo que sigue abajo de AA es el piso de motas (`deudas-b11.ts`), la pared del
 * diferencial (D-B5.1, luz) y el atardecer sobre la última cifra de Números
 * (D-B8.1, luz). La única tinta a `opacity-casi` que quedaba sobre la sala (dos
 * piezas de Quiénes somos, mediana 4,06–4,30) pasó a plena en la PARADA 2 y su
 * fila desapareció: lo que dejó son motas, en la fila de la tinta plena. Una fila bajo AA sin deuda es rojo; una con deuda que ya pasa
 * AA, también — para que la lista no envejezca.
 *
 * ⚠️ El Cierre pasa en la captura (18:1) porque su pie pinta #0E0E0E y tapa la
 * sala: está abierto en la tabla y cerrado por su pie (`B8-LUZ.md` §11.1). Por
 * el modelo —la sala detrás, sin el pie— es la deuda D-B8.4, en `s8-tinta` §4.
 */

import type { DEUDAS_DECLARADAS } from './deudas-b11'

export const CONTRASTE_CONTRA_LA_ESCENA: readonly {
  readonly seccion: string
  /**
   * La tinta que la fila mide, como `token@alfa`, o nada si vale para toda la
   * sección (y entonces la sección tiene que usar UNA sola tinta sobre la
   * escena, que es lo que hace válida la cita de S9). B8: sin velo no hay piso
   * de tokens, así que TODA tinta sobre la escena se cita por fila. Las alfas
   * intermedias (0,54 · 0,66 · 0,7 · 0,76 · 0,87) son bloques leídos en
   * tránsito del revelado en la posición de la captura; la fila dice qué dan a
   * plena.
   */
  readonly tinta?: string
  readonly razon: number
  readonly instrumento: string
  /**
   * Una fila por debajo de AA lleva su deuda declarada —las de B8 en
   * `deudas-b8.ts`, las de B11 en `deudas-b11.ts`, las dos en un registro— y
   * corre como `deudaDeclarada`, no como falla. Sin deuda, una fila bajo AA es
   * rojo; con deuda y ya arriba de AA, también.
   */
  readonly deuda?: keyof typeof DEUDAS_DECLARADAS
}[] = [
  {
    seccion: 'hero',
    tinta: '--color-tinta@1',
    razon: 2.56,
    instrumento: 'B11 — b-bloques despues, 1920×, paso 0,25: 6 bloques en 2 posiciones, 2 bajo AA; el peor es «Tu negocio vendiendo» en y=0 (10191 px de glifo, 6 bajo AA). Por ancho: 1440: 2.94 (3/7) · 1920: 2.56 (2/6) · 2560: 2.90 (5/6) · el logo, 0 % del tramo en los tres anchos: son motas',
    deuda: 'motasHero',
  },
  {
    seccion: 'quienes-somos',
    tinta: '--color-tinta@1',
    razon: 2.12,
    instrumento: 'B11 — b-bloques despues, 2560×, paso 0,25: 18 bloques en 9 posiciones, 11 bajo AA; el peor es «Estrategia · Comercial · Planificación» en y=3240 (946 px de glifo, 51 bajo AA). Por ancho: 1440: 2.26 (16/17) · 1920: 2.26 (16/18) · 2560: 2.12 (11/18) · el logo, 0 % del tramo (antes: el 62,9 % de «Trabajamos desde Tucumán…» y el 100 % de la foto): motas, y la celosía bajo la segunda persona. Las dos tintas al 0,6 ya a plena (PARADA 2): «Tucumán, Argentina» 2,60 · 3,98 · 2,69 y «Qué hace en un proyecto» 2,37 · 2,64 · 2,48, de 1,75–1,97 con todo el glifo bajo AA a 5–21 px',
    deuda: 'motasQuienesSomos',
  },
  {
    seccion: 'numeros',
    tinta: '--color-tinta@1',
    razon: 2.06,
    instrumento: 'B11 — b-bloques despues, 2560×, paso 0,25: 8 bloques en 13 posiciones, 5 bajo AA; el peor es «[CIFRA]» en y=6480 (4587 px de glifo, 5 bajo AA). Por ancho: 1440: 2.33 (6/8) · 1920: 2.22 (5/8) · 2560: 2.06 (5/8) · el logo, 0 % del tramo en las 13 cajas (antes: el 100 % de la caja del titular, 1,00:1): motas',
    deuda: 'motasNumeros',
  },
  {
    seccion: 'numeros',
    tinta: '--color-tinta-media@1',
    razon: 1.01,
    instrumento: 'B11 — b-bloques despues, 1440×, paso 0,25: 5 bloques en 13 posiciones, 5 bajo AA; el peor es «Proyectos entregados» en y=4725 (509 px de glifo, 65 bajo AA). Por ancho: 1440: 1.01 (5/5) · 1920: 1.37 (4/5) · 2560: 1.04 (4/5) · motas, y «Procesos automatizados» bajo el atardecer (el 95,9 % de su caja bajo AA en la peor parada, el 8,7 % del tramo: D-B8.1)',
    deuda: 'motasNumeros',
  },
  {
    seccion: 'trabajos',
    tinta: '--color-tinta@1',
    razon: 3.78,
    instrumento: 'B11 — b-bloques despues, 1440×, paso 0,25: 5 bloques en 9 posiciones, 2 bajo AA; el peor es «Tres proyectos, y al lado de cada nombre» en y=7650 (9930 px de glifo, 0 bajo AA). Por ancho: 1440: 3.78 (2/5) · 1920: 3.78 (3/5) · 2560: 4.00 (6/8) · la franja de piso iluminado de 1920 (antes 2,04: «Banú», 449 de 455 px) ya no toca el renglón del nombre; lo que queda son partículas',
    deuda: 'motasTrabajos',
  },
  {
    seccion: 'trabajos',
    tinta: '--color-tinta@0.87',
    razon: 3.62,
    instrumento: 'B11 — b-bloques despues, 1920×, paso 0,25: 2 bloques en 9 posiciones, 2 bajo AA; el peor es «El Garage» en y=9180 (554 px de glifo, 7 bajo AA, a plena 4.17). Por ancho: 1440: 3.85 (1/1) · 1920: 3.62 (2/2) · en tránsito del revelado; partículas',
    deuda: 'motasTrabajos',
  },
  {
    seccion: 'trabajos',
    tinta: '--color-tinta@0.54',
    razon: 2.39,
    instrumento: 'B11 — b-bloques despues, 1440×, paso 0,25: 3 bloques en 9 posiciones, 2 bajo AA; el peor es «El Garage» en y=7425 (131 px de glifo, 2 bajo AA, a plena 4.23). Por ancho: 1440: 2.39 (2/3) · 1920: 4.75 (0/2) · 2560: 3.89 (1/1) · en tránsito del revelado; partículas',
    deuda: 'motasTrabajos',
  },
  {
    seccion: 'por-que-develop',
    tinta: '--color-tinta@1',
    razon: 1.11,
    instrumento: 'B11 — b-bloques despues, 1440×, paso 0,25: 12 bloques en 2 posiciones, 10 bajo AA; el peor es «El diferencial no está en el diseño. Est» en y=14400 (9872 px de glifo, 1135 bajo AA). Por ancho: 1440: 1.11 (10/12) · 1920: 2.30 (7/9) · 2560: 2.30 (7/9) · el logo detrás del titular el 3,2–6,0 % del tramo; detrás del cuerpo, 0 %: la pared',
    deuda: 'diferencial',
  },
  {
    seccion: 'por-que-develop',
    tinta: '--color-tinta@0.66',
    razon: 1.03,
    instrumento: 'B11 — b-bloques despues, 1440×, paso 0,25: 6 bloques en 2 posiciones, 6 bajo AA; el peor es «[MÉTRICA] más rápido que el camino tradi» en y=14400 (4538 px de glifo, 4303 bajo AA, a plena 1.03). Por ancho: 1440: 1.03 (6/6) · en tránsito del revelado, y a plena da lo mismo: es la pared',
    deuda: 'diferencialPared',
  },
  {
    seccion: 'por-que-develop',
    tinta: '--color-tinta@0.7',
    razon: 1.03,
    instrumento: 'B11 — b-bloques despues, 1920×, paso 0,25: 8 bloques en 2 posiciones, 8 bajo AA; el peor es «[MÉTRICA] más rápido que el camino tradi» en y=17280 (4692 px de glifo, 4217 bajo AA, a plena 1.03). Por ancho: 1920: 1.03 (8/8) · en tránsito del revelado, y a plena da lo mismo: es la pared',
    deuda: 'diferencialPared',
  },
  {
    seccion: 'por-que-develop',
    tinta: '--color-tinta@0.76',
    razon: 2.46,
    instrumento: 'B11 — b-bloques despues, 2560×, paso 0,25: 8 bloques en 2 posiciones, 7 bajo AA; el peor es «Lo que entregamos no termina en un docum» en y=23040 (4430 px de glifo, 69 bajo AA, a plena 2.99). Por ancho: 2560: 2.46 (7/8) · en tránsito del revelado: la pared',
    deuda: 'diferencialPared',
  },
  /**
   * ⚠️ **B13 · LAS TRES FILAS DEL CIERRE SE RE-ESCRIBEN: DESCRIBÍAN UN PIE QUE YA
   * NO EXISTE.** Decían «sobre el pie que pinta #0E0E0E» y publicaban 18,00 /
   * 6,85 / 6,44 — o sea la medición de B11, con el pie RELLENO. B12 le sacó el
   * relleno y puso una banda local; **B13 revirtió la banda por pedido del
   * humano** («el footer sigue siendo sólido, no transparente»). Las tres
   * estaban verdes describiendo un estado de hace dos bloques: verde por vacío.
   * Lo que corre ahora son las filas derivadas del barrido de B13 con el mismo
   * `d-filas.ts` de B11, la peor de los dos anchos, y la primera carga
   * `D-B13.3`. La fila de `@0,6` desaparece: ya no hay ningún bloque a esa
   * opacidad en la sección.
   */
  {
    seccion: 'cierre',
    tinta: '--color-tinta@1',
    razon: 2.41,
    instrumento: 'B13 — b-bloques b13-cierre, 1440×, paso 0,25: 21 bloques en 1 posiciones, 8 bajo AA; el peor es «la dirección de contacto, cuando exista» en y=15300 (895 px de glifo, 14 bajo AA). Por ancho: 1440: 2.41 (8/21) · 1920: 2.44 (7/22) · con el pie SIN banda y sin relleno: los cuatro del titular son D-B12.2 (la varianza de la sala) y los tres de texto chico son lo que la banda tapaba',
    deuda: 'pieSinBanda',
  },
  {
    seccion: 'cierre',
    tinta: '--color-tinta-tenue@1',
    razon: 6.43,
    instrumento: 'B13 — b-bloques b13-cierre, 1440×, paso 0,25: 2 bloques en 1 posiciones, 0 bajo AA; el peor es «El envío está deshabilitado: todavía no » en y=15300 (2355 px de glifo, 0 bajo AA). Por ancho: 1440: 6.43 (0/2) · 1920: 6.43 (0/2) · es el FORMULARIO, y pasa porque lleva su propio fondo: la excepción que la instrucción de B13 §4 nombra («es un control, no una superficie»)',
  },
]
