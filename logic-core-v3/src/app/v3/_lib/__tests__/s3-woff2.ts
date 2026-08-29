/**
 * LEER LAS MÉTRICAS DEL BINARIO QUE /v3 SIRVE.
 *
 * ── Por qué no alcanza con citar el reporte ───────────────────────────────
 *
 * La cap height es el número que hace urgente la verificación óptica de este
 * sprint: 686 contra 720, un 4,72% más chica. Ese número está publicado en
 * `REPORTE-S0.md`, medido con fontkit, en otra máquina y sobre el archivo de
 * descarga. Citarlo lo convierte en una afirmación sobre un pasado; leerlo del
 * `.woff2` que está en `_fuentes/` lo convierte en una afirmación sobre lo que
 * el navegador va a bajar hoy.
 *
 * `fuentes.invariant.ts` de S1 ya comprueba el sha256 de esos binarios contra
 * el manifiesto de S0. Las dos comprobaciones juntas cierran la cadena: el
 * archivo es el mismo, y de ese archivo salen las métricas.
 *
 * ── Cómo se lee un WOFF2, en corto ────────────────────────────────────────
 *
 * Cabecera de 48 bytes, después un directorio de tablas con etiquetas
 * indexadas contra una tabla conocida de 63 nombres, con longitudes en un
 * entero de base 128 de longitud variable. Detrás del directorio va UN solo
 * flujo brotli con todas las tablas concatenadas en orden.
 *
 * `glyf` y `loca` pueden venir transformadas; `OS/2` y `head` **no se
 * transforman nunca**, así que se leen directo del flujo descomprimido sin
 * deshacer ninguna transformación. Eso es lo que hace que esto entren 90
 * líneas y no una librería.
 *
 * Sin dependencias nuevas: `node:zlib` trae brotli.
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

export interface MetricasDeFuente {
  readonly unidadesPorEm: number
  readonly xHeight: number
  readonly capHeight: number
  readonly versionOs2: number
}

/**
 * Devuelve las métricas del `.woff2` en `relativo`, o tira.
 *
 * Tira en vez de devolver `null` a propósito: un invariante que recibe `null`
 * y lo trata como "no se pudo" pasa en verde por vacío. Si el binario no se
 * puede leer, la comprobación tiene que caerse.
 */
export function leerMetricas(relativo: string): MetricasDeFuente {
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

  const directorio: { etiqueta: string; largo: number }[] = []
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
    directorio.push({ etiqueta, largo: largoTransformado ?? largoOriginal })
  }

  const crudo = brotliDecompressSync(buffer.subarray(cursor, cursor + largoComprimido))

  let desplazamiento = 0
  let unidadesPorEm: number | null = null
  let metricas: { xHeight: number; capHeight: number; versionOs2: number } | null = null
  for (const tabla of directorio) {
    const bloque = crudo.subarray(desplazamiento, desplazamiento + tabla.largo)
    if (tabla.etiqueta === 'head') unidadesPorEm = bloque.readUInt16BE(18)
    if (tabla.etiqueta === 'OS/2') {
      const version = bloque.readUInt16BE(0)
      // sxHeight y sCapHeight existen desde la versión 2 de OS/2.
      if (version < 2) throw new Error(`OS/2 v${version} no trae sxHeight ni sCapHeight`)
      metricas = {
        versionOs2: version,
        xHeight: bloque.readInt16BE(86),
        capHeight: bloque.readInt16BE(88),
      }
    }
    desplazamiento += tabla.largo
  }

  if (unidadesPorEm === null) throw new Error('no se encontró la tabla head')
  if (metricas === null) throw new Error('no se encontró la tabla OS/2')
  return { unidadesPorEm, ...metricas }
}
