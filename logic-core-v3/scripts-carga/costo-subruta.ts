/**
 * [B12a] EL COSTO DE LA ESCENA EN UNA SUBRUTA (el banco de la Fase 0, `SPRINT-B12a.md` §2; el criterio de B12a.1), contra el dev server.
 * Una corrida = un Chrome nuevo.
 *   BASE=http://localhost:3002 RUTA=/v3/tipografia VARIANTE=escena|sin-webgl CORRIDA=1 npx tsx scripts-carga/costo-subruta.ts
 * Mide en reposo arriba (10 s) y en una pasada de rueda (8 s): cuadros (rAF), hilo principal (TaskDuration/ScriptDuration por s, CDP
 * Performance.getMetrics), heap de JS, y el working set de los procesos del Chrome del banco (por perfil). Rotula la placa con lo que diga
 * WEBGL_debug_renderer_info en la misma página.
 */
import { execFileSync } from 'node:child_process'
import { chromium, type CDPSession, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const RUTA = `/${(process.env.RUTA ?? 'v3/tipografia').replace(/^\/+/, '')}`
const VARIANTE = process.env.VARIANTE ?? 'escena'
const CORRIDA = process.env.CORRIDA ?? '1'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PERFIL = `C:/Users/Valentino/.cache/b4-medicion/b12a-perfil-${VARIANTE}-${CORRIDA}-${String(Date.now())}`
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

type Metricas = Record<string, number>
async function metricas(cdp: CDPSession): Promise<Metricas> {
  const { metrics } = (await cdp.send('Performance.getMetrics')) as { metrics: { name: string; value: number }[] }
  return Object.fromEntries(metrics.map((m) => [m.name, m.value]))
}

function memoriaDelChrome(): { total: number; gpu: number; renderer: number } {
  const ps = `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like '*b12a-perfil-${VARIANTE}-${CORRIDA}-*' } | ForEach-Object { $t = if ($_.CommandLine -match '--type=([a-z-]+)') { $Matches[1] } else { 'browser' }; "$t $($_.WorkingSetSize)" }`
  const salida = execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' })
  let total = 0, gpu = 0, renderer = 0
  for (const linea of salida.split(/\r?\n/).filter(Boolean)) {
    const [tipo, ws] = linea.trim().split(' ')
    const mb = Number(ws) / 1048576
    total += mb
    if (tipo === 'gpu-process') gpu += mb
    if (tipo === 'renderer') renderer += mb
  }
  return { total: Math.round(total), gpu: Math.round(gpu), renderer: Math.round(renderer) }
}

/** Los cuadros de `ms`: los intervalos entre rAF. Va como texto (tsx mete `__name` en las funciones con nombre). */
async function cuadros(p: Page, ms: number): Promise<{ fps: number; p95: number; largos: number }> {
  return p.evaluate(`new Promise((resolver) => {
    const t = []; let antes = performance.now(); const fin = antes + ${String(ms)};
    const paso = (ahora) => { t.push(ahora - antes); antes = ahora; if (ahora < fin) requestAnimationFrame(paso); else {
      const o = [...t].sort((a, b) => a - b); resolver({ fps: Math.round(1000 * t.length / ${String(ms)}), p95: Math.round(o[Math.floor(o.length * 0.95)] * 10) / 10, largos: t.filter((x) => x > 50).length }) } };
    requestAnimationFrame(paso) })`)
}

async function tramo(p: Page, cdp: CDPSession, ms: number, rueda: boolean): Promise<Record<string, number>> {
  const a = await metricas(cdp)
  const t0 = Date.now()
  const enCuadros = cuadros(p, ms)
  if (rueda) {
    const pasos = Math.floor(ms / 120)
    for (let k = 0; k < pasos; k++) {
      await p.mouse.wheel(0, k < pasos / 2 ? 240 : -240)
      await dormir(100)
    }
  }
  const c = await enCuadros
  const b = await metricas(cdp)
  const s = (Date.now() - t0) / 1000
  const porS = (n: string): number => Math.round(((b[n] - a[n]) / s) * 1000)
  return { ...c, tareaMsPorS: porS('TaskDuration'), scriptMsPorS: porS('ScriptDuration'), layoutMsPorS: porS('LayoutDuration'), heapMB: Math.round(b.JSHeapUsedSize / 1048576) }
}

async function main(): Promise<void> {
  const args = ['--window-size=1460,1000', '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows']
  if (VARIANTE === 'sin-webgl') args.push('--disable-webgl', '--disable-3d-apis')
  const ctx = await chromium.launchPersistentContext(PERFIL, { executablePath: CHROME, headless: false, viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, args })
  await ctx.addInitScript(`(() => { try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ; window.__name = window.__name || ((f) => f) })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  await cdp.send('Performance.enable')
  await p.goto(`${BASE}${RUTA}`, { waitUntil: 'load', timeout: 240000 })
  await dormir(10000)
  const estado = await p.evaluate(`(() => {
    const gl = document.createElement('canvas').getContext('webgl2'); const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return { visible: document.visibilityState, ancho: innerWidth, lienzos: document.querySelectorAll('canvas').length,
      placa: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'sin webgl', escena: document.querySelector('[data-escena]')?.getAttribute('data-escena') ?? null,
      paneles: document.querySelectorAll('[data-panel]').length, alto: document.documentElement.offsetHeight } })()`)
  const quieto = await tramo(p, cdp, 10000, false)
  const memQuieto = memoriaDelChrome()
  const rueda = await tramo(p, cdp, 8000, true)
  const memRueda = memoriaDelChrome()
  console.log(JSON.stringify({ ruta: RUTA, variante: VARIANTE, corrida: CORRIDA, estado, quieto: { ...quieto, chromeMB: memQuieto }, rueda: { ...rueda, chromeMB: memRueda } }))
  await ctx.close()
}
void main()
