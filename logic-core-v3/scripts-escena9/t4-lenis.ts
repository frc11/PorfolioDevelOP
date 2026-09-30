/**
 * SPRINT ESCENA 9 — T4 · el scroll suave contra nk: t4-lenis.ts <curvas|clips> [ancho alto]
 *
 * La MISMA rueda (por CDP: eventos de mouse de verdad, los mismos instantes) en /v3 con la curva de hoy (`duration`
 * 1,1 con la exponencial de salida), con `lenis=nk` (lerp 0,1, el modo de nk), con `lenis=sedoso` (lerp 0,075) y en
 * nk.studio mismo.
 *   curvas: el scroll de la página en cada cuadro (requestAnimationFrame), para cuatro gestos (un golpe de rueda, un
 *           empujón de cuatro, un giro fuerte de doce y tres para arriba). Por gesto: cuánto tarda en recorrer el 63, el
 *           95 y el 99 % de lo que recorre, la velocidad máxima y cuánto se pasa; y las curvas dibujadas (una hoja).
 *   hoja:   vuelve a dibujar la hoja de las curvas desde su JSON (sin medir).
 *   clips:  el giro fuerte desde el hero, grabado con el instante de cada cuadro (sin repartirlos parejos: se ve la
 *           curva de verdad, y un cuadro perdido se ve congelado), las cuatro en una grilla.
 * Va a `escena9/t4-fluidez/lenis/`.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA, medir } from '../scripts-b4/navegador'
import type { Pagina } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { abrir, carpeta } from './banco'

const [PARTE, ANCHO, ALTO] = [process.argv[2] ?? 'curvas', Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]

/** Las cuatro: el pedido del banco (o la dirección de nk) y el rótulo. */
export const VARIANTES: readonly { readonly clave: string; readonly pedido: string | null; readonly rotulo: string }[] = [
  { clave: 'hoy', pedido: 'producto', rotulo: 'hoy (duration 1,1)' },
  { clave: 'nk', pedido: 'producto,lenis=nk', rotulo: 'lenis=nk (lerp 0,1)' },
  { clave: 'sedoso', pedido: 'producto,lenis=sedoso', rotulo: 'lenis=sedoso (lerp 0,075)' },
  { clave: 'nk.studio', pedido: null, rotulo: 'nk.studio' },
]

/** Los gestos: [instante (ms desde el arranque del gesto), deltaY] y cuánto se espera quieto después. */
export const GESTOS: readonly { readonly nombre: string; readonly rueda: readonly (readonly [number, number])[]; readonly quieto: number }[] = [
  { nombre: 'un golpe', rueda: [[0, 100]], quieto: 1800 },
  { nombre: 'un empujón (4)', rueda: [0, 50, 100, 150].map((t) => [t, 100] as const), quieto: 2000 },
  { nombre: 'un giro fuerte (12)', rueda: Array.from({ length: 12 }, (_, i) => [i * 17, 100] as const), quieto: 2400 },
  { nombre: 'tres para arriba', rueda: [0, 60, 120].map((t) => [t, -100] as const), quieto: 2000 },
]

/** El registro del scroll en cada cuadro de la página. */
const REGISTRO = `(() => {
  const r = { t: [], y: [], andando: true }
  const cuadro = (t) => { if (!r.andando) return; r.t.push(t); r.y.push(scrollY); requestAnimationFrame(cuadro) }
  requestAnimationFrame(cuadro)
  window.__registroDelScroll = r
  return true
})()`

interface Registro {
  readonly t: number[]
  readonly y: number[]
}

async function rueda(p: Pagina, deltaY: number): Promise<void> {
  await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseWheel', x: Math.round(ANCHO * 0.7), y: Math.round(ALTO * 0.5), deltaX: 0, deltaY, pointerType: 'mouse' }, p.sessionId)
}

/** Corre un gesto con los tiempos del reloj de node (los mismos para las cuatro) y devuelve el instante de arranque. */
async function hacerElGesto(p: Pagina, g: (typeof GESTOS)[number]): Promise<number> {
  const t0 = await medir<number>(p, 'performance.now()')
  const inicio = Date.now()
  for (const [t, dy] of g.rueda) {
    const falta = inicio + t - Date.now()
    if (falta > 0) await esperar(falta)
    await rueda(p, dy)
  }
  return t0
}

