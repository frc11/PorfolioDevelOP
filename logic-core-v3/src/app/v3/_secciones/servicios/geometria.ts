/**
 * LA GEOMETRÍA DE LA SECCIÓN — las clases que las DOS ramas comparten, y las
 * de tipografía leídas de la tabla del sistema.
 *
 * ── Por qué las clases están escritas enteras y en un solo lugar ──────────
 *
 * Tailwind escanea el CÓDIGO FUENTE. Una clase armada como `min-h-${x}` no la
 * ve nadie y su regla no se emite nunca: queda el atributo en el HTML, sin un
 * error en consola, y la caja sin altura. Por eso acá son cadenas literales.
 *
 * Y están una sola vez porque las dos ramas —la pinneada y la apilada— tienen
 * que declarar la MISMA caja. Si cada una escribiera la suya, el día que una
 * cambie de alto la otra se queda atrás y nadie se entera hasta que alguien
 * mire mobile, que es justamente lo que nadie mira.
 *
 * ── El alto de un bloque es `min-h-svh`, no `h-svh` ───────────────────────
 *
 * `svh` y no `vh` porque en mobile la barra del navegador entra y sale, y con
 * `vh` cada bloque salta cuando se esconde. `min-h` y no `h` porque el
 * contenido de un servicio —párrafo, once ítems y el hueco del video— puede
 * pasarse de una pantalla en un viewport bajo, y un alto fijo lo recortaría.
 *
 * ── ✅ MEDIDO (B7 · frente B) — el rango del pin, y lo que cuesta el piso ──
 *
 * Este bloque decía *«DECLARADO, NO MEDIDO: el rango del pin es `alto de la
 * sección − alto del sticky` … Nadie lo miró todavía. Es la primera cosa a mirar
 * cuando alguien abra la página.»* Se miró, con scroll REAL —paso de 120 px— y
 * los dos bordes afinados por bisección a 2 px:
 * `npx tsx scripts-b7/b-pin.ts` → `docs/rediseno/outputs/b7/b-pin.json`. Las
 * cifras se tomaron contra el **build de producción** (`B7_ORIGEN` en el 3005,
 * que no se recarga) y se reprodujeron al píxel y al `scrollY` contra el dev del
 * 3002 en una corrida limpia; el origen queda escrito en el propio JSON.
 *
 * ⚠️ **LA TABLA SEPARA LO MEDIDO DE LO DERIVADO, columna por columna.** No es
 * pedantería: la primera versión de este bloque mezcló las dos en la misma fila
 * y publicó como «recorrido medido» un `contenedor − hijo` leído con el scroll
 * en cero. A 1920 y 1440 los dos números coinciden dentro de la bisección y la
 * mezcla no se nota; a 1025 difieren en 27,45 px, que es el hijo creciendo.
 *
 *     perfil      hijo @scrollY 0   hijo DURANTE el pin   contenedor
 *     1920×1080       1080                1080              3240
 *     1440×900         900                 900              2700
 *     1025×768       774,55              798,55             2304
 *     1024×768      abajo de la compuerta la rama apilada no monta ningún `sticky`
 *
 *     perfil      rango MEDIDO (bisección)   pegado entre        desborde MEDIDO
 *     1920×1080        2158 px              11.882 → 14.040          0 px
 *     1440×900         1798 px               9.902 → 11.700          0 px
 *     1025×768         1502 px               8.451 →  9.953       30,55 px
 *
 * A 1920 y a 1440 el rango medido es `alto − viewport` menos los 2 px de la
 * bisección, o sea las dos pantallas que declara `ANCLA_DEL_PIN`, y el
 * contenedor mide los tres pasos al píxel.
 *
 * ⚠️ **A 1025×768 el contenido SÍ se pasa de una pantalla, y se pasa por 30,55
 * px.** Es el caso que la advertencia describía. El pin recorre **1.502 px
 * medidos** en vez de los 1.536 derivados de la tabla —**pierde 34 px, el
 * 2,21 % de su recorrido**— y la secuencia termina eso antes.
 *
 * ⚠️ **Y el hijo NO mide lo mismo durante todo el pin: crece de 774,55 a 798,55
 * px a mitad del recorrido**, porque la secuencia cambia de servicio y los tres
 * no tienen el mismo alto. Un censo leído a `scrollY = 0` publica 6,55 px de
 * desborde donde la medición durante el pin da 30,55: **casi cinco veces**. La
 * regla que sale de eso —una altura que puede cambiar durante el recorrido se
 * mide durante el recorrido— está escrita en `scripts-b7/b-pin-lectores.ts`.
 *
 * **No se arregló**: achicar la cabecera o el `gap` es un cambio de composición
 * y este bloque cierra defectos. Queda medido, con su instrumento, y reportado.
 * Lo que `s6-pin.ts` afirma no es «el contenido entra en una pantalla» —esto es
 * un PISO, y nunca se prometió eso— sino la identidad entre lo que el hijo
 * desborda y lo que el pin pierde, **medidas por caminos distintos**: la primera
 * leyendo cajas parada por parada, la segunda moviendo el scroll.
 *
 * ── ⚠️ Y HAY UN SEGUNDO `sticky` ARRIBA DE ÉSTE, QUE ES INERTE ────────────
 *
 * `Seccion.tsx` envuelve a una sección `pinneada: 'siempre'` en un `div` con
 * `w-full sticky top-0 min-h-svh`, y adentro `Servicios.tsx` pone su `Bloque`
 * con el alto de la sección ENTERA. Ese envoltorio **mide lo mismo que su
 * padre** y su rango de pegado es **cero por construcción**: 3240 de 3240 a
 * 1920, 2700 de 2700 a 1440, 2304 de 2304 a 1025, 2370,44 de 2370,44 a 1024.
 * En todos los perfiles y para siempre. **No está roto: nunca tuvo recorrido.**
 *
 * **Cómo se discrimina —y hace falta decirlo, porque esto ya engañó a un
 * instrumento con Fase 0 y controles positivos—:** un `sticky` son DOS
 * elementos, el hijo que se pega y el padre que le da recorrido, y el recorrido
 * disponible es `alto del padre − alto propio`. Mirar sólo la posición del hijo
 * devuelve el MISMO cero en los dos casos: el que está roto y el que nunca tuvo
 * recorrido. B4-B midió el envoltorio y publicó «el pin de `servicios` NO pinea
 * en ningún perfil, ni siquiera a 1920 — 0 paradas pegado de 243»; el pin
 * andaba, y anda byte por byte igual desde B1 (`git diff 8ab34b36 HEAD --
 * servicios/geometria.ts servicios/Servicios.tsx` devuelve vacío). **La cifra
 * que discrimina es el recorrido disponible, y va SIEMPRE al lado del cero.**
 */

