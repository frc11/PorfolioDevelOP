import { mkdirSync } from 'node:fs'

import { chromium, type Page } from '@playwright/test'

import { perfilDelBanco } from './limpieza-del-banco'

const BASE = 'http://localhost:3003'
const SALIDA = 'C:/nocturno/cola3-fotos/b/L6/fotos'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function abrir(ancho: number, alto: number, conPreloader: boolean): Promise<{ ctx: Awaited<ReturnType<typeof chromium.launchPersistentContext>>; p: Page }> {
  const tactil = ancho < 1024
  const ctx = await chromium.launchPersistentContext(perfilDelBanco(`fotos-l6-${String(ancho)}`), {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: tactil,
    hasTouch: tactil,
    args: ['--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  })
  await ctx.addInitScript(`window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; ${conPreloader ? `window.__preloaderDelBanco = 'normal'` : `try { sessionStorage.setItem('home:intro', '1') } catch (e) {}`}`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  return { ctx, p }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  for (const [ancho, alto] of [[1440, 900], [1024, 768], [390, 844]] as const) {
    const { ctx, p } = await abrir(ancho, alto, true)
    try {
      // La CPU más lenta (como un teléfono): la carga tarda y el latido se repite, así hay tiempo de ver la onda.
      await (await ctx.newCDPSession(p)).send('Emulation.setCPUThrottlingRate', { rate: 3 })
      await p.goto(`${BASE}/v3`, { waitUntil: 'commit', timeout: 300000 })
      // Cuando la onda está a mitad de camino (su opacidad entre 0,25 y 0,45), la foto.
      await p.waitForFunction(() => {
        const o = document.querySelector('[data-parte="onda-del-pulso"]')
        const capa = document.querySelector('[data-pieza="preloader"]')
        const blanco = document.querySelector('[data-parte="blanco"]')
        // La onda a mitad de camino con la capa entera y el blanco puesto (todavía no salió).
        const listo = o !== null && capa !== null && blanco !== null && Number(getComputedStyle(o).opacity) > 0.3 && Number(getComputedStyle(o).opacity) < 0.55 && Number(getComputedStyle(capa).opacity) === 1 && Number(getComputedStyle(blanco).opacity) === 1
        return listo
      }, undefined, { timeout: 120000, polling: 16 })
      await p.screenshot({ path: `${SALIDA}/preloader-onda-${String(ancho)}.png` })
    } finally {
      await ctx.close()
    }
  }
  for (const [ancho, alto] of [[1440, 900], [390, 844]] as const) {
    const { ctx, p } = await abrir(ancho, alto, false)
    try {
      await p.goto(`${BASE}/v3/pagina-base`, { waitUntil: 'load', timeout: 300000 })
      await dormir(9000)
      await p.screenshot({ path: `${SALIDA}/pagina-base-sin-flags-${String(ancho)}.png` })
      await p.goto(`${BASE}/v3?ingresar&envio=lento`, { waitUntil: 'load', timeout: 300000 })
      await p.waitForSelector('[data-pieza="ingreso"][data-fase="abierta"]', { timeout: 30000 })
      await p.click('[data-parte="olvido"]')
      await p.waitForSelector('[data-pieza="ingreso-olvido"]', { timeout: 10000 })
      await dormir(500)
      await p.screenshot({ path: `${SALIDA}/login-olvido-${String(ancho)}.png` })
    } finally {
      await ctx.close()
    }
  }
}
void main()
