/**
 * EL MODELO DE CSS A UN ANCHO — tokens resueltos, `clamp()` evaluado y qué
 * variante responsiva está activa.
 *
 * ⚠ **ESTO ES UN MODELO, NO UNA MEDICIÓN, Y LA DISTINCIÓN ES LA REGLA 10 DEL
 * SPRINT.** No hay navegador: acá no se computa un estilo, se RESUELVE una
 * expresión declarada en `theme-develop.css` contra un ancho de viewport
 * supuesto. Coincide con lo que el navegador haría **siempre que** la raíz mida
 * 16px, que ninguna hoja pise el token, y que el elemento no herede un
 * `font-size` distinto. Las tres son supuestos y están declaradas en
 * `SUPUESTOS_DEL_MODELO_DE_CSS`.
 *
 * ── Por qué el banco lo escribe el agente principal, y una sola vez ────────
 *
 * Porque los cuatro frentes de SITIO-S10 miden sobre los mismos anchos, y un
 * resolvedor de `clamp()` escrito cuatro veces son cuatro resolvedores que
 * divergen: el primero que redondee distinto produce una tabla que no se puede
 * comparar con las otras tres. Es la misma lección que `anclaje.ts` dejó escrita
 * en SITIO-S9 —la coordenada compartida vive en el contrato, no en los
 * consumidores— aplicada a la unidad de medida en vez de al scroll.
 *
 * ── Lo que este archivo NO hace ────────────────────────────────────────────
 *
 * No hace layout. No sabe cuántas líneas ocupa un texto, ni dónde cae una caja:
 * eso lo deriva quien mide, con su propio supuesto declarado. Acá sólo se
 * responde «cuánto vale este token a este ancho» y «esta clase, ¿aplica?».
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ } from './s5-archivos'

/** Los supuestos del modelo. Se imprimen al lado de toda cifra que salga de acá. */
export const SUPUESTOS_DEL_MODELO_DE_CSS: readonly string[] = [
  'la raíz mide 16px (`--text-base: 1rem` lo asume, y `s8-cierre` ya lo usaba)',
  'ninguna hoja de fuera de `theme-develop.css` pisa el valor del token',
  'el elemento no hereda un `font-size` distinto del de la raíz, así que `rem` y `em` no divergen',
  'el ancho de viewport es el ancho de CSS, sin barra de scroll descontada',
]

/** El tamaño de la raíz. Es un supuesto declarado, no una medición. */
export const RAIZ_PX = 16

const RUTA_DEL_TEMA = 'src/app/theme-develop.css'

/** El tema sin comentarios. Los comentarios llevan valores de ejemplo. */
export const TEMA: string = readFileSync(path.join(RAIZ, RUTA_DEL_TEMA), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)

/**
 * El valor DECLARADO de un token, tal cual está escrito en el tema. Tira si no
 * existe: un token inventado es un error, no un `undefined` que se propaga
 * hasta un `NaN` en una tabla.
 */
export function valorDeToken(nombre: string): string {
  const m = new RegExp(`(?:^|[;{\\s])${nombre}\\s*:\\s*([^;]+);`).exec(TEMA)
  if (m === null) throw new Error(`token desconocido en ${RUTA_DEL_TEMA}: ${nombre}`)
  return m[1].trim()
}

/** Si el token existe. Lo usa el control positivo del resolvedor. */
export function hayToken(nombre: string): boolean {
  return new RegExp(`(?:^|[;{\\s])${nombre}\\s*:`).test(TEMA)
}

/**
 * Resuelve una expresión de longitud a píxeles, a un ancho de viewport dado.
 *
 * Cubre exactamente lo que el tema usa: `px`, `rem`, `vw`, sumas, `clamp()` de
 * tres términos, `var()` y `calc()` de sumas y productos. **Un valor que no
 * entienda TIRA** en vez de devolver cero — un cero silencioso en una tabla de
 * alturas se lee como «entra» y es exactamente el modo de falla que este repo
 * viene cazando.
 */
export function resolverLongitud(expresion: string, anchoDeViewport: number): number {
  const v = expresion.trim()

  const clamp = /^clamp\(([\s\S]*)\)$/.exec(v)
  if (clamp !== null) {
    const [minimo, preferido, maximo] = partirPorComas(clamp[1]).map((p) =>
      resolverLongitud(p, anchoDeViewport),
    )
    return Math.min(Math.max(minimo, preferido), maximo)
  }

  const calc = /^calc\(([\s\S]*)\)$/.exec(v)
  if (calc !== null) return resolverSuma(calc[1], anchoDeViewport)

  const variable = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(v)
  if (variable !== null) return resolverLongitud(valorDeToken(variable[1]), anchoDeViewport)

  if (/[+\-]/.test(v.replace(/^-/, '')) || /\*/.test(v)) return resolverSuma(v, anchoDeViewport)

  return resolverTermino(v, anchoDeViewport)
}

/** Un término simple: un número con su unidad, o un `var()`. */
function resolverTermino(termino: string, anchoDeViewport: number): number {
  const v = termino.trim()
  const variable = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(v)
  if (variable !== null) return resolverLongitud(valorDeToken(variable[1]), anchoDeViewport)

  const m = /^(-?[\d.]+)(px|rem|em|vw|vh|svh|%)?$/.exec(v)
  if (m === null) throw new Error(`no sé resolver la longitud: "${termino}"`)
  const n = Number.parseFloat(m[1])
  switch (m[2]) {
    case undefined:
    case 'px':
      return n
    case 'rem':
    case 'em':
      return n * RAIZ_PX
    case 'vw':
      return (n / 100) * anchoDeViewport
    default:
      throw new Error(`unidad que este modelo no resuelve sin alto de viewport: "${termino}"`)
  }
}