import {
  CLASE_INTERLETRADO,
  CLASE_INTERLINEADO,
  NIVELES_TIPOGRAFICOS,
  type Nivel,
} from '../../_lib/tipografia'

/**
 * La caja de UN servicio: una pantalla de alto, centrada, a lo ancho.
 *
 * Es la que llevan los tres bloques hermanos de la rama sin coreografía. La
 * rama pinneada NO la reusa desde SITIO-S11: su panel dejó de tener un solo
 * hijo y declara su propio eje en `CLASE_DEL_STICKY`, acá abajo.
 */
export const CLASE_DE_BLOQUE_DE_SERVICIO = 'flex min-h-svh w-full items-center'

/**
 * EL PANEL PINNEADO — la misma pantalla de piso, pegada al tope, EN COLUMNA.
 *
 * `sticky top-0` es todo el pinneado: ni una línea de JavaScript, así que el
 * MECANISMO no depende de que baje un bundle.
 *
 * ⚠️ **Lo que este bloque decía y hay que corregir:** *«y por eso sobrevive abajo
 * del umbral de la compuerta — mobile conserva el ritmo gratis»*. **Es falso
 * para esta clase, y está medido.** El mecanismo cruza el umbral; ESTA clase no,
 * porque la monta `PanelDeSecuencia` y esa pieza sólo existe en la rama
 * coreografiada. A 1024 el barrido de `scripts-b7/b-pin.ts` encuentra 2
 * elementos `sticky` en todo el documento y **ninguno es este** —la rama apilada
 * no monta pin— mientras que a 1025, 1440 y 1920 encuentra 4 y éste recorre 1.502 px medidos,
 * 1.800 y 2.160 px. Abajo del umbral el ritmo del pinneado no se conserva: no hay pin.
 *
 * `position: sticky` deja de funcionar en silencio si cualquier ancestro tiene
 * `overflow` distinto de `visible`; la cadena hasta `body` se verificó limpia
 * cuando se escribió `PanelPinneado`, este lane no agrega ninguno, y ahora
 * además está medido en el navegador: `ancestroQueRecorta` es `null` para este
 * elemento en los tres perfiles donde se monta (el arnés del barrido prueba que
 * ese campo SÍ detecta un ancestro que recorta cuando lo hay).
 *
 * ── Por qué dejó de ser `CLASE_DE_BLOQUE_DE_SERVICIO` con un `sticky` adelante ──
 *
 * Porque el panel pasó de tener UN hijo a tener DOS (SITIO-S11): la cabecera de
 * la sección —el rótulo y el titular que la nombran, defecto 16— y la pila de
 * los tres servicios. Con `flex … items-center` y un solo hijo el eje no se
 * notaba; con dos, `flex` en fila los pondría UNO AL LADO DEL OTRO. Así que el
 * eje se declara —`flex-col`— y el centrado pasa del eje cruzado
 * (`items-center`) al principal (`justify-center`), que es donde ahora vive el
 * centrado vertical. La caja es la misma: `min-h-svh`, a lo ancho, un piso y no
 * un techo.
 *
 * ⚠️ **ÉSTE es el `sticky` que pinea** —el otro, el del envoltorio de
 * `Seccion`, es inerte; ver el docblock del archivo— y por eso
 * `scripts-b7/b-pin.ts` **deriva de esta constante** la huella del elemento que
 * busca en el DOM, en vez de escribirla. Si alguien le cambia una clase, el
 * instrumento no encuentra el elemento y **falla**, en lugar de medir cero y
 * llamarlo defecto: es exactamente el modo de falla que B7 vino a cerrar.
 */
