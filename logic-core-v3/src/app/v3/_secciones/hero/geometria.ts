/**
 * HERO — LA GEOMETRÍA Y LOS DOS REGISTROS DEL TITULAR.
 *
 * Sale de `Hero.tsx` cuando ese archivo cruzó las 300 líneas del repo al
 * rehacerse el titular, y el corte es el mismo que Trabajos ya tenía
 * (`trabajos/geometria.ts`): **los números de la sección por un lado y la
 * composición por el otro.** Quien cambie una medida no vuelve a leer el JSX, y
 * quien cambie el marcado no vuelve a leer las derivaciones.
 *
 * ── Por qué las dos TIPOGRAFÍAS viven acá y no en el componente ────────────
 *
 * Porque son la misma cosa que la geometría, no una vecina: **el tamaño del
 * nivel `display` se DERIVA del ancho de la caja del titular**. Los 58 px salen
 * de dividir 478,40 px por el avance de la cara; separarlos dejaría la cuenta
 * partida en dos archivos y la razón escrita en uno solo. Acá el número y su
 * porqué se leen de una sentada.
 *
 * Las tres constantes son las que el instrumento importa para afirmar el MISMO
 * valor que se renderiza, y no una copia escrita a mano.
 */

/** LA GEOMETRÍA — todos los números de la sección, juntos y fuera del contenido.
 *  Están acá y no en `contenido.ts` porque son técnicos: los decide quien construye
 *  la sección y no cambian el día que llegue el copy definitivo. Mezclarlos con el
 *  contenido obligaría a exceptuarlos del escáner de cifras, y una excepción es por
 *  donde vuelve a entrar la primera cifra inventada. */
