/**
 * [CIERRE A-ter] A4b · LA RED DE NOCHE CON MÁS RAYOS, en el sitio: la hoja (cuadros de la red armada a 1440 y a 390, con la densidad del
 * producto y una de cada variante a 1440) y los cuadros por segundo de noche con la red armada, contra `?red-densidad=1` (la de A-bis).
 * Playwright con el Chrome del sistema y la placa de alto rendimiento; una página; todo /api/ bloqueado.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/red.ts
 */
import { chromium, type Page } from '@playwright/test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const SALIDA = path.join(homedir(), '.cache', 'b4-medicion', 'cierre-a-ter', 'red')
const PERFIL = path.join(homedir(), '.cache', 'b4-medicion', 'cierre-a-ter', 'perfil-red')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Va a Portfolio (de noche) con el menú, o con el ancla en el teléfono, y espera quieto a que la red se arme entera (3,5 s + ~7,3 s). */
async function irALaNoche(p: Page, ancho: number, densidad: string | null): Promise<void> {
  const q = densidad === null ? '' : `?red-densidad=${densidad}`
  await p.goto(`${BASE}/v3${q}`, { waitUntil: 'load', timeout: 120000 })
  await dormir(4000)
  if (ancho >= 1024) {
    const el = await p.waitForSelector('a[data-pieza="barra-enlace"][data-nav-id="trabajos"]', { state: 'visible', timeout: 20000 })
    const caja = await el.boundingBox()
    if (caja !== null) await p.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2)
  } else {
    await p.evaluate(() => document.getElementById('trabajos')?.scrollIntoView())
  }
  await dormir(3000)
  // Quieto (el mouse afuera: no corta la red) hasta que la red esté armada y entera (a lo sumo 25 s).
  await p.mouse.move(2, 2)
  const t0 = Date.now()
  while (Date.now() - t0 < 25000) {
    const red = await deLaRed(p)
    if (red !== null && red.fase === 'armada' && red.encendida >= 0.99) return
    await dormir(250)
  }
}

interface DeLaRed {
  readonly fase: string
  readonly enlaces: number
  readonly encendida: number
}
/** La red, del gancho del banco de la energía (con banco: la cadena del entorno, arriba). */
async function deLaRed(p: Page): Promise<DeLaRed | null> {
  return p.evaluate(() => (window as unknown as { __energiaDelBanco?: { estado: () => { red: DeLaRed } } }).__energiaDelBanco?.estado().red ?? null)
}

/** Los cuadros por segundo (por rAF) durante `ms`: el promedio y el p95 del intervalo. */
async function cuadros(p: Page, ms: number): Promise<{ readonly fps: number; readonly p95: number; readonly n: number }> {
  return p.evaluate(
    (dura) =>
      new Promise<{ fps: number; p95: number; n: number }>((resolver) => {
        const ts: number[] = []
        const t0 = performance.now()
        const paso = (t: number): void => {
          ts.push(t)
          if (t - t0 < dura) requestAnimationFrame(paso)
          else {
            const d = ts.slice(1).map((x, k) => x - ts[k]).sort((a, b) => a - b)
            resolver({ fps: (1000 * d.length) / (ts[ts.length - 1] - ts[0]), p95: d[Math.floor(d.length * 0.95)] ?? 0, n: d.length })
          }
        }
        requestAnimationFrame(paso)
      }),
    ms,
  )
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  rmSync(PERFIL, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(PERFIL, { executablePath: CHROME, headless: false, viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference', args: ['--force_high_performance_gpu', '--window-size=1460,1000', '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'] })
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  // Con banco (para leer la red): la URL no cuenta, la densidad va en la cadena del entorno.
  await ctx.addInitScript(() => {
    const d = new URLSearchParams(location.search).get('red-densidad')
    ;(window as unknown as { __entornoDeLaEscena?: string }).__entornoDeLaEscena = d === null ? 'producto' : `producto,red-densidad=${d}`
  })
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  const informe: Record<string, unknown> = {}
  informe.gpu = await p.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    return gl === null || gl === undefined || ext === null || ext === undefined ? '?' : String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
  })
  // Los cuadros por segundo: la de A-bis y la del producto, dos veces cada una, alternadas.
  const fps: Record<string, unknown[]> = { '1': [], producto: [] }
  for (const vuelta of [0, 1]) {
    for (const d of ['1', null] as const) {
      await irALaNoche(p, 1440, d)
      const red = await deLaRed(p)
      const r = await cuadros(p, 6000)
      fps[d ?? 'producto'].push({ ...r, red })
      console.log(`vuelta ${String(vuelta)} · densidad ${d ?? 'producto'}: ${r.fps.toFixed(1)} cps, p95 ${r.p95.toFixed(1)} ms (${String(r.n)} cuadros) · red ${red === null ? '?' : `${red.fase}, ${String(red.enlaces)} rayos, ${red.encendida.toFixed(2)}`}`)
    }
  }
  informe.fps = fps
  // La hoja: 5 cuadros de la del producto a 1440 y a 390 (cada ~0,6 s), y uno de cada variante a 1440.
  for (const [ancho, alto] of [[1440, 900], [390, 844]] as const) {
    await p.setViewportSize({ width: ancho, height: alto })
    await irALaNoche(p, ancho, null)
    for (let k = 0; k < 5; k += 1) {
      await p.screenshot({ path: path.join(SALIDA, `producto-${String(ancho)}-${String(k)}.png`) })
      await dormir(600)
    }
  }
  await p.setViewportSize({ width: 1440, height: 900 })
  for (const d of ['1', '1.25', '1.75']) {
    await irALaNoche(p, 1440, d)
    await p.screenshot({ path: path.join(SALIDA, `variante-${d}.png`) })
  }
  writeFileSync(path.join(SALIDA, 'informe.json'), `${JSON.stringify(informe, null, 1)}\n`)
  await ctx.close()
  rmSync(PERFIL, { recursive: true, force: true })
  console.log(`FIN ${SALIDA}`)
}

void main()
