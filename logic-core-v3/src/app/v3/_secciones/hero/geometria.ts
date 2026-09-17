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
 *
 * ── ⚠️ COMPO-1 · ACÁ TAMBIÉN VIVEN LAS CUATRO CLASES QUE CONMUTAN ─────────
 *
 * El sprint de composición agregó cuatro cadenas de clase —el envoltorio de las
 * filas, la columna lateral, el aire del pie y la sangría del CTA— y **no son
 * marcado disfrazado**: cada una es la forma en que un NÚMERO medido llega a la
 * pantalla, y las cuatro tienen su derivación escrita al lado. El criterio es el
 * mismo que puso acá las tipografías: donde el valor y su porqué se leen juntos,
 * nadie tiene que ir a buscar por qué hay un `-ml-2` en un JSX.
 *
 * ⚠️ **Dos de ellas se escriben como PAR —dónde empieza y dónde termina—** y
 * eso es una lección medida, no una prolijidad: las variantes de ancho de
 * Tailwind son `min-width` y no se apagan solas. `claseDelAireDelPieEnPortatil`
 * llegaba a 1440 y a 1920 y los corría 8,8 px hasta que se le agregó la segunda
 * mitad.
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
  /**
   * ── ⚠️ ABAJO DE 1025 LA CAJA ES ENTERA, Y ES UNA CORRECCIÓN DE ALCANCE ──
   *
   * Las tres derivaciones de arriba —los tres bordes seguros— están medidas a
   * **1440, 1920 y 2560**, o sea en escritorio. La clase, en cambio, se escribió
   * `tablet:`, así que también acotaba a 768 y a 1024, **donde el logo está
   * centrado y es MÁS ANCHO QUE EL CUADRO**: ahí un borde seguro horizontal no
   * compra nada —no hay un lado limpio al que correrse— y el precio es que los
   * dos registros del titular envuelvan.
   *
   * Medido (`e-antes.json`, la simulación `sim-caja-entera` contra el árbol):
   *
   *     ancho   caja      renglones L1/L2     alto del bloque   tinta sobre el logo
   *     768     364→552      2/2 → 1/1        424,34 → 287,67     41,5 % → 11,8 %
   *     1024    535→808      1/1 → 1/1        278,86 → 278,86     15,6 % → 15,6 %
   *     ≤425    sin cambio   —                sin cambio          sin cambio
   *
   * A 768 la línea 1 se pasaba del umbral por **0,17 px de cuerpo** y la 2 por
   * **1,24**; esos 1,41 px costaban **136,67 px de alto**. A 1024 los dos
   * registros ya entraban en un renglón, así que ensanchar la caja no mueve un
   * píxel de tinta. Abajo de 768 la grilla de la caja ya colapsa a una columna
   * (`Grilla`, `tablet:grid-cols-3`) y la clase nunca se aplicaba.
   *
   * ⚠ Por eso son DOS números y no uno: 3 de 3 en `tablet` y 2 de 3 en
   * `escritorio`. El breakpoint no se elige — es el mismo 1025 en el que la
   * medida (`escritorio:col-span-3`), la grilla de 5 y la coreografía ya
   * conmutan, así que el hero entero cambia de régimen en un solo píxel.
   */
  columnasDelTitularEnTablet: 3,
  claseDelTitular: 'tablet:col-span-3 escritorio:col-span-2',
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
   * ── COMPO-1 · EL TITULAR TIENE TRES FILAS Y **DOS RENGLONES EN ESCRITORIO**
   *
   * Los dos números dicen cosas distintas y por eso son dos:
   *
   *   `filasDelTitular`            3   cuántas CADENAS declara el contenido, y
   *                                    cuántos renglones se ven abajo de 1025.
   *   `renglonesDelTitularEnEscritorio`
   *                               2   cuántos se ven de 1025 para arriba, donde
   *                                    las filas 1 y 2 vuelven a compartir uno.
   *
   * **Lo que conmuta es el ENVOLTORIO del registro 1, no el contenido**: abajo
   * de 1025 es una columna flex y cada fila es un ítem; arriba es un `block` y
   * las dos filas salen inline con el espacio que hay en medio, o sea el mismo
   * renglón que el dueño aprobó a 1440 y a 1920. Está en
   * `claseDelEnvoltorioDeFilas`, con su porqué.
   *
   * ⚠ Hasta COMPO-1 este número se llamaba `lineasDelTitular` y valía 2, y era
   * a la vez «cuántas líneas hay» y «cuántos `<span>` emite el marcado». Ya no
   * puede ser las dos cosas: el marcado emite un `<span>` de más —el envoltorio
   * del registro 1— así que el invariante cuenta
   * `filasDelTitular + envoltoriosDelTitular` y los dos números viajan por
   * separado.
   */
  filasDelTitular: 3,
  renglonesDelTitularEnEscritorio: 2,
  /**
   * El `<span>` que envuelve las filas del registro 1. **Uno, y es el que
   * conmuta.** Va declarado porque el invariante cuenta los `<span>` de adentro
   * del `h1` y sin este número la cuenta sería un literal escrito a mano.
   */
  envoltoriosDelTitular: 1,
  /**
   * CUÁNTAS de esas filas entran por la COREOGRAFÍA. **Una, no tres.**
   *
   * Las filas del registro 1 son la pieza QUIETA del hero: sin animación de
   * entrada, presentes en el primer cuadro. Devuelven lo que la sección perdió
   * cuando se eliminó el cepillo, que era la única pieza sin entrada y estaba
   * ahí por un motivo escrito —sostener la pantalla mientras el preloader
   * todavía sale—. Así que P1 se queda con UNA pieza: la fila 3, el registro 2.
   *
   * Va como número propio y no como `filasDelTitular - 2` porque son dos cosas
   * distintas: cuántas filas TIENE el titular y cuántas ENTRAN. El invariante
   * afirma las dos por separado —los `<span>` adentro del `h1` y una sola
   * promoción a capa de composición— y por eso no se pueden desincronizar en
   * silencio.
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
  /**
   * ── COMPO-1 · EL ENVOLTORIO QUE CONMUTA, y por qué no es un `<br>` ───────
   *
   * ⚠️ **COMPO-2 · LE QUEDA UN SOLO CONSUMIDOR: EL REGISTRO 1 DEL TITULAR.**
   * Hasta este sprint lo usaba también la bajada, y la regla global de COMPO-2
   * le saca el quiebre —«Tu sitio, tu chat y tu seguimiento.» va en UN renglón
   * en los ocho anchos—. El porqué, con la medición que lo habilita, está en
   * `contenido.ts`. La clase no cambia: cambia cuántas piezas la llevan.
   *
   * Abajo de 1025 es una columna flex —cada fila es un ítem y ocupa su
   * renglón—; de 1025 para arriba es un `block` y las filas, que son `<span>`
   * sin `display` propio, vuelven a ser inline y salen seguidas con el espacio
   * que el marcado deja en medio.
   *
   * ⚠️ **`items-start` NO es decoración: sin él las filas se estiran.** Un ítem
   * de una columna flex se estira a todo el ancho del contenedor por defecto, y
   * con eso la caja de cada fila dejaría de terminar donde termina la palabra —
   * que es exactamente el motivo por el que `BajadaYCta` ya lo lleva.
   *
   * ⚠️ **Y no es un `<br class="escritorio:hidden">`, que era la otra forma.**
   * Un `<br>` apagado con `display:none` funciona, pero deja el corte escrito
   * en el MARCADO en vez de en el contenido, y esconde una decisión de
   * composición detrás de una utilidad de visibilidad: el día que alguien mire
   * el HTML no hay forma de saber que ese salto es deliberado y no un resto. El
   * envoltorio, en cambio, dice en su clase las dos formas que tiene.
   *
   * ⚠ El espacio entre filas es un nodo de texto del envoltorio, así que se
   * pinta con SU tipografía. Por eso el envoltorio del titular lleva
   * `TIPOGRAFIA_DEL_TITULAR` y las filas la heredan: con la clase en las filas
   * y no en el envoltorio, el espacio de escritorio saldría en la familia y el
   * tamaño HEREDADOS —cuerpo, 15 px— y las dos palabras quedarían casi pegadas.
   */
  claseDelEnvoltorioDeFilas: 'flex flex-col items-start escritorio:block',
  /**
   * ── COMPO-1 · §5 · LA COLUMNA LATERAL SE VA ABAJO DE 1025. [medido] ─────
   *
   * `Grilla columnas="lateral"` reserva **140 px fijos más la canaleta** desde
   * `tablet`, o sea desde 768. En el Hero esa celda está **VACÍA** —es un `<div>`
   * que sólo reserva— así que a 768 y a 1024 el texto arrancaba en x 184 con
   * 152 px de nada a su izquierda, y esos 152 px son los que lo empujaban
   * adentro del logo, que en esos anchos está centrado y es más ancho que el
   * cuadro. Medido con `scripts-compo/a-composicion.ts`: **borde de caja en
   * x 184 a 768 y a 1024**, contra x 32 en los cuatro anchos de abajo de 768,
   * donde la grilla ya colapsaba sola.
   *
   * Lo que hace esta clase es correr ese colapso de 768 a 1025: **la columna
   * lateral pasa a existir sólo donde la grilla de 5 existe**, que es donde
   * tiene un rótulo al lado que sostener (`Rotulo.tsx`, cierre estructural de
   * B11). Abajo de 1025 la celda vacía deja de reservar y el texto arranca en
   * el mismo x 32 que en mobile.
   *
   * ⚠ Se hace con `className` sobre la Grilla y NO agregando una variante a
   * `CLASES_DE_COLUMNAS`: esa tabla la consumen las ocho secciones y el pie, y
   * la decisión es de esta sección. `cn()` resuelve el conflicto —misma
   * propiedad, misma variante— quedándose con la última, y `test:s7-cn`
   * custodia que `cn()` no se coma nada.
   *
   * ⚠ El `<div>` vacío SE QUEDA. Abajo de 1025 la grilla tiene una sola columna
   * y el div pasa a ser una fila de alto cero; con `justify-end` esa fila cae
   * ARRIBA del contenido y no mueve un píxel del bloque, que se apoya abajo.
   * Sacarlo con `hidden` habría sido un cambio de más para el mismo resultado.
   */
  claseDeLaColumnaLateral:
    'tablet:grid-cols-1 escritorio:grid-cols-[var(--columna-lateral)_minmax(0,1fr)]',
  /**
   * ── COMPO-1 · §6 · EL AIRE DEL PIE EN PORTÁTIL. [derivado] ──────────────
   *
   * **El defecto, medido:** con el bloque apoyado abajo, entre el borde
   * inferior de la caja del CTA y el borde superior de la pastilla de
   * navegación quedan **8 px** — y en los ocho anchos donde `justify-end` manda,
   * no sólo en 1024. Ese 8 no es una decisión de nadie: es el sobrante de
   * `pb-20` (80 px) menos los `DESCUENTO_NACIMIENTO_PX` (72) que la pastilla
   * ocupa. Nadie eligió 8; quedaron.
   *
   * **Cuánto aire corresponde, derivado y no elegido:** la pastilla se separa
   * del borde de abajo de la pantalla `--spacing-6` (24 px) y se apoya arriba a
   * `--spacing-6` cuando llega a reposo. Ese token ES «cuánto aire quiere la
   * pastilla», y `navegacion.ts` lo declara como la simetría del mecanismo. El
   * bloque de texto se le acerca por el otro lado, así que le deja lo mismo:
   * 24 px. Lo que falta son `24 − 8 = 16` = **`--spacing-4`**, y ése es el
   * valor de esta clase.
   *
   * ⚠️ **`pb-20` NO se toca**, y es una instrucción explícita del sprint: sigue
   * siendo el que reserva los 72 px de la pastilla y `soporte.ts` §9 lo afirma
   * contra `DESCUENTO_NACIMIENTO_PX`. El aire se agrega POR AFUERA, como margen
   * del contenido, así que la reserva del pie queda intacta y el número que la
   * custodia no se mueve.
   *
   * ⚠️ **`medio:` y no `tablet:`, y el corte tiene motivo.** El pedido es de
   * 1024. Subir el bloque en los anchos de abajo sería moverlo ADENTRO de la
   * masa del logo, que es el defecto que los otros puntos vienen a achicar:
   * a 375, 390 y 425 el logo termina en las filas 454, 575 y 575 y el bloque ya
   * los toca. `--breakpoint-medio` (860 px) es el único corte declarado entre
   * `tablet` y `escritorio`, y hasta acá no tenía un solo consumidor en el lane;
   * éste es el primero. La banda que gana aire es **860 a 1024**.
   *
   * ⚠️ **`escritorio:mb-0` NO ES REDUNDANTE, Y LO ENSEÑÓ LA MEDICIÓN.** Las
   * variantes de ancho de Tailwind son `min-width`: `medio:` se prende en 860 y
   * **no se apaga nunca**, así que sin la segunda mitad el margen también
   * aplicaba a 1440 y a 1920. Ahí el bloque va CENTRADO, y un margen abajo
   * corre un bloque centrado la mitad para arriba: medido, **el tope pasó de
   * 298,20 a 289,41 px a 1440 y de 373,97 a 365,17 a 1920**, o sea 8,8 px de
   * movimiento en los dos anchos que este sprint tenía prohibido mover por
   * cualquier motivo que no fuera el tamaño de la bajada. La clase dice las DOS
   * mitades —dónde empieza y dónde termina— y el invariante las afirma juntas.
   *
   * ── ⚠️ COMPO-2 · UNA TERCERA MITAD, ADELANTE: LA BANDA 768–859. [medido] ─
   *
   * **El defecto que la trae no lo causa el titular: lo causa la regla global
   * del sprint.** La bajada pasa de dos renglones a uno, o sea que el bloque
   * pierde exactamente UNA caja de línea de `--text-base`
   * (`16 × 1,6 = 25,6 px`). Con el bloque apoyado abajo eso no lo achica en el
   * lugar: lo BAJA, porque el borde de abajo está clavado y todo lo de arriba
   * se corre hacia él. Medido en los ocho anchos, y en siete no importa o
   * mejora; a 768 es una regresión de dos veces y media:
   *
   *     ancho   hoy      con la regla global   qué pasa
   *     390     2,73 %   0,93 %                baja
   *     425     4,34 %   1,14 %                baja — es lo que resuelve el §2
   *     768     3,35 %   **8,53 %**            SUBE
   *     1024    0,51 %   0,36 %                baja
   *
   * **Por qué justo 768:** la escena tiene una SEGUNDA masa negra —`TEXTO-1` §4
   * la midió en ~0,781 del alto— y a 768×1024 cae en las filas **800–838**. El
   * registro 2 vive hoy en 741,9–829,8 y le toca el borde; bajarlo 25,6 px lo
   * mete entero adentro, y su tinta sobre la masa pasa de 6,08 % a 16,79 %.
   *
   * **Lo que se devuelve es exactamente lo que se sacó**, y por eso el valor no
   * es un escalón de la escala sino la misma cuenta que lo produjo:
   * `calc(var(--text-base) * var(--leading-texto))`. El control lo confirma al
   * píxel: con el margen puesto la superposición vuelve a **3,35 %**, el mismo
   * número de hoy, con el mismo titular.
   *
   * ⚠️ **Y NO es que el bloque suba: es que NO baja.** Los 72 px que libera la
   * pastilla desmontada (§3a) siguen reservados por `pb-20`, que no se toca —
   * medido con la pastilla apagada: el tope de la columna no se mueve un
   * centésimo (644,38 px con y sin ella)—. Si se soltaran, el bloque caería 72
   * px y a 425 la superposición saltaría de 4,33 % a 14,82 %.
   *
   * ⚠️ **La banda es 768–859 y NO llega a 1024**, porque `medio:mb-4` la pisa
   * en 860: ahí manda la derivación de COMPO-1, que sigue viva porque a 1024 la
   * pastilla se queda (§4a). Dos bandas, dos motivos, los dos escritos.
   *
   * ── ⚠️ ROCE-1 · EL VALOR PASA A SER UNA RESTA, Y EL TÉRMINO NUEVO ES UN
   *    CORRIMIENTO MEDIDO CONTRA LA SILUETA DEL LOGO. [medido] ──────────────
   *
   * **El defecto:** a 768 la tinta del registro 1 toca la silueta del logo. No
   * lo dice una mirada: lo dice la máscara ANALÍTICA del logo cruzada con la
   * tinta dibujada del titular — **0,62 % de la tinta del titular sobre el
   * logo**, toda ella del registro 1 (0,89 % del suyo). El borde inferior del
   * lóbulo izquierdo del isotipo baja hasta la fila 698 y la primera fila del
   * registro 1 nace en 595,88: lo que se toca es ese lóbulo por arriba, no la
   * cola.
   *
   * **El corrimiento es el MÍNIMO que lleva esa cifra a cero, barrido de a un
   * píxel** (`scripts-roce/a-barrido.ts`, salida `outputs/roce/a-logo768fino.json`):
   *
   *     baja   0 px → 0,62 %      baja   4 px → 0,11 %
   *     baja   1 px → 0,47 %      baja   5 px → 0,04 %
   *     baja   2 px → 0,31 %      baja   6 px → **0,00 %**  ← el mínimo
   *     baja   3 px → 0,19 %      baja   7 px → 0,00 %
   *
   * La serie es monótona y **reproducible al centésimo entre dos corridas**: la
   * silueta sale del muestreador analítico con el progreso de reposo y la tinta
   * de una captura sin escena, así que ninguno de los dos términos tiene el
   * ruido de motas que sí tiene la lectura por luminancia.
   *
   * **Por qué el valor se escribe como `− 6px` y no como un escalón:** los dos
   * términos son cosas distintas y cada uno tiene su procedencia. El primero es
   * el renglón que la regla global le sacó al bloque (`--text-base ×
   * --leading-texto`); el segundo es cuánto hay que bajarlo para despegarlo del
   * lóbulo. Sumarlos en un número redondo escondería las dos derivaciones.
   * `ajuste.ts` §16d afirma la resta contra `CORRIMIENTO_DEL_ROCE_EN_768_PX`.
   *
   * ⚠️ **Y SON 6 px, NO 72: la segunda masa no se toca.** COMPO-2 dejó medido
   * que bajar el bloque 25,6 px a este ancho mete el registro 2 adentro de la
   * segunda masa de la escena (filas 800–838) y su superposición por luminancia
   * salta a 8,53 %. Con 6 px el titular pasa de **3,35 % a 3,52 %** por
   * luminancia (+0,17 puntos, dentro del ruido de tres corridas del mismo
   * árbol, que COMPO-2 midió en 0,2 puntos) y a 0,00 % contra el logo. El techo
   * de ese ancho está en 72 px con el pie en su piso —y en 105,59 gastando
   * además este margen—, así que 6 px queda a un doceavo del techo.
   */
  claseDelAireDelPieEnPortatil:
    'tablet:mb-[calc(var(--text-base)*var(--leading-texto)-6px)] medio:mb-4 escritorio:mb-0',
  /**
   * ── COMPO-1 · §4 · LA SANGRÍA DEL CTA, CANCELADA. [medido] ──────────────
   *
   * **Las cuatro CAJAS están alineadas al píxel y la TINTA no**, y la medición
   * separa las dos causas (`outputs/compo/a-composicion-antes.json`):
   *
   *     pieza        caja    tinta   sangría    ¿de qué depende?
   *     fila 1       x 32    x 33      +1       del tamaño: 1 a 1440, 1 a 320
   *     fila 3       x 32    x 36      +4…+7    del tamaño: 4 a 320 → 7 a 1920
   *     bajada       x 32    x 32       0       —
   *     CTA          x 32    x 40      +8       CONSTANTE en los ocho anchos
   *
   * **Los +8 del CTA no son ópticos: son `padding: var(--spacing-2)`**, que
   * `_estilos/cta.css` le pone al componente. Se reconocen porque el número no
   * se mueve un décimo entre 320 y 1920 mientras el tamaño del rótulo tampoco
   * —es el mismo `text-cuerpo` de 15 px en los ocho— y sobre todo porque es
   * exactamente el token. Las sangrías de las filas del titular, en cambio,
   * **escalan con el cuerpo**: son la banda lateral del glifo, o sea óptica.
   *
   * Por eso este sprint corrige UNA sola: la del CTA, que es layout. Las otras
   * dos se reportan y NO se tocan — compensarlas es compensación óptica, que la
   * instrucción declara otra decisión.
   *
   * ⚠ El valor es el MISMO token que el relleno que cancela, con el signo dado
   * vuelta: `-ml-2` emite `calc(var(--spacing-2) * -1)`. Si alguien cambia el
   * relleno del CTA, esto se desincroniza — y por eso el invariante afirma que
   * el escalón de esta clase y el del relleno de `cta.css` son el mismo.
   *
   * ⚠ Lo que se corre es la CAJA, no el rótulo: el anillo de foco y el área de
   * toque viajan con ella y siguen envolviendo el mismo relleno. Lo único que
   * cambia de lugar es dónde apoya esa caja.
   */
  claseDeLaSangriaDelCta: '-ml-2',
  /** El escalón de espaciado que el CTA usa de relleno y que la clase de arriba
   *  cancela. Va como número para que el invariante compare las dos cosas en
   *  vez de mirar una cadena. */
  escalonDeLaSangriaDelCta: 2,
  /**
   * ── PAPEL-2 · §2 · LA MARCA, SÓLO EN LOS ANCHOS DE PAPEL. [derivado] ────
   *
   * `chico:hidden`: la marca EXISTE en el marcado siempre y **deja de ocupar de
   * 390 para arriba**, que es el mismo píxel en el que el papel se apaga y la
   * sala vuelve a verse. Ahí la composición ya está aprobada por el dueño y el
   * §6 del sprint la declara intocable, así que la marca no puede aparecer.
   *
   * ⚠ **Es una media query y no una rama, y no es una preferencia.** `Hero` es
   * un componente de cliente, pero el hook que lee el ancho (`useAnchoMinimo`)
   * devuelve `false` en el servidor Y en la hidratación a propósito: con una
   * rama de JS el primer cuadro saldría SIN marca y la metería después, que es
   * un parpadeo exactamente donde el sprint quiere una composición quieta. Es
   * el mismo argumento con el que `superficies.ts` justifica que la banda de
   * papel sea CSS.
   *
   * ⚠ **`display:none` y no `visibility` ni `opacity`**: un ítem de flex con
   * `display:none` deja de ser ítem, así que **el hueco de la columna se va con
   * él**. Con `visibility:hidden` el `gap-2` de arriba seguiría empujando el
   * bloque 8 px y los seis anchos que este sprint no puede tocar se moverían.
   *
   * ⚠ El costo que SÍ paga de 390 para arriba es **marcado**: el path de la
   * marca viaja en el HTML de los ocho anchos aunque sólo se vea en dos. Está
   * medido y declarado como línea de peso con su recibo; la alternativa
   * —renderizarla condicionalmente— es la rama de JS que el párrafo de arriba
   * descarta.
   */
  claseDeLaMarcaDelHero: 'chico:hidden',
  /**
   * ── ⚠️ COMPO-2 · §1 · EL FACTOR DE LA MARCA — UNA RAZÓN, NO UN TAMAÑO ────
   *
   * El pedido es «el isotipo MUCHO más grande; subilo hasta consumir la
   * holgura, y la palabra `develOP` que lo acompañe, proporcional a él».
   * **Son dos piezas y UN solo número**, y el número no se elige: sale de
   * igualar el ancho de tinta del isotipo al ancho de tinta del titular.
   *
   *     ancho del isotipo  = alto × razón del viewBox = tamaño₁ × 1,09 × 1,43749 × k
   *     ancho del titular  = tamaño₁ × avance(«TU NEGOCIO»)
   *     k = 4,12429 / (1,09 × 1,43749) = **2,63219**
   *
   * Los tres números están medidos y ninguno es de este sprint: el avance sale
   * del `.woff2` que se sirve (Archivo wdth 62 · wght 700, con
   * `--tracking-display` y el factor del eje de peso que `composicion.ts`
   * derivó) y es el MISMO 4,12429 con el que PAPEL-2 §3 calculó su razón; el
   * 1,09 es `--leading-titulo`; el 1,43749 es `LOGO_INK_VIEWBOX` recortado a la
   * tinta (978,459 / 680,67).
   *
   * ⚠️ **No depende del ancho de pantalla, y ésa es la mitad que importa.**
   * Depende de la cara y del dibujo, así que vale lo mismo a 320 y a 375 — y
   * por eso la marca **no cambia de forma entre dos teléfonos**, que es el
   * defecto que COMPO-1 le arregló al titular y que este sprint no vuelve a
   * introducir por el otro lado.
   *
   * ── Los dos techos, y por qué éste queda abajo de los dos ───────────────
   *
   * El factor no puede ser cualquiera: tiene un techo por ALTO —la columna
   * entera más un respiro— y otro por ANCHO —el isotipo no puede salirse de la
   * caja del titular—. Derivados en `scripts-compo2/b-derivacion.ts` con el
   * alto del bloque MEDIDO en el navegador y no modelado:
   *
   *     ancho   techo por ALTO   techo por ANCHO   aplicado   sobrante
   *     320     ×3,1373          ×2,6760           ×2,63219   47,66 px
   *     375     ×3,2584          ×2,6683           ×2,63219   66,28 px
   *
   * El techo común es **×2,6683** —lo pone el ANCHO a 375— y el factor derivado
   * queda un 1,4 % por debajo. O sea que «el mayor alto que entra» y «el que
   * iguala la tinta del titular» son, acá, prácticamente el mismo número: el
   * isotipo termina midiendo 251,81 px de ancho en una caja de 256 a 320 y
   * 306,79 en una de 311 a 375, que es el mismo margen que tiene el titular.
   *
   * El respiro NO se eligió: es `--spacing-2` por lado, el MISMO hueco con el
   * que la columna separa sus piezas. Un bloque no puede quedar más cerca del
   * borde de su caja de lo que sus piezas quedan entre sí.
   *
   * ⚠ El literal 2,63219 se escribe TRES veces —las dos variantes del isotipo y
   * la palabra— y ése es exactamente el patrón que se desincroniza en silencio.
   * Se ata igual que el 1,11025 de PAPEL-2: `hero.invariant` §16 recalcula la
   * razón contra el binario y el `viewBox`, y afirma que las tres lo dicen.
   *
   * ── PAPEL-2 · §2 · EL ALTO DEL ISOTIPO — UNA FILA DEL TITULAR. [derivado]
   *
   * ⚠️ **COMPO-2 lo multiplica por el factor de arriba: deja de ser UNA fila y
   * pasa a ser 2,63.** Lo que sigue es la derivación de PAPEL-2, que explica de
   * dónde sale la base que el factor multiplica.
   *
   * **No es un tamaño elegido: es una fila.** El isotipo ocupa exactamente UNA
   * caja de línea del registro 1 —`tamaño × --leading-titulo`—, o sea el mismo
   * alto que cada uno de los dos renglones que tiene abajo. La marca entra en el
   * ritmo de la columna en vez de traer una medida propia.
   *
   *     ancho   tamaño del registro 1   × 1,09   alto del isotipo
   *     320     61,06 px                          66,56 px
   *     375     74,39 px                          81,08 px
   *
   * El ancho no se declara: el `viewBox` del isotipo está recortado a la tinta
   * (978,459 × 680,67 → razón 1,4375) y `w-auto` lo deja salir de ahí, o sea
   * **95,68 px a 320 y 116,55 a 375**.
   *
   * ⚠ **Son DOS clases porque el registro 1 tiene dos regímenes**, y el isotipo
   * tiene que seguir al que manda en cada uno: `--text-display-r1-papel` de 375
   * a 389 y `--text-display-r1-papel-angosto` abajo de 375. Con una sola, a 320
   * la marca mediría los 81 px de 375 y dejaría de ser una fila de SU titular.
   *
   * ⚠ El `calc()` no tiene un solo número escrito: multiplica dos tokens. Es la
   * diferencia entre declarar una relación y declarar un valor, que es lo que
   * la instrucción pide cuando dice «derivados de los tokens que existen».
   */
  claseDelIsotipo:
    'h-[calc(var(--text-display-r1-papel)*var(--leading-titulo)*2.63219)] max-angosto:h-[calc(var(--text-display-r1-papel-angosto)*var(--leading-titulo)*2.63219)]',
  /**
   * ── PAPEL-2 · §2 · EL REGISTRO DE LA PALABRA. [derivado] ────────────────
   *
   * `text-fluido-caption` — el nivel de metadato, 11 a 12,45 px. **No se eligió
   * por tamaño: se eligió por precedente.** Es el ÚNICO registro en el que el
   * lane ya pinta la palabra `develOP` cuando está sola como marca y no como
   * título: `LineaDeCierre` la monta adentro de un `Caption`, con el prefijo y
   * el separador al lado. Esta composición es la misma firma, arriba en vez de
   * abajo, así que usa el mismo nivel.
   *
   * Lo demás lo trae la pieza: `Logotipo` ya declara `font-titulo`,
   * `tracking-titulo`, `leading-titulo` y `font-semi`, y ninguno se repite acá.
   *
   * ── ⚠️ COMPO-2 · §1 · SIGUE SIENDO `caption`, MULTIPLICADO POR EL FACTOR ─
   *
   * *«La palabra `develOP` acompaña, proporcional al isotipo. Hoy es `caption`
   * a 11 px y queda minúscula al lado de una marca grande.»*
   *
   * **Proporcional quiere decir el MISMO factor**: la palabra y el dibujo se
   * multiplican por 2,63219, así que el lockup no cambia de forma —cambia de
   * tamaño—. 11 px pasan a **28,95 px** en los dos anchos de papel. No se
   * inventa una segunda razón: este sprint no recibió un pedido sobre la
   * proporción INTERNA del lockup, sino sobre su tamaño, y una razón nueva
   * habría sido un número elegido.
   *
   * ⚠ Queda dicho lo que eso conserva: la proporción palabra/isotipo sigue
   * siendo la que dejó PAPEL-2 y **no es la misma en los dos anchos** (0,165 a
   * 320 y 0,136 a 375), porque allá el isotipo se derivó del titular —que
   * escala con el ancho— y la palabra se tomó de `caption` —que a 320 y a 375
   * vale 11 px en los dos—. Si el dueño quiere una palabra más grande contra el
   * dibujo, eso es una razón nueva y se deriva aparte.
   *
   * ⚠ **`text-[length:...]` y no `text-[...]`, y no es cosmética.** Sin la
   * pista de tipo, `tailwind-merge` no puede saber si un valor arbitrario de
   * `text-` es un TAMAÑO o una TINTA, y el día que alguien ponga un color al
   * lado `cn()` se come uno de los dos en silencio — el mismo defecto que la
   * lista de tamaños de `src/lib/utils.ts` existe para evitar.
   *
   * ⚠ El nivel de la escala sigue adentro del `calc()` y no se reemplaza por un
   * número: la palabra sigue atada a `caption`, y si el nivel se mueve, ella se
   * mueve con él.
   */
  claseDelLogotipoDelHero: 'text-[length:calc(var(--text-fluido-caption)*2.63219)]',
  /**
   * EL FACTOR, como NÚMERO y no como cadena. El invariante lo recalcula contra
   * el `.woff2` y el `viewBox` y afirma que las tres clases de arriba lo dicen;
   * sin esta constante la comprobación tendría que parsear tres literales y
   * compararlos con un cuarto escrito a mano.
   */
  factorDeLaMarca: 2.63219,
  /**
   * ── PAPEL-2 · §5 · EL PIE, SIN PASTILLA QUE RESERVAR. [derivado] ────────
   *
   * `pb-20` reserva los 72 px de `DESCUENTO_NACIMIENTO_PX` —la pastilla de
   * navegación, que nace a `100svh − 24 − 48`—. En la banda de papel la pastilla
   * está **desmontada** (§5), así que esos 72 px no reservan nada: son aire
   * muerto abajo de un bloque que está apoyado justamente ahí.
   *
   * **Lo que queda es el SOBRANTE, y ya estaba medido:** COMPO-1 §6 publicó que
   * entre el borde de abajo del CTA y el borde de arriba de la pastilla quedaban
   * `80 − 72 = 8` px, y dijo que nadie los eligió. Son los mismos 8. Con la
   * pastilla afuera, el pie del bloque vale exactamente ese sobrante:
   * **`--spacing-2`**, el escalón que ya lo nombraba.
   *
   * ⚠️ **`pb-20` NO se toca, y esta clase es un agregado por encima.**
   * `soporte.ts` §9 lo afirma contra `DESCUENTO_NACIMIENTO_PX` y ese par sigue
   * intacto para los seis anchos donde la pastilla existe; lo que hace
   * `max-chico:pb-2` es apagarlo donde el objeto que reserva no está.
   *
   * ⚠ **Los 72 px liberados son el presupuesto del §4, y son los que vuelven
   * fiable a 320.** Con la pastilla puesta el bloque entero —marca incluida—
   * mide 402,82 px contra 408 de disponible: entra por **5,18 px**, que es menos
   * que el desvío conocido del propio modelo contra el navegador (1,03 px de
   * sesgo sistemático, y eso sin contar redondeos de caja de línea). Con los 72
   * liberados la holgura pasa a **77,18 px a 320 y 119,53 a 375**, y ahí el
   * «entra» deja de depender de la precisión del modelo. Las dos cuentas están
   * en `scripts-papel/a-derivacion.ts`.
   */
  claseDelPieSinPastilla: 'max-chico:pb-2',
  /**
   * ── COMPO-2 · §1 · EL BLOQUE CENTRADO EN LA BANDA DE PAPEL. [pedido] ─────
   *
   * *«El conjunto entero pasa a estar CENTRADO VERTICALMENTE en el viewport, no
   * apoyado abajo.»*
   *
   * `justify-end` sigue siendo el default de la sección —lo puso TAPADO-1 y
   * sostiene 390, 425, 768 y 1024— y `escritorio:justify-center` sigue siendo
   * el de 1440 y 1920. Lo que agrega esta clase es el TERCER régimen: abajo de
   * 390, centrado. La banda es la misma en la que el Hero pinta papel, esconde
   * la marca y apaga el pie, así que no nace un corte nuevo.
   *
   * ⚠ **Con el bloque casi llenando la caja, centrar mueve poco — y aun así el
   * bloque sube mucho.** Lo que lo sube es la marca: el tope de la columna pasa
   * de 158,25 a ~56 px a 320. Centrar aporta la mitad del sobrante; el resto lo
   * aporta que la columna CRECIÓ hacia arriba. Los dos números van al informe
   * por separado para que no se confundan.
   */
  claseDelBloqueCentradoEnPapel: 'max-chico:justify-center',
  /**
   * ── COMPO-2 · §1 · EL AIRE DE ARRIBA, IGUALADO AL DE ABAJO. [derivado] ───
   *
   * **Sin esto, «centrado» es mentira.** `justify-content: center` centra en la
   * CAJA DE CONTENIDO, no en el viewport, y las dos no coinciden mientras el
   * relleno de arriba (`pt-20`, 80 px) y el de abajo (el `max-chico:pb-2` de
   * PAPEL-2, 8 px) sean distintos: el bloque quedaría 36 px por debajo del
   * centro de la pantalla, que es exactamente lo que el pedido no quiere.
   *
   * **El valor no se elige, y el argumento ya estaba escrito en `Hero.tsx`:**
   * *«El `pt-20` de arriba NO es la simetría del de abajo: son dos decisiones
   * que hoy dan el mismo valor. El de abajo está atado a la geometría de la
   * pastilla y el invariante lo afirma contra ella; **el de arriba es aire**.»*
   * Con el bloque centrado, el aire lo pone el centrado y el relleno pasa a ser
   * el PISO. El piso de abajo ya está derivado —el sobrante `80 − 72` que
   * COMPO-1 §6 midió y PAPEL-2 §5 cobró—, así que arriba se le iguala.
   *
   * Lo que eso compra, medido: el alto útil pasa de 480 a **552 px** a 320 y de
   * 579 a **651** a 375, y son esos 72 px los que dejan entrar una marca de
   * ×2,63 en vez de una de ×2,22 (el techo por alto con `pt-20` puesto).
   *
   * ⚠️ **`pt-20` NO se toca**, igual que `pb-20`: esto es una condición
   * agregada por encima y acotada a la banda de papel. En los seis anchos
   * restantes el relleno de arriba sigue siendo 80 px.
   *
   * ⚠ Riesgo declarado de `justify-content: center`: si el contenido llegara a
   * pasarse del alto de la caja, un bloque centrado se desborda por los DOS
   * lados y la parte de arriba queda fuera de alcance. Acá no pasa —la columna
   * mide 504,34 de 552 a 320, el peor caso— y `min-h-svh` hace crecer la
   * pantalla antes que recortar, pero queda escrito porque el día que el copy
   * crezca es el modo de falla de esta clase.
   */
  claseDelAireDeArribaEnPapel: 'max-chico:pt-2',
  /**
   * ── COMPO-2 · §1 · LA CELDA LATERAL VACÍA, APAGADA DONDE SE CENTRA. [medido]
   *
   * La grilla `lateral` del Hero tiene dos hijos: un `<div>` vacío que RESERVA
   * la celda de 140 px y el bloque. Abajo de 1025 la grilla colapsa a una
   * columna y ese hijo pasa a ser una fila de alto cero — COMPO-1 lo midió y lo
   * dejó, con el argumento de que con `justify-end` la fila cae arriba del
   * bloque y no mueve un píxel.
   *
   * **El argumento era cierto y dejó de serlo en la banda de papel.** Una fila
   * de alto cero no cuesta cero: la grilla le pone su canaleta
   * (`--grilla-canal-compacto`, 12 px) igual. Con el bloque apoyado abajo esos
   * 12 px caen en el aire de arriba y no los ve nadie; con el bloque CENTRADO
   * (§1) corren la columna visible 6 px por debajo del centro. Medido a 320
   * antes de esta clase: **37,81 px de aire arriba contra 25,83 abajo**, o sea
   * los 12 px repartidos en dos.
   *
   * `display:none` saca al hijo de la grilla, y con un solo hijo no hay
   * canaleta que poner. La banda es `chico:` —la misma del centrado— porque de
   * 390 para arriba el bloque vuelve a apoyarse abajo y la fila fantasma vuelve
   * a no costar nada.
   *
   * ⚠ El `<div>` NO se borra: de 1025 para arriba sigue siendo lo que impide
   * que el bloque caiga en la celda de 140 px. Lo que se apaga es su presencia
   * en los dos anchos donde la grilla ya no tiene dos celdas.
   */
  claseDeLaCeldaLateralEnPapel: 'max-chico:hidden',
} as const

