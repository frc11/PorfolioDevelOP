/**
 * LA PLOMERÍA DEL INSTRUMENTO DEL CIERRE — detectores puros y entradas rotas.
 *
 * Vive aparte del invariante por dos razones, y las dos importan:
 *
 *   1. **Un detector se prueba corriendo la MISMA función contra una entrada
 *      rota.** Para eso la función tiene que estar afuera del archivo que la
 *      usa: un detector que se prueba a sí mismo con otra copia del código no
 *      prueba nada. Es el criterio de `_lib/__tests__/s3-escaneo.ts`.
 *   2. **Ningún archivo del lane pasa las 300 líneas**, y un instrumento no es
 *      una excepción a esa regla.
 *
 * ⚠️ ESTE ARCHIVO NO SE ESCANEA, y hay que decirlo. Guarda a propósito un hex,
 * un píxel suelto, un `gap-[32px]`, un `text-acento` y la frase con cifras
 * inventadas que el lane existe para no escribir: son las entradas de los
 * controles positivos. Incluirlo en el escaneo de tokens haría fallar la
 * comprobación por culpa de su propio arnés. El invariante lo excluye POR
 * NOMBRE y afirma que lo excluyó — la exclusión es visible, no silenciosa. Es
 * la misma excepción declarada que `_invariantes/soporte.ts` ya lleva escrita.
 */

import {
  apagadosDeFoco,
  arbitrariosSinVar,
  funcionesDeColorEncontradas,
  hexEncontrados,
  literalesConUnidad,
} from '../../_lib/__tests__/s3-escaneo'
import { NIVELES_TIPOGRAFICOS, type Nivel } from '../../_lib/tipografia'
import { CLASES_DE_ACENTO } from '../_contrato/acento'
import { textoVisible } from '../_contrato/escaneo'
import { ANCLAS_QUE_EXISTEN } from './contenido'

/** Cómo se llama este archivo. El invariante lo excluye del escaneo con esto. */
export const ARCHIVO_DE_APOYO = 'soporte.ts'

/**
 * LA ENTRADA DEL CONTROL POSITIVO DEL ESCÁNER DE CONTENIDO.
 * Es la frase que este lane existe para no escribir, y tiene que hacer saltar a
 * los tres detectores: cifras con símbolo, precio y números sin declarar.
 */
export const CONTENIDO_PROHIBIDO = 'Crecimos +340% en 3 meses, con planes desde $99.000 por mes y ×2 de leads.'

/** Cada detector de tokens con la entrada que TIENE que hacerlo saltar. */
export const DETECTORES = [
  ['hex escritos a mano', hexEncontrados, '.a { color: #0E0E0E }'],
  ['funciones de color', funcionesDeColorEncontradas, '.a { color: rgba(1,2,3,.4) }'],
  ['literales con unidad', literalesConUnidad, 'const a = "24px"'],
  ['arbitrarios sin var()', arbitrariosSinVar, 'const c = "gap-[32px]"'],
  ['apagados del anillo', apagadosDeFoco, 'const c = "outline-none"'],
] as const

/** Marcado fabricado con un acento como texto, para probar ese detector. */
export const MARCADO_CON_ACENTO_DE_TEXTO = `<p class="${CLASES_DE_ACENTO.texto}">x</p>`
export const MARCADO_CON_ACENTO_DE_BORDE = `<p class="${CLASES_DE_ACENTO.borde}">x</p>`
/** Un icono de lucide sin la prop de grosor. */
export const ICONO_SIN_GROSOR = "import { X } from 'lucide-react'\n<X className='a' />"
/** Un pie rehecho a mano en vez de consumido. */
export const PIE_REHECHO = '<footer data-pieza="pie">x</footer>'

// ── Texto ──────────────────────────────────────────────────────────────────

export function palabras(html: string): string[] {
  return textoVisible(html).split(/\s+/).filter(Boolean)
}

