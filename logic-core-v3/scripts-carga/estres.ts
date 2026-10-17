/**
 * [CIERRE A-ter] A13 · EL ARNÉS DE ESTRÉS DE LA CARGA — Playwright con el Chrome del sistema (la placa de alto rendimiento), contra el
 * build de medición o contra el servidor de desarrollo (uno a la vez: la memoria). Una página por tanda. Cada corrida combina:
 *
 *   · la carga: fría (sin caché), con caché, recarga en medio de la página o entrada directa con un ancla (`#trabajos`, …);
 *   · el momento del clic en el menú (0,3 / 1 / 2 / 5 s desde que la navegación arranca), en cada ítem, y dos ítems en < 500 ms;
 *   · la condición: normal, la CPU ×4 (×6 con `AGRESIVO=1`), la red lenta (las fuentes y las imágenes llegan tarde) o la pestaña en
 *     segundo plano y de vuelta; y aparte, el contexto WebGL perdido y repuesto en medio de la página.
 *
 * Mira el estado con `window.__v3diag` (`?diag=carga`, `src/app/v3/_lib/diagnostico/`): 1,5 s después de llegar (lo estricto), 4 s
 * después (lo que se quedó) y 1,5 s después de scrollear un poco (lo que no anda al scrollear). Las fallas son las de `fallas.ts`.
 * Nunca llama a una ruta real: todo `/api/` se bloquea por CDP (la Neon es compartida).
 *
 *   BASE=http://localhost:3000 MODO=build TANDA=antes npx tsx scripts-carga/estres.ts
 *   … SOLO=normal,cpu  (sólo esas condiciones)   PRIMERAS=12 (las primeras N corridas)   AGRESIVO=1 (CPU ×6, las fuentes 5 s tarde)
 *   … SIN_REIMPRESION=1 (el control positivo: la página con `&reimpresion=no`)
 */
import { chromium, type CDPSession, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { appendFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const MODO = process.env.MODO ?? 'build'
const TANDA = process.env.TANDA ?? 'prueba'
const AGRESIVO = process.env.AGRESIVO === '1'
const SIN_REIMPRESION = process.env.SIN_REIMPRESION === '1'
const SALIDA = path.join(homedir(), '.cache', 'b4-medicion', 'cierre-a-ter', 'carga')
const PERFIL = path.join(homedir(), '.cache', 'b4-medicion', 'cierre-a-ter', 'perfil')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const MEMORIA_MINIMA_MB = Number(process.env.PORTERO_MB ?? 1500)

export const ITEMS = ['quienes-somos', 'trabajos', 'servicios', 'tu-panel', 'por-que-develop', 'contacto'] as const
export const MOMENTOS_MS = [300, 1000, 2000, 5000] as const
export const CARGAS = ['fria', 'cache', 'recarga', 'hash'] as const
export const CONDICIONES = ['normal', 'cpu', 'red', 'fondo'] as const
// [B1] y los cuatro deep links del Portfolio: al cargar con uno, el selector tiene que mostrar su proyecto (`portfolio-ancla`).
const ANCLAS_DE_ENTRADA = ['trabajos', 'servicios', 'tu-panel', 'quienes-somos', 'portfolio-el-garage', 'portfolio-esquina-estudio', 'portfolio-banu-scents', 'portfolio-la-tuya'] as const

type Item = (typeof ITEMS)[number]
type Carga = (typeof CARGAS)[number]
type Condicion = (typeof CONDICIONES)[number] | 'contexto'

export interface Escenario {
  readonly n: number
  readonly carga: Carga
  readonly condicion: Condicion
  readonly item: Item
  readonly segundo: Item | null
  readonly momentoMs: number
  readonly ancla: string | null
}

/** La matriz: cada condición con cada carga y cada ítem, con el momento rotando; los dos clics seguidos; el contexto perdido. */
export function escenarios(): Escenario[] {
  const lista: Escenario[] = []
  let k = 0
  const sumar = (e: Omit<Escenario, 'n'>): void => {
    lista.push({ ...e, n: lista.length })
  }
  for (const condicion of CONDICIONES) {
    for (const carga of CARGAS) {
      for (const item of ITEMS) {
        sumar({ carga, condicion, item, segundo: null, momentoMs: MOMENTOS_MS[k % MOMENTOS_MS.length], ancla: carga === 'hash' ? ANCLAS_DE_ENTRADA[k % ANCLAS_DE_ENTRADA.length] : null })
        k += 1
      }
    }
    for (const [a, b] of [['trabajos', 'servicios'], ['quienes-somos', 'tu-panel']] as const) sumar({ carga: 'cache', condicion, item: a, segundo: b, momentoMs: 2000, ancla: null })
  }
  for (const item of ['trabajos', 'por-que-develop', 'servicios'] as const) sumar({ carga: 'cache', condicion: 'contexto', item, segundo: null, momentoMs: 2000, ancla: null })
  return lista
}

const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, Math.max(0, ms)))

