/**
 * [B12a.8] EL VELO SIN PANTALLA EN BLANCO (4), CONTRASTADO (5) Y EN EL COMPOSITOR (6, P-H32), Y LA PÍLDORA QUE SE DESLIZA (T2) — el Chrome
 * del sistema a la vista contra el dev o el build (`BASE`), `/api/` bloqueado, una sola carga de documento por ancho. Los recorridos:
 *
 *   1440: la página → el home («Home» de la píldora) · el home → la página (en esta rama el home no tiene un enlace a una página: el velo
 *         cubre como lo pide un enlace, `__veloDelBanco.cubrir`, y navega el router de next, que es lo que hace el `<Link>`, con la ruta
 *         precargada) · la página, desde su papel → «Portfolio» de la píldora;
 *   390:  la página → el menú → «Portfolio».
 *
 * Por recorrido, con un rAF en la página (sobrevive a la navegación cliente) y el screencast del navegador:
 *   · el total, del clic a la página destapada (objetivo en el build: ≤ 1,2 s típico; 3,5 s sólo de techo);
 *   · el primer tramo al cubrir (los primeros 200 ms): el cuadro más largo (P-H32: ≤ 20 ms en el build a 1440), en el hilo principal (rAF) y
 *     en el COMPOSITOR (una traza del navegador: los `DrawFrame` del proceso de la página, que es donde corre la banda);
 *   · el cuadro del cambio de ruta cubierto entero, y cuánto queda tapado entero;
 *   · el color del velo contra lo que tapa (sobre papel la tinta, sobre la escena de noche el papel, sobre la sala de día la tinta);
 *   · los cuadros en blanco o vacíos del screencast: un cuadro (casi) de un solo color que NO es el velo cubriendo (objetivo: 0);
 *   · la píldora: de dónde a dónde va y el salto más grande entre dos cuadros (se desliza, no salta).
 *
 *   BASE=http://localhost:3004 ANCHOS=1440,390 npx tsx scripts-carga/velo.ts
 *   CONTROL=sin-velo …   el control (navega sin cubrir): el cuadro del cambio sin cubrir
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'
import sharp from 'sharp'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440,390').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
const VIEJO = process.env.VIEJO === '1'
/** El build viejo (B12a.7) no tiene la página base ni «Home» en la píldora: su ruta de prueba y su enlace. */
const PAGINA = VIEJO ? '/v3/prueba-de-pagina' : '/v3/pagina-base'
const AL_HOME = VIEJO ? 'a[href="/v3"]' : '[data-pieza="barra"] [data-nav-id="hero"]'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/velo')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Registro {
  readonly t: number
  readonly ruta: string
  readonly fase: string
  readonly cobertura: number
  readonly color: string
  readonly pildora: number | null
}

const GRABAR = `(() => {
  window.__name = window.__name || ((f) => f)
  const log = (window.__cuadrosDelVelo = [])
  const cuadro = () => {
    const v = document.querySelector('[data-pieza="velo-de-navegacion"]')
    const p = document.querySelector('[data-pieza="barra"] [data-parte="pastilla"]')
    const visible = p && p.checkVisibility({ visibilityProperty: true })
    log.push({ t: performance.timeOrigin + performance.now(), ruta: location.pathname + location.hash, fase: v ? v.getAttribute('data-fase') : 'sin velo', cobertura: v ? Number(v.getAttribute('data-cobertura')) : 0, color: v ? v.getAttribute('data-color') || (() => { const c = (getComputedStyle(v).backgroundColor.match(/[d.]+/g) || []).map(Number); return c.length < 3 || (c[3] !== undefined && c[3] < 0.5) ? '' : c[0] > 128 ? 'papel' : 'tinta' })() : '', pildora: visible ? Math.round(p.getBoundingClientRect().top * 10) / 10 : null })
    if (log.length > 4000) log.splice(0, 2000)
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
  const largos = (window.__cuadrosLargos = [])
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) largos.push({ t: performance.timeOrigin + e.startTime, ms: e.duration, bloqueo: e.blockingDuration, render: e.renderStart ? e.startTime + e.duration - e.renderStart : 0, scripts: (e.scripts || []).map((s) => ({ ms: Math.round(s.duration), invocador: s.invoker, tipo: s.invokerType, fuente: (s.sourceURL || '').split('/').pop() + ':' + (s.sourceFunctionName || '') + ':' + s.sourceCharPosition })) })
      if (largos.length > 400) largos.splice(0, 200)
    }).observe({ type: 'long-animation-frame', buffered: false })
  } catch (e) {}
})()`

