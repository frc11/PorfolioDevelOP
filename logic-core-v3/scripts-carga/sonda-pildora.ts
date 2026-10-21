/**
 * [B12a.8] SONDA: los avisos del velo y la píldora alrededor de una navegación (página → home con «Home»). Depuración, sin criterio.
 *
 *   npx tsx scripts-carga/sonda-pildora.ts
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/sonda-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
    args: ['--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  })
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    await p.goto(`${BASE}/v3/pagina-base`, { waitUntil: 'load', timeout: 300000 })
    await dormir(6000)
    await p.evaluate(() => {
      const log: string[] = ((window as unknown as { __sonda: string[] }).__sonda = [])
      const pill = (): string => {
        const el = document.querySelector('[data-pieza="barra"] [data-parte="pastilla"]')
        return el === null ? 'sin' : `${el.getBoundingClientRect().top.toFixed(0)} anim ${String(el.getAnimations().length)}`
      }
      const t0 = performance.now()
      for (const n of ['v3:velo-cubre', 'v3:velo-repuso']) window.addEventListener(n, () => log.push(`${(performance.now() - t0).toFixed(0)} ${n} pill ${pill()} nacimiento ${document.querySelector('[data-pieza="barra"]')?.getAttribute('data-nacimiento') ?? ''} reduce ${String(window.matchMedia('(prefers-reduced-motion: reduce)').matches)}`))
      const cuadro = (): void => {
        log.push(`${(performance.now() - t0).toFixed(0)} cuadro pill ${pill()} ${location.pathname}`)
        if (performance.now() - t0 < 4000) requestAnimationFrame(cuadro)
      }
      requestAnimationFrame(cuadro)
    })
    await p.locator('[data-pieza="barra"] [data-nav-id="hero"]').click()
    await dormir(4500)
    const log = await p.evaluate(() => (window as unknown as { __sonda: string[] }).__sonda)
    const avisos = log.filter((l) => l.includes('v3:'))
    const cuadros = log.filter((l) => !l.includes('v3:'))
    console.log(avisos.join('\n'))
    let ultimo = ''
    for (const c of cuadros) {
      const pill = c.split(' pill ')[1] ?? ''
      if (pill !== ultimo) console.log(c)
      ultimo = pill
    }
  } finally {
    await ctx.close()
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