function memoriaLibreMB(): number {
  try {
    return Math.round(Number(execSync('powershell -NoProfile -Command "(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory"').toString().trim()) / 1024)
  } catch {
    return 99999
  }
}

type Referencia = Record<string, { inicio: number; fin: number }>

interface Revision {
  readonly t: number
  readonly fallas: readonly { readonly tipo: string; readonly id: string; readonly detalle: string }[]
  readonly visible: boolean
  readonly scrollY: number
  readonly textos: number
  readonly bloques: number
  readonly fuentes: string
  readonly escena: unknown
  readonly epoca: unknown
}

/** El estado de la página, revisado (o `null` si el diagnóstico no llegó). */
async function revisar(p: Page, ref: Referencia | null): Promise<Revision | null> {
  return p.evaluate((r) => {
    type D = { estado: (x?: unknown) => { t: number; visible: boolean; scrollY: number; textos: unknown[]; bloques: unknown[]; fuentes: { estado: string }; escena: unknown; epoca: unknown }; fallas: (x?: unknown) => { tipo: string; id: string; detalle: string }[] }
    const d = (window as unknown as { __v3diag?: D }).__v3diag
    if (d === undefined) return null
    const e = d.estado(r ?? undefined)
    return { t: e.t, fallas: d.fallas(r ?? undefined), visible: e.visible, scrollY: e.scrollY, textos: e.textos.length, bloques: e.bloques.length, fuentes: e.fuentes.estado, escena: e.escena, epoca: e.epoca }
  }, ref)
}

interface Pulso {
  readonly scrollY: number
  readonly viaje: string | null
  readonly lenis: string | null
  readonly visible: boolean
  readonly escenaLista?: boolean
}
async function pulso(p: Page): Promise<Pulso | null> {
  return p.evaluate(() => {
    const d = (window as unknown as { __v3diag?: { pulso: () => Pulso } }).__v3diag
    return d === undefined ? null : d.pulso()
  })
}

/** Espera a que la escena haya dibujado su primer cuadro (o se haya caído): con la CPU lenta y en frío tarda segundos. Devuelve cuánto. */
async function esperarLaEscena(p: Page, topeMs = 30000): Promise<number> {
  const t0 = Date.now()
  while (Date.now() - t0 < topeMs) {
    const x = await pulso(p).catch(() => null)
    if (x !== null && x.escenaLista !== false) break
    await dormir(150)
  }
  return Date.now() - t0
}

/** Espera la llegada: sin viaje, el scroll quieto 600 ms y el Lenis sin moverse (a lo sumo `topeMs`). Devuelve cuánto tardó. */
async function esperarLaLlegada(p: Page, topeMs = 15000): Promise<{ readonly ms: number; readonly llego: boolean }> {
  const t0 = Date.now()
  let ultimo = Number.NaN
  let quietoDesde = Date.now()
  await dormir(300)
  while (Date.now() - t0 < topeMs) {
    const x = await pulso(p).catch(() => null)
    if (x !== null) {
      if (x.scrollY !== ultimo) {
        ultimo = x.scrollY
        quietoDesde = Date.now()
      }
      const moviendose = x.lenis !== null && x.lenis !== 'false'
      if (x.viaje === null && !moviendose && Date.now() - quietoDesde >= 600) return { ms: Date.now() - t0, llego: true }
    }
    await dormir(100)
  }
  return { ms: Date.now() - t0, llego: false }
}

function selectorDe(item: Item): string {
  return item === 'contacto' ? '[data-pieza="barra"] a[href="#contacto"]' : `a[data-pieza="barra-enlace"][data-nav-id="${item}"]`
}