interface Foto {
  readonly t: number
  readonly plano: number
  readonly color: readonly [number, number, number]
  readonly jpeg: Buffer
}

/** Qué fracción del cuadro es de un solo color (cuantizado), y cuál. */
async function planitud(jpeg: Buffer): Promise<{ readonly plano: number; readonly color: readonly [number, number, number] }> {
  const { data, info } = await sharp(jpeg).resize(96, 60, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const cuenta = new Map<number, number>()
  const n = info.width * info.height
  for (let i = 0; i < n; i += 1) {
    const k = ((data[i * 3] ?? 0) >> 3) * 1024 + ((data[i * 3 + 1] ?? 0) >> 3) * 32 + ((data[i * 3 + 2] ?? 0) >> 3)
    cuenta.set(k, (cuenta.get(k) ?? 0) + 1)
  }
  let mejor = 0
  let clave = 0
  for (const [k, c] of cuenta) {
    if (c > mejor) {
      mejor = c
      clave = k
    }
  }
  return { plano: mejor / n, color: [((clave >> 10) & 31) * 8 + 4, ((clave >> 5) & 31) * 8 + 4, (clave & 31) * 8 + 4] }
}

const esTinta = (c: readonly [number, number, number]): boolean => c.every((v) => v < 48)
const esPapel = (c: readonly [number, number, number]): boolean => c.every((v) => v > 220)

interface EventoDeLaTraza {
  readonly name: string
  readonly ts: number
  readonly pid: number
  readonly ph: string
}

/** Los cuadros del compositor (ms, en el reloj de la página): los `DrawFrame` del proceso de la página, puestos en hora por una marca. */
function cuadrosDelCompositor(eventos: readonly EventoDeLaTraza[]): number[] {
  const marca = eventos.find((e) => e.name.startsWith('velo-marca:'))
  if (marca === undefined) return []
  const enLaPagina = Number(marca.name.slice('velo-marca:'.length))
  const del = eventos.filter((e) => e.name === 'DrawFrame' && e.pid === marca.pid)
  return del.map((e) => enLaPagina + (e.ts - marca.ts) / 1000).sort((a, b) => a - b)
}

/** La referencia (P-H32): los cuadros del compositor con la escena sola, sin el velo, durante `ms`: el máximo y el p95 (ms). */
async function laEscenaSola(p: Page, cdp: CDPSession, ms: number): Promise<{ readonly maximo: number; readonly p95: number; readonly n: number }> {
  const traza: EventoDeLaTraza[] = []
  const alTrazar = (params: { value: Record<string, unknown>[] }): void => {
    for (const e of params.value) {
      const name = String(e.name ?? '')
      if (name === 'DrawFrame' || name.startsWith('velo-marca:')) traza.push({ name, ts: Number(e.ts), pid: Number(e.pid), ph: String(e.ph ?? '') })
    }
  }
  cdp.on('Tracing.dataCollected', alTrazar)
  await cdp.send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { recordMode: 'recordContinuously', includedCategories: ['blink.user_timing', 'disabled-by-default-devtools.timeline.frame'] } })
  await p.evaluate(() => performance.mark(`velo-marca:${(performance.timeOrigin + performance.now()).toFixed(3)}`))
  await dormir(ms)
  const completa = new Promise<void>((r) => cdp.once('Tracing.tracingComplete', () => r()))
  await cdp.send('Tracing.end')
  await completa
  cdp.off('Tracing.dataCollected', alTrazar)
  const c = cuadrosDelCompositor(traza)
  const iv = c.slice(1).map((x, k) => x - (c[k] ?? x)).sort((a, b) => a - b)
  return { maximo: iv[iv.length - 1] ?? Number.NaN, p95: iv[Math.floor(0.95 * (iv.length - 1))] ?? Number.NaN, n: iv.length }
}

