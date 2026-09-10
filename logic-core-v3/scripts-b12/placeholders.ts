/**
 * B12 §4.3 · LOS PLACEHOLDERS DE FOTO — generados acá, en blanco y negro, con
 * la relación de aspecto y el PESO de una foto real.
 *
 *     npx tsx scripts-b12/placeholders.ts
 *
 * ── ⚠️ Por qué se GENERAN y no se descargan ───────────────────────────────
 *
 * Regla 6 del sprint: **ninguna imagen de terceros.** Ni de un banco, ni de la
 * referencia, ni de ningún lado — el sitio es comercial y una foto de banco es
 * propiedad de alguien. Y no hay forma de producir una foto real acá.
 *
 * Lo que sí hace falta, y lo dice la instrucción con todas las letras:
 *
 *   · **la relación de aspecto**, para que la composición se pueda juzgar;
 *   · **el peso**, para que la página cargue como va a cargar de verdad. Un
 *     placeholder de dos kilobytes no dice nada sobre cómo entra el sitio;
 *   · **blanco y negro, con la paleta**, para que no desentone;
 *   · y ⚠️ **que se vean como placeholders**. Si parecen fotos, el humano
 *     termina juzgando una composición que no existe.
 *
 * ── Cómo se ve, y por qué así ─────────────────────────────────────────────
 *
 * Rayado diagonal grueso sobre el papel, con las cuatro esquinas marcadas y una
 * cruz de encuadre en el centro. Es el lenguaje universal de «acá va algo»:
 * ningún ojo lo confunde con una fotografía, y a la vez tiene valor tonal, así
 * que la composición se lee. El marcador —`[FOTO DEL EQUIPO]`— lo sigue
 * escribiendo el DOM encima, en texto de verdad: no se quema en el píxel.
 *
 * ── Y de dónde sale el peso ───────────────────────────────────────────────
 *
 * De un GRANO fino y determinista encima del rayado. Es lo único que hace que
 * un PNG pese como una foto: el rayado solo comprime a nada. El grano va en
 * bloques de `GRANO_EN_BLOQUES` px, que es la perilla del peso — más chico,
 * más pesa—, y sale de un generador con semilla fija, así que **el archivo es
 * reproducible byte a byte**: correr esto dos veces da el mismo SHA-1 y el
 * padrón no se mueve solo.
 *
 * ── El formato: PNG de 8 bits en escala de grises, escrito a mano ─────────
 *
 * Sin dependencias nuevas (regla 9): `zlib` viene con node y un PNG es cuatro
 * trozos con su CRC. Escala de grises de un canal, además, es la garantía
 * ESTRUCTURAL de que no hay color: no es que no se usó, es que el formato no
 * tiene dónde ponerlo. El invariante lo afirma leyendo la cabecera.
 */

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

/** La raíz del paquete: este archivo vive en `scripts-b12/`. */
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Los tres grises de la paleta, en el canal único del PNG. */
const PAPEL = 0xf7
const MEDIA = 0x53
const TINTA = 0x11

/** El paso del rayado, en píxeles, y su grosor. */
const RAYA_PASO = 48
const RAYA_ANCHO = 16
/** El lado del bloque de grano. Es la perilla del peso. */
const GRANO_EN_BLOQUES = 4
/** Cuánto se aparta el grano del tono base, en niveles. */
const GRANO_AMPLITUD = 22

/**
 * Un ruido determinista: misma semilla, mismo archivo, siempre.
 *
 * ⚠ La SEMILLA la trae cada placeholder, y no es cosmético: sin ella, dos
 * huecos de la misma medida —el panel y el póster, los dos de 1920×1080— salían
 * con el MISMO sha1. Dos archivos idénticos con nombres distintos son un
 * duplicado esperando a que alguien borre el que no era.
 */
function ruido(x: number, y: number, semilla: number): number {
  const n = Math.sin((x + semilla) * 12.9898 + (y - semilla) * 78.233) * 43758.5453
  return n - Math.floor(n)
}

export interface Placeholder {
  readonly archivo: string
  readonly ancho: number
  readonly alto: number
  /** Corre el grano para que dos huecos de la misma medida no den el mismo archivo. */
  readonly semilla: number
  readonly que: string
}

