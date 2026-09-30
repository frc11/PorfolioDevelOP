/**
 * SPRINT ESCENA 9 — T4 · por qué Servicios pierde cuadros con cualquier placa: t4-servicios.ts [ancho alto]
 *
 * Con la NVIDIA y dpr 1,5 no se pierde un solo cuadro en todo el recorrido salvo en Servicios (78 de 522), y con la AMD
 * y dpr 1 se perdían los mismos 79 (CALIDAD 1): no es la GPU de la escena (ahí está suspendida). Con vsync, se recorre
 * Servicios a la velocidad del banco del motor y, para comparar, Tu panel (otra sección opaca, que no pierde nada),
 * con la traza de Chrome prendida: por evento y por hilo, cuánto tiempo va a cada cosa por cuadro, y los cuadros
 * perdidos de cada tramo. Va a `escena9/t4-fluidez/servicios/`.
 *
 * Con `sospechosos` (tercer argumento), sólo Servicios, una vez por sospechoso apagado desde el banco con una hoja de
 * estilo inyectada (nada del sitio cambia): cuál de las piezas que se animan es la que pinta en cada cuadro.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirMotor } from '../scripts-calidad/motor/abrir'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const PLACA = process.env.BANCO_GPU === 'alta' ? 'nvidia' : 'amd'
const VELOCIDAD = 900
const MODO = process.argv[4] ?? 'tramos'

/** Cada sospechoso: la hoja que lo apaga (sin pintar ni animar). */
export const SOSPECHOSOS: Readonly<Record<string, string>> = {
  ninguno: '',
  palabras: '[data-pieza="palabra"] { background-image: none !important; }',
  torta: '[data-pieza="torta"], [data-pieza="giro-de-la-torta"] { visibility: hidden !important; }',
  video: '[data-pieza="video-de-servicio"] { visibility: hidden !important; }',
  'cta que rota': '[data-pieza="cta-que-rota"] { visibility: hidden !important; }',
  todos: '',
}

interface Evento {
  readonly name: string
  readonly ph: string
  readonly ts: number
  readonly dur?: number
  readonly pid: number
  readonly tid: number
  readonly args?: { readonly name?: string }
}

/** Los nombres de los hilos (de los metadatos de la traza). */
function hilos(eventos: readonly Evento[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const e of eventos) if (e.ph === 'M' && e.name === 'thread_name' && e.args?.name !== undefined) m.set(`${String(e.pid)}:${String(e.tid)}`, e.args.name)
  return m
}

async function tramo(b: Awaited<ReturnType<typeof abrirMotor>>, desde: number, hasta: number): Promise<Record<string, unknown>> {
  const s = b.p.sessionId
  await medir(b.p, `window.scrollTo(0, ${String(desde)})`)
  await esperar(2500)
  const eventos: Evento[] = []
  let grabando = true
  b.p.conexion.al('Tracing.dataCollected', (p) => {
    if (grabando) eventos.push(...((p as { value: Evento[] }).value))
  })
  const terminada = new Promise<void>((r) => {
    b.p.conexion.al('Tracing.tracingComplete', () => r())
  })
  await b.p.conexion.enviar('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,blink,cc,gpu,viz,media', transferMode: 'ReportEvents' }, s)
  await medir(b.p, 'window.__cuadrosDelBanco.empezar()')
  await medir(b.p, `window.__cuadrosDelBanco.recorrer(${String(desde)}, ${String(hasta)}, ${String(VELOCIDAD)})`)
  const r = await medir<{ t: number[]; y: number[] }>(b.p, 'window.__cuadrosDelBanco.parar()')
  await b.p.conexion.enviar('Tracing.end', {}, s)
  await terminada
  grabando = false
  const intervalos = r.t.slice(1).map((t, i) => t - r.t[i])
  const refresco = [...intervalos].sort((a, c) => a - c)[Math.floor(intervalos.length / 2)] ?? 13.3
  const perdidos = intervalos.filter((ms) => ms > refresco * 1.5).length
  const segundos = (r.t[r.t.length - 1] - r.t[0]) / 1000
  const nombres = hilos(eventos)
  const porEvento = new Map<string, number>()
  for (const e of eventos) {
    if (e.ph !== 'X' || e.dur === undefined) continue
    const hilo = nombres.get(`${String(e.pid)}:${String(e.tid)}`) ?? 'otro'
    const k = `${hilo} · ${e.name}`
    porEvento.set(k, (porEvento.get(k) ?? 0) + e.dur / 1000)
  }
  // Por cuadro dibujado: el total de cada evento dividido la cantidad de cuadros (los contenedores anidan: es una guía).
  const cuadros = Math.max(1, r.t.length)
  const lista = [...porEvento.entries()].filter(([k]) => !/RunTask|ThreadController|ProcessTask|MessageLoop|TaskQueue/.test(k)).sort((a, c) => c[1] - a[1]).slice(0, 40).map(([k, ms]) => [k, Math.round((ms / cuadros) * 100) / 100])
  return { desde, hasta, segundos: Math.round(segundos * 10) / 10, cuadros, perdidos, refresco: Math.round(refresco * 10) / 10, msPorCuadro: lista }
}