export const GEOMETRIA = {
  /**
   * LA MEDIDA DEL TITULAR: 3 columnas de 5. [derivado]
   *
   * No es estética: es la condición de que P1 tenga algo que coreografiar. A 1920 la
   * columna fluida de la grilla lateral mide ~1700 px y el titular a `titulo-xl`
   * (56 px) ocupa ~1180, o sea que **a ancho completo entraría en una sola línea** y
   * el patrón de línea por línea se quedaría sin gesto. Tres de cinco dan ~1000 px.
   *
   * La grilla de 5 es además la única del sistema que colapsa en 1025 —la firma
   * estructural del breakpoint, 40 apariciones arriba y cero abajo—, o sea el
   * mismo píxel en el que se apaga la coreografía. La medida y el gesto
   * conmutan juntos y no queda una banda donde uno esté sin el otro.
   */
  columnasDeLaMedida: 3,
  columnasTotales: 5,
  /** La clase, escrita ENTERA y literal. Tailwind escanea el código fuente: una
   *  armada como `escritorio:col-span-` más el número no la ve nadie y su regla no se
   *  emite nunca —el atributo queda en el HTML, el navegador no encuentra nada, y la
   *  página se ve casi bien sin un solo error—. El invariante afirma que este literal
   *  y el número de arriba dicen lo mismo, que es lo que impide que se desincronicen. */
  claseDeLaMedida: 'escritorio:col-span-3',
  /**
   * ── B1 · LA CAJA DEL TITULAR: 2 de 3 de la medida. [medido] ─────────────
   *
   * **Es forzado, no estético: con la medida entera el titular se mete adentro
   * del logo.** Medido sobre el píxel real —captura del hero con el texto
   * ocultado en runtime, tinta `rgb(17,17,17)` contra el fondo capturado—:
   *
   *     ancho   borde seguro    fin del titular    peor contraste   % bajo AA
   *     1440    x = 683         x = 803  (+120)        1,00:1         12,66 %
   *     1920    x = 957         x = 1077 (+120)        1,00:1          9,22 %
   *     2560    x = 1275        x = 1365 (+90)         1,00:1         10,22 %
   *
   * **1,00:1 no es poco contraste: es tinta negra sobre el logo negro.** El
   * «borde seguro» es la primera columna de píxeles en la que más del 10 % de
   * la banda vertical del texto deja la tinta por debajo de AA (4,5:1); no es
   * «el primer píxel oscuro», porque la escena tiene partículas sueltas por
   * toda la pantalla y un punto de 3 px no vuelve ilegible un renglón. En los
   * tres anchos ese borde coincide al píxel con el arranque de la masa oscura.
   *
   * Con 2 de 3 la caja queda en 478,4 · 670,4 · 732,8 px y termina en 666 ·
   * 858 · 1209: **por dentro del borde seguro en los tres**, con 16,6 · 98,6 ·
   * 66,2 px de margen. La sub-grilla de 3 reproduce EXACTO las columnas de la
   * grilla de 5 —la medida son 3 columnas más 2 canaletas, así que dividirla en
   * 3 con la misma canaleta devuelve la misma columna— o sea que esto no
   * inventa una grilla nueva: usa la que ya está.
   *
   * ⚠ El NIVEL tipográfico no cambia y está verificado: `titulo-xl` es el más
   * grande de los cuatro (`Titular.tsx`) y el hero ya lo usa en su familia
   * fluida — 56 px a 1440 y 65,01 px a 1920 y 2560, medidos en el navegador.
   * Lo que se acota es la caja, no la letra.
   */
  columnasDeLaCajaDelTitular: 3,
  columnasDelTitular: 2,
  claseDelTitular: 'tablet:col-span-2',
  /**
   * ── B1 · LA BAJADA: MEDIA MEDIA COLUMNA. [decidido por el humano] ────────
   *
   * *«La bajada se acota a media columna. Que termine antes de donde empieza el
   * logo: así se arreglan el ancho de línea y la colisión de una.»*
   *
   * «La columna» es **la medida del hero** —3 de 5— y no la columna fluida de
   * la grilla lateral, y la propia instrucción lo decide: media columna fluida
   * daría 610 px a 1440 y terminaría en x 798, **afuera** del borde seguro de
   * 683. Media medida da 354,8 · 498,8 · 545,6 px y termina en 543 · 687 · 1022:
   * por dentro en los tres, con 140 · 270 · 253 px de margen.
   *
   * Lo que arregla, medido:
   *
   *     antes   1440  2 líneas de 70,5 caracteres · termina en x 902 (+219)
   *             1920  1 línea  de 141  caracteres · termina en x 1169 (+212)
   *             2560  1 línea  de 141  caracteres · termina en x 1457 (+182)
   *
   * Una línea de 141 caracteres es casi el doble del techo de lectura, y en
   * `nk.studio` —medido con el mismo instrumento— **la caja de texto del hero
   * mide 480 px y no crece con la ventana**: 0,25 del viewport a 1920 contra
   * 0,53 que teníamos. La resta va en esa dirección sin copiarle un valor.
   *
   * Una sub-grilla de 2 es la mitad exacta de la medida, canaleta incluida.
   */
  columnasDeLaCajaDeLaBajada: 2,
  /**
   * Cuántas líneas tiene el titular. **Ya no es una promesa: es la cuenta.**
   *
   * Hasta el rehecho era inerte —`LineasDeTexto` recalculaba la cantidad con
   * las líneas que MEDÍA, que era el punto entero del divisor— y se declaraba
   * sólo para hacer comparable la sección con el rango del patrón (1 a 6).
   * Ahora las dos líneas son dos REGISTROS tipográficos declarados, así que
   * este número es a la vez el `cantidad` del escalonado de P1 y la cantidad
   * de piezas que el marcado emite. El invariante afirma las dos cosas contra
   * este único valor.
   */
  lineasDelTitular: 2,
  /**
   * CUÁNTAS de esas líneas entran por la COREOGRAFÍA. **Una, no dos.**
   *
   * La línea 1 es la pieza QUIETA del hero: sin animación de entrada, presente
   * en el primer cuadro. Devuelve lo que la sección perdió cuando se eliminó el
   * cepillo, que era la única pieza sin entrada y estaba ahí por un motivo
   * escrito —sostener la pantalla mientras el preloader todavía sale—. Así que
   * P1 se queda con UNA pieza: la línea 2.
   *
   * Va como número propio y no como `lineasDelTitular - 1` porque son dos
   * cosas distintas: cuántas líneas TIENE el titular y cuántas ENTRAN. El
   * invariante afirma las dos por separado —dos `<span>` adentro del `h1` y una
   * sola promoción a capa de composición— y por eso no se pueden desincronizar
   * en silencio.
   */
  piezasAnimadasDelTitular: 1,
  /**
   * ── LA LÍNEA 1 ENTRA EN UNA SOLA LÍNEA A 1440. [medido] ─────────────────
   *
   * La condición que fija el tamaño del nivel `display` (58 px) y la única
   * cosa de esta composición que puede romperse cambiando el copy. Los tres
   * números, todos leídos y ninguno escrito a mano:
   *
   *     caja del titular a 1440     478,40 px  (2 de 3 de la medida, arriba)
   *     avance de la línea 1         8,5670 em  (del `.woff2` que se sirve,
   *                                              en wdth 62 · wght 700)
   *     interletrado del nivel      −0,02 em    (`--tracking-display`)
   *
   *     58 × (8,5670 − 19 × 0,02) = 474,85 px   →  3,55 px de margen
   *
   * El 19 y no el 20 es el lado conservador: `letter-spacing` se aplica
   * también después del último carácter, así que contar un hueco de menos
   * SOBREESTIMA el ancho. Y el kerning —que `kern` viaja en el subset— sólo
   * puede achicarlo más. `hero.invariant.tsx` vuelve a correr esta cuenta con
   * el binario, no con estas cifras transcritas.
   *
   * ⚠ **A 1025 NO entra y son dos líneas**, y eso está medido y declarado en
   * `theme-develop.css`: el cruce cae en 1425,5 px. Este sprint cierra 1440.
   */
  anchoDeLaCajaDelTitularA1440Px: 478.4,
  /**
   * Un solo target en el bloque P2, que es lo que mide el patrón: con una pieza
   * el escalonado queda inerte y la duración aplicada coincide con la
   * declarada. Es el único patrón donde las dos coinciden.
   */
  piezasDelBloqueDeEntrada: 1,
} as const

