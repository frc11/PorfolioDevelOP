/**
 * LA ENVOLVENTE DE RENDIJAS Y EL MOIRÉ (S10) — el elemento principal de la escena.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * DOS TRAMAS DE CUADRADOS, SEPARADAS EN PROFUNDIDAD
 * ════════════════════════════════════════════════════════════════════════════
 *
 * S7 puso las dos tramas en las dos ranuras de textura del **mismo** material,
 * sobre un solo cilindro. S10 las separa: **dos cilindros coaxiales**, la fina
 * adelante y la gruesa atrás, y la gruesa **baja sin fin**.
 *
 * La separación no es cosmética: produce **paralaje**. Al orbitar la cámara, las
 * dos capas se desalinean solas y el batido cambia con el movimiento, además del
 * que produce la textura. Es lo que convierte el fondo en un efecto óptico de
 * verdad en vez de un patrón animado. El costo es un draw call más y el overdraw
 * de dos superficies con alfa grandes — está medido abajo.
 *
 * ── El revestimiento: de dónde salen las tramas ────────────────────────────
 *
 * No se inventaron. Salen del vocabulario del sitio, leído en el repo:
 *
 * - **`HeroBackground.tsx`** dibuja una retícula de cuadrados con líneas de 1 px
 *   a `4rem` (64 px) de paso, y **la traslada 48 px hacia abajo en bucle de
 *   13 s**. `WhyDevelOP.tsx` usa la misma retícula a 16/20/24/32/40 px.
 * - **`DotMatrix.tsx`** es el campo de puntos.
 *
 * O sea que **el par 64/32 con la MISMA línea de 1 px ya existe en el sitio**, y
 * la que se mueve —hacia abajo— es la del hero. La transposición es literal: la
 * capa gruesa **es** la retícula del hero y baja como allá; la fina es la misma a
 * la mitad del paso, con **un punto en cada cruce**, que es el campo de puntos a
 * su propio paso. Verificado contra el número: la capa fina da **24,9 celdas a lo
 * ancho del cuadro** contra las **22,5** de la retícula del hero a 1440 px.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ LA ARITMÉTICA DEL 2:1 — VALE PARA TRAMAS COPLANARES, Y ACÁ NO LO SON
 * ════════════════════════════════════════════════════════════════════════════
 *
 * **Con las dos tramas sobre la MISMA superficie** —que es lo que hizo S7— una
 * relación de 2 exacta no produce moiré: el término de batido es
 * |f_fina − 2·f_gruesa| = 0, o sea que el patrón queda estacionario y con el
 * período de la trama gruesa. Hace falta correrse de 2 (2,04 en vez de 2,00) para
 * que el batido aparezca. Eso es aritmética y no calibración.
 *
 * **Separadas en profundidad, la aritmética cambia.** La capa gruesa está más
 * lejos de la cámara que del eje, así que sus celdas se proyectan más chicas y el
 * cociente APARENTE deja de ser el de las texturas. Medido sobre el recorrido
 * real: el cociente proyectado va de **2,085 a 2,170** en horizontal (2,078 a
 * 2,162 en vertical) con un cociente de textura de 2,040. Con
 * `MOIRE_MISMATCH = 0` —textura 2:1 EXACTA— el proyectado sigue siendo 2,044 a
 * 2,127 y el batido existe igual. La cancelación solo ocurriría con la cámara
 * clavada en el eje, donde nunca está.
 *
 * Que quede escrito para que no se vuelva a plantear como aritmética cerrada:
 * **el enunciado es correcto para dos tramas coplanares; separarlas lo rompe.**
 *
 * ── El desajuste, que es la perilla ────────────────────────────────────────
 *
 * `MOIRE_MISMATCH` es un ENTERO y no una fracción, y eso es a propósito: las dos
 * tramas tienen que cerrar alrededor del cilindro o se ve la costura. Con
 * `finas = 2 × gruesas + m`, **m es directamente la cantidad de bandas de batido
 * en una vuelta**, así que la perilla nombra lo que produce.
 *
 * | | valor |
 * |---|---|
 * | celdas gruesas por vuelta | 50 → 7,200° · 5,529 de mundo |
 * | celdas finas por vuelta | 102 → 3,529° · 2,341 de mundo |
 * | cociente de textura | **2,0400** |
 * | batido de textura, desde el eje | 25 celdas gruesas · **138,2 de mundo** · 180° de arco |
 * | batido PROYECTADO por la cámara real | **5,9 a 11,8 celdas · 800 a 1.800 px** en 1920×1080 |
 * | bandas a lo ancho del cuadro | **1,0 a 2,0** |
 *
 * **Qué pasa cuando las dos quedan en fase.** Con 1 a 2 bandas en cuadro, el nodo
 * de alineación está siempre en cuadro o a menos de media pantalla: el efecto no
 * desaparece nunca del cuadro entero, lo que cambia es DÓNDE está la zona que se
 * lee como retícula limpia y dónde la que se lee como interferencia. Ese barrido
 * es el efecto.
 *
 * ── EL ALIASING, en las dos direcciones ────────────────────────────────────
 *
 * Una trama de cuadrados tiene líneas en dos direcciones, así que el análisis
 * vale para las dos. Barrido de los cinco recorridos, rayos hasta el borde del
 * cuadro incluyendo los rasantes:
 *
 * | | horizontal | vertical |
 * |---|---:|---:|
 * | trama fina, peor caso | **51,9 px** por período | **52,1 px** |
 * | trama gruesa, peor caso | 106,6 px | 106,8 px |
 * | Nyquist | 2 px | 2 px |
 *
 * **26× de margen**, contra los 15× de S7. Pero el riesgo real de una trama de
 * LÍNEAS no es el período sino el **grosor**: con el trazo en
 * `MOIRE_LINE_DEG`, la línea mide **2,85 px en el peor caso** y ~4 px en la
 * mediana. Sigue arriba de Nyquist, y donde la incidencia es rasante el mipmap la
 * promedia a gris en vez de dejarla titilar.
 */

