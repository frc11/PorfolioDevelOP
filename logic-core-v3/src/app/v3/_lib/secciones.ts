/**
 * LAS OCHO SECCIONES DEL SITIO v3 — el recorrido, como tabla.
 *
 * Cada entrada es un bloque con su altura declarada, su superficie y su nombre
 * visible como texto plano, para poder identificarlo mirando la página.
 *
 * ⚠ **Esta tabla NO tiene contenido y no va a tenerlo.** El contenido de cada
 * sección vive en su propia carpeta, como dato, separado de su componente
 * (`secciones-a/<sección>/contenido.ts`). Acá está el RECORRIDO: qué va,
 * en qué orden, cuánto mide y sobre qué superficie.
 *
 * ── El hallazgo estructural que ordena todo esto ───────────────────────────
 *
 * La referencia NO es una pila de secciones con fondo: es un canvas permanente
 * a viewport completo con paneles de DOM deslizándose encima. Por eso el
 * escenario está en `layout.tsx` y no acá, y por eso esta lista es solo el
 * FLUJO DEL DOCUMENTO. La consecuencia práctica es la que importa: la capa 3D
 * se enchufa y se desenchufa sin tocar una línea de esta tabla.
 *
 * ── Las alturas ────────────────────────────────────────────────────────────
 *
 * En `svh` y no en `vh`: en mobile la barra del navegador entra y sale, y con
 * `vh` cada panel salta cuando se esconde. `svh` es la altura chica y estable.
 *
 * Las separaciones son CERO. Está medido —33 de 36 separaciones en 0px— y no
 * es un descuido de la referencia: el ritmo vive en el pinneado, no en el aire
 * entre bloques. Ningún panel declara margen, salvo el negativo de un `solape`.
 */

import { SUPERFICIES, type ModoSuperficie, type ModoSuperficieAngosta } from './superficies'