/** Los tres huecos de foto del lane, con la geometría que su sección declara. */
export const PLACEHOLDERS: readonly Placeholder[] = [
  { archivo: 'public/placeholders/equipo.png', ancho: 1800, alto: 1200, semilla: 11, que: 'la foto del equipo — Quiénes somos (3:2, el archivo que `GEOMETRIA.foto` declara)' },
  { archivo: 'public/placeholders/panel.png', ancho: 1920, alto: 1080, semilla: 29, que: 'la captura del panel — Tu panel' },
  { archivo: 'public/placeholders/poster.png', ancho: 1920, alto: 1080, semilla: 47, que: 'el póster del video — Servicios' },
]

/** El mapa de grises del placeholder: rayado, marco, cruz y grano. */
function pixeles(ancho: number, alto: number, semilla: number): Uint8Array {
  const datos = new Uint8Array(ancho * alto)
  const margen = Math.round(Math.min(ancho, alto) * 0.04)
  const brazo = Math.round(Math.min(ancho, alto) * 0.06)
  const cx = Math.round(ancho / 2)
  const cy = Math.round(alto / 2)

  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      const rayado = (x + y) % RAYA_PASO < RAYA_ANCHO
      let tono = rayado ? MEDIA : PAPEL

      /** El marco: un filete de tinta a `margen` del borde. */
      const enFilete =
        (x === margen || x === ancho - 1 - margen) && y >= margen && y <= alto - 1 - margen
      const enFileteH =
        (y === margen || y === alto - 1 - margen) && x >= margen && x <= ancho - 1 - margen
      /** La cruz de encuadre, en el centro. */
      const enCruz =
        (Math.abs(x - cx) <= 1 && Math.abs(y - cy) <= brazo) ||
        (Math.abs(y - cy) <= 1 && Math.abs(x - cx) <= brazo)
      if (enFilete || enFileteH || enCruz) tono = TINTA

      /** El grano, en bloques, que es de donde sale el peso. */
      const bx = Math.floor(x / GRANO_EN_BLOQUES)
      const by = Math.floor(y / GRANO_EN_BLOQUES)
      const delta = Math.round((ruido(bx, by, semilla) - 0.5) * 2 * GRANO_AMPLITUD)
      datos[y * ancho + x] = Math.max(0, Math.min(255, tono + delta))
    }
  }
  return datos
}

const CRC = (() => {
  const tabla = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabla[n] = c
  }
  return (buf: Buffer): number => {
    let c = -1
    for (const b of buf) c = tabla[(c ^ b) & 0xff] ^ (c >>> 8)
    return (c ^ -1) >>> 0
  }
})()

function trozo(tipo: string, datos: Buffer): Buffer {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(CRC(cuerpo))
  return Buffer.concat([largo, cuerpo, crc])
}

/** El PNG entero: firma, IHDR (8 bits, color 0 = gris), IDAT e IEND. */
export function png(ancho: number, alto: number, semilla: number): Buffer {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(ancho, 0)
  ihdr.writeUInt32BE(alto, 4)
  ihdr[8] = 8
  ihdr[9] = 0
  const mapa = pixeles(ancho, alto, semilla)
  /** Un byte de filtro (0 = ninguno) por renglón: es lo que el formato pide. */
  const crudo = Buffer.alloc((ancho + 1) * alto)
  for (let y = 0; y < alto; y += 1) {
    crudo[y * (ancho + 1)] = 0
    Buffer.from(mapa.subarray(y * ancho, (y + 1) * ancho)).copy(crudo, y * (ancho + 1) + 1)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ])
}

function principal(): void {
  mkdirSync(path.join(RAIZ, 'public/placeholders'), { recursive: true })
  for (const p of PLACEHOLDERS) {
    const buf = png(p.ancho, p.alto, p.semilla)
    writeFileSync(path.join(RAIZ, p.archivo), buf)
    const sha = createHash('sha1').update(buf).digest('hex').slice(0, 12)
    console.log(
      `${p.archivo.padEnd(34)} ${p.ancho}×${p.alto}  ${(buf.length / 1024).toFixed(1)} KiB  sha1 ${sha}  · ${p.que}`,
    )
  }
}

if (process.argv[1] !== undefined && process.argv[1].endsWith('placeholders.ts')) principal()
