/**
 * LA PLOMERÍA DE LA SALIDA DEL BUILD — qué pide cada ruta y cuánto pesa.
 *
 * Sale de `s3-peso.invariant.ts` en S4, cuando el rediseño de ese invariante lo
 * habría cruzado las 300 líneas. No cambia una sola medición: son las mismas
 * funciones, en un archivo donde se leen.
 *
 * ── De dónde sale "la carga inicial" ──────────────────────────────────────
 *
 * De los `<script src>` del HTML PRERENDERIZADO de cada ruta, no de un
 * manifiesto. Ese HTML es literalmente lo que el servidor manda y lo que el
 * navegador pide en el primer viaje; un manifiesto es una descripción, y encima
 * cambia de forma entre versiones de Next.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

import { RAIZ } from './s3-archivos'

/** Acepta un distDir alternativo por argumento: `… s3-peso.invariant.ts .next-otro`. */
export const DIST = path.join(RAIZ, process.argv[2] ?? '.next')

export function exigirBuild(): void {
  if (!existsSync(DIST)) {
    console.error(`\nNo existe ${DIST}. Corré \`npm run build\` primero.`)
    process.exit(1)
  }
}

export function htmlDe(ruta: string): string {
  const nombre = ruta === '/' ? 'index' : ruta.replace(/^\//, '')
  const archivo = path.join(DIST, 'server', 'app', `${nombre}.html`)
  return existsSync(archivo) ? readFileSync(archivo, 'utf8') : ''
}

/** Los `.js` que pide la carga inicial de una ruta: sus `<script src>`. */
export function conjuntoInicial(ruta: string): string[] {
  const encontrados = htmlDe(ruta).matchAll(/\/_next\/(static\/[^"']+?\.js)/g)
  return [...new Set([...encontrados].map((m) => m[1]))].sort()
}

/** Las hojas que pide una ruta: sus `<link rel=stylesheet>`. */
export function hojasDe(ruta: string): string[] {
  const encontrados = htmlDe(ruta).matchAll(/\/_next\/(static\/css\/[^"']+?\.css)/g)
  return [...new Set([...encontrados].map((m) => m[1]))].sort()
}

export interface Peso {
  readonly crudo: number
  readonly gzip: number
}

export function pesar(archivos: readonly string[]): Peso {
  let crudo = 0
  let gzip = 0
  for (const f of archivos) {
    const p = path.join(DIST, f)
    if (!existsSync(p)) continue
    crudo += statSync(p).size
    gzip += gzipSync(readFileSync(p)).length
  }
  return { crudo, gzip }
}

export const kib = (n: number): string => `${(n / 1024).toFixed(1)} KiB`

export function todosLosChunks(dir = path.join(DIST, 'static', 'chunks'), acumulado: string[] = []): string[] {
  if (!existsSync(dir)) return acumulado
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name)
    if (entrada.isDirectory()) todosLosChunks(completo, acumulado)
    else if (entrada.name.endsWith('.js')) acumulado.push(path.relative(DIST, completo).split(path.sep).join('/'))
  }
  return acumulado
}

export const contiene = (relativo: string, aguja: string): boolean => {
  const p = path.join(DIST, relativo)
  return existsSync(p) && readFileSync(p, 'utf8').includes(aguja)
}

/**
 * LA PARTICIÓN QUE IMPORTA, y es la de S1: los archivos que `/v3` comparte con
 * el home vienen del layout RAÍZ —el chrome viejo, que estos sprints tienen
 * prohibido tocar—; el resto es lo propio de la ruta.
 *
 * Se calcula acá y no en cada invariante para que las dos cifras publicadas no
 * puedan divergir por usar dos métodos distintos.
 */
export interface Particion {
  readonly heredados: readonly string[]
  readonly propios: readonly string[]
  readonly pesoHeredado: Peso
  readonly pesoPropio: Peso
}

export function partirCargaInicial(inicialDeLaRuta: readonly string[], inicialDelHome: readonly string[]): Particion {
  const heredados = inicialDeLaRuta.filter((f) => inicialDelHome.includes(f))
  const propios = inicialDeLaRuta.filter((f) => !inicialDelHome.includes(f))
  return { heredados, propios, pesoHeredado: pesar(heredados), pesoPropio: pesar(propios) }
}
