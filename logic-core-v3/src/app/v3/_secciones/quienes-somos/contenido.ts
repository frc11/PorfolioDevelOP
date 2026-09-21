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
 *     ⚠️ B12: se retiró de `CONTENIDO` — ver `ROTULO_DE_SECCION_RETIRADO`.
 *
 * Relleno, y por eso va TODO en `PEDIDO` con clase `prosa`: `titular`,
 * `bajada`, `comoTrabajamos`, `equipo.alt` y `rotuloDelPedido`. [El epígrafe de la
 * foto se fue en BANDA-4: lo reemplazó el título del bloque, que no es relleno.]
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
/**
 * ⚠️ **B12 · EL RÓTULO DE SECCIÓN, RETIRADO.** Era `CONTENIDO.etiqueta` y se
 * renderizaba arriba del título, en micro. El humano pidió sacarlo en las ocho
 * («directamente llega el título con su respectiva sección»), así que la cadena
 * SALE de `CONTENIDO` —donde `textosDe` la contaba como texto que tiene que
 * llegar a pantalla— y queda acá, exportada, para que el invariante afirme su
 * AUSENCIA sin escribir la cadena a mano. No se borra: se da vuelta.
 */
export const ROTULO_DE_SECCION_RETIRADO = 'Quiénes somos'

/**
 * LOS TRAMOS DEL TITULAR, AGRUPADOS POR RENGLÓN. Dos llevan raya —`subrayado` y
 * `tachado`— y el resto es el texto que los une.
 *
 * ⚠️ **El corte pasó a ser DECLARADO, y no cambia dónde cae.** La máscara del
 * titular es ahora por renglón —cada uno sale de SU línea, no del piso del
 * bloque— y para eso cada renglón tiene que ser su propio elemento: una caja que
 * recorta no puede adivinar dónde el navegador va a partir una sola cadena. El
 * corte declarado cae exactamente donde caía el natural, porque la caja del
 * titular se mide en `ch` y el `ch` escala con la letra: la proporción entre la
 * frase y su caja es la misma a cualquier ancho, así que la partición ya era la
 * misma en todos lados. Lo que se gana es que ahora P1 puede escalonar los dos.
 *
 * Va AFUERA de `CONTENIDO` a propósito: `textosDe` lo contaría como varios
 * textos y `CONTENIDO.titular` —que es el que el pedido nombra y el que tiene
 * que leerse entero— se arma abajo concatenándolos, así que la frase y sus
 * tramos no pueden desincronizarse.
 */
export const TRAMOS_DEL_TITULAR = [
  { antes: 'Queremos hacer', marcado: 'algo distinto', tipo: 'subrayado', cierre: ',' },
  { antes: 'no', marcado: 'lo mismo de siempre', tipo: 'tachado', cierre: '' },
] as const

/**
 * LOS MISMOS RENGLONES, PARTIDOS EN CUATRO — hasta la banda de tablet.
 *
 * ── ⚠️ EL TACHADO CAMBIA DE ALCANCE, Y ES EL MOTIVO DEL SPRINT ────────────
 *
 * Arriba tacha «lo mismo de siempre», que en dos renglones entra en uno. Acá la
 * frase ocupa dos —«no lo mismo» y «de siempre»— y un tachado partido en dos
 * renglones **no se lee como un tachado: se lee como un defecto de render**. Así
 * que tacha SÓLO «de siempre». El subrayado no se mueve: «algo distinto» sigue
 * entrando entero en su renglón.
 *
 * ── Por qué son cuatro entradas y no un `<br>` ────────────────────────────
 *
 * Porque el corte está atado a la BANDA y no al texto. Un `<br>` en el contenido
 * cortaría igual en los ocho anchos y volvería irreversible una decisión de
 * composición; cuatro entradas son cuatro renglones que la banda muestra o
 * esconde, y arriba de ella siguen siendo dos.
 *
 * ⚠️ `tipo: null` es un renglón SIN marca. La frase se reparte entre los cuatro y
 * dos de ellos no llevan trazo: sin el `null` habría que inventar un trazo vacío,
 * que es un elemento que existe para no hacer nada.
 */
