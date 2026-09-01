/**
 * LEER EL MARCADO UNA VEZ — un recorrido con pila, y de ahí salen las cuatro
 * extracciones que los frentes de SITIO-S10 comparten.
 *
 * ── Por qué un recorrido y no cuatro expresiones regulares ─────────────────
 *
 * Porque las cuatro preguntas del sprint necesitan **anidamiento**, y una
 * expresión regular no lo tiene:
 *
 *   · «¿qué lee un lector de pantalla?» pide saber si un elemento está adentro
 *     de un `aria-hidden`, que es una propiedad del ANCESTRO;
 *   · «¿cuál es el orden de tabulación?» pide el orden del documento, que es el
 *     orden del recorrido;
 *   · «¿qué caja de texto es de qué sección?» pide saber adentro de qué
 *     `<section>` cae cada elemento.
 *
 * `_secciones/_invariantes/marcado.ts` ya pagó este defecto una vez y lo dejó
 * escrito: la versión no codiciosa corta en el primer cierre y con `span` dentro
 * de `span` deja media frase adentro. Acá se cuenta profundidad desde el
 * principio.
 *
 * ⚠ **Lee el marcado que sale de `renderToStaticMarkup`, no un DOM.** Eso
 * alcanza —cierra todas las comillas y no trae HTML de terceros— y no alcanza
 * para nada que dependa de CSS: un `display:none`, un `sr-only` o un elemento
 * movido por `order` se ven acá exactamente igual que el resto. Lo que dependa
 * de eso se declara como supuesto donde se use.
 */

import { ATRIBUTO_DE_SECCION } from '../../_secciones/_contrato/forma'

/** Las etiquetas que no llevan cierre. `renderToStaticMarkup` no las autocierra. */
const ETIQUETAS_VACIAS: ReadonlySet<string> = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export interface Nodo {
  /** Nombre de la etiqueta, en minúscula. */
  readonly etiqueta: string
  /** El texto crudo de los atributos, tal cual salió. */
  readonly atributos: string
  /** Posición en el ORDEN DEL DOCUMENTO, contando sólo elementos. */
  readonly indice: number
  /** Profundidad de anidamiento. La raíz es 0. */
  readonly profundidad: number
  /** Si él o algún ancestro declara `aria-hidden="true"`. */
  readonly ocultoALectores: boolean
  /** El `data-seccion-id` de la sección que lo contiene, o `null`. */
  readonly seccion: string | null
  /** Las etiquetas de sus ancestros, de la raíz hacia adentro. */
  readonly ancestros: readonly string[]
  /** Offset del primer carácter después de su etiqueta de apertura. */
  readonly desde: number
  /** Offset del primer carácter de su etiqueta de cierre. Igual a `desde` si es vacía. */
  readonly hasta: number
}

/** La marca de sección. Se importa del contrato: no puede haber una segunda. */
export { ATRIBUTO_DE_SECCION }

/** El valor de un atributo del nodo, o `null` si no lo lleva. */
export function atributo(nodo: Nodo, nombre: string): string | null {
  const m = new RegExp(`\\b${nombre}="([^"]*)"`).exec(nodo.atributos)
  return m === null ? null : m[1]
}

/** Si el nodo declara el atributo, con o sin valor. */
export function tieneAtributo(nodo: Nodo, nombre: string): boolean {
  return new RegExp(`\\b${nombre}(?=[=\\s>]|$)`).test(nodo.atributos)
}

/**
 * Todos los elementos del marcado, en orden del documento, con su profundidad,
 * si están ocultos a un lector y de qué sección son.
 *
 * Un cierre sin apertura no tira: se ignora. El marcado que se mira lo emite
 * React y está balanceado; ser tolerante acá evita que un instrumento se caiga
 * por una etiqueta que ni siquiera está mirando.
 */
export function nodosDe(html: string): Nodo[] {
  interface EnConstruccion {
    etiqueta: string
    atributos: string
    indice: number
    profundidad: number
    ocultoALectores: boolean
    seccion: string | null
    ancestros: readonly string[]
    desde: number
    hasta: number
  }
  const nodos: EnConstruccion[] = []
  const pila: { readonly indice: number; readonly oculto: boolean; readonly abreSeccion: boolean }[] = []
  const cadena: string[] = []
  let ocultos = 0
  let seccion: string | null = null

  for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g)) {
    const esCierre = m[1] === '/'
    const nombre = m[2].toLowerCase()
    const cuerpo = m[3]
    const indice = m.index ?? 0
    const esVacia = ETIQUETAS_VACIAS.has(nombre) || cuerpo.trimEnd().endsWith('/')

    if (esCierre) {
      const abierto = pila.pop()
      if (abierto === undefined) continue
      nodos[abierto.indice].hasta = indice
      if (abierto.oculto) ocultos -= 1
      if (abierto.abreSeccion) seccion = null
      cadena.pop()
      continue
    }

    const propioOculto = /\baria-hidden="true"/.test(cuerpo)
    const marcaDeSeccion = new RegExp(`\\b${ATRIBUTO_DE_SECCION}="([^"]*)"`).exec(cuerpo)
    const abreSeccion = marcaDeSeccion !== null && seccion === null && !esVacia

    const desde = indice + m[0].length
    nodos.push({
      etiqueta: nombre,
      atributos: cuerpo,
      indice: nodos.length,
      profundidad: pila.length,
      ocultoALectores: ocultos > 0 || propioOculto,
      seccion: abreSeccion && marcaDeSeccion !== null ? marcaDeSeccion[1] : seccion,
      ancestros: [...cadena],
      desde,
      // Una etiqueta vacía no tiene subárbol: su texto es la cadena vacía.
      hasta: desde,
    })

    if (esVacia) continue
    if (abreSeccion && marcaDeSeccion !== null) seccion = marcaDeSeccion[1]
    if (propioOculto) ocultos += 1
    pila.push({ indice: nodos.length - 1, oculto: propioOculto, abreSeccion })
    cadena.push(nombre)
  }

  return nodos
}

/** El texto visible del subárbol de un nodo, sin etiquetas y con espacios normalizados. */
export function textoDe(html: string, nodo: Nodo): string {
  return html
    .slice(nodo.desde, nodo.hasta)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}
