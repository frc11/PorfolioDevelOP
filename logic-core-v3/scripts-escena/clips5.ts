/**
 * SPRINT ESCENA 5 — los clips: lo que se mueve se juzga en video. clips5.ts <qué> [variante]
 *
 *   · `moire-recorrido` — el recorrido completo a 1440 con M1a + M2 + M3 + M4 (el cursor entra y
 *     sale del logo al principio, para el principal de M3); `moire-quieto` — 20 s quieto en el hero.
 *   · `formacion-ruta` — el recorrido con la formación; `formacion-mirada` — F-mirada.
 *   · `estrellas` — el atardecer que las enciende, la noche quieta y la entrada al túnel.
 *   · `obstaculo` — 5a: scroll fuerte y frenada con el logo en cuadro, y un barrido del cursor.
 *   · `posarse` — 5b: 40 s quieto y después scroll.
 *   · `motas` — 5d: la noche, quieta y con un scroll corto.
 *   · `relieve <R1|R2>` — 5e: quieto y con el ruido vivo.
 *
 * El cursor va como un punto rojo que sólo existe en la captura (`PUNTO_DEL_CURSOR`).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { DIR5, PUNTO_DEL_CURSOR, escenaViva, grabar, mover, topeMas, viajarElPuntero } from './banco-escena'

const [QUE, VARIANTE] = [process.argv[2] ?? '', process.argv[3] ?? '']

async function abrir(pedido: string, ancho = 1440, alto = 900): Promise<Banco> {
  return abrirBanco(ancho, alto, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'; ${PUNTO_DEL_CURSOR}` })
}

function carpeta(nombre: string): string {
  const dir = `${DIR5}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

/** Un scroll suave de `desde` a `hasta` en `ms`, con la curva de ida y vuelta de siempre. */
function scrollSuave(b: Banco, desde: number, hasta: number, ms: number): Promise<unknown> {
  return medir(
    b.p,
    `new Promise((listo) => { const t0 = performance.now(); const paso = () => { const u = Math.min(1, (performance.now() - t0) / ${String(ms)}); const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; window.scrollTo(0, ${String(desde)} + (${String(hasta)} - ${String(desde)}) * e); if (u < 1) requestAnimationFrame(paso); else listo(1) }; requestAnimationFrame(paso) })`,
  )
}

/** Un punto de la zona donde el logo da hover (E4), recorriendo una grilla. */
async function puntoDelLogo(b: Banco, zona: readonly [number, number, number, number]): Promise<[number, number]> {
  const [x0, y0, x1, y1] = zona
  const dentro: [number, number][] = []
  for (let j = 0; j <= 6; j += 1) {
    for (let i = 0; i <= 6; i += 1) {
      const x = x0 + ((x1 - x0) * i) / 6
      const y = y0 + ((y1 - y0) * j) / 6
      await mover(b, x, y)
      await esperar(200)
      if ((await escenaViva(b))?.hover === true) dentro.push([x, y])
    }
  }
  if (dentro.length === 0) throw new Error('no encontré el logo: ningún punto de la zona dio hover')
  const media = (k: 0 | 1): number => Math.round(dentro.reduce((s, p) => s + p[k], 0) / dentro.length)
  const c: [number, number] = [media(0), media(1)]
  return dentro.reduce((mejor, p) => (Math.hypot(p[0] - c[0], p[1] - c[1]) < Math.hypot(mejor[0] - c[0], mejor[1] - c[1]) ? p : mejor))
}

