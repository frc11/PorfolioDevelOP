/**
 * EL ANCHO DE UN TEXTO Y EN CUÁNTAS LÍNEAS CORTA — el modelo de composición.
 *
 * ── Qué hueco cierra ───────────────────────────────────────────────────────
 *
 * La pregunta central del frente de mobile —*¿esta sección entra?*— se contesta
 * sumando cajas de línea, y para saber CUÁNTAS cajas hay hace falta saber en
 * cuántas líneas corta un texto. Hasta acá este repo lo declaraba como supuesto:
 * `s8-cierre.invariant.tsx` escribe *«titular de tres líneas al piso del
 * clamp»* y lo dice, que es lo correcto cuando no hay instrumento. **Acá hay
 * instrumento**: los avances están en el `.woff2` que `_fuentes/` sirve, y
 * `s10-woff2.ts` los lee.
 *
 * ── ⚠ LOS TRES SUPUESTOS, declarados ──────────────────────────────────────
 *
 * 1. **Es la INSTANCIA POR DEFECTO de la fuente variable.** Chivo tiene eje
 *    `wght` de 100 a 900 y `hmtx` guarda el avance del default; `HVAR` guarda el
 *    delta por instancia y **este lector no lo aplica**. O sea que un texto en
 *    `font-medio` (500) o `font-fuerte` (700) es un poco MÁS ancho de lo que
 *    esto dice. El error empuja siempre para el mismo lado: **las líneas que se
 *    reportan son un PISO, nunca un techo.**
 * 2. **No hay kerning ni ligaduras.** `GPOS` no se lee. En latín eso mueve
 *    fracciones de porcentaje y, otra vez, casi siempre hacia menos ancho.
 * 3. **El corte es por palabra, con `word-wrap` normal.** No modela guionado ni
 *    `text-wrap: balance`; ninguno de los dos está en el sistema.
 */

import { avanceDeCaracter, type TablasDeAvance } from './s10-woff2'

/** Las dos familias que `/v3` sirve, por `next/font/local`. */
export const FUENTE_TITULO = 'src/app/v3/_fuentes/chivo-latin.woff2'
export const FUENTE_CODIGO = 'src/app/v3/_fuentes/chivo-mono-latin.woff2'

/** Los caracteres del texto que la fuente NO tiene. Vacío o el ancho miente. */
export function caracteresSinGlifo(tablas: TablasDeAvance, texto: string): string[] {
  return [...new Set([...texto])].filter((c) => !tablas.cmap.has(c.codePointAt(0) ?? 0))
}

/**
 * El ancho de un texto en píxeles, a un tamaño dado y con el interletrado del
 * sistema, que va en `em` y por lo tanto escala con el tamaño.
 */
export function anchoDeTexto(
  tablas: TablasDeAvance,
  texto: string,
  tamanoPx: number,
  trackingEm = 0,
): number {
  let unidades = 0
  for (const caracter of texto) unidades += avanceDeCaracter(tablas, caracter.codePointAt(0) ?? 0)
  const base = (unidades / tablas.unidadesPorEm) * tamanoPx
  return base + texto.length * trackingEm * tamanoPx
}

/**
 * EN CUÁNTAS LÍNEAS CORTA UN TEXTO — corte por palabra, sin guionado.
 *
 * Una palabra sola más ancha que el renglón ocupa su propia línea y desborda;
 * eso se cuenta como una línea y **se puede preguntar aparte** con
 * `palabrasQueNoEntran`, porque desbordar no es lo mismo que ocupar dos.
 */
export function lineasDeTexto(
  tablas: TablasDeAvance,
  texto: string,
  anchoDisponible: number,
  tamanoPx: number,
  trackingEm = 0,
): number {
  const palabras = texto.split(/\s+/).filter(Boolean)
  if (palabras.length === 0) return 0
  const ancho = (t: string): number => anchoDeTexto(tablas, t, tamanoPx, trackingEm)
  let lineas = 1
  let actual = palabras[0]
  for (const palabra of palabras.slice(1)) {
    const candidata = `${actual} ${palabra}`
    if (ancho(candidata) <= anchoDisponible) {
      actual = candidata
      continue
    }
    lineas += 1
    actual = palabra
  }
  return lineas
}

/** Las palabras que solas no entran en el renglón: desbordan, no envuelven. */
export function palabrasQueNoEntran(
  tablas: TablasDeAvance,
  texto: string,
  anchoDisponible: number,
  tamanoPx: number,
  trackingEm = 0,
): string[] {
  return texto
    .split(/\s+/)
    .filter(Boolean)
    .filter((p) => anchoDeTexto(tablas, p, tamanoPx, trackingEm) > anchoDisponible)
}
