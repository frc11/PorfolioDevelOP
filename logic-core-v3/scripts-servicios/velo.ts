/**
 * [SERVICIOS M3] EL CONTRASTE DEL TEXTO SOBRE EL VELO — en los cuadros reales del video (M0 §4.7).
 *
 * Por versión, dos cuadros por segundo a la resolución del archivo: de cada cuadro se toma el píxel MÁS CLARO de todo el cuadro (no
 * solo el de debajo del texto: el recorte de `object-cover` cambia con el ancho y así vale para cualquiera), se le compone encima la
 * tinta con el alfa que el velo garantiza bajo el texto (`VELO_DEL_VIDEO.alfaBajoElTexto`), en sRGB como lo pinta el navegador, y se
 * mide contra el papel (`text-fondo`). Los dos colores se leen del tema. El peor de todos los cuadros va al recibo, y el test lo lee.
 *
 *   npx tsx scripts-servicios/velo.ts
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { VELO_DEL_VIDEO } from '../src/app/v3/_servicios/bloques/veloDelVideo'
import { RECIBO_DE_LOS_MEDIOS, type MedicionDelVelo, type ReciboDelMontaje, type Version } from './guiones'

const TEMA = readFileSync(path.join('src', 'app', 'theme-develop.css'), 'utf8')

/** El primer valor del token en el tema: el del papel (la superficie de las secciones del cuerpo). */
function token(nombre: string): string {
  const m = new RegExp(`${nombre}:\\s*(#[0-9A-Fa-f]{6})`).exec(TEMA)
  if (m?.[1] === undefined) throw new Error(`el tema no declara ${nombre}`)
  return m[1].toUpperCase()
}

const rgb = (hex: string): readonly [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as unknown as readonly [number, number, number]

function luminancia([r, g, b]: readonly [number, number, number]): number {
  const lin = (c: number): number => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function contraste(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number]
  return (claro + 0.05) / (oscuro + 0.05)
}

function medir(recibo: ReciboDelMontaje, version: Version): MedicionDelVelo {
  const v = recibo.versiones[version]
  const tinta = token('--color-tinta')
  const fondo = token('--color-fondo')
  const salida = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', path.join('public', v.video), '-vf', 'fps=2', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1024 * 1024 * 1024 })
  if (salida.status !== 0) throw new Error(`ffmpeg: ${String(salida.stderr).slice(0, 200)}`)
  const crudo = salida.stdout
  const porCuadro = v.ancho * v.alto * 3
  const cuadros = Math.floor(crudo.length / porCuadro)
  const t = rgb(tinta)
  const a = VELO_DEL_VIDEO.alfaBajoElTexto
  let peor = Number.POSITIVE_INFINITY
  for (let c = 0; c < cuadros; c++) {
    let masClaro: readonly [number, number, number] = [0, 0, 0]
    let lMax = -1
    for (let i = c * porCuadro; i < (c + 1) * porCuadro; i += 3) {
      const px = [crudo[i] ?? 0, crudo[i + 1] ?? 0, crudo[i + 2] ?? 0] as const
      const l = luminancia(px)
      if (l > lMax) {
        lMax = l
        masClaro = px
      }
    }
    const compuesto = [0, 1, 2].map((k) => Math.round(a * (t[k] ?? 0) + (1 - a) * (masClaro[k] ?? 0))) as unknown as readonly [number, number, number]
    peor = Math.min(peor, contraste(rgb(fondo), compuesto))
  }
  return { alfaBajoElTexto: a, tinta, fondo, cuadrosMedidos: cuadros, peorContraste: Number(peor.toFixed(2)) }
}

function main(): void {
  const recibo = JSON.parse(readFileSync(RECIBO_DE_LOS_MEDIOS, 'utf8')) as ReciboDelMontaje
  const velo = { horizontal: medir(recibo, 'horizontal'), vertical: medir(recibo, 'vertical') }
  writeFileSync(RECIBO_DE_LOS_MEDIOS, `${JSON.stringify({ ...recibo, velo }, null, 2)}\n`)
  for (const [version, m] of Object.entries(velo)) console.log(`[velo] ${version}: ${m.cuadrosMedidos} cuadros, el peor contraste ${m.peorContraste}:1 (tinta ${m.tinta} al ${m.alfaBajoElTexto * 100} %, texto ${m.fondo})`)
}

main()