function concatenar(partes: readonly string[], destino: string): void {
  const lista = partes.flatMap((p) => ['-i', p])
  const filtro = `${partes.map((_, i) => `[${String(i)}:v]`).join('')}concat=n=${String(partes.length)}:v=1[v]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...lista, '-filter_complex', filtro, '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
  for (const p of partes) rmSync(p, { force: true })
}

/** Recorta una zona del clip y la agranda al doble, sin suavizar: para lo que es chico. */
function recorte(origen: string, destino: string, x: number, y: number, ancho: number, alto: number): void {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', origen, '-vf', `crop=${String(ancho)}:${String(alto)}:${String(x)}:${String(y)},scale=${String(ancho * 2)}:-2:flags=neighbor`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
}

const fin = (b: Banco): Promise<number> => medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
const FUERA: [number, number] = [1400, 880]

async function moireRecorrido(): Promise<void> {
  const dir = carpeta('moire')
  const b = await abrir('producto')
  try {
    const trabajos = await topeMas('trabajos', 0)(b)
    const porQue = await topeMas('por-que-develop', 0)(b)
    const pie = await fin(b)
    const logo = await puntoDelLogo(b, [800, 330, 1150, 600])
    await mover(b, FUERA[0], FUERA[1])
    await esperar(3000)
    const a = await grabar(b, `${dir}/recorrido-a`, async () => {
      await esperar(1500)
      // El principal de M3: el cursor entra al logo y sale.
      await viajarElPuntero(b, FUERA, logo, 700)
      await esperar(2500)
      await viajarElPuntero(b, logo, FUERA, 700)
      await esperar(2500)
      await scrollSuave(b, 0, trabajos, 14000)
      await esperar(2000)
    }, 1440)
    const c = await grabar(b, `${dir}/recorrido-b`, async () => {
      await scrollSuave(b, trabajos, porQue, 8000)
      await esperar(1500)
      await scrollSuave(b, porQue, pie, 11000)
      await esperar(2500)
    }, 1440)
    concatenar([`${dir}/recorrido-a.mp4`, `${dir}/recorrido-b.mp4`], `${dir}/recorrido-1440.mp4`)
    console.log(JSON.stringify({ clip: 'moire-recorrido', a, b: c }))
  } finally {
    await b.cerrar()
  }
}

async function moireQuieto(pedido: string, nombre: string): Promise<void> {
  const dir = carpeta('moire')
  const b = await abrir(pedido)
  try {
    await mover(b, FUERA[0], FUERA[1])
    await esperar(3000)
    const r = await grabar(b, `${dir}/${nombre}`, () => esperar(20000), 1440)
    console.log(JSON.stringify({ clip: nombre, ...r }))
  } finally {
    await b.cerrar()
  }
}

async function formacionRuta(): Promise<void> {
  const dir = carpeta('formacion')
  const b = await abrir('producto,formacion')
  try {
    const trabajos = await topeMas('trabajos', 0)(b)
    const porQue = await topeMas('por-que-develop', 0)(b)
    const pie = await fin(b)
    await esperar(1500)
    const a = await grabar(b, `${dir}/ruta-a`, async () => {
      await esperar(1200)
      await scrollSuave(b, 0, trabajos, 12000)
      await esperar(1500)
    }, 1440)
    await scrollHasta(b, porQue)
    const c = await grabar(b, `${dir}/ruta-b`, async () => {
      await esperar(1000)
      await scrollSuave(b, porQue, pie, 10000)
      await esperar(1500)
    }, 1440)
    concatenar([`${dir}/ruta-a.mp4`, `${dir}/ruta-b.mp4`], `${dir}/recorrido-1440.mp4`)
    console.log(JSON.stringify({ clip: 'formacion-ruta', a, b: c }))
  } finally {
    await b.cerrar()
  }
}

async function formacionMirada(): Promise<void> {
  const dir = carpeta('formacion')
  const b = await abrir('producto,formacion,mirada')
  try {
    // En el hero el logo va a la derecha y detrás cae un bloque entero de la formación.
    const logo = await puntoDelLogo(b, [800, 330, 1150, 600])
    await mover(b, FUERA[0], FUERA[1])
    await esperar(4500)
    const r = await grabar(b, `${dir}/mirada`, async () => {
      await esperar(1500)
      await viajarElPuntero(b, FUERA, logo, 700)
      await esperar(6000)
      await viajarElPuntero(b, logo, FUERA, 700)
      await esperar(5000)
    }, 1440)
    console.log(JSON.stringify({ clip: 'formacion-mirada', logo, ...r }))
  } finally {
    await b.cerrar()
  }
}

async function estrellas(): Promise<void> {
  const dir = carpeta('estrellas')
  const b = await abrir('producto,formacion,estrellas')
  try {
    const numeros = await topeMas('trabajos', -1.2)(b)
    const trabajos = await topeMas('trabajos', 0)(b)
    const tunel = await topeMas('trabajos', 1.4)(b)
    await scrollHasta(b, numeros)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(2500)
    const r = await grabar(b, `${dir}/atardecer-noche-tunel`, async () => {
      await esperar(1000)
      await scrollSuave(b, numeros, trabajos, 9000)
      await esperar(9000)
      await scrollSuave(b, trabajos, tunel, 5000)
      await esperar(1500)
    }, 1440)
    recorte(`${dir}/atardecer-noche-tunel.mp4`, `${dir}/noche-recorte-x2.mp4`, 0, 0, 720, 360)
    console.log(JSON.stringify({ clip: 'estrellas', ...r }))
  } finally {
    await b.cerrar()
  }
}

async function obstaculo(): Promise<void> {
  const dir = carpeta('obstaculo')
  const b = await abrir('producto,obstaculo')
  try {
    const quienes = await topeMas('quienes-somos', 0.15)(b)
    const logo = await puntoDelLogo(b, [800, 330, 1150, 600])
    await mover(b, FUERA[0], FUERA[1])
    await esperar(3000)
    const r = await grabar(b, `${dir}/scroll-y-cursor`, async () => {
      await esperar(1200)
      // Un scroll fuerte y la frenada, con el logo en cuadro: las estelas se abren a su alrededor.
      await scrollSuave(b, 0, quienes * 0.55, 900)
      await esperar(2200)
      await scrollSuave(b, quienes * 0.55, 0, 900)
      await esperar(2500)
      // El cursor barre el polvo contra el logo, de los dos lados.
      for (const [de, a] of [[[500, 300], [logo[0] + 60, logo[1]]], [[1420, 700], [logo[0] - 60, logo[1]]], [[700, 820], [logo[0], logo[1] - 40]]] as const) {
        await viajarElPuntero(b, de, a, 900)
        await esperar(600)
      }
      await viajarElPuntero(b, [logo[0], logo[1] - 40], FUERA, 600)
      await esperar(2000)
    }, 1440)
    console.log(JSON.stringify({ clip: 'obstaculo', logo, ...r }))
  } finally {
    await b.cerrar()
  }
}

async function posarse(): Promise<void> {
  const dir = carpeta('polvo-se-posa')
  const b = await abrir('producto,posarse')
  try {
    await mover(b, FUERA[0], FUERA[1])
    await esperar(1500)
    const r = await grabar(b, `${dir}/quieto-40s-y-scroll`, async () => {
      await esperar(40000)
      await scrollSuave(b, 0, 380, 1200)
      await esperar(1500)
      await scrollSuave(b, 380, 0, 1200)
      await esperar(5000)
    }, 1440)
    console.log(JSON.stringify({ clip: 'posarse', ...r }))
  } finally {
    await b.cerrar()
  }
}

async function motas(): Promise<void> {
  const dir = carpeta('motas')
  const b = await abrir('producto,motas')
  try {
    const trabajos = await topeMas('trabajos', 0)(b)
    await scrollHasta(b, trabajos)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(4000)
    const r = await grabar(b, `${dir}/noche`, async () => {
      await esperar(12000)
      await scrollSuave(b, trabajos, trabajos - 500, 1500)
      await esperar(1500)
      await scrollSuave(b, trabajos - 500, trabajos, 1500)
      await esperar(4000)
    }, 1440)
    console.log(JSON.stringify({ clip: 'motas', ...r }))
  } finally {
    await b.cerrar()
  }
}

async function relieve(cual: string): Promise<void> {
  const dir = carpeta('relieve')
  const base = cual === 'R2' ? 'producto,formacion,R2' : 'producto,R1'
  for (const [nombre, pedido] of [['quieto', base], ['vivo', `${base},relieve=vivo`]] as const) {
    const b = await abrir(pedido)
    try {
      const quienes = await topeMas('quienes-somos', 0.15)(b)
      await mover(b, FUERA[0], FUERA[1])
      await esperar(3000)
      const r = await grabar(b, `${dir}/${cual}-${nombre}`, async () => {
        await esperar(9000)
        await scrollSuave(b, 0, quienes, 6000)
        await esperar(5000)
      }, 1440)
      console.log(JSON.stringify({ clip: `relieve-${cual}-${nombre}`, ...r }))
    } finally {
      await b.cerrar()
    }
  }
}

async function principal(): Promise<void> {
  if (QUE === 'moire-recorrido') return moireRecorrido()
  if (QUE === 'moire-quieto') {
    await moireQuieto('producto', 'hero-quieto-20s')
    return moireQuieto('producto,moire=hoy', 'hero-quieto-20s-el-de-antes')
  }
  if (QUE === 'formacion-ruta') return formacionRuta()
  if (QUE === 'formacion-mirada') return formacionMirada()
  if (QUE === 'estrellas') return estrellas()
  if (QUE === 'obstaculo') return obstaculo()
  if (QUE === 'posarse') return posarse()
  if (QUE === 'motas') return motas()
  if (QUE === 'relieve') return relieve(VARIANTE)
  throw new Error(`no sé qué es «${QUE}»`)
}

principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
