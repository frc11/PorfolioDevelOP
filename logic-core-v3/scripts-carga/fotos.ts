/**
 * [F1–F5] FOTOS DEL SITIO, PARA MIRAR — una ruta a un ancho, una secuencia de acciones y una captura en cada `foto`. Contra el dev server,
 * con el Chrome del sistema a la vista (como `matriz.ts`) y `/api/` bloqueado. Escribe en `~/.cache/b4-medicion/fotos/`.
 *
 *   RUTA='/v3#quienes-somos' ANCHO=1440 ALTO=900 PASOS='rueda:500*5,espera:3500,foto:garage' npx tsx scripts-carga/fotos.ts
 *
 * Los pasos, separados por coma: `rueda:<px>[*<veces>]` (una muesca cada 50 ms), `espera:<ms>`, `foto:<nombre>`, `px:<px de la regla del
 * Portfolio>` (un salto del scroll nativo), `tap:<x>/<y>`, `tecla:<tecla>` y `mouse:<x>/<y>`. `MOVIL=1`: táctil.
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const RUTA = process.env.RUTA ?? '/v3'
const ANCHO = Number(process.env.ANCHO ?? '1440')
const ALTO = Number(process.env.ALTO ?? '900')
const MOVIL = process.env.MOVIL === '1'
const PASOS = (process.env.PASOS ?? 'foto:inicio').split(',').map((p) => p.trim()).filter((p) => p !== '')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/fotos')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/fotos-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    isMobile: MOVIL,
    hasTouch: MOVIL,
    args: ['--force_high_performance_gpu', `--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    const cdp = await ctx.newCDPSession(p)
    await cdp.send('Network.enable')
    await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
    const separador = RUTA.includes('?') ? '&' : '?'
    const [camino, hash = ''] = RUTA.split('#')
    await p.goto(`${BASE}${camino ?? ''}${camino?.includes('?') === true ? '' : separador}diag=carga${hash === '' ? '' : `#${hash}`}`, { waitUntil: 'load', timeout: 240000 })
    const t0 = Date.now()
    while (Date.now() - t0 < 60000) {
      const lista = await p.evaluate(() => (window as unknown as { __v3diag?: { pulso: () => { escenaLista: boolean } } }).__v3diag?.pulso().escenaLista === true).catch(() => false)
      if (lista) break
      await dormir(250)
    }
    await dormir(3000)
    await p.mouse.move(ANCHO * 0.2, ALTO * 0.55)
    for (const paso of PASOS) {
      const [accion = '', valor = ''] = paso.split(':')
      if (accion === 'rueda') {
        const [px = '100', veces = '1'] = valor.split('*')
        for (let k = 0; k < Number(veces); k++) {
          await p.mouse.wheel(0, Number(px))
          await dormir(50)
        }
      } else if (accion === 'espera') await dormir(Number(valor))
      else if (accion === 'tecla') await p.keyboard.press(valor)
      else if (accion === 'mouse') {
        const [x = '0', y = '0'] = valor.split('/')
        await p.mouse.move(Number(x), Number(y), { steps: 4 })
      } else if (accion === 'tap') {
        const [x = '0', y = '0'] = valor.split('/')
        await p.touchscreen.tap(Number(x), Number(y))
      } else if (accion === 'px') {
        await p.evaluate((x) => {
          const panel = document.querySelector('[data-panel="trabajos"]')
          if (panel === null) return
          const tope = panel.getBoundingClientRect().top + scrollY
          window.scrollTo({ top: tope - innerHeight + (x * innerHeight) / 900, behavior: 'instant' })
        }, Number(valor))
      } else if (accion === 'foto') {
        const archivo = path.join(SALIDA, `${valor}-${String(ANCHO)}.png`)
        await p.screenshot({ path: archivo })
        const estado = await p.evaluate(() => {
          const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
          return `paso ${e?.getAttribute('data-paso') ?? '?'} · panel ${e?.getAttribute('data-panel-adentro') ?? '?'} · barra ${e?.getAttribute('data-barra') ?? '?'} · y ${String(Math.round(scrollY))}`
        })
        console.log(`${archivo} · ${estado}`)
      }
    }
  } finally {
    await ctx.close()
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
