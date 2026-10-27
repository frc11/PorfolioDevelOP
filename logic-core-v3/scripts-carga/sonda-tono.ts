/**
 * [B12a.8] SONDA: lo que la lectura del tono del velo encuentra en cada uno de sus cinco puntos (`tonoDeLoQueTapa.ts`), en la página base
 * con el scroll en el papel del cuerpo. Depuración, sin criterio.
 *
 *   npx tsx scripts-carga/sonda-tono.ts
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  const perfil = perfilDelBanco('sonda-tono')
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
    await dormir(5000)
    await p.mouse.move(720, 450)
    for (let i = 0; i < 22; i += 1) {
      await p.mouse.wheel(0, 120)
      await dormir(40)
    }
    await dormir(1800)
    const lectura = await p.evaluate(() =>
      [
        [0.5, 0.5],
        [0.25, 0.25],
        [0.75, 0.25],
        [0.25, 0.75],
        [0.75, 0.75],
      ].map(([fx = 0, fy = 0]) => {
        const lista = document.elementsFromPoint(fx * innerWidth, fy * innerHeight).slice(0, 6)
        return `${fx}/${fy}: ${lista.map((el) => `${el.tagName.toLowerCase()}${el.getAttribute('data-pieza') ? `[${el.getAttribute('data-pieza') ?? ''}]` : ''}${el.getAttribute('data-parte') ? `(${el.getAttribute('data-parte') ?? ''})` : ''} ${getComputedStyle(el).backgroundColor}`).join(' > ')}`
      }),
    )
    console.log(`scroll ${String(await p.evaluate(() => Math.round(scrollY)))}`)
    console.log(lectura.join('\n'))
    const caja = await p.locator('[data-pieza="barra"] [data-nav-id="trabajos"]').boundingBox()
    await p.mouse.move((caja?.x ?? 0) + (caja?.width ?? 0) / 2, (caja?.y ?? 0) + (caja?.height ?? 0) / 2)
    await dormir(300)
    console.log(`antes del clic: scroll ${String(await p.evaluate(() => Math.round(scrollY)))}`)
    await p.mouse.down()
    await p.mouse.up()
    for (let i = 0; i < 8; i += 1) {
      await dormir(80)
      console.log(
        await p.evaluate(() => {
          const v = document.querySelector('[data-pieza="velo-de-navegacion"]')
          return `fase ${v?.getAttribute('data-fase') ?? ''} color ${v?.getAttribute('data-color') ?? ''} scroll ${String(Math.round(scrollY))}`
        }),
      )
    }
  } finally {
    await ctx.close()
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