/** Un clic de verdad (el mouse) en el centro del ítem, apenas existe y se ve; sin scrollear para encontrarlo. */
async function clickear(p: Page, item: Item, t0: number): Promise<{ readonly ms: number; readonly ok: boolean }> {
  const el = await p.waitForSelector(selectorDe(item), { state: 'visible', timeout: 20000 }).catch(() => null)
  const caja = el === null ? null : await el.boundingBox()
  if (caja === null) return { ms: Date.now() - t0, ok: false }
  await p.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2)
  return { ms: Date.now() - t0, ok: true }
}

/**
 * La pestaña al fondo y de vuelta, EMULADA: Playwright mantiene sus páginas visibles aunque la ventana se minimice o se tape (medido: ni
 * otra pestaña ni minimizar cambian `document.visibilityState`). Se emula la señal que el código lee —`visibilityState`, `hidden` y su
 * evento— con un guion de arranque (`EMULAR_LA_VISIBILIDAD`); los cuadros y los relojes siguen andando. Devuelve lo que la página dijo.
 */
async function alFondo(p: Page, ms: number): Promise<string> {
  const poner = (oculta: boolean): Promise<string> =>
    p.evaluate((o) => {
      ;(window as unknown as { __ocultaDelArnes: boolean }).__ocultaDelArnes = o
      document.dispatchEvent(new Event('visibilitychange'))
      return document.visibilityState
    }, oculta)
  const estado = await poner(true).catch(() => '?')
  await dormir(ms)
  await poner(false).catch(() => '?')
  return estado
}

/** El guion de arranque de la visibilidad emulada (en cada navegación; sin pedir nada, visible). */
const EMULAR_LA_VISIBILIDAD = `(() => {
  window.__ocultaDelArnes = false
  Object.defineProperty(Document.prototype, 'visibilityState', { configurable: true, get() { return window.__ocultaDelArnes ? 'hidden' : 'visible' } })
  Object.defineProperty(Document.prototype, 'hidden', { configurable: true, get() { return window.__ocultaDelArnes } })
})()`

async function condicionar(cdp: CDPSession, c: Condicion): Promise<void> {
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: c === 'cpu' ? (AGRESIVO ? 6 : 4) : 1 })
  if (c === 'red') await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 300, downloadThroughput: (2 * 1024 * 1024) / 8, uploadThroughput: (1024 * 1024) / 8 })
  else await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 })
}

/** Las fuentes y las imágenes, tarde (la red lenta): se interceptan por CDP y se sueltan después de `demoraMs`. */
async function demorarLasFuentes(cdp: CDPSession, activo: () => number): Promise<void> {
  await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*.woff2*', requestStage: 'Request' }, { urlPattern: '*/_next/image*', requestStage: 'Request' }, { urlPattern: '*.webp*', requestStage: 'Request' }, { urlPattern: '*.avif*', requestStage: 'Request' }, { urlPattern: '*.jpg*', requestStage: 'Request' }, { urlPattern: '*.png*', requestStage: 'Request' }] })
  cdp.on('Fetch.requestPaused', (ev: { requestId: string; request: { url: string } }) => {
    const ms = activo()
    const espera = ev.request.url.includes('.woff2') ? ms : ms * 0.6
    setTimeout(() => {
      void cdp.send('Fetch.continueRequest', { requestId: ev.requestId }).catch(() => undefined)
    }, espera)
  })
}

interface LaReferencia {
  readonly rangos: Referencia
  /** Cuánto se aparta (px) el rango de cada bloque: medido en el layout, y el que midió solo al cargar (antes de la época forzada). */
  readonly delLayout: Record<string, number>
  readonly alCargar: Record<string, number>
}

type Rangos = Record<string, { inicio: number; fin: number } | null>
async function rangosDeAhora(p: Page): Promise<{ readonly rangos: Rangos; readonly delLayout: Rangos }> {
  return p.evaluate(() => {
    const d = (window as unknown as { __v3diag?: { estado: () => { rangos: Rangos; rangosDelLayout: Rangos } } }).__v3diag
    if (d === undefined) return { rangos: {}, delLayout: {} }
    const e = d.estado()
    return { rangos: e.rangos, delLayout: e.rangosDelLayout }
  })
}

const aparte = (a: { inicio: number; fin: number } | null | undefined, b: { inicio: number; fin: number }): number => (a === null || a === undefined ? 99999 : Math.round(Math.max(Math.abs(a.inicio - b.inicio), Math.abs(a.fin - b.fin))))

