/**
 * UN LECTOR DE CSS MÍNIMO.
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 *
 * Este sprint compone valores en vez de escribirlos: el intercambio del CTA es
 * `calc(var(--duracion-muy-lenta) + 2 * var(--duracion-rapida))` y el halo del
 * cursor es `calc(var(--spacing-8) + var(--spacing-1))`. Afirmar que esas
 * expresiones dan 1300ms y 36px **exige resolverlas**, no leerlas: comparar la
 * cadena contra otra cadena no comprueba nada, porque el error que hay que
 * cazar es aritmético.
 *
 * Y hay una razón más fuerte: si alguien cambia `--duracion-rapida` en el
 * sistema, la cadena sigue idéntica y el número deja de ser el medido. Sólo
 * una resolución contra los tokens reales lo nota.
 *
 * ── Alcance declarado ─────────────────────────────────────────────────────
 *
 * No es un motor de CSS. Entiende reglas, at-rules de un nivel y declaraciones.
 * La aritmética vive aparte, en `s3-calc.ts`, y se re-exporta desde acá para
 * que los instrumentos tengan una sola puerta de entrada.
 */

import { leer } from './s3-archivos'

/** El archivo del sistema. Este sprint lo LEE y no lo toca nunca. */
export const TEMA = 'src/app/theme-develop.css'

export interface Regla {
  /** El selector, con espacios normalizados. */
  readonly selector: string
  /** El cuerpo, sin las llaves. */
  readonly cuerpo: string
  /** El at-rule que lo envuelve, o `''` si está en el nivel de arriba. */
  readonly contexto: string
}

export interface Declaracion {
  readonly prop: string
  readonly valor: string
}

export { expandirVar, resolver, type Cantidad, type Unidad } from './s3-calc'

/** Quita comentarios de bloque. Va acá y no en la calculadora porque es una
 *  operación sobre el TEXTO de una hoja, no sobre una expresión. */
