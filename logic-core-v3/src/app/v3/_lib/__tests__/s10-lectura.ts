/**
 * LOS EXTRACTORES — las cuatro preguntas del sprint, sobre el recorrido.
 *
 * Sale de `s10-recorrido.ts` cuando el archivo cruzó las 300 líneas. La
 * partición no es de conveniencia y tiene una costura real: **`s10-recorrido.ts`
 * no sabe nada de este sprint** —es un lector de marcado que cuenta anidamiento
 * y devuelve nodos— y este archivo no sabe leer marcado: consume nodos y
 * contesta las preguntas de SITIO-S10. Cambiar una pregunta no toca el lector, y
 * arreglar el lector no toca las preguntas.
 *
 * Las cuatro extracciones son las que el sprint pide del banco compartido:
 * **cajas de texto, encabezados, elementos enfocables y el orden del
 * documento**, más los landmarks, que son de los que el frente de accesibilidad
 * tiene que decir si están.
 */

import {
  atributo,
  nodosDe,
  textoDe,
  tieneAtributo,
  type Nodo,
} from './s10-recorrido'
import { ATRIBUTO_DE_SECCION } from '../../_secciones/_contrato/forma'
import { NIVELES_TIPOGRAFICOS } from '../tipografia'

/** Una caja de texto: un elemento con nivel tipográfico, y cómo se supo cuál. */
export interface CajaDeTexto {
  readonly nodo: Nodo
  readonly nivel: string
  readonly clases: string
  readonly texto: string
  /** `atributo` = lo dijo `data-nivel`; `clase` = se dedujo de la utilidad de tamaño. */
  readonly via: 'atributo' | 'clase'
}

/** Qué nivel declara una utilidad de tamaño. Se deriva de la tabla, no se lista. */
const NIVEL_POR_CLASE: ReadonlyMap<string, string> = new Map(
  Object.entries(NIVELES_TIPOGRAFICOS).flatMap(([nivel, d]) =>
    d.claseFluida === null ? [[d.claseFija, nivel]] : [[d.claseFija, nivel], [d.claseFluida, nivel]],
  ),
)

/**
 * LAS CAJAS DE TEXTO del marcado.
 *
 * La vía principal es **`data-nivel`**, que es el atributo que los componentes de
 * tipografía emiten: hace comparable una caja de una sección con una de otra sin
 * depender de sus clases.
 *
 * ⚠ **Y NO ALCANZA, Y LO ENCONTRÓ EL FRENTE DEL LOGO EN SITIO-S10.** El titular
 * del Hero no sale por `<Titular>`: sale por `TextoPorLineas`
 * (`_secciones/_contrato/canales.tsx`), que en la rama quieta emite
 * `<h1 data-texto-por-lineas="entero" class="…">` **sin `data-nivel`**. O sea que
 * el extractor no veía **la caja más grande de la sección más importante**, y
 * devolvía una lista que se leía completa. Ésa es exactamente la clase de defecto
 * que este repo caza: no un error, una AUSENCIA que parece un resultado.
 *
 * El arreglo no es agregar el atributo al producto —eso sería tocar composición
 * en un sprint de medición— sino **deducir el nivel de la utilidad de tamaño**,
 * que el propio sistema declara en `NIVELES_TIPOGRAFICOS` y que
 * `TextoPorLineas` exige como obligatoria en su prop `className`. Cada caja dice
 * por qué vía se supo su nivel, para que una tabla nunca mezcle las dos sin
 * decirlo.
 */
export function cajasDeTexto(html: string): CajaDeTexto[] {
  const salida: CajaDeTexto[] = []
  for (const nodo of nodosDe(html)) {
    const clases = atributo(nodo, 'class') ?? ''
    const porAtributo = atributo(nodo, 'data-nivel')
    if (porAtributo !== null) {
      salida.push({ nodo, nivel: porAtributo, clases, texto: textoDe(html, nodo), via: 'atributo' })
      continue
    }
    const porClase = clases.split(/\s+/).find((c) => NIVEL_POR_CLASE.has(c))
    if (porClase === undefined) continue
    salida.push({
      nodo,
      nivel: NIVEL_POR_CLASE.get(porClase) ?? '',
      clases,
      texto: textoDe(html, nodo),
      via: 'clase',
    })
  }
  return salida
}