// ── La envolvente ───────────────────────────────────────────────────────────

/**
 * Radio de la capa FINA, la de adelante. Es el radio de la pantalla de S7 y sus
 * tres razones siguen valiendo:
 *
 * - **más lejos que cualquier cámara** (el recorrido llega a 27, el slider a 30),
 *   así que nunca se mete entre la cámara y el logo;
 * - **más cerca que el ciclorama**, con la diferencia de velo que separa las dos
 *   superficies sin una sola luz de por medio;
 * - **más lejos que el sol** (34), que es lo que le deja al sol un fondo con
 *   textura para recortarse.
 */
export const MOIRE_NEAR_RADIUS = 38

/**
 * Radio de la capa GRUESA, la de atrás. La separación de 6 unidades es lo que
 * produce el paralaje.
 *
 * **No puede ser mucho más:** el ciclorama es una superficie de revolución y a la
 * altura del borde inferior de esta capa (`MOIRE_FAR_BOTTOM`) está en radio
 * **46,2**. Con 44 entra con 2,2 de margen; a 52 habría que arrancar la banda en
 * y = 0 y se perdería el borde de abajo.
 */
export const MOIRE_FAR_RADIUS = 44

/** Segmentos radiales. 96 sobre radio 44 dan una faceta de 2,9 de mundo: el
 * error de cuerda contra el cilindro real queda en 0,74 px a la distancia de
 * trabajo, o sea invisible. */
export const MOIRE_SEGMENTS = 96
/**
 * Segmentos verticales. **No son gratis y no son decoración: llevan la
 * envolvente.** El desvanecido de los bordes va por ALFA DE VÉRTICE y no por una
 * textura, por una razón dura: la capa gruesa desplaza su `offset.y` por frame, y
 * una envolvente horneada en la textura se desplazaría con ella. Con alfa de
 * vértice la envolvente es de la GEOMETRÍA y no se mueve.
 *
 * De paso ahorra una lectura de textura por fragmento sobre media pantalla, dos
 * veces. 20 segmentos dan 5 pasos en cada rampa del desvanecido.
 */
export const MOIRE_HEIGHT_SEGMENTS = 20