// El panel pasa de `min-h-svh` a ALTO FIJO y recorta: la columna derecha ahora
// avanza adentro de una máscara, y una máscara necesita una caja acotada. Sin
// esto el panel crecía con el contenido (1.122 px contra 900) y el pie del
// servicio caía abajo del pliegue, que es el defecto que este sprint cierra.
// El tope va con `--spacing-20` (80 px) y no con `--spacing-8`: la pastilla de
// navegación flota sobre las ocho secciones y mide ~72 px, así que con 32 el
// primer renglón de cada paso le quedaba DEBAJO. Con la cabecera arriba del
// panel eso tapaba media línea; con la cinta, el paso cero entero.
export const CLASE_DEL_STICKY =
  'sticky top-0 flex h-svh w-full flex-col gap-[var(--spacing-8)] overflow-hidden pt-[var(--spacing-20)] pb-[var(--spacing-8)]'

/**
 * ⚠️ **ACÁ VIVÍA EL MODELO DE CAPAS, Y SE FUE ENTERO.**
 *
 * Eran `CLASE_DE_LA_PILA` —una grilla de UNA celda—, `CLASE_DE_CAPA`,
 * `CLASE_DE_CAPA_APAGADA = sr-only`, `CAPA_VIGENTE`/`CAPA_APAGADA` y las dos
 * funciones que decidían qué clase le tocaba a cada capa. Con eso la rama
 * pinneada montaba los tres servicios en la misma celda, pintaba uno y apagaba
 * dos.
 *
 * El arreglo de SITIO-S11 —los tres en el árbol, dos con `sr-only`— era
 * correcto para el defecto que atacaba (26 encabezados contra 24) y dejaba
 * intacto el de fondo: **un intercambio no tiene traspaso**. La capa que entra
 * nace en su lugar, así que por más que se afine la curva, el servicio nuevo
 * aparece en vez de llegar. Ésa era la teletransportación.
 *
 * Lo reemplaza `TiraDeServicios`: los tres bloques SIEMPRE en flujo, una sola
 * traslación continua, y nada que se prenda ni se apague. El árbol de
 * accesibilidad queda mejor que con `sr-only` —no hay nada escondido— y el
 * traspaso existe porque el contenido efectivamente viaja.
 */
/** La columna FIJA: un tercio del ancho, con el número y el nombre. */
export const CLASE_DE_LA_COLUMNA_FIJA = 'flex w-full flex-col gap-[var(--spacing-6)]'

