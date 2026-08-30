/**
 * QUIÉNES SOMOS — la tabla que Franco edita.
 *
 * ── Por qué este archivo no tiene un solo JSX ni un solo número ────────────
 *
 * Reemplazar lo inventado por lo verdadero tiene que ser editar ESTA tabla y
 * nada más. Si el copy viviera adentro del `.tsx`, llenar un hueco obligaría a
 * leer marcado, y el pedido dejaría de ser una lista para pasar a ser una
 * búsqueda. Por eso acá no hay componentes, no hay clases y no hay geometría:
 * la relación de aspecto de la foto, su `sizes` y cuántas columnas ocupa viven
 * en `GEOMETRIA`, dentro del componente.
 *
 * ── Qué de acá es VERDAD y qué es relleno ──────────────────────────────────
 *
 * Verdad, publicada hoy en `src/components/sections/nosotros/data.ts` del sitio
 * vivo, y por eso NO va en `PEDIDO`:
 *
 *   · `personas[0].nombre` = Franco, con `rol` "Estrategia · Comercial ·
 *     Planificación"; `personas[1].nombre` = Valentino, con `rol` "Ejecución
 *     técnica". Son las mismas dos cadenas del archivo vivo.
 *   · `lugar` = "Tucumán, Argentina" — la primera mitad de su `UBICACION`.
 *   · `etiqueta` = el nombre de la sección en el recorrido de `secciones.ts`.
 *
 * Relleno, y por eso va TODO en `PEDIDO` con clase `prosa`: `titular`,
 * `bajada`, `comoTrabajamos`, `equipo.alt`, `equipo.pie` y `rotuloDelPedido`.
 * Tienen la longitud y la estructura retórica que la composición necesita para
 * poder juzgarse —la agencia, de dónde es, cómo trabaja— y ninguna de las seis
 * es el texto definitivo.
 *
 * ── Lo que NO sabemos y por eso se declara ausente ─────────────────────────
 *
 * Qué hace CADA UNO en un proyecto concreto. El sitio vivo tampoco lo sabe: su
 * `INGENIEROS[].rol` dice `[ROL EN UN PROYECTO — 1 línea]` en los dos. Acá va
 * como `[TEXTO]`, uno por persona, del conjunto cerrado de marcadores, y se ve
 * en la pantalla al lado del rol. Un marcador visible es un pedido que no se
 * puede ignorar; una biografía inventada se publica sin que nadie se acuerde de
 * que era inventada.
 *
 * ── La única cantidad que aparece, y por qué está permitida ────────────────
 *
 * La palabra **"dos"**, en el titular y en el pie. No es un dígito —el escáner
 * de `marcadores.ts` no la ve, y no tiene por qué verla— y sobre todo **no es
 * una medición inventada**: que sean dos personas es exactamente el hecho que
 * el sprint declara verdadero. Escrita con letras y no con cifra, además, no se
 * puede leer como un dato de rendimiento ni por accidente.
 */

import type { IdDePatron } from '../../_lib/motion/patrones'
import type { EntradaDePedido } from '../_contrato/pedido'

/**
 * ⚠ Sin apóstrofos, comillas ni `&` en ninguna cadena, y es deliberado:
 * `renderToStaticMarkup` los escapa a entidades, y el invariante afirma que
 * **cada texto del contenido aparece literal en el marcado**. Con un apóstrofo
 * adentro, esa comprobación fallaría por la codificación y no por el contenido
 * —un rojo que no dice nada— o, peor, alguien la relajaría a una búsqueda
 * aproximada y dejaría de comprobar lo que dice comprobar.
 */
