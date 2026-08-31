import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * LA PLOMERÍA DE `s8-chrome` — los detectores, afuera del archivo que los usa.
 *
 * ⚠ **No es prolijidad: es la condición del control positivo.** Un detector se
 * prueba corriendo LA MISMA función contra una entrada deliberadamente
 * equivocada, y para eso la función tiene que vivir afuera del archivo que la
 * usa — un detector que se prueba a sí mismo con otra copia del código no prueba
 * nada. Es el patrón de `s7-soporte.ts` y de `s8-padron.ts`.
 *
 * ⚠ Y la segunda razón, que es §7.25: **este archivo guarda las entradas rotas a
 * propósito** —un `overflow: hidden`, un `overflow-hidden` de Tailwind, un
 * envoltorio que rompe el `sticky`— y por eso ningún escáner del sprint lo puede
 * mirar sin ponerse rojo contra su propio arnés. No lleva el sufijo
 * `.invariant`: un `.invariant` sin script en `package.json` es un instrumento
 * que no corre nunca, y hay una comprobación que lo caza.
 */

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

export function leer(relativo: string): string {
  return readFileSync(path.join(RAIZ, relativo), 'utf8')
}

export function existe(relativo: string): boolean {
  try {
    statSync(path.join(RAIZ, relativo))
    return true
  } catch {
    return false
  }
}

/**
 * El código sin comentarios ni contenido de cadenas.
 *
 * ⚠ Hace falta y no es cosmético (§7.25): el layout RAÍZ **explica en un
 * comentario** que el gate del preloader «reemplazó al `overflow:hidden` de
 * EarlyScrollLock», y este archivo documenta el `overflow` que busca. Un
 * detector que mirara el archivo entero encontraría la explicación y pondría en
 * rojo justamente el trabajo de haberla escrito.
 */
export function sinComentariosNiCadenas(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
}

/** Igual, pero conservando las cadenas: un `className` ES una cadena. */
export function sinComentarios(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')
    .replace(/\/\/[^\n]*/g, ' ')
}