/**
 * EL NIVEL DEL NOMBRE DEL SERVICIO, y por qué NO entra en un renglón.
 *
 * ── ✅ MEDIDO a 1440, con la cara real y el interletrado del nivel ────────
 *
 * El pedido era que «Integraciones de IA y Automatizaciones» —el más largo de
 * los tres— entrara en UNA línea bajando el tamaño, el mismo para los tres.
 * Medido a 1440 con la cara y el interletrado reales (−0,03 em), contra la caja
 * que el renglón le deja al nombre: la columna fija mide 448 px y el número más
 * su hueco se llevan 31,69, así que **quedan 416,31 px**.
 * `docs/rediseno/outputs/servicios/renglon-del-nombre.json`:
 *
 *     nivel        tamaño @1440   ancho del nombre   ¿entra en 416,31?
 *     titulo-xl       56,00 px         995,42 px      no  (2,39 ×)
 *     titulo-l        44,00 px         782,13 px      no  (1,88 ×)
 *     titulo-m        32,00 px         568,81 px      no  (1,37 ×)
 *     titulo-s        20,00 px         355,52 px      sí  (0,85 ×)
 *
 * El ancho es lineal en el tamaño, así que el mayor que entra en un renglón es
 * **23,42 px** — y no es un nivel de la escala. El único nivel que entra es
 * `titulo-s`, **20 px**: el cuerpo de un metadato, y sólo cuatro píxeles arriba
 * del `base` con el que se lee la columna derecha. Un nombre de servicio del
 * tamaño de su propia descripción dejó de ser un título.
 *
 * Control positivo de la misma medición: «Desarrollo web» en `titulo-xl` mide
 * 384,47 px y SÍ entra, o sea que la caja no está mal leída — lo que no entra
 * es el nombre largo.
 *
 * ── ⚠️ Y BAJA IGUAL, por un motivo que la instrucción no previó ───────────
 *
 * Un renglón era inalcanzable, así que el plan era quedarse en `titulo-xl` y
 * reservar la altura. **La grabación lo desmintió: a 56 px el tercer nombre se
 * CORTA contra el borde de la columna.** Un texto envuelve por palabras, y la
 * palabra más larga de los tres nombres es «Automatizaciones»
 * (`palabra-mas-larga.json`):
 *
 *     nivel        tamaño    «Automatizaciones»   ¿entra en 416,31?   renglones
 *     titulo-xl    56,00 px        452,06 px       NO, se pasa 35,75      3
 *     titulo-l     44,00 px        355,20 px       sí, sobran 61,11       2
 *     titulo-m     32,00 px        258,33 px       sí, sobran 157,98      2
 *
 * Una palabra no se parte, así que a 56 px la caja del `h3` no puede bajar de
 * 452 y lo que sobra se lo come el `overflow-hidden` del panel: se veía
 * «Integraciones de» y «Automatizacione» sin la última letra. No es un ajuste
 * de gusto, es contenido perdido.
 *
 * Por eso **el nivel baja a `titulo-l`, 44 px** — el mayor de la escala en el
 * que la palabra más larga entera entra en la columna. Sigue sin ser un
 * renglón: son DOS, y esos dos son los que se reservan.
 */
export const NIVEL_DEL_NOMBRE = 'titulo-l' as const

/**
 * EL RENGLÓN DEL NOMBRE — sólo el guardia del corte. **Sin reserva de altura.**
 *
 * ── ⚠️ Acá vivía una reserva de dos renglones, y se sacó ──────────────────
 *
 * La reserva existía para que el subrayado no bajara de golpe en el traspaso
 * 02 → 03, cuando el nombre largo pasa de uno a dos renglones. Funcionaba —el
 * barrido del pin daba dispersión 0,00 px— y el precio era que en los dos
 * estados cortos el subrayado quedaba colgado un renglón abajo del texto, con
 * un hueco que no significaba nada.
 *
 * Con el rodillo el problema desapareció por otro lado: **cada estado viaja
 * entero adentro de su ranura**, así que un cambio de alto entre estados no es
 * un salto, es parte del rollo. Cada bloque conserva el alto de su propio
 * título y el subrayado queda pegado a su texto. Si el subrayado igual saltara,
 * el problema sería el rodillo y no la altura.
 *
 * `min-w-0` se queda, y no es lo mismo: es el guardia del CORTE. Un hijo de
 * flex no baja de su ancho de mínimo contenido salvo que se lo permitan, así
 * que sin esto el `h3` vuelve a medir lo que mida su palabra más larga y a
 * desbordar la columna en silencio el día que entre un nombre nuevo — que ya
 * pasó una vez, con «Automatizaciones» a 56 px contra una caja de 416,31.
 */
export const CLASE_DEL_RENGLON_DEL_NOMBRE = 'min-w-0'