export function sinComentarios(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** Todas las reglas, incluidas las que viven adentro de un at-rule. */
export function reglas(css: string): Regla[] {
  return leerBloque(sinComentarios(css), '')
}

function leerBloque(texto: string, contexto: string): Regla[] {
  const salida: Regla[] = []
  let preludio = ''
  let i = 0
  while (i < texto.length) {
    const c = texto[i]
    if (c === '{') {
      const fin = cierreDe(texto, i)
      const cuerpo = texto.slice(i + 1, fin)
      const nombre = preludio.trim().replace(/\s+/g, ' ')
      if (nombre.startsWith('@')) {
        // El at-rule se emite TAMBIÉN como regla: `@theme static { … }` no
        // contiene reglas anidadas sino declaraciones sueltas, y son los 89
        // tokens del sistema. Si sólo se recursara, `customPropsDe` sobre el
        // tema devolvería cero — verde por vacío, y del peor tipo.
        salida.push({ selector: nombre, cuerpo, contexto })
        salida.push(...leerBloque(cuerpo, nombre))
      } else if (nombre.length > 0) salida.push({ selector: nombre, cuerpo, contexto })
      preludio = ''
      i = fin + 1
      continue
    }
    if (c === '}') {
      preludio = ''
      i += 1
      continue
    }
    preludio += c
    i += 1
  }
  return salida
}

function cierreDe(texto: string, apertura: number): number {
  let prof = 0
  for (let i = apertura; i < texto.length; i += 1) {
    if (texto[i] === '{') prof += 1
    else if (texto[i] === '}') {
      prof -= 1
      if (prof === 0) return i
    }
  }
  return texto.length
}

/**
 * Parte un selector en sus alternativas, por las comas de NIVEL SUPERIOR.
 *
 * Un `split(',')` a secas parte también las comas de adentro de `:is(a, b)` y
 * de `[attr~="x, y"]`, y devuelve trozos que no son selectores. Esa es
 * exactamente la clase de error que hace fallar una comprobación correcta
 * sobre código correcto — y que después se "arregla" relajando la
 * comprobación, que es el peor final posible.
 */
export function partesDeSelector(selector: string): string[] {
  const partes: string[] = []
  let actual = ''
  let profParentesis = 0
  let profCorchete = 0
  for (const c of selector) {
    if (c === '(') profParentesis += 1
    else if (c === ')') profParentesis -= 1
    else if (c === '[') profCorchete += 1
    else if (c === ']') profCorchete -= 1
    if (c === ',' && profParentesis === 0 && profCorchete === 0) {
      partes.push(actual.trim())
      actual = ''
      continue
    }
    actual += c
  }
  if (actual.trim().length > 0) partes.push(actual.trim())
  return partes
}

/** Las declaraciones de un cuerpo, ignorando reglas anidadas. */
export function declaracionesDe(cuerpo: string): Declaracion[] {
  // Se pela de adentro hacia afuera: una sola pasada sólo saca los bloques más
  // internos y dejaría las declaraciones de un anidado de dos niveles. Se
  // sacan SÓLO las llaves y su contenido —no el preludio que las precede—
  // porque comerse el preludio se comería también la declaración anterior.
  // Los restos de preludio (`@media (…)`, `.clase `) los descarta después el
  // filtro de nombre de propiedad.
  let plano = cuerpo
  for (let vuelta = 0; vuelta < 8; vuelta += 1) {
    const podado = plano.replace(/\{[^{}]*\}/g, '')
    if (podado === plano) break
    plano = podado
  }
  const salida: Declaracion[] = []
  for (const trozo of plano.split(';')) {
    const corte = trozo.indexOf(':')
    if (corte < 0) continue
    const prop = trozo.slice(0, corte).trim()
    const valor = trozo.slice(corte + 1).trim().replace(/\s+/g, ' ')
    // Sólo nombres de propiedad de verdad. Descarta los restos de preludio
    // que quedan después de podar los bloques anidados —`@media (algo` tiene
    // dos puntos y se leería como una declaración inexistente.
    if (!/^(--)?[a-zA-Z][a-zA-Z0-9-]*$/.test(prop)) continue
    if (valor.length === 0) continue
    salida.push({ prop, valor })
  }
  return salida
}

/** Las propiedades personalizadas declaradas en un CSS, con su valor. */
export function customPropsDe(css: string): Map<string, string> {
  const mapa = new Map<string, string>()
  for (const regla of reglas(css)) {
    for (const { prop, valor } of declaracionesDe(regla.cuerpo)) {
      if (prop.startsWith('--')) mapa.set(prop, valor)
    }
  }
  return mapa
}

/**
 * Los tokens de la BASE del sistema — los del bloque `@theme`.
 *
 * NO es `customPropsDe(leer(TEMA))`, y la diferencia importa. Ese archivo
 * declara los mismos nombres en tres lugares: en `@theme`, en los tres bloques
 * de `[data-servicio]` y en `[data-seccion="invertida"]`. Un recorrido plano
 * aplica ultimo-gana y devuelve el tema INVERTIDO disfrazado de base: pedirle
 * `--color-fondo` da el fondo oscuro en vez del papel.
 *
 * Lo encontro `s3-papel-translucido.invariant.ts`, que fue el primero en
 * necesitar un color redefinido: midio el contraste del papel contra si mismo
 * y dio 17,99:1 en los dos temas — una razon perfecta y completamente falsa.
 * Los instrumentos anteriores no lo notaron porque solo pedian duraciones,
 * espaciados y tamanos, que ningun bloque redefine.
 */
export function tokensDelTema(): Map<string, string> {
  return declaracionesDeUnBloque((r) => r.selector.startsWith('@theme'), '@theme')
}

/** Los tokens que un bloque de contexto REDEFINE, por su selector exacto. */
export function tokensDelBloque(selector: string): Map<string, string> {
  return declaracionesDeUnBloque((r) => r.selector === selector, selector)
}

/** El selector del bloque que da vuelta el tema. Una sola definicion. */
export const SECCION_INVERTIDA = '[data-seccion="invertida"]'

function declaracionesDeUnBloque(
  coincide: (regla: Regla) => boolean,
  nombre: string,
): Map<string, string> {
  const bloque = reglas(leer(TEMA)).find(coincide)
  if (bloque === undefined) throw new Error(`no se encontro el bloque ${nombre} en ${TEMA}`)
  const mapa = new Map<string, string>()
  for (const { prop, valor } of declaracionesDe(bloque.cuerpo)) {
    if (prop.startsWith('--')) mapa.set(prop, valor)
  }
  return mapa
}
