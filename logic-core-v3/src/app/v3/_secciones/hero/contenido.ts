/**
 * HERO — la tabla que Franco edita.
 *
 * ── Por qué este archivo no tiene un solo JSX ni un solo número ────────────
 *
 * Reemplazar lo inventado por lo verdadero tiene que ser editar ESTA tabla y
 * nada más. Si el copy viviera adentro del `.tsx`, cambiar una bajada
 * obligaría a leer marcado, y el pedido dejaría de ser una lista para pasar a
 * ser una búsqueda. Por eso acá no hay componentes, no hay clases y no hay
 * geometría: cuántas columnas mide el titular y cuántas líneas promete viven
 * en `GEOMETRIA`, dentro del componente.
 *
 * ── Qué de acá es VERDAD y qué es relleno ──────────────────────────────────
 *
 * Verdad, y por eso NO va en `PEDIDO`:
 *
 *   · `titularFila1`, `titularFila2` y `titularFila3` — las frases llegaron
 *     dictadas por el sprint, con la instrucción de no cambiarlas ni mejorarlas.
 *     Son copy aprobado, no una aproximación con la cadencia correcta. Hasta el
 *     rehecho del titular eran UNA (`titular`), cortada por medición; después
 *     fueron DOS (los dos registros tipográficos) y desde COMPO-1 son TRES
 *     filas, porque el corte del registro 1 también pasó a ser declarado.
 *
 * ⚠️ **EL `slogan` SE FUE DE ESTA TABLA, Y ES UN BORRADO DE COPY APROBADO.**
 * «Ingeniería para negocios reales.» era `[verdad]` y se pintaba arriba del
 * titular, en el registro chico. El ajuste de estructura del hero lo elimina
 * como elemento propio por pedido del humano, y **la frase no se mudó a ningún
 * lado**: la instrucción descarta explícitamente ponerla en la bajada, porque
 * el titular ya dice la promesa y la bajada tiene que decir qué se compra. Así
 * que la línea de marca deja de estar en el hero. Queda dicho acá porque un
 * borrado de copy aprobado no se deduce de un `git diff`.
 *   · `cta.destino` — `#trabajos` es el id de la sección 04 en `secciones.ts`,
 *     o sea el único ancla de este lane que existe DE VERDAD hoy y que va a
 *     seguir existiendo cuando el home componga las ocho. Un ancla inventada
 *     —`#contacto`, `#precios`— es un enlace roto que se ve igual de bien que
 *     uno sano hasta que alguien lo clickea.
 *
 * Relleno, y por eso van en `PEDIDO` con clase `prosa`: la `bajada` y
 * `cta.rotulo`. Tienen la longitud y la estructura retórica que la composición
 * necesita para poder juzgarse —una promesa de un renglón y una invitación de
 * tres palabras— y ninguno es el texto definitivo.
 *
 * ── Por qué esta sección no deja UN SOLO MARCADOR, y no es un descuido ─────
 *
 * Un marcador declara ausente un DATO que no tenemos: una cifra, una foto, un
 * testimonio, una captura. **El Hero no muestra ninguno de los cuatro.** Es una
 * frase grande, una línea de marca, dos renglones y un enlace: no hay un solo
 * lugar donde iría un dato medido.
 *
 * Lo que sí tiene de provisional son DOS TEXTOS —la bajada y
 * el rótulo del CTA—, y ésa es exactamente la otra mitad del mecanismo: la prosa de relleno **no se ve como agujero** —se lee
 * igual que la definitiva— y por eso se declara en `PEDIDO` en vez de mostrarse
 * entre corchetes. Poner un `[CIFRA]` acá para que la lista no diera cero sería
 * pedir un dato que la composición no tiene dónde poner, y el pedido dejaría de
 * ser la lista de lo que falta para pasar a ser una lista con ruido.
 *
 * El invariante afirma el cero **y prueba que el extractor no está ciego**
 * corriéndolo contra un contenido que sí tiene marcadores. Sin esa segunda
 * mitad, "cero marcadores" y "el escáner no mira" se ven idénticos.
 */

import type { IdDePatron } from '../../_lib/motion/patrones'
import type { EntradaDePedido } from '../_contrato/pedido'

/**
 * ⚠ Sin apóstrofos, comillas ni `&` en ninguna cadena, y es deliberado:
 * `renderToStaticMarkup` los escapa a entidades, y el invariante afirma que
 * **cada texto del contenido aparece literal en el marcado**. Con un apóstrofo
 * adentro esa comprobación fallaría por la codificación y no por el contenido
 * —un rojo que no dice nada— o, peor, alguien la relajaría a una búsqueda
 * aproximada y dejaría de comprobar lo que dice comprobar.
 */