/** El vocabulario visible, ordenado. Tolera que el divisor duplique el titular. */
export function vocabulario(html: string): string[] {
  return [...new Set(palabras(html))].sort()
}

// ── Foco ───────────────────────────────────────────────────────────────────

/** Un `<a>` sin href, un control `disabled` y un `tabindex="-1"` no son paradas. */
export function focalizables(html: string): string[] {
  return [...html.matchAll(/<(?:a|button|input|select|textarea)\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((e) => !/\bdisabled[=\s>]/.test(e) && !/tabindex="-1"/i.test(e))
    .filter((e) => !(e.startsWith('<a') && !/\shref=/.test(e)))
}

// ── El formulario ──────────────────────────────────────────────────────────

export function formaDe(html: string): string {
  return /<form\b[^>]*>[\s\S]*?<\/form>/.exec(html)?.[0] ?? ''
}
export function aperturaDe(forma: string): string {
  return /<form\b[^>]*>/.exec(forma)?.[0] ?? ''
}
export function enviosDe(forma: string): string[] {
  return [...forma.matchAll(/<button\b[^>]*>/g)].map((m) => m[0]).filter((b) => /type="submit"/.test(b))
}

/**
 * El predicado entero del éxito falso, en una función, para poder correrlo
 * contra el marcado equivocado: el primer botón de envío en orden de árbol
 * tiene que estar `disabled` y el `<form>` no puede declarar `action`.
 */
export function sinExitoFalso(html: string): boolean {
  const forma = formaDe(html)
  const envios = enviosDe(forma)
  return envios.length > 0 && /\bdisabled[=\s>]/.test(envios[0]) && !/\saction=/.test(aperturaDe(forma))
}

// ── Enlaces ────────────────────────────────────────────────────────────────

export function hrefsDe(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1])
}

/** Los que NO son un ancla de esta ruta. Devuelve la lista, no un booleano. */
export function aLaNada(lista: readonly string[]): string[] {
  return lista.filter((h) => !h.startsWith('#') || !ANCLAS_QUE_EXISTEN.includes(h))
}

// ── Acento ─────────────────────────────────────────────────────────────────

export function conAcento(clases: readonly string[]): string[] {
  return clases.filter((c) => c.includes('acento'))
}

/** Las dos formas prohibidas sobre la superficie invertida: texto y borde. */
export function comoTexto(clases: readonly string[]): string[] {
  return clases.filter((c) => c === CLASES_DE_ACENTO.texto || c === CLASES_DE_ACENTO.borde)
}

// ── El pie, los iconos y la superficie ─────────────────────────────────────

export function rehaceElPie(texto: string): string[] {
  return [...texto.matchAll(/<footer\b|data-pieza="pie|\[data-pieza="pie/g)].map((m) => m[0])
}

export function conteoDeIconos(texto: string): { usos: number; conGrosor: number } {
  const nombres = [...texto.matchAll(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/g)]
    .flatMap((m) => m[1].split(','))
    .map((s) => s.trim())
    .filter(Boolean)
  if (nombres.length === 0) return { usos: 0, conGrosor: 0 }
  return {
    usos: [...texto.matchAll(new RegExp(`<(?:${nombres.join('|')})\\b`, 'g'))].length,
    conGrosor: [...texto.matchAll(/strokeWidth=\{1\.5\}/g)].length,
  }
}

/** Cero iconos también falla: si no ve ninguno, el detector no midió nada. */
export function grosorOk(texto: string): boolean {
  const c = conteoDeIconos(texto)
  return c.usos > 0 && c.usos === c.conGrosor
}

export function svgsDe(html: string): string[] {
  return [...html.matchAll(/<svg\b[^>]*>/g)].map((m) => m[0])
}
export function svgsSinGrosor(html: string): string[] {
  return svgsDe(html).filter((s) => !s.includes('stroke-width="1.5"'))
}