/**
 * Las bandas. La fina arranca casi al ras del papel para que se APOYE en el
 * suelo; la gruesa no puede bajar tanto porque el ciclorama se le cruza (ver
 * `MOIRE_FAR_RADIUS`), y no importa: a esa altura lo que se ve es piso.
 *
 * Los topes salen de medir hasta dónde barre el borde superior del cuadro: la
 * fina llega a y = 30,2 en la pose más baja del recorrido y la gruesa a 34,3.
 * Quedan 4 y 6 unidades de margen.
 */
export const MOIRE_NEAR_BOTTOM = -4
export const MOIRE_NEAR_TOP = 34
export const MOIRE_FAR_BOTTOM = -2.5
export const MOIRE_FAR_TOP = 40

/**
 * Fracción de la banda que ocupa cada rampa del desvanecido, arriba y abajo. Con
 * 0,22 la pantalla **no tiene bordes**: se disuelve en vez de terminar en una
 * línea.
 */
export const MOIRE_FADE = 0.22

// ── Las dos tramas ──────────────────────────────────────────────────────────

/**
 * Celdas de la trama GRUESA en una vuelta. 50 dan una celda de 7,2° de ángulo,
 * o sea ~12 celdas a lo ancho del cuadro: cuadrados grandes, que es lo que la
 * envolvente pide.
 *
 * Las tramas se definen en **celdas por vuelta y no en unidades de mundo**, y esa
 * es la decisión que hace que todo lo demás cierre: desde el eje, una celda de N
 * por vuelta subtiende 2π/N **sea cual sea el radio**, así que la lectura "cuatro
 * cuadraditos en un cuadrado" no depende de la separación entre las capas. Y el
 * paso vertical se deriva (`verticalPitch`) para que la celda sea cuadrada sobre
 * su propia superficie, y por lo tanto también en ángulo.
 */
export const MOIRE_COARSE_CELLS = 50

/**
 * EL DESAJUSTE. `finas = 2 × gruesas + MOIRE_MISMATCH`.
 *
 * Entero, porque las dos tramas tienen que cerrar alrededor del cilindro. Y como
 * entero **es directamente la cantidad de bandas de batido en una vuelta**.
 *
 * En **0** el cociente de textura es 2:1 exacto y el batido de textura
 * desaparece: lo que queda es el que produce el paralaje. Es el control que
 * muestra cuánto aporta cada mitad, y por eso el slider del panel llega hasta ahí.
 */
export const MOIRE_MISMATCH = 2
export const MOIRE_MISMATCH_MAX = 12

/** Celdas de la trama fina, derivadas del desajuste. */
export function fineCells(mismatch: number): number {
  return 2 * MOIRE_COARSE_CELLS + Math.round(mismatch)
}

/** Paso vertical que hace la celda cuadrada sobre la superficie del cilindro. */
export function verticalPitch(radius: number, cells: number): number {
  return (2 * Math.PI * radius) / cells
}

/** Cuántas celdas entran a lo alto de una banda. No es entero, y no hace falta
 * que lo sea: la envolvente llega a cero en los dos bordes. */
export function verticalRepeat(radius: number, cells: number, height: number): number {
  return height / verticalPitch(radius, cells)
}

/**
 * Grosor de la línea, en GRADOS de ángulo visto desde el eje. Es el mismo para
 * las dos capas, que es exactamente lo que hace el sitio: **1 px de línea sobre
 * una retícula de 64 px y sobre una de 32 px** — misma línea, distinto paso.
 *
 * 0,194° da 5,5% del paso de la celda fina y 2,7% del de la gruesa. En pantalla:
 * ~4 px en la mediana del recorrido y 2,85 px en el peor caso rasante.
 */
export const MOIRE_LINE_DEG = 0.194

/** Duty de una capa: qué fracción de su celda ocupa la línea. */
export function lineDuty(cells: number): number {
  return MOIRE_LINE_DEG / (360 / cells)
}

