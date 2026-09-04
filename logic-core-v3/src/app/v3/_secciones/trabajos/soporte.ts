/**
 * EL ARNÉS DE `trabajos.invariant` — lo que se lee del disco, y nada más.
 *
 * ── Por qué existe (B1) ───────────────────────────────────────────────────
 *
 * Porque `trabajos.invariant.tsx` pasó las 300 líneas y la regla del proyecto es
 * que se parte, no que se afloja. El corte no es por tamaño: es el mismo que
 * `cierre/soporte.ts` ya tiene, y separa **la plomería** —abrir archivos,
 * componer rutas, derivar colores del tema— de **las afirmaciones**, que son lo
 * que alguien lee cuando quiere saber qué protege el invariante.
 *
 * ⚠ **El montaje de las tres ramas NO se mudó acá, y es deliberado.** Renderizar
 * la sección con la compuerta abierta, cerrada y con la preferencia puesta es
 * parte de lo que el invariante AFIRMA —las tres ramas y sus diferencias son el
 * sujeto—, y sacarlo lo dejaría hablando de un HTML que no se ve producir.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

/** Un archivo del disco, relativo a esta carpeta. */
export const leer = (relativa: string): string => readFileSync(path.join(AQUI, relativa), 'utf8')

/** El archivo real de una captura: la ruta del contenido es de la web. */
export const abrirCaptura = (rutaWeb: string): Uint8Array =>
  readFileSync(path.join(AQUI, '../../../../..', 'public', rutaWeb))

/**
 * Los DOS archivos que llegan al navegador. **El invariante queda afuera a
 * propósito**: lleva adentro el literal `three` como entrada del control
 * positivo del detector, y no se despacha — incluirlo daría un rojo producido
 * por la propia comprobación.
 */
export const FUENTES: readonly { readonly archivo: string; readonly texto: string }[] = [
  'Trabajos.tsx',
  'geometria.ts',
  'contenido.ts',
].map((f) => ({ archivo: f, texto: leer(f) }))

/** El CSS del tema, de donde salen el fondo invertido, la tinta y los acentos. */
export const CSS = leer('../../../theme-develop.css')

/** El fuente de `Panel.tsx`, para el puente del atributo del panel (§1b). */
export const FUENTE_DEL_PANEL = leer('../../_componentes/Panel.tsx')

const IMPORTA_3D = /from\s+['"](three(\/[^'"]*)?|drei|@react-three\/[^'"]+)['"]/

/** Si un fuente NO importa un motor 3D. El efecto de P7 es HTML con perspectiva. */
export const sinTres = (src: string): boolean => !IMPORTA_3D.test(src)

/** Cuántas veces aparece una aguja en un HTML. */
export const veces = (html: string, aguja: string): number => html.split(aguja).length - 1