/**
 * ROCE-1 · CUÁNTO BAJA EL BLOQUE A 768 PARA DESPEGARSE DEL LOGO. [medido]
 *
 * El mínimo, barrido de a un píxel, que lleva a **0,00 %** la tinta del titular
 * sobre la **silueta analítica** del logo a 768×1024. Un píxel menos publica
 * 0,04 % y la serie completa —con su control positivo a 425, donde subir el
 * bloque 20 px hace aparecer el roce que hoy no existe— está en
 * `outputs/roce/a-logo768fino.json` y `a-control425.json`.
 *
 * ⚠️ **No es un token de espaciado y no se lo puede disfrazar de uno.** Es la
 * distancia entre la tinta de «TU NEGOCIO» y el borde inferior del lóbulo del
 * isotipo en un ancho concreto: una propiedad de la escena y de la caja del
 * titular, no del ritmo de la página. El escalón más cercano (`--spacing-2`, 8
 * px) pasaría 2 px del mínimo, y el sprint pide el mínimo.
 *
 * ⚠️ **Vive acá y no en el `calc()` solo** para que `ajuste.ts` §16d afirme la
 * resta contra este número en vez de contra un literal copiado: la clase y la
 * cuenta que la custodia leen el mismo valor.
 */
export const CORRIMIENTO_DEL_ROCE_EN_768_PX = 6

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
 *
 * ── ⚠️ PAPEL-2 · EL TAMAÑO CONMUTA DOS VECES EN LA BANDA DE PAPEL ────────
 *
 * El §3 pide que el escalón entre los dos registros se cierre: hoy «TU NEGOCIO»
 * pinta **152,60 px de tinta** contra los **306,79** de «LAS 24 HS» a 375, y el
 * titular se lee como dos piezas de dos tamaños. Las dos clases nuevas suben el
 * registro 1 hasta que su tinta IGUALA la de la fila 3 — desvío 0,0000 px —, y
 * el número no está acá: está en los dos tokens, que son el registro 2
 * multiplicado por la razón de los dos avances. La derivación entera, con las
 * tres cifras medidas contra los binarios, va al lado de
 * `--text-display-r1-papel` en el tema.
 *
 *     ancho   registro 1 HOY   registro 1 PEDIDO   tinta resultante
 *     320     37,00 px         61,06 px            251,85 px  (= la fila 3)
 *     375     37,00 px         74,39 px            306,79 px  (= la fila 3)
 *
 * ⚠️ **LAS TRES CLASES DE TAMAÑO CONVIVEN, Y EL ORDEN LO DECIDE TAILWIND.** A
 * 320 aplican las dos variantes `max-` a la vez —`max-chico` (390) y
 * `max-angosto` (375)—; Tailwind emite los `max-*` de mayor a menor, así que la
 * de 375 sale DESPUÉS y gana en la cascada, que es lo que corresponde: el
 * régimen más chico manda. No se confía en eso: `hero.invariant` §15b lo lee
 * del CSS construido y afirma el orden de las dos reglas.
 *
 * ⚠ `cn()` no las junta ni se come ninguna porque las tres llevan variantes
 * distintas, pero los DOS nombres nuevos tuvieron que entrar igual en la lista
 * de tamaños de `src/lib/utils.ts`: sin eso `tailwind-merge` los clasifica como
 * COLOR y el día que alguien escriba una tinta al lado desaparece uno de los
 * dos, en silencio. Es el defecto que `test:s7-cn` §1 existe para cazar.
 *
 * ⚠ **De 390 para arriba no cambia un décimo.** Las dos clases son `max-`, así
 * que 390, 425, 768, 1024, 1440 y 1920 siguen pintando `text-fluido-display` —
 * los seis anchos que el §6 del sprint declara intocables.
 *
 * ── ⚠️ COMPO-2 · Y CONMUTA UNA TERCERA VEZ, HACIA ARRIBA, EN 768–1024 ─────
 *
 * El §3 y el §4 piden que «TU NEGOCIO VENDIENDO» crezca en esos dos anchos:
 * **44,75 → 67 px a 768** y **49,80 → 95 px a 1024**. Los dos son TECHOS
 * medidos sobre el píxel —el mayor tamaño con el que la tinta del titular sobre
 * la masa del logo no sube de lo que ya es— y la recta que los une está en
 * `--text-display-r1-portatil`, con la tabla del barrido al lado.
 *
 * ⚠️ **SON DOS MITADES Y LA SEGUNDA NO ES REDUNDANTE.** `tablet:` es
 * `min-width`: se prende en 768 y **no se apaga nunca**. Sin
 * `escritorio:text-fluido-display` el tamaño nuevo también pintaría a 1440 y a
 * 1920, que son dos de los tres anchos que el §5 declara intocables — y ahí
 * arriba el registro 1 es OTRA composición (un renglón con las dos palabras
 * inline, no dos filas). Es la misma lección que `claseDelAireDelPieEnPortatil`
 * aprendió midiendo, escrita antes de que vuelva a costar.
 *
 * ⚠ Las cinco clases de tamaño del registro 1 conviven porque llevan variantes
 * distintas, pero las CINCO tuvieron que entrar en la lista de tamaños de
 * `src/lib/utils.ts`: sin eso `tailwind-merge` clasifica los `--text-*` que no
 * son niveles de la escala como COLOR, y el día que alguien escriba una tinta
 * al lado desaparece uno, en silencio.
 */