/** Una carga limpia desde arriba: los rangos que midió cada bloque solo y, después de una época forzada (todo medido en reposo), la referencia. */
async function referencia(p: Page): Promise<LaReferencia> {
  await p.goto(`${BASE}/v3?diag=carga${SIN_REIMPRESION ? '&reimpresion=no' : ''}`, { waitUntil: 'load', timeout: 120000 })
  await dormir(7000)
  const alCargar = await rangosDeAhora(p)
  await p.evaluate(() => window.dispatchEvent(new Event('resize')))
  await dormir(1200)
  const enReposo = await rangosDeAhora(p)
  const rangos: Referencia = {}
  const delLayout: Record<string, number> = {}
  const deLaCarga: Record<string, number> = {}
  for (const [id, x] of Object.entries(enReposo.rangos)) {
    if (x === null) continue
    rangos[id] = x
    delLayout[id] = aparte(enReposo.delLayout[id], x)
    deLaCarga[id] = aparte(alCargar.rangos[id], x)
  }
  return { rangos, delLayout, alCargar: deLaCarga }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  rmSync(PERFIL, { recursive: true, force: true })
  const archivo = path.join(SALIDA, `${MODO}-${TANDA}.jsonl`)
  writeFileSync(archivo, '')
  const solo = process.env.SOLO?.split(',') ?? null
  const primeras = Number(process.env.PRIMERAS ?? 0)
  let lista = escenarios().filter((e) => solo === null || solo.includes(e.condicion))
  if (primeras > 0) lista = lista.slice(0, primeras)

  const ctx = await chromium.launchPersistentContext(PERFIL, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', '--window-size=1460,1000', '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await ctx.addInitScript(EMULAR_LA_VISIBILIDAD)
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  // Ninguna ruta real: todo /api/ bloqueado (sin interceptar: la caché sigue andando).
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  let demoraDeLasFuentes = 0
  await demorarLasFuentes(cdp, () => demoraDeLasFuentes)
  const errores: string[] = []
  const avisos: string[] = []
  p.on('pageerror', (e) => errores.push(String(e.message).slice(0, 200)))
  p.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text().slice(0, 200))
    if (m.text().includes('[v3-carga]')) avisos.push(m.text().slice(0, 200))
  })

  const gpu = await p.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    return gl === null || gl === undefined || ext === null || ext === undefined ? '?' : String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
  })
  const laReferencia = await referencia(p)
  const ref = laReferencia.rangos
  appendFileSync(archivo, `${JSON.stringify({ tipo: 'tanda', modo: MODO, tanda: TANDA, gpu, agresivo: AGRESIVO, sinReimpresion: SIN_REIMPRESION, bloques: Object.keys(ref).length, escenarios: lista.length, referencia: ref, delLayout: laReferencia.delLayout, alCargar: laReferencia.alCargar })}\n`)
  const apartados = (de: Record<string, number>): string => Object.entries(de).filter(([, px]) => px > 2).map(([id, px]) => `${id} ${String(px)}`).join(' · ')
  console.log(`[${MODO}/${TANDA}] ${gpu} · ${String(Object.keys(ref).length)} bloques de referencia · ${String(lista.length)} corridas`)
  console.log(`  medidos solos al cargar, a más de 2 px de la referencia: ${apartados(laReferencia.alCargar) || 'ninguno'}`)
  console.log(`  medidos en el layout, a más de 2 px de la referencia: ${apartados(laReferencia.delLayout) || 'ninguno'}`)

  for (const e of lista) {
    const libre = memoriaLibreMB()
    if (libre < MEMORIA_MINIMA_MB) {
      appendFileSync(archivo, `${JSON.stringify({ tipo: 'corte', n: e.n, libre })}\n`)
      console.log(`CORTE: ${String(libre)} MB libres`)
      break
    }
    errores.length = 0
    avisos.length = 0
    await condicionar(cdp, e.condicion === 'contexto' ? 'normal' : e.condicion)
    demoraDeLasFuentes = e.condicion === 'red' ? (AGRESIVO ? 5000 : 2500) : 0
    const extra = SIN_REIMPRESION ? '&reimpresion=no' : ''
    const url = `${BASE}/v3?diag=carga${extra}${e.ancla === null ? '' : `#${e.ancla}`}`
    await p.goto('about:blank').catch(() => undefined)
    if (e.carga === 'fria') {
      await cdp.send('Network.clearBrowserCache')
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    }
    let t0 = Date.now()
    let fondo: string | null = null
    try {
      if (e.carga === 'recarga') {
        await p.goto(url, { waitUntil: 'load', timeout: 120000 })
        await dormir(2500)
        await p.mouse.move(720, 450)
        for (let k = 0; k < 12; k += 1) await p.mouse.wheel(0, 600)
        await dormir(1500)
        t0 = Date.now()
        await p.reload({ waitUntil: 'commit', timeout: 120000 })
      } else await p.goto(url, { waitUntil: 'commit', timeout: 120000 })
      if (e.condicion === 'fondo') {
        await dormir(200)
        fondo = await alFondo(p, 4000)
        t0 = Date.now()
      }
      await dormir(t0 + e.momentoMs - Date.now())
      const clic = await clickear(p, e.item, t0)
      const segundo = e.segundo === null ? null : (await dormir(250), await clickear(p, e.segundo, t0))
      const llegada = await esperarLaLlegada(p)
      // La llegada es con la escena lista (su primer cuadro): si no lo estaba al terminar el viaje, lo literal (a 1,5 s del fin del viaje) aparte.
      let alLlegar: Revision | null = null
      let escenaMs = 0
      if ((await pulso(p).catch(() => null))?.escenaLista === false) {
        await dormir(1500)
        alLlegar = await revisar(p, ref)
        escenaMs = await esperarLaEscena(p)
      }
      let contexto: string | null = null
      if (e.condicion === 'contexto') {
        contexto = await p.evaluate(async () => {
          const lienzo = document.querySelector('[data-escena] canvas')
          const gl = lienzo instanceof HTMLCanvasElement ? lienzo.getContext('webgl2') : null
          const ext = gl?.getExtension('WEBGL_lose_context') ?? null
          if (ext === null) return 'sin extensión'
          ext.loseContext()
          await new Promise((r) => setTimeout(r, 1000))
          ext.restoreContext()
          return 'perdido y repuesto'
        })
        await dormir(1500)
      }
      await dormir(1500)
      const estricto = await revisar(p, ref)
      await dormir(4000)
      const persistente = await revisar(p, ref)
      await p.mouse.move(720, 450)
      await p.mouse.wheel(0, 500)
      await dormir(1500)
      const trasScroll = await revisar(p, ref)
      const eventos = await p.evaluate(() => (window as unknown as { __v3diag?: { eventos: () => unknown[] } }).__v3diag?.eventos().slice(-150) ?? [])
      const fila = { tipo: 'corrida', ...e, fondo, clic, segundoClic: segundo, llegada, escenaMs, alLlegar, contexto, estricto, persistente, trasScroll, errores: [...new Set(errores)].slice(0, 12), avisos: avisos.length, eventos }
      appendFileSync(archivo, `${JSON.stringify(fila)}\n`)
      const fs = (r: Revision | null): string => (r === null ? 'SIN DIAG' : r.fallas.length === 0 ? 'ok' : [...new Set(r.fallas.map((f) => f.tipo))].join('+'))
      console.log(`${String(e.n).padStart(3)} ${e.condicion.padEnd(8)} ${e.carga.padEnd(7)} ${String(e.momentoMs).padStart(4)}ms ${e.item}${e.segundo === null ? '' : `+${e.segundo}`} · llega ${String(llegada.ms)}ms${escenaMs > 0 ? ` (+${String(escenaMs)}ms la escena: ${fs(alLlegar)})` : ''} · ${fs(estricto)} | ${fs(persistente)} | ${fs(trasScroll)}${errores.length > 0 ? ` · ${String(errores.length)} errores` : ''}`)
    } catch (err) {
      appendFileSync(archivo, `${JSON.stringify({ tipo: 'corrida', ...e, error: String(err).slice(0, 300) })}\n`)
      console.log(`${String(e.n).padStart(3)} ERROR ${String(err).slice(0, 160)}`)
    } finally {
      if (e.carga === 'fria') await cdp.send('Network.setCacheDisabled', { cacheDisabled: false }).catch(() => undefined)
    }
  }
  await ctx.close()
  rmSync(PERFIL, { recursive: true, force: true })
  console.log(`FIN ${archivo}`)
}

if (process.argv[1]?.endsWith('estres.ts')) void main()
