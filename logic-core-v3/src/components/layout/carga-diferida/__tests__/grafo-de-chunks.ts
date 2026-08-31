/**
 * EL GRAFO DE MÓDULOS DE UN CHUNK — para poder decir «cuánto de este archivo se
 * puede mover», y no «cuánto pesa el archivo».
 *
 * Vive aparte del invariante por la razón de `soporte.ts`: **un detector se
 * prueba corriendo la MISMA función contra una entrada rota**, y para eso tiene
 * que estar afuera del archivo que lo usa. No lleva el sufijo `.invariant`: un
 * `.invariant.ts` sin script en `package.json` es un instrumento que no corre.
 *
 * ── POR QUÉ HACE FALTA ────────────────────────────────────────────────────
 *
 * §7.30 mide el chunk del SDK de Sentry pesando el ARCHIVO, y de ahí sale «sin
 * ese chunk `/v3` mediría 235,3». Es cierto como resta y es falso como plan: el
 * archivo es un chunk COMPARTIDO de webpack —263 módulos— y la mitad se los
 * piden otros chunks de la misma carga inicial. Soltar la referencia de
 * `instrumentation-client.ts` no lo borra: lo achica hasta donde llegan los
 * otros pedidos. Para saber hasta dónde hay que leer el grafo, no el `stat`.
 *
 * ── CÓMO SE LEE UN CHUNK ──────────────────────────────────────────────────
 *
 * Un chunk de Next es `(...).push([[id],{ID:(a,e,t)=>{…},ID:…}])`. Cada módulo
 * es una función y su TERCER parámetro es `__webpack_require__` minificado — el
 * nombre CAMBIA entre chunks (`r` en los de vendor, `t` en `main-app`), así que
 * se lee de la cabecera de cada módulo en vez de darlo por sentado. Buscar `r(`
 * a ciegas fue el primer error de este instrumento: daba «ninguna raíz» para
 * `main-app`, que es justamente la puerta más grande.
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

export interface ModuloDeChunk {
  readonly cuerpo: string
  readonly requiere: ReadonlySet<string>
}

export interface PesoDeModulos {
  readonly modulos: number
  readonly crudo: number
  readonly gzip: number
}

/** `ID:(a,b,c)=>{`, precedido por la llave o la coma que lo separa del anterior. */
const CABECERA = '[{,](\\d{2,6}):\\(([A-Za-z_$][\\w$]*)?(?:,([A-Za-z_$][\\w$]*))?(?:,([A-Za-z_$][\\w$]*))?\\)=>\\{'

/** Los ids que un cuerpo le pide a webpack: `t(123)`, `t.bind(t,123)`, `t.t(123,…)`. */
function pedidosDe(cuerpo: string, requerir: string | undefined): ReadonlySet<string> {
  const ids = new Set<string>()
  if (requerir === undefined) return ids
  const rx = new RegExp(`\\b${requerir}(?:\\.bind\\(${requerir},|\\.t\\(|\\()\\s*(\\d{2,6})\\s*[,)]`, 'g')
  for (const m of cuerpo.matchAll(rx)) ids.add(m[1])
  return ids
}

/** El mapa de módulos de un texto de chunk. Vacío si el texto no es un chunk. */
export function todosLosChunksDe(texto: string): Map<string, ModuloDeChunk> {
  const cortes: Array<{ id: string; requerir: string | undefined; desde: number }> = []
  for (const m of texto.matchAll(new RegExp(CABECERA, 'g'))) {
    cortes.push({ id: m[1], requerir: m[4], desde: (m.index ?? 0) + 1 })
  }
  const fin = texto.lastIndexOf('},')
  const mapa = new Map<string, ModuloDeChunk>()
  cortes.forEach((c, i) => {
    const hasta = i + 1 < cortes.length ? cortes[i + 1].desde - 1 : fin
    if (hasta <= c.desde) return
    const cuerpo = texto.slice(c.desde, hasta)
    mapa.set(c.id, { cuerpo, requiere: pedidosDe(cuerpo, c.requerir) })
  })
  return mapa
}