export interface Seccion {
  /** Ancla y `data-panel`. Estable: la coreografía va a apuntar acá. */
  readonly id: string
  /** El número que se ve en la columna lateral de 140px. */
  readonly numero: string
  /** El nombre visible, en texto plano. Es todo el "contenido" que hay. */
  readonly nombre: string
  /** La superficie. El recorrido entero está abajo, en el docblock de la tabla. */
  readonly superficie: ModoSuperficie
  /**
   * LA SUPERFICIE ABAJO DE 375px, cuando es OTRA. Opcional, y hoy la declara una
   * sola sección.
   *
   * Está acá —en el DATO— y no adentro del componente por la misma razón que
   * `superficie`: qué panel deja ver la sala es una decisión de recorrido, no de
   * marcado, y cambiarla tiene que ser editar esta tabla. Lo que agrega es que
   * la decisión puede depender del ancho, que hasta TEXTO-3 no podía.
   *
   * Sin declarar, la sección pinta su `superficie` en todo ancho — o sea que el
   * campo ausente y el campo igual a `superficie` significan lo mismo, y el
   * invariante afirma que ninguna fila escribe el segundo caso.
   *
   * El porqué del tipo restringido —sólo los dos modos claros— está en
   * `CLASES_DE_LA_BANDA_ANGOSTA`: una media query pinta clases y no escribe
   * atributos, así que `data-seccion="invertida"` no se puede condicionar.
   */
  readonly superficieAngosta?: ModoSuperficieAngosta
  /**
   * EL ALTO MÍNIMO del bloque. **NO es su alto: es su piso.** (B1)
   *
   * `Panel` lo emite como `min-height` y no como `height` —siempre lo hizo—, o
   * sea que **la sección se dimensiona por su contenido y nunca queda más corta
   * que esta declaración**. Un contenido que se pasa la hace crecer; uno que no
   * llega NO la achica.
   *
   * ── ⚠️ LO QUE B1 MIDIÓ, y que cambia cómo se lee este campo ──────────────
   *
   * Este número **no es el que está sosteniendo el aire muerto del home.** Con
   * el `min-height` de la tabla puesto en cero en runtime, a 1920×1080, seis de
   * las ocho secciones **miden exactamente lo mismo**: lo que fija su alto son
   * los `min-h-svh` que cada sección pone ADENTRO, no esta columna.
   *
   *     hero            1080 declarado · 1080 natural   (1 caja interna)
   *     quiénes somos   2160 declarado · 2160 natural   (2 cajas internas)
   *     números         1080 declarado · 1080 natural   (1 caja interna)
   *     trabajos        3240 declarado · 1080 natural   (0 cajas internas)
   *     servicios       3240 declarado · 3240 natural   (3 cajas internas)
   *     tu panel        2160 declarado · 2160 natural   (2 cajas internas)
   *     por qué develOP 1080 declarado · 1080 natural   (1 caja interna)
   *     cierre          1080 declarado ·  780 natural   (0 cajas internas)
   *
   * O sea: **la resta de una sección se hace en su composición**, y bajar este
   * número sólo cambia algo donde no hay caja interna que lo sostenga.
   *
   * ⚠️ La fila de **servicios es una foto de cuando declaraba 300svh**, y ya no
   * vale: hoy declara 800 (ver `PANTALLAS_DE_SERVICIOS`), muy por encima de sus
   * 3 cajas internas, así que ahí manda la columna y no la composición. Las
   * otras siete no se volvieron a medir.
   *
   * ── ⚠️ POR QUÉ NO SE LLAMA `altoMinimo`, que es lo que es ────────────────
   *
   * Porque `_lib/escena/anclajeDerivacion.ts:182` lee `s.alto` para derivar el
   * anclaje de la escena, y `_lib/escena/` está congelado para B1 (regla 3).
   * Renombrar el campo obligaría a editarlo. El nombre queda; el contrato lo
   * dice acá y `Panel` lo emite. Anotado para el sprint que pueda tocar la
   * escena.
   */
  readonly alto: string
  /**
   * ⚠️ **CUÁNTAS PANTALLAS SE MONTA SOBRE LA SECCIÓN ANTERIOR.** Opcional, y hoy
   * lo declara una sola: Trabajos.
   *
   * `Panel` lo emite como un margen negativo y le suma lo mismo al piso del alto,
   * así que la sección ARRANCA antes y TERMINA donde terminaba: el fin del panel
   * no se mueve y la escena —que ancla cada tramo al FIN de su sección— no se
   * entera. Por eso `alto` sigue siendo el alto sin el solape: es lo que la
   * escena lee, y con el solape adentro contaría dos veces lo que no se corrió.
   *
   * Rompe a sabiendas «las separaciones son cero»: es la única forma de que un
   * panel empiece a verse mientras el anterior todavía scrollea sin tocar ni el
   * alto del anterior ni el recorrido de la cámara.
   */
  readonly solape?: number
  /**
   * CUÁNTOS PASOS TIENE LA SECUENCIA de una sección pinneada. Sólo las
   * pinneadas lo declaran, y es de donde sale su `alto`. (B1)
   *
   * ── Por qué el alto de una pinneada se DERIVA y no se escribe ───────────
   *
   * Porque no es una preferencia de composición: es el recorrido que la
   * secuencia necesita. Una sección pinneada de `pasos` pasos mide `pasos`
   * pantallas —una para el hijo clavado y una por paso de recorrido menos la
   * del hijo—, así que el pin recorre `pasos − 1` pantallas y cada paso se
   * lleva una. Con tres proyectos y tres servicios eso da los mismos 300svh que
   * la tabla traía escritos a mano, **y ahora la igualdad es comprobable**: el
   * invariante de cada sección afirma este número contra la cantidad de piezas
   * de su `contenido.ts`, que es la única fuente de cuántos pasos hay.
   *
   * El docblock de Trabajos decía *«los 300svh son DECIDIDOS, no medidos»*.
   * Dejan de serlo.
   */
  readonly pasosDeLaSecuencia?: number
  /**
   * Si la sección es una secuencia pinneada con `sticky`, y **desde dónde**.
   * Son DOS —Trabajos y Servicios— y el invariante lo afirma.
   *
   * ── Por qué el pinneo tiene DOS modos y no es un booleano ────────────────
   *
   * Porque el `sticky` es CSS puro y por lo tanto **cruza la compuerta de
   * 1025**: sobrevive donde la coreografía no existe. S1 lo celebró con razón
   * —"mobile conserva el ritmo gratis, sin bajar un byte de más"— y para
   * Servicios sigue siendo verdad.
   *
   * Para Trabajos **no**, y está medido: abajo de 768 la grilla de tres colapsa
   * a una columna, las tres capturas apiladas más sus rótulos miden ~810 px, y
   * el hijo `sticky` mide `100svh` (~555–667 px en un teléfono). El contenido
   * desborda su propia caja clavada. Y arriba de eso, abajo de 1025 **no hay
   * coreografía**: el pin no está sosteniendo ningún gesto, sólo está clavando
   * una caja que no entra. Un pin que desborda no compra nada.
   *
   *   `siempre`           el `sticky` rige en todos los anchos.
   *   `desde-escritorio`  el `sticky` rige sólo desde 1025; abajo la sección
   *                       scrollea y cada proyecto ocupa su pantalla.
   *
   * ⚠ **Es una decisión declarada acá, en la tabla, y no un arreglo escondido
   * en una clase.** Vive en el mismo lugar que el alto y la superficie porque
   * es de la misma naturaleza —cómo se comporta la sección en el recorrido— y
   * porque es lo único que los dos lanes comparten. `Seccion.tsx` la lee y
   * emite las variantes; ningún componente decide esto por su cuenta.
   */
  readonly pinneada?: 'siempre' | 'desde-escritorio'
}

