/**
 * [L7g] LA 404 CONTRA EL LOGO: a cada ancho, dónde termina la caja de texto (`bajada`) y dónde empieza el logo (con el texto oculto, el borde
 * izquierdo de lo oscuro de la escena). La holgura es la diferencia; negativa = el texto pisa el logo.
 *
 *   ANCHOS=1025x700,1440x900 npx tsx scripts-carga/l7g-404.ts
 */
import { rmSync } from 'node:fs'

import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1025x700,1280x720,1440x900,1920x1080').split(',').map((a) => a.split('x').map(Number) as [number, number])
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  for (const [ancho, alto] of ANCHOS) {
    const perfil = perfilDelBanco('l7g-404')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      args: ['--force_high_performance_gpu', '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3/no-existe`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(6000)
      const caja = await p.evaluate(() => {
        const r = document.querySelector('[data-parte="bajada"]')?.getBoundingClientRect()
        const textos = [...document.querySelectorAll('[data-parte="bajada"] h1, [data-parte="bajada"] p, [data-parte="bajada"] a')].map((e) => e.getBoundingClientRect())
        return { cajaDer: r === undefined ? 0 : Math.round(r.right), textoDer: Math.round(Math.max(...textos.map((t) => t.right))) }
      })
      await p.addStyleTag({ content: '[data-intro-de-pagina] > div, [data-intro-de-pagina] > section { visibility: hidden !important }' })
      await dormir(800)
      const buffer = await p.screenshot()
      const { data, info } = await sharp(buffer).greyscale().raw().toBuffer({ resolveWithObject: true })
      let izq = info.width
      for (let y = Math.round(alto * 0.2); y < Math.round(alto * 0.85); y++) {
        for (let x = 0; x < izq; x++) {
          if (data[y * info.width + x] < 45) { izq = x; break }
        }
      }
      console.log(`${String(ancho)}×${String(alto)} · caja del texto hasta ${String(caja.cajaDer)} · el texto llega a ${String(caja.textoDer)} · el logo empieza en ${String(izq)} · holgura ${String(izq - caja.textoDer)} px (de la caja ${String(izq - caja.cajaDer)})`)
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
    }
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