export function modulosDeChunk(dist: string, relativo: string): Map<string, ModuloDeChunk> {
  const p = path.join(dist, relativo)
  if (!existsSync(p)) return new Map()
  return todosLosChunksDe(readFileSync(p, 'utf8'))
}

/**
 * El primero de `archivos` cuyo contenido lleva `huella`. Se identifica por
 * huella y no por nombre a propósito: los nombres de chunk traen hash de
 * contenido y una lista escrita a mano se vence en el próximo build.
 */
export function chunkConHuella(dist: string, archivos: readonly string[], huella: string): string | null {
  for (const f of archivos) {
    const p = path.join(dist, f)
    if (existsSync(p) && readFileSync(p, 'utf8').includes(huella)) return f
  }
  return null
}

/** Los módulos alcanzables desde `semillas` siguiendo `requiere`. */
export function cierreTransitivo(mods: ReadonlyMap<string, ModuloDeChunk>, semillas: Iterable<string>): Set<string> {
  const vistos = new Set<string>()
  const pila = [...semillas]
  while (pila.length > 0) {
    const id = pila.pop()
    if (id === undefined || vistos.has(id)) continue
    const m = mods.get(id)
    if (m === undefined) continue
    vistos.add(id)
    for (const d of m.requiere) if (mods.has(d)) pila.push(d)
  }
  return vistos
}

/**
 * El peso de un subconjunto de módulos. El gzip es el de los cuerpos
 * CONCATENADOS: no es aditivo —dos mitades comprimen mejor juntas que separadas—
 * así que sirve como orden de magnitud del subconjunto, no como la cifra exacta
 * que daría un chunk aparte. Se dice acá para que no se lea como otra cosa.
 */
export function pesarModulos(mods: ReadonlyMap<string, ModuloDeChunk>, ids: Iterable<string>): PesoDeModulos {
  const cuerpos: string[] = []
  for (const id of ids) {
    const m = mods.get(id)
    if (m !== undefined) cuerpos.push(m.cuerpo)
  }
  return {
    modulos: cuerpos.length,
    crudo: cuerpos.reduce((a, s) => a + s.length, 0),
    gzip: cuerpos.length === 0 ? 0 : gzipSync(Buffer.from(cuerpos.join(''))).length,
  }
}

/**
 * Qué módulos de `destino` le pide cada uno de `otrosChunks`. Es la lista de
 * PUERTAS: cada chunk que aparece acá mantiene vivo el chunk de destino aunque
 * el importador original lo suelte.
 */
export function puertasHacia(
  dist: string,
  otrosChunks: readonly string[],
  destino: ReadonlyMap<string, ModuloDeChunk>,
): Map<string, Set<string>> {
  const puertas = new Map<string, Set<string>>()
  for (const c of otrosChunks) {
    const pedidos = new Set<string>()
    for (const [, m] of modulosDeChunk(dist, c)) {
      for (const id of m.requiere) if (destino.has(id)) pedidos.add(id)
    }
    if (pedidos.size > 0) puertas.set(c, pedidos)
  }
  return puertas
}

export const hayBuild = (dist: string): boolean => existsSync(path.join(dist, 'build-manifest.json'))

/**
 * Los archivos del fuente que cambiaron DESPUÉS del build de disco. Es la guarda
 * de §7.31: comparar contra una línea de base sin saber qué cambió entre las dos
 * mediciones no es una medición, es una coincidencia con formato. Si esta lista
 * no está vacía, el número de «después» mide otro código.
 */
export function masNuevosQueElBuild(dist: string, raiz: string, archivos: readonly string[]): string[] {
  const manifiesto = path.join(dist, 'build-manifest.json')
  if (!existsSync(manifiesto)) return [...archivos]
  const cuando = statSync(manifiesto).mtimeMs
  return archivos.filter((a) => {
    const p = path.join(raiz, a)
    return existsSync(p) && statSync(p).mtimeMs > cuando
  })
}