/** Los `className` escritos en un fuente, como lista de clases. */
export function clasesEscritas(fuente: string): string[] {
  const limpio = sinComentarios(fuente)
  const cadenas = [
    ...[...limpio.matchAll(/className=\{?["'`]([^"'`]*)["'`]/g)].map((m) => m[1]),
    ...[...limpio.matchAll(/class="([^"]*)"/g)].map((m) => m[1]),
  ]
  return [...new Set(cadenas.flatMap((c) => c.split(/\s+/)).filter((c) => c.length > 0))]
}

/**
 * EL DETECTOR QUE IMPORTA — `overflow` recortado en una hoja de estilos.
 *
 * `position: sticky` **se apaga en silencio** si cualquier ancestro tiene
 * `overflow` distinto de `visible`: sin un error, sin un aviso, y con un marcado
 * que se ve correcto. Por eso la cadena de ancestros de la pastilla se afirma, y
 * se afirma sobre el código.
 *
 * `overscroll-behavior` NO cuenta y hay que excluirlo a mano: el layout raíz lo
 * declara en `html, body` y no tiene nada que ver — no crea contexto de
 * desplazamiento. Un detector que lo contara daría un falso rojo permanente.
 */
export function overflowsRecortados(css: string): string[] {
  return [...css.matchAll(/(?<![-\w])(overflow(?:-[xy]|-block|-inline)?)\s*:\s*([^;}]+)/g)]
    .map((m) => `${m[1]}: ${m[2].trim()}`)
    .filter((d) => !/:\s*visible\b/.test(d))
}

/**
 * Las reglas de un CSS, aplanadas: selector y cuerpo.
 *
 * El anidado de `@layer` y `@media` sale gratis — el bloque de afuera no casa
 * porque su cuerpo tiene llaves, así que el motor avanza y encuentra el de
 * adentro. Es lo que hace falta acá: las reglas de `html, body` de `globals.css`
 * viven dentro de un `@layer base`.
 */
export function reglasPlanas(css: string): { selector: string; cuerpo: string }[] {
  return [...sinComentariosCss(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim().replace(/\s+/g, ' '),
    cuerpo: m[2],
  }))
}

export function sinComentariosCss(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ')
}

/**
 * Los `overflow` recortados que caen sobre un ANCESTRO de la pastilla.
 *
 * Se filtra por selector y no se escanea la hoja entera: `globals.css` tiene
 * `overflow: hidden` en piezas del sitio viejo que no son ancestros de nada de
 * /v3, y contarlas daría un rojo permanente que no significa nada.
 */
export function overflowsSobreAncestros(css: string, ancestros: readonly string[]): string[] {
  return reglasPlanas(css)
    .filter((r) => r.selector.split(',').some((s) => ancestros.includes(s.trim())))
    .flatMap((r) => overflowsRecortados(r.cuerpo).map((d) => `${r.selector} { ${d} }`))
}

/** Las utilidades de Tailwind de `overflow` escritas en un `className`. */
export function clasesDeOverflow(fuente: string): string[] {
  return clasesEscritas(fuente).filter((c) =>
    /^(?:[a-z0-9:-]+:)?overflow-(?:x-|y-)?(?:hidden|auto|scroll|clip)$/.test(c),
  )
}

/**
 * Un escalón de espaciado, en px, LEÍDO del tema.
 *
 * No se transcribe ni se deduce de la unidad base: si `--spacing-20` cambiara de
 * valor, la cuenta del aire del pie del Hero se mueve con él o se pone roja. La
 * raíz de 16 la declara el propio tema, en el comentario que traduce cada rem.
 */
export function pxDeEspaciado(escalon: string, tema: string): number {
  const m = new RegExp(`--spacing-${escalon}:\\s*([\\d.]+)rem`).exec(tema)
  if (m === null) throw new Error(`--spacing-${escalon} no está declarado en el tema`)
  return Number.parseFloat(m[1]) * 16
}

/** El primer elemento que abre un marcado: su etiqueta y sus atributos. */
export function primerElemento(html: string): string {
  return /<([a-z][a-z0-9]*)\b[^>]*>/i.exec(html)?.[0] ?? ''
}

/** Los `href` de un marcado renderizado. */
export function hrefsDe(html: string): string[] {
  return [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1])
}

/** Los que NO caen en la lista de anclas que existen. Un `href` a la nada. */
export function aLaNada(hrefs: readonly string[], anclas: readonly string[]): string[] {
  return hrefs.filter((h) => !h.startsWith('#') || !anclas.includes(h))
}

/** Las clases del elemento cuyo texto visible es `texto`. Para leer un peso. */
export function clasesDelElementoCon(html: string, texto: string): string[] {
  const re = new RegExp(`<[a-z][a-z0-9]*\\b[^>]*\\sclass="([^"]*)"[^>]*>${texto}<`, 'i')
  return (re.exec(html)?.[1] ?? '').split(/\s+/).filter((c) => c.length > 0)
}

/**
 * Los especificadores de import de un fuente, estáticos y perezosos.
 *
 * Se borran los comentarios y **no las cadenas**: el especificador ES una
 * cadena. Es la corrección que `s8-padron.ts` documenta.
 */
export function importsDe(fuente: string): string[] {
  const limpio = sinComentarios(fuente)
  return [
    ...[...limpio.matchAll(/^\s*import\s[\s\S]*?from\s+'([^']+)'/gm)].map((m) => m[1]),
    ...[...limpio.matchAll(/import\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]),
  ]
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LAS ENTRADAS ROTAS — a propósito, para los controles positivos.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Una hoja con el `overflow` que apagaría la pastilla. */
export const CSS_CON_OVERFLOW = 'main { position: relative; overflow: hidden; }'

/** Y la misma trampa escrita como utilidad de Tailwind. */
export const TSX_CON_OVERFLOW = '<main className="relative z-10 overflow-x-hidden">{children}</main>'

/**
 * El envoltorio que rompe el `sticky` SIN un solo error: un `<div>` de alto
 * automático entre el `<main>` y la pastilla mide lo que mide su contenido
 * —cero— y el rango de pegado queda en cero.
 */
export const MARCADO_CON_ENVOLTORIO = '<div data-chrome=""><div data-pieza="navegacion"></div></div>'

/** Un `href` a una sección que no existe. */
export const HREFS_A_LA_NADA: readonly string[] = ['#no-existe', 'https://develop.example/contacto']

/** El marcado de la pieza del pie SIN el peso restaurado. */
export const MARCADO_SIN_PESO = '<span class="font-cuerpo text-caption font-normal font-codigo uppercase">[ENLACE]</span>'
