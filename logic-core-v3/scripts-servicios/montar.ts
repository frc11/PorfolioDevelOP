/**
 * [SERVICIOS M3] EL MONTAJE DEL VIDEO DE TRABAJOS — de los cuadros de las demos y los videos de los casos a las dos versiones de
 * `public/servicios/paginas-web/` (M0 §4.4). El criterio de `scripts-portfolio/codificar.ts` (leído, no importado):
 *
 *   · los cortes de `CORTES`, sitio y demo uno a uno, de 135 cuadros cada uno, con fundidos de `FUNDIDO_S` (`xfade=fade`);
 *   · el bucle sin costura: el primer corte se parte en dos y el video arranca en su mitad y termina en su principio, así el empalme
 *     del `loop` cae adentro de un mismo scroll continuo;
 *   · H.264 (`libx264 -preset slow`), `yuv420p`, `+faststart`, sin audio (`-an`), 30 cuadros por segundo;
 *   · el CRF más BAJO que entra en `TECHO_BYTES` (de 26 a 34, de a 2) y, si no, la resolución reducida;
 *   · el póster: el PRIMER cuadro del video en WebP (calidad 80), así no hay salto cuando el video arranca encima de él.
 *
 * LEE `public/portfolio/` y NUNCA escribe ahí: toda escritura pasa por `destino()`, que solo deja escribir en los medios de servicios,
 * en la carpeta del recibo y en la de las hojas (fuera del repo). Lo afirma `medios.invariant.ts`. Al terminar borra los cuadros
 * crudos de la caché y escribe el recibo (`docs/servicios/entregas/m3/medios.json`), con bytes y sha256 de cada medio y de cada fuente.
 *
 *   npx tsx scripts-servicios/montar.ts
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  CARPETA_DE_CUADROS, CARPETA_DE_LAS_HOJAS, CARPETA_DE_LOS_MEDIOS, CORTES, CUADROS_POR_CORTE, CUADROS_POR_SEGUNDO, FUNDIDO_S,
  RECIBO_DE_LOS_MEDIOS, TECHO_BYTES, VERSIONES, urlDeLaDemo, type ReciboDelMontaje, type TramoMontado, type Version, type VersionMontada,
} from './guiones'
import { codecDelVideo, cromaDelVideo, esFaststart, manejadores } from './mp4'

const CRF_INICIAL = 26
const CRF_TOPE = 34

const RAICES_DE_ESCRITURA = [CARPETA_DE_LOS_MEDIOS, path.dirname(RECIBO_DE_LOS_MEDIOS), CARPETA_DE_LAS_HOJAS].map((r) => path.resolve(r))

/** Toda ruta que se escribe pasa por acá: fuera de las tres raíces, tira (y `public/portfolio/` no es una de ellas). */
function destino(ruta: string): string {
  const absoluta = path.resolve(ruta)
  if (!RAICES_DE_ESCRITURA.some((r) => absoluta === r || absoluta.startsWith(r + path.sep))) throw new Error(`escritura fuera de las raíces permitidas: ${ruta}`)
  return ruta
}

function ffmpeg(args: readonly string[]): void {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
}

const sha256 = (ruta: string): string => createHash('sha256').update(readFileSync(ruta)).digest('hex')
const fuenteDelCaso = (slug: string, dispositivo: string): string => path.join('public', 'portfolio', slug, `${dispositivo}.mp4`)
const cuadrosDeLaDemo = (slug: string, dispositivo: string): string => path.join(CARPETA_DE_CUADROS, `${slug}-${dispositivo}`)

/** Los tramos de una versión, en orden: el primer corte partido (su segunda mitad primero, su primera mitad al final). */
function tramosDe(version: Version): TramoMontado[] {
  const { dispositivo } = VERSIONES[version]
  const enteros: TramoMontado[] = CORTES.map((corte) =>
    corte.tipo === 'caso'
      ? { tipo: 'caso', slug: corte.slug, fuente: fuenteDelCaso(corte.slug, dispositivo), desdeElCuadro: corte.desdeElCuadro[dispositivo], cuadros: CUADROS_POR_CORTE }
      : { tipo: 'demo', slug: corte.slug, fuente: cuadrosDeLaDemo(corte.slug, dispositivo), desdeElCuadro: 0, cuadros: CUADROS_POR_CORTE },
  )
  const [primero, ...resto] = enteros
  if (primero === undefined) throw new Error('sin cortes')
  const mitad = Math.floor(primero.cuadros / 2)
  return [
    { ...primero, desdeElCuadro: primero.desdeElCuadro + mitad, cuadros: primero.cuadros - mitad },
    ...resto,
    { ...primero, cuadros: mitad },
  ]
}

