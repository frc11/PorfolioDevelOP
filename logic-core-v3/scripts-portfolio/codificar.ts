/**
 * [B1] LA CODIFICACIÓN DE LOS VIDEOS DEL PORTFOLIO — de los cuadros de `grabar.ts` al MP4 y al póster de `public/portfolio/<slug>/`.
 *
 *   · H.264 (`libx264 -preset slow`), `yuv420p`, `-movflags +faststart`, sin audio (`-an`), 30 cuadros por segundo.
 *   · Entre tramos, un fundido de `FUNDIDO_S` (`xfade`).
 *   · Calidad primero: el CRF más BAJO que entra en `TECHO_BYTES` (de 24 para arriba, de a 2: con 20 y 22 ninguno entró). Si ni
 *     con 30 entra, se baja la resolución (`REDUCIDA`) en vez de seguir subiendo el CRF.
 *   · El póster: el PRIMER cuadro, en WebP (`libwebp`, calidad 80), a la resolución del video.
 *
 * Al terminar borra los cuadros crudos y anota el recibo (bytes, CRF, resolución, duración) en
 * `docs/rediseno/entregas/b1-portfolio/medios.json`, que es lo que lee el invariante de los medios (s76).
 *
 *   SLUG=el-garage DISPOSITIVO=escritorio npx tsx scripts-portfolio/codificar.ts
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  CARPETA_DE_CUADROS, CUADROS_POR_SEGUNDO, FUNDIDO_S, PANTALLAS, RECIBO_DE_LOS_MEDIOS, TECHO_BYTES, type Dispositivo, type MedioCodificado,
  type SlugGrabado,
} from './guiones'

const CRF_INICIAL = 24
const CRF_TOPE = 30
const REDUCIDA: Readonly<Record<Dispositivo, { readonly ancho: number; readonly alto: number }>> = {
  escritorio: { ancho: 1280, alto: 800 },
  movil: { ancho: 690, alto: 1494 },
}

function ffmpeg(args: readonly string[]): void {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
}

function codificar(tramos: readonly string[], cuadros: readonly number[], destino: string, crf: number, escala: string): void {
  const entradas = tramos.flatMap((dir) => ['-framerate', String(CUADROS_POR_SEGUNDO), '-i', path.join(dir, 'c%05d.png')])
  const filtros: string[] = []
  let ultimo = '[0:v]'
  let acumulado = cuadros[0] / CUADROS_POR_SEGUNDO
  for (let k = 1; k < tramos.length; k++) {
    const offset = (acumulado - FUNDIDO_S).toFixed(3)
    filtros.push(`${ultimo}[${k}:v]xfade=transition=fade:duration=${FUNDIDO_S}:offset=${offset}[f${k}]`)
    ultimo = `[f${k}]`
    acumulado += cuadros[k] / CUADROS_POR_SEGUNDO - FUNDIDO_S
  }
  filtros.push(`${ultimo}scale=${escala}:flags=lanczos,format=yuv420p[sal]`)
  ffmpeg([
    ...entradas, '-filter_complex', filtros.join(';'), '-map', '[sal]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', destino,
  ])
}

function main(): void {
  const slug = (process.env.SLUG ?? '') as SlugGrabado
  const dispositivo = (process.env.DISPOSITIVO ?? '') as Dispositivo
  const carpeta = path.join(CARPETA_DE_CUADROS, `${slug}-${dispositivo}`)
  // `completo` lo escribe `grabar.ts` al terminar: una grabación cortada no se codifica.
  if (!existsSync(path.join(carpeta, 'completo'))) throw new Error(`no hay una grabación completa en ${carpeta}: correr grabar.ts antes`)
  const tramos = readdirSync(carpeta).filter((d) => /^\d+$/.test(d)).sort((a, b) => Number(a) - Number(b)).map((d) => path.join(carpeta, d))
  const cuadros = tramos.map((dir) => readdirSync(dir).filter((f) => f.endsWith('.png')).length)
  const salida = path.join('public', 'portfolio', slug)
  mkdirSync(salida, { recursive: true })
  const video = path.join(salida, `${dispositivo}.mp4`)
  const poster = path.join(salida, `${dispositivo}.webp`)

  let ancho = PANTALLAS[dispositivo].ancho * PANTALLAS[dispositivo].escala
  let alto = PANTALLAS[dispositivo].alto * PANTALLAS[dispositivo].escala
  let crf = CRF_INICIAL
  for (;;) {
    codificar(tramos, cuadros, video, crf, `${ancho}:${alto}`)
    const bytes = statSync(video).size
    console.log(`[codificar] ${slug} ${dispositivo} ${ancho}x${alto} CRF ${crf}: ${(bytes / 1e6).toFixed(2)} MB`)
    if (bytes <= TECHO_BYTES) break
    if (crf < CRF_TOPE) crf += 2
    else if (ancho !== REDUCIDA[dispositivo].ancho) {
      ancho = REDUCIDA[dispositivo].ancho
      alto = REDUCIDA[dispositivo].alto
      crf = CRF_INICIAL
    } else throw new Error('ni reducido con CRF 30 entra en el techo: revisar el guion')
  }
  ffmpeg(['-i', path.join(tramos[0], 'c00000.png'), '-vf', `scale=${ancho}:${alto}:flags=lanczos`, '-c:v', 'libwebp', '-quality', '80', poster])

  const segundos = cuadros.reduce((s, n) => s + n / CUADROS_POR_SEGUNDO, 0) - FUNDIDO_S * (tramos.length - 1)
  const medio: MedioCodificado = {
    video: `/portfolio/${slug}/${dispositivo}.mp4`,
    poster: `/portfolio/${slug}/${dispositivo}.webp`,
    bytesDelVideo: statSync(video).size,
    bytesDelPoster: statSync(poster).size,
    crf, ancho, alto,
    segundos: Number(segundos.toFixed(2)),
    cuadros: cuadros.reduce((s, n) => s + n, 0),
  }
  mkdirSync(path.dirname(RECIBO_DE_LOS_MEDIOS), { recursive: true })
  const previo = existsSync(RECIBO_DE_LOS_MEDIOS) ? (JSON.parse(readFileSync(RECIBO_DE_LOS_MEDIOS, 'utf8')) as Record<string, MedioCodificado>) : {}
  const clave = `${slug}/${dispositivo}`
  const ordenado = Object.fromEntries(Object.entries({ ...previo, [clave]: medio }).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(RECIBO_DE_LOS_MEDIOS, `${JSON.stringify(ordenado, null, 2)}\n`)
  rmSync(carpeta, { recursive: true, force: true })
  console.log(`[codificar] ${clave}: ${JSON.stringify(medio)}`)
}

main()
