/**
 * [B12a.8] (7) LA VUELTA AL HOME CON DOS ENTRADAS DEL HOME EN EL HISTORIAL — el Chrome del sistema a la vista contra el dev o el build,
 * `/api/` bloqueado, una sola carga de documento. El recorrido (cada paso con el velo; en esta rama el home no tiene un enlace a una página:
 * al ir del home a la página, el velo cubre como lo pide un enlace y navega el router de next, que es lo que hace el `<Link>`):
 *
 *   la página → «Home» → (la rueda hasta y1) → la página → «Home» → (la rueda hasta y2) → la página
 *   ATRÁS (el home 2: y2) · ATRÁS (la página) · ATRÁS (el home 1: y1) · ADELANTE (la página) · ADELANTE (el home 2: y2)
 *
 * El criterio: cada vuelta al home devuelve el scroll de SU entrada (± 2 px). Con una sola posición (B12a.7) el home 1 volvía al y2.
 *
 *   BASE=http://localhost:3004 ANCHO=1440 npx tsx scripts-carga/vuelta-por-entrada.ts      (CONTROL=una-sola: la de B12a.7)
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHO = Number(process.env.ANCHO ?? '1440')
const MOVIL = ANCHO < 1024
const CONTROL = process.env.CONTROL ?? ''
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Espera a que la ruta sea la pedida y el velo esté quieto (destapado), y un respiro. */
async function llegar(p: Page, ok: (ruta: string) => boolean): Promise<void> {
  const t0 = Date.now()
  let visto = false
  while (Date.now() - t0 < 12000) {
    const e = await p.evaluate(() => ({ ruta: location.pathname, fase: document.querySelector('[data-pieza="velo-de-navegacion"]')?.getAttribute('data-fase') ?? '' }))
    if (e.fase !== 'quieto') visto = true
    if (ok(e.ruta) && e.fase === 'quieto' && visto) break
    await dormir(60)
  }
  await dormir(1500)
}

const scroll = (p: Page): Promise<number> => p.evaluate(() => Math.round(window.scrollY))

/** La rueda hasta pasar `pantallas` pantallas (Lenis manda el scroll), y quieto. */
async function bajar(p: Page, pantallas: number): Promise<number> {
  await p.mouse.move(ANCHO / 2, 400)
  const alto = await p.evaluate(() => window.innerHeight)
  for (let i = 0; i < 200 && (await scroll(p)) < pantallas * alto; i += 1) {
    await p.mouse.wheel(0, 140)
    await dormir(45)
  }
  await dormir(2500)
  return scroll(p)
}

async function aLaPagina(p: Page): Promise<void> {
  await p.evaluate(() => (window as unknown as { next: { router: { prefetch: (h: string) => void } } }).next.router.prefetch('/v3/pagina-base'))
  await dormir(800)
  await p.evaluate(async () => {
    const w = window as unknown as { __veloDelBanco?: { cubrir: () => Promise<void> }; next: { router: { push: (h: string, o: { scroll: boolean }) => void } } }
    await w.__veloDelBanco?.cubrir()
    w.next.router.push('/v3/pagina-base', { scroll: false })
  })
  await llegar(p, (r) => r === '/v3/pagina-base')
}

async function alHome(p: Page): Promise<void> {
  // En el teléfono, «Home» está en el menú (la píldora no se muestra).
  if (MOVIL) {
    await p.locator('[aria-controls="menu-movil"]').first().click()
    await dormir(1200)
  }
  const caja = await p.locator(MOVIL ? '[data-pieza="menu-movil"] a[data-parte="item-del-menu"][href="/v3"]' : '[data-pieza="barra"] [data-nav-id="hero"]').first().boundingBox()
  if (caja === null) throw new Error('«Home» no está')
  await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2)
  await dormir(300)
  await p.mouse.down()
  await p.mouse.up()
  await llegar(p, (r) => r === '/v3')
}

async function main(): Promise<void> {
  const perfil = perfilDelBanco('vuelta-entrada')
  rmSync(perfil, { recursive: true, force: true })
  const alto = MOVIL ? 844 : 900
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    viewport: { width: ANCHO, height: alto },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  const fallas: string[] = []
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; window.__defectosDelVelo = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    await p.goto(`${BASE}/v3/pagina-base`, { waitUntil: 'load', timeout: 300000 })
    await dormir(7000)
    await p.evaluate(() => {
      ;(window as unknown as { __marca: string }).__marca = 'entrada'
    })
    await alHome(p)
    // En el teléfono, las dos antes del Portfolio (sus historias frenan la rueda).
    const y1 = await bajar(p, MOVIL ? 0.9 : 2.2)
    console.log(`·     el home 1, en y ${String(y1)}`)
    await aLaPagina(p)
    await alHome(p)
    const y2 = await bajar(p, MOVIL ? 2.1 : 6.5)
    console.log(`·     el home 2, en y ${String(y2)}`)
    await aLaPagina(p)
    const pasos: { readonly nombre: string; readonly ir: () => Promise<unknown>; readonly ruta: string; readonly y: number | null }[] = [
      { nombre: 'ATRÁS → el home 2', ir: () => p.goBack(), ruta: '/v3', y: y2 },
      { nombre: 'ATRÁS → la página', ir: () => p.goBack(), ruta: '/v3/pagina-base', y: null },
      { nombre: 'ATRÁS → el home 1', ir: () => p.goBack(), ruta: '/v3', y: y1 },
      { nombre: 'ADELANTE → la página', ir: () => p.goForward(), ruta: '/v3/pagina-base', y: null },
      { nombre: 'ADELANTE → el home 2', ir: () => p.goForward(), ruta: '/v3', y: y2 },
    ]
    for (const paso of pasos) {
      await paso.ir()
      await llegar(p, (r) => r === paso.ruta)
      const ruta = await p.evaluate(() => location.pathname)
      const y = await scroll(p)
      const bien = ruta === paso.ruta && (paso.y === null || Math.abs(y - paso.y) <= 2)
      if (!bien) fallas.push(paso.nombre)
      console.log(`${bien ? 'ok   ' : 'FALLA'} ${String(ANCHO)} · ${paso.nombre}: ${ruta}, y ${String(y)}${paso.y === null ? '' : ` (esperado ${String(paso.y)}, |Δy| ${String(Math.abs(y - paso.y))})`}`)
    }
    const mismo = await p.evaluate(() => (window as unknown as { __marca?: string }).__marca === 'entrada')
    console.log(`${mismo ? 'ok   ' : 'FALLA'} cargas de documento después de la entrada: ${mismo ? '0' : 'al menos 1'}`)
    if (!mismo) fallas.push('recargo')
  } finally {
    await ctx.close()
  }
  console.log(`vuelta-por-entrada: ${fallas.length === 0 ? 'todo en verde' : `${String(fallas.length)} fallas`}${CONTROL === '' ? '' : ` (CONTROL=${CONTROL})`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