export const CONTENIDO = {
  /** El rótulo chico de arriba. Es el `nombre` de la sección en `secciones.ts`. */
  etiqueta: 'Quiénes somos',

  /** [verdad] Primera mitad de `UBICACION` del sitio vivo. */
  lugar: 'Tucumán, Argentina',

  /** [relleno] El h2. Dos líneas, que es el largo que P1 sabe coreografiar. */
  titular: 'Somos dos personas y las dos trabajan en tu proyecto.',

  /** [relleno] Qué es la agencia. */
  bajada:
    'develOP es una agencia chica, y eso es una decisión y no una etapa. ' +
    'No hay un ejecutivo de cuentas entre lo que pedís y quien lo construye: ' +
    'lo que hablás con nosotros es lo que se escribe.',

  /** [relleno] De dónde es y cómo trabaja. */
  comoTrabajamos:
    'Trabajamos desde Tucumán, con clientes de todo el país y en remoto. ' +
    'El relevamiento, la construcción y la entrega los hace la misma gente de ' +
    'punta a punta, así que nada se pierde en el pase de una mano a otra.',

  equipo: {
    /**
     * El pedido de la foto. Está en el CONTENIDO y no sólo en el componente
     * a propósito: `marcadoresPedidos()` recorre este objeto para producir el
     * pedido a Franco, y un marcador que sólo viviera en el `.tsx` no entraría
     * en esa lista. El componente se lo pasa a `MarcoDeMedio` desde acá.
     */
    marcador: '[FOTO DEL EQUIPO]',
    /** [relleno] Describe lo que va a haber. Va al `alt` y al nombre accesible. */
    alt: 'Franco y Valentino, juntos, en el lugar donde trabajan.',
    /** [relleno] El epígrafe. */
    pie: 'Los dos, en Tucumán. No hay un tercero al que derivarle el trabajo.',
  },

  /**
   * [relleno] El rótulo del hueco que queda al lado de cada rol. Sin él,
   * `[TEXTO]` sería un corchete suelto en la pantalla y en el lector de
   * pantalla: el marcador dice que FALTA algo, el rótulo dice QUÉ falta.
   */
  rotuloDelPedido: 'Qué hace en un proyecto',

  /**
   * [verdad] Las dos personas, con los nombres y los roles publicados hoy.
   * `enUnProyecto` es lo único que no sabemos, y va declarado ausente.
   */
  personas: [
    {
      nombre: 'Franco',
      rol: 'Estrategia · Comercial · Planificación',
      enUnProyecto: '[TEXTO]',
    },
    {
      nombre: 'Valentino',
      rol: 'Ejecución técnica',
      enUnProyecto: '[TEXTO]',
    },
  ],
} as const

/**
 * LO QUE FALTA, dicho por el propio contenido.
 *
 * Las seis entradas son `prosa`: es la clase de relleno que **no se ve como
 * agujero**. Un `[TEXTO]` en la pantalla se nota; un párrafo con la cadencia
 * correcta se lee igual que uno definitivo, y ése es el mismo mecanismo de la
 * deuda que este sprint no repite, aplicado a las palabras en vez de a los
 * números.
 *
 * Los marcadores NO se listan acá: los extrae `marcadoresPedidos()` del propio
 * contenido. Listarlos a mano sería una segunda fuente que se desincroniza.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'titular',
    clase: 'prosa',
    que: 'La frase que abre la sección. Una idea, dos líneas, dicha como la decís vos.',
  },
  {
    ruta: 'bajada',
    clase: 'prosa',
    que: 'Qué es develOP, en tres o cuatro renglones. Sin plazos ni porcentajes.',
  },
  {
    ruta: 'comoTrabajamos',
    clase: 'prosa',
    que: 'Cómo trabajan: desde dónde, con quién y con qué forma. Mismo largo.',
  },
  {
    ruta: 'equipo.alt',
    clase: 'prosa',
    que: 'Qué se ve en la foto del equipo, para quien no la puede ver.',
  },
  {
    ruta: 'equipo.pie',
    clase: 'prosa',
    que: 'El epígrafe de la foto. Un renglón.',
  },
  {
    ruta: 'rotuloDelPedido',
    clase: 'prosa',
    que: 'Cómo se titula la línea que describe a cada uno dentro de un proyecto.',
  },
]

/**
 * LOS PATRONES QUE ESTA SECCIÓN CONSUME — declarados, no inferidos.
 *
 * `P1` para el titular (línea por línea, el 58 % del corpus medido) y `P2` para
 * los cinco bloques de cuerpo (bloque entero, sube desde media altura propia).
 * No hay un tercero: la sección es texto y una foto, y los siete patrones
 * restantes mueven objetos, planos o listas que acá no existen.
 */
export const PATRONES_DE_LA_SECCION: readonly IdDePatron[] = ['P1', 'P2']
