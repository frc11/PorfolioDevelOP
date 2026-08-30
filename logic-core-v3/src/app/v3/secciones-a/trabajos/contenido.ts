/**
 * TRABAJOS — la tabla que Franco edita.
 *
 * ── Por qué este archivo no tiene un solo JSX ni un solo número ────────────
 *
 * Reemplazar lo inventado por lo verdadero tiene que ser editar ESTA tabla y
 * nada más. Si el copy viviera adentro del `.tsx`, llenar un hueco obligaría a
 * leer marcado, y el pedido dejaría de ser una lista para pasar a ser una
 * búsqueda. Por eso acá no hay componentes, no hay clases y no hay geometría:
 * la relación de aspecto de las capturas, su `sizes` y cuántos planos anima el
 * patrón viven en `GEOMETRIA`, dentro del componente.
 *
 * ── Qué de acá es VERDAD y qué es relleno ──────────────────────────────────
 *
 * Verdad, y por eso NO va en `PEDIDO`:
 *
 *   · Los tres nombres. **Esquina · El Garage · Matsu Automotores** son
 *     clientes reales de develOP y el sprint los declara verdaderos. Van
 *     literales, sin adornar y sin agregarles rubro, ciudad ni fecha: todo eso
 *     lo tendríamos que inventar, y una ficha inventada se publica igual de
 *     fácil que una cifra inventada.
 *   · `etiqueta` = el nombre de la sección en el recorrido de `secciones.ts`.
 *
 * Relleno, y por eso va TODO en `PEDIDO` con clase `prosa`: `titular`,
 * `bajada`, `rotuloDeLaMetrica` y los tres `captura.alt`.
 *
 * ── Lo que NO sabemos, declarado ausente ───────────────────────────────────
 *
 * Dos cosas por proyecto, y las dos son el pedido entero de esta sección:
 *
 *   · **`metrica: '[MÉTRICA]'`** — el dato que dice qué cambió. Es LA pieza
 *     medida de esta sección: en la referencia la métrica va pegada al nombre.
 *     Acá va igual de pegada y **siempre visible**; el componente no la
 *     esconde detrás de ningún hover, porque esconder la métrica es esconder
 *     el pedido.
 *   · **`captura.marcador: '[CAPTURA]'`** — la imagen del sitio. Está en el
 *     CONTENIDO y no sólo en el componente a propósito: `marcadoresPedidos()`
 *     recorre este objeto para producir el pedido a Franco, y un marcador que
 *     sólo viviera en el `.tsx` no entraría en esa lista.
 *
 * ── Los tres `alt` dicen lo mismo, y es la respuesta honesta ───────────────
 *
 * No sabemos cómo es cada sitio. Escribir tres descripciones distintas sería
 * inventar tres sitios; escribir la misma frase con el nombre cambiado dice
 * exactamente lo que sabemos —que es una captura de la banda de arriba de ese
 * sitio— y deja el resto como pedido. La repetición acá es información, no
 * pereza.
 *
 * ── La única cantidad que aparece, y por qué está permitida ────────────────
 *
 * La palabra **"Tres"**, en el titular. No es un dígito —el escáner de
 * `marcadores.ts` no la ve, y no tiene por qué verla— y sobre todo **no es una
 * medición inventada**: que sean tres proyectos es exactamente el hecho que el
 * sprint declara verdadero, y se puede contar mirando la pantalla. Escrita con
 * letras no se puede leer como un dato de rendimiento ni por accidente. Es el
 * mismo criterio con el que Quiénes somos escribe "dos personas".
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
  /** El rótulo chico de arriba. Es el `nombre` de la sección en `secciones.ts`. */
  etiqueta: 'Trabajos',

  /** [relleno] El h2. Una línea, que es lo que entra arriba de una secuencia. */
  titular: 'Tres proyectos, y al lado de cada nombre la medida de lo que cambió.',

  /** [relleno] Qué falta y por qué falta. */
  bajada:
    'Los nombres son reales y el trabajo también. Lo que todavía no está es el ' +
    'dato: qué mejoró en cada negocio desde que salió, dicho con una medida y ' +
    'no con un adjetivo.',

  /**
   * [relleno] El rótulo del hueco que va pegado a cada nombre. Sin él,
   * `[MÉTRICA]` sería un corchete suelto en la pantalla y en el lector de
   * pantalla: el marcador dice que FALTA algo, el rótulo dice QUÉ falta.
   * Es la misma pieza que `rotuloDelPedido` en Quiénes somos.
   */
  rotuloDeLaMetrica: 'Lo que cambió',

  /**
   * [verdad] Los tres, en el orden en que entran. Tres es la cantidad que el
   * patrón anima —`piezas={3}` en el componente— y la cantidad de clientes que
   * el sprint declara verdaderos. No hay un cuarto de relleno: un cliente
   * inventado en una vitrina es exactamente la deuda que este sprint no repite.
   */
  proyectos: [
    {
      nombre: 'Esquina',
      metrica: '[MÉTRICA]',
      captura: {
        marcador: '[CAPTURA]',
        alt: 'Captura del sitio de Esquina: la banda de arriba, tal como se ve al entrar.',
      },
    },
    {
      nombre: 'El Garage',
      metrica: '[MÉTRICA]',
      captura: {
        marcador: '[CAPTURA]',
        alt: 'Captura del sitio de El Garage: la banda de arriba, tal como se ve al entrar.',
      },
    },
    {
      nombre: 'Matsu Automotores',
      metrica: '[MÉTRICA]',
      captura: {
        marcador: '[CAPTURA]',
        alt: 'Captura del sitio de Matsu Automotores: la banda de arriba, tal como se ve al entrar.',
      },
    },
  ],
} as const

