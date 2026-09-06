/**
 * DECODIFICADOR DE PNG — sin dependencias, para leer lo que devuelve
 * `Page.captureScreenshot`.
 *
 * ── Por qué existe otra vez ───────────────────────────────────────────────
 *
 * B1 escribió uno (`pixeles.js`) y B2 lo tuvo que reescribir porque el primero
 * vivía en el scratchpad de la corrida y se perdió. B2 lo dejó otra vez en el
 * scratchpad, y se volvió a perder — su propio §7 lo dice: «en el scratchpad, y
 * no van al repo». **Éste va al repo**, que es la única forma de que la tercera
 * corrida no lo escriba por tercera vez, y —lo que importa más— de que las
 * cifras de aire muerto de tres bloques distintos salgan del mismo código.
 *
 * ── Por qué hace falta decodificar y no leer el canvas ────────────────────
 *
 * Es la regla de método que B2 §2.1 dejó escrita y que este bloque hereda: el
 * búfer de dibujo de WebGL **no se puede leer desde la página**. `ProbeStage`
 * monta con `alpha: false` y sin `preserveDrawingBuffer`, así que `toDataURL`,
 * `drawImage` y `readPixels` devuelven un cuadro rancio. La única puerta al
 * píxel de la escena es la captura compuesta, y una captura es un PNG.
 *
 * ── Alcance, declarado ────────────────────────────────────────────────────
 *
 * Profundidad de 8 bits, sin entrelazado, tipos de color 0/2/4/6. Es lo que
 * Chrome emite. Cualquier otra cosa **tira**, no la aproxima: un decodificador
 * que devuelve píxeles plausibles para un formato que no entiende es la clase de
 * instrumento que da un número y no un error.
 */

import { inflateSync, deflateSync } from 'node:zlib'

export interface Imagen {
  readonly ancho: number
  readonly alto: number
  /** RGBA de 8 bits, 4 bytes por píxel, fila por fila, sin relleno. */
  readonly datos: Uint8Array
  /** Los tipos de filtro que traía cada fila. Sirve para probar el decodificador. */
  readonly filtros: readonly number[]
}

const FIRMA = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/** Canales por píxel de cada tipo de color del estándar. `null` = no soportado. */
const CANALES: Readonly<Record<number, number | undefined>> = { 0: 1, 2: 3, 4: 2, 6: 4 }

export function decodificarPng(buffer: Buffer): Imagen {
  for (let i = 0; i < FIRMA.length; i += 1) {
    if (buffer[i] !== FIRMA[i]) throw new Error('no es un PNG: la firma no coincide')
  }

  let ancho = 0
  let alto = 0
  let profundidad = 0
  let tipoDeColor = 0
  let entrelazado = 0
  const trozos: Buffer[] = []

  let cursor = 8
  while (cursor < buffer.length) {
    const largo = buffer.readUInt32BE(cursor)
    const tipo = buffer.toString('ascii', cursor + 4, cursor + 8)
    const datos = buffer.subarray(cursor + 8, cursor + 8 + largo)
    if (tipo === 'IHDR') {
      ancho = datos.readUInt32BE(0)
      alto = datos.readUInt32BE(4)
      profundidad = datos[8]
      tipoDeColor = datos[9]
      entrelazado = datos[12]
    } else if (tipo === 'IDAT') {
      trozos.push(Buffer.from(datos))
    } else if (tipo === 'IEND') {
      break
    }
    cursor += 12 + largo
  }

  if (ancho === 0 || alto === 0) throw new Error('PNG sin IHDR utilizable')
  if (profundidad !== 8) throw new Error(`profundidad ${profundidad} no soportada (sólo 8)`)
  if (entrelazado !== 0) throw new Error('PNG entrelazado no soportado')
  const canales = CANALES[tipoDeColor]
  if (canales === undefined) throw new Error(`tipo de color ${tipoDeColor} no soportado`)
  if (trozos.length === 0) throw new Error('PNG sin IDAT')

  const crudo = inflateSync(Buffer.concat(trozos))
  const anchoDeFila = ancho * canales
  const esperado = alto * (anchoDeFila + 1)
  if (crudo.length < esperado) {
    throw new Error(`IDAT corto: ${crudo.length} bytes, se esperaban ${esperado}`)
  }

  const sinFiltrar = new Uint8Array(alto * anchoDeFila)
  const filtros: number[] = []
  for (let y = 0; y < alto; y += 1) {
    const origen = y * (anchoDeFila + 1)
    const filtro = crudo[origen]
    filtros.push(filtro)
    const destino = y * anchoDeFila
    const arriba = destino - anchoDeFila
    for (let x = 0; x < anchoDeFila; x += 1) {
      const bruto = crudo[origen + 1 + x]
      const a = x >= canales ? sinFiltrar[destino + x - canales] : 0
      const b = y > 0 ? sinFiltrar[arriba + x] : 0
      const c = y > 0 && x >= canales ? sinFiltrar[arriba + x - canales] : 0
      sinFiltrar[destino + x] = (bruto + reconstruir(filtro, a, b, c)) & 0xff
    }
  }

  return { ancho, alto, datos: aRgba(sinFiltrar, ancho, alto, tipoDeColor, canales), filtros }
}

