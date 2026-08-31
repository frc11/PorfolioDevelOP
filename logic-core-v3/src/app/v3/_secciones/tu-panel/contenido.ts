/**
 * EL CONTENIDO DE «TU PANEL» — como DATO, con sus marcadores.
 *
 * ── Por qué el contenido no está adentro del JSX ──────────────────────────
 *
 * Porque es lo que Franco tiene que reemplazar, y lo que un instrumento tiene
 * que poder contar. Un párrafo escrito adentro de un componente no se puede
 * listar, no se puede contar y no se puede comparar contra el marcado que
 * termina en pantalla. Acá está una vez, tipado, y el componente lo recorre.
 *
 * ── Qué es relleno y qué no ───────────────────────────────────────────────
 *
 * El relleno de este archivo tiene la LONGITUD y la ESTRUCTURA RETÓRICA que la
 * composición necesita: es para juzgar cómo cae el texto en la pantalla, no
 * para leerlo como definitivo. Lo que **no** es relleno son los tres nombres
 * —Esquina, El Garage, Matsu Automotores—, que son clientes reales y por eso se
 * pueden escribir, y la descripción del hueco, que es el pedido literal.
 *
 * **Ningún número.** Ni uno que se pueda leer como un hecho, ni un precio, ni
 * de ejemplo: los precios de develOP no están cerrados. Donde haría falta una
 * prueba va un marcador del vocabulario de `_contrato/escaneo.ts`, y el
 * invariante corre el escáner del contrato sobre el texto RENDERIZADO, así que
 * el origen del texto no lo salva.
 */

import { sizesPorColumnas } from '../../_lib/imagen'
import type { Marcador } from '../_contrato/marcadores'
import type { EntradaDePedido } from '../_contrato/pedido'

export const ID = 'tu-panel'

/** El nombre visible del rótulo. Es contenido, no el id. */
export const NOMBRE = 'Tu panel'

/**
 * CUÁNTAS PANTALLAS OCUPA LA SECCIÓN — dos, y son dos TIEMPOS, no un relleno.
 *
 * El primero presenta el panel: rótulo, titular y la captura grande con los
 * bloques al costado. El segundo es la lista de capacidades, que necesita aire
 * propio porque su patrón (P4) tiene el ancla más larga del sistema —`top
 * bottom` → `bottom top`, o sea el alto del bloque MÁS un viewport entero— y
 * apretada contra la captura entraría casi entera antes de verse.
 *
 * Cada tiempo declara `min-h-svh` en el marcado, así que este número no es una
 * intención: el invariante lo cuenta en el HTML renderizado.
 *
 * ⚠️ `_lib/secciones.ts` —que escribe el LANE A y este lane no toca— declara
 * hoy `100svh` para esta sección. El invariante publica el delta.
 */
export const PANTALLAS_DE_LA_SECCION = 2

/**
 * EL TITULAR — P1, línea por línea.
 *
 * Dos líneas a 1440 con `titulo-l`; tres o cuatro abajo de tablet. P1 mide
 * entre 1 y 6 líneas por bloque en la referencia, así que la banda entra holgada
 * en los dos extremos y el divisor no queda ni con una línea sola ni con siete.
 */
export const TITULAR =
  'Cada proyecto viene con su panel: la misma pantalla que miramos nosotros, abierta para quien lo contrató.'

export interface BloqueDeTexto {
  /** El rótulo del bloque. Va como encabezado, no como decoración. */
  readonly rotulo: string
  readonly texto: string
}

/**
 * LOS BLOQUES — P2, un target por bloque.
 *
 * Tres, y el orden es el de las tres preguntas que alguien se hace mirando una
 * captura de algo que todavía no usó: qué es, qué hay adentro, quién entra.
 */
export const BLOQUES: readonly BloqueDeTexto[] = [
  {
    rotulo: 'Qué es',
    texto:
      'Un tablero por proyecto, con acceso propio. No es un informe que llega por mail y queda viejo a la semana: ' +
      'es el mismo sistema que corre el trabajo, mostrando lo que hay ahora. Si algo cambió hace un rato, ahí está.',
  },
  {
    rotulo: 'Qué se ve adentro',
    texto:
      'El avance de cada entrega y qué falta para cerrarla. Los pedidos abiertos, con quién los tomó y cuándo. ' +
      'Las conversaciones que atendió el asistente, enteras. La facturación del proyecto, comprobante por ' +
      'comprobante. Y cada dato con su fecha: [MÉTRICA] al día, [CIFRA] acumulada.',
  },
  {
    rotulo: 'Quién entra',
    texto:
      'Un usuario por persona del equipo, y cada uno ve lo que le toca. Los datos de El Garage no se cruzan con ' +
      'los de Esquina ni con los de Matsu Automotores: son organizaciones separadas, no un filtro sobre la misma ' +
      'pantalla.',
  },
]

/** El encabezado del segundo tiempo. */
export const TITULO_DE_CAPACIDADES = 'Qué se hace ahí adentro'

/**
 * LAS CAPACIDADES — P4, la lista frenada, ítem por ítem.
 *
 * Once, que es exactamente la cantidad medida del patrón en la referencia
 * (`piezas: { min: 11, max: 11, nota: 'once li' }`). No es una coincidencia
 * buscada: son las once cosas que una persona hace ahí adentro, y da la
 * casualidad de que el escalonado ya está medido para once. Si mañana son
 * nueve, el cronograma se recalcula solo —`especificacionDe(P4, CAPACIDADES.length)`—
 * y el invariante cuenta los `<li>` que haya.
 *
 * Cada una arranca con un verbo: es lo que se HACE, no lo que el panel "ofrece".
 */