export const TIPOGRAFIA_DEL_TITULAR =
  'font-display text-fluido-display max-chico:text-display-r1-papel max-angosto:text-display-r1-papel-angosto tablet:text-display-r1-portatil escritorio:text-fluido-display leading-titulo tracking-display font-fuerte uppercase'

/**
 * LA TIPOGRAFÍA DEL REGISTRO 2 — Chivo Light itálica, y el nivel MÁS GRANDE.
 *
 * ⚠ **Se llamaba `TIPOGRAFIA_DE_LA_SEGUNDA_LINEA` y el nombre dejó de ser
 * cierto en COMPO-1**: abajo de 1025 esa cara pinta la fila 3 y arriba el
 * renglón 2. Lo que no cambia en ninguno de los dos regímenes es que es el
 * REGISTRO 2, así que el nombre pasa a decir eso.
 *
 * ── ⚠️ COMPO-1 · EL TAMAÑO CONMUTA EN LA BANDA ANGOSTA ──────────────────
 *
 * `max-angosto:text-display-xl-angosto` baja el nivel a 55 px abajo de 375 px
 * de ventana, que es el único ancho donde «LAS 24 HS» no entra en un renglón:
 * a 320 la caja mide 256 px y el nivel resuelve 67, o sea 307,13 px de tinta.
 * La derivación entera —incluido por qué bajar el PISO del `clamp()` no lo
 * arregla— está al lado del token, en `theme-develop.css`.
 *
 * ⚠ Las dos clases conviven porque llevan VARIANTES distintas: `cn()` no
 * resuelve un conflicto entre `text-fluido-display-xl` y
 * `max-angosto:text-display-xl-angosto` — para `tailwind-merge` son grupos
 * distintos. Si alguien le sacara la variante a la segunda, la primera
 * desaparecería y el titular se pintaría en 55 px a todo ancho.
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
export const TIPOGRAFIA_DEL_REGISTRO_2 =
  'font-titulo text-fluido-display-xl max-angosto:text-display-xl-angosto leading-titulo tracking-titulo font-liviano italic uppercase'

/** El handle estable del titular de dos registros. Lo busca el instrumento
 *  para encontrar la pieza sin depender del texto, que va a cambiar. Es el
 *  mismo oficio que `ATRIBUTO_TEXTO_POR_LINEAS` hace para el titular medido. */
export const ATRIBUTO_DEL_TITULAR = 'data-titular'