export const TRAMOS_DEL_TITULAR_EN_LA_BANDA = [
  { antes: 'Queremos hacer', marcado: '', tipo: null, cierre: '' },
  { antes: '', marcado: 'algo distinto', tipo: 'subrayado', cierre: ',' },
  { antes: 'no lo mismo', marcado: '', tipo: null, cierre: '' },
  { antes: '', marcado: 'de siempre', tipo: 'tachado', cierre: '' },
] as const

export const CONTENIDO = {
  /** [relleno] El h2, armado con sus renglones: es el nombre accesible de la sección. */
  titular: TRAMOS_DEL_TITULAR.map((r) => `${r.antes} ${r.marcado}${r.cierre}`).join(' '),

  /** [relleno] Qué es la agencia. */
  bajada:
    'develOP es una agencia de software innovadora que viene a plantar bandera ' +
    'en el marco de la innovación. Estamos cansados de las mismas páginas de ' +
    'siempre, los mismos productos sencillos. Nuestro estándar apunta a ' +
    'acercarse a la perfección de un producto.',

  /** [relleno] El rótulo del bloque, en tipografía gigante: su tamaño sale del ancho. */
  tituloDelEquipo: 'El equipo',

  /**
   * [verdad los nombres] Las dos personas. Cada una pide DOS tomas —la seria,
   * que es la de reposo, y la descontracturada, que entra en el hover— y por eso
   * hay dos leyendas distintas: con la misma se vería el intercambio como un
   * parpadeo y no se podría afirmar que cambió la imagen.
   */
  personas: [
    {
      nombre: 'Franco',
      /** [verdad] El mismo rol que publica el sitio vivo. Vuelve como primera parte del hover. */
      rol: 'Estrategia · Comercial · Planificación',
      seria: { marcador: '[FOTO]', leyenda: 'Franco, retrato serio' },
      suelta: { marcador: '[FOTO]', leyenda: 'Franco, retrato descontracturado' },
      /** [relleno] Lo que se lee sobre la foto en el hover, después del puesto. */
      descripcion: 'Enfocado, creativo, perfeccionista. Encargado de toda la estructura de develOP.',
    },
    {
      nombre: 'Valentino',
      /** [verdad] El mismo rol que publica el sitio vivo. Vuelve como primera parte del hover. */
      rol: 'Ejecución técnica',
      seria: { marcador: '[FOTO]', leyenda: 'Valentino, retrato serio' },
      suelta: { marcador: '[FOTO]', leyenda: 'Valentino, retrato descontracturado' },
      /** [relleno] Lo que se lee sobre la foto en el hover, después del puesto. */
      descripcion: 'Obsesivo, curioso, inconformista. Escribe el sistema, lo pone a andar y lo mantiene.',
    },
  ],

  equipo: {
    /**
     * El pedido de la foto. Está en el CONTENIDO y no sólo en el componente
     * a propósito: `marcadoresPedidos()` recorre este objeto para producir el
     * pedido a Franco, y un marcador que sólo viviera en el `.tsx` no entraría
     * en esa lista. El componente se lo pasa a `MarcoDeMedio` desde acá.
     */
    seria: { marcador: '[FOTO DEL EQUIPO]', leyenda: 'Franco y Valentino, juntos, en el lugar donde trabajan' },
    suelta: { marcador: '[FOTO]', leyenda: 'Franco y Valentino, fuera del estudio' },
    /**
     * ⚠️ **B12 §4.3 · EL PLACEHOLDER, no la foto.** Es un archivo PROPIO
     * —generado por `scripts-b12/placeholders.ts`, rayado y grano en escala de
     * grises— con la relación de aspecto y el peso de una foto de verdad, para
     * que la composición y la carga se puedan juzgar. Se ve como lo que es y el
     * marcador sigue escrito encima. El día de la foto, esta ruta cambia y
     * `provisional` se va. Ninguna imagen de terceros: regla 6.
     *
     * Lo comparten los SEIS huecos: el archivo es el mismo rayado y lo que
     * distingue a cada toma es su leyenda.
     */
    fuente: '/placeholders/equipo.png',
    /** [relleno] Lo que se lee sobre la foto en el hover. */
    descripcion:
      'Nos conocimos en el colegio. Siempre tuvimos el sueño de estudiar esta ' +
      'carrera y, ya con oficio, decidimos emprender juntos.',
    /**
     * ⚠️ **SE FUE EL EPÍGRAFE Y ENTRÓ UN TÍTULO.** Era «Franco y Valentino, el
     * equipo detrás de esta agencia.», un renglón debajo de la foto que decía en
     * prosa lo que la foto ya muestra y lo que la descripción cuenta mejor. Ahora
     * el bloque abre con un título y la descripción hace de epígrafe en la banda
     * móvil y de revelado de 426 para arriba: una sola pieza de texto en vez de
     * dos que se repetían.
     *
     * [verdad] No es relleno: es el nombre del bloque.
     */
    titulo: 'Nosotros',
  },
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
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'La frase que abre la sección. Una idea, dos líneas, dicha como la decís vos.',
    formato: 'Dos líneas, ~110 caracteres. Texto plano.',
  },
  {
    ruta: 'bajada',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'Qué es develOP, en tres o cuatro renglones. Sin plazos ni porcentajes.',
    formato: 'Tres o cuatro renglones, ~280 caracteres. Texto plano.',
  },
  {
    ruta: 'tituloDelEquipo',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'Cómo se titula el bloque del equipo. Va en tipografía gigante, así que dos palabras cortas.',
    formato: 'Dos palabras. Texto plano.',
  },
  {
    ruta: 'personas[0].seria.marcador',
    clase: 'foto',
    marcador: '[FOTO]',
    quienLoTrae: 'franco',
    que: 'El retrato SERIO de Franco: es el que se ve en reposo.',
    formato: 'JPG o WEBP, 1800 × 1200 px (3:2), horizontal.',
  },
  {
    ruta: 'personas[0].suelta.marcador',
    clase: 'foto',
    marcador: '[FOTO]',
    quienLoTrae: 'franco',
    que: 'El retrato DESCONTRACTURADO de Franco: aparece al pasar el mouse, encima del serio.',
    formato: 'JPG o WEBP, 1800 × 1200 px (3:2), horizontal. Mismo encuadre que el serio.',
  },
  {
    ruta: 'personas[0].descripcion',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'franco',
    que: 'Cómo es Franco y de qué se ocupa. Se lee sobre la foto, así que corto.',
    formato: 'Una o dos frases, ~90 caracteres. Texto plano.',
  },
  {
    ruta: 'personas[1].seria.marcador',
    clase: 'foto',
    marcador: '[FOTO]',
    quienLoTrae: 'valentino',
    que: 'El retrato SERIO de Valentino: es el que se ve en reposo.',
    formato: 'JPG o WEBP, 1800 × 1200 px (3:2), horizontal.',
  },
  {
    ruta: 'personas[1].suelta.marcador',
    clase: 'foto',
    marcador: '[FOTO]',
    quienLoTrae: 'valentino',
    que: 'El retrato DESCONTRACTURADO de Valentino: aparece al pasar el mouse, encima del serio.',
    formato: 'JPG o WEBP, 1800 × 1200 px (3:2), horizontal. Mismo encuadre que el serio.',
  },
  {
    ruta: 'personas[1].descripcion',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'Cómo es Valentino y de qué se ocupa. Se lee sobre la foto, así que corto.',
    formato: 'Una o dos frases, ~90 caracteres. Texto plano.',
  },
  {
    ruta: 'equipo.seria.marcador',
    clase: 'foto',
    marcador: '[FOTO DEL EQUIPO]',
    quienLoTrae: 'valentino',
    que: 'La foto de los dos, en el lugar donde trabajan. Es la que se ve en reposo.',
    formato: 'JPG o WEBP, 1800 × 1200 px (3:2), horizontal. Se reemplaza poniendo la ruta en `equipo.fuente`.',
  },
  {
    ruta: 'equipo.suelta.marcador',
    clase: 'foto',
    marcador: '[FOTO]',
    quienLoTrae: 'valentino',
    que: 'La foto de los dos DESCONTRACTURADA: aparece al pasar el mouse, encima de la seria.',
    formato: 'JPG o WEBP, 1800 × 1200 px (3:2), horizontal. Mismo encuadre que la seria.',
  },
  {
    ruta: 'equipo.descripcion',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'Cómo empezó el equipo. Se lee sobre la foto, así que corto.',
    formato: 'Dos o tres frases, ~150 caracteres. Texto plano.',
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