/** Saca los dos atributos que la superficie cambia, para comparar el resto. */
export function pelar(html: string): string {
  return html.replace(/ data-superficie="[^"]*"/, '').replace(/ data-seccion="invertida"/, '')
}

export function escalonan(ventanas: readonly { readonly desde: number }[]): boolean {
  return ventanas.length > 1 && ventanas.every((v, i) => i === 0 || v.desde > ventanas[i - 1].desde)
}

/**
 * El color EFECTIVO de una tinta con opacidad sobre un fondo. Es lo que hay que
 * medir para saber si `opacity-casi` sobre la tinta pasa AA: la razón de
 * contraste se calcula contra el color compuesto, no contra la tinta pura.
 */
export function mezclar(frente: string, fondo: string, alfa: number): string {
  const c = (hex: string, i: number): number => Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  const canal = (i: number): string =>
    Math.round(c(frente, i) * alfa + c(fondo, i) * (1 - alfa))
      .toString(16)
      .padStart(2, '0')
  return `#${canal(0)}${canal(1)}${canal(2)}`
}

// ── LA TRAMPA DE `cn()` ────────────────────────────────────────────────────

/**
 * `cn()` es `twMerge` sobre `clsx`, y **no conoce los nombres del sistema v3**:
 * mete `text-<tamaño>` y `text-<color>` en el mismo grupo y descarta uno de los
 * dos EN SILENCIO. Igual entre `font-<familia>` y `font-<peso>` — y `font-medio`
 * ni siquiera lo reconoce como peso, así que lo trata como familia.
 *
 * Sin error de build, sin error de tipos, sin nada en consola. La única forma de
 * verlo es mirar el marcado renderizado: cada elemento de texto lleva su
 * `data-nivel`, así que se puede exigir que su clase todavía contenga la
 * utilidad de tamaño —fija o fluida— que ese nivel declara.
 *
 * Devuelve los elementos que la perdieron, con su clase entera, para que el
 * fallo diga cuál y no cuántos.
 */
export function tamanosPerdidos(html: string): string[] {
  const perdidos: string[] = []
  for (const m of html.matchAll(/<[a-z0-9]+\b[^>]*\sdata-nivel="([^"]+)"[^>]*\sclass="([^"]*)"/g)) {
    const definicion = NIVELES_TIPOGRAFICOS[m[1] as Nivel] as (typeof NIVELES_TIPOGRAFICOS)[Nivel] | undefined
    if (definicion === undefined) {
      perdidos.push(`nivel desconocido: ${m[1]}`)
      continue
    }
    const clases = m[2].split(/\s+/)
    const tiene =
      clases.includes(definicion.claseFija) ||
      (definicion.claseFluida !== null && clases.includes(definicion.claseFluida))
    if (!tiene) perdidos.push(`${m[1]} → "${m[2]}"`)
  }
  return perdidos
}