/**
 * ── EL RECORRIDO DE SUPERFICIES — decidido en SITIO-S5 §0.2 ────────────────
 *
 * S1 dejó las ocho en `papel-opaco` a propósito: la decisión estética no era
 * suya. **SITIO-S5 la toma, y la escribe entera** —incluidas las cuatro de
 * S6— porque este archivo es uno solo y partir la tabla en dos lanes sería
 * partirla en dos conflictos.
 *
 *     01 Hero              papel-transparente   ← la escena se ve
 *     02 Quiénes somos     papel-opaco
 *     03 Números           papel-opaco
 *     04 Trabajos          oscuro-opaco         ← la escena desaparece
 *     05 Servicios         papel-opaco
 *     06 Tu panel          papel-opaco
 *     07 Por qué develOP   papel-transparente   ← la escena vuelve
 *     08 Cierre            oscuro-opaco
 *
 * **Tres momentos de escena, no ocho.** Aparece, desaparece y vuelve: eso es
 * lo que la hace valer. Si los ocho paneles dejaran ver el canvas, el canvas
 * dejaría de ser un acontecimiento y pasaría a ser el fondo.
 *
 * ── ⚠️ B6-A Y B8 LO REESCRIBIERON: SEIS VEN LA SALA, DOS NO ────────────────
 *
 *     01 Hero              papel-transparente   ← la escena, de corrido…
 *     02 Quiénes somos     papel-transparente      (B8)
 *     03 Números           papel-transparente      (B8)
 *     04 Trabajos          oscuro-transparente  ← …hasta la noche (B6-A abrió, B8 sacó el velo)
 *     05 Servicios         papel-opaco          ← opaca por pedido del humano
 *     06 Tu panel          papel-opaco          ← opaca por pedido del humano
 *     07 Por qué develOP   papel-transparente   ← la escena vuelve, amanecida
 *     08 Cierre            oscuro-transparente     (B6-A abrió, B8 sacó el velo)
 *
 * El humano fijó el orden del trabajo: **primero la luz, después la
 * información**. Abrir Quiénes somos y Números rompe el contraste a propósito
 * —el logo pasa detrás de su texto, medido en B6-A: 12 de 17 y 12 de 13
 * bloques— y ese estado es intermedio y deliberado: las afirmaciones que
 * fallan pasan a deuda declarada con su número y cierran en el bloque
 * siguiente, que acomoda el contenido a la coreografía. El acontecimiento que
 * §0.2 protegía ya no es «la escena aparece»: es **la luz**, que atardece
 * cuando Trabajos entra y amanece detrás de las dos opacas
 * (`_lib/escena/lightArc.ts`).
 *
 * ── Las alturas de las cuatro primeras, y de dónde salen ───────────────────
 *
 * De SITIO-S5, que es el sprint que les puso contenido:
 *
 *     01 Hero            100svh   una pantalla, no pinneada
 *     02 Quiénes somos   200svh   dos pantallas — el tramo más largo del
 *                                 recorrido de la escena
 *     03 Números         100svh   una pantalla
 *     04 Trabajos        300svh   PINNEADA DESDE 1025 · un hijo `sticky` de
 *                                 100svh deja 200svh clavados. Abajo del
 *                                 umbral no se pinnea y cada proyecto ocupa
 *                                 una de las tres pantallas — ver `pinneada`.
 *
 * ⚠ Los 300svh de Trabajos son **DECIDIDOS, no medidos**: son tres proyectos
 * entrando por P7, a razón de una pantalla de scroll por proyecto, y es el
 * mismo orden de magnitud que la única otra secuencia pinneada del esqueleto.
 * Lo que sí está medido es que la secuencia cuenta como **UN momento** y no
 * como tres pantallas (SCROLL.md §6).
 *
 * ── Las alturas de 05 a 08, corregidas en SITIO-S7 ────────────────────────
 *
 *     05 Servicios       300svh   PINNEADA SIEMPRE · la secuencia de tres
 *                                 canales. Ya estaba construida así; lo que
 *                                 faltaba era que la tabla lo dijera.
 *     06 Tu panel        200svh   dos tiempos. Era 100svh y SUBESTIMABA.
 *     07 Por qué develOP 100svh   una pantalla
 *     08 Cierre          100svh   MEDIDO: 0,82 pantallas a 1440. Ver su fila.
 *
 * Las tres correcciones las pidió SITIO-S6 con su medición y no las pudo
 * escribir: este archivo era del otro lane. Es el ejemplo más limpio de por qué
 * repartir archivos no alcanza para repartir un sprint.
 */
/**
 * El alto de una sección pinneada, derivado de los pasos de su secuencia. (B1)
 *
 * Una pantalla por paso: la primera la ocupa el hijo clavado y las demás son el
 * recorrido del pin. Con `pasos = 3` da `300svh` y el pin recorre `200svh`, que
 * es exactamente lo que `ANCLA_DEL_PIN` calcula (`alto − viewport`).
 *
 * ⚠ Tira con menos de dos pasos: una secuencia de un paso no tiene recorrido, y
 * un pin de rango cero no clava nada. Es la misma clase de error que
 * `RANGO_MINIMO_PX` evita del otro lado, y acá se prefiere que no compile a que
 * quede un pin inerte que nadie ve fallar.
 */
export function altoDeSecuenciaPinneada(pasos: number): string {
  if (!Number.isInteger(pasos) || pasos < 2) {
    throw new Error(`una secuencia pinneada necesita al menos 2 pasos: recibió ${pasos}`)
  }
  return `${pasos * 100}svh`
}