export const CONTENIDO = {
  /**
   * [verdad] El h1, EN TRES FILAS Y DOS REGISTROS.
   *
   * ── Cómo se lee esta tabla ─────────────────────────────────────────────
   *
   *   fila 1  «Tu negocio»   ┐ registro 1 — Archivo condensado 700, mayúsculas
   *   fila 2  «vendiendo»    ┘
   *   fila 3  «las 24 hs»      registro 2 — Chivo Light itálica, el nivel más
   *                            grande de la escala
   *
   * **«Fila» es lo que se ve abajo de 1025.** De 1025 para arriba las filas 1 y
   * 2 comparten renglón —el envoltorio del registro 1 vuelve a ser `block` y
   * las dos salen inline con el espacio en medio— así que el titular sigue
   * siendo el de dos renglones que el dueño aprobó a 1440 y a 1920. Una cadena
   * por fila y el corte declarado: no hay nadie midiendo dónde parte.
   *
   * ── Por qué se partió, las dos veces ───────────────────────────────────
   *
   * **La primera** (rehecho del titular): era una sola frase que
   * `TextoPorLineas` cortaba MIDIENDO, y eso es correcto mientras las líneas
   * sean del mismo registro tipográfico. Dejaron de serlo —Archivo condensado
   * arriba, Chivo Light itálica abajo— y **dos caras distintas no pueden salir
   * de un divisor que reparte una sola cadena con una sola métrica**.
   *
   * **La segunda** (COMPO-1): el registro 1 se parte en dos filas abajo de 1025
   * por pedido del dueño. Y es la misma razón de fondo: **dónde corta el
   * registro 1 lo decidía el ancho de la caja**, o sea que cortaba en 320 —donde
   * no entra— y no cortaba en 375 —donde sí—. El resultado era un titular que
   * cambiaba de forma entre dos teléfonos. Con el corte declarado, la forma es
   * la misma en los seis anchos de abajo de 1025.
   *
   * ── Y por qué siguen siendo `[verdad]` ─────────────────────────────────
   *
   * Las frases llegaron dictadas por el sprint, con su reparto. No son una
   * aproximación con la cadencia correcta: son el copy. Por eso ninguna va en
   * `PEDIDO`.
   *
   * ⚠ Se escriben en minúsculas y las pone en mayúsculas el CSS (`uppercase`),
   * no el dato. Es deliberado: el texto del documento —lo que copia quien
   * selecciona— sigue siendo prosa, y la mayusculación es la forma. Los
   * `.woff2` de las dos caras son subsets de MAYÚSCULAS, así que si alguien
   * saca el `uppercase` las minúsculas caen al fallback y se ve otra letra;
   * está anotado también en el componente y en el tema.
   */
  titularFila1: 'Tu negocio',
  titularFila2: 'vendiendo',
  titularFila3: 'las 24 hs',

  /**
   * [relleno] UNA SOLA FRASE, EN UN SOLO RENGLÓN, EN LOS OCHO ANCHOS.
   *
   * ── ⚠️ COMPO-2 · EL QUIEBRE EN DOS FILAS ESTÁ REVOCADO ──────────────────
   *
   * Era una decisión de composición del dueño —no una necesidad de medida— y
   * COMPO-1 la escribió acá justamente para que se pudiera dar vuelta sin
   * discutirle nada a la tipografía. El dueño la dio vuelta: *«va en UN SOLO
   * RENGLÓN, siempre»*. Así que los dos campos `bajadaFila1` y `bajadaFila2`
   * vuelven a ser **uno**, y con ellos se va la entrada de más en `PEDIDO`.
   *
   * **La frase no cambió una letra.** Lo único que cambió es que ya no se
   * declara dónde corta.
   *
   * ── Y entra, medido en el navegador en los OCHO ─────────────────────────
   *
   * El párrafo es un ítem de una columna `items-start`, así que su caja se
   * achica al contenido: su ancho **es** el renglón. Medido con la frase en un
   * solo renglón (`outputs/compo2/a-regla0.json`), contra la caja de la bajada:
   *
   *     ancho   renglón   caja      margen
   *     320     243,34    256,00     12,66   ← el que manda
   *     375     243,34    311,00     67,66
   *     390     243,34    326,00     82,66
   *     425     243,34    361,00    117,66
   *     768     243,34    346,00    102,66
   *     1024    243,34    474,00    230,66
   *     1440    243,34    354,80    111,46   ← ya era un renglón
   *     1920    243,34    498,80    255,46   ← ya era un renglón
   *
   * Un renglón en los ocho, y el peor margen son 12,66 px a 320. El modelo del
   * `.woff2` da 245,22 px (15,32600 em × 16) — sobreestima 1,88 px porque no
   * cuenta kerning, o sea que erra para el lado seguro.
   *
   * ── El presupuesto de caracteres, re-derivado para UNA frase ────────────
   *
   * El techo vuelve a ser el de la frase entera y lo pone el ancho MÁS
   * ANGOSTO: 256 px de caja a 320, con un avance medido de 6,952 px por
   * carácter sobre esta cadena (243,34 / 35). **36 caracteres**: 36 × 6,952 =
   * 250,3 entra y 37 se pasa (257,2).
   *
   * ⚠ El avance por carácter es propiedad de CADA frase, no de la fuente: una
   * frase con más mayúsculas o más «m» no entra en 36. El techo es una guía con
   * su cuenta escrita, y el instrumento vuelve a medir la frase que llegue.
   *
   * ── Lo que esta frase ya resignó, y por qué sigue siendo relleno ────────
   *
   * TEXTO-2 escribió dos variantes y el dueño eligió ésta **por VOZ**: el «tu»
   * repetido es lo que hace que le hable a un dueño de PyME en vez de describir
   * un producto. Lo que resigna es «un sistema», o sea la integración dicha con
   * esa palabra; las tres cosas que se venden siguen estando. Sigue siendo
   * `prosa` en `PEDIDO` porque el texto definitivo no llegó.
   */
  bajada: 'Tu sitio, tu chat y tu seguimiento.',

  cta: {
    /** [relleno] Tres palabras. Un rótulo largo rompe el rollover: la ventana
     *  de recorte mide el ancho del rótulo y con una frase se vuelve una raya. */
    rotulo: 'Mirá los trabajos',
    /**
     * [verdad] El id de la sección 04 en `secciones.ts`. Está en el CONTENIDO
     * y no en el componente porque es lo que Franco podría querer mover el día
     * que el home tenga las ocho — y porque el instrumento transversal ya lo
     * contempla: una cadena que empieza con `#` la trata como referencia y no
     * como texto de pantalla.
     */
    destino: '#trabajos',
  },
} as const

