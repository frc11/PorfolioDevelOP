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

/** Las CUATRO caras que `/v3` sirve, por `next/font/local`. */
export const FUENTE_TITULO = 'src/app/v3/_fuentes/chivo-latin.woff2'
export const FUENTE_CODIGO = 'src/app/v3/_fuentes/chivo-mono-latin.woff2'
/**
 * La cara de display — Archivo, con el eje `wdth` ya pinchado en 62.
 *
 * ⚠️ **EL PINCHAZO ES LO QUE HACE QUE ESTE MODELO SIRVA PARA ELLA.** El
 * supuesto 1 de arriba dice que se lee la instancia POR DEFECTO de la variable;
 * con el eje de ancho vivo, el defecto habría sido `wdth` 100 y este archivo
 * habría reportado la línea 1 del titular **47,6 % más ancha de lo que se
 * pinta** (12,5070 em contra 8,4750). No es el error de fracciones de
 * porcentaje que los tres supuestos declaran: es otro ancho. Pinchado, lo que
 * `hmtx` publica ES lo que el navegador dibuja, salvo el eje de peso —que
 * queda vivo y cuyo defecto (600) es un escalón abajo del 700 con el que se
 * pinta: 8,4750 contra 8,5670 em, un 1,08 % para el lado del PISO, que es
 * exactamente la dirección que el supuesto 1 declara.
 *
 * `scripts-titular/subsetear-fuentes.py` es donde vive esa decisión con su
 * número.
 */
export const FUENTE_DISPLAY = 'src/app/v3/_fuentes/archivo-display-latin.woff2'
/**
 * La itálica de Chivo: la CUARTA cara auto-hospedada, y la única de las cuatro
 * que ningún medidor abre.
 *
 * Es una constante de RUTA y nada más. La tabla de avances que llegó a existir
 * con ella —`CHIVO_ITALICA` en `s10-mobile.ts`— se borró: no la consumía nadie
 * y hacía parsear un `.woff2` de más a cada instrumento que importa el módulo.
 *
 * ⚠ **Lo que queda declarado con ella es un límite del medidor, no un olvido.**
 * `caraDelNivel` elige la cara por NIVEL, y el nivel no sabe de estilo: la
 * línea 2 del Hero (`display-xl`) es Chivo itálica en pantalla y se mide con la
 * Chivo ROMANA. El día que esa diferencia importe, la ruta está acá y la
 * tabla se lee con `leerAvancesDe`.
 */
export const FUENTE_ITALICA = 'src/app/v3/_fuentes/chivo-italic-latin.woff2'

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
