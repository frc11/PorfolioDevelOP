/**
 * [B12a.2] LA INTRO DE UNA PÁGINA, MEDIDA EN EL SITIO — en la ruta de prueba (`/v3/pagina-base`, la pose elegida: girar), con el banco
 * de la escena (`__entornoDeLaEscena`: publica el avance, `__avanceDeLaIntro`, y la silueta del logo, `__siluetaDelBanco`). Contra el dev
 * server, con el Chrome del sistema a la vista y `/api/` bloqueado. El mouse quieto en el medio (su paralaje en cero).
 *
 *   ANCHOS=1440x900,390x844 npx tsx scripts-carga/intro.ts
 *
 * El criterio (plan §B12a.2): el avance da 0 arriba, 0,5 a mitad y 1 a las 1,5 pantallas (± 1 %); en avance 0 la pose es la composición
 * inicial: el logo centrado en x (su caja, ≤ 1 px del medio del cuadro) y, donde el hero del home también lo centra (el teléfono), idéntico
 * al del hero (≤ 1 px en y y en alto). A 1440 el hero lo corre a la derecha (`frameX` 0,5): fuera de eje la perspectiva lo agranda y lo
 * baja, así que ahí la comparación en y no vale y se informa.
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/intro')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Caja {
  readonly izq: number
  readonly der: number
  readonly arriba: number
  readonly abajo: number
}

/** La caja del logo (px de la ventana) de su silueta en una grilla de 2 px. */
async function cajaDelLogo(p: Page): Promise<Caja | null> {
  return p.evaluate(() => {
    const s = (window as unknown as { __siluetaDelBanco?: (celda?: number) => { celda: number; cols: number; ocupadas: number[] } | null }).__siluetaDelBanco?.(2) ?? null
    if (s === null || s.ocupadas.length === 0) return null
    let [izq, der, arriba, abajo] = [Infinity, -Infinity, Infinity, -Infinity]
    for (const i of s.ocupadas) {
      const [x, y] = [(i % s.cols) * s.celda, Math.floor(i / s.cols) * s.celda]
      izq = Math.min(izq, x)
      der = Math.max(der, x + s.celda)
      arriba = Math.min(arriba, y)
      abajo = Math.max(abajo, y + s.celda)
    }
    return { izq, der, arriba, abajo }
  })
}

async function esperarLaEscena(p: Page): Promise<void> {
  const t0 = Date.now()
  while (Date.now() - t0 < 90000) {
    const lista = await p.evaluate(() => typeof (window as unknown as { __siluetaDelBanco?: unknown }).__siluetaDelBanco === 'function').catch(() => false)
    if (lista) break
    await dormir(300)
  }
  await dormir(4000)
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  let malas = 0
  for (const [ancho, alto] of ANCHOS) {
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/intro-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      const cdp = await ctx.newCDPSession(p)
      await cdp.send('Network.enable')
      await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
      await p.mouse.move(ancho / 2, alto / 2)
      // El logo del hero del home, arriba de todo: la referencia en y (la composición inicial es esa pose con el logo centrado en x).
      await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 240000 })
      await esperarLaEscena(p)
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(1500)
      const delHome = await cajaDelLogo(p)
      // La página: el avance en tres puntos y el logo en avance 0.
      await p.goto(`${BASE}/v3/pagina-base`, { waitUntil: 'load', timeout: 240000 })
      await esperarLaEscena(p)
      await p.mouse.move(ancho / 2, alto / 2)
      const arriba = await p.evaluate(() => {
        const b = document.querySelector('[data-intro-de-pagina]')
        return b === null ? 0 : b.getBoundingClientRect().top + scrollY
      })
      const avances: { readonly esperado: number; readonly medido: number }[] = []
      for (const f of [0, 0.5, 1]) {
        await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), arriba + f * 1.5 * alto)
        await dormir(1200)
        avances.push({ esperado: f, medido: await p.evaluate(() => (window as unknown as { __avanceDeLaIntro?: () => number }).__avanceDeLaIntro?.() ?? Number.NaN) })
      }
      await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), arriba)
      await dormir(2000)
      const dePagina = await cajaDelLogo(p)
      await p.screenshot({ path: path.join(SALIDA, `pagina-${String(ancho)}.png`) })
      const enX = dePagina === null ? Number.NaN : (dePagina.izq + dePagina.der) / 2 - ancho / 2
      const enY = dePagina === null || delHome === null ? Number.NaN : (dePagina.arriba + dePagina.abajo) / 2 - (delHome.arriba + delHome.abajo) / 2
      const alto2 = dePagina === null || delHome === null ? Number.NaN : dePagina.abajo - dePagina.arriba - (delHome.abajo - delHome.arriba)
      const avanceBien = avances.every((a) => Math.abs(a.medido - a.esperado) <= 0.01)
      const heroCentrado = delHome !== null && Math.abs((delHome.izq + delHome.der) / 2 - ancho / 2) <= 1
      const logoBien = Math.abs(enX) <= 1 && (!heroCentrado || (Math.abs(enY) <= 1 && Math.abs(alto2) <= 1))
      if (!avanceBien || !logoBien) malas += 1
      console.log(`${avanceBien && logoBien ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)} · avance ${avances.map((a) => `${a.esperado.toFixed(1)}→${a.medido.toFixed(4)}`).join(', ')} · logo en avance 0: ${enX.toFixed(1)} px del medio en x, ${enY.toFixed(1)} px del hero en y, alto ${alto2.toFixed(1)} px de diferencia${heroCentrado ? '' : ' (el hero corre el logo: en y, sólo informado)'} (caja ${JSON.stringify(dePagina)}, hero ${JSON.stringify(delHome)})`)
    } finally {
      await ctx.close()
    }
  }
  console.log(`intro: ${String(ANCHOS.length - malas)} de ${String(ANCHOS.length)} anchos dentro del criterio`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
