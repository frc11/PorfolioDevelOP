/**
 * SPRINT ESCENA 9 — T3 · lo que se mueve, en video: t3-clips.ts <prueba> [ancho alto]
 *
 * El MISMO gesto grabado con cada pedido (una carga por pedido: el polvo no es el mismo entre cuadrantes) y un mosaico
 * rotulado con el recorte de la zona que importa. `material`: del hero a Quiénes somos y de vuelta (la cámara gira
 * alrededor del logo: los reflejos corren); `sombra`: el mismo recorrido (la sombra se mueve con la luz y el logo);
 * `bloom`: el paso por la noche de Trabajos; `aa`: un scroll lento desde el hero (los cantos del logo y la trama
 * corriéndose de a poco, donde se ve el titileo). Va a `escena9/t3-material-y-luz/<prueba>/`.
 */
import { execFileSync } from 'node:child_process'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { grabar, mover, topeMas } from '../scripts-escena/banco-escena'
import { FUERA, scrollSuave } from '../scripts-escena/clips6'
import type { Banco } from '../scripts-viajes/banco'
import { abrir, carpeta } from './banco'

const [PRUEBA, ANCHO, ALTO] = [process.argv[2] ?? 'material', Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]

interface Clip {
  readonly pedidos: readonly (readonly [string, string])[]
  /** Dónde empieza (px de scroll) y el gesto. */
  readonly desde: (b: Banco) => Promise<number>
  readonly gesto: (b: Banco, desde: number) => Promise<void>
  /** El recorte: x, y, ancho, alto (en píxeles de 1440 × 900) y la escala del recorte. */
  readonly zona: readonly [number, number, number, number]
  readonly escala: number
}

const orbita = async (b: Banco, desde: number): Promise<void> => {
  const quienes = await topeMas('quienes-somos', 0.15)(b)
  await esperar(600)
  await scrollSuave(b, desde, quienes, 4000)
  await esperar(1200)
  await scrollSuave(b, quienes, desde, 4000)
  await esperar(800)
}

const CLIPS: Readonly<Record<string, Clip>> = {
  material: {
    pedidos: [['producto', 'hoy'], ['producto,material=satinado', 'negro satinado'], ['producto,material=brillante', 'negro brillante']],
    desde: async () => 0,
    gesto: orbita,
    zona: [560, 180, 800, 560],
    escala: 1,
  },
  sombra: {
    pedidos: [['producto', 'hoy (la mancha)'], ['producto,sombra-logo', 'con la sombra proyectada']],
    desde: async () => 0,
    gesto: orbita,
    zona: [420, 300, 1000, 600],
    escala: 1,
  },
  bloom: {
    pedidos: [['producto', 'hoy'], ['producto,bloom', 'con bloom de noche']],
    desde: async (b) => (await topeMas('trabajos', 0)(b)) - ALTO * 0.6,
    gesto: async (b, desde) => {
      await esperar(500)
      await scrollSuave(b, desde, desde + ALTO, 5000)
      await esperar(1500)
    },
    zona: [0, 0, 1440, 900],
    escala: 0.5,
  },
  aa: {
    pedidos: [['producto', '4 muestras (hoy)'], ['producto,aa=msaa8', '8 muestras'], ['producto,aa=taa', 'TAA']],
    desde: async () => 0,
    gesto: async (b, desde) => {
      await esperar(500)
      await scrollSuave(b, desde, desde + 420, 7000)
      await esperar(500)
    },
    zona: [700, 250, 480, 300],
    escala: 2,
  },
}

const FUENTE = "C\\:/Windows/Fonts/arial.ttf"

async function grabarUno(c: Clip, pedido: string, rotulo: string, dir: string, k: number): Promise<string> {
  const b = await abrir(pedido, ANCHO, ALTO)
  try {
    await mover(b, FUERA[0], FUERA[1])
    const desde = await c.desde(b)
    await scrollHasta(b, desde)
    await esperar(3000)
    const destino = `${dir}/${String(k)}-${rotulo.replace(/[^a-z0-9]+/gi, '-')}`
    await grabar(b, destino, () => c.gesto(b, desde), ANCHO)
    const [x, y, w, h] = c.zona
    const salida = `${destino}-zona.mp4`
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${destino}.mp4`, '-vf', `crop=${String(w)}:${String(h)}:${String(x)}:${String(y)},scale=${String(Math.round(w * c.escala) & ~1)}:-2:flags=${c.escala > 1 ? 'neighbor' : 'bicubic'},fps=30,drawtext=fontfile='${FUENTE}':text='${rotulo}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', salida])
    await medir(b.p, '1')
    return salida
  } finally {
    await b.cerrar()
  }
}

async function principal(): Promise<void> {
  const c = CLIPS[PRUEBA]
  if (c === undefined) throw new Error(`no hay clip ${PRUEBA}`)
  const dir = carpeta(`t3-material-y-luz/${PRUEBA}/clips`)
  const partes: string[] = []
  for (const [k, [pedido, rotulo]] of c.pedidos.entries()) partes.push(await grabarUno(c, pedido, rotulo, dir, k))
  // El mosaico: en fila (dos o tres), del largo del más largo.
  const entradas = partes.flatMap((p) => ['-i', p])
  const filtro = `${partes.map((_, i) => `[${String(i)}:v]tpad=stop_mode=clone:stop_duration=5[v${String(i)}]`).join(';')};${partes.map((_, i) => `[v${String(i)}]`).join('')}hstack=inputs=${String(partes.length)},trim=duration=14[s]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...entradas, '-filter_complex', filtro, '-map', '[s]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${carpeta(`t3-material-y-luz/${PRUEBA}`)}/${PRUEBA}-lado-a-lado.mp4`])
  console.log(`${PRUEBA}-lado-a-lado.mp4`)
}

if (process.argv[1]?.endsWith('t3-clips.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
