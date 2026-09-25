/**
 * QUIÉNES SOMOS — LA GEOMETRÍA: los números de la sección y el reparto de sus
 * dos grillas.
 *
 * Sale de `QuienesSomos.tsx` cuando ese archivo cruzó las 300 líneas del repo
 * al entrar el ≠, y el corte es el que el hero y Trabajos ya tienen
 * (`hero/geometria.ts`): **los números por un lado y la composición por el
 * otro.** Quien cambie una medida no vuelve a leer el JSX.
 */

import { cn } from '@/lib/utils'

import { sizesPorViewport } from '../../_lib/imagen'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../_lib/superficies'

/** LA GEOMETRÍA — los números técnicos de la sección, fuera del contenido: los decide quien la construye y no cambian con la foto real. */
export const GEOMETRIA = {
  foto: {
    /** 3:2 apaisado — [decidido]. Es una foto de DOS personas una al lado de la
     *  otra: el encuadre que pide es horizontal y de plano medio. 16:9 deja
     *  aire o corta las cabezas; 1:1 obliga a apilarlas, que es lo que la
     *  sección no quiere decir. 1800 × 1200 es el ARCHIVO, no una caja. */
    ancho: 1800,
    alto: 1200,
  },
  /**
   * El retrato de una persona: **4:3 APAISADO**. Pasó por 3:2 apaisado y por 3:4
   * vertical; vuelve a horizontal, pero más alto que el 3:2 del que venía. La del
   * equipo sigue en 3:2, que es su propio encuadre.
   *
   * El ancho ya no se declara acá: la foto llena su columna, y la columna es 3 de las
   * 4 en que se parte cada fila (`fila`, abajo). Por eso se fueron `caja` y el
   * `--retrato-ancho` que la acompañaba: el reparto lo hace la grilla de la fila.
   */
  retrato: {
    ancho: 1600,
    alto: 1200,
  },
  /**
   * LA FILA DE UNA PERSONA — dos columnas adentro de la calle, y el zigzag es cuál va
   * de qué lado. Cuatro columnas: **1 de texto y 3 de foto.**
   *
   * El texto va PRIMERO en el marcado en las dos filas —el nombre encabeza su columna
   * y la descripción lo sigue— y lo que alterna es el `col-start`, no el orden del
   * DOM: quien lee con lector de pantalla escucha siempre nombre y después foto, sin
   * importar de qué lado la composición puso cada cosa.
   *
   * Abajo de 1025 no hay grilla: las dos columnas se apilan en el orden del marcado.
   */
  fila: {
    caja: cn(
      'flex w-full flex-col gap-[var(--spacing-6)]',
      'escritorio:grid escritorio:items-start',
      /**
       * ⚠️ **LAS DOS COLUMNAS DE LOS EXTREMOS NO BAJAN DE LO QUE MIDE EL NOMBRE.**
       * Era `grid-cols-4` a secas, o sea cuatro cuartos: a 1024 eso deja 108 px
       * de columna y «Valentino» mide 115,67 —se cortaba—. El `minmax()` le pone
       * piso a las columnas 1 y 4, que son las DOS donde el zigzag puede poner el
       * texto, y por eso va simétrico: cualquier otra forma de ensanchar una sola
       * rompería la alternancia. La foto sigue ocupando tres columnas de los dos
       * lados y suma lo mismo de los dos lados.
       *
       * ⚠️ Y **no cambia nada arriba de 1120**: el piso sólo muerde cuando un
       * cuarto de la calle queda abajo de él, y la calle es `0,5w − 32`, así que
       * la condición es `w < 1120`. Medido: a 1440 la columna sigue en 160 y a
       * 1920 en 220, idénticas.
       */
      'escritorio:grid-cols-[minmax(var(--nombre-piso),1fr)_1fr_1fr_minmax(var(--nombre-piso),1fr)]',
      'escritorio:gap-x-[var(--grilla-canal-amplio)]',
    ),
    texto: 'flex flex-col gap-[var(--spacing-3)] escritorio:row-start-1',
    textoAIzquierda: 'escritorio:col-start-1',
    textoADerecha: 'escritorio:col-start-4',
    foto: 'w-full escritorio:row-start-1 escritorio:col-span-3',
    fotoAIzquierda: 'escritorio:col-start-1',
    fotoADerecha: 'escritorio:col-start-2',
  },
  /**
   * LA VENTANA QUE RECORTA. El texto sube desde una línea invisible en su base, y la
   * base lo recorta: es el gesto que `LineasDeTexto` aplica por línea —`overflow-hidden`
   * afuera, la pieza subiendo adentro— y lo que hace que P1 y P2 se LEAN como una
   * aparición y no como un texto que pasa de largo. Sin la máscara, las claves siguen
   * corriendo y no se nota: ésa fue la regresión del titular.
   *
   * El relleno y el margen negativo se cancelan en el layout —aportan cero— y sólo
   * corren el borde de recorte, para que no se coma ni una cola de «p» ni el trazo que
   * el titular lleva debajo de la línea de base.
   */
  ventanaDelTexto: 'block overflow-hidden py-2 -my-2',
  /**
   * EL RÓTULO DEL BLOQUE — el 30 % del camino de vuelta al gigante. [derivado]
   *
   * Pasó por dos extremos y este valor es la interpolación entre ellos, no una
   * elección nueva. Sobre la calle a 1920 (928 px):
   *
   *     antes   17,2cqw → 159,6 px   (el display que era «una exageración»)
   *     ahora   titulo-l → 53,0 px   (el encabezado al que había bajado)
   *     30 %    53,0 + 0,30·(159,6 − 53,0) = 85,0 px → 85,0/928 = **9,2cqw**
   *
   * Vuelve a `cqw` —y con él el `@container`— porque el punto de partida era `cqw`:
   * interpolar entre una fracción de la calle y un escalón fijo sólo tiene sentido en
   * la unidad del primero, que además mantiene la proporción a cualquier ancho.
   *
   * Alineado a la izquierda —el defecto, nadie le pone `text-left`—, contra el borde
   * izquierdo de la calle, que es el 50 % del viewport.
   */
  /**
   * ⚠️ **`9.2cqw` NO ES UN ESCALÓN, Y A 768 ROMPÍA LA JERARQUÍA.** Es un porcentaje
   * del ancho del contenedor: con la calle entera daba **64,8 px a 768**, o sea más
   * grande que el titular. Abajo del corte pasa a `titulo-xl`, el MISMO escalón que
   * el titular: son los dos rótulos grandes de la sección y el pedido los quiere
   * parejos. Arriba del corte el `cqw` se queda: ahí la calle es la mitad del cuadro
   * y el valor está medido.
   */
  tituloDelEquipo: 'font-titulo text-[length:var(--equipo-titulo-tamano)] max-escritorio:text-fluido-titulo-xl leading-titulo tracking-titulo',
  /**
   * DÓNDE ARRANCA UNA MÁSCARA DE RENGLÓN. Con `ventana-visible` el gesto empezaba con
   * la pieza 80 px adentro del borde de abajo: para cuando el ojo llegaba al renglón,
   * el recorrido ya estaba consumido y la aparición no se veía. Este rango arranca
   * cuando el borde SUPERIOR cruza el 80 % del alto del cuadro, que es donde el renglón
   * ya está a la vista.
   *
   * ⚠ Es el mismo par de anclas que estrenó el trazo (`top 80 % → top 45 %`) y por eso
   * lleva su nombre; no es un gesto del trazo, es la ventana de «la pieza cruzando la
   * mitad de la pantalla». La comparten el titular, el rótulo, los dos nombres y la
   * llegada de las fotos.
   */
  rangoDeLaMascara: 'ventana-de-la-mascara',
  /**
   * LA MEDIDA DE LECTURA — una sola para las tres piezas de texto. [medido]
   *
   * ⚠ **No es un ancho de columna: es un TOPE.** La columna sigue siendo fluida
   * y el tope sólo manda arriba de ~1025, donde se vuelve demasiado ancha para
   * una línea (la referencia: *la caja de texto no acompaña al viewport*).
   * `--fluido-piso` menos un escalón: 375 − 48 = 327 px, de comparar a 1920 los
   * altos que produce cada tope, que es lo que decide cuánta tinta se reparte:
   *
   *     tope   titular   bajada   cómo   tinta    juntura
   *     375     288,91       96     96   519,8      93,4
   *     343     288,91       96    120   543,8      89,4
   *     327     346,69      120    120   617,6      77,1
   *
   * Y no deja el texto fuera de registro: 327 px sobre un titular de 53 px son 6,2
   * em de línea, contra los 6,67 em de la referencia (480 px sobre 72). */
  medida: 'max-w-[calc(var(--fluido-piso)_-_var(--spacing-12))]',
  /** Modo pulido: titular+bajada ensanchan a 30rem, sin pasar el 42% del viewport. */
  /**
   * ⚠️ **EL CUERPO NO VA A ANCHO COMPLETO, Y ES LA CORRECCIÓN DE UN EXCESO MÍO.**
   *
   * `--agencia-medida` vale `min(30rem, 42vw)`, y ese `42vw` era la columna angosta
   * con medio viewport vacío a la derecha: medido, la bajada daba 134 px de 256 a
   * 320 y 158 de 311 a 375. El sprint anterior lo soltó a ancho completo, y a 768
   * eso da renglones del orden de 100 caracteres, que se leen mal. Abajo del corte
   * la medida pasa a `--medida-movil`: en la banda angosta no llega a morder
   * —65ch son más que el ancho disponible— y a 768 acota donde hace falta.
   */
  medidaAgencia: 'max-w-[var(--agencia-medida)] max-escritorio:max-w-[var(--medida-movil)]',
  /** La misma medida cómoda para la descripción de cada persona: mismo registro, mismo renglón. */
  medidaMovilDelCuerpo: 'max-escritorio:max-w-[var(--medida-movil)]',
  /**
   * LOS VALORES A MEDIDA, COMO PROPIEDADES Y NO COMO LITERALES.
   *
   * `s5-tokens` §T4 admite UNA sola forma de valor arbitrario: `var(--token)`. Lo que
   * esta sección tiene y el sistema no puede tener —la medida en `ch` del titular, su
   * cuerpo de 38 px, el título en `cqw`, los dos anchos de foto y el velo— viaja como
   * propiedad de ALCANCE DE COMPONENTE, que es el mecanismo que el lane ya usa para el
   * CTA. Cada grupo se declara en el elemento que lo consume y hereda hacia adentro.
   */
  estilos: {
    /**
     * ⚠️ `--nombre-piso` es el piso de la columna del nombre. [derivado]
     * «Valentino» es la palabra más larga de las dos y mide **115,67 px a
     * 1024**, el único ancho donde la columna se le quedaba corta; 120 es el
     * primer múltiplo de 8 —la unidad del sistema— que la contiene con margen.
     * Va como propiedad de alcance de componente y no como token del tema
     * porque es una medida de ESTA composición, igual que `--medida-movil`.
     */
    titular: {
      '--titular-tamano-escritorio': '38px',
      '--titular-medida': '23ch',
      '--titular-interlineado': '1.25',
      /** El alto del ≠: tres renglones del titular, derivado de su propio cuerpo. */
      '--signo-alto': 'calc(3em * var(--titular-interlineado))',
    } as React.CSSProperties,
    bajada: {
      '--agencia-medida': 'min(30rem, 42vw)',
      '--cuerpo-tamano': '1.0625rem',
      '--cuerpo-interlineado': '1.6',
    } as React.CSSProperties,
    tituloDelEquipo: { '--equipo-titulo-tamano': '9.2cqw' } as React.CSSProperties,
    /**
     * LA MEDIDA CÓMODA DE LA BANDA, declarada UNA vez en la sección.
     *
     * La usan la bajada y las descripciones de las personas, que son el mismo
     * registro y tienen que arrancar en el mismo margen y cortar a lo mismo.
     * Va en la raíz de la sección y no en cada consumidor: dos declaraciones del
     * mismo 65 se desincronizan el día que una se toque.
     */
    seccion: { '--medida-movil': '65ch', '--nombre-piso': '120px' } as React.CSSProperties,
    /** `--foto-ancho` sólo gobierna abajo de 1025: de ahí para arriba la foto pasa a
     *  `escritorio:w-full` (de la calle), una utilidad del sistema y no un valor a medida. */
    fotoDelEquipo: { '--foto-ancho': '65%' } as React.CSSProperties,
  },
  /**
   * LA MEDIDA DEL TITULAR, EN `ch` Y NO EN `rem`. [medido]
   *
   * Una caja en `rem` contra una letra fluida cambia de proporción con cada ancho, así
   * que el corte cae en un lugar distinto en cada uno. En `ch` la caja escala CON la
   * letra: la proporción queda fija y el corte —después de «distinto,»— es el mismo a
   * cualquier tamaño. Por eso la tipografía va en este mismo envoltorio: `ch` resuelve
   * contra el `font-size` del elemento que lo declara, y el `span` de adentro hereda.
   */
  /**
   * Los `23ch` no acotan abajo del corte: el titular es display y la medida larga
   * no molesta. La variante es `max-escritorio:` y no `max-tablet:` —que excluía
   * justamente 768, donde el pedido lo quiere a ancho completo—. Lo comparte el
   * signo, que se alinea a la izquierda de su caja y no se mueve.
   */
  medidaDelTitular: 'max-w-[var(--titular-medida)] max-escritorio:max-w-none',
  /** 38px fijo de escritorio para arriba (ningún escalón de la escala cae ahí), fluido abajo. Interlineado 1,25 y no `--leading-titulo` (1,09): apretado, el subrayado del primer renglón se apoyaba sobre las mayúsculas del segundo. */
  /**
   * ⚠️ **ABAJO DEL CORTE EL TITULAR SUBE DOS ESCALONES, Y ERA UN DEFECTO.**
   *
   * Estaba en `text-fluido-titulo-m`, que a 375 vale su piso —18 px— contra un
   * cuerpo de 17: el titular medía **1,06 veces** el cuerpo y no se leía como
   * título. La referencia pide del orden de 2,2. `titulo-xl` da **36 px a 375
   * (2,12×)** y **43,4 a 768 (2,55×)**, los dos con los escalones de la escala
   * fluida que ya existen. De 1025 para arriba no cambia nada: ahí gobierna
   * `--titular-tamano-escritorio`.
   */
  tipografiaDelTitular: 'font-titulo text-fluido-titulo-xl escritorio:text-[length:var(--titular-tamano-escritorio)] leading-[var(--titular-interlineado)] tracking-titulo',
  /** El cuerpo de la bajada. **No pasa por `<Cuerpo>`**: ese componente declara un NIVEL
   *  (`data-nivel="cuerpo"`) y pisarle el tamaño le saca su clase de escala, que es
   *  justo lo que `s5-compacto` caza. Acá el nivel no se declara porque no es ése. */
  /** La mezcla sale de `MEZCLA_SOBRE_LA_ESCENA`: una sola definición para las nueve piezas que se apoyan en la escena. */
  cuerpoDeLaBajada: cn(
    'font-cuerpo tracking-texto text-[length:var(--cuerpo-tamano)] leading-[var(--cuerpo-interlineado)]',
    MEZCLA_SOBRE_LA_ESCENA,
  ),
  /**
   * Los pesos de los dos tramos marcados. **Sin itálica, y es una restricción medida:**
   * la familia tiene una cara itálica de verdad, pero su binario trae sólo las 68
   * posiciones de MAYÚSCULAS del titular del hero, así que un `italic` con minúsculas
   * caería al fallback. La distinción la cargan el peso y la raya.
   */
  pesosDelTitular: { subrayado: 'font-fuerte', tachado: 'font-liviano' },
  /**
   * EL REPARTO de las dos pantallas de texto: doce columnas como primitiva de
   * posición, una fila por pieza (el instrumento de Números; las cadenas van
   * enteras porque Tailwind escanea el fuente). La columna 9 no es una preferencia:
   * a 1920 la pastilla ocupa de x 658 a x 1262 y una caja que arranca en la 9
   * empieza en x 1332, afuera en todo su recorrido; por eso **la última fila de
   * cada pantalla arranca en la 9**, contra el pie del cuadro con `content-evenly`.
   * ⚠ B11: en la pantalla del equipo, «cómo trabajamos» (fila 1) y la primera
   * persona (fila 2) arrancan en la 7, la primera columna que el logo deja libre
   * ahí (c7–c10 ≤ 10 % en los tres anchos); la segunda sigue en la 9 (pastilla).
   */
  reparto: {
    // ⚠️ B12: la fila 1 quedó vacía —era el rótulo— y su celda se borra con él.
    // La fila 4 se fue con «Tucumán, Argentina»: el bloque del equipo arranca antes.
    titular: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-2',
    /** El ≠ en su PROPIA fila: `content-evenly` le da el mismo aire arriba y abajo, que es el centrado vertical pedido. */
    signo: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-3',
    bajada: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-4',
  },
  /**
   * LA PROPORCIÓN DE LA FOTO DEL EQUIPO EN LA BANDA MÁS ANGOSTA. [medido]
   *
   * El archivo es 3:2 apaisado y la decisión de ese encuadre está escrita arriba:
   * son dos personas una al lado de la otra. Con el ancho de contenido entero eso
   * alcanza a 375 (207 px de alto contra 154 que pide el texto revelado, 53 de
   * sobra) y a 425 (241 contra 134, 107 de sobra), y **no alcanza a 320**: 171
   * contra 176, se desborda por 5 px. `aspect-4/3` a ese ancho da 192 y entra con
   * 16 px. Es el recorte más chico que resuelve el desborde: 11 % del ancho del
   * archivo, 5,5 % por lado.
   *
   * ⚠️ La variante es `max-angosto:` —abajo de 375— y no `max-chico:`, que habría
   * cobrado el recorte también a 375, donde 3:2 ya entraba con 53 px de sobra. La
   * banda es exactamente el ancho que lo necesita, y de 375 para arriba el
   * encuadre del archivo queda intacto.
   */
  proporcionDeLaFotoEnPapel: 'max-angosto:aspect-4/3',
  /**
   * LA COLUMNA LATERAL, COLAPSADA HASTA EL CORTE. Es la misma clase que el hero usa
   * desde COMPO-1 §5 y por el mismo motivo: `lateral` abre su celda de 140 px en
   * `tablet:`, y a 768 esa celda está vacía — reservaba 152 px con la canaleta y
   * dejaba el titular en 552 de 704.
   */
  claseDeLaColumnaLateral: 'tablet:grid-cols-1 escritorio:grid-cols-[var(--columna-lateral)_minmax(0,1fr)]',
  /** Cuántos renglones promete el titular. Dos a 1440 y a 1920, cortando después de «distinto,». */
  lineasDelTitular: 2,
} as const

