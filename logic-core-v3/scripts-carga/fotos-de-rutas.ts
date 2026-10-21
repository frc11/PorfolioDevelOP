/**
 * [B12a.8 · T3] FOTOS DE RUTAS, PARA LA PASADA VISUAL — cada ruta de `RUTAS` en cada ancho de `ANCHOS`, con el Chrome del sistema a la
 * vista, el banco de la escena y `/api/` bloqueado, el mouse quieto en el medio; en cada una, fotos en los scrolls de `SCROLLS` (en
 * pantallas) y la consola (errores, avisos y NaN). Fotos en `~/.cache/b4-medicion/fotos-de-rutas/`.
 *
 *   RUTAS=/v3,/v3/pagina-base ANCHOS=390x844,1070x800 SCROLLS=0,1.25,2.5 npx tsx scripts-carga/fotos-de-rutas.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const RUTAS = (process.env.RUTAS ?? '/v3/pagina-base').split(',')
const ANCHOS = (process.env.ANCHOS ?? '1440x900,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const SCROLLS = (process.env.SCROLLS ?? '0').split(',').map(Number)
const ESPERA = Number(process.env.ESPERA ?? '5000')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/fotos-de-rutas')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const nombreDe = (ruta: string): string => ruta.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'raiz'

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  for (const [ancho, alto] of ANCHOS) {
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/fotos-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const movil = ancho < 1024
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
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const consola: string[] = []
      p.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning' || /NaN/.test(m.text())) consola.push(`${m.type()}: ${m.text().slice(0, 220)}`)
      })
      p.on('pageerror', (e) => consola.push(`pageerror: ${e.message.slice(0, 220)}`))
      for (const ruta of RUTAS) {
        consola.length = 0
        await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
        await p.mouse.move(ancho / 2, alto / 2)
        await dormir(ESPERA)
        for (const s of SCROLLS) {
          const desde = await p.evaluate(() => window.scrollY)
          for (let i = 1; i <= 8; i += 1) {
            await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), desde + ((s * alto - desde) * i) / 8)
            await dormir(70)
          }
          await dormir(1800)
          await p.screenshot({ path: path.join(SALIDA, `${nombreDe(ruta)}-${String(ancho)}-${String(s)}.png`) })
        }
        console.log(`${ruta} · ${String(ancho)}×${String(alto)} · consola: ${consola.length === 0 ? 'limpia' : `\n    ${consola.join('\n    ')}`}`)
      }
    } finally {
      await ctx.close()
    }
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