/**
 * LA TIPOGRAFÍA DE LA LÍNEA 1 — la cara de display, en mayúsculas.
 *
 * Sigue llamándose `TIPOGRAFIA_DEL_TITULAR` porque es la que MIDE el titular:
 * es el registro dominante, el que fija la caja y el que `s3-banda` lee para
 * saber en qué nivel está el titular del Hero (`nivelDelTitular()` busca la
 * clase fluida acá). Exportada para que el invariante afirme el MISMO valor que
 * se renderiza y no una copia escrita a mano.
 *
 * Las cinco piezas, y ninguna es decorativa:
 *
 *   `font-display`        Archivo, la cara condensada. El ancho ya viene
 *                         pinchado en el binario (wdth 62): acá no hay ni
 *                         `font-stretch` ni `font-variation-settings`.
 *   `text-fluido-display` el nivel nuevo. 58 px a 1440, con su derivación
 *                         escrita al lado del token.
 *   `leading-titulo`      1,09 — el mismo de los cuatro titulares.
 *   `tracking-display`    −0,02 em. Es el default del nivel en la tabla y es
 *                         el valor con el que se derivó el 58: los dos son el
 *                         mismo número, no dos que coinciden.
 *   `uppercase`           **obligatorio, no estético.** El `.woff2` es un
 *                         subset de mayúsculas; sin esto las minúsculas caen
 *                         al fallback y se ve otra letra.
 *   `font-fuerte`         700. El peso más alto que el sistema declara.
 */
export const TIPOGRAFIA_DEL_TITULAR =
  'font-display text-fluido-display leading-titulo tracking-display font-fuerte uppercase'

/**
 * LA TIPOGRAFÍA DE LA LÍNEA 2 — Chivo Light itálica, y el nivel MÁS GRANDE.
 *
 * ⚠️ **PASÓ DE 44 A 104 px, Y ESO DA VUELTA EL TITULAR.** Usaba `titulo-l` —el
 * nivel que ya existía inmediatamente abajo del display— y ahora usa
 * `display-xl`, derivado con el mismo método que la línea 1: el mayor entero
 * que entra en UNA línea en la misma caja de 478,39 px. La línea 2 queda al
 * **179 %** de la línea 1, que se queda congelada en 58.
 *
 * El contraste entre las dos no lo pone el tamaño: lo ponen **el peso (700 →
 * 300), el ancho (condensado → normal) y la inclinación (0° → −8,05°)**, las
 * tres a la vez. Eso no cambió — lo que cambió es cuál de las dos manda.
 *
 * `font-titulo` es Chivo, la MISMA familia de la romana: la itálica entró al
 * mismo `font-family` por `style`, así que `italic` elige la cara de verdad y
 * no una oblicua sintetizada. `font-liviano` es el quinto peso, que este
 * pedido destrabó. `uppercase`, por lo mismo que la línea 1: su `.woff2` es
 * también un subset de mayúsculas.
 *
 * ⚠ `tracking-titulo` (−0,03 em) y no `tracking-display`: es el interletrado
 * con el que la línea se venía pintando y con el que se derivó el 104. Los dos
 * registros del titular llevan interletrados distintos porque son dos caras
 * distintas, y cada número sale de su propia cuenta.
 */
export const TIPOGRAFIA_DE_LA_SEGUNDA_LINEA =
  'font-titulo text-fluido-display-xl leading-titulo tracking-titulo font-liviano italic uppercase'

/** El handle estable del titular de dos registros. Lo busca el instrumento
 *  para encontrar la pieza sin depender del texto, que va a cambiar. Es el
 *  mismo oficio que `ATRIBUTO_TEXTO_POR_LINEAS` hace para el titular medido. */
export const ATRIBUTO_DEL_TITULAR = 'data-titular'