/**
 * EL `sizes` DE CADA MARCO, DERIVADO DEL ANCHO REAL DE LA CALLE. [medido]
 *
 * La calle no mide 50vw parejo: mide `50vw − 32px`, porque su borde derecho es el
 * margen de `Envoltorio` (32px, simétrico) y su borde izquierdo es el 50 % exacto
 * del viewport — la resta de esos dos puntos pierde el padding una sola vez, no dos.
 * Como fracción de V (el ancho del viewport): `0,5 − 32/V`, que converge a 0,5 y vale
 * menos cuanto más chico es V: 46,9 % a 1025 (el piso de escritorio), 47,8 % a 1440,
 * 48,3 % a 1920. Un solo número para todo el tramo, así que se toma el TECHO (1920)
 * y se redondea para arriba: nunca pide una imagen más chica de la que hace falta.
 *
 * El retrato llena 3 de las 4 columnas de su fila, con 2 de las 3 canaletas adentro:
 * `0,75·C − 4`, o sea 692 px a 1920 → `692/1920 = 36,0 %` en el techo → **36**.
 * La foto del equipo es el 100 % de la calle: `0,483` en el techo → **48**.
 */
export const SIZES_DEL_RETRATO = sizesPorViewport(36)
/** Modo pulido: 65 % de contenido (sólo abajo de 1025) pasó a 100 % de la calle de escritorio para arriba — ver el cálculo de arriba. */
export const SIZES_DE_LA_FOTO = sizesPorViewport(48)

/** LA GRILLA DE LAS DOS PANTALLAS DE TEXTO — doce columnas desde 1025, UNA abajo, y el
 *  hueco repartido en vez de acumulado: `grow` + `content-evenly` crece hasta el alto de
 *  la pantalla y reparte lo que sobra **por igual entre las junturas** (por eso `gap-y` se apaga arriba de 1025). */
export const CLASES_DEL_REPARTO = cn(
  'grid w-full grow grid-cols-1 content-evenly items-start gap-y-12',
  'escritorio:grid-cols-12 escritorio:gap-y-0',
  'gap-x-[var(--grilla-canal-compacto)] escritorio:gap-x-[var(--grilla-canal-amplio)]',
)

/** RECURSOS · A qué altura se ancla cada foto vertical en su marco apaisado. Clases enteras, para el escáner de Tailwind. */
export const CLASE_DE_ENCUADRE = {
  arriba: 'object-[50%_20%]',
  medio: 'object-[50%_38%]',
} as const

/** RECURSOS · La proporción de cada marco como clase: las fotos llegaron verticales y el marco la impone. */
export const CLASE_DE_RELACION = { retrato: 'aspect-4/3', foto: 'aspect-3/2' } as const
