/**
 * SPRINT CALIDAD 1 — Fase 0 · EL BANCO DEL MOTOR: motor.ts <parte> <ancho> <alto> <etiqueta> [pedido] [dpr]
 *
 * Mide el rendimiento de la escena en el recorrido completo del home, a velocidad constante (el grabador de
 * `motor/abrir.ts` maneja el scroll desde el primer `requestAnimationFrame` de cada cuadro). Una parte por corrida
 * (cada una en su propio Chrome, que se cierra al terminar):
 *
 *   · `gpu`     sin vsync: el tiempo de GPU de CADA cuadro (una consulta de tiempo por cuadro: la escena y las
 *               simulaciones) y los cuadros por segundo, por tramo. Es el costo de dibujar.
 *   · `ritmo`   CON vsync (75 Hz en la máquina de medición): el intervalo real entre cuadros y cuántos pierden el
 *               refresco, por tramo. Es lo que se ve: los tirones.
 *   · `cpu`     sin vsync: el perfil de CPU del hilo principal durante el recorrido (por archivo y por función, el
 *               recolector y sus pausas), los commits de React y los cuadros largos (Long Animation Frames).
 *   · `pasadas` sin vsync: el tiempo de GPU por pasada (por objeto con nombre) en los momentos: hero, Quiénes somos,
 *               el túnel, los demos de noche, los rayos del amanecer (congelados en su pico), Por qué develOP y el pie.
 *   · `memoria` sin vsync: lo que se reserva por cuadro con la escena quieta (muestreo de memoria de V8), en el hero y
 *               en la noche, y el recolector en reposo.
 *
 * ⚠️ Sin vsync los intervalos entre `requestAnimationFrame` salen en ráfagas (Chrome encola cuadros y después frena):
 * sus percentiles no dicen nada. Por eso el costo por cuadro sale de la GPU cuadro a cuadro, el promedio de cuadros por
 * segundo sale de contar cuadros en el tiempo, y los tirones salen del ritmo con vsync.
 *
 * Va a `calidad1/motor/<etiqueta>/<ancho>/<parte>.json`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { DIRC } from './banco'
import { abrirMotor, type BancoDelMotor } from './motor/abrir'
import { agruparMemoria, agruparPerfil, porSegundo, resumen, ritmo, tramoEn, tramosDe, type Documento, type NodoDeMemoria, type PerfilDeCpu, type Tramo } from './motor/analisis'

const [PARTE, ANCHO, ALTO, ETIQUETA, PEDIDO, DPR] = [process.argv[2] ?? 'gpu', Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900), process.argv[5] ?? 'base', process.argv[6] ?? 'producto', Number(process.argv[7] ?? 1)]

/** La velocidad del recorrido (px/s): el documento entero en ~30 s a 1440 y ~25 s a 375. */
const VELOCIDAD = 900

const carpeta = (): string => {
  const d = `${DIRC}/motor/${ETIQUETA}/${String(ANCHO)}${DPR === 1 ? '' : `@${String(DPR)}x`}`
  mkdirSync(d, { recursive: true })
  return d
}

async function documento(b: BancoDelMotor): Promise<Documento> {
  return medir<Documento>(
    b.p,
    `(() => {
      const topes = {}, altos = {}
      for (const p of document.querySelectorAll('[data-panel]')) { const r = p.getBoundingClientRect(); topes[p.getAttribute('data-panel')] = Math.round(r.top + scrollY); altos[p.getAttribute('data-panel')] = Math.round(r.height) }
      const tu = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect()
      return { topes, altos, pieDeTuPanel: Math.round(tu.bottom + scrollY), vh: innerHeight, fin: document.documentElement.scrollHeight - innerHeight }
    })()`,
  )
}