async function grabar(p: Page, cdp: CDPSession, accion: () => Promise<void>, llego: (r: string) => boolean): Promise<{ readonly registros: Registro[]; readonly fotos: Foto[]; readonly compositor: number[]; readonly alClic: number; readonly largos: unknown[] }> {
  await p.evaluate(() => {
    const w = window as unknown as { __cuadrosDelVelo?: unknown[] }
    if (w.__cuadrosDelVelo !== undefined) w.__cuadrosDelVelo.length = 0
  })
  const pendientes: Promise<Foto>[] = []
  const alCuadro = (params: { data: string; sessionId: number; metadata: { timestamp?: number } }): void => {
    void cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => undefined)
    // La hora de llegada (el reloj de la máquina, el mismo que `performance.timeOrigin + now()` de la página): la de CDP es de otra base.
    const t = Date.now()
    const jpeg = Buffer.from(params.data, 'base64')
    pendientes.push(planitud(jpeg).then((x) => ({ t, jpeg, ...x })))
  }
  cdp.on('Page.screencastFrame', alCuadro)
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1 })
  const traza: EventoDeLaTraza[] = []
  const alTrazar = (params: { value: Record<string, unknown>[] }): void => {
    for (const e of params.value) {
      const name = String(e.name ?? '')
      if (name === 'DrawFrame' || name.startsWith('velo-marca:')) traza.push({ name, ts: Number(e.ts), pid: Number(e.pid), ph: String(e.ph ?? '') })
    }
  }
  cdp.on('Tracing.dataCollected', alTrazar)
  await cdp.send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { recordMode: 'recordContinuously', includedCategories: ['blink.user_timing', 'disabled-by-default-devtools.timeline.frame'] } })
  await dormir(250)
  const alClic = await p.evaluate(() => {
    const t = performance.timeOrigin + performance.now()
    performance.mark(`velo-marca:${t.toFixed(3)}`)
    return t
  })
  await accion()
  const t0 = Date.now()
  let visto = false
  while (Date.now() - t0 < 9000) {
    const estado = await p.evaluate(() => {
      const log = (window as unknown as { __cuadrosDelVelo?: { fase: string; ruta: string }[] }).__cuadrosDelVelo ?? []
      const ultimo = log[log.length - 1]
      return { fase: ultimo?.fase ?? '', ruta: ultimo?.ruta ?? '', alguna: log.some((r) => r.fase !== 'quieto') }
    })
    if (estado.alguna) visto = true
    if ((visto || CONTROL === 'sin-velo') && estado.fase === 'quieto' && llego(estado.ruta)) break
    await dormir(50)
  }
  await dormir(500)
  await cdp.send('Page.stopScreencast')
  cdp.off('Page.screencastFrame', alCuadro)
  const completa = new Promise<void>((r) => cdp.once('Tracing.tracingComplete', () => r()))
  await cdp.send('Tracing.end')
  await completa
  cdp.off('Tracing.dataCollected', alTrazar)
  const fotos = await Promise.all(pendientes)
  const registros = await p.evaluate(() => [...((window as unknown as { __cuadrosDelVelo?: Registro[] }).__cuadrosDelVelo ?? [])])
  const largos = await p.evaluate(() => [...((window as unknown as { __cuadrosLargos?: unknown[] }).__cuadrosLargos ?? [])])
  return { registros, fotos, compositor: cuadrosDelCompositor(traza), alClic, largos }
}

interface Juicio {
  readonly linea: string
  readonly bien: boolean
  /** Una medida de referencia (no un recorrido): no cuenta en el criterio. */
  readonly referencia?: true
}