/**
 * Sumas y productos, evaluados de izquierda a derecha con la precedencia de
 * `*` sobre `+`/`-`. Alcanza para lo que el tema y `_estilos/` escriben; una
 * expresión más rica tira, que es lo correcto: adivinarla sería inventar.
 */
function resolverSuma(expresion: string, anchoDeViewport: number): number {
  // CSS exige espacio a los dos lados de `+` y `-` adentro de `calc()`, así que
  // partir por «espacio, signo, espacio» no puede comerse el menos de un valor
  // negativo ni el guión de un nombre de token.
  const piezas = expresion.trim().split(/\s+([+-])\s+/)
  let total = resolverProducto(piezas[0], anchoDeViewport)
  for (let i = 1; i < piezas.length; i += 2) {
    const termino = resolverProducto(piezas[i + 1], anchoDeViewport)
    total += piezas[i] === '-' ? -termino : termino
  }
  return total
}

function resolverProducto(expresion: string, anchoDeViewport: number): number {
  return expresion
    .split('*')
    .reduce((acumulado, factor) => acumulado * resolverTermino(factor, anchoDeViewport), 1)
}

/**
 * Parte por comas de primer nivel: `clamp()` lleva `calc()` adentro.
 *
 * Exportada en V3-C: `s3-banda.ts` necesita los TRES términos de un `clamp()`
 * por separado —el piso, la recta y el techo— para poder afirmar por dónde pasa
 * la recta en cada ancla. Escribir un segundo partidor allá sería el mismo
 * defecto que este archivo existe para no tener: dos modelos que divergen en el
 * primer paréntesis anidado.
 */
export function partirPorComas(texto: string): string[] {
  const partes: string[] = []
  let profundidad = 0
  let actual = ''
  for (const caracter of texto) {
    if (caracter === '(') profundidad += 1
    if (caracter === ')') profundidad -= 1
    if (caracter === ',' && profundidad === 0) {
      partes.push(actual)
      actual = ''
      continue
    }
    actual += caracter
  }
  partes.push(actual)
  return partes.map((p) => p.trim())
}

/** Un token resuelto a píxeles a un ancho dado. */
export function tokenPx(nombre: string, anchoDeViewport: number): number {
  return resolverLongitud(valorDeToken(nombre), anchoDeViewport)
}

/**
 * La caja de línea de un texto: tamaño × interlineado. Es la misma cuenta que
 * `s8-cierre.invariant.tsx` usa para derivar el alto del Cierre, sacada acá
 * para que los cuatro frentes usen una sola.
 */
export function cajaDeLinea(
  tokenDeTexto: string,
  tokenDeInterlineado: string,
  anchoDeViewport: number,
): number {
  return tokenPx(tokenDeTexto, anchoDeViewport) * tokenPx(tokenDeInterlineado, anchoDeViewport)
}

/** Los `--breakpoint-*` del tema, derivados y no escritos acá. */
export const BREAKPOINTS: Readonly<Record<string, number>> = Object.fromEntries(
  [...TEMA.matchAll(/--breakpoint-([a-z-]+)\s*:\s*([^;]+);/g)].map((m) => [
    m[1],
    resolverLongitud(m[2], 0),
  ]),
)

/** Las variantes de ancho activas a un ancho dado, de la más chica a la más grande. */
export function variantesActivas(anchoDeViewport: number): string[] {
  return Object.entries(BREAKPOINTS)
    .filter(([, px]) => anchoDeViewport >= px)
    .sort((a, b) => a[1] - b[1])
    .map(([nombre]) => nombre)
}

/**
 * Las clases que APLICAN a un ancho, con el prefijo de ancho sacado.
 *
 * Las variantes que no son de ancho —`hover:`, `focus-visible:`, `group-*`— se
 * conservan con su prefijo: no dependen del viewport y sacarlas convertiría un
 * estado en un permanente. Una variante de ancho que no llega se descarta
 * entera, que es lo que hace el navegador con una media query que no coincide.
 */
export function clasesEfectivas(clases: string, anchoDeViewport: number): string[] {
  const activas = new Set(variantesActivas(anchoDeViewport))
  const salida: string[] = []
  for (const clase of clases.split(/\s+/).filter(Boolean)) {
    const corte = clase.indexOf(':')
    if (corte < 0) {
      salida.push(clase)
      continue
    }
    const prefijo = clase.slice(0, corte)
    if (!(prefijo in BREAKPOINTS)) {
      salida.push(clase)
      continue
    }
    if (activas.has(prefijo)) salida.push(clase.slice(corte + 1))
  }
  return salida
}

/**
 * El ancho útil del contenido a un ancho de viewport: el envoltorio es a
 * sangre con padding lateral FIJO y un tope global del contenido.
 *
 * Sale de `_componentes/layout/Envoltorio.tsx`, que declara los dos tokens.
 */
export function anchoDeContenido(anchoDeViewport: number): number {
  const tope = tokenPx('--container-tope', anchoDeViewport)
  const pad = tokenPx('--pad-lateral-compacto', anchoDeViewport)
  return Math.min(anchoDeViewport, tope) - 2 * pad
}
