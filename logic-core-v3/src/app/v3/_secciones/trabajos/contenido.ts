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
 *     ⚠️ B12: se retiró de `CONTENIDO` — ver `ROTULO_DE_SECCION_RETIRADO`.
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
 * **Tres cosas por proyecto**, y son el pedido entero de esta sección: el
 * **logo**, la **captura** y el **rubro**. Las tres van con marcador visible y
 * las tres están en `PEDIDO` con su formato y su dueño.
 *
 * `[MÉTRICA]` ya NO está: era «qué cambió» y se cerró por la puerta de adelante
 * —no hay nada medible en estos tres trabajos y no lo va a haber—. El que se
 * abrió en su lugar es `[TEXTO]`, el rubro, y por una razón distinta: **eso sí
 * se puede saber, sólo que no lo sabemos nosotros.** Un pedido que se puede
 * cumplir no es lo mismo que uno que no.
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
/**
 * ⚠️ **B12 · EL RÓTULO DE SECCIÓN, RETIRADO.** Era `CONTENIDO.etiqueta` y se
 * renderizaba arriba del título, en micro. El humano pidió sacarlo en las ocho
 * («directamente llega el título con su respectiva sección»), así que la cadena
 * SALE de `CONTENIDO` —donde `textosDe` la contaba como texto que tiene que
 * llegar a pantalla— y queda acá, exportada, para que el invariante afirme su
 * AUSENCIA sin escribir la cadena a mano. No se borra: se da vuelta.
 */
export const ROTULO_DE_SECCION_RETIRADO = 'Trabajos'

export const CONTENIDO = {
  /** El h2. Una palabra: la sección se nombra a sí misma. */
  titular: 'Portfolio',

  /** Qué se está mirando. */
  bajada:
    'Cada uno de estos proyectos se pensó desde cero para el negocio que lo ' +
    'iba a usar. Acá abajo no hay plantillas.',

  /**
   * ⚠️ **LA MÉTRICA SE FUE, Y CON ELLA SU RÓTULO (PORTFOLIO).** Eran una
   * pastilla al lado de cada nombre —«Lo que cambió · [MÉTRICA]»— y el pedido
   * que las sostenía se cerró por la puerta de adelante: **no hay nada medible
   * y no lo va a haber.** Se fueron las dos puntas, no una: la casilla de acá y
   * su entrada en `INVENTOS`, para que no quede una mentira declarada que nadie
   * consume. Lo que queda al lado del nombre es el nombre.
   */

  /**
   * [verdad] Los tres, en el orden en que entran. Tres es la cantidad que el
   * patrón anima —`piezas={3}` en el componente— y la cantidad de clientes que
   * el sprint declara verdaderos. No hay un cuarto de relleno: un cliente
   * inventado en una vitrina es exactamente la deuda que este sprint no repite.
   *
   * Cada uno declara DOS medios —la marca y el sitio— y DOS textos: el nombre,
   * que es verdad y va literal, y el RUBRO, que no lo sabemos.
   *
   * ⚠️ **El rubro entra como PEDIDO y no como dato.** La zona central del tramo
   * tiene cuatro ranuras y una es para «qué hace este cliente». Escribir
   * «Automotriz» o «Perfumería» sería inventar un hecho sobre un cliente REAL,
   * que es justo lo que la cabecera de este archivo prohibe con todas las letras
   * («sin agregarles rubro, ciudad ni fecha: todo eso lo tendríamos que
   * inventar»). Así que la ranura muestra `[TEXTO]` —marcador que ya estaba en el
   * conjunto cerrado de `marcadores.ts`, no hubo que abrirlo— y el dato se pide.
   * **No hay una entrada nueva en INVENTOS**: un pedido no es una mentira.
   */
  /**
   * [verdad] Los tres, en el orden en que entran. Cada uno trae CUATRO cosas y
   * las cuatro son reales: el nombre, el rubro, el logo y la captura del sitio.
   *
   * ⚠️ **Los rubros los dictó el dueño y por eso NO son un invento.** Se
   * escribieron desde los hechos que dijo, sin adornar y sin agregar nada que no
   * estuviera ahí. No van a `INVENTOS` —esa lista es para cifras falsas— ni a
   * `PEDIDO`: un dato que llegó sale de la lista de lo que falta.
   *
   * ⚠️ **Acá va la RUTA y el texto alternativo; las medidas NO.** Los tres logos
   * tienen relaciones distintas y hay que conocerlas para que entren sin
   * deformarse, pero un ancho y un alto son geometría y este archivo no lleva un
   * solo número —`s5-contenido` lo afirma seccion por sección—. Viven en
   * `MEDIDAS_DE_LOS_MEDIOS`, en `geometria.ts`, que es donde el propio docblock
   * de arriba dice que viven la relación de aspecto y el `sizes`.
   */
  proyectos: [
    {
      nombre: 'El Garage',
      enlace: 'https://elgarageautomoviles.com.ar',
      rubro: 'Concesionaria con un catálogo de muchos filtros.',
      logo: { fuente: '/logos/ElGarageLogo-Modificado.png', alt: 'Logo de El Garage' },
      pagina: { fuente: '/capturas/el-garage.webp', alt: 'La página de El Garage' },
    },
    {
      nombre: 'Banú Scents',
      enlace: 'https://banuscents.com.ar',
      rubro: 'Vende perfumes árabes. Le hicimos una página simple pero bonita.',
      logo: { fuente: '/logos/logoC.png', alt: 'Logo de Banú Scents' },
      pagina: { fuente: '/capturas/banu.webp', alt: 'La página de Banú Scents' },
    },
    {
      nombre: 'Esquina Estudio',
      enlace: 'https://esquinaestudio.com.ar',
      rubro: 'Equipo de branding. Le hicimos una página acorde a su estética y su marca.',
      logo: { fuente: '/logos/logo-header-blanco.png', alt: 'Logo de Esquina Estudio' },
      pagina: { fuente: '/capturas/esquina.webp', alt: 'La página de Esquina Estudio' },
    },
  ],
} as const

