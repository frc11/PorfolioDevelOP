/**
 * SPRINT ESCENA 9 — T5 · la llegada de los títulos en 3D, en video: t5-clips.ts [ancho alto]
 *
 * En Portfolio y en Por qué develOP, el MISMO scroll (suave, con duración fija) por la llegada del título, grabado con
 * el producto, con `titulos=dom` y con `titulos=webgl` (una carga por pedido), y cada uno también con movimiento
 * reducido (tiene que aparecer sin moverse). Por sección, dos mosaicos con el recorte del título: los tres con
 * movimiento (`-llegada`) y los tres con movimiento reducido (`-reducido`, la rama quieta de la sección: otro lugar).
 * Va a `escena9/t5-titulos/`.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { CONTADOR, ESPIA_DE_SALTOS, PUNTO_DEL_CURSOR, grabar, mover, topeMas } from '../scripts-escena/banco-escena'
import { ERRORES } from '../scripts-escena/formacion'
import { FUERA, scrollSuave } from '../scripts-escena/clips6'
import { carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

export const PEDIDOS = [
  ['producto', 'hoy'],
  ['producto,titulos=dom', 'V1 DOM'],
  ['producto,titulos=webgl', 'V2 WebGL'],
] as const

interface Seccion {
  readonly nombre: string
  /** Dónde se para antes (y qué hace ahí) y hasta dónde scrollea (px). */
  readonly antes: (b: Banco) => Promise<number>
  readonly hasta: (b: Banco) => Promise<number>
  /** El elemento del título (para el recorte, medido llegado). */
  readonly titulo: string
}

const SECCIONES: readonly Seccion[] = [
  {
    nombre: 'portfolio',
    antes: topeMas('trabajos', -0.9),
    hasta: topeMas('trabajos', 0.15),
    titulo: '#titular-trabajos',
  },
  {
    nombre: 'por-que-develop',
    // Antes, el amanecer: con un salto directo la frase espera al día.
    antes: async (b) => {
      const y = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * 0.12) })()`)
      await scrollHasta(b, y)
      await esperar(5000)
      return (await topeMas('por-que-develop', 0)(b)) - 60
    },
    hasta: async (b) => medir<number>(b.p, `(() => { const s = document.querySelector('[data-panel="por-que-develop"]'); const r = s.getBoundingClientRect(); return Math.round(r.top + scrollY + 0.5 * (r.height - innerHeight)) })()`),
    titulo: '[data-pieza="frase-del-final"]',
  },
]

async function grabarUno(s: Seccion, pedido: string, reducido: boolean, destino: string): Promise<[number, number, number, number]> {
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena3', reducido, antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'; ${PUNTO_DEL_CURSOR}; ${CONTADOR}; ${ESPIA_DE_SALTOS}; ${ERRORES}` })
  try {
    await mover(b, FUERA[0], FUERA[1])
    const desde = await s.antes(b)
    await scrollHasta(b, desde)
    await esperar(2500)
    const hasta = await s.hasta(b)
    await grabar(b, destino, async () => {
      await esperar(400)
      await scrollSuave(b, desde, hasta, 5000)
      await esperar(1200)
    }, ANCHO)
    // La caja del título llegado (unión de sus rectángulos), con margen.
    return await medir<[number, number, number, number]>(b.p, `(() => {
      const el = document.querySelector('${s.titulo}')
      if (!el) return [0, 0, innerWidth, innerHeight]
      let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
      for (const n of [el, ...el.querySelectorAll('*')]) { const r = n.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom) }
      const m = 40
      return [Math.max(0, Math.floor(x0 - m)), Math.max(0, Math.floor(y0 - m)), Math.min(innerWidth, Math.ceil(x1 + m)), Math.min(innerHeight, Math.ceil(y1 + m))]
    })()`)
  } finally {
    await b.cerrar()
  }
}

const FUENTE = "C\\:/Windows/Fonts/arial.ttf"

async function principal(): Promise<void> {
  const dir = carpeta('t5-titulos')
  const cajas: Record<string, unknown> = {}
  for (const s of SECCIONES) {
    for (const reducido of [false, true]) {
      const partes: string[] = []
      let caja: [number, number, number, number] | null = null
      for (const [pedido, rotulo] of PEDIDOS) {
        const destino = `${dir}/clips/${s.nombre}-${rotulo.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}${reducido ? '-reducido' : ''}`
        const c = await grabarUno(s, pedido, reducido, destino)
        caja ??= c
        partes.push(`${destino}.mp4`)
        console.log(s.nombre, rotulo, reducido ? 'reducido' : '', JSON.stringify(c))
      }
      // Con movimiento reducido la sección monta su rama quieta: otro lugar (y otro recorte) para el título.
      const [x0, y0, x1, y1] = caja ?? [0, 0, ANCHO, ALTO]
      const [cx, cy] = [Math.max(0, x0), Math.max(0, y0)]
      const [w, h] = [(Math.min(ANCHO, x1) - cx) & ~1, (Math.min(ALTO, y1) - cy) & ~1]
      const usable = w > 16 && h > 16
      const [rx, ry, rw, rh] = usable ? [cx, cy, w, h] : [0, 0, ANCHO, ALTO]
      cajas[`${s.nombre}${reducido ? ' reducido' : ''}`] = [rx, ry, rw, rh]
      const escala = Math.min(1, 640 / rw)
      const celda = (i: number, texto: string): string => `[${String(i)}:v]crop=${String(rw)}:${String(rh)}:${String(rx)}:${String(ry)},scale=${String(Math.round(rw * escala) & ~1)}:-2,fps=30,drawtext=fontfile='${FUENTE}':text='${texto}':x=10:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5,tpad=stop_mode=clone:stop_duration=5[v${String(i)}]`
      const filtro = `${PEDIDOS.map(([, r], i) => celda(i, reducido ? `${r} - reducido` : r)).join(';')};[v0][v1][v2]hstack=inputs=3,trim=duration=8.5[s]`
      const salida = `${dir}/${s.nombre}-${reducido ? 'reducido' : 'llegada'}.mp4`
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...partes.flatMap((p) => ['-i', p]), '-filter_complex', filtro, '-map', '[s]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', salida])
      console.log(salida)
    }
  }
  writeFileSync(`${dir}/cajas-${String(ANCHO)}.json`, JSON.stringify(cajas, null, 1))
}

if (process.argv[1]?.endsWith('t5-clips.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
