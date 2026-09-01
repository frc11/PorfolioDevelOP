/**
 * ABRIR EL `.woff2` QUE /v3 SIRVE — `head`, `maxp`, `hhea`, `OS/2`, `cmap` y
 * `hmtx`, sin una dependencia nueva.
 *
 * Sale de `s10-avance.ts` cuando ese archivo cruzó las 300 líneas, y la costura
 * es de naturaleza: acá se lee un BINARIO y del otro lado se mide un TEXTO.
 * Quien arregle un desplazamiento de tabla no toca el algoritmo de corte de
 * línea, y quien cambie el corte no vuelve a abrir el binario.
 *
 * ── El control que lo hace honesto, y lo trae la propia fuente ─────────────
 *
 * `OS/2` declara `xAvgCharWidth`: **el ancho medio de carácter que el binario
 * publica**. Si el `hmtx` que este archivo lee no lo reproduce, el parseo está
 * mal. No es una comparación contra una constante escrita en un reporte: es
 * contra otro campo del mismo archivo, escrito por otra parte del pipeline de
 * la fuente. Y hay un segundo control todavía más duro: **Chivo Mono es
 * monoespaciada**, así que sus avances tienen que ser TODOS el mismo número —
 * un desplazamiento mal calculado no puede producir eso por casualidad.
 *
 * `s3-woff2.ts` ya abre estos mismos archivos para `head` y `OS/2`. Este lector
 * es independiente a propósito —necesita el flag de transformación de `hmtx`,
 * que aquél no expone— y esa independencia es el tercer control: los dos tienen
 * que leer el mismo `unitsPerEm`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { brotliDecompressSync } from 'node:zlib'

import { RAIZ } from './s3-archivos'

/** Las 63 etiquetas conocidas del formato, en el orden que fija la norma. */
const ETIQUETAS = [
  'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm',
  'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern',
  'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC',
  'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar',
  'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty',
  'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat',
  'Gloc', 'Feat', 'Sill',
]

export interface TablasDeAvance {
  readonly unidadesPorEm: number
  /** El ancho medio que la propia fuente declara en `OS/2`. Es el control. */
  readonly anchoMedioDeclarado: number
  /** Avance por índice de glifo, en unidades de la fuente. */
  readonly avances: readonly number[]
  /** Punto de código → índice de glifo. */
  readonly cmap: ReadonlyMap<number, number>
}

interface Tabla {
  readonly etiqueta: string
  readonly bloque: Buffer
  readonly transformada: boolean
}

/**
 * Abre un WOFF2 y devuelve sus tablas ya descomprimidas, con la marca de si
 * venían transformadas. Es la misma caminata que `s3-woff2.ts` hace para `head`
 * y `OS/2`; se repite acá porque este lector necesita el flag de transformación
 * de `hmtx`, que aquél no expone. **Que sean dos lectores independientes es
 * además el control cruzado**: los dos tienen que leer el mismo `unitsPerEm`.
 */
function tablasDe(relativo: string): Tabla[] {
  const buffer = readFileSync(path.join(RAIZ, relativo))
  if (buffer.toString('ascii', 0, 4) !== 'wOF2') throw new Error(`${relativo} no es un WOFF2`)

  const cantidadDeTablas = buffer.readUInt16BE(12)
  const largoComprimido = buffer.readUInt32BE(20)

  let cursor = 48
  const leerBase128 = (): number => {
    let acumulado = 0
    for (let i = 0; i < 5; i += 1) {
      const byte = buffer[cursor]
      cursor += 1
      acumulado = (acumulado << 7) | (byte & 0x7f)
      if ((byte & 0x80) === 0) return acumulado >>> 0
    }
    throw new Error('entero base 128 mal formado')
  }

  const directorio: { etiqueta: string; largo: number; transformada: boolean }[] = []
  for (let i = 0; i < cantidadDeTablas; i += 1) {
    const banderas = buffer[cursor]
    cursor += 1
    const indice = banderas & 0x3f
    let etiqueta: string
    if (indice === 63) {
      etiqueta = buffer.toString('ascii', cursor, cursor + 4)
      cursor += 4
    } else {
      etiqueta = ETIQUETAS[indice]
    }
    const largoOriginal = leerBase128()
    const transformacion = (banderas >> 6) & 0x3
    const transformada =
      etiqueta === 'glyf' || etiqueta === 'loca' ? transformacion !== 3 : transformacion !== 0
    const largoTransformado = transformada ? leerBase128() : null
    directorio.push({ etiqueta, largo: largoTransformado ?? largoOriginal, transformada })
  }

  const crudo = brotliDecompressSync(buffer.subarray(cursor, cursor + largoComprimido))
  const tablas: Tabla[] = []
  let desplazamiento = 0
  for (const t of directorio) {
    tablas.push({
      etiqueta: t.etiqueta,
      bloque: crudo.subarray(desplazamiento, desplazamiento + t.largo),
      transformada: t.transformada,
    })
    desplazamiento += t.largo
  }
  return tablas
}

function exigir(tablas: readonly Tabla[], etiqueta: string): Tabla {
  const t = tablas.find((x) => x.etiqueta === etiqueta)
  if (t === undefined) throw new Error(`la fuente no trae la tabla ${etiqueta}`)
  return t
}