function juzgar(nombre: string, ancho: number, colorEsperado: 'tinta' | 'papel', desde: string, g: { readonly registros: Registro[]; readonly fotos: Foto[]; readonly compositor: number[]; readonly alClic: number; readonly largos: unknown[] }, pildora: 'sube' | 'baja' | 'queda' | 'no'): Juicio {
  // [B12a.8] Desde el clic (la marca de la página justo antes de la acción): antes contaba también el arranque del screencast (~280 ms).
  const inicioMs = g.alClic
  const r = g.registros.filter((x) => x.t >= inicioMs - 50)
  // Los registros crudos (el rAF y el compositor), para leer dónde se va el tiempo.
  writeFileSync(path.join(SALIDA, `crudo-${String(ancho)}-${nombre.replace(/[^a-z]+/gi, '-')}.json`), JSON.stringify({ inicioMs, registros: r, compositor: g.compositor.filter((x) => x >= inicioMs - 50), largos: g.largos }))
  const conVelo = r.filter((x) => x.fase !== 'quieto' && x.fase !== 'sin velo')
  const primero = conVelo[0]
  const ultimo = conVelo[conVelo.length - 1]
  const destapado = r.find((x, k) => k > 0 && x.fase === 'quieto' && (r[k - 1]?.fase ?? '') !== 'quieto' && x.t > (primero?.t ?? Infinity))
  const total = (destapado?.t ?? ultimo?.t ?? Number.NaN) - inicioMs
  // El primer tramo al cubrir: los cuadros de los primeros 200 ms de `cubriendo`.
  const cubriendo = r.filter((x) => x.fase === 'cubriendo')
  const t0c = cubriendo[0]?.t ?? Number.NaN
  let primerTramo = 0
  let enMovimiento = 0
  for (let k = 1; k < r.length; k += 1) {
    const a = r[k - 1]
    const b = r[k]
    if (a === undefined || b === undefined) continue
    const d = b.t - a.t
    if (b.fase === 'cubriendo' && b.t - t0c <= 200) primerTramo = Math.max(primerTramo, d)
    if (b.fase === 'cubriendo' || b.fase === 'destapando') enMovimiento = Math.max(enMovimiento, d)
  }
  // El mismo tramo en el compositor: el intervalo más largo entre dos `DrawFrame` que termina en los primeros 200 ms de `cubriendo`.
  let compositor = 0
  for (let k = 1; k < g.compositor.length; k += 1) {
    const b = g.compositor[k] ?? 0
    if (b > t0c && b - t0c <= 200) compositor = Math.max(compositor, b - (g.compositor[k - 1] ?? b))
  }
  const iCambio = r.findIndex((x, k) => k > 0 && x.ruta.split('#')[0] !== desde.split('#')[0] && (r[k - 1]?.ruta.split('#')[0] ?? '') === desde.split('#')[0])
  const cambio = iCambio < 0 ? null : r[iCambio]
  const tapadoEntero = r.filter((x) => x.fase === 'cubierto')
  const tapadoMs = tapadoEntero.length < 2 ? 0 : (tapadoEntero[tapadoEntero.length - 1]?.t ?? 0) - (tapadoEntero[0]?.t ?? 0)
  const color = primero?.color ?? ''
  // Los cuadros del screencast: (casi) de un solo color y no el velo cubriendo → en blanco o vacío.
  const fase = (t: number): string => {
    let mejor: Registro | undefined
    for (const x of g.registros) if (x.t <= t) mejor = x
    return mejor?.fase ?? 'quieto'
  }
  const fotos = g.fotos.filter((f) => f.t >= inicioMs - 50 && f.t <= (destapado?.t ?? Infinity) + 450)
  let enBlanco = 0
  let delVelo = 0
  for (const f of fotos) {
    if (f.plano < 0.97) continue
    const fs = fase(f.t)
    const esElVelo = fs !== 'quieto' && ((color === 'tinta' && esTinta(f.color)) || (color === 'papel' && esPapel(f.color)))
    if (esElVelo) delVelo += 1
    else {
      if (enBlanco < 4) writeFileSync(path.join(SALIDA, `en-blanco-${String(ancho)}-${nombre.replace(/[^a-z]+/gi, '-')}-${String(enBlanco)}-${fs}.jpg`), f.jpeg)
      enBlanco += 1
    }
  }
  // La píldora: dónde estaba, dónde quedó, el salto más grande entre dos muestras (un dato) y la VELOCIDAD más alta entre dos muestras.
  // [B12a.8] Se desliza en el compositor (WAAPI): con el hilo trabado (el home montándose) dos muestras del rAF quedan lejos aunque en la
  // pantalla vaya pareja. Lo que no puede pasar es ir más rápido que su curva: la pendiente inicial de cubic-bezier(0.25, 0.46, 0.45, 0.94)
  // es 1,84, así que nunca más de 1,84 × recorrido / 560 ms; un salto de verdad (teletransportarse) lo pasa. Con 50 % de margen: el
  // reloj de dos muestras seguidas tiene ruido justo donde la curva va más rápido (medido: 3,7 px/ms en una muestra de 9,5 ms, 2,6 en las demás).
  const conPildora = r.filter((x): x is Registro & { readonly pildora: number } => x.pildora !== null)
  const tops = conPildora.map((x) => x.pildora)
  const desdeP = tops[0] ?? Number.NaN
  const hastaP = tops[tops.length - 1] ?? Number.NaN
  let salto = 0
  for (let k = 1; k < tops.length; k += 1) salto = Math.max(salto, Math.abs((tops[k] ?? 0) - (tops[k - 1] ?? 0)))
  const recorrido = hastaP - desdeP
  let rapidez = 0
  for (let k = 1; k < conPildora.length; k += 1) {
    const a = conPildora[k - 1]
    const b = conPildora[k]
    if (a !== undefined && b !== undefined && b.t > a.t) rapidez = Math.max(rapidez, Math.abs(b.pildora - a.pildora) / (b.t - a.t))
  }
  const tope = (1.5 * 1.84 * Math.abs(recorrido)) / 560
  const pildoraBien = pildora === 'no' || (pildora === 'queda' ? Math.abs(recorrido) < 2 : (pildora === 'sube' ? recorrido < -100 : recorrido > 100) && rapidez <= tope)
  const cubiertoAlCambiar = cambio !== null && cambio !== undefined && cambio.cobertura >= 0.999
  const bien = cubiertoAlCambiar && enBlanco === 0 && color === colorEsperado && pildoraBien && (CONTROL !== '' || total <= 3600)
  const linea =
    `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ${nombre} · total ${total.toFixed(0)} ms (tapado entero ${tapadoMs.toFixed(0)} ms) · primer tramo al cubrir: cuadro máximo ${primerTramo.toFixed(1)} ms en el hilo, ${g.compositor.length === 0 ? 'sin traza' : `${compositor.toFixed(1)} ms en el compositor`}; con la banda moviéndose ${enMovimiento.toFixed(1)} ms` +
    ` · el cambio ${cubiertoAlCambiar ? 'cubierto entero' : `SIN CUBRIR (${cambio === null || cambio === undefined ? 'no se vio' : cambio.cobertura.toFixed(3)})`} · el velo ${color || '—'} (esperado ${colorEsperado})` +
    ` · screencast: ${String(fotos.length)} cuadros, ${String(enBlanco)} en blanco o vacíos, ${String(delVelo)} del velo entero` +
    (pildora === 'no' ? '' : ` · la píldora de ${desdeP.toFixed(0)} a ${hastaP.toFixed(0)} px (salto máximo entre muestras ${salto.toFixed(1)} px; la más rápida ${rapidez.toFixed(2)} px/ms, su curva da a lo sumo ${(tope / 1.5).toFixed(2)})`)
  return { linea, bien }
}

