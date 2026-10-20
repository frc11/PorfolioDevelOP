/**
 * [B1] EL PORTFOLIO — el selector lateral (`docs/rediseno/SPRINT-B1-PORTFOLIO.md`). Cada afirmación con su control positivo.
 *
 *   B1.1a · los datos (`trabajos/proyectos.ts`): el orden, los nombres reales, las URL de siempre, la fecha y el servicio derivado;
 *           los medios (`public/portfolio/<slug>/`): existen, pesan lo que dice el recibo y entran en el techo, H.264 sin audio y con
 *           `+faststart`, y un póster WebP por video.
 *   B1.1b · la base (`s76-portfolio-mapeo.ts`): la REGLA DE ALTURAS en los tres anchos y los tres pasos (afuera del selector la
 *           escena ve lo de hoy), la noche del tramo, los pasos y las anclas, y el reloj de Demos contra el túnel archivado.
 *   B1.2  · el selector vivo (`s76-portfolio-escena.tsx`): los videos, un solo lienzo, la pose del logo, el oscurecido, el hover,
 *           los sonidos y las banderas.
 *   B1.2c · los ajustes del FRENO de B1.2b (`s76-portfolio-b12c.tsx`): el orden, los rótulos y los acentos claros, la transición, la
 *           rueda, el formulario corto, el «?», la tablet y el título (la cámara de frente, en la §9 de la escena).
 *   B1.3  · el teléfono (`s76-portfolio-historias.tsx`): las historias por CSS sobre el mismo marcado, los dos videos, la hoja, los
 *           toques, el deslizamiento de a un proyecto y el título de la aproximación.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { decodificarPng, type Imagen } from '../../../../../scripts-b4/png'
import { AREA_MINIMA, BANDA_MAXIMA, areaDelContenido, bandasDelBorde, cubreElCuadro, type Bandas } from '../../../../../scripts-portfolio/cobertura'
import { RECIBO_DE_LOS_MEDIOS, TECHO_BYTES, type MedioCodificado } from '../../../../../scripts-portfolio/guiones'
import { NOMBRES_REALES } from '../../_secciones/_contrato/escaneo'
import { CONTENIDO as CONTENIDO_DE_ANTES } from '../../_archivo/tunel-portfolio/contenido'
import { PROYECTOS, mediosDe, seMuestraElServicio, type ProyectoDelPortfolio } from '../../_secciones/trabajos/proyectos'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { afirmarLaBase } from './s76-portfolio-mapeo'
import { afirmarA2 } from './s76-portfolio-a2'
import { afirmarB } from './s76-portfolio-b'
import { afirmarB12c } from './s76-portfolio-b12c'
import { afirmarB12d } from './s76-portfolio-b12d'
import { afirmarElSelectorVivo } from './s76-portfolio-escena'
import { afirmarLasHistorias } from './s76-portfolio-historias'

const RAIZ = process.cwd()
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1.1a · 1 · Los datos del Portfolio (`trabajos/proyectos.ts`)')

afirmarIgual(PROYECTOS.map((p) => p.slug), ['el-garage', 'esquina-estudio', 'banu-scents'], 'tres proyectos, en el orden de la spec: El Garage, Esquina Estudio, Banú Scents')
const esReal = (nombre: string): boolean => NOMBRES_REALES.some((n) => nombre.startsWith(n))
afirmar(PROYECTOS.every((p) => esReal(p.nombre)), 'los tres nombres son clientes reales (`NOMBRES_REALES`): ninguno inventado')
controlPositivo('  un cliente que no existe se ve', 'Matsu Automotores', esReal)

const urlDeHoy = (nombre: string): string | undefined => CONTENIDO_DE_ANTES.proyectos.find((p) => p.nombre === nombre)?.enlace
afirmar(PROYECTOS.every((p) => p.url === urlDeHoy(p.nombre)), 'cada URL es la que el repo tenía (`contenido.ts` de antes, hoy en el archivo; verificadas por el humano): ningún dominio nuevo')
afirmar(PROYECTOS.every((p) => /^https:\/\/[a-z]+\.com\.ar$/.test(p.url)), '  y las tres son https, sin ruta')

const fechaBienFormada = (f: string | null): boolean =>
  f !== null && new RegExp(`^(${MESES.join('|')}) \\d{4}$`).test(f)
afirmar(PROYECTOS.every((p) => fechaBienFormada(p.fecha)), 'las tres fechas con el formato «Marzo 2026»')
controlPositivo('  una fecha con otro formato se ve', 'marzo de 2026', fechaBienFormada)

afirmar(PROYECTOS.every((p) => p.resultado === null), 'resultado: `null` en los tres (no hay nada medible, y la ficha no lo muestra)')
afirmar(
  PROYECTOS.every((p) => p.servicio !== null) && !seMuestraElServicio(PROYECTOS),
  'el servicio está en el dato y NO se muestra: los tres dicen lo mismo',
)
const conVariedad: readonly ProyectoDelPortfolio[] = [...PROYECTOS.slice(0, 2), { ...PROYECTOS[2], servicio: 'Automatización' }]
controlPositivo('  con un servicio distinto, aparece (sin bandera)', conVariedad, (lista) => !seMuestraElServicio(lista))

afirmar(PROYECTOS.every((p) => p.medios.video.escritorio === mediosDe(p.slug).video.escritorio), 'los medios de cada uno salen de su slug')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1.1a · 2 · Los medios: seis videos y seis pósters, medidos')

const recibo = JSON.parse(readFileSync(path.join(RAIZ, RECIBO_DE_LOS_MEDIOS), 'utf8')) as Record<string, MedioCodificado>
const enDisco = (ruta: string): string => path.join(RAIZ, 'public', ruta)

/** Las cajas de primer nivel de un MP4, en orden: `ftyp`, `moov`, `mdat`… */
function cajasDe(b: Buffer): string[] {
  const cajas: string[] = []
  for (let i = 0; i + 8 <= b.length; ) {
    const tam = b.readUInt32BE(i)
    cajas.push(b.toString('latin1', i + 4, i + 8))
    if (tam < 8) break
    i += tam
  }
  return cajas
}
/** Los manejadores de las pistas (`vide`, `soun`…), leídos de cada `hdlr`. */
function manejadoresDe(b: Buffer): string[] {
  const salida: string[] = []
  for (let i = b.indexOf('hdlr', 0, 'latin1'); i !== -1; i = b.indexOf('hdlr', i + 4, 'latin1')) salida.push(b.toString('latin1', i + 12, i + 16))
  return salida
}
const conInicioRapido = (b: Buffer): boolean => {
  const c = cajasDe(b)
  return c.includes('moov') && c.includes('mdat') && c.indexOf('moov') < c.indexOf('mdat')
}
const sinAudio = (b: Buffer): boolean => {
  const m = manejadoresDe(b)
  return m.includes('vide') && !m.includes('soun')
}
const esWebp = (b: Buffer): boolean => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP'
/** [B1.2b] P-H11 · el póster en píxeles: ffmpeg (el de `scripts-portfolio`) lo pasa a PNG y lo lee el decodificador del banco. */
function pixelesDe(ruta: string): Imagen | null {
  try {
    return decodificarPng(execFileSync('ffmpeg', ['-v', 'error', '-i', ruta, '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 64 * 1024 * 1024, windowsHide: true }))
  } catch {
    return null
  }
}
const enPorcentaje = (b: Bandas): string => `bandas ${[b.arriba, b.abajo, b.izquierda, b.derecha].map((x) => `${(x * 100).toFixed(1)} %`).join(' / ')} · el contenido, ${(areaDelContenido(b) * 100).toFixed(0)} % del cuadro`

for (const p of PROYECTOS) {
  for (const dispositivo of ['escritorio', 'movil'] as const) {
    const clave = `${p.slug}/${dispositivo}`
    const video = p.medios.video[dispositivo]
    const poster = p.medios.poster[dispositivo]
    const r = recibo[clave]
    if (r === undefined || !existsSync(enDisco(video)) || !existsSync(enDisco(poster))) {
      afirmar(false, `\`${clave}\` — el video, el póster y su recibo existen`)
      continue
    }
    const b = readFileSync(enDisco(video))
    afirmar(
      b.length === r.bytesDelVideo && statSync(enDisco(poster)).size === r.bytesDelPoster && b.length <= TECHO_BYTES,
      `\`${clave}\` — ${(b.length / 1e6).toFixed(2)} MB (CRF ${r.crf}, ${r.ancho}×${r.alto}, ${r.segundos} s) y póster de ${(r.bytesDelPoster / 1024).toFixed(0)} KB: el recibo dice lo mismo y entra en el techo`,
    )
    afirmar(
      b.includes('avc1', 0, 'latin1') && conInicioRapido(b) && sinAudio(b) && esWebp(readFileSync(enDisco(poster))),
      '  H.264, `+faststart` (el `moov` antes del `mdat`), sin pista de audio, y el póster es WebP',
    )
    afirmar(r.segundos >= 9.5 && r.segundos <= 12.5, `  dura ${r.segundos} s: los ~10–12 s de la spec, a 2×`)
    const px = pixelesDe(enDisco(poster))
    const bandas = px === null ? null : bandasDelBorde(px.datos, px.ancho, px.alto)
    afirmar(px !== null && bandas !== null && px.ancho === r.ancho && px.alto === r.alto && cubreElCuadro(bandas), `  [B1.2b] P-H11 · el póster cubre el cuadro (${String(px?.ancho)} × ${String(px?.alto)}, lo del video; ninguna banda lisa pegada a un borde pasa del ${String(BANDA_MAXIMA * 100)} % y el contenido ocupa el ${String(AREA_MINIMA * 100)} % o más)`, bandas === null ? 'sin decodificar' : enPorcentaje(bandas))
  }
}
// El control: la captura en el cuarto de arriba a la izquierda y el resto gris (el póster del teléfono de El Garage antes de P-H11).
const sintetico = (cubre: (x: number, y: number) => boolean, ancho = 390, alto = 844): Uint8Array => {
  const d = new Uint8Array(ancho * alto * 4)
  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      const v = cubre(x, y) ? (x * 7 + y * 13) % 256 : 128
      d.set([v, v, v, 255], (y * ancho + x) * 4)
    }
  }
  return d
}
controlPositivo('  P-H11 · el detector ve un póster recortado (la captura en un cuarto, el resto gris)', sintetico((x, y) => x < 195 && y < 422), (d: Uint8Array) => cubreElCuadro(bandasDelBorde(d, 390, 844)))
afirmar(cubreElCuadro(bandasDelBorde(sintetico((_, y) => y >= 50 && y < 794), 390, 844)), '  y acepta el margen liso de un sitio (6 % arriba y abajo, como el de Esquina)')

const caja = (tipo: string, cuerpo = ''): Buffer => {
  const b = Buffer.alloc(8 + cuerpo.length)
  b.writeUInt32BE(8 + cuerpo.length, 0)
  b.write(tipo, 4, 'latin1')
  b.write(cuerpo, 8, 'latin1')
  return b
}
controlPositivo('un MP4 con el `mdat` antes del `moov` (sin faststart) se ve', Buffer.concat([caja('ftyp'), caja('mdat'), caja('moov')]), conInicioRapido)
const hdlr = (tipo: string): string => `hdlr\0\0\0\0\0\0\0\0${tipo}`
controlPositivo('  y uno con una pista de audio', caja('moov', `${hdlr('vide')}${hdlr('soun')}`), sinAudio)
afirmar(conInicioRapido(Buffer.concat([caja('ftyp'), caja('moov'), caja('mdat')])) && sinAudio(caja('moov', hdlr('vide'))), '  y los lectores aceptan uno bien armado')

afirmarLaBase()
afirmarElSelectorVivo()
afirmarB12c()
afirmarLasHistorias()
afirmarB12d()
afirmarA2()
afirmarB()

cerrar('s76-portfolio.invariant')