/**
 * Diámetro del punto en cada cruce de la trama fina, **en múltiplos del trazo**.
 *
 * Es el campo de puntos de `DotMatrix` puesto en el paso de la retícula. Se
 * define contra el trazo y no contra la celda por una razón que salió de medirlo:
 * el punto vive justo donde las dos líneas se cruzan, o sea encima de un cuadrado
 * de lado igual al trazo. Con un diámetro del 8,5% de la celda —que es la
 * proporción que `DotMatrix` tiene contra SU propio paso— el punto sobresalía del
 * cruce **medio téxel**: existía en la textura y no se veía en pantalla.
 *
 * Con 2,6 el punto mide 14,3% de la celda fina y se lee como un nodo. Y le hace
 * bien al batido: es la marca más densa de la trama, justo donde el moiré se
 * forma.
 *
 * La capa gruesa **no** lleva punto: es la retícula del hero, y la del hero no
 * tiene puntos.
 */
export const MOIRE_DOT_OVER_LINE = 2.6

/** Diámetro del punto como fracción del paso de celda, derivado del trazo. */
export function dotDiameter(cells: number): number {
  return lineDuty(cells) * MOIRE_DOT_OVER_LINE
}

/**
 * Segundos que tarda la capa gruesa en correrse UNA celda hacia abajo.
 *
 * **Sale del sitio:** `HeroBackground` traslada su retícula 48 px de un paso de
 * 64 px en 13 s, o sea una celda cada 17,3 s. Acá va 18,7 para no sincronizarse
 * con la deriva del polvo (17 s), la vira (13 y 9,5) ni el bokeh (11,5).
 *
 * El número que importa no es ése sino el que sale de él: **la capa se corre
 * 8,5 px/s —imperceptible— y las bandas de batido 51 a 102 px/s**, o sea de 6 a
 * 12 veces más rápido. Ese es todo el truco del moiré.
 */
export const MOIRE_DRIFT_PERIOD_S = 18.7

/**
 * Tono y densidad.
 *
 * El razonamiento de S7 sigue valiendo entero: si la envolvente fuera del color
 * del papel, su valor coincidiría con el del ciclorama que tiene detrás y la
 * trama solo se vería en la mitad de la sala que está a contraluz. Con tono
 * oscuro el contraste lo pone el material y no la iluminación.
 *
 * **Lo que cambió es el peso.** S7 tenía un velo del 15% porque el fondo era un
 * detalle; acá el fondo es el elemento principal y además es lo único que le
 * queda a la escena para no quedar lavada. Medido con el shading real, la
 * envolvente deja el fondo en **200 a 219** en las cuatro poses claras, con la
 * línea en 137 a 159 y el cruce en 99 a 123 — contra un papel de 247 a 250.
 *
 * `MOIRE_OPACITY` es el techo (lo que alcanza la línea) y `MOIRE_BASE_ALPHA` la
 * fracción de ese techo que tiene el hueco entre líneas. Son las dos primeras
 * perillas si al mirarlo la escena se siente cargada o lavada.
 */
export const MOIRE_COLOR = '#3E3E40'
export const MOIRE_OPACITY = 0.45
export const MOIRE_BASE_ALPHA = 0.18

/** Lado de la textura de una celda. 128 dan 7 téxeles de línea en la capa fina y
 * 3,5 en la gruesa, más el suavizado de borde. */
export const MOIRE_TILE_SIZE = 128

/**
 * ⚠️ **`renderOrder` explícito, y no es cosmético.**
 *
 * three ordena los transparentes por la posición del OBJETO, no por el fragmento
 * (`reversePainterSortStable`). Los cilindros están centrados en el origen, así
 * que su distancia es la de la cámara (9 a 27) y el sol está a 34: sin
 * `renderOrder`, **la envolvente se dibuja ENCIMA del sol**. Es lo que pasa hoy
 * con la pantalla de S7.
 *
 * `renderOrder` tiene prioridad sobre la distancia, así que estos cuatro números
 * fijan el orden: gruesa → fina → washout → sol. Las partículas quedan en 0 y se
 * ordenan por distancia, que es correcto: llegan como mucho a radio 34, o sea el
 * radio del sol.
 */
export const MOIRE_FAR_ORDER = -20
export const MOIRE_NEAR_ORDER = -19