/**
 * EL NIVEL DEL PÁRRAFO DE LA COLUMNA DERECHA — la PERILLA, subila o bajala acá.
 *
 * ── Por qué `titulo-m`, y por qué el criterio NO es «el mayor que entra» ───
 *
 * El criterio es una PROPORCIÓN, la de la referencia: el párrafo se lee
 * claramente más grande que un cuerpo de texto y claramente más chico que el
 * nombre del servicio. Eso lo acota por los dos lados y no deja lugar a gusto:
 *
 *     nombre del servicio   `titulo-l`    44 px   ← el techo
 *     …                     `titulo-m`    32 px   ← parte el intervalo
 *     …                     `titulo-s`    20 px   a 4 px del cuerpo
 *     cuerpo del panel      `base`        16 px   ← el piso
 *
 * `titulo-s` está a cuatro píxeles del cuerpo: nadie lo lee «claramente más
 * grande». Y hacia arriba el techo no es la caja sino el sentido: `display`
 * (58 px) le da al párrafo más cuerpo que al nombre del servicio y lo convierte
 * en un cartel — entra en la ventana y aun así está mal. Queda `titulo-m`.
 *
 * ⚠️ Es una constante con nombre a propósito: es la perilla de esta decisión.
 * Cambiarla acá alcanza; no hay un segundo lugar que la repita.
 */
export const NIVEL_DEL_PARRAFO: Nivel = 'titulo-m'

/** El nivel del `h2` que nombra la sección. Lo consumen las DOS ramas. */
export const NIVEL_DEL_TITULAR_DE_SECCION = 'titulo-l' as const

/** La columna que AVANZA: los otros DOS tercios. La línea va arriba, fija. */
export const CLASE_DE_LA_COLUMNA_QUE_AVANZA =
  'col-span-2 flex h-full min-h-0 w-full flex-col gap-[var(--spacing-6)]'

/**
 * ═══ EL MODELO NUEVO: una TIRA continua a la derecha, un RODILLO a la izquierda ═══
 *
 * Las dos cosas que se mueven adentro del pin tienen naturalezas distintas y no
 * comparten un solo mecanismo. Escrito acá porque las constantes de las dos
 * viven abajo, y separadas no se entienden.
 *
 *   DERECHA · CONTINUA   UNA tira con los tres bloques apilados, que se
 *                        traslada LINEALMENTE con el progreso del pin. Nunca
 *                        conmuta, nunca monta ni desmonta, nunca reinicia.
 *   IZQUIERDA · DISCRETA Un rodillo de CUATRO estados —el titular de la sección
 *                        y los tres servicios— que se posa en uno y pasa rápido
 *                        al siguiente.
 *
 * **El acoplamiento va en UNA dirección: la posición de la tira decide el estado
 * del rodillo. Nunca al revés.** Por eso las fronteras no se escriben: se
 * derivan del tope medido de cada bloque dentro de la tira.
 *
 * ⚠️ **Lo que esto reemplaza, y por qué el reemplazo es del MECANISMO.** Hasta
 * acá la derecha montaba tres capas por servicio, pintaba una y apagaba dos con
 * `sr-only`, y le pasaba el progreso LOCAL del tramo sólo a la vigente. Cada
 * frontera de paso reiniciaba ese local de 1 a 0 y cambiaba cuál capa estaba en
 * flujo: ahí nacía todo salto. No era un valor mal calibrado.
 */

/**
 * EL VACÍO DE ENTRADA — la PERILLA de cuánto blanco queda arriba del bloque 01.
 *
 * La tira arranca con un tramo vacío arriba del primer bloque. Va en fracción de
 * pantalla y no en píxeles para que escale, y no se mide para que el primer
 * cuadro sea correcto sin esperar a un efecto.
 *
 * ── ⚠️ VOLVIÓ A 0,55, Y EL MOTIVO CAMBIÓ DE SIGNO ────────────────────────
 *
 * Estuvo en 0,55, subió a 1 y volvió. No es una indecisión: es que lo que este
 * número tiene que garantizar se dio vuelta.
 *
 *   antes   el estado 0 tenía que DURAR, así que el vacío tenía un PISO: si era
 *           más corto que `LINEA_DE_REFERENCIA` el bloque 01 nacía ya cruzado y
 *           el rodillo saltaba al 01 apenas arrancaba el pin.
 *   ahora   eso es exactamente lo pedido —«cuando el tope de la sección llega al
 *           tope de la página, el rodillo pasa a Desarrollo web»— y el estado 0
 *           se ve durante la APROXIMACIÓN, que es un viewport entero de scroll.
 *           Lo que el número tiene ahora es un TECHO: con una pantalla entera la
 *           ventana queda en blanco en el instante en que arranca el pin, y
 *           «la entrada no puede estar vacía».
 *
 * A 1440×900 esto deja 495 px de vacío contra una ventana de 788: se ven ~293 px
 * del bloque 01 —su párrafo entero— atenuado, mientras el rodillo todavía dice
 * «Nuestros servicios». Abajo de ~0,3 la entrada deja de leerse como entrada y
 * arriba de ~0,75 vuelve a ser una pantalla en blanco.
 */
