/**
 * LEER MARCADO SIN UN PARSER — atributos, anidamiento y poda de subárboles.
 *
 * Sale de `soporte.ts` cuando ese archivo cruzó las 300 líneas. No cambia una
 * sola función: son las mismas, en un archivo donde se leen juntas.
 *
 * ── Por qué expresiones regulares y no un parser ──────────────────────────
 *
 * El marcado que se mira lo emite `renderToStaticMarkup`: cierra todas las
 * comillas, no deja atributos sueltos y no trae HTML de terceros. Un parser acá
 * sería una dependencia nueva para leer una cadena que nosotros mismos
 * generamos, y este lane no suma dependencias.
 *
 * Lo que SÍ hace falta es contar profundidad —`quitarSubarbolesConAtributo` y
 * `hayAnidamiento`—, porque el divisor de líneas emite `span` adentro de `span`
 * y una expresión regular no codiciosa corta en el primer cierre. Ese defecto
 * ya se pagó una vez acá: ver el comentario de `quitarSubarbolesConAtributo`.
 */

/**
 * Los atributos de un marcado, por nombre. Devuelve los VALORES en orden de
 * aparición, para poder contarlos y compararlos.
 *
 * Es a propósito una expresión regular y no un parser: el marcado que se mira lo
 * emite `renderToStaticMarkup`, que cierra todas las comillas y no deja HTML
 * suelto. Un parser acá sería una dependencia nueva para leer una cadena que
 * nosotros mismos generamos.
 */
export function valoresDeAtributo(html: string, atributo: string): string[] {
  const re = new RegExp(`${atributo}="([^"]*)"`, 'g')
  return [...html.matchAll(re)].map((m) => m[1])
}

/** Cuántas veces aparece un atributo, con o sin valor. */
export function cuentaDeAtributo(html: string, atributo: string): number {
  return (html.match(new RegExp(`\\b${atributo}(?=[=\\s>])`, 'g')) ?? []).length
}

/**
 * Las etiquetas de apertura de un marcado, en orden. Sirve para preguntar por
 * anidamiento —qué viene adentro de qué— sin parsear.
 */
export function etiquetasEnOrden(html: string): { readonly etiqueta: string; readonly cierra: boolean }[] {
  return [...html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g)].map((m) => ({
    etiqueta: m[2].toLowerCase(),
    cierra: m[1] === '/',
  }))
}

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
  'source',
  'track',
  'wbr',
])

/**
 * Borra los SUBÁRBOLES cuyo elemento raíz lleva `atributo`.
 *
 * ── El defecto que esto arregla, y lo encontró la primera corrida ─────────
 *
 * La versión ingenua es una expresión regular no codiciosa:
 * `/<(\w+)[^>]*aria-hidden[^>]*>[\s\S]*?<\/\1>/`. **Corta en el PRIMER cierre**,
 * así que con etiquetas anidadas del mismo nombre —que es exactamente lo que el
 * divisor de líneas emite, `span` adentro de `span`— deja la mitad del subárbol
 * adentro. El síntoma fue un texto anunciado con frases repetidas a la mitad
 * ("…abierta para quien lo contrató. proyecto viene con su panel: …"), que
 * parece un error de contenido y es un error del instrumento.
 *
 * Acá se cuenta profundidad: se entra al subárbol y se sale cuando la
 * profundidad vuelve a la del elemento que lo abrió. Se deja un espacio en el
 * lugar del corte para no pegar la palabra de antes con la de después — que es
 * el mismo defecto que este proyecto ya documentó con el rótulo duplicado del
 * CTA.
 */
export function quitarSubarbolesConAtributo(html: string, atributo: string): string {
  const tieneAtributo = new RegExp(`\\b${atributo}(?=[=\\s>])`)
  const partes: string[] = []
  let cursor = 0
  let profundidad = 0
  let cortando = false
  let profundidadDelCorte = 0

  for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g)) {
    const etiqueta = m[0]
    const esCierre = m[1] === '/'
    const nombre = m[2].toLowerCase()
    const cuerpo = m[3]
    const indice = m.index ?? 0
    const esVacia = ETIQUETAS_VACIAS.has(nombre) || cuerpo.trimEnd().endsWith('/')

    if (cortando) {
      if (esCierre) {
        profundidad -= 1
        if (profundidad === profundidadDelCorte) {
          cortando = false
          cursor = indice + etiqueta.length
        }
      } else if (!esVacia) {
        profundidad += 1
      }
      continue
    }

    if (!esCierre && !esVacia && tieneAtributo.test(cuerpo)) {
      partes.push(html.slice(cursor, indice))
      cortando = true
      profundidadDelCorte = profundidad
      profundidad += 1
      continue
    }

    if (esCierre) profundidad -= 1
    else if (!esVacia) profundidad += 1
  }

  partes.push(html.slice(cursor))
  return partes.join(' ')
}

/**
 * Si algún elemento con `atributo` está adentro de otro con el mismo atributo.
 *
 * Es la forma de afirmar "nunca anidados" sobre marcado plano: se recorre el
 * texto contando aperturas y cierres del mismo tipo de etiqueta y se marca
 * cuando la profundidad de elementos con el atributo pasa de uno.
 */
export function hayAnidamiento(html: string, atributo: string): boolean {
  let dentro = 0
  const pila: boolean[] = []
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g)) {
    const cierra = m[1] === '/'
    const cuerpo = m[3]
    if (cierra) {
      const tenia = pila.pop()
      if (tenia === true) dentro -= 1
      continue
    }
    // Los elementos vacíos y los autocerrados no abren un nivel: si llevaran el
    // atributo, contarlos como abiertos dejaría el balance corrido para siempre.
    if (cuerpo.trimEnd().endsWith('/') || ETIQUETAS_VACIAS.has(m[2].toLowerCase())) continue
    const tiene = new RegExp(`\\b${atributo}(?=[=\\s>])`).test(cuerpo)
    if (tiene) {
      if (dentro > 0) return true
      dentro += 1
    }
    pila.push(tiene)
  }
  return false
}

