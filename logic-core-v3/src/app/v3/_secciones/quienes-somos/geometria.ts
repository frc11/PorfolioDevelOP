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
      'escritorio:grid escritorio:grid-cols-4 escritorio:items-start',
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
  tituloDelEquipo: 'font-titulo text-[length:var(--equipo-titulo-tamano)] leading-titulo tracking-titulo',
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
  medidaAgencia: 'max-w-[var(--agencia-medida)]',
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
  medidaDelTitular: 'max-w-[var(--titular-medida)]',
  /** 38px fijo de escritorio para arriba (ningún escalón de la escala cae ahí), fluido abajo. Interlineado 1,25 y no `--leading-titulo` (1,09): apretado, el subrayado del primer renglón se apoyaba sobre las mayúsculas del segundo. */
  tipografiaDelTitular: 'font-titulo text-fluido-titulo-m escritorio:text-[length:var(--titular-tamano-escritorio)] leading-[var(--titular-interlineado)] tracking-titulo',
  /** El cuerpo de la bajada. **No pasa por `<Cuerpo>`**: ese componente declara un NIVEL
   *  (`data-nivel="cuerpo"`) y pisarle el tamaño le saca su clase de escala, que es
   *  justo lo que `s5-compacto` caza. Acá el nivel no se declara porque no es ése. */
  cuerpoDeLaBajada: 'font-cuerpo tracking-texto text-[length:var(--cuerpo-tamano)] leading-[var(--cuerpo-interlineado)]',
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