function codificar(tramos: readonly TramoMontado[], salida: string, crf: number, ancho: number, alto: number): void {
  const entradas = tramos.flatMap((t) => (t.tipo === 'demo' ? ['-framerate', String(CUADROS_POR_SEGUNDO), '-i', path.join(t.fuente, 'c%05d.png')] : ['-i', t.fuente]))
  const filtros: string[] = tramos.map((t, k) =>
    `[${k}:v]fps=${CUADROS_POR_SEGUNDO},trim=start_frame=${t.desdeElCuadro}:end_frame=${t.desdeElCuadro + t.cuadros},setpts=PTS-STARTPTS,` +
    `scale=${ancho}:${alto}:force_original_aspect_ratio=increase:flags=lanczos,crop=${ancho}:${alto},setsar=1,format=yuv420p[t${k}]`,
  )
  let ultimo = '[t0]'
  let acumulado = (tramos[0]?.cuadros ?? 0) / CUADROS_POR_SEGUNDO
  for (let k = 1; k < tramos.length; k++) {
    filtros.push(`${ultimo}[t${k}]xfade=transition=fade:duration=${FUNDIDO_S}:offset=${(acumulado - FUNDIDO_S).toFixed(4)}[f${k}]`)
    ultimo = `[f${k}]`
    acumulado += (tramos[k]?.cuadros ?? 0) / CUADROS_POR_SEGUNDO - FUNDIDO_S
  }
  ffmpeg([
    ...entradas, '-filter_complex', filtros.join(';'), '-map', ultimo, '-r', String(CUADROS_POR_SEGUNDO),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', destino(salida),
  ])
}