async function principal(): Promise<void> {
  const dir = carpeta('t4-fluidez/servicios')
  const b = await abrirMotor(ANCHO, ALTO, { conVsync: true })
  try {
    const d = await medir<{ topes: Record<string, number>; altos: Record<string, number>; vh: number }>(
      b.p,
      `(() => { const topes = {}, altos = {}; for (const p of document.querySelectorAll('[data-panel]')) { const r = p.getBoundingClientRect(); topes[p.getAttribute('data-panel')] = Math.round(r.top + scrollY); altos[p.getAttribute('data-panel')] = Math.round(r.height) } return { topes, altos, vh: innerHeight } })()`,
    )
    const salida: Record<string, unknown> = {}
    if (MODO === 'sospechosos') {
      const todos = Object.values(SOSPECHOSOS).filter((h) => h !== '').join(' ')
      for (const [nombre, hoja] of Object.entries(SOSPECHOSOS)) {
        const css = nombre === 'todos' ? todos : hoja
        await medir(b.p, `(() => { let s = document.getElementById('sospechoso'); if (!s) { s = document.createElement('style'); s.id = 'sospechoso'; document.head.appendChild(s) } s.textContent = ${JSON.stringify(css)}; document.querySelectorAll('[data-pieza="video-de-servicio"] video, video[data-pieza="video-de-servicio"]').forEach((v) => { if (${JSON.stringify(nombre === 'video' || nombre === 'todos')}) v.pause() }); return true })()`)
        const desde = d.topes.servicios
        const x = await tramo(b, desde, desde + d.altos.servicios - d.vh)
        salida[nombre] = x
        const y = x as { perdidos: number; cuadros: number; msPorCuadro: [string, number][] }
        const de = (k: RegExp): number => Math.round(y.msPorCuadro.filter(([n]) => k.test(n)).reduce((a, [, ms]) => a + ms, 0) * 100) / 100
        console.log(nombre, y.perdidos, 'de', y.cuadros, 'paint', de(/CrRendererMain . Paint$/), 'raster', de(/RendererRasterWorker$/))
      }
      writeFileSync(`${dir}/sospechosos-${PLACA}-${String(ANCHO)}.json`, JSON.stringify(salida, null, 1))
      return
    }
    for (const nombre of ['servicios', 'tu-panel']) {
      const desde = d.topes[nombre]
      const hasta = desde + d.altos[nombre] - d.vh
      salida[nombre] = await tramo(b, desde, hasta)
      const x = salida[nombre] as { perdidos: number; cuadros: number; msPorCuadro: [string, number][] }
      console.log(nombre, x.perdidos, 'de', x.cuadros, JSON.stringify(x.msPorCuadro.slice(0, 12)))
    }
    writeFileSync(`${dir}/traza-${PLACA}-${String(ANCHO)}.json`, JSON.stringify(salida, null, 1))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('t4-servicios.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
