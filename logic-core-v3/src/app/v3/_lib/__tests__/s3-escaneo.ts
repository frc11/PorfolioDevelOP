/**
 * LOS DETECTORES — las funciones que buscan valores fuera del sistema.
 *
 * Cada una es un predicado puro sobre texto, y está separada del invariante a
 * propósito: así el control positivo puede correr **la misma función** contra
 * una entrada deliberadamente rota. Un detector que se prueba a sí mismo con
 * otra copia del código no prueba nada.
 */

/** Colores escritos a mano: hex de 3, 4, 6 u 8 dígitos. */
export function hexEncontrados(texto: string): string[] {
  return [...texto.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0])
}

/** Funciones de color literales. `color-mix` no cuenta: no trae un valor. */
export function funcionesDeColorEncontradas(texto: string): string[] {
  return [...texto.matchAll(/\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/g)].map((m) => m[0].trim())
}

/**
 * Los literales que llevan unidad. Es la definición operativa de "un px
 * suelto": un número pegado a una unidad de CSS.
 *
 * `PERMITIDOS` son los estructurales, y la lista es corta a propósito —
 * ninguno es una decisión de diseño:
 *   `0s`      apagar un retardo heredado
 *   `100%`    ocupar la caja
 *   `50%`     el centro, para `left` y para `translate`
 */
const PERMITIDOS = new Set(['0s', '0ms', '100%', '50%', '-50%'])

const LITERAL_CON_UNIDAD = /-?\d*\.?\d+(?:px|rem|em|ms|s|deg|vh|vw|svh|dvh|lvh|ch|ex|pt|%)(?![\w-])/g

export function literalesConUnidad(texto: string): string[] {
  return [...texto.matchAll(LITERAL_CON_UNIDAD)].map((m) => m[0]).filter((v) => !PERMITIDOS.has(v))
}

/**
 * Valores arbitrarios de Tailwind: `px-[…]`, `w-[…]`, `grid-cols-[…]`.
 *
 * Todos tienen que consumir un token por `var()`. Un `px-[32px]` es
 * exactamente el mismo problema que un `padding-left: 32px` en una hoja, con
 * la diferencia de que parece parte del sistema.
 */
export function arbitrariosSinVar(texto: string): string[] {
  const sinComentarios = quitarComentarios(texto)
  return [...sinComentarios.matchAll(/(?<![\w$])[a-z][a-z0-9-]*-\[([^\]\s]+)\]/g)]
    .filter((m) => !m[1].includes('var('))
    .map((m) => m[0])
}

/**
 * Saca comentarios de bloque y líneas de comentario.
 *
 * Deliberadamente conservador: sólo borra una línea entera si arranca con
 * `//` o con `*`. Borrar desde cualquier `//` rompería una URL adentro de un
 * string, y un detector que corrompe su entrada encuentra cosas que no están.
 */
export function quitarComentarios(texto: string): string {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((linea) => {
      const t = linea.trim()
      return !t.startsWith('//') && !t.startsWith('*')
    })
    .join('\n')
}

/**
 * Reglas que apagan el anillo de foco. Las tres formas que existen, porque
 * quien lo saca casi nunca escribe la misma.
 */
export function apagadosDeFoco(texto: string): string[] {
  return [
    ...texto.matchAll(
      /outline\s*:\s*none|outline-style\s*:\s*none|outline-width\s*:\s*0|outline\s*:\s*0|\boutline-none\b/g,
    ),
  ].map((m) => m[0])
}

/** El cursor nativo oculto. La regla que este sprint no tiene en ningún lado. */
export function ocultamientosDelCursorNativo(texto: string): string[] {
  return [...texto.matchAll(/cursor\s*:\s*none|\bcursor-none\b/g)].map((m) => m[0])
}