export const ALTO_DEL_VACIO_DE_ENTRADA = 0.55

/**
 * LA LÍNEA DE REFERENCIA que decide qué bloque es el vigente, en fracción del
 * alto de la ventana. Un bloque toma el rodillo cuando su TOPE la cruza.
 *
 * ⚠️ **Va ABAJO, no arriba, y la primera versión lo tuvo al revés.** Con 0,32
 * el rodillo rotaba al 01 recién cuando el bloque ya había subido dos tercios
 * de la ventana — o sea con el párrafo YÉNDOSE, que es exactamente lo que el
 * pedido señalaba como defecto. El nombre tiene que aparecer cuando su párrafo
 * está ENTRANDO, así que la línea vive cerca del borde de abajo.
 */
export const LINEA_DE_REFERENCIA = 0.72

/**
 * CUÁNTO TARDA EL RODILLO EN ROTAR, en segundos. **Es tiempo, no scroll.**
 *
 * Cruzar una frontera DISPARA la rotación; de ahí en más corre sola, aunque la
 * persona frene el scroll en el medio. Más lenta que el barrido que reemplaza
 * —que sólo se movía mientras el dedo se movía— porque un gesto que se completa
 * solo se lee mejor lento.
 *
 * ⚠️ La duración y la curva se leen JUNTAS, y son las dos perillas del traspaso:
 * las mueve el rodillo, la torta y el CTA a la vez, porque los tres cuelgan de la
 * misma máquina.
 */
export const DURACION_DEL_DISPARO = 1.4

/**
 * LA CURVA DEL DISPARO, y por qué dejó de ser la del vocabulario del sitio.
 *
 * Era la de las revelaciones de sección, que arranca con pendiente 1,84: **salta**
 * del reposo, y sobre un giro eso se lee como un tirón. Ésta es simétrica y sus
 * dos pendientes de borde valen 0, así que no hay arranque ni frenada: ni el
 * primer cuadro ni el último se despegan del reposo. Lo rápido queda en el medio,
 * que es donde el giro se mira.
 */
export const CURVA_DEL_DISPARO = [0.5, 0, 0.5, 1] as const

/**
 * LA ENTRADA ATENUADA — cuánto contraste tiene el bloque 01 antes del pin.
 *
 * Mientras la sección se acerca, el progreso del pin vale 0 —está acotado— así
 * que no hace falta una segunda señal para saber que todavía no llegó: **el
 * propio 0 ES la aproximación.** El bloque 01 se ve ahí, atenuado, y gana
 * contraste pleno en cuanto el tope de la sección toca el tope de la página.
 *
 * ⚠️ Atenuar es BAJAR CONTRASTE, no oscurecer: la página es clara, así que la
 * tinta se acerca al papel en vez de alejarse. Por eso es opacidad y no un
 * color: un gris más oscuro sobre papel claro tiene MÁS contraste, no menos.
 */
export const OPACIDAD_ATENUADA = 0.28

/** En cuánto del pin pasa de atenuado a pleno. Corto: es un encendido, no un viaje. */
export const UMBRAL_DE_ACTIVACION = 0.015

/**
 * EL ANCHO DE LA TORTA en la columna izquierda. Experimental, a mano.
 *
 * Va como clase y no como número suelto porque el SVG escala con su caja: su
 * `viewBox` es fijo y lo que decide el tamaño en pantalla es esto.
 *
 * ⚠️ Cuatro veces `--spacing-20` (320 px) y no un token nuevo: el tema es
 * superficie compartida y de otro dueño, y una torta experimental no justifica
 * meterle una variable. Derivado de la escala, el escáner lo acepta y el día
 * que la escala cambie, la torta la sigue.
 */
export const CLASE_DE_LA_TORTA = 'w-[calc(var(--spacing-20)*4)] max-w-full'

/**
 * LA CAJA DONDE VIVE LA TORTA — centrada en el hueco, y quieta.
 *
 * `flex-1` se come lo que sobra entre el rodillo y el CTA, y el centrado pone
 * la torta en el medio de ESE hueco. Antes colgaba del flujo justo abajo del
 * rodillo, así que su posición dependía de cuántos renglones tuviera el título
 * del estado vigente: con el nombre largo bajaba, con los cortos subía.
 */
export const CLASE_DEL_HUECO_DE_LA_TORTA = 'flex min-h-0 flex-1 items-center justify-center'

