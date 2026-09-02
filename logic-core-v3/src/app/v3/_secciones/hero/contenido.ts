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
 *   · `titular` y `slogan` — las dos frases llegaron dictadas por el sprint,
 *     con la instrucción de no cambiarlas ni mejorarlas. Son copy aprobado, no
 *     una aproximación con la cadencia correcta.
 *   · `cta.destino` — `#trabajos` es el id de la sección 04 en `secciones.ts`,
 *     o sea el único ancla de este lane que existe DE VERDAD hoy y que va a
 *     seguir existiendo cuando el home componga las ocho. Un ancla inventada
 *     —`#contacto`, `#precios`— es un enlace roto que se ve igual de bien que
 *     uno sano hasta que alguien lo clickea.
 *
 * Relleno, y por eso los dos van en `PEDIDO` con clase `prosa`: `bajada` y
 * `cta.rotulo`. Tienen la longitud y la estructura retórica que la composición
 * necesita para poder juzgarse —una promesa en dos renglones y una invitación
 * de tres palabras— y ninguno de los dos es el texto definitivo.
 *
 * ── Por qué esta sección no deja UN SOLO MARCADOR, y no es un descuido ─────
 *
 * Un marcador declara ausente un DATO que no tenemos: una cifra, una foto, un
 * testimonio, una captura. **El Hero no muestra ninguno de los cuatro.** Es una
 * frase grande, una línea de marca, dos renglones y un enlace: no hay un solo
 * lugar donde iría un dato medido.
 *
 * Lo que sí tiene de provisional son dos TEXTOS, y ésa es exactamente la otra
 * mitad del mecanismo: la prosa de relleno **no se ve como agujero** —se lee
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
   * [verdad] La línea de marca. Va arriba del titular, en el registro chico:
   * es la constante de develOP, no la promesa de esta pantalla, y ponerla del
   * mismo tamaño que el titular sería dos titulares peleándose.
   */
  slogan: 'Ingeniería para negocios reales.',

  /**
   * [verdad] El h1. Es lo primero que se lee y lo único que el visitante se
   * lleva si no scrollea. Varias líneas a propósito: es el lugar natural de P1
   * —línea por línea, el 58 % del corpus medido— y con una sola línea el patrón
   * queda sin gesto.
   */
  titular: 'Tu negocio vendiendo en piloto automático.',

  /**
   * [relleno] Dos renglones: qué hacemos y qué te queda a vos. La estructura
   * retórica es la que la composición necesita —promesa concreta, después la
   * consecuencia para quien lee— y por eso el largo importa más que las
   * palabras.
   */
  bajada:
    'Conectamos tu sitio, tu chat y tu seguimiento en un solo sistema, y lo ' +
    'dejamos andando. Vos seguís con lo que sabés hacer, que es tu negocio.',

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
 * Los marcadores NO se listan acá —los extrae `marcadoresPedidos()` del propio
 * contenido— y en esta sección la lista da cero, con la razón escrita arriba.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'bajada',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'Los dos renglones abajo del titular: qué hacemos y qué te queda a vos. Sin plazos ni porcentajes.',
    formato: 'Dos renglones, ~180 caracteres. Texto plano.',
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