/**
 * `cmap`, formatos 4 y 12. Son los dos que un subset latino puede traer, y si
 * viene otro esto TIRA en vez de devolver un mapa a medias: un mapa incompleto
 * mediría textos con glifos faltando y daría anchos más chicos sin avisar.
 */
function leerCmap(bloque: Buffer): Map<number, number> {
  const cantidad = bloque.readUInt16BE(2)
  let mejor = -1
  for (let i = 0; i < cantidad; i += 1) {
    const base = 4 + i * 8
    const plataforma = bloque.readUInt16BE(base)
    const codificacion = bloque.readUInt16BE(base + 2)
    const offset = bloque.readUInt32BE(base + 4)
    const esUnicode =
      (plataforma === 3 && (codificacion === 1 || codificacion === 10)) || plataforma === 0
    if (esUnicode) mejor = offset
  }
  if (mejor < 0) throw new Error('la fuente no trae una subtabla cmap Unicode')

  const sub = bloque.subarray(mejor)
  const formato = sub.readUInt16BE(0)
  const mapa = new Map<number, number>()

  if (formato === 4) {
    const segX2 = sub.readUInt16BE(6)
    const seg = segX2 / 2
    const fin = 14
    const inicio = fin + segX2 + 2
    const delta = inicio + segX2
    const rango = delta + segX2
    for (let s = 0; s < seg; s += 1) {
      const hasta = sub.readUInt16BE(fin + s * 2)
      const desde = sub.readUInt16BE(inicio + s * 2)
      const idDelta = sub.readInt16BE(delta + s * 2)
      const idRango = sub.readUInt16BE(rango + s * 2)
      if (desde === 0xffff) continue
      for (let c = desde; c <= hasta && c !== 0x10000; c += 1) {
        let glifo: number
        if (idRango === 0) {
          glifo = (c + idDelta) & 0xffff
        } else {
          const posicion = rango + s * 2 + idRango + (c - desde) * 2
          if (posicion + 1 >= sub.length) continue
          const bruto = sub.readUInt16BE(posicion)
          glifo = bruto === 0 ? 0 : (bruto + idDelta) & 0xffff
        }
        if (glifo !== 0) mapa.set(c, glifo)
      }
    }
    return mapa
  }

  if (formato === 12) {
    const grupos = sub.readUInt32BE(12)
    for (let g = 0; g < grupos; g += 1) {
      const base = 16 + g * 12
      const desde = sub.readUInt32BE(base)
      const hasta = sub.readUInt32BE(base + 4)
      const primerGlifo = sub.readUInt32BE(base + 8)
      for (let c = desde; c <= hasta; c += 1) mapa.set(c, primerGlifo + (c - desde))
    }
    return mapa
  }

  throw new Error(`formato de cmap no soportado: ${formato}`)
}

/**
 * `hmtx`, con y sin la transformación del WOFF2.
 *
 * Transformada, la tabla es `flags` (1 byte) y después el arreglo de avances;
 * los `lsb` se reconstruyen del contorno y **no hacen falta acá**. Sin
 * transformar es el formato clásico: pares `(avance, lsb)` para los primeros
 * `numberOfHMetrics` glifos, y de ahí en adelante el último avance se repite.
 */
function leerAvances(hmtx: Tabla, numeroDeMetricas: number, numeroDeGlifos: number): number[] {
  const avances: number[] = []
  if (hmtx.transformada) {
    for (let i = 0; i < numeroDeMetricas; i += 1) avances.push(hmtx.bloque.readUInt16BE(1 + i * 2))
  } else {
    for (let i = 0; i < numeroDeMetricas; i += 1) avances.push(hmtx.bloque.readUInt16BE(i * 4))
  }
  const ultimo = avances[avances.length - 1] ?? 0
  while (avances.length < numeroDeGlifos) avances.push(ultimo)
  return avances
}

const cache = new Map<string, TablasDeAvance>()

/** Las tablas de avance de un `.woff2` de `_fuentes/`. Tira si no se puede leer. */
export function leerAvancesDe(relativo: string): TablasDeAvance {
  const guardado = cache.get(relativo)
  if (guardado !== undefined) return guardado

  const tablas = tablasDe(relativo)
  const unidadesPorEm = exigir(tablas, 'head').bloque.readUInt16BE(18)
  const numeroDeGlifos = exigir(tablas, 'maxp').bloque.readUInt16BE(4)
  const numeroDeMetricas = exigir(tablas, 'hhea').bloque.readUInt16BE(34)
  const anchoMedioDeclarado = exigir(tablas, 'OS/2').bloque.readInt16BE(2)
  const avances = leerAvances(exigir(tablas, 'hmtx'), numeroDeMetricas, numeroDeGlifos)
  const cmap = leerCmap(exigir(tablas, 'cmap').bloque)

  const leido: TablasDeAvance = { unidadesPorEm, anchoMedioDeclarado, avances, cmap }
  cache.set(relativo, leido)
  return leido
}

/** El avance de un carácter en unidades de la fuente. Cae al `.notdef` si falta. */
export function avanceDeCaracter(tablas: TablasDeAvance, codigo: number): number {
  const glifo = tablas.cmap.get(codigo)
  return tablas.avances[glifo ?? 0] ?? 0
}
