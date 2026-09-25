/**
 * SPRINT ESCENA 3 — los clips. clips.ts <a|b|c|d|e|todos>
 *
 *   a) el hero quieto 10 s: el pulso de reposo;
 *   b) el hover: el cursor entra al logo, se queda 4 s, sale y quedan 4 s de reposo;
 *   c) scroll y frenada (E6), el mismo gesto de ESCENA 2;
 *   d) un barrido del cursor sobre una zona vacía, de día (hero) y de noche (Trabajos), en A, en B y en
 *      B con estela, en un mosaico de 3 × 2;
 *   e) el haz sutil contra el medio, de día (pie) y de noche (Trabajos), en un mosaico de 2 × 2.
 *
 * Chrome no dibuja el cursor: el banco inyecta un punto rojo que lo sigue, sólo en la captura. Cada
 * clip anota en consola lo que la escena publica para el banco (`__escenaViva`): modos, anillos,
 * hover, empuje.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { DIR3, PUNTO_DEL_CURSOR, escenaViva, grabar, mover, topeMas, viajarElPuntero } from './banco-escena'

const DIR = `${DIR3}/clips`
const QUE = process.argv[2] ?? 'todos'
const FUENTE = "C\\:/Windows/Fonts/arial.ttf"

async function abrir(pedido: string): Promise<Banco> {
  return abrirBanco(1440, 900, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'; ${PUNTO_DEL_CURSOR}` })
}

/** Anota lo que publica la escena cada `cadaMs` mientras corre `gesto`, y devuelve los cambios. */
async function anotar(b: Banco, cadaMs: number, gesto: () => Promise<void>): Promise<string[]> {
  const notas: string[] = []
  let sigue = true
  let previo = ''
  const t0 = Date.now()
  const lector = (async () => {
    while (sigue) {
      const v = await escenaViva(b)
      const ahora = v === null ? 'sin escena' : `modo ${v.modo ?? '—'} · anillos [${v.anillos.join(', ')}] · hover ${String(v.hover)} · empuje ${v.empuje.toFixed(2)}`
      if (ahora !== previo) notas.push(`${((Date.now() - t0) / 1000).toFixed(2)} s — ${ahora}`)
      previo = ahora
      await esperar(cadaMs)
    }
  })()
  await gesto()
  sigue = false
  await lector
  return notas
}

/** El centro de los puntos de una grilla sobre la zona del logo donde la escena dice hover. */
async function puntoDelLogo(b: Banco, zona: readonly [number, number, number, number]): Promise<[number, number]> {
  const [x0, y0, x1, y1] = zona
  const dentro: [number, number][] = []
  for (let j = 0; j <= 8; j += 1) {
    for (let i = 0; i <= 8; i += 1) {
      const x = x0 + ((x1 - x0) * i) / 8
      const y = y0 + ((y1 - y0) * j) / 8
      await mover(b, x, y)
      await esperar(260)
      if ((await escenaViva(b))?.hover === true) dentro.push([x, y])
    }
  }
  if (dentro.length === 0) throw new Error('no encontré el logo: ningún punto de la zona dio hover')
  const media = (k: 0 | 1): number => Math.round(dentro.reduce((s, p) => s + p[k], 0) / dentro.length)
  return [media(0), media(1)]
}

async function clipA(): Promise<void> {
  const b = await abrir('producto')
  try {
    const notas = await anotar(b, 100, async () => {
      const r = await grabar(b, `${DIR}/a-hero-quieto`, () => esperar(10000))
      console.log(`a) ${JSON.stringify(r)}`)
    })
    for (const n of notas) console.log(`   ${n}`)
  } finally {
    await b.cerrar()
  }
}

async function clipB(): Promise<void> {
  const b = await abrir('producto')
  try {
    const fuera: [number, number] = [1330, 760]
    await mover(b, fuera[0], fuera[1])
    const logo = await puntoDelLogo(b, [760, 300, 1180, 600])
    await mover(b, fuera[0], fuera[1])
    await esperar(4500)
    console.log(`b) el logo da hover en (${logo.join(', ')})`)
    const notas = await anotar(b, 50, async () => {
      const r = await grabar(b, `${DIR}/b-hover`, async () => {
        await esperar(1500)
        await viajarElPuntero(b, fuera, logo, 600)
        await esperar(4000)
        await viajarElPuntero(b, logo, fuera, 600)
        await esperar(4500)
      })
      console.log(`b) ${JSON.stringify(r)}`)
    })
    for (const n of notas) console.log(`   ${n}`)
  } finally {
    await b.cerrar()
  }
}