export const CAPACIDADES: readonly string[] = [
  'Seguir el avance de una entrega sin preguntar por dónde va.',
  'Abrir un pedido y verlo pasar de pendiente a cerrado.',
  'Leer una conversación del asistente entera, con lo que respondió.',
  'Corregir una respuesta del asistente y que quede corregida.',
  'Bajar los contactos que dejó el formulario, con su origen.',
  'Ver qué campaña trajo cada visita y cuál no trajo ninguna.',
  'Revisar la facturación del proyecto, comprobante por comprobante.',
  'Sumar a alguien del equipo y elegir qué parte del panel ve.',
  'Editar textos, fotos y fichas del sitio sin pedir una publicación.',
  'Exportar lo que hay en pantalla para llevarlo a otra herramienta.',
  'Mirar [MÉTRICA] de la semana al lado de la del período anterior.',
]

/**
 * LA CAPTURA — el hueco, no una imagen.
 *
 * **No hay archivo.** `next/image` con un `src` que no existe compila perfecto y
 * en el navegador da una imagen rota: un artefacto falso que además pasa el
 * build. El hueco reserva la caja, declara el `sizes` real y deja el pedido
 * escrito. El reemplazo es una línea.
 *
 * ── El `sizes` se COMPONE, no se escribe ──────────────────────────────────
 *
 * `sizesPorColumnas(3, 5)` describe exactamente la geometría de esta caja: en la
 * grilla de cinco columnas la captura ocupa tres, y **la grilla de cinco no
 * existe abajo de 1025** —es la firma estructural del breakpoint, cero
 * apariciones a 768 y a 1024— así que abajo del umbral la captura ocupa el ancho
 * entero. Ésas son las dos ramas que emite el ayudante, y ninguna la escribí yo:
 * el `1025` sale de `ESCENARIO_MIN_ANCHO_PX`, que ya está atado por invariante a
 * `--breakpoint-escritorio`.
 *
 * ── La relación de aspecto va en `style` y no en una clase ────────────────
 *
 * Porque el valor viene del DATO. Una clase armada como `aspect-[${relacion}]`
 * **no la ve el escáner de Tailwind** —que lee el código fuente, no lo que el
 * código produce— y su regla no se emitiría nunca: quedaría el atributo en el
 * HTML, sin error en consola, y la caja sin relación. Es la misma excepción que
 * `Panel` declara para su `min-height`, y `HuecoDeMedio` la implementa.
 * `16 / 9` es la proporción de la pantalla en la que se saca la captura.
 */
export const COLUMNAS_DE_LA_CAPTURA = 3
export const COLUMNAS_DE_LA_GRILLA = 5
/**
 * 1920 × 1080: la proporción de la pantalla en la que se saca la captura, y
 * además el ANCHO que hay que pedir.
 *
 * Era la cadena `'16 / 9'`. El marco de medio unificado toma los dos números en
 * vez de la razón, y no es un detalle de firma: `1920 × 1080` es lo que se le
 * pide a quien saque la captura, y `16 / 9` no lo dice.
 */
export const ANCHO_DE_LA_CAPTURA = 1920
export const ALTO_DE_LA_CAPTURA = 1080
export const MARCADOR_DE_LA_CAPTURA: Marcador = '[CAPTURA DEL PANEL]'

export const CAPTURA = {
  marcador: MARCADOR_DE_LA_CAPTURA,
  ancho: ANCHO_DE_LA_CAPTURA,
  alto: ALTO_DE_LA_CAPTURA,
  sizes: sizesPorColumnas(COLUMNAS_DE_LA_CAPTURA, COLUMNAS_DE_LA_GRILLA),
  descripcion:
    'Pantalla principal del panel de un cliente, a ancho completo, con el estado de las entregas y el resumen ' +
    'de la semana. Con datos de muestra: ningún dato real de un cliente.',
} as const

/**
 * EL PEDIDO — lo que falta en esta sección, con su formato.
 *
 * Se agrega en SITIO-S7: el lane que escribió la sección declaraba lo
 * provisional en prosa y con marcadores visibles, pero **el pedido no era un
 * dato**, así que no se podía producir un documento con él ni comprobar que no
 * se quedara viejo. `s7-pedido` cruza esta tabla contra el texto renderizado en
 * los dos sentidos: un marcador en pantalla sin entrada acá falla, y una
 * entrada que pide algo que ya no se ve, también.
 *
 * El archivo donde se edita NO se escribe acá: sale del registro.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'BLOQUES[2].texto',
    clase: 'metrica',
    marcador: '[MÉTRICA]',
    que: 'Qué muestra el panel al día: el dato que se mira todos los días.',
    formato: 'Nombre del dato, sin número. Ej.: `consultas del día`.',
  },
  {
    ruta: 'BLOQUES[2].texto',
    clase: 'cifra',
    marcador: '[CIFRA]',
    que: 'El dato acumulado que el panel muestra al lado del diario.',
    formato: 'Nombre del dato acumulado, sin número.',
  },
  {
    ruta: 'CAPACIDADES[…]',
    clase: 'metrica',
    marcador: '[MÉTRICA]',
    que: 'Qué se compara semana contra semana en el panel.',
    formato: 'Nombre del dato comparado, sin número.',
  },
  {
    ruta: 'CAPTURA',
    clase: 'captura',
    marcador: '[CAPTURA DEL PANEL]',
    que:
      'La pantalla principal del panel de un cliente, con el estado de las entregas y el ' +
      'resumen de la semana. Con datos de muestra: ningún dato real de un cliente.',
    formato: 'PNG o WEBP, 1920 × 1080 px (16:9). Se pone la ruta en `CAPTURA.fuente`.',
  },
]
