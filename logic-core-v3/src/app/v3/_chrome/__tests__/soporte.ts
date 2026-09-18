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

/** Un `href` a una sección que no existe. */
export const HREFS_A_LA_NADA: readonly string[] = ['#no-existe', 'https://develop.example/contacto']

/** El marcado de la pieza del pie SIN el peso restaurado. */
export const MARCADO_SIN_PESO = '<span class="font-cuerpo text-caption font-normal font-codigo uppercase">[ENLACE]</span>'