/**
 * LA VENTANA DEL CTA — una grilla de UNA celda, del ancho de la etiqueta más larga.
 *
 * ⚠️ El botón recorta lo que no entra: su `[data-parte="ventana"]` es
 * `inline-flex` con `overflow: hidden`, y su ancho lo fija la copia que se ve.
 * Cuando la copia que ENTRA dice una etiqueta más larga, se corta. Con las tres
 * en la misma celda, la celda mide la más larga y el ancho **no cambia** al
 * relevar — que es lo que el punto pedía.
 */
export const CLASE_DE_LA_VENTANA_DEL_CTA = 'grid w-fit justify-items-start'

/**
 * UN FANTASMA: ocupa el ancho de su etiqueta y no se ve ni se anuncia.
 *
 * ⚠️ **Tiene que medir lo que mide el BOTÓN con esa etiqueta, no lo que mide el
 * texto.** La primera versión usó `text-base` y sin padding, y quedó 2,4 px
 * corta justo en la etiqueta más larga: el botón crecía al relevarla, que es
 * exactamente lo que el fantasma existe para evitar. La tipografía es la de la
 * copia del rótulo (`text-cuerpo`, `font-semi`, `tracking-texto`) y el padding
 * es el del botón (`--spacing-2`), los dos leídos de `Cta.tsx` y `cta.css`.
 */
export const CLASE_DEL_FANTASMA_DEL_CTA =
  'invisible col-start-1 row-start-1 whitespace-nowrap p-[var(--spacing-2)] text-cuerpo font-semi tracking-texto leading-texto'

/** Cuánto del alto de la ventana ocupa el desvanecido de arriba. */
export const FRACCION_DEL_DESVANECIDO = 0.16

/**
 * DÓNDE TERMINA de pintarse un párrafo, en fracción del alto de la ventana.
 *
 * ⚠️ **Ya no es un número elegido: se DERIVA de la banda más un margen en
 * renglones**, que es el criterio nuevo. La pintura tiene que llegar a 1,00
 * justo antes de que el tope del bloque entre en el difuminado, con al menos
 * un renglón de aire — ni antes, porque entonces el párrafo pasa la mitad de
 * su vida ya pintado, ni después, porque se apagaría mientras todavía escribe.
 *
 * Estaba en 0,24, que dejaba 63 px de margen: casi dos renglones, o sea que
 * terminaba temprano. Con 1,2 renglones el margen baja a ~42 px y la pintura
 * se estira todo lo que el criterio permite.
 */

/** Cuántos renglones de aire quedan entre el fin de la pintura y la banda. */
const MARGEN_DE_PINTURA_EN_RENGLONES = 1.2

/** Cuánto mide un renglón del párrafo en fracción de la ventana, a 1440. */
const RENGLON_EN_FRACCION_DE_LA_VENTANA = 0.0443

export const LINEA_DE_FIN_DE_PINTURA =
  FRACCION_DEL_DESVANECIDO + MARGEN_DE_PINTURA_EN_RENGLONES * RENGLON_EN_FRACCION_DE_LA_VENTANA

/**
 * LA CAJA DEL RODILLO — su alto es el del estado MÁS ALTO, y sale de tokens.
 *
 * Tiene que ser un alto DEFINIDO por dos motivos a la vez: la tira interna mide
 * un porcentaje de ella (400 %), y un porcentaje contra un padre de alto
 * automático resuelve a `auto` y se desarma en silencio. Y no puede ser
 * `h-full` de la columna: con ~788 px por ranura el traspaso sería un scroll de
 * página y no un rodillo.
 *
 * La cuenta es la del estado más alto, sumando lo que el bloque realmente pone:
 * el rótulo, dos huecos, DOS renglones de título —el caso del nombre largo— y el
 * subrayado. Todo en `var()`, que es el idiom de `CLASE_DEL_RENGLON_DEL_NOMBRE`
 * y lo que deja pasar al escáner de §5; los multiplicadores no llevan unidad.
 *
 * ⚠️ Cada estado conserva su alto NATURAL adentro de la ranura, alineado al
 * tope. El sobrante de los estados cortos cae DEBAJO del subrayado y no lo
 * empuja — que es la diferencia con la reserva de dos renglones que se sacó.
 */
export const CLASE_DE_LA_CAJA_DEL_RODILLO =
  'relative w-full overflow-hidden h-[calc(var(--text-fluido-caption)*var(--leading-texto)+var(--spacing-3)*2+var(--text-fluido-titulo-l)*var(--leading-titulo)*2+var(--foco-grosor))]'

