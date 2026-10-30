/**
 * [SERVICIOS M3] LO QUE DICE UN MP4 DE SÍ MISMO — leído de los bytes, sin ffprobe: lo usan `montar.ts` (el recibo) y
 * `medios.invariant.ts` (que lo vuelve a leer del archivo, sin creerle al recibo).
 *
 *   · `faststart`: la caja `moov` va antes que `mdat`, así el navegador empieza a reproducir sin bajar el archivo entero;
 *   · los manejadores de las pistas (`vide`, `soun`…): sin `soun` no hay audio;
 *   · el códec de la primera entrada de video (`avc1` = H.264) y, de su `avcC`, el submuestreo del color y la profundidad:
 *     `yuv420p` es croma 1 (4:2:0) con 8 bits.
 */

interface Caja {
  readonly tipo: string
  readonly inicio: number
  /** Donde empieza el contenido (después de la cabecera de 8 o 16 bytes). */
  readonly contenido: number
  readonly fin: number
}

function cajas(buf: Buffer, desde: number, hasta: number): Caja[] {
  const lista: Caja[] = []
  let i = desde
  while (i + 8 <= hasta) {
    let tam = buf.readUInt32BE(i)
    const tipo = buf.toString('latin1', i + 4, i + 8)
    let cabecera = 8
    if (tam === 1) {
      tam = Number(buf.readBigUInt64BE(i + 8))
      cabecera = 16
    } else if (tam === 0) tam = hasta - i
    if (tam < cabecera || i + tam > hasta) break
    lista.push({ tipo, inicio: i, contenido: i + cabecera, fin: i + tam })
    i += tam
  }
  return lista
}

function hijas(buf: Buffer, caja: Caja, tipo: string): Caja[] {
  return cajas(buf, caja.contenido, caja.fin).filter((c) => c.tipo === tipo)
}

export function cajasDeArriba(buf: Buffer): string[] {
  return cajas(buf, 0, buf.length).map((c) => c.tipo)
}

export function esFaststart(buf: Buffer): boolean {
  const tipos = cajasDeArriba(buf)
  return tipos.includes('moov') && tipos.includes('mdat') && tipos.indexOf('moov') < tipos.indexOf('mdat')
}

function pistas(buf: Buffer): Caja[] {
  const moov = cajas(buf, 0, buf.length).find((c) => c.tipo === 'moov')
  return moov === undefined ? [] : hijas(buf, moov, 'trak')
}

/** El tipo de manejador de cada pista: `vide`, `soun`… */
export function manejadores(buf: Buffer): string[] {
  return pistas(buf).flatMap((trak) =>
    hijas(buf, trak, 'mdia').flatMap((mdia) => hijas(buf, mdia, 'hdlr').map((hdlr) => buf.toString('latin1', hdlr.contenido + 8, hdlr.contenido + 12))),
  )
}

/** La primera entrada de `stsd` de la pista de video. */
function entradaDeVideo(buf: Buffer): Caja | null {
  for (const trak of pistas(buf)) {
    for (const mdia of hijas(buf, trak, 'mdia')) {
      const esVideo = hijas(buf, mdia, 'hdlr').some((h) => buf.toString('latin1', h.contenido + 8, h.contenido + 12) === 'vide')
      if (!esVideo) continue
      for (const minf of hijas(buf, mdia, 'minf')) {
        for (const stbl of hijas(buf, minf, 'stbl')) {
          for (const stsd of hijas(buf, stbl, 'stsd')) {
            const [entrada] = cajas(buf, stsd.contenido + 8, stsd.fin)
            if (entrada !== undefined) return entrada
          }
        }
      }
    }
  }
  return null
}

export function codecDelVideo(buf: Buffer): string | null {
  return entradaDeVideo(buf)?.tipo ?? null
}

/** Del `avcC` (perfiles High): `chroma_format_idc` y la profundidad de luma. `null` si no es H.264 o el perfil no lo declara. */
export function cromaDelVideo(buf: Buffer): { readonly croma: number; readonly bits: number } | null {
  const entrada = entradaDeVideo(buf)
  if (entrada === null || entrada.tipo !== 'avc1') return null
  // La entrada visual trae 78 bytes de campos fijos antes de sus cajas hijas.
  const avcC = cajas(buf, entrada.contenido + 78, entrada.fin).find((c) => c.tipo === 'avcC')
  if (avcC === undefined) return null
  let i = avcC.contenido
  const perfil = buf.readUInt8(i + 1)
  const cantidadSps = buf.readUInt8(i + 5) & 0x1f
  i += 6
  for (let k = 0; k < cantidadSps; k++) i += 2 + buf.readUInt16BE(i)
  const cantidadPps = buf.readUInt8(i)
  i += 1
  for (let k = 0; k < cantidadPps; k++) i += 2 + buf.readUInt16BE(i)
  if (![100, 110, 122, 144].includes(perfil) || i + 2 > avcC.fin) return null
  return { croma: buf.readUInt8(i) & 0x03, bits: (buf.readUInt8(i + 1) & 0x07) + 8 }
}