function montar(version: Version): VersionMontada {
  const v = VERSIONES[version]
  const tramos = tramosDe(version)
  for (const t of tramos) {
    if (t.tipo === 'demo' && !existsSync(path.join(t.fuente, 'completo'))) throw new Error(`no hay una grabación completa en ${t.fuente}: correr grabar.ts (o grabarEnVivo.ts) antes`)
    if (t.tipo === 'caso' && !existsSync(t.fuente)) throw new Error(`falta la fuente ${t.fuente}`)
  }
  mkdirSync(destino(CARPETA_DE_LOS_MEDIOS), { recursive: true })
  const video = path.join(CARPETA_DE_LOS_MEDIOS, `trabajos-${version}.mp4`)
  const poster = path.join(CARPETA_DE_LOS_MEDIOS, `trabajos-${version}.webp`)
  let { ancho, alto } = v
  let crf = CRF_INICIAL
  for (;;) {
    codificar(tramos, video, crf, ancho, alto)
    const bytes = statSync(video).size
    console.log(`[montar] ${version} ${ancho}x${alto} CRF ${crf}: ${(bytes / 1e6).toFixed(2)} MB`)
    if (bytes <= TECHO_BYTES) break
    if (crf < CRF_TOPE) crf += 2
    else if (ancho !== v.reducida.ancho) {
      ancho = v.reducida.ancho
      alto = v.reducida.alto
      crf = CRF_INICIAL
    } else throw new Error(`${version}: ni reducida con CRF ${CRF_TOPE} entra en el techo`)
  }
  ffmpeg(['-i', video, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', destino(poster)])
  const buf = readFileSync(video)
  const cuadros = tramos.reduce((s, t) => s + t.cuadros, 0) - Math.round(FUNDIDO_S * CUADROS_POR_SEGUNDO) * (tramos.length - 1)
  const croma = cromaDelVideo(buf)
  return {
    video: `/${path.relative('public', video).replace(/\\/g, '/')}`,
    poster: `/${path.relative('public', poster).replace(/\\/g, '/')}`,
    bytesDelVideo: buf.length,
    sha256DelVideo: sha256(video),
    bytesDelPoster: statSync(poster).size,
    sha256DelPoster: sha256(poster),
    crf, ancho, alto,
    cuadros,
    segundos: Number((cuadros / CUADROS_POR_SEGUNDO).toFixed(3)),
    codec: codecDelVideo(buf),
    pixFmt: croma !== null && croma.croma === 1 && croma.bits === 8 ? 'yuv420p' : null,
    pistasDeAudio: manejadores(buf).filter((m) => m === 'soun').length,
    faststart: esFaststart(buf),
    tramos: tramos.map((t) => ({ ...t, fuente: t.fuente.replace(/\\/g, '/').replace(CARPETA_DE_CUADROS.replace(/\\/g, '/'), '~/.cache/servicios/m3') })),
  }
}

/** Las hojas de contactos: cada video de los casos, un cuadro cada medio segundo (de izquierda a derecha y de arriba abajo), para elegir el tramo (fuera del repo). Sin rótulos: el ffmpeg de la máquina no tiene fontconfig. */
function hojas(): void {
  mkdirSync(destino(CARPETA_DE_LAS_HOJAS), { recursive: true })
  for (const corte of CORTES) {
    if (corte.tipo !== 'caso') continue
    for (const dispositivo of ['escritorio', 'movil'] as const) {
      const salida = path.join(CARPETA_DE_LAS_HOJAS, `${corte.slug}-${dispositivo}.png`)
      const escala = dispositivo === 'escritorio' ? 'scale=320:-2' : 'scale=160:-2'
      ffmpeg(['-i', fuenteDelCaso(corte.slug, dispositivo), '-vf', `fps=2,${escala},tile=5x4`, '-frames:v', '1', destino(salida)])
    }
  }
}

function main(): void {
  const versiones = { horizontal: montar('horizontal'), vertical: montar('vertical') }
  const fuentes = [...new Set(Object.values(versiones).flatMap((v) => v.tramos.filter((t) => t.tipo === 'caso').map((t) => t.fuente)))]
    .sort()
    .map((ruta) => ({ ruta, bytes: statSync(ruta).size, sha256: sha256(ruta) }))
  const demos = CORTES.flatMap((c) => (c.tipo === 'demo' ? [c.slug] : [])).map((slug) => {
    const metodos = (['escritorio', 'movil'] as const).map((d) => {
      const informe = JSON.parse(readFileSync(path.join(cuadrosDeLaDemo(slug, d), 'informe.json'), 'utf8')) as { readonly metodo?: string }
      return `${d}: ${informe.metodo ?? 'tiempo virtual'}`
    })
    return { slug, url: urlDeLaDemo(slug), grabacion: metodos.join(' · ') }
  })
  try {
    hojas()
  } catch (error) {
    console.warn(`[montar] las hojas de contactos no salieron (${String(error).slice(0, 160)}): el montaje sigue`)
  }
  const previo = existsSync(RECIBO_DE_LOS_MEDIOS) ? (JSON.parse(readFileSync(RECIBO_DE_LOS_MEDIOS, 'utf8')) as Partial<ReciboDelMontaje>) : {}
  const recibo: ReciboDelMontaje = { ...previo, versiones, fuentes, demos, velo: null }
  mkdirSync(destino(path.dirname(RECIBO_DE_LOS_MEDIOS)), { recursive: true })
  writeFileSync(destino(RECIBO_DE_LOS_MEDIOS), `${JSON.stringify(recibo, null, 2)}\n`)
  if (process.env.CONSERVAR_CUADROS !== '1') for (const d of readdirSync(CARPETA_DE_CUADROS)) rmSync(path.join(CARPETA_DE_CUADROS, d), { recursive: true, force: true })
  for (const [version, v] of Object.entries(versiones)) console.log(`[montar] ${version}: ${v.bytesDelVideo} bytes, CRF ${v.crf}, ${v.ancho}x${v.alto}, ${v.segundos} s; póster ${v.bytesDelPoster} bytes`)
}

main()
