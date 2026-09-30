/**
 * SPRINT ESCENA 10 — T1 · el paso de la luz del día a la de la noche y de vuelta, en video: t1-pasos.ts <rótulo> [paso]
 *
 * Dos gestos grabados a velocidad real con el producto que está en el servidor (`antes` con el de ESCENA 9, `despues`
 * con el del cierre): `anochecer`, de Quiénes somos a la noche de Trabajos (la sombra del logo se va y el haz prende), y
 * `amanecer`, de Tu panel al escenario de Por qué develOP (el frente del día alcanza al logo: se va el haz y vuelve la
 * sombra). El recorte es el logo y el piso de abajo. Con `mosaico`, los dos rótulos lado a lado por gesto. Va a
 * `escena10/t1-cierre/pasos/`.
 */
import { execFileSync } from 'node:child_process'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { grabar, mover, topeMas } from '../scripts-escena/banco-escena'
import { FUERA, scrollSuave } from '../scripts-escena/clips6'
import { abrir, carpeta } from './banco'

const ROTULO = process.argv[2] ?? 'despues'
const QUE = (process.argv[3] ?? 'anochecer amanecer').split(' ').filter(Boolean)
const [ANCHO, ALTO] = [1440, 900]
const FUENTE = "C\\:/Windows/Fonts/arial.ttf"
/** El logo y el piso de abajo (en 1440 × 900). */
const ZONA = [300, 120, 1100, 740] as const

/** El scroll con el borde de abajo de Tu panel en `f` del alto del cuadro (el del banco del amanecer de ESCENA 8). */
function bordeEn(b: Banco, f: number): Promise<number> {
  return medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * ${String(f)}) })()`)
}

const GESTOS: Readonly<Record<string, { readonly desde: (b: Banco) => Promise<number>; readonly hasta: (b: Banco) => Promise<number>; readonly ms: number; readonly despues: number }>> = {
  anochecer: { desde: topeMas('quienes-somos', 0.15), hasta: topeMas('trabajos', 0), ms: 6000, despues: 5000 },
  amanecer: { desde: (b) => bordeEn(b, 1.12), hasta: topeMas('por-que-develop', 0.5), ms: 7000, despues: 3000 },
}

async function grabarUno(nombre: string): Promise<string> {
  const g = GESTOS[nombre]
  const dir = carpeta('t1-cierre/pasos')
  const b = await abrir('producto', ANCHO, ALTO)
  try {
    await mover(b, FUERA[0], FUERA[1])
    const [desde, hasta] = [await g.desde(b), await g.hasta(b)]
    await scrollHasta(b, desde)
    await esperar(3000)
    const destino = `${dir}/${nombre}-${ROTULO}`
    await grabar(b, destino, async () => {
      await esperar(600)
      await scrollSuave(b, desde, hasta, g.ms)
      await esperar(g.despues)
    }, ANCHO)
    const [x, y, w, h] = ZONA
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${destino}.mp4`, '-vf', `crop=${String(w)}:${String(h)}:${String(x)}:${String(y)},fps=30,drawtext=fontfile='${FUENTE}':text='${nombre} - ${ROTULO}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${destino}-zona.mp4`])
    return `${destino}-zona.mp4`
  } finally {
    await b.cerrar()
  }
}

function mosaico(nombre: string): void {
  const dir = carpeta('t1-cierre/pasos')
  const partes = [`${dir}/${nombre}-antes-zona.mp4`, `${dir}/${nombre}-despues-zona.mp4`]
  const filtro = `[0:v]tpad=stop_mode=clone:stop_duration=5[a];[1:v]tpad=stop_mode=clone:stop_duration=5[b];[a][b]hstack=inputs=2,trim=duration=16[s]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', partes[0], '-i', partes[1], '-filter_complex', filtro, '-map', '[s]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${carpeta('t1-cierre')}/${nombre}-antes-y-despues.mp4`])
}

async function principal(): Promise<void> {
  for (const nombre of QUE) {
    if (ROTULO === 'mosaico') mosaico(nombre)
    else console.log(await grabarUno(nombre))
  }
}

if (process.argv[1]?.endsWith('t1-pasos.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