/**
 * LO QUE FALTA, dicho por el propio contenido.
 *
 * Una casilla que se llena **sale de esta lista** — no queda tildada,
 * desaparece— y por eso el documento que produce `s7-documento` no necesita una
 * columna de "hecho": lo que está acá es lo que falta.
 *
 * Las de `prosa` son la clase de relleno que **no se ve como agujero**. Un
 * `[MÉTRICA]` en la pantalla se nota; un párrafo con la cadencia correcta se lee
 * igual que uno definitivo, y ése es el mismo mecanismo de la deuda que este
 * sprint no repite, aplicado a las palabras en vez de a los números.
 *
 * Los marcadores NO se listan acá: los extrae `marcadoresPedidos()` del propio
 * contenido.
 */
/**
 * ⚠️ **VACÍO, Y ES EL PUNTO.** «Una casilla que se llena SALE de esta lista — no
 * queda tildada, desaparece», dice el bloque de arriba. Esta sección tenía nueve
 * casillas: seis medios y tres rubros. Llegaron los seis archivos
 * (`public/capturas/` y `public/logos/`) y el dueño dictó los tres rubros, así
 * que no queda ninguna. La lista vacía no es un descuido: es lo que dice que
 * Trabajos ya no le debe nada a nadie.
 */
export const PEDIDO: readonly EntradaDePedido[] = []


/**
 * LOS PATRONES QUE ESTA SECCIÓN CONSUME — declarados, no inferidos.
 *
 * **P7** —planos en profundidad— anima los tres proyectos en un único bloque, y
 * **P2** posa el marco (etiqueta, número, titular y bajada) una sola vez,
 * mientras la sección todavía está entrando.
 *
 * ── ⚠️ DECÍA `['P7']` Y LA SECCIÓN CONSUMÍA DOS. Se sincroniza acá ────────
 *
 * La razón escrita era que *el encabezado NO se anima: es el marco quieto contra
 * el que se lee el vuelo*, **y esa razón sigue en pie y no cambió**: el ancla de
 * P2 sobre la caja del marco cierra ANTES de que el pin arranque, así que
 * durante las dos pantallas pinneadas —que es cuando los planos vuelan— el marco
 * no se mueve un píxel. Lo que cambió en B2 es que ahora ENTRA, y por eso la
 * sección tiene un aterrizaje en su primera pantalla y media, donde antes no
 * tenía ninguno.
 *
 * B2 midió la desincronización y **no la arregló, con la razón correcta**: no
 * podía escribir en `contenido.ts`. La publicó desde `trabajos.invariant` §14,
 * afirmando por separado lo que la tabla decía y lo que el fuente consumía. Con
 * la tabla al día esas dos publicaciones vuelven a ser UNA afirmación de
 * igualdad.
 */
// ⚠️ DOS, y P2 se fue. El vocabulario del tramo pasó a ser el de `tunel.ts`
// —nacer y crecer desde una esquina, huir en z— así que ni el cartel ni los
// nombres llegan ya por un patrón del sistema. Queda P3, que pinta el cuerpo de
// la bajada palabra por palabra, y P7, que es el patrón del BLOQUE: de ahí sale
// la perspectiva de la cámara, que es lo que hace visible la huida.
export const PATRONES_DE_LA_SECCION: readonly IdDePatron[] = ['P3', 'P7']