/** Cuántos elementos con nivel miró el detector de arriba. Es el contrapeso. */
export function nivelesVistos(html: string): number {
  return [...html.matchAll(/\sdata-nivel="[^"]+"/g)].length
}

/**
 * Los colores de texto del sistema. Pasarle uno por `className` a un componente
 * de texto le borra el TAMAÑO, en silencio. Esta sección no escribe ninguno: el
 * color se hereda de la superficie, que es además lo que la hace correcta con
 * `papel-opaco` y con `oscuro-opaco` sin tocar una línea.
 */
export const COLORES_DE_TEXTO = ['text-tinta', 'text-tinta-media', 'text-tinta-tenue', 'text-fondo', 'text-acento']

export function coloresDeTextoEnFuente(fuente: string): string[] {
  return [...fuente.matchAll(/className="([^"]*)"/g)]
    .flatMap((m) => m[1].split(/\s+/))
    .filter((c) => COLORES_DE_TEXTO.includes(c))
}

/** Las tres familias del sistema. Un texto sin ninguna perdió la suya en `cn()`. */
const FAMILIAS = ['font-titulo', 'font-cuerpo', 'font-codigo']

/** Elementos de texto que se quedaron SIN familia. Se publica, no se afirma:
 *  los que hay salen de componentes compartidos y este lane no los toca. */
export function familiasComidas(html: string): string[] {
  return [...html.matchAll(/<[a-z0-9]+\b[^>]*\sdata-nivel="([^"]+)"[^>]*\sclass="([^"]*)"/g)]
    .filter((m) => !m[2].split(/\s+/).some((c) => FAMILIAS.includes(c)))
    .map((m) => `${m[1]} → "${m[2]}"`)
}

/**
 * Las piezas del pie también usan `cn()` con su clase de tamaño. Acá no se les
 * pasa ningún `className`, así que no pueden perderla; esto lo afirma.
 */
export function piezasDelPieSinTamano(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*data-pieza="pie-enlace-icono"[^>]*\sclass="([^"]*)"/g)]
    .map((m) => m[1])
    .filter((clases) => !clases.split(/\s+/).includes('text-cuerpo'))
}

/** ── B1 · EL LECTOR DE TOKENS DEL TEMA y la caja de línea. Mudados del
 *  invariante con el corte que este archivo declara —plomería, no
 *  afirmaciones—: leer un `clamp()` y quedarse con su piso es aritmética de CSS.
 *  `tokenPx` es FÁBRICA porque necesita el tema y se instancia una vez. */
const RAIZ_PX = 16

export function lectorDeTokens(tema: string): (nombre: string) => number {
  return (nombre: string): number => {
    const v = (new RegExp(`${nombre}\s*:\s*([^;]+);`).exec(tema)?.[1] ?? '').trim()
    const clamp = /^clamp\((-?[\d.]+)px/.exec(v)
    if (clamp !== null) return Number.parseFloat(clamp[1])
    const rem = /^(-?[\d.]+)rem$/.exec(v)
    if (rem !== null) return Number.parseFloat(rem[1]) * RAIZ_PX
    const px = /^(-?[\d.]+)px$/.exec(v)
    return px !== null ? Number.parseFloat(px[1]) : Number.parseFloat(v)
  }
}

/** El alto de una caja de línea: tamaño por interlineado, los dos como tokens. */
export function cajaDeLineaCon(tokenPx: (n: string) => number): (texto: string, interlineado: string) => number {
  return (texto: string, interlineado: string): number => tokenPx(texto) * tokenPx(interlineado)
}

/** ── B1 · EL MODELO DE ALTO DEL PIE, derivado de tokens. Las cajas que suman el
 *  alto del Cierre; las AFIRMACIONES —a 1440 entra, a 375 se pasa— se quedan en
 *  el invariante. `apilar` sale con ellas porque el control positivo la usa para
 *  demostrar que el alto de una columna CRECE con su lista. */
export function modeloDelPie(tokenPx: (n: string) => number, cajaDeLinea: (t: string, i: string) => number) {
  const MICRO = cajaDeLinea('--text-micro', '--leading-micro')
  const apilar = (n: number, caja: number): number =>
    MICRO + tokenPx('--spacing-4') + n * caja + (n - 1) * tokenPx('--spacing-2')
  return {
    MICRO,
    apilar,
    CAMPO: 2 * tokenPx('--spacing-2') + cajaDeLinea('--text-caption', '--leading-texto'),
    ENLACE: cajaDeLinea('--text-cuerpo', '--leading-texto'),
    CTA_ALTO: cajaDeLinea('--text-cuerpo', '--leading-texto') + 2 * tokenPx('--spacing-2'),
    LINEA_ALTO: cajaDeLinea('--text-caption', '--leading-texto') + tokenPx('--spacing-1') + MICRO,
    SEPARACIONES: 4 * tokenPx('--spacing-12'),
    RELLENO: 2 * tokenPx('--spacing-20'),
  }
}
