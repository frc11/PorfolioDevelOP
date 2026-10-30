/**
 * [L8b · 4] LA PAUSA DEL PRIMER PASO DE SERVICIOS, TRAZADA — Chrome del sistema a la vista contra `BASE` (el build), `/api/` bloqueado. Por
 * ancho y `CORRIDAS` veces: carga `/v3#servicios`, espera `ESPERA_MS`, se para en la entrada (paso 0), traza (CDP `Tracing`, con el
 * perfilador de JS) UNA muesca de la rueda hacia Desarrollo web y lista los cuadros lentos (> 100 ms, rAF) y, adentro del peor, lo que corrió
 * en el hilo principal: las tareas por nombre y las funciones de JS por tiempo propio (muestras del perfilador).
 *
 *   BASE=http://localhost:3002 ANCHOS=1440,1024 CORRIDAS=5 npx tsx scripts-carga/l8b-pausa.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024').split(',').map(Number)
const CORRIDAS = Number(process.env.CORRIDAS ?? 5)
const ESPERA_MS = Number(process.env.ESPERA_MS ?? 7000)
const TRAZA = process.env.TRAZA !== '0'
/** Las diferencias con `l3-servicios MODO=doble`, para aislar la pausa: el centroide por cuadro (`readPixels`), el ratón en la esquina y el segundo gesto. */
const CENTROIDE = process.env.CENTROIDE === '1'
const ESQUINA = process.env.ESQUINA === '1'
const DOBLE = process.env.DOBLE === '1'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('l8b-pausa')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

type Banco = Window & { __gatillosDelBanco?: { regla: () => { pasoPx: number; inicio: number } }; __cuadrosDelBanco?: number[] }

interface EventoDeTraza {
  readonly name: string
  readonly ph: string
  readonly ts: number
  readonly dur?: number
  readonly tid: number
  readonly pid: number
  readonly args?: { readonly data?: { readonly url?: string; readonly functionName?: string; readonly cpuProfile?: { readonly nodes?: readonly NodoDelPerfil[]; readonly samples?: readonly number[] }; readonly timeDeltas?: readonly number[] }; readonly name?: string }
}
interface NodoDelPerfil {
  readonly id: number
  readonly parent?: number
  readonly callFrame: { readonly functionName: string; readonly url?: string; readonly lineNumber: number }
}

async function trazar(cdp: CDPSession, accion: () => Promise<void>): Promise<EventoDeTraza[]> {
  const eventos: EventoDeTraza[] = []
  cdp.on('Tracing.dataCollected', (d) => eventos.push(...(d.value as unknown as EventoDeTraza[])))
  const fin = new Promise<void>((r) => cdp.once('Tracing.tracingComplete', () => r()))
  await cdp.send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing', 'v8.execute', 'disabled-by-default-v8.cpu_profiler', 'gpu', 'loading'] } })
  await accion()
  await cdp.send('Tracing.end')
  await fin
  return eventos
}