/**
 * EL HUECO ENTRE UN SUBRAYADO Y EL RÓTULO SIGUIENTE — el mismo en los cuatro.
 *
 * ⚠️ **Es la corrección del sprint, y el defecto era geométrico.** Con ranuras
 * del mismo alto y los bloques apoyados abajo, lo que quedaba arriba de cada
 * bloque era el SOBRANTE de su ranura — y el sobrante depende de cuántos
 * renglones tenga el título. Un nombre de un renglón dejaba ~48 px; el de dos
 * llenaba la ranura y dejaba 0. Ahora la ranura mide su bloque MÁS este hueco,
 * así que el hueco es el hueco y no un resto.
 */
export const CLASE_DE_LA_RANURA = 'w-full pt-[var(--spacing-12)]'

/**
 * LA RANURA DEL ESTADO 0 mide la CAJA ENTERA, y no es una excepción de estilo.
 *
 * Es lo que hace que el primer cuadro salga bien SIN haber medido: si su fondo
 * coincide con el fondo de la caja, el traslado del estado 0 vale cero, que es
 * exactamente lo que la transformada devuelve mientras la medida no llegó. Sin
 * esto, la pieza se pintaría un cuadro fuera de lugar y saltaría al siguiente.
 */
/**
 * ⚠️ **`min-h` con la MISMA cuenta que la caja, y no `h-full`.** La primera
 * versión usó `h-full`, y no resolvió: la tira es un `flex-col` de alto
 * AUTOMÁTICO —tiene que crecer con sus ranuras— y un porcentaje contra un padre
 * sin alto definido resuelve a `auto`. La ranura medía su contenido (93,14 px)
 * en vez de la caja (141,11), así que el traslado correcto para el estado 0 no
 * era cero y el primer cuadro salía 48 px corrido, saltando al llegar la
 * medida. Es exactamente el parpadeo que este archivo existe para no tener.
 *
 * La cuenta está escrita dos veces a propósito: Tailwind escanea el fuente y
 * una clase compuesta no la ve nadie. Van pegadas para que se muevan juntas.
 */
export const CLASE_DE_LA_RANURA_DE_ENTRADA =
  'flex w-full flex-col justify-end min-h-[calc(var(--text-fluido-caption)*var(--leading-texto)+var(--spacing-3)*2+var(--text-fluido-titulo-l)*var(--leading-titulo)*2+var(--foco-grosor))]'

/** La tira de la derecha: los bloques en columna, sin hueco entre ellos. */
export const CLASE_DE_LA_TIRA = 'flex w-full flex-col will-change-transform'

/**
 * Un bloque de la tira. `min-h-svh` y no un alto automático: es lo que sostiene
 * la mitad estructural de la regla del acento —cada bloque ocupa al menos una
 * pantalla, así que nunca hay dos acentos posados en el mismo cuadro— y es la
 * misma caja que declara la rama apilada. `capasSinPantalla` la comprueba.
 */
export const CLASE_DE_BLOQUE_DE_LA_TIRA =
  'flex min-h-svh w-full flex-col gap-[var(--spacing-6)]'

/** La máscara por la que asoma la columna derecha mientras recorre. */
export const CLASE_DE_LA_VENTANA = 'min-h-0 flex-1 overflow-hidden'

/**
 * Las clases de un nivel tipográfico, como CADENA.
 *
 * Existe por un motivo estructural y no por comodidad: `CanalDePiezas` emite un
 * `div` contenedor al que solo se le pueden pasar clases —no se puede elegir el
 * elemento— así que el párrafo del canal P3 no puede ser un `<Cuerpo>`. Para
 * que igual mida lo mismo que el resto del sitio, las clases se leen de
 * `NIVELES_TIPOGRAFICOS`, que es la MISMA tabla que consume `<Texto>`. Copiar
 * `text-cuerpo leading-texto tracking-texto` a mano habría sido una cuarta
 * copia de la tabla, capaz de desviarse sola.
 *
 * ⚠️ HALLAZGO REPORTADO: P3 está medido sobre `p` (8 de sus 11 instancias) y acá
 * el párrafo termina siendo un `div`. El arreglo limpio es una propiedad `como`
 * en `Piezas`, que es del sistema de motion y no de este lane.
 */
export function clasesDeNivel(nivel: Nivel): string {
  const definicion = NIVELES_TIPOGRAFICOS[nivel]
  return [
    'font-cuerpo',
    definicion.claseFija,
    CLASE_INTERLINEADO[definicion.interlineado],
    CLASE_INTERLETRADO[definicion.interletrado],
  ].join(' ')
}
