/**
 * LOS DETECTORES DE «TU PANEL» — funciones puras, separadas del invariante.
 *
 * Salen de `s6-tu-panel.invariant.tsx` cuando ese archivo cruzó las 300 líneas.
 * No cambia una sola función: son las mismas, en un archivo donde se leen.
 *
 * Y hay una razón de método además del tamaño, la misma que declara
 * `s3-escaneo.ts`: **un detector se prueba corriendo la MISMA función contra una
 * entrada rota**, y para eso tiene que estar afuera del archivo que lo usa. Un
 * detector que se prueba a sí mismo con otra copia del código no prueba nada.
 *
 * ⚠️ Acá vive también la frase que el lane existe para NO escribir. Está en un
 * instrumento y no en producto porque contiene dígitos pegados a `%` y a `$`:
 * en un archivo de producto haría fallar al escáner de tokens contra su propio
 * arnés.
 */

import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { CLASE_PESO, NIVELES_TIPOGRAFICOS, type Nivel } from '../../_lib/tipografia'
import { textoVisible } from '../_contrato/escaneo'
import { etiquetasEnOrden } from '../_invariantes/marcado'
import { clasesEscritas } from '../_invariantes/soporte'


/** La frase que este lane existe para no escribir. Hace saltar a los tres detectores. */
export const CONTENIDO_PROHIBIDO_DE_CONTROL =
  'Crecimos +340% en 3 meses, con planes desde $99.000 por mes y ×2 de leads.'

// ── Los detectores ─────────────────────────────────────────────────────────

export const VACIAS: ReadonlySet<string> = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

/**
 * El marcado sin los subárboles `aria-hidden`: lo que un lector de pantalla NO
 * anuncia, podado de raíz. El elemento oculto abre nivel igual, porque si no se
 * contara, el primer cierre de un hijo daría la poda por terminada.
 */
export function sinAriaHidden(html: string): string {
  let salida = ''
  let profundidad = 0
  let corte: number | null = null
  let ultimo = 0
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g)) {
    const inicio = m.index ?? 0
    if (corte === null) salida += html.slice(ultimo, inicio)
    ultimo = inicio + m[0].length
    const vacia = VACIAS.has(m[2].toLowerCase()) || m[3].trimEnd().endsWith('/')
    if (m[1] === '/') {
      profundidad -= 1
      if (corte !== null && profundidad === corte) corte = null
      else if (corte === null) salida += m[0]
      continue
    }
    if (corte === null && /\baria-hidden="true"/.test(m[3])) {
      if (!vacia) {
        corte = profundidad
        profundidad += 1
      }
      continue
    }
    if (corte === null) salida += m[0]
    if (!vacia) profundidad += 1
  }
  if (corte === null) salida += html.slice(ultimo)
  return salida
}

/** El texto que la persona recibe: el visible, menos lo que está fuera del árbol. */
export const textoAccesible = (html: string): string => textoVisible(sinAriaHidden(html))

export const cuentaDe = (texto: string, aguja: RegExp): number => (texto.match(aguja) ?? []).length

export const aperturasDe = (html: string, etiqueta: string): number =>
  etiquetasEnOrden(html).filter((e) => e.etiqueta === etiqueta && !e.cierra).length

export const clasesIguales = (html: string, clase: string): number =>
  clasesEscritas(html).filter((c) => c === clase).length

export const valorDe = (html: string, atributo: string): string | undefined =>
  (new RegExp(`${atributo}="([^"]*)"`).exec(html) ?? [])[1]

/** Lo que entra en el orden de tabulación. Un `<a>` sin `href` no cuenta, y un
 *  `tabindex="-1"` es enfocable por código pero NO por Tab. */
export function focalizablesDe(html: string): string[] {
  const encontrados: string[] = []
  for (const m of html.matchAll(/<(a|button|input|select|textarea|summary)\b([^>]*)>/gi)) {
    if (/\sdisabled(?:[=\s>]|$)/i.test(m[2])) continue
    if (m[1].toLowerCase() === 'a' && !/\shref=/.test(m[2])) continue
    encontrados.push(`<${m[1].toLowerCase()}`)
  }
  for (const m of html.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*\btabindex="(?!-1)[^"]*"/gi)) {
    encontrados.push(`<${m[1].toLowerCase()} tabindex`)
  }
  return encontrados
}

/**
 * Qué patrones del sistema NOMBRA un código, sin contar los comentarios.
 *
 * ⚠ Desde SITIO-S7 una sección los nombra por su ID —`patron="P2"`— y no por el
 * objeto —`PATRONES.P2`—, y no es un cambio de estilo: **importar `PATRONES`
 * desde una sección metía el sistema de motion entero en la carga inicial**, que
 * es lo que la compuerta existe para impedir. Las dos formas se buscan porque
 * las dos siguen siendo formas de nombrar un patrón; lo que cambió es cuál usa
 * el producto.
 */
export function patronesNombrados(codigo: string): string[] {
  const vistos = new Set<string>()
  const formas = /\b(?:PATRONES|ANCLAS)\.(P[1-9])\b|patron="(P[1-9])"/g
  for (const m of quitarComentarios(codigo).matchAll(formas)) vistos.add(m[1] ?? m[2])
  return [...vistos].sort()
}

export const FAMILIAS = ['font-titulo', 'font-cuerpo', 'font-codigo']
export const PESOS = Object.values(CLASE_PESO)

export interface ClasePerdida {
  readonly nivel: string
  readonly falta: 'tamaño' | 'familia' | 'peso'
  readonly clases: readonly string[]
}

/**
 * LO QUE `cn()` SE COME EN SILENCIO — medido, no supuesto.
 *
 * `cn()` es `twMerge` sobre `clsx` y NO conoce los nombres del sistema v3: mete
 * `text-<tamaño>` con `text-<color>` en un mismo grupo —y `font-<familia>` con
 * `font-<peso>`— y descarta uno de los dos, sin error de build, de tipos ni de
 * consola. Este detector recorre cada elemento que declara `data-nivel` y exige
 * las tres clases que su nivel tiene que llevar.
 */
export function clasesTipograficasPerdidas(html: string): ClasePerdida[] {
  const perdidas: ClasePerdida[] = []
  for (const m of html.matchAll(/<[a-z][a-z0-9-]*\b[^>]*\bdata-nivel="([^"]*)"[^>]*>/gi)) {
    const nivel = m[1]
    const definicion = NIVELES_TIPOGRAFICOS[nivel as Nivel]
    const clases = (((/class="([^"]*)"/.exec(m[0]) ?? [])[1]) ?? '').split(/\s+/).filter(Boolean)
    if (definicion === undefined) {
      perdidas.push({ nivel, falta: 'tamaño', clases })
      continue
    }
    const conTamano =
      clases.includes(definicion.claseFija) ||
      (definicion.claseFluida !== null && clases.includes(definicion.claseFluida))
    if (!conTamano) perdidas.push({ nivel, falta: 'tamaño', clases })
    if (!FAMILIAS.some((f) => clases.includes(f))) perdidas.push({ nivel, falta: 'familia', clases })
    if (!PESOS.some((p) => clases.includes(p))) perdidas.push({ nivel, falta: 'peso', clases })
  }
  return perdidas
}
