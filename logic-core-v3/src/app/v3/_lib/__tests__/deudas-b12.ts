/**
 * LAS DEUDAS DECLARADAS DE B12 — las dos que el bloque abre a propósito, con su
 * número, su medición y la línea que las revoca.
 *
 * B12 hace dos cosas que ROMPEN contraste por decisión del humano, y la regla
 * del repo es que ninguna afirmación se afloje: la que falla corre con su
 * condición intacta como `deudaDeclarada()` y cuenta aparte. Acá viven los
 * números, para que dos instrumentos que miden lo mismo la nombren igual.
 *
 *   1. **Las motas van a blanco puro** («que las partículas tengan que verse:
 *      sobre negro, emisivas, en blanco»), y sobre la tinta clara de los
 *      nombres de los proyectos eso cuesta contraste.
 *   2. **El pie es transparente de verdad** («el footer sigue con el fondo
 *      oscuro, tiene que ser transparente»), y el titular de cierre queda sobre
 *      la sala, que tiene varianza.
 *
 * ── ⚠️ LAS DOS SON REVOCABLES EN UNA LÍNEA, y eso es parte de la deuda ─────
 *
 * Una deuda que no se puede deshacer no es una deuda: es un daño. Cada entrada
 * dice exactamente qué línea la revoca y qué se pierde al revocarla.
 */

import type { DeudaDeclarada } from './deudas-b8'

export const DEUDAS_DE_B12 = {
  motasBlancas: {
    numero: 'D-B12.1',
    que:
      'Trabajos — LAS MOTAS EN BLANCO PURO sobre el nombre de los proyectos. `BLANCO_DE_LA_NOCHE` pasó de 0,25 a 1 (`particleGlow.ts`) por pedido explícito del humano, y con la noche a 0,04 el censo de la captura da pico mediano **217 sobre un fondo de 16–21** (antes 117 sobre 39–51; la referencia, 47 sobre 0,6), ⌀ mediano 3,39–4,22 px y 634–1.239 motas por pantalla a 1920. La tinta clara de la tarjeta es #F7F7F5: sobre una mota de 217 da 1,3:1, y ahí está el peor píxel. Medido en la pose del pin, a 1920 y 1440 (`outputs/b12/bloques-trabajos.json`): «Lo que cambió» 1,27:1, «El Garage» 1,27–1,42, «Banú» 1,30–1,32, «[MÉTRICA]» 4,44 — entre 2 y 23 píxeles bajo AA por bloque, o sea **el 1 % al 5 % del glifo**. B11 lo había cerrado en 3,62–4,75:1 con 0 % bajo AA subiendo el renglón arriba de la captura; esa mejora sigue puesta y lo que la deshace es el brillo, no la posición. ⚠️ El `sobreElLogo` de 93–100 % que el instrumento publica en esta sección NO es el logo: con la sala en 11 de gris, `siluetaMasGrande` (umbral 60) toma el cuadro entero. Es una lectura del instrumento en la noche y se declara acá para que nadie la confunda con una atribución',
    cierre:
      'una línea: `BLANCO_DE_LA_NOCHE = 0.25` en `particleGlow.ts` devuelve el pico a 117 y los nombres a 3,6–4,8:1. Lo que se pierde es el blanco que el humano pidió — las motas vuelven a leerse como un gris a 5,6× el fondo en vez de a 10×. **La decisión es suya y la juzga grabando** (PARADA 1 de B12, decisión 4)',
  },
  titularDelCierre: {
    numero: 'D-B12.2',
    que:
      'Cierre — EL TITULAR SOBRE LA SALA. Con el pie sin relleno, la tinta dada vuelta, el formulario con fondo propio y la banda local del pie, quedan **4 de 24 bloques bajo AA a 1920 y 2 de 23 a 1440, y los seis son las líneas del `titulo-xl`**: 2,49 · 2,49 · 2,50 · 2,66 a 1920 y 2,66 · 2,96 a 1440, contra los 3:1 que pide el texto grande. Bajo AA quedan 31–79 px de 2.940–4.732 a 1920 y 1–16 px de 4.442–4.732 a 1440, o sea **el 0,02 % al 3 % del glifo**. La causa está medida y NO es el logo: `sobreElLogo` = 0,0 % en los seis. Lo que hay debajo es la varianza de la sala a nivel 0,643 —piso brillante y barras de celosía oscuras— y contra eso ninguna tinta única cierra: la clara falla donde el piso brilla (24 de 24, peor 1,00) y la oscura donde la celosía sombrea. Los otros 20 bloques del pie están en 17,60:1 (la banda) y 6,43:1 (el formulario), con 0 px bajo AA',
    cierre:
      'está donde el humano la quiere: la sala se ve arriba porque ahí es donde el gesto de la cámara alejándose se lee (PARADA 1 de B12, decisión 2). Se cierra bajando la banda —extenderla por encima del titular es una línea en `Cierre.tsx`, y da 0 de 24 medido en la variante `papel-opaco`— o con la luz, apagando la sala detrás de esa pantalla, que es el arco y lo decide el humano. **No se cierra con la tinta**: las dos están medidas y las dos fallan',
  },
  moireDelPisoEnLaNoche: {
    numero: 'D-B12.3',
    que:
      'La escena — EL MOIRÉ DEL PISO SE PIERDE EN LA NOCHE, y tiene umbral exacto. Con la noche a 0,04 el sol queda a **1,35°**, y a esa elevación el rayo que sale del piso hacia el sol **no llega al borde inferior de la capa LEJANA de la celosía**: sin dos capas cruzadas no hay interferencia, o sea no hay moiré ni batido sobre el piso. El umbral es geometría pura y se deriva de tres constantes que ya existían: `tan(elev) ≥ (MOIRE_FAR_BOTTOM − FLOOR_Y) / MOIRE_FAR_RADIUS` = (−2,5 − (−4,304)) / 44, o sea **elevación ≥ 2,348°**, que por la ley `level = sin(elev)/sin(36°)` es **nivel ≥ 0,0697**. El 0,08 de B8 estaba a un escalón del borde y por eso nadie lo había visto. Medido con `celosiaCrossings` sobre el arco: la capa lejana cruza a 0,08 (2,70°) y a 0,07 (2,36°) y deja de cruzar entre 0,07 y 0,06 (2,02°). Lo afirman `s11-proyeccion` §1, `s11-pantalla` §2, `s12-tension` §2 y `s12-barrido`, cada una con el umbral derivado y su control positivo',
    cierre:
      'no se cierra y no hace falta cerrarlo mientras la noche sea noche: sobre una sala de 11 de gris no hay piso iluminado donde un moiré pudiera verse. Se declara porque **perder en silencio una propiedad que el sistema custodiaba es peor que perderla escrita**, y porque el día que la noche suba por encima de 0,0697 el moiré vuelve solo. Bajarla a 0,02 —la cifra exacta de la referencia— lo pierde igual y además pide `SHADOW_FAR` 720',
  },
} as const satisfies Record<string, DeudaDeclarada>

export const LISTA_DE_DEUDAS_DE_B12: readonly DeudaDeclarada[] = Object.values(DEUDAS_DE_B12)