/** El predictor de cada filtro del estándar. Tira con un filtro que no existe. */
function reconstruir(filtro: number, a: number, b: number, c: number): number {
  if (filtro === 0) return 0
  if (filtro === 1) return a
  if (filtro === 2) return b
  if (filtro === 3) return (a + b) >> 1
  if (filtro === 4) return paeth(a, b, c)
  throw new Error(`filtro de fila desconocido: ${filtro}`)
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

function aRgba(
  origen: Uint8Array,
  ancho: number,
  alto: number,
  tipoDeColor: number,
  canales: number,
): Uint8Array {
  if (tipoDeColor === 6) return origen
  const destino = new Uint8Array(ancho * alto * 4)
  for (let i = 0, j = 0; i < ancho * alto; i += 1, j += canales) {
    const k = i * 4
    if (tipoDeColor === 0 || tipoDeColor === 4) {
      destino[k] = origen[j]
      destino[k + 1] = origen[j]
      destino[k + 2] = origen[j]
      destino[k + 3] = tipoDeColor === 4 ? origen[j + 1] : 255
    } else {
      destino[k] = origen[j]
      destino[k + 1] = origen[j + 1]
      destino[k + 2] = origen[j + 2]
      destino[k + 3] = 255
    }
  }
  return destino
}

/**
 * CODIFICADOR — existe SÓLO para el control positivo del decodificador.
 *
 * ⚠️ **`filtroDeFila` no es un lujo: es lo que hace real al control.** Con todas
 * las filas en filtro 0, un decodificador con los cinco predictores rotos pasa
 * en verde. El control fuerza un filtro distinto por fila y así ejercita los
 * cinco; y como codificar RESTA donde decodificar SUMA, un error en un
 * predictor no se puede cancelar solo.
 */
export function codificarPngRgba(
  ancho: number,
  alto: number,
  datos: Uint8Array,
  filtroDeFila: (y: number) => number = () => 0,
): Buffer {
  const anchoDeFila = ancho * 4
  const crudo = Buffer.alloc(alto * (anchoDeFila + 1))
  for (let y = 0; y < alto; y += 1) {
    const filtro = filtroDeFila(y)
    crudo[y * (anchoDeFila + 1)] = filtro
    for (let x = 0; x < anchoDeFila; x += 1) {
      const actual = datos[y * anchoDeFila + x]
      const a = x >= 4 ? datos[y * anchoDeFila + x - 4] : 0
      const b = y > 0 ? datos[(y - 1) * anchoDeFila + x] : 0
      const c = y > 0 && x >= 4 ? datos[(y - 1) * anchoDeFila + x - 4] : 0
      crudo[y * (anchoDeFila + 1) + 1 + x] = (actual - reconstruir(filtro, a, b, c)) & 0xff
    }
  }
  return Buffer.concat([
    Buffer.from(FIRMA),
    trozo('IHDR', cabecera(ancho, alto)),
    trozo('IDAT', deflateSync(crudo)),
    trozo('IEND', Buffer.alloc(0)),
  ])
}

function cabecera(ancho: number, alto: number): Buffer {
  const b = Buffer.alloc(13)
  b.writeUInt32BE(ancho, 0)
  b.writeUInt32BE(alto, 4)
  b[8] = 8
  b[9] = 6
  return b
}

function trozo(tipo: string, datos: Buffer): Buffer {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length, 0)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo), 0)
  return Buffer.concat([largo, cuerpo, crc])
}

const TABLA_CRC = ((): Uint32Array => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = (c & 1) === 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buffer: Buffer): number {
  let c = 0xffffffff
  for (const byte of buffer) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
