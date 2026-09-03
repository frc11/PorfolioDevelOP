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
 *   · Los tres nombres. **Esquina · El Garage · Banú** son clientes reales de
 *     develOP y salen de `_contrato/escaneo.ts`, que es donde vive la lista.
 *     Van literales, sin adornar y sin agregarles rubro, ciudad ni fecha: todo
 *     eso lo tendríamos que inventar, y una ficha inventada se publica igual de
 *     fácil que una cifra inventada.
 *   · `captura.fuente` y `enlace` — los archivos y los dominios existen y se
 *     verificaron uno por uno. Ver abajo.
 *   · `etiqueta` = el nombre de la sección en el recorrido de `secciones.ts`.
 *
 * ⚠️ **EL TERCER NOMBRE ERA FALSO, Y ESTUVO PUBLICADO (V3-D).** Decía **Matsu
 * Automotores**, y ese trabajo no se hizo. No era relleno —no llevaba
 * marcador— así que se leía como un hecho, que es exactamente lo que era: un
 * hecho inventado. Los tres detectores del escáner lo dejaron pasar porque un
 * nombre propio no tiene dígitos, ni símbolo, ni forma de precio. Queda
 * anotado acá y en `escaneo.ts` para que la próxima vez que alguien agregue un
 * cliente sepa que la lista se comprueba contra la realidad y no contra sí
 * misma.
 *
 * Relleno, y por eso va en `PEDIDO` con clase `prosa`: `titular`, `bajada` y
 * `rotuloDeLaMetrica`. Los tres `captura.alt` **ya no**: describen capturas que
 * existen y se escribieron mirándolas.
 *
 * ── Lo que NO sabemos, declarado ausente ───────────────────────────────────
 *
 * **Una sola cosa por proyecto**, y es el pedido entero de esta sección:
 * **`metrica: '[MÉTRICA]'`** — el dato que dice qué cambió. Es LA pieza medida
 * de esta sección: en la referencia la métrica va pegada al nombre. Acá va
 * igual de pegada y **siempre visible**; el componente no la esconde detrás de
 * ningún hover, porque esconder la métrica es esconder el pedido.
 *
 * `[CAPTURA]` ya no está: los tres archivos llegaron y `captura.fuente` los
 * nombra. El marcador vuelve solo el día que una fuente sea `null` —
 * `MarcoDeMedio` tiene las dos ramas escritas y el componente elige por el dato.
 *
 * ── Los tres `alt` ya no dicen lo mismo, y es por la misma razón ───────────
 *
 * Antes decían la misma frase con el nombre cambiado, y era la respuesta
 * honesta: no había capturas y describir tres sitios que nadie había visto
 * habría sido inventarlos. Ahora las capturas están y **cada `alt` describe lo
 * que se ve en la suya** — la marca, el rubro y lo que ocupa la pantalla— que
 * es lo que la instrucción pide: describir el SITIO, no el archivo.
 *
 * ── Los dominios son reales y se enlazan ──────────────────────────────────
 *
 * `enlace` lleva al sitio en producción de cada cliente. No estaban en el repo
 * —se buscaron en todo el árbol y en todo el historial— y los trajo el humano.
 * Van en el CONTENIDO y no en el componente por la misma razón que el `destino`
 * del CTA del Hero: es lo que cambia el día que un cliente muda de dominio.
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
      enlace: 'https://esquinaweb.com.ar',
      metrica: '[MÉTRICA]',
      captura: {
        fuente: '/capturas/esquina.webp',
        alt: 'Sitio de Esquina, un estudio de diseño: pantalla clara, casi vacía, con la marca escrita a mano arriba a la izquierda y una frase grande en el centro.',
      },
    },
    {
      nombre: 'El Garage',
      enlace: 'https://elgarageautomoviles.com.ar',
      metrica: '[MÉTRICA]',
      captura: {
        fuente: '/capturas/el-garage.webp',
        alt: 'Sitio de El Garage, una concesionaria: una camioneta sobre una ruta costera al atardecer ocupa la pantalla entera, con el nombre en letras grandes encima.',
      },
    },
    {
      nombre: 'Banú',
      enlace: 'https://banupage.com.ar',
      metrica: '[MÉTRICA]',
      captura: {
        fuente: '/capturas/banu.webp',
        alt: 'Sitio de Banú, una tienda de perfumes: fondo oscuro, un frasco de vidrio tallado iluminado en el centro y un botón para ver el catálogo.',
      },
    },
  ],
} as const

/**
 * LO QUE FALTA, dicho por el propio contenido.
 *
 * **Seis entradas, y eran doce.** V3-D cerró las seis de las capturas: las tres
 * imágenes llegaron y los tres `alt` se escribieron mirándolas, así que dejaron
 * de faltar. Una casilla que se llena **sale de esta lista** — no queda tildada,
 * desaparece— y por eso el documento que produce `s7-documento` no necesita una
 * columna de "hecho": lo que está acá es lo que falta.
 *
 * Las tres de `prosa` son la clase de relleno que **no se ve como agujero**. Un
 * `[MÉTRICA]` en la pantalla se nota; un párrafo con la cadencia correcta se lee
 * igual que uno definitivo, y ése es el mismo mecanismo de la deuda que este
 * sprint no repite, aplicado a las palabras en vez de a los números.
 *
 * Los marcadores NO se listan acá: los extrae `marcadoresPedidos()` del propio
 * contenido, que hoy devuelve `[MÉTRICA]` y nada más, con su cuenta de tres.
 * Listarlos a mano sería una segunda fuente que se desincroniza.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'titular',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'La frase que abre la sección. Una idea, una línea, dicha como la decís vos.',
    formato: 'Una línea, ~90 caracteres. Texto plano.',
  },
  {
    ruta: 'bajada',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'Qué se muestra acá y qué se promete, en dos o tres renglones. Sin plazos ni porcentajes.',
    formato: 'Dos o tres renglones, ~220 caracteres. Texto plano.',
  },
  {
    ruta: 'rotuloDeLaMetrica',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'Cómo se titula el dato que va al lado de cada nombre. Dos o tres palabras.',
    formato: 'Dos o tres palabras. Texto plano.',
  },
  {
    ruta: 'proyectos[0].metrica',
    clase: 'metrica',
    marcador: '[MÉTRICA]',
    quienLoTrae: 'franco',
    que: 'Qué cambió en Esquina, con el número que lo dice y de dónde sale.',
    formato: 'Frase corta con su número, ~30 caracteres. Ej.: `de 4 a 19 pedidos por día`.',
  },
  {
    ruta: 'proyectos[1].metrica',
    clase: 'metrica',
    marcador: '[MÉTRICA]',
    quienLoTrae: 'franco',
    que: 'Qué cambió en El Garage, con el número que lo dice y de dónde sale.',
    formato: 'Frase corta con su número, ~30 caracteres.',
  },
  {
    ruta: 'proyectos[2].metrica',
    clase: 'metrica',
    marcador: '[MÉTRICA]',
    quienLoTrae: 'franco',
    que: 'Qué cambió en Banú, con el número que lo dice y de dónde sale.',
    formato: 'Frase corta con su número, ~30 caracteres.',
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