/**
 * ⚠️ **EL ALTO DE TRABAJOS SALE DEL RECORRIDO, NO DEL CONTENIDO.**
 *
 * Los tramos piden píxeles (`trabajos/geometria.ts`): aproximación 900, cartel
 * hasta la huida 950, túnel 1.480 —la tabla medida en la referencia—, salida
 * 1.131 y demos 1.800, que suman 6.261. Lo que queda es la ESPERA del CTA, y se
 * pidió al 30 % de lo que era (1.839 → 552 px). Con eso la sección mide 6.813 px:
 * **757svh**, de los que 40 son el solape sobre Números y 717 son el alto propio.
 *
 * ⚠️ **EL SOLAPE LO PONE LA CÁMARA.** Portfolio llega ni bien pasa el cambio de
 * plano: el tramo rápido del viaje de cámara de Números —donde la cámara va más
 * rápido que la media de su segmento— termina en la pantalla 5,098 del
 * recorrido, y el titular de Portfolio asomaba 0,398 pantallas después. **40svh**
 * lo corren al corte (a 1440 × 900, 4.593 contra 4.594). Es la única pieza de la
 * sección que se ancla a la escena, y la escena no se mueve: ver `solape`.
 */
const ALTO_DE_TRABAJOS = '717svh'
const SOLAPE_DE_TRABAJOS = 0.4
const PASOS_DE_SERVICIOS = 3

/**
 * ⚠️ **LAS PANTALLAS DE NÚMEROS — recorrido de cámara sin contenido, y
 * por qué el recorrido NO puede vivir adentro de Trabajos.**
 *
 * Números está desconectada: no renderiza nada. Pero el tramo `números` de la
 * coreografía sigue existiendo —`derivarAnclaje` exige los seis— y lleva una
 * pose de cámara entera, de `CHOREO_KEYFRAMES` en 0,375 a la de 0,5. Con la
 * sección en `1svh` ese tramo se cruzaba en nueve píxeles: **la cámara se
 * teletransportaba** en la costura Quiénes somos → Trabajos.
 *
 * PORTFOLIO intentó mudar ese recorrido a un preludio adentro de Trabajos. No
 * alcanza, y la razón es estructural: **un tramo sólo avanza sobre el scroll de
 * SU sección.** Mudarlo pide o fusionar dos tramos —rompe cinco archivos de
 * calibración de `probe-escena`— o correr el borde `to` del tramo —rompe
 * «cada tramo cierra en su pose», `s9-recorrido`—. Las dos rompen el
 * esqueleto de la coreografía para mover un recorrido que esta sección ya sabe
 * llevar. Así que lo lleva ella, vacía: lo que se ve mientras dura es la sala
 * moviéndose, que es exactamente lo que el tramo tenía que mostrar.
 *
 * ⚠️ **DOS, Y EL NÚMERO NO SE ELIGIÓ: LO PONE EL TECHO DE VELOCIDAD.**
 *
 * Eran cuatro (la calibración de B2, para una sección con seis piezas que leer),
 * después tres, y el pasaje seguía siendo largo. Lo que impide seguir bajando es
 * una propiedad que el repo ya mide y ya afirma: `s13b-escena` exige que **el
 * arranque siga siendo el tramo más rápido del recorrido**, en alturas de cuadro
 * por PANTALLA de scroll. Medido con `perfilDeSegmentos` sobre la pista de hoy:
 *
 *     arranque (hero)   3,4126   ← el techo
 *     cierre            2,7427
 *     números con 3     1,8574   (54,4 % del arranque)
 *     números con 2     2,7860   (81,6 % del arranque)
 *     números con 1,75  3,1840   (93,3 %)
 *     números con 1,5   3,7147   ROMPE el techo
 *
 * El piso teórico está en **1,6328 pantallas**, que es donde el tramo empataría
 * al arranque. Dos es el entero más chico que entra, y entra con 18,4 % de
 * margen; 1,75 entraría con 6,7 %, que es margen para que lo rompa la próxima
 * recomposición de una pose. **Dos, entonces, y por eso.**
 *
 * Se exporta porque hay otros dos que necesitan la cuenta y ninguno puede
 * inventarla: `lightArc.ts` corta el atardecer en la última de estas pantallas, y
 * `trabajos/geometria.ts` deriva de acá **dónde se dispara la noche** — el
 * disparo tiene que caer al EMPEZAR este tramo, no al terminarlo.
 */
export const PANTALLAS_DE_NUMEROS = 2

