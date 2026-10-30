/**
 * INVARIANTE — Los medios del video de trabajos. **[SERVICIOS M3]**
 *
 * Corre a mano: `npx tsx src/app/v3/_servicios/__tests__/medios.invariant.ts`.
 *
 * El recibo (`docs/servicios/entregas/m3/medios.json`, lo escriben `scripts-servicios/montar.ts` y `velo.ts`) contra los ARCHIVOS: el
 * peso y el sha256 de cada video y cada póster salen del disco, y el formato (H.264, `yuv420p`, `faststart`, sin audio) se vuelve a
 * leer de los bytes del mp4 (`scripts-servicios/mp4.ts`), sin creerle al recibo. Más lo que la página promete de esos archivos (las
 * rutas y las medidas de los datos), el contraste del velo medido en los cuadros, y que el montaje lee `public/portfolio/` sin
 * escribirlo nunca. Cada comprobación lleva su control positivo.
 */

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CORTES, RECIBO_DE_LOS_MEDIOS, TECHO_BYTES, type ReciboDelMontaje, type Version, type VersionMontada } from '../../../../../scripts-servicios/guiones'
import { codecDelVideo, cromaDelVideo, esFaststart, manejadores } from '../../../../../scripts-servicios/mp4'
import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { VELO_DEL_VIDEO } from '../bloques/veloDelVideo'
import { FUENTE_DE_DEMOS } from '../datos/fuenteDeDemos'
import { PAGINAS_WEB } from '../datos/paginas-web'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
const enLaRaiz = (...partes: string[]): string => path.join(RAIZ, ...partes)
const RECIBO = JSON.parse(readFileSync(enLaRaiz(RECIBO_DE_LOS_MEDIOS), 'utf8')) as ReciboDelMontaje
const VERSIONES: readonly Version[] = ['horizontal', 'vertical']
const sha256 = (ruta: string): string => createHash('sha256').update(readFileSync(ruta)).digest('hex')
const archivo = (url: string): string => enLaRaiz('public', ...url.split('/').filter((p) => p !== ''))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Cada versión: 4 MB o menos, de 20 a 30 s, y el recibo dice lo mismo que el disco')

const enElTecho = (v: VersionMontada): boolean => v.bytesDelVideo <= TECHO_BYTES && v.segundos >= 20 && v.segundos <= 30
afirmarIgual(VERSIONES.filter((n) => !enElTecho(RECIBO.versiones[n])), [], `las dos versiones pesan ${TECHO_BYTES.toLocaleString('es-AR')} bytes o menos y duran de 20 a 30 s (un bucle)`)
controlPositivo('  un recibo de 4,1 MB se detecta', { ...RECIBO.versiones.horizontal, bytesDelVideo: 4_100_000 }, enElTecho)
controlPositivo('  y uno de 31 s', { ...RECIBO.versiones.horizontal, segundos: 31 }, enElTecho)
const comoElDisco = (v: VersionMontada): boolean =>
  existsSync(archivo(v.video)) && existsSync(archivo(v.poster)) && statSync(archivo(v.video)).size === v.bytesDelVideo && sha256(archivo(v.video)) === v.sha256DelVideo &&
  statSync(archivo(v.poster)).size === v.bytesDelPoster && sha256(archivo(v.poster)) === v.sha256DelPoster
afirmarIgual(VERSIONES.filter((n) => !comoElDisco(RECIBO.versiones[n])), [], '  y el peso y el sha256 de cada video y de cada póster son los del disco')
controlPositivo('  un sha distinto se detecta', { ...RECIBO.versiones.vertical, sha256DelVideo: '0'.repeat(64) }, comoElDisco)
controlPositivo('  y un póster que no existe', { ...RECIBO.versiones.vertical, poster: '/servicios/paginas-web/no-existe.webp' }, comoElDisco)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El formato, leído de los bytes: H.264 yuv420p, faststart y sin audio')