/**
 * LO QUE FALTA, dicho por el propio contenido.
 *
 * Las seis entradas son `prosa`: es la clase de relleno que **no se ve como
 * agujero**. Un `[MÉTRICA]` en la pantalla se nota; un párrafo con la cadencia
 * correcta se lee igual que uno definitivo, y ése es el mismo mecanismo de la
 * deuda que este sprint no repite, aplicado a las palabras en vez de a los
 * números.
 *
 * Los marcadores NO se listan acá: los extrae `marcadoresPedidos()` del propio
 * contenido, que devuelve `[MÉTRICA]` y `[CAPTURA]` con su cuenta de tres y
 * tres. Listarlos a mano sería una segunda fuente que se desincroniza.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'titular',
    clase: 'prosa',
    que: 'La frase que abre la sección. Una idea, una línea, dicha como la decís vos.',
  },
  {
    ruta: 'bajada',
    clase: 'prosa',
    que: 'Qué se muestra acá y qué se promete, en dos o tres renglones. Sin plazos ni porcentajes.',
  },
  {
    ruta: 'rotuloDeLaMetrica',
    clase: 'prosa',
    que: 'Cómo se titula el dato que va al lado de cada nombre. Dos o tres palabras.',
  },
  {
    ruta: 'proyectos[0].captura.alt',
    clase: 'prosa',
    que: 'Qué se ve en la captura de Esquina, para quien no la puede ver.',
  },
  {
    ruta: 'proyectos[1].captura.alt',
    clase: 'prosa',
    que: 'Qué se ve en la captura de El Garage, para quien no la puede ver.',
  },
  {
    ruta: 'proyectos[2].captura.alt',
    clase: 'prosa',
    que: 'Qué se ve en la captura de Matsu Automotores, para quien no la puede ver.',
  },
]

/**
 * EL PATRÓN QUE ESTA SECCIÓN CONSUME — declarado, no inferido.
 *
 * **Uno solo, y es una decisión.** P7 —planos en profundidad— anima los tres
 * proyectos en un único bloque de tres piezas. El encabezado (etiqueta, número,
 * titular y bajada) NO se anima: es el marco quieto contra el que se lee el
 * vuelo. Si el encabezado también entrara, no quedaría nada fijo con qué medir
 * la profundidad, que es lo único que P7 tiene para decir.
 */
export const PATRONES_DE_LA_SECCION: readonly IdDePatron[] = ['P7']