/**
 * ⚠️ SERVICIOS SE ESTIRÓ: su alto ya NO es `pasos × 100svh`.
 *
 * Los pasos y el alto son dos conceptos distintos y por eso son dos constantes:
 * cuántos tramos hay, y sobre cuánto recorrido se reparten.
 *
 * El recorrido del pin fue 200svh → 400svh cuando todo pasaba demasiado rápido.
 * Subió a 600 mientras existió un paso cero y volvió a 400 cuando ese paso se
 * sacó.
 *
 * ── ⚠️ 400svh → 700svh, Y EL NÚMERO SALE DE LA RUEDA ──────────────────────
 *
 * Cruzar una frontera dispara una rotación **por tiempo**, de
 * `DURACION_DEL_DISPARO` segundos, que corre igual aunque el scroll siga. Así
 * que el tramo tiene que ser más largo que lo que la página recorre mientras esa
 * rotación dura, o la rotación llega tarde: se la come la frontera siguiente.
 *
 * Cuánto recorre la página se midió en el navegador, sobre el scroll suave del
 * propio sitio: **la rueda entrega 100 px por golpe y Lenis los pasa derecho**,
 * así que la velocidad es 100 × golpes por segundo. A un ritmo de lectura —10
 * golpes/s— son **1.000 px/s**, y en los 1,4 s de la rotación la página recorre
 * **1.400 px**.
 *
 * El tramo más corto NO es ninguno de los dos primeros: es el ÚLTIMO, lo que
 * queda del pin después de la tercera frontera. Con 400svh medía **1.015 px**,
 * o sea 385 menos de los que la rotación necesita — la tercera rotación se
 * cortaba contra el final del pin, y ése es el defecto, con número.
 *
 * Con 700svh los tres tramos pasan a 2.168 · 2.355 · **1.776** px: el más corto
 * supera los 1.400 por **376 px, un 27 %**. Y el pintado de cada párrafo, que es
 * una fracción fija del pin, se estira de 927 a 1.622 px sin tocar una línea.
 *
 * ⚠️ **VOLVIÓ A 8, Y LA SUBIDA A 9 FUE UN ERROR MÍO CON SU MOTIVO.**
 *
 * Subió a 9 para reservarle al estado 00 el primer viewport del pin, porque sin
 * progreso propio no podía tener un gesto de entrada. El diagnóstico era
 * correcto y la solución no: durante esos 900 px la tira quedaba congelada en su
 * inicio —una pantalla entera de scroll con la columna derecha quieta, que se
 * siente como un frenazo— y llegar al primer servicio pasó a costar 900 px más.
 *
 * El gesto de llegada no necesitaba ese tramo: lo resuelve el `<Bloque>` propio
 * del rodillo sobre la APROXIMACIÓN, que ya existía. Así que la reserva se fue y
 * la tabla vuelve a su número, con los tres tramos exactamente donde estaban.
 */
const PANTALLAS_DE_SERVICIOS = 8