/** El mouse encima de una pieza y, con `apretar`, un clic: como una persona (el `click()` de Playwright antes lleva la pieza a la vista y,
 *  con la cabecera `sticky`, mueve el scroll de la página). */
async function conElMouse(p: Page, selector: string, apretar: boolean): Promise<void> {
  const caja = await p.locator(selector).first().boundingBox()
  if (caja === null) throw new Error(`no está: ${selector}`)
  await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2)
  if (!apretar) return
  await p.mouse.down()
  await p.mouse.up()
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const juicios: Juicio[] = []
  for (const ancho of ANCHOS) {
    const alto = ancho < 1024 ? 844 : 900
    const movil = ancho < 1024
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/velo-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      isMobile: movil,
      hasTouch: movil,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__defectosDelVelo = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const cdp = await ctx.newCDPSession(p)
      await p.goto(`${BASE}${PAGINA}`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(7000)
      // La placa que dibuja (la lección del repo: se rotula con lo que dice la página, no con la bandera pedida).
      const placa = await p.evaluate(() => {
        const gl = document.createElement('canvas').getContext('webgl')
        const info = gl?.getExtension('WEBGL_debug_renderer_info')
        return gl === null || gl === undefined || info === null || info === undefined ? 'sin WebGL' : String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      })
      console.log(`·     ${String(ancho)} · la placa: ${placa}`)
      await p.evaluate(GRABAR)
      await dormir(500)
      if (!movil) {
        // 0 · La referencia: la escena sola en la intro (sin el velo), 1,5 s.
        const sola = await laEscenaSola(p, cdp, 1500)
        const linea = `·     ${String(ancho)} · la escena sola (la intro, sin el velo): el compositor, máximo ${sola.maximo.toFixed(1)} ms, p95 ${sola.p95.toFixed(1)} ms (${String(sola.n)} cuadros)`
        console.log(linea)
        juicios.push({ linea, bien: true, referencia: true })
        // 1 · La página (la intro, sobre la escena de noche) → el home, con «Home» de la píldora: el papel sobre la escena; la píldora baja al pie.
        await conElMouse(p, AL_HOME, false)
        await dormir(400)
        let g = await grabar(p, cdp, () => conElMouse(p, AL_HOME, true), (r) => r === '/v3')
        juicios.push(juzgar('la página → el home («Home»)', ancho, 'papel', PAGINA, g, VIEJO ? 'no' : 'baja'))
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-1-home.png`) })
        await dormir(4000)
        // 2 · El home (el hero, la sala de día) → la página: la tinta sobre la sala de día; la píldora sube.
        if (!VIEJO) {
          await p.evaluate(() => (window as unknown as { next: { router: { prefetch: (h: string) => void } } }).next.router.prefetch('/v3/pagina-base'))
          await dormir(1500)
          g = await grabar(
            p,
            cdp,
            () =>
              p.evaluate(async () => {
                const w = window as unknown as { __veloDelBanco?: { cubrir: () => Promise<void> }; __defectosDelVelo?: unknown; next: { router: { push: (h: string, o: { scroll: boolean }) => void } } }
                if (w.__defectosDelVelo !== 'sin-velo') await w.__veloDelBanco?.cubrir()
                w.next.router.push('/v3/pagina-base', { scroll: false })
              }),
            (r) => r.startsWith('/v3/pagina-base'),
          )
          juicios.push(juzgar('el home → la página (el velo y el router)', ancho, 'tinta', '/v3', g, 'sube'))
          await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-2-pagina.png`) })
        } else {
          await p.evaluate(() => window.history.back())
          await dormir(5000)
        }
        await dormir(3000)
        // 3 · La página, desde su papel → «Portfolio»: la tinta sobre el papel; la píldora se queda arriba (en el home, a la altura del Portfolio).
        // Al papel del cuerpo, con la rueda (Lenis manda el scroll: un scrollTo directo lo pisa).
        for (let i = 0; i < 22; i += 1) {
          await p.mouse.wheel(0, 120)
          await dormir(40)
        }
        await dormir(1800)
        console.log(`  (antes de «Portfolio»: scroll ${String(await p.evaluate(() => Math.round(window.scrollY)))} px)`)
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-3-antes.png`) })
        await conElMouse(p, '[data-pieza="barra"] [data-nav-id="trabajos"]', false)
        await dormir(400)
        g = await grabar(p, cdp, () => conElMouse(p, '[data-pieza="barra"] [data-nav-id="trabajos"]', true), (r) => r.startsWith('/v3#') || r === '/v3')
        juicios.push(juzgar('la página, desde el papel → «Portfolio»', ancho, 'tinta', PAGINA, g, VIEJO ? 'no' : 'queda'))
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-3-portfolio.png`) })
      } else {
        // 4 · A 390: la página (la intro) → el menú → «Portfolio»: el papel sobre la escena de noche.
        await p.locator('[aria-controls="menu-movil"]').first().click()
        await dormir(1200)
        const g = await grabar(p, cdp, () => p.locator('[data-pieza="menu-movil"] a[href*="trabajos"]').first().click(), (r) => r.startsWith('/v3#') || r === '/v3')
        juicios.push(juzgar('la página → el menú → «Portfolio»', ancho, 'papel', PAGINA, g, 'no'))
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-4-menu.png`) })
      }
    } finally {
      await ctx.close()
    }
  }
  for (const j of juicios) console.log(j.linea)
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}${VIEJO ? '-viejo' : ''}.txt`), juicios.map((j) => j.linea).join('\n'))
  const recorridos = juicios.filter((j) => j.referencia !== true)
  console.log(`velo: ${String(recorridos.filter((j) => j.bien).length)} de ${String(recorridos.length)} recorridos dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL})`}${VIEJO ? ' (el build viejo)' : ''}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