export interface Encabezado {
  readonly nivel: number
  readonly texto: string
  readonly seccion: string | null
  readonly ocultoALectores: boolean
  readonly indice: number
}

/** El árbol de encabezados en orden del documento. `h1` … `h6`, sin `role`. */
export function encabezados(html: string): Encabezado[] {
  return nodosDe(html)
    .filter((n) => /^h[1-6]$/.test(n.etiqueta))
    .map((n) => ({
      nivel: Number.parseInt(n.etiqueta.slice(1), 10),
      texto: textoDe(html, n),
      seccion: n.seccion,
      ocultoALectores: n.ocultoALectores,
      indice: n.indice,
    }))
}

/** Los saltos de nivel del árbol: de `h2` a `h4` sin pasar por `h3`. */
export function saltosDeNivel(arbol: readonly Encabezado[]): string[] {
  const salida: string[] = []
  for (let i = 1; i < arbol.length; i += 1) {
    const salto = arbol[i].nivel - arbol[i - 1].nivel
    if (salto > 1) {
      salida.push(`h${arbol[i - 1].nivel} → h${arbol[i].nivel} ("${arbol[i].texto.slice(0, 40)}")`)
    }
  }
  return salida
}

export interface Parada {
  readonly nodo: Nodo
  readonly etiqueta: string
  readonly destino: string | null
  readonly rotulo: string
  readonly ocultoALectores: boolean
  readonly seccion: string | null
}

const INTERACTIVOS: ReadonlySet<string> = new Set(['a', 'button', 'input', 'select', 'textarea'])

/**
 * EL ORDEN DE TABULACIÓN, en orden del documento.
 *
 * ⚠ **Es el orden del DOCUMENTO, que es el del foco secuencial sólo mientras
 * nadie escriba un `tabindex` positivo** —ninguno lo hace, y esto lo comprueba—
 * **y mientras el CSS no reordene** con `order` o `position`. Lo segundo no se
 * puede ver desde el marcado y queda declarado como supuesto donde se publique.
 *
 * Un `<a>` sin `href`, un control `disabled` y un `tabindex="-1"` no son paradas.
 */
export function paradasDeTabulacion(html: string): Parada[] {
  return nodosDe(html)
    .filter((n) => INTERACTIVOS.has(n.etiqueta) || atributo(n, 'tabindex') !== null)
    .filter((n) => !tieneAtributo(n, 'disabled'))
    .filter((n) => atributo(n, 'tabindex') !== '-1')
    .filter((n) => !(n.etiqueta === 'a' && atributo(n, 'href') === null))
    .map((nodo) => ({
      nodo,
      etiqueta: nodo.etiqueta,
      destino: atributo(nodo, 'href'),
      rotulo: atributo(nodo, 'aria-label') ?? textoDe(html, nodo),
      ocultoALectores: nodo.ocultoALectores,
      seccion: nodo.seccion,
    }))
}

/** Los `tabindex` positivos, que romperían el orden del documento. Vacío o hay defecto. */
export function tabindexPositivos(html: string): string[] {
  return nodosDe(html)
    .map((n) => atributo(n, 'tabindex'))
    .filter((v): v is string => v !== null && Number.parseInt(v, 10) > 0)
}

/**
 * ⚠ **UN `<footer>` NO ES SIEMPRE UN LANDMARK, Y CONFUNDIRLO INVENTA UNO.**
 *
 * `<header>` y `<footer>` mapean a `banner` y `contentinfo` **sólo cuando no
 * están adentro de contenido seccionante ni de una raíz de sección**
 * (HTML-AAM). El marcado de este home tiene exactamente ese caso: el
 * `<blockquote><footer>` de la atribución de un testimonio, que es la forma
 * canónica de citar y **no** un pie de página. Un lector ingenuo lo reporta
 * como un segundo `contentinfo`, que es un defecto que no existe.
 *
 * `<section>` y `<form>` son landmarks **sólo con nombre accesible**; sin
 * nombre no aportan ninguno, y contarlos infla la lista con la misma clase de
 * error al revés.
 */
const SECCIONANTES: ReadonlySet<string> = new Set([
  // contenido seccionante
  'article',
  'aside',
  'nav',
  'section',
  // raíces de sección
  'blockquote',
  'details',
  'dialog',
  'fieldset',
  'figure',
  'td',
  'main',
])