/** Recorre el documento entero a velocidad constante mientras graba los cuadros; devuelve [instante, scroll] por cuadro. */
async function recorrer(b: BancoDelMotor, d: Documento): Promise<{ t: number[]; y: number[] }> {
  await medir(b.p, 'window.scrollTo(0, 0)')
  await esperar(2500)
  await medir(b.p, 'window.__cuadrosDelBanco.empezar()')
  await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(d.fin)}, ${String(VELOCIDAD)})`)
  await esperar(1500)
  return medir<{ t: number[]; y: number[] }>(b.p, 'window.__cuadrosDelBanco.parar()')
}

function escribir(nombre: string, datos: unknown): void {
  const archivo = `${carpeta()}/${nombre}.json`
  writeFileSync(archivo, JSON.stringify(datos, null, 1))
  console.log(archivo)
}

/** Por tramo, el resumen de una serie (ms por cuadro) asignada por scroll. */
function porTramo(serie: readonly (readonly [number, number])[], tramos: readonly Tramo[]): Record<string, ReturnType<typeof resumen>> {
  const acc: Record<string, number[]> = {}
  for (const [y, ms] of serie) (acc[tramoEn(tramos, y)] ??= []).push(ms)
  const salida: Record<string, ReturnType<typeof resumen>> = {}
  for (const t of tramos) if (acc[t.nombre] !== undefined) salida[t.nombre] = resumen(acc[t.nombre])
  return salida
}

async function parteGpu(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO, { pedido: PEDIDO, dpr: DPR })
  try {
    const d = await documento(b)
    const tramos = tramosDe(d)
    await medir(b.p, 'window.__gpuDelBanco.grabar()')
    const r = await recorrer(b, d)
    const gpu = await medir<[number, number][]>(b.p, 'window.__gpuDelBanco.parar()')
    // A cada cuadro de GPU, el scroll del cuadro grabado más cercano en el tiempo (anterior o igual).
    let j = 0
    const serie: [number, number][] = []
    for (const [t, ms] of gpu) {
      while (j + 1 < r.t.length && r.t[j + 1] <= t) j += 1
      if (t >= r.t[0] && t <= r.t[r.t.length - 1]) serie.push([r.y[j], ms])
    }
    const fps = porSegundo(r.t, r.y, tramos)
    const total = resumen(serie.map(([, ms]) => ms))
    escribir('gpu', { ancho: ANCHO, alto: ALTO, dpr: DPR, pedido: PEDIDO, velocidad: VELOCIDAD, documento: d, tramos, total, porTramo: porTramo(serie, tramos), fps, cuadros: r.t.length, segundos: (r.t[r.t.length - 1] - r.t[0]) / 1000 })
    console.log(JSON.stringify({ total, cuadrosPorSegundo: Math.round((r.t.length * 1000) / (r.t[r.t.length - 1] - r.t[0])) }))
  } finally {
    await b.cerrar()
  }
}

async function parteRitmo(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO, { pedido: PEDIDO, dpr: DPR, conVsync: true })
  try {
    const d = await documento(b)
    const tramos = tramosDe(d)
    const r = await recorrer(b, d)
    const dt = r.t.slice(1).map((v, i) => v - r.t[i])
    const refresco = [...dt].sort((a, c) => a - c)[Math.floor(dt.length / 2)]
    escribir('ritmo', { ancho: ANCHO, alto: ALTO, dpr: DPR, pedido: PEDIDO, refresco, total: { ...resumen(dt), perdidos: dt.filter((x) => x > refresco * 1.5).length }, porTramo: ritmo(r.t, r.y, tramos, refresco), tramos })
    console.log(JSON.stringify({ refresco, total: resumen(dt), perdidos: dt.filter((x) => x > refresco * 1.5).length }))
  } finally {
    await b.cerrar()
  }
}

async function parteCpu(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO, { pedido: PEDIDO, dpr: DPR })
  const s = b.p.sessionId
  try {
    const d = await documento(b)
    await medir(b.p, `(() => { window.__loafs = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loafs.push({ t: Math.round(e.startTime), ms: Math.round(e.duration), bloquea: Math.round(e.blockingDuration), y: Math.round(scrollY), scripts: e.scripts.map((x) => ({ ms: Math.round(x.duration), invoca: x.invoker, tipo: x.invokerType, fuente: (x.sourceURL || '').replace(/^.*\\/src\\//, '').slice(0, 90), funcion: x.sourceFunctionName })) }) }).observe({ type: 'long-animation-frame' }); return 0 })()`)
    await b.p.conexion.enviar('Profiler.enable', {}, s)
    await b.p.conexion.enviar('Profiler.setSamplingInterval', { interval: 200 }, s)
    await medir(b.p, 'window.__commitsDelBanco.activo = true')
    await b.p.conexion.enviar('Profiler.start', {}, s)
    const r = await recorrer(b, d)
    const { profile } = (await b.p.conexion.enviar('Profiler.stop', {}, s)) as { profile: PerfilDeCpu }
    const commits = await medir<unknown>(b.p, '(() => { const c = window.__commitsDelBanco; c.activo = false; return { commits: c.commits, porRaiz: c.porRaiz, porComponente: Object.entries(c.porComponente).sort((a, b) => b[1] - a[1]).slice(0, 40) } })()')
    const loafs = await medir<unknown[]>(b.p, 'window.__loafs')
    const segundos = (r.t[r.t.length - 1] - r.t[0]) / 1000
    const perfil = agruparPerfil(profile)
    escribir('cpu', { ancho: ANCHO, alto: ALTO, dpr: DPR, pedido: PEDIDO, segundos, cuadros: r.t.length, perfil, commits, cuadrosLargos: loafs, tramos: tramosDe(d) })
    console.log(JSON.stringify({ segundos, recolector: perfil.especiales['(garbage collector)'], pausas: perfil.pausasDelRecolector, commits, cuadrosLargos: loafs.length, top: perfil.porArchivo.slice(0, 8) }))
  } finally {
    await b.cerrar()
  }
}

/** Los momentos de las pasadas: dónde pararse (px) y, si hace falta, qué congelar. */
async function momentos(b: BancoDelMotor, d: Documento): Promise<{ nombre: string; y: number; antes?: string }[]> {
  const alto = d.altos.trabajos
  return [
    { nombre: 'hero', y: 0 },
    { nombre: 'quiénes somos', y: d.topes['quienes-somos'] + Math.round(0.15 * d.vh) },
    { nombre: 'túnel', y: d.topes.trabajos + Math.round(0.3 * alto) },
    { nombre: 'demos de noche', y: d.topes.trabajos + Math.round(0.85 * alto) },
    // Los rayos del amanecer en su pico (4,9 s del guion), con el borde de Tu panel arriba del cuadro (la sala entera).
    { nombre: 'rayos del amanecer', y: d.pieDeTuPanel - Math.round(0.12 * d.vh), antes: 'window.__amanecerDelBanco.congelar(4.9)' },
    { nombre: 'por qué develOP', y: d.topes['por-que-develop'] + Math.round(0.7 * d.vh) },
    { nombre: 'pie', y: await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight') },
  ]
}

async function partePasadas(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO, { pedido: PEDIDO, dpr: DPR })
  try {
    const d = await documento(b)
    const salida: Record<string, unknown> = {}
    for (const m of await momentos(b, d)) {
      // Se llega recorriendo (a velocidad constante) para que la noche y el amanecer estén como en el sitio.
      const y0 = await medir<number>(b.p, 'scrollY')
      await medir(b.p, `window.__cuadrosDelBanco.recorrer(${String(y0)}, ${String(m.y)}, ${String(VELOCIDAD * 2)})`)
      if (m.antes !== undefined) await medir(b.p, m.antes)
      await esperar(2500)
      const perfil = await medir<{ totalMs: number; pasadas: Record<string, { ms: number; veces: number }>; disjunto: boolean }>(b.p, 'window.__gpuDelBanco.medir(150)')
      const cuadro = await medir<{ totalMs: number }>(b.p, "window.__gpuDelBanco.medir(150, 'cuadro')")
      const contar = await medir<{ renders: number; cuadros: number }>(b.p, 'window.__gpuDelBanco.contar(2000)')
      if (m.antes !== undefined) await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
      const pasadas = Object.entries(perfil.pasadas).sort((a, c) => c[1].ms - a[1].ms).map(([k, v]) => [k, Math.round(v.ms * 1000) / 1000, v.veces] as const)
      salida[m.nombre] = { y: m.y, totalObjetosMs: Math.round(perfil.totalMs * 100) / 100, totalCuadroMs: Math.round(cuadro.totalMs * 100) / 100, disjunto: perfil.disjunto, rendersPorSegundo: contar.renders / 2, pasadas }
      console.log(JSON.stringify({ momento: m.nombre, totalCuadroMs: Math.round(cuadro.totalMs * 100) / 100, rendersPorSegundo: contar.renders / 2, top: pasadas.slice(0, 5) }))
    }
    escribir('pasadas', { ancho: ANCHO, alto: ALTO, dpr: DPR, pedido: PEDIDO, momentos: salida })
  } finally {
    await b.cerrar()
  }
}

async function parteMemoria(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO, { pedido: PEDIDO, dpr: DPR })
  const s = b.p.sessionId
  try {
    const d = await documento(b)
    const salida: Record<string, unknown> = {}
    for (const [nombre, y] of [['hero', 0], ['demos de noche', d.topes.trabajos + Math.round(0.85 * d.altos.trabajos)]] as const) {
      const y0 = await medir<number>(b.p, 'scrollY')
      await medir(b.p, `window.__cuadrosDelBanco.recorrer(${String(y0)}, ${String(y)}, ${String(VELOCIDAD * 2)})`)
      await esperar(2500)
      await b.p.conexion.enviar('HeapProfiler.enable', {}, s)
      await b.p.conexion.enviar('Profiler.enable', {}, s)
      await b.p.conexion.enviar('Profiler.setSamplingInterval', { interval: 200 }, s)
      await medir(b.p, 'window.__cuadrosDelBanco.empezar()')
      await b.p.conexion.enviar('HeapProfiler.startSampling', { samplingInterval: 4096 }, s)
      await b.p.conexion.enviar('Profiler.start', {}, s)
      await esperar(6000)
      const { profile } = (await b.p.conexion.enviar('Profiler.stop', {}, s)) as { profile: PerfilDeCpu }
      const { profile: memoria } = (await b.p.conexion.enviar('HeapProfiler.stopSampling', {}, s)) as { profile: { head: NodoDeMemoria } }
      const r = await medir<{ t: number[] }>(b.p, 'window.__cuadrosDelBanco.parar()')
      const cuadros = r.t.length
      const porFuncion = agruparMemoria(memoria.head)
      const total = porFuncion.reduce((a, [, v]) => a + v, 0)
      const perfil = agruparPerfil(profile)
      salida[nombre] = { cuadros, segundos: 6, bytesPorCuadro: Math.round(total / Math.max(1, cuadros)), kbPorSegundo: Math.round(total / 6 / 1024), recolectorMs: perfil.especiales['(garbage collector)'] ?? 0, pausas: perfil.pausasDelRecolector, porFuncion: porFuncion.slice(0, 40).map(([k, v]) => [k, Math.round(v / Math.max(1, cuadros))]) }
      console.log(JSON.stringify({ momento: nombre, cuadros, bytesPorCuadro: Math.round(total / Math.max(1, cuadros)), recolectorMs: perfil.especiales['(garbage collector)'] ?? 0, top: porFuncion.slice(0, 6).map(([k, v]) => [k, Math.round(v / Math.max(1, cuadros))]) }))
    }
    escribir('memoria', { ancho: ANCHO, alto: ALTO, dpr: DPR, pedido: PEDIDO, momentos: salida })
  } finally {
    await b.cerrar()
  }
}

const PARTES: Record<string, () => Promise<void>> = { gpu: parteGpu, ritmo: parteRitmo, cpu: parteCpu, pasadas: partePasadas, memoria: parteMemoria }

if (process.argv[1]?.endsWith('motor.ts')) {
  const parte = PARTES[PARTE]
  if (parte === undefined) throw new Error(`no sé qué parte es «${PARTE}»`)
  parte().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
}
