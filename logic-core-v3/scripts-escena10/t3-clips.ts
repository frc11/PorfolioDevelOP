/**
 * SPRINT ESCENA 10 — T3 · los títulos de volumen, en video: t3-clips.ts [gestos]
 *
 * Cada gesto grabado con cada material (una carga por material) y un mosaico lado a lado (negro | blanco):
 *   `portfolio-llegada`   de antes de la llegada al medio de la lectura (las letras entran desde atrás girando);
 *   `frase-llegada`       lo mismo con la frase de Por qué develOP, con el amanecer ya hecho;
 *   `paso-de-camara`      la ventana de lectura de Portfolio entera, donde la cámara orbita ~30°, hasta que el título se
 *                         va; y quieto en el medio, el puntero de punta a punta (el corrimiento del mouse que ya tiene la
 *                         cámara, hasta 22°): el volumen de las letras.
 * El puntero va abajo en el medio (fuera del logo): la cámara casi sin el corrimiento del mouse. Va a
 * `escena10/t3-titulos/clips/` y los mosaicos a `escena10/t3-titulos/`.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { grabar, mover, viajarElPuntero } from '../scripts-escena/banco-escena'
import { scrollSuave } from '../scripts-escena/clips6'
import { DIR10, abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [1440, 900]
const FUENTE = "C\\:/Windows/Fonts/arial.ttf"
const PUNTERO: readonly [number, number] = [720, 700]

const lectura = JSON.parse(readFileSync(`${DIR10}/t3-titulos/lectura-1440.json`, 'utf8')) as { ventanas: Record<string, { scroll: [number, number] } | null> }
const ventana = (id: string): [number, number] => {
  const v = lectura.ventanas[id]
  if (v === null || v === undefined) throw new Error(`sin ventana de lectura para ${id}`)
  return v.scroll
}

interface Gesto {
  /** Dónde se para antes de grabar (y cuánto espera ahí), y el gesto. */
  readonly antes: number
  readonly espera: number
  readonly gesto: (b: Banco) => Promise<void>
  /** El recorte (x, y, ancho, alto en 1440 × 900) y su ancho de salida. */
  readonly zona: readonly [number, number, number, number]
  readonly ancho: number
}

const [p0, p1] = ventana('portfolio')
const [f0, f1] = ventana('frase-izquierda')
const GESTOS: Readonly<Record<string, Gesto>> = {
  'portfolio-llegada': {
    antes: p0 - 500,
    espera: 3000,
    gesto: async (b) => {
      await esperar(600)
      await scrollSuave(b, p0 - 500, Math.round((p0 + p1) / 2), 4000)
      await esperar(1800)
    },
    zona: [180, 120, 1260, 560],
    ancho: 944,
  },
  'frase-llegada': {
    antes: f0 - 700,
    espera: 6000,
    gesto: async (b) => {
      await esperar(600)
      await scrollSuave(b, f0 - 700, Math.round((f0 + f1) / 2), 4000)
      await esperar(1800)
    },
    zona: [0, 60, 1440, 520],
    ancho: 960,
  },
  'paso-de-camara': {
    antes: p0 - 100,
    espera: 3000,
    gesto: async (b) => {
      const medio = Math.round((p0 + p1) / 2)
      await esperar(500)
      await scrollSuave(b, p0 - 100, p1 + 350, 8000)
      await esperar(800)
      await scrollSuave(b, p1 + 350, medio, 1500)
      await esperar(1200)
      await viajarElPuntero(b, PUNTERO, [60, 450], 1200)
      await viajarElPuntero(b, [60, 450], [1380, 450], 3200)
      await viajarElPuntero(b, [1380, 450], PUNTERO, 1200)
      await esperar(800)
    },
    zona: [0, 0, 1440, 900],
    ancho: 960,
  },
}

async function grabarUno(nombre: string, variante: string): Promise<string> {
  const g = GESTOS[nombre]
  const dir = carpeta('t3-titulos/clips')
  const b = await abrir(`producto,titulos=${variante}`, ANCHO, ALTO)
  try {
    await mover(b, PUNTERO[0], PUNTERO[1])
    await scrollHasta(b, g.antes)
    await esperar(g.espera)
    const destino = `${dir}/${nombre}-${variante}`
    await grabar(b, destino, () => g.gesto(b), ANCHO)
    const [x, y, w, h] = g.zona
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${destino}.mp4`, '-vf', `crop=${String(w)}:${String(h)}:${String(x)}:${String(y)},scale=${String(g.ancho)}:-2,fps=30,drawtext=fontfile='${FUENTE}':text='${variante}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${destino}-zona.mp4`])
    return `${destino}-zona.mp4`
  } finally {
    await b.cerrar()
  }
}

async function principal(): Promise<void> {
  const que = process.argv.slice(2).length > 0 ? process.argv.slice(2) : Object.keys(GESTOS)
  for (const nombre of que) {
    const partes = [await grabarUno(nombre, 'negro'), await grabarUno(nombre, 'blanco')]
    const filtro = '[0:v]tpad=stop_mode=clone:stop_duration=10[a];[1:v]tpad=stop_mode=clone:stop_duration=10[b];[a][b]hstack=inputs=2[s]'
    const d = Math.max(...partes.map((p) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], { encoding: 'utf8' }).trim())))
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', partes[0], '-i', partes[1], '-filter_complex', filtro, '-map', '[s]', '-t', d.toFixed(2), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${carpeta('t3-titulos')}/${nombre}.mp4`])
    console.log(`${nombre}.mp4`)
  }
}

if (process.argv[1]?.endsWith('t3-clips.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