export const SECCIONES: readonly Seccion[] = [
  /**
   * ⚠️ **EL HERO ES LA ÚNICA FILA CON DOS SUPERFICIES, y la decidió el dueño.**
   *
   * `papel-transparente` de **390** para arriba —la sala se ve a través del
   * panel, que es lo que esta pantalla tiene y ninguna otra— y `papel-opaco`
   * abajo, donde no hay composición posible: el bloque de texto ocupa el 51 %
   * del viewport y la masa del logo otro 37 %, y TEXTO-1 barrió 16
   * configuraciones de tipografía sin encontrar una limpia. El porqué entero,
   * con las palancas descartadas y sus cifras, está en
   * `CLASES_DE_LA_BANDA_ANGOSTA`.
   *
   * ⚠️ **PAPEL-2 · LA FILA NO CAMBIÓ — CAMBIÓ SU CONDICIÓN DE ANCHO.** El
   * corte era 375 y ahora es 390, o sea que 375 pasa a papel. Lo que lo mueve
   * NO es esta tabla: es la clase de `CLASES_DE_LA_BANDA_ANGOSTA`, que pasó de
   * `max-angosto:` a `max-chico:`. Esta fila dice QUÉ pinta cada régimen; el
   * ancho en el que conmutan es del CSS, porque `Panel` es un componente de
   * servidor y no tiene ancho en su render.
   */
  {
    id: 'hero',
    numero: '01',
    nombre: 'Hero',
    superficie: 'papel-transparente',
    // El papel opaco de abajo de 390 se fue: lo reemplaza la mezcla de la banda
    // movil (`MEZCLA_DE_LA_BANDA_MOVIL`), que resuelve la lectura SIN tapar la sala.
    alto: '100svh',
  },
  /**
   * QUIÉNES SOMOS — 200svh. ⚠️ **B1 INTENTÓ BAJARLO A 100 Y SE FRENÓ, CON LOS
   * NÚMEROS. No se reabre sin leer esto.**
   *
   * La medición pedía el cambio: 65,09 % de aire muerto a 1920 y la tinta de la
   * sección entrando en una pantalla. Y la comprobación que autorizó el intento
   * —correr `derivarAnclaje` con alturas candidatas— mostraba que **los siete
   * progresos no se movían** (0 · 0,125 · 0,375 · 0,5 · 0,625 · 0,75 · 1) y que
   * el ancla declarada del diferencial seguía en 0,8525.
   *
   * **Esa comprobación era necesaria y NO suficiente, y ahí estuvo el error:
   * daba por hecho que la sección iba a RENDERIZAR el alto nuevo.** No lo hace.
   * Su composición declara DOS cajas de `min-h-svh` y sólo el `[FOTO DEL EQUIPO]`
   * mide 987,72 px, así que **con la tabla en `100svh` la sección sigue midiendo
   * 2160 px** — medido en el navegador, no modelado.
   *
   * Y con la tabla declarando 13 pantallas contra 14 renderizadas, el mapeo
   * proporcional de `pantallaDeScroll` se estira y **cada nudo cae en otro
   * lugar del scroll real**. Con la fórmula del propio módulo y la extensión
   * medida (0 a 15120, ventana 1080):
   *
   *     tramo            cae en    borde real de la sección    desvío
   *     hero               1170              1080               +90 px
   *     quiénes somos      2340              3240              −900 px
   *     números            3510              3240              +270 px
   *     trabajos           7020              7560              −540 px
   *     cierre            14040             14040                +0 px
   *
   * Sólo el último coincide, y no prueba nada: el mapeo está normalizado en las
   * dos puntas y ése cierra siempre. **Los progresos no se mueven; lo que se
   * mueve es DÓNDE los alcanza el visitante**, hasta 900 px. La pose llega en el
   * lugar equivocado, que es exactamente lo que el anclaje existe para impedir.
   *
   * **Qué lo destrabaría, en orden:** primero la composición tiene que entrar en
   * UNA pantalla —o sea que el hueco de la foto baje de ~988 px—, y recién
   * después la tabla. Al revés no: la tabla no achica una sección, sólo le pone
   * un piso. Y ese recorte de la foto deshace el reparto que en B1 llevó a esta
   * sección de 65,09 % a 42,41 % de aire y de 600 a 102 px de banda vacía.
   *
   * ── ⚠️ B2 · LA BAJADA A 100svh NO SE HIZO, Y VA AL REVÉS: 200 → 300 ────────
   *
   * **La instrucción de B2 §0.3 pedía bajarla a `100svh`. Se midió antes de
   * hacerlo y la medición dice que no.** Tres cifras, cada una con su
   * instrumento, y las tres empujan en la misma dirección (`B2-DELTAS.md` §4):
   *
   * 1. **El techo de velocidad.** El tramo `quiénes somos` mueve la cámara
   *    **2,112 alturas de cuadro**. Con `100svh` eso corre a 2,112 alturas por
   *    pantalla de scroll —2,23× el ritmo parejo del recorrido, el segundo
   *    segmento más rápido— y **ése es exactamente el defecto que B2 §0.2 viene
   *    a arreglar**: la queja del humano de que el fondo se adelanta. Con el
   *    techo en 1,0 el tramo pide **3 pantallas**, no una.
   * 2. **El gate del bloque.** `momentos = pantallas − pinneadas + secuencias`.
   *    Bajar esta sección de 2 a 1 pantalla **baja el gate de 12,0 a 11,0**: la
   *    §0.3 movía la cifra que el bloque entero existe para subir.
   * 3. **La densidad.** La sección tiene cinco piezas que pueden llegar por
   *    separado —titular, bajada, cómo trabajamos, la foto con su pie, y las dos
   *    personas—. En una pantalla no hay dónde repartirlas.
   *
   * ⚠️ **Y la primera mitad de §0.3 —«que el hueco de la foto se dimensione por
   * su relación de aspecto y no por media pantalla»— NO se hizo porque su
   * premisa está REFUTADA sobre el píxel.** Medido a 1920: el hueco vale
   * 1481,59 × 987,72 px, o sea **1,500 exacto**, que son los 3:2 que declara
   * `GEOMETRIA.foto`. `MarcoDeMedio` emite `aspect-ratio` desde una prop y nunca
   * una fracción de pantalla. Lo que fija ese alto es que la foto ocupa 4 de 5
   * columnas, y ese 4 lo puso B1 con su propia medición. Y la caja con su
   * epígrafe mide 1.019,64 px en una pantalla de 1.080: **ya llena el 94,4 % de
   * su pantalla**. La composición mide dos pantallas porque tiene DOS GRUPOS
   * —la agencia y las personas—, no porque una caja esté sobredimensionada.
   */
  { id: 'quienes-somos', numero: '02', nombre: 'Quiénes somos', superficie: 'papel-transparente', alto: '300svh' },
  /**
   * ⚠️ NÚMEROS — DESCONECTADA, PERO CON SU SCROLL. No renderiza: no hay cifras
   * reales y no las va a haber (`DIRECCION-ESCENA.md` §7.34), así que `registro`
   * monta acá un marcador sin contenido. El componente, sus archivos y
   * `PEDIDO_NUMEROS` NO se tocaron: sólo salieron del registro.
   *
   * El alto se queda porque **el scroll no es de la sección, es del tramo**:
   * acá corre la pose de cámara que va de 0,375 a 0,5, y sin píxeles que
   * recorrer la cámara salta. Por qué DOS, y por qué no se puede mudar a
   * Trabajos: `PANTALLAS_DE_NUMEROS`.
   *
   * `papel-transparente`: el panel no pinta fondo, así que lo que se ve mientras
   * dura es la sala. Devolver la sección a como estaba es una línea acá y otra
   * en `registro.tsx`.
   */
  {
    id: 'numeros',
    numero: '03',
    nombre: 'Números',
    superficie: 'papel-transparente',
    alto: altoDeSecuenciaPinneada(PANTALLAS_DE_NUMEROS),
  },
  /**
   * TRABAJOS — la segunda secuencia pinneada, y la primera con contenido.
   *
   * `oscuro-opaco`: la sección invertida. El canvas no se ve, y el acento no
   * puede ir como texto — sobre `#0E0E0E` los tres dan 2,71 · 2,99 · 2,46, o
   * sea que no llegan ni a 3:1. Va como relleno o como subrayado. La regla
   * está escrita en `theme-develop.css`, en el bloque de la sección invertida.
   */
  {
    id: 'trabajos',
    numero: '04',
    nombre: 'Trabajos',
    // B6-A la abrió sobre la escena con un velo; B8 sacó el velo y puso la
    // noche detrás: el arco del sol baja a 0,08 mientras esta sección entra
    // (`_lib/escena/lightArc.ts`). Los tres proyectos vienen del fondo oscuro.
    superficie: 'oscuro-transparente',
    // Sin preludio. Las pantallas NO son los proyectos: son lo que pide el
    // recorrido, en píxeles en `trabajos/geometria.ts`. El recorrido de cámara lo
    // lleva Números, y el solape monta a Trabajos sobre su final.
    alto: ALTO_DE_TRABAJOS,
    solape: SOLAPE_DE_TRABAJOS,
    pinneada: 'desde-escritorio',
  },
  /**
   * SERVICIOS — la sección pinneada que S1 dejó como demostración.
   *
   * Es la más coreografiada de la referencia, así que es la que sirve para
   * demostrar que el mecanismo funciona. 300svh de recorrido con un hijo
   * `sticky` de 100svh: el panel queda clavado 200svh de scroll.
   *
   * **Sin una línea de JavaScript.** Es CSS `sticky` puro, y por eso sobrevive
   * abajo de la compuerta de 1025 — mobile conserva el ritmo gratis.
   */
  {
    id: 'servicios',
    numero: '05',
    nombre: 'Servicios',
    superficie: 'papel-opaco',
    alto: altoDeSecuenciaPinneada(PANTALLAS_DE_SERVICIOS),
    pinneada: 'siempre',
    pasosDeLaSecuencia: PASOS_DE_SERVICIOS,
  },
  /**
   * TU PANEL — DOS tiempos, y por eso 200svh. **Corrección de SITIO-S7.**
   *
   * S1 le puso `100svh` cuando la sección era un rótulo. SITIO-S6 la construyó
   * con dos tiempos —qué es el panel y cómo se ve; qué se hace ahí adentro— y
   * **no pudo corregir la tabla**, porque este archivo era del otro lane. Lo
   * reportó con el número: `s6-tu-panel` cuenta los `min-h-svh` del marcado y
   * son dos.
   *
   * Los dos tiempos están separados porque el ancla de P4 —`top bottom` →
   * `bottom top`— recorre el alto del bloque MÁS un viewport entero: apretada
   * contra la captura, la lista de capacidades entraría casi entera antes de
   * que alguien la vea.
   *
   * ⚠ El `alto` de la tabla es un `min-height`, así que con 100svh la sección
   * no se rompía: **subestimaba el recorrido**, que es peor que romperse
   * porque no se ve. La cuenta de ritmo salía mal y nadie se enteraba.
   */
  { id: 'tu-panel', numero: '06', nombre: 'Tu panel', superficie: 'papel-opaco', alto: '200svh' },
  { id: 'por-que-develop', numero: '07', nombre: 'Por qué develOP', superficie: 'papel-transparente', alto: '100svh' },
  /**
   * CIERRE — el alto MEDIDO, y por qué se queda en 100svh. **SITIO-S7.**
   *
   * ⚠️ **NO SE REABRE SIN ESTOS DOS NÚMEROS.** SITIO-S6 pidió revisarlo con la
   * premisa *"pasa de una pantalla con el titular en `titulo-xl` más el pie
   * entero"*. Se midió: **la premisa vale sólo a 375, y no a escritorio**, que
   * es el ancho donde este proyecto define el ritmo. Quien quiera cambiar este
   * valor tiene que empezar por acá y no por la intuición — la intuición ya se
   * probó y dio al revés:
   *
   *     @1440 × 900   741 px  →  0,82 pantallas   (las tres columnas EN FILA)
   *     @375  × 667  1029 px  →  1,54 pantallas   (las columnas APILADAS)
   *
   * Las produce `s8-cierre.invariant` sumando cajas de línea y tokens —no está
   * medido en un navegador, y eso está declarado ahí—.
   *
   * ⚠️ **LAS DOS CIFRAS SE MOVIERON EN SITIO-S8, Y NO ES QUE LA SECCIÓN CAMBIÓ
   * DE ALTO: EL MODELO ESTABA MAL.** Publicaba 609 y 913, medidos con UNA sola
   * columna del pie —la de novedades— usada para las tres. Con tres enlaces en
   * la columna del recorrido subestimaba 4 px y nadie lo notaba; al ampliar el
   * pie a las ocho secciones (§7.24) esa columna pasó a ser la más alta y la
   * subestimación llegó a 132 px. El instrumento ahora mide la más alta de las
   * tres, que es lo que gobierna la fila.
   *
   * **Las conclusiones de abajo sobreviven las dos**, y por eso el valor no se
   * toca: 741 < 900 sigue entrando en una pantalla a escritorio, y 1029 > 667
   * sigue pasándose a 375, donde el `min-height` deja crecer la sección. Lo que
   * se achicó es el aire: de 291 px a 159. Si el pie vuelve a crecer —una cuarta
   * columna, más pedidos de contacto— `100svh` deja de contenerlo, y ahora hay
   * un instrumento que se pone rojo el día que pase.
   *
   * **Se queda en `100svh`, y no es conservadurismo:** el `alto` es un
   * `min-height` y la cuenta de ritmo del proyecto es la de ESCRITORIO, que es
   * donde la referencia midió los suyos. A 1440 la sección entra en 0,82
   * pantallas, así que `100svh` ya la contiene con aire; declarar `200svh`
   * metería **1,18 pantallas vacías** en el tramo final del recorrido, que es
   * exactamente el defecto que el pinneo existe para no tener.
   *
   * ⚠ A 375 el contenido SÍ pasa la pantalla —1,54— y ahí manda el
   * `min-height`: la sección crece y no recorta nada. O sea que la premisa de
   * SITIO-S6 era correcta **para el ancho que estaba mirando** y no para el que
   * gobierna la cuenta. Lo que eso cuesta es que el ritmo de mobile —que este
   * proyecto todavía no publica— subestimaría el tramo. Queda anotado, no
   * arreglado: el ritmo de 390 es otro número y SCROLL.md lo publica por
   * separado con razón.
   *
   * **Las tres salidas, para que quien lo reabra no las vuelva a recorrer:**
   * subir el alto mete 1,18 pantallas vacías a 1440; dejarlo en 100svh no
   * recorta nada en ningún ancho; y declarar dos altos por ancho no existe en
   * la tabla —el `alto` es uno y es un mínimo—. Se queda como está.
   */
  /**
   * ⚠️ **B12 · LA TINTA DEL PIE SE DA VUELTA: `oscuro-transparente` →
   * `papel-transparente`. Es la palanca elegida, y va con su número.**
   *
   * B6-A abrió el Cierre sobre la sala y B8 dejó el arco en 0,643 —la luz de
   * mañana— pero la sala NUNCA se vio: `chrome/Pie.tsx` pintaba
   * `var(--color-fondo)` por hoja y el `<footer>` envuelve la sección entera
   * (B8-LUZ.md §11.1). B12 le saca el relleno por pedido del humano («el footer
   * sigue con el fondo oscuro, tiene que ser transparente») y ahí aparece lo que
   * estaba tapado: **la sala al final es CLARA** —gris 145,5, luminancia 0,303
   * medida en la pose— y sobre eso la tinta clara del pie no se lee.
   *
   * Medido con el mismo instrumento, en la pose y en los dos anchos
   * (`docs/rediseno/outputs/b12/bloques-cierre-*.json`):
   *
   *     variante                          @1920            @1440
   *     oscuro-transparente (tinta clara) 24 de 24 ✗ 1,00   23 de 23 ✗ 1,02
   *     papel-transparente  (tinta oscura) 12 de 24 ✗ 1,04   10 de 23 ✗ 1,01
   *
   * Se elige `papel-transparente`: la mitad de los bloques pasa a estar bien y
   * los que quedan tienen una causa nombrada (el formulario y los marcadores en
   * tinta al 0,6), no «la superficie». El resto de la resolución está en
   * `_estilos/pie.css` y en el reporte de B12.
   */
  { id: 'cierre', numero: '08', nombre: 'Cierre', superficie: 'papel-transparente', alto: '100svh' },
]

/**
 * Cuántas secciones dejan ver el canvas. Es la cifra del recorrido —tres
 * momentos de escena— y la produce esta línea, no la prosa de un reporte.
 *
 * ⚠️ **B6-A: se deriva de `dejaVerElCanvas`, no del literal `papel-transparente`.**
 * Con tres modos las dos preguntas eran la misma; con `oscuro-transparente` en la
 * tabla de superficies dejan de serlo, y un filtro por nombre habría dejado a la
 * escena SUSPENDIDA detrás de un panel que la deja ver — sin un solo error. El
 * revelado, la visibilidad y el anclaje leen esta lista o la misma propiedad.
 */
export const SECCIONES_QUE_DEJAN_VER_LA_ESCENA: readonly string[] = SECCIONES.filter(
  (s) => SUPERFICIES[s.superficie].dejaVerElCanvas,
).map((s) => s.id)

/** Una sección por id. Tira si no existe: un id inventado es un error, no un
 *  `undefined` que se propaga hasta una pantalla en blanco. */
export function seccionPorId(id: string): Seccion {
  const encontrada = SECCIONES.find((s) => s.id === id)
  if (encontrada === undefined) throw new Error(`sección desconocida: ${id}`)
  return encontrada
}