/** Abre una de las cuatro: /v3 por el banco (con el pedido) o nk.studio con el mismo Chrome y la misma emulación. */
async function abrirLaVariante(v: (typeof VARIANTES)[number]): Promise<{ readonly p: Pagina; readonly cerrar: () => Promise<void> }> {
  if (v.pedido !== null) {
    const b = await abrir(v.pedido, ANCHO, ALTO)
    const lenis = await medir<string | null>(b.p, "document.documentElement.getAttribute('data-v3-scroll-suave')")
    if (lenis === null) throw new Error('Lenis no está corriendo en /v3')
    return b
  }
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/escena9-nk', ancho: ANCHO + 40, alto: ALTO + 140 })
  const p = await abrirPagina(chrome)
  await p.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] }, p.sessionId)
  await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: 1, mobile: false, screenWidth: ANCHO, screenHeight: ALTO }, p.sessionId)
  await irA(p, 'https://nk.studio/', { marcaDeIntro: false })
  await esperar(8000)
  await p.conexion.enviar('Page.bringToFront', {}, p.sessionId)
  return {
    p,
    cerrar: async () => {
      await cerrarPagina(p)
      await cerrarChrome(chrome)
    },
  }
}

/** Lo que dice una curva de un gesto: los tiempos al 63, 95 y 99 % del recorrido, la velocidad máxima y el pasarse. */
function resumir(t: readonly number[], y: readonly number[], t0: number): Record<string, number> {
  const y0 = y[0]
  const fin = y[y.length - 1]
  const total = fin - y0
  const alcanza = (f: number): number => {
    const k = t.findIndex((_, i) => Math.abs(y[i] - y0) >= Math.abs(total) * f)
    return k < 0 ? NaN : Math.round(t[k] - t0)
  }
  let vmax = 0
  for (let i = 3; i < t.length; i += 1) vmax = Math.max(vmax, Math.abs(y[i] - y[i - 3]) / Math.max(1e-6, (t[i] - t[i - 3]) / 1000))
  const pasa = total >= 0 ? Math.max(...y) - fin : fin - Math.min(...y)
  const quieto = t.findIndex((_, i) => y.slice(i).every((v) => Math.abs(v - fin) < 0.5))
  return { recorre: Math.round(total), t63: alcanza(0.63), t95: alcanza(0.95), t99: alcanza(0.99), quietoA: quieto < 0 ? NaN : Math.round(t[quieto] - t0), vmax: Math.round(vmax), pasa: Math.round(Math.max(0, pasa) * 10) / 10 }
}