/**
 * LO QUE FALTA, dicho por el propio contenido.
 *
 * Las dos entradas son `prosa`: es la clase de relleno que **no se ve como
 * agujero**. Un `[CIFRA]` en la pantalla se nota; una bajada con la cadencia
 * correcta se lee igual que una definitiva, y ése es el mismo mecanismo de la
 * deuda que este sprint no repite, aplicado a las palabras en vez de a los
 * números.
 *
 * ⚠️ **FUERON DOS, DESPUÉS TRES, Y VUELVEN A SER DOS — Y NUNCA FUE UNA DEUDA
 * NUEVA NI UNA MENOS.** COMPO-1 partió la bajada en dos filas declaradas, así
 * que un pedido de una frase pasó a ser dos de un renglón; COMPO-2 le revocó el
 * quiebre y los dos vuelven a ser uno. **El texto pendiente es EL MISMO en las
 * tres versiones**: lo único que cambió cada vez es si el pedido tiene que
 * decir además dónde corta. Ahora no corta.
 *
 * Los marcadores NO se listan acá —los extrae `marcadoresPedidos()` del propio
 * contenido— y en esta sección la lista da cero, con la razón escrita arriba.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'bajada',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'El renglón abajo del titular: qué se vende. Sin plazos ni porcentajes. Es UNA frase y se pinta en UN renglón en los ocho anchos — COMPO-2 revocó el quiebre en dos filas que COMPO-1 había declarado, así que ya no hay que escribirla pensando dónde corta.',
    formato: 'UN renglón, 36 caracteres COMO MÁXIMO. El techo lo pone el ancho MÁS ANGOSTO y no el más ancho: la caja de la bajada mide 256 px a 320, contra los 498,80 de media medida a 1920. Medido en el navegador sobre la cadena real al tamaño de la bajada (16 px): 243,34 px de renglón, o sea 6,952 px por carácter, y 36 × 6,952 = 250,3 entra en 256 mientras 37 se pasa. ⚠ El avance por carácter es propiedad de CADA frase y no de la fuente: una con más mayúsculas no entra en 36, y el instrumento vuelve a medir la que llegue. Texto plano.',
  },
  {
    ruta: 'cta.rotulo',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'Cómo se invita a mirar los trabajos. Tres palabras: es lo que entra en la ventana del rollover.',
    formato: 'Tres palabras como máximo. Texto plano.',
  },
]

/**
 * LOS PATRONES QUE ESTA SECCIÓN CONSUME — declarados, no inferidos.
 *
 * `P1` para el titular (línea por línea, 142 instancias, el 58 % del corpus) y
 * `P2` para el bloque de bajada y CTA (bloque entero, sube desde media altura
 * propia). No hay un tercero: el Hero es una frase grande y una invitación, y
 * los siete patrones restantes mueven objetos, planos o listas que acá no
 * existen. El slogan queda quieto a propósito y está explicado en el
 * componente.
 */
export const PATRONES_DE_LA_SECCION: readonly IdDePatron[] = ['P1', 'P2']