async function clipC(): Promise<void> {
  const b = await abrir('producto')
  try {
    const destino = await topeMas('quienes-somos', 0.15)(b)
    const r = await grabar(b, `${DIR}/c-scroll-y-frenada`, async () => {
      await esperar(800)
      await medir(b.p, `(async () => { for (let y = 0; y <= ${String(destino)}; y += 140) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)) } return 1 })()`)
      await esperar(2200)
      await medir(b.p, `(async () => { for (let y = ${String(destino)}; y >= 0; y -= 220) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)) } window.scrollTo(0, 0); return 1 })()`)
      await esperar(2600)
    })
    console.log(`c) ${JSON.stringify(r)}`)
  } finally {
    await b.cerrar()
  }
}

/** El barrido de E7: ida con una ondulación, pausa, vuelta rápida y quietud. */
async function barrido(b: Banco, y: number): Promise<void> {
  await esperar(700)
  for (let i = 0; i <= 70; i += 1) {
    await mover(b, 160 + (1120 * i) / 70, y + 40 * Math.sin(i / 7))
    await esperar(16)
  }
  await esperar(1600)
  await viajarElPuntero(b, [1280, y], [160, y], 800)
  await esperar(2600)
}

const NIVELES_E7: readonly [string, string][] = [
  ['A', 'producto'],
  ['B', 'E1,E4,E6,E7,cursor=B'],
  ['B con estela', 'E1,E4,E6,E7,cursor=B,estela'],
]

async function clipD(): Promise<void> {
  const piezas: string[] = []
  for (const momento of ['dia', 'noche'] as const) {
    for (const [nombre, pedido] of NIVELES_E7) {
      const b = await abrir(pedido)
      try {
        if (momento === 'noche') await scrollHasta(b, await topeMas('trabajos', 0)(b))
        await mover(b, 160, 770)
        await esperar(1500)
        const archivo = `${DIR}/d-${momento}-${nombre.replace(/ /g, '-')}`
        let maximo = 0
        const notas = await anotar(b, 60, async () => {
          const r = await grabar(b, archivo, () => barrido(b, 770), 720)
          console.log(`d) ${momento} ${nombre}: ${JSON.stringify(r)}`)
        })
        for (const n of notas) maximo = Math.max(maximo, Number(/empuje ([\d.]+)/.exec(n)?.[1] ?? 0))
        console.log(`   empuje máximo ${maximo.toFixed(2)}`)
        piezas.push(`${archivo}.mp4|${momento === 'dia' ? 'día' : 'noche'} · ${nombre}`)
      } finally {
        await b.cerrar()
      }
    }
  }
  mosaico(piezas, 3, `${DIR}/d-cursor-mosaico.mp4`)
}

async function clipE(): Promise<void> {
  const piezas: string[] = []
  for (const momento of ['dia', 'noche'] as const) {
    for (const [nombre, pedido] of [['medio', 'producto'], ['sutil', 'E1,E4,E6,E7,haz=sutil']] as const) {
      const b = await abrir(pedido)
      try {
        const y = momento === 'dia' ? await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight') : await topeMas('trabajos', 0)(b)
        await scrollHasta(b, y)
        await esperar(1500)
        const archivo = `${DIR}/e-${momento}-${nombre}`
        const r = await grabar(b, archivo, () => esperar(6000), 720)
        console.log(`e) ${momento} ${nombre}: ${JSON.stringify(r)}`)
        piezas.push(`${archivo}.mp4|${momento === 'dia' ? 'día (pie)' : 'noche (Trabajos)'} · haz ${nombre}`)
      } finally {
        await b.cerrar()
      }
    }
  }
  mosaico(piezas, 2, `${DIR}/e-haz-mosaico.mp4`)
}

/** Junta clips de 720 de ancho en una grilla con rótulo; la duración es la del más corto. */
function mosaico(piezas: readonly string[], columnas: number, destino: string): void {
  const entradas = piezas.flatMap((p) => ['-i', p.split('|')[0]])
  const rotulos = piezas.map((p, i) => `[${String(i)}]scale=720:-2,drawtext=fontfile='${FUENTE}':text='${p.split('|')[1]}':x=12:y=10:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=6[v${String(i)}]`)
  const filas = Math.ceil(piezas.length / columnas)
  const disposicion = piezas.map((_, i) => `${String((i % columnas) * 720)}_${String(Math.floor(i / columnas) * 450)}`).join('|')
  const filtro = `${rotulos.join(';')};${piezas.map((_, i) => `[v${String(i)}]`).join('')}xstack=inputs=${String(piezas.length)}:layout=${disposicion}:shortest=1`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...entradas, '-filter_complex', filtro, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
  console.log(`mosaico ${String(columnas)} × ${String(filas)}: ${destino}`)
}

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  if (QUE === 'a' || QUE === 'todos') await clipA()
  if (QUE === 'b' || QUE === 'todos') await clipB()
  if (QUE === 'c' || QUE === 'todos') await clipC()
  if (QUE === 'd' || QUE === 'todos') await clipD()
  if (QUE === 'e' || QUE === 'todos') await clipE()
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