interface Formato { readonly codec: string | null; readonly yuv420p: boolean; readonly faststart: boolean; readonly audio: number }
const formatoDe = (buf: Buffer): Formato => {
  const croma = cromaDelVideo(buf)
  return { codec: codecDelVideo(buf), yuv420p: croma !== null && croma.croma === 1 && croma.bits === 8, faststart: esFaststart(buf), audio: manejadores(buf).filter((m) => m === 'soun').length }
}
const FORMATOS = Object.fromEntries(VERSIONES.map((n) => [n, formatoDe(readFileSync(archivo(RECIBO.versiones[n].video)))])) as Record<Version, Formato>
const bienFormado = (f: Formato): boolean => f.codec === 'avc1' && f.yuv420p && f.faststart && f.audio === 0
afirmarIgual(VERSIONES.filter((n) => !bienFormado(FORMATOS[n])), [], 'los dos mp4, leídos del archivo: H.264 (avc1), 4:2:0 a 8 bits (yuv420p), moov antes de mdat (faststart) y ninguna pista de audio')
controlPositivo('  un mp4 con una pista de audio se detecta', { ...FORMATOS.horizontal, audio: 1 }, bienFormado)
controlPositivo('  y uno sin faststart', { ...FORMATOS.horizontal, faststart: false }, bienFormado)
// Un mp4 armado a mano: ftyp, mdat y DESPUÉS moov (sin faststart), con una pista de sonido.
const caja = (tipo: string, ...contenido: Buffer[]): Buffer => {
  const cuerpo = Buffer.concat(contenido)
  const cabecera = Buffer.alloc(8)
  cabecera.writeUInt32BE(8 + cuerpo.length, 0)
  cabecera.write(tipo, 4, 'latin1')
  return Buffer.concat([cabecera, cuerpo])
}
const hdlr = (tipo: string): Buffer => caja('hdlr', Buffer.alloc(8), Buffer.from(tipo, 'latin1'), Buffer.alloc(12))
const MP4_A_MANO = Buffer.concat([caja('ftyp', Buffer.from('isom', 'latin1')), caja('mdat', Buffer.alloc(16)), caja('moov', caja('trak', caja('mdia', hdlr('soun'))))])
afirmar(!esFaststart(MP4_A_MANO) && manejadores(MP4_A_MANO).includes('soun'), '  el lector de bytes ve un mp4 armado a mano con moov al final y una pista de sonido (el lector no es ciego)')
const reciboDiceLoMismo = (v: VersionMontada, f: Formato): boolean => v.codec === f.codec && (v.pixFmt === 'yuv420p') === f.yuv420p && v.faststart === f.faststart && v.pistasDeAudio === f.audio
afirmarIgual(VERSIONES.filter((n) => !reciboDiceLoMismo(RECIBO.versiones[n], FORMATOS[n])), [], '  y el recibo dice lo mismo que los bytes')
controlPositivo('  un recibo que dice faststart de un archivo sin faststart se detecta', { ...FORMATOS.vertical, faststart: false }, (f: Formato) => reciboDiceLoMismo(RECIBO.versiones.vertical, f))
const ffprobe = ((): string => {
  try {
    return execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,pix_fmt,width,height', '-of', 'csv=p=0', archivo(RECIBO.versiones.horizontal.video)], { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
})()
afirmar(ffprobe === '' || ffprobe === `h264,${RECIBO.versiones.horizontal.ancho},${RECIBO.versiones.horizontal.alto},yuv420p`, `  ffprobe, si está en la máquina, coincide en la horizontal (${ffprobe === '' ? 'no está' : ffprobe})`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Lo que la página promete de esos archivos, y lo que se montó')

const VIDEO = PAGINAS_WEB.prueba.video
type DatoDeLaVersion = NonNullable<typeof VIDEO>[Version]
const promete = (n: Version) => (dato: DatoDeLaVersion | undefined): boolean => {
  const v = RECIBO.versiones[n]
  return dato !== undefined && dato.video === v.video && dato.poster === v.poster && dato.ancho === v.ancho && dato.alto === v.alto
}
afirmarIgual(VERSIONES.filter((n) => !promete(n)(VIDEO?.[n])), [], 'los datos de Páginas web apuntan a los dos videos y pósters del recibo, con sus medidas')
if (VIDEO !== null) controlPositivo('  un dato con otra medida se detecta', { ...VIDEO.horizontal, ancho: 1440 }, promete('horizontal'))
const demosDelMontaje = CORTES.flatMap((c) => (c.tipo === 'demo' ? [c.slug] : []))
const casosDelMontaje = CORTES.flatMap((c) => (c.tipo === 'caso' ? [c.slug] : []))
const CASOS_DE_WEB = PAGINAS_WEB.prueba.casos.flatMap((c) => (c.tipo === 'proyecto' ? [c.slug] : []))
const montajeComoLosDatos = (demos: readonly string[], casos: readonly string[]): boolean =>
  JSON.stringify(demos) === JSON.stringify(VIDEO?.demos) && JSON.stringify(casos) === JSON.stringify(CASOS_DE_WEB) &&
  demos.every((slug) => FUENTE_DE_DEMOS.some((d) => d.slug === slug)) && JSON.stringify(RECIBO.demos.map((d) => d.slug)) === JSON.stringify(demos)
afirmar(montajeComoLosDatos(demosDelMontaje, casosDelMontaje), 'el montaje intercala las demos de los datos (que existen en el catálogo del home) con los casos de Páginas web, en su orden')
controlPositivo('  una demo que no está en los datos se detecta', ['ethereal', 'noir', 'bold'], (d: readonly string[]) => montajeComoLosDatos(d, casosDelMontaje))
const sinCostura = (v: VersionMontada): boolean => {
  const primero = v.tramos[0]
  const ultimo = v.tramos.at(-1)
  return primero !== undefined && ultimo !== undefined && primero.fuente === ultimo.fuente && ultimo.desdeElCuadro + ultimo.cuadros === primero.desdeElCuadro
}
afirmarIgual(VERSIONES.filter((n) => !sinCostura(RECIBO.versiones[n])), [], '  el bucle no tiene costura: el último tramo termina en el cuadro exacto del caso donde arranca el primero')
controlPositivo('  un bucle que salta se detecta', { ...RECIBO.versiones.horizontal, tramos: RECIBO.versiones.horizontal.tramos.slice(1) }, sinCostura)
const fuentesIntactas = RECIBO.fuentes.filter((f) => !existsSync(enLaRaiz(f.ruta)) || sha256(enLaRaiz(f.ruta)) !== f.sha256 || !f.ruta.replace(/\\/g, '/').startsWith('public/portfolio/'))
afirmarIgual(fuentesIntactas.map((f) => f.ruta), [], `  las ${RECIBO.fuentes.length} fuentes leídas de public/portfolio/ siguen con el sha256 del recibo`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El contraste del texto sobre el velo, medido en los cuadros del video')

const TEMA = readFileSync(enLaRaiz('src', 'app', 'theme-develop.css'), 'utf8')
const primerToken = (nombre: string): string => (new RegExp(`${nombre}:\\s*(#[0-9A-Fa-f]{6})`).exec(TEMA)?.[1] ?? '').toUpperCase()
const velo = RECIBO.velo
const veloBien = (m: NonNullable<typeof velo>[Version]): boolean =>
  m.peorContraste >= 4.5 && m.cuadrosMedidos >= 40 && m.alfaBajoElTexto === VELO_DEL_VIDEO.alfaBajoElTexto && m.tinta === primerToken('--color-tinta') && m.fondo === primerToken('--color-fondo')
afirmar(velo !== null && VERSIONES.every((n) => veloBien(velo[n])), `el peor contraste del texto (papel) sobre el velo (tinta al ${VELO_DEL_VIDEO.alfaBajoElTexto * 100} %), en todos los cuadros medidos de las dos versiones, es de 4,5:1 o más: ${velo === null ? 'sin medir' : VERSIONES.map((n) => `${n} ${velo[n].peorContraste}:1`).join(', ')}`)
if (velo !== null) controlPositivo('  un 4,4:1 se detecta', { ...velo.horizontal, peorContraste: 4.4 }, veloBien)
// La cota de abajo, sin el video: sobre un píxel blanco, el peor posible, la tinta al alfa del velo ya da más de 4,5.
const compuestoSobreBlanco = (alfa: number): string => {
  const t = primerToken('--color-tinta')
  const canal = (i: number): string => Math.round(alfa * parseInt(t.slice(i, i + 2), 16) + (1 - alfa) * 255).toString(16).padStart(2, '0')
  return `#${canal(1)}${canal(3)}${canal(5)}`
}
const cotaSobreBlanco = razonDeContraste(primerToken('--color-fondo'), compuestoSobreBlanco(VELO_DEL_VIDEO.alfaBajoElTexto))
afirmar(velo !== null && VERSIONES.every((n) => Math.abs(velo[n].peorContraste - cotaSobreBlanco) < 0.05 || velo[n].peorContraste > cotaSobreBlanco), `  y no puede bajar de la cota sobre un píxel blanco: ${cotaSobreBlanco.toFixed(2)}:1`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El montaje lee public/portfolio/ y no lo escribe nunca')

const MONTAR = readFileSync(enLaRaiz('scripts-servicios', 'montar.ts'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
/** Cada escritura del script pasa por `destino()` (o borra la caché de cuadros), y ninguna raíz de escritura es `public/portfolio`. */
const noEscribeElPortfolio = (fuente: string): boolean => {
  const escrituras = [...fuente.matchAll(/\b(writeFileSync|mkdirSync|appendFileSync|copyFileSync|renameSync|unlinkSync|rmSync)\(([^,)]*)/g)].map((m) => m[2] ?? '')
  const raices = /RAICES_DE_ESCRITURA = \[([^\]]*)\]/.exec(fuente)?.[1] ?? 'portfolio'
  return escrituras.length > 0 && escrituras.every((arg) => arg.startsWith('destino(') || arg.includes('CARPETA_DE_CUADROS')) && !/portfolio/i.test(raices) &&
    /destino\(salida\)/.test(fuente)
}
afirmar(noEscribeElPortfolio(MONTAR), 'montar.ts: toda escritura (archivos, carpetas y las salidas de ffmpeg) pasa por destino(), cuyas raíces no incluyen public/portfolio/')
controlPositivo('  una escritura con esa ruta se detecta', `${MONTAR}\nwriteFileSync(path.join('public', 'portfolio', 'x.mp4'), '')`, noEscribeElPortfolio)
const portfolioLimpio = ((): string => {
  try {
    return execFileSync('git', ['status', '--porcelain', '--', 'public/portfolio'], { cwd: RAIZ, encoding: 'utf8' }).trim()
  } catch (error) {
    return `git no respondió: ${String(error).slice(0, 80)}`
  }
})()
afirmarIgual(portfolioLimpio, '', '  y git status está limpio en public/portfolio/')

cerrar('medios.invariant')