function analizar(eventos: readonly EventoDeTraza[]): string[] {
  const lineas: string[] = []
  const marca = eventos.find((e) => e.name === 'l8b-lento')
  const hilo = eventos.find((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain' && eventos.some((x) => x.pid === e.pid && x.name === 'l8b-lento'))
  if (marca === undefined || hilo === undefined) return ['(sin cuadro lento marcado)']
  // La marca va al final del cuadro lento; su largo lo dice el nombre de la medida.
  const medida = eventos.find((e) => e.name === 'l8b-cuadro' && e.ph === 'b') ?? null
  const desde = medida?.ts ?? marca.ts - 600_000
  const hasta = marca.ts
  const delHilo = eventos.filter((e) => e.pid === hilo.pid && e.tid === hilo.tid && e.ph === 'X' && e.ts + (e.dur ?? 0) >= desde && e.ts <= hasta)
  const porNombre = new Map<string, number>()
  for (const e of delHilo) porNombre.set(e.name, (porNombre.get(e.name) ?? 0) + (e.dur ?? 0) / 1000)
  lineas.push(`ventana ${((hasta - desde) / 1000).toFixed(0)} ms · eventos del hilo por nombre (ms, incluyen anidados):`)
  for (const [n, ms] of [...porNombre].sort((a, b) => b[1] - a[1]).slice(0, 14)) lineas.push(`  ${ms.toFixed(1).padStart(7)}  ${n}`)
  const largas = delHilo.filter((e) => (e.dur ?? 0) > 30_000 && (e.name === 'FunctionCall' || e.name === 'EvaluateScript' || e.name === 'TimerFire' || e.name === 'FireAnimationFrame' || e.name === 'EventDispatch' || e.name === 'v8.compile' || e.name === 'GPUTask'))
  for (const e of largas.slice(0, 8)) lineas.push(`  larga ${((e.dur ?? 0) / 1000).toFixed(0)} ms ${e.name} ${e.args?.data?.functionName ?? ''} ${e.args?.data?.url ?? ''}`)
  // El perfilador: los nodos y las muestras, por tiempo propio y por pila.
  const nodos = new Map<number, NodoDelPerfil>()
  const propio = new Map<string, number>()
  const conPila = new Map<string, number>()
  let t = 0
  for (const e of eventos.filter((x) => x.pid === hilo.pid && (x.name === 'Profile' || x.name === 'ProfileChunk'))) {
    const d = e.args?.data
    if (e.name === 'Profile') t = (d as { startTime?: number } | undefined)?.startTime ?? t
    for (const n of d?.cpuProfile?.nodes ?? []) nodos.set(n.id, n)
    const muestras = d?.cpuProfile?.samples ?? []
    const deltas = d?.timeDeltas ?? []
    muestras.forEach((id, i) => {
      t += deltas[i] ?? 0
      if (t < desde || t > hasta) return
      const n = nodos.get(id)
      if (n === undefined) return
      const nombre = (x: NodoDelPerfil): string => `${x.callFrame.functionName || '(anónima)'} ${(x.callFrame.url ?? "").split('/').pop() ?? ''}:${String(x.callFrame.lineNumber)}`
      propio.set(nombre(n), (propio.get(nombre(n)) ?? 0) + 1)
      const pila: string[] = []
      for (let x: NodoDelPerfil | undefined = n; x !== undefined && pila.length < 6; x = x.parent === undefined ? undefined : nodos.get(x.parent)) pila.push(x.callFrame.functionName || '·')
      const k = pila.join(' < ')
      conPila.set(k, (conPila.get(k) ?? 0) + 1)
    })
  }
  lineas.push('muestras por tiempo propio:')
  for (const [n, c] of [...propio].sort((a, b) => b[1] - a[1]).slice(0, 12)) lineas.push(`  ${String(c).padStart(5)}  ${n}`)
  lineas.push('pilas más vistas:')
  for (const [n, c] of [...conPila].sort((a, b) => b[1] - a[1]).slice(0, 8)) lineas.push(`  ${String(c).padStart(5)}  ${n}`)
  return lineas
}

const GRABAR = `(() => {
  const w = window
  const log = (w.__cuadrosDelBanco = [])
  let antes = performance.now()
  performance.mark('l8b-inicio')
  const cuadro = (t) => {
    const dt = t - antes
    if (dt > ${String(Number(process.env.UMBRAL_MARCA ?? 300))} && !w.__marcado) { w.__marcado = true; performance.measure('l8b-cuadro', { start: antes, end: t }); performance.mark('l8b-lento') }
    antes = t
    if (w.__conCentroide && w.__escenarioDeServicios) w.__escenarioDeServicios.centroide()
    log.push(dt)
    if (log.length < 400) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const resumen: string[] = []
  for (const ancho of ANCHOS) {
    const alto = ancho >= 1440 ? 900 : 768
    for (let corrida = 1; corrida <= CORRIDAS; corrida++) {
      const ctx = await chromium.launchPersistentContext(perfilDelBanco(`l8b-pausa-${String(ancho)}-${String(corrida)}`), {
        executablePath: CHROME,
        headless: false,
        viewport: { width: ancho, height: alto },
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
        args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
      })
      try {
        await ctx.addInitScript(`(() => { window.__name = (f) => f; window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
        const p: Page = ctx.pages()[0] ?? (await ctx.newPage())
        await p.route('**/api/**', (r) => r.abort())
        await p.goto(`${BASE}/v3#servicios`, { waitUntil: 'load', timeout: 300000 })
        await p.mouse.move(ESQUINA ? 8 : ancho / 2, ESQUINA ? 8 : alto / 2)
        await dormir(ESPERA_MS)
        await p.evaluate(() => {
          const g = (window as Banco).__gatillosDelBanco
          if (!g) throw new Error('sin __gatillosDelBanco')
          const r = g.regla()
          window.scrollTo({ top: r.inicio + 0.5 * r.pasoPx, behavior: 'instant' })
        })
        await dormir(3000)
        const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
        const cdp = await ctx.newCDPSession(p)
        const FUENTES = (): string => [...document.fonts].filter((f) => f.status !== 'loaded').map((f) => `${f.family} ${f.style} ${f.weight} ${f.status}`).join(' | ')
        const fuentesAntes = await p.evaluate(FUENTES)
        await p.evaluate(() => { const w = window as Window & { __cargas?: number[] }; w.__cargas = []; document.fonts.addEventListener('loadingdone', () => w.__cargas?.push(performance.now())) })
        const accion = async (): Promise<void> => {
          // El arranque del perfilador traba el hilo (~800 ms de interrupción de V8): se graba después.
          if (TRAZA) await dormir(2000)
          await p.evaluate((c) => { (window as Window & { __conCentroide?: boolean }).__conCentroide = c }, CENTROIDE)
          await p.evaluate(GRABAR)
          await dormir(300)
          await p.mouse.wheel(0, 100)
          if (DOBLE) {
            await dormir(600)
            await p.mouse.wheel(0, 100)
          }
          await dormir(2600)
        }
        const eventos = TRAZA ? await trazar(cdp, accion) : (await accion(), [])
        const cuadros = await p.evaluate(() => (window as Banco).__cuadrosDelBanco ?? [])
        if (process.env.DEBAJO === '1') console.log(`  debajo del ratón: ${await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const a = e?.closest('a'); return `${e?.tagName ?? '-'}.${e?.getAttribute('data-pieza') ?? e?.getAttribute('data-parte') ?? ''} enlace=${a?.getAttribute('href') ?? '-'}` }, [ESQUINA ? 8 : ancho / 2, ESQUINA ? 8 : alto / 2])}`)
        if (process.env.FUENTES === '1') console.log(`  fuentes antes: ${fuentesAntes}
  fuentes después: ${await p.evaluate(FUENTES)}`)
        const lentos = cuadros.filter((d) => d > 100)
        const linea = `${String(ancho)} #${String(corrida)}${visible ? '' : ' ⚠ no visible'}: ${String(cuadros.length)} cuadros, ${String(lentos.length)} > 100 ms${lentos.length > 0 ? ` (${lentos.map((d) => d.toFixed(0)).join(', ')} ms)` : ''}, el peor ${Math.max(0, ...cuadros).toFixed(0)} ms`
        console.log(linea)
        resumen.push(linea)
        if (TRAZA && lentos.length > 0) {
          const detalle = analizar(eventos)
          for (const l of detalle) console.log(`    ${l}`)
          resumen.push(...detalle.map((l) => `    ${l}`))
        }
      } finally {
        await ctx.close()
      }
    }
  }
  writeFileSync(path.join(SALIDA, 'resumen.txt'), resumen.join('\n'))
}

void main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