export interface Landmark {
  readonly etiqueta: string
  /** El rol implícito o explícito. `null` = el elemento NO aporta landmark. */
  readonly rol: string | null
  readonly rotulo: string | null
  readonly indice: number
  /** Por qué no aporta landmark, cuando `rol` es `null`. */
  readonly porQueNo: string | null
}

function nombreAccesible(nodo: Nodo): string | null {
  return atributo(nodo, 'aria-label') ?? atributo(nodo, 'aria-labelledby')
}

/** El rol de landmark de un nodo, con el alcance ya aplicado. */
export function rolDeLandmark(nodo: Nodo): Landmark {
  const explicito = atributo(nodo, 'role')
  const rotulo = nombreAccesible(nodo)
  const base = { etiqueta: nodo.etiqueta, rotulo, indice: nodo.indice }
  if (explicito !== null) return { ...base, rol: explicito, porQueNo: null }

  const dentroDeSeccionante = nodo.ancestros.some((a) => SECCIONANTES.has(a))
  switch (nodo.etiqueta) {
    case 'main':
      return { ...base, rol: 'main', porQueNo: null }
    case 'nav':
      return { ...base, rol: 'navigation', porQueNo: null }
    case 'aside':
      return { ...base, rol: 'complementary', porQueNo: null }
    case 'header':
    case 'footer':
      return dentroDeSeccionante
        ? { ...base, rol: null, porQueNo: `está adentro de <${nodo.ancestros.filter((a) => SECCIONANTES.has(a)).at(-1) ?? '?'}>, así que no es un landmark` }
        : { ...base, rol: nodo.etiqueta === 'header' ? 'banner' : 'contentinfo', porQueNo: null }
    case 'form':
    case 'section':
      return rotulo === null
        ? { ...base, rol: null, porQueNo: 'no tiene nombre accesible, así que no aporta landmark' }
        : { ...base, rol: nodo.etiqueta === 'form' ? 'form' : 'region', porQueNo: null }
    default:
      return { ...base, rol: null, porQueNo: 'la etiqueta no tiene rol de landmark' }
  }
}

/** Las etiquetas que PUEDEN ser landmark. Ser candidato no es serlo. */
export const CANDIDATOS_A_LANDMARK: readonly string[] = [
  'main',
  'nav',
  'header',
  'footer',
  'aside',
  'form',
  'section',
]

/**
 * LOS OCHO ROLES DE LANDMARK DE ARIA. No hay un noveno.
 *
 * ⚠ **ESTA LISTA ES UN ARREGLO DE LA INTEGRACIÓN DE SITIO-S10, Y LO ENCONTRÓ EL
 * FRENTE DE ACCESIBILIDAD.** `landmarks()` filtraba por «tiene rol», no por
 * «tiene rol DE LANDMARK», así que contaba los cuatro `<figure role="img">` del
 * home y publicaba **6 landmarks donde hay 2**. Los `role="img"` son correctos:
 * el que se equivocaba era el filtro. Es la misma clase de defecto que este
 * archivo ya documenta para el `<footer>` —un lector que confunde «tiene un rol»
 * con «aporta un landmark» infla la lista— sólo que del otro lado.
 */
const ROLES_DE_LANDMARK: ReadonlySet<string> = new Set([
  'banner',
  'complementary',
  'contentinfo',
  'form',
  'main',
  'navigation',
  'region',
  'search',
])

export function esRolDeLandmark(rol: string | null): boolean {
  return rol !== null && ROLES_DE_LANDMARK.has(rol)
}

/** Todo lo que podría ser landmark, con su veredicto. Incluye los que NO lo son. */
export function candidatosALandmark(html: string): Landmark[] {
  return nodosDe(html)
    .filter((n) => CANDIDATOS_A_LANDMARK.includes(n.etiqueta) || atributo(n, 'role') !== null)
    .map(rolDeLandmark)
}

/** Los landmarks de verdad, en orden del documento. */
export function landmarks(html: string): Landmark[] {
  return candidatosALandmark(html).filter((l) => esRolDeLandmark(l.rol))
}

/** Las secciones del marcado, en orden del documento. */
export function ordenDeSecciones(html: string): string[] {
  return nodosDe(html)
    .map((n) => atributo(n, ATRIBUTO_DE_SECCION))
    .filter((v): v is string => v !== null)
}
