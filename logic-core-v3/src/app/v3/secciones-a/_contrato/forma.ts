/**
 * EL CONTRATO DE SECCIÓN — la forma que tienen las cuatro, escrita una vez.
 *
 * ── Por qué existe este archivo ────────────────────────────────────────────
 *
 * Las cuatro secciones del lane A se construyeron **en paralelo, una por
 * subagente**, y cada una escribió sólo dentro de su carpeta. Sin un contrato
 * previo, cuatro autores independientes inventan cuatro convenciones —cuatro
 * formas de declarar el alto, cuatro maneras de consumir un patrón, cuatro
 * criterios de qué es contenido y qué es geometría— y la integración deja de
 * ser un paso de diez minutos para pasar a ser un sprint.
 *
 * Este módulo, y los cuatro que lo acompañan, son ese contrato. Se escribieron
 * ANTES de despachar a nadie, y **ninguna sección los modifica**.
 *
 * ── Qué fija, en una línea cada cosa ───────────────────────────────────────
 *
 *   `forma.ts`        la FORMA: qué recibe una sección, qué expone, cómo se
 *                     declara su alto y si va pinneada.       ← este archivo
 *   `marcadores.ts`   las CONVENCIONES DE RELLENO: qué puede decir el
 *                     contenido inventado, y cómo se comprueba que lo parece.
 *   `coreografia.tsx` cómo se CONSUME un patrón de motion, y cómo se declara
 *                     la variante sin coreografía.
 *   `piezas.tsx`      la única puerta a las piezas de motion. Un solo import.
 *   `Seccion.tsx`     el envoltorio: panel, superficie, alto y pinneo.
 *   `ritmo.ts`        pantallas y momentos, como cuenta y no como prosa.
 *
 * ── La regla que ordena todo el resto ──────────────────────────────────────
 *
 * **El contenido es un DATO y vive aparte del componente.** Cada sección tiene
 * su `contenido.ts`, y reemplazar lo inventado por lo verdadero tiene que ser
 * editar esa tabla — nunca abrir un `.tsx`. Es lo que hace que el pedido a
 * Franco sea accionable: hay un archivo por sección con los agujeros a la
 * vista, y nadie tiene que leer JSX para llenarlos.
 *
 * ── Por qué este archivo se llama `forma.ts` y no `seccion.ts` ─────────────
 *
 * Se llamaba `seccion.ts`, y las cuatro secciones se rompieron con el mismo
 * defecto a la vez. Al lado vive `Seccion.tsx` —el envoltorio— y los dos
 * nombres **diferían sólo en la caja de una letra**. El sistema de archivos de
 * Windows no distingue mayúsculas, así que `'../_contrato/Seccion'` resolvía al
 * módulo de tipos: verificado en runtime, devolvía `seccionDeA` donde el
 * componente esperaba `Seccion`, y la sección se rompía **en silencio**.
 *
 * Las cuatro llegaron por su cuenta al mismo parche —escribir la extensión,
 * `'../_contrato/Seccion.tsx'`, que `allowImportingTsExtensions` permite— y las
 * cuatro lo reportaron como algo que había que arreglar afuera de su carpeta.
 * Tenían razón: un parche que hay que acordarse de aplicar en cada import nuevo
 * no es un arreglo. La fase 2 renombró el módulo, y con eso el import volvió a
 * escribirse como en todo el resto del árbol, sin extensión.
 *
 * **La regla que queda:** dos módulos del mismo directorio no pueden tener
 * nombres que difieran sólo en la caja. En un checkout case-insensitive el
 * resolvedor elige uno de los dos y no avisa cuál.
 */

import type { IdDePatron } from '../../_lib/motion/patrones'
import { seccionPorId, type Seccion } from '../../_lib/secciones'

/** Las cuatro del lane A, en el orden del recorrido. No hay una quinta. */
export const IDS_DE_SECCION_A = ['hero', 'quienes-somos', 'numeros', 'trabajos'] as const

export type IdDeSeccionA = (typeof IDS_DE_SECCION_A)[number]

/**
 * La entrada de `secciones.ts` que le corresponde a una sección del lane.
 *
 * Tira si el id no existe: el alto, la superficie y el pinneo **no se declaran
 * dos veces**. `secciones.ts` es la única tabla del recorrido, y una sección
 * que quisiera declarar su propio alto estaría creando una segunda fuente que
 * se desincroniza en el primer cambio.
 */
export function seccionDeA(id: IdDeSeccionA): Seccion {
  return seccionPorId(id)
}

/**
 * Cuántas pantallas ocupa una sección, derivado de su `alto` declarado.
 *
 * El alto viene como `"300svh"` porque es lo que se le escribe al CSS. Acá se
 * lo lee como número para la cuenta de ritmo — que es la única razón por la que
 * este proyecto necesita el valor como número y no como cadena.
 */
export function pantallasDe(seccion: Seccion): number {
  const m = /^(\d+)svh$/.exec(seccion.alto)
  if (m === null) throw new Error(`alto no declarado en svh: ${seccion.id} → ${seccion.alto}`)
  return Number.parseInt(m[1], 10) / 100
}

/**
 * Lo que recibe TODA sección del lane. Exactamente una cosa, y es su entrada de
 * la tabla del recorrido.
 *
 * Sin props de configuración a propósito: una sección que recibiera variantes
 * sería una sección que se compone desde afuera, y la composición del home es
 * un sprint posterior. Acá cada sección es un bloque cerrado.
 */
export interface PropsDeSeccion {
  readonly seccion: Seccion
}

/**
 * Lo que TODA sección expone. Es la superficie por la que la agarra la ruta de
 * demostración y por la que la agarran los instrumentos transversales.
 *
 * ⚠ `contenido` es `unknown` y no un tipo cerrado, y es deliberado: cada
 * sección tiene su propia forma de contenido —un titular no se parece a una
 * lista de proyectos— y forzarlas a una sola las aplanaría. Lo que el escáner
 * de contenido necesita no es el TIPO sino poder recorrer el objeto entero
 * buscando textos y números, y eso funciona sobre `unknown` sin que ninguna
 * sección tenga que declararle nada.
 */
export interface ModuloDeSeccion {
  readonly id: IdDeSeccionA
  /** El componente. Recibe su entrada de la tabla y nada más. */
  readonly Componente: (props: PropsDeSeccion) => React.JSX.Element
  /** El contenido, como dato. Es lo que recorre el escáner de §0.4. */
  readonly contenido: unknown
  /** Qué patrones de motion consume. Declarado, no inferido. */
  readonly patrones: readonly IdDePatron[]
  /** Los marcadores que deja pedidos, en el orden en que se ven. */
  readonly marcadores: readonly string[]
}

/** El registro de las cuatro, ordenado como el recorrido. Lo arma la ruta. */
export type RegistroDeSeccionesA = readonly ModuloDeSeccion[]

/**
 * El atributo con el que una sección se identifica en el marcado.
 *
 * Existe porque los instrumentos renderizan las cuatro a HTML y tienen que
 * poder decir cuál es cuál sin depender del texto que muestran — el texto es
 * relleno y va a cambiar; el atributo no.
 */
export const ATRIBUTO_DE_SECCION = 'data-seccion-a'