async function curvas(): Promise<void> {
  const dir = carpeta('t4-fluidez/lenis')
  const salida: Record<string, { gestos: Record<string, { resumen: Record<string, number>; t: number[]; y: number[] }> }> = {}
  for (const v of VARIANTES) {
    const b = await abrirLaVariante(v)
    try {
      await medir(b.p, 'window.scrollTo(0, 0)')
      await esperar(1500)
      // Arranca más abajo del hero: en nk y en /v3 hay lugar para bajar y subir.
      for (let k = 0; k < 3; k += 1) await rueda(b.p, 100)
      await esperar(2500)
      salida[v.clave] = { gestos: {} }
      for (const g of GESTOS) {
        await medir(b.p, REGISTRO)
        await esperar(200)
        const t0 = await hacerElGesto(b.p, g)
        await esperar(g.quieto)
        const r = await medir<Registro>(b.p, '(() => { const r = window.__registroDelScroll; r.andando = false; return { t: r.t, y: r.y } })()')
        const k = r.t.findIndex((t) => t >= t0 - 50)
        const t = r.t.slice(k)
        const y = r.y.slice(k)
        salida[v.clave].gestos[g.nombre] = { resumen: resumir(t, y, t0), t: t.map((x) => Math.round((x - t0) * 10) / 10), y: y.map((x) => Math.round(x * 10) / 10) }
        console.log(v.clave, g.nombre, JSON.stringify(salida[v.clave].gestos[g.nombre].resumen))
      }
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${dir}/curvas-${String(ANCHO)}.json`, JSON.stringify({ gestos: GESTOS, salida }, null, 1))
  await dibujarLasCurvas(salida, `${dir}/curvas-${String(ANCHO)}.png`)
}

/** La hoja de las curvas: un cuadro por gesto, lo recorrido (de 0 a 1) contra el tiempo, las cuatro encima. */
async function dibujarLasCurvas(salida: Record<string, { gestos: Record<string, { t: number[]; y: number[] }> }>, destino: string): Promise<void> {
  const colores: Record<string, string> = { hoy: '#111111', nk: '#06b6d4', sedoso: '#f59e0b', 'nk.studio': '#e11d48' }
  const datos = JSON.stringify({ salida, colores, gestos: GESTOS.map((g) => g.nombre), rotulos: Object.fromEntries(VARIANTES.map((v) => [v.clave, v.rotulo])) })
  const html = `<html><head><meta charset="utf-8"></head><body style="margin:0;background:#fff;font:14px Arial"><canvas id="c" width="1600" height="900"></canvas><script>
const d = ${datos}
const c = document.getElementById('c').getContext('2d')
const [W, H] = [800, 430]
d.gestos.forEach((g, i) => {
  const x0 = (i % 2) * W + 60, y0 = Math.floor(i / 2) * (H + 20) + 40, w = W - 90, h = H - 70
  const tMax = 1600
  c.font = '14px Arial'; c.strokeStyle = '#ccc'; c.lineWidth = 1
  for (let k = 0; k <= 8; k++) { const x = x0 + (w * k) / 8; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + h); c.stroke(); c.fillStyle = '#666'; c.fillText(String((tMax * k) / 8) + ' ms', x - 14, y0 + h + 16) }
  for (let k = 0; k <= 4; k++) { const y = y0 + h - (h * k) / 4; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + w, y); c.stroke(); c.fillText(String(k * 25) + ' %', x0 - 40, y + 4) }
  c.fillStyle = '#000'; c.font = 'bold 16px Arial'; c.fillText(g + ' (lo recorrido del gesto)', x0, y0 - 12); c.font = '14px Arial'
  Object.entries(d.salida).forEach(([clave, v], j) => {
    const s = v.gestos[g]; if (!s) return
    const ya = s.y[0], yb = s.y[s.y.length - 1], tot = yb - ya || 1
    c.strokeStyle = d.colores[clave]; c.lineWidth = 2.2; c.beginPath()
    s.t.forEach((t, k) => { if (t > tMax) return; const x = x0 + (Math.max(0, t) / tMax) * w, y = y0 + h - ((s.y[k] - ya) / tot) * h; k ? c.lineTo(x, y) : c.moveTo(x, y) })
    c.stroke()
    if (i === 0) { c.fillStyle = d.colores[clave]; c.fillRect(x0 + w - 230, y0 + h - 110 + j * 22, 14, 14); c.fillStyle = '#000'; c.fillText(d.rotulos[clave], x0 + w - 210, y0 + h - 98 + j * 22) }
  })
})
</script></body></html>`
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/escena9-hoja', ancho: 1640, alto: 1040 })
  const p = await abrirPagina(chrome)
  try {
    await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false }, p.sessionId)
    await irA(p, `data:text/html;base64,${Buffer.from(html).toString('base64')}`, { marcaDeIntro: false })
    await esperar(800)
    const r = (await p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, p.sessionId)) as { data: string }
    writeFileSync(destino, Buffer.from(r.data, 'base64'))
  } finally {
    await cerrarPagina(p)
    await cerrarChrome(chrome)
  }
}

interface Cuadro {
  readonly archivo: string
  readonly t: number
}

/** El screencast con el instante de cada cuadro (el molde es `scripts-calidad/fluidez.ts`). */
async function grabarConTiempos(p: Pagina, dir: string, gesto: () => Promise<void>): Promise<Cuadro[]> {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const cuadros: Cuadro[] = []
  let grabando = true
  p.conexion.al('Page.screencastFrame', (params) => {
    if (!grabando) return
    const archivo = `c${String(cuadros.length).padStart(5, '0')}.jpg`
    writeFileSync(`${dir}/${archivo}`, Buffer.from(params.data as string, 'base64'))
    const meta = params.metadata as { readonly timestamp?: number } | undefined
    cuadros.push({ archivo, t: (meta?.timestamp ?? Date.now() / 1000) * 1000 })
    void p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId as number }, p.sessionId)
  })
  await p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: ANCHO, maxHeight: ALTO, everyNthFrame: 1 }, p.sessionId)
  await gesto()
  await p.conexion.enviar('Page.stopScreencast', {}, p.sessionId)
  grabando = false
  return cuadros
}

const FUENTE = "C\\:/Windows/Fonts/arial.ttf"

async function clips(): Promise<void> {
  const dir = carpeta('t4-fluidez/lenis/clips')
  const partes: string[] = []
  for (const v of VARIANTES) {
    const b = await abrirLaVariante(v)
    try {
      await medir(b.p, 'window.scrollTo(0, 0)')
      await esperar(2500)
      const base = `${dir}/${v.clave.replace(/[^a-z0-9]+/gi, '-')}`
      const cuadros = await grabarConTiempos(b.p, `${base}.cuadros`, async () => {
        await esperar(700)
        await hacerElGesto(b.p, GESTOS[2])
        await esperar(1600)
        await hacerElGesto(b.p, GESTOS[1])
        await esperar(1600)
        await hacerElGesto(b.p, GESTOS[3])
        await esperar(1800)
      })
      if (cuadros.length < 2) throw new Error('el screencast no entregó cuadros')
      const L = ['ffconcat version 1.0']
      for (let i = 0; i < cuadros.length; i += 1) {
        L.push(`file '${cuadros[i].archivo}'`)
        L.push(`duration ${Math.max(0.001, i + 1 < cuadros.length ? (cuadros[i + 1].t - cuadros[i].t) / 1000 : 0.3).toFixed(4)}`)
      }
      L.push(`file '${cuadros[cuadros.length - 1].archivo}'`)
      writeFileSync(`${base}.cuadros/lista.ffconcat`, L.join('\n'))
      const rotulo = v.rotulo.replace(/,/g, '\\,').replace(/[()]/g, '')
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'lista.ffconcat', '-vf', `fps=60,scale=720:-2,drawtext=fontfile='${FUENTE}':text='${rotulo}':x=10:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`, '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', `${base}.mp4`], { cwd: `${base}.cuadros` })
      rmSync(`${base}.cuadros`, { recursive: true, force: true })
      partes.push(`${base}.mp4`)
      console.log(v.clave, cuadros.length, 'cuadros')
    } finally {
      await b.cerrar()
    }
  }
  // La grilla 2 × 2, a 60 cuadros por segundo (a 30 se escondería justo lo que se compara).
  const entradas = partes.flatMap((p) => ['-i', p])
  const filtro = `${partes.map((_, i) => `[${String(i)}:v]tpad=stop_mode=clone:stop_duration=5[v${String(i)}]`).join(';')};[v0][v1]hstack[a];[v2][v3]hstack[b];[a][b]vstack,trim=duration=10[s]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...entradas, '-filter_complex', filtro, '-map', '[s]', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', `${carpeta('t4-fluidez/lenis')}/lenis-cuatro.mp4`])
  console.log('lenis-cuatro.mp4')
}

/** La hoja otra vez, desde lo medido. */
async function hoja(): Promise<void> {
  const dir = carpeta('t4-fluidez/lenis')
  const { salida } = JSON.parse(readFileSync(`${dir}/curvas-${String(ANCHO)}.json`, 'utf8')) as { salida: Record<string, { gestos: Record<string, { t: number[]; y: number[] }> }> }
  await dibujarLasCurvas(salida, `${dir}/curvas-${String(ANCHO)}.png`)
}

if (process.argv[1]?.endsWith('t4-lenis.ts')) (PARTE === 'clips' ? clips() : PARTE === 'hoja' ? hoja() : curvas()).then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
