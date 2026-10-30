/**
 * [L7g] FOTOS DEL PIE a varios anchos: el de una página (`PIE_DE=nosotros`) o el del home (`PIE_DE=home`). Deja el cuadro del pie, quieto,
 * en `FOTOS/<PIE_DE>/<ancho>-pie.png` y escribe dónde quedó el logo (el lienzo no se lee: se mira la foto).
 *
 *   PIE_DE=nosotros ANCHOS=390x844,768x1024,1024x768,1440x900 npx tsx scripts-carga/l7g-pie.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { chromium } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const PIE_DE = process.env.PIE_DE ?? 'nosotros'
const ANCHOS = (process.env.ANCHOS ?? '390x844,768x1024,1024x768,1440x900').split(',').map((a) => a.split('x').map(Number) as [number, number])
const FOTOS = process.env.FOTOS ?? 'C:\\nocturno\\cola3-fotos\\L7\\pie'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  const carpeta = path.join(FOTOS, PIE_DE)
  mkdirSync(carpeta, { recursive: true })
  for (const [ancho, alto] of ANCHOS) {
    const perfil = perfilDelBanco('l7g-pie')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
    })
    try {
      // OCULTAR: un selector que se esconde desde el primer cuadro (para comparar el pie con y sin una pieza, en el mismo estado).
      if (process.env.OCULTAR !== undefined) await ctx.addInitScript(`document.addEventListener('DOMContentLoaded', () => { const e = document.createElement('style'); e.textContent = ${JSON.stringify(`${process.env.OCULTAR} { display: none !important }`)}; document.head.appendChild(e) })`)
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3${PIE_DE.startsWith('home') ? '' : `/${PIE_DE}`}`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(6000)
      // El home monta sus secciones cuando la compuerta abre (la escena lista): se espera a que haya pantallas.
      if (PIE_DE === 'home' || process.env.SELECTOR !== undefined) await p.waitForSelector('[data-pantalla]', { state: 'attached', timeout: 120000 }).catch(() => undefined)
      await dormir(1500)
      const fondo = await p.evaluate(() => document.documentElement.offsetHeight - innerHeight)
      // Se llega al pie bajando de a pasos (el scroll saltado no corre la coreografía del cierre igual que el real).
      for (let y = 0; y < fondo; y += alto / 2) {
        await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
        await dormir(120)
      }
      const selector = process.env.SELECTOR
      if (selector !== undefined) {
        // Un tramo del home: su caja al final del cuadro (`BLOQUE`: start | center | end), bajando de a pasos hasta ahí.
        const y = await p.evaluate(([s2, b]) => {
          const r = document.querySelector(s2)?.getBoundingClientRect()
          if (r === undefined) return -1
          const arriba = r.top + scrollY
          return b === 'end' ? r.bottom + scrollY - innerHeight : b === 'center' ? arriba + r.height / 2 - innerHeight / 2 : arriba
        }, [selector, process.env.BLOQUE ?? 'end'] as const)
        if (y < 0) throw new Error(`no hay ${selector}; ids: ${await p.evaluate(() => [...document.querySelectorAll("[id]")].map((e) => e.id).slice(0, 60).join(" "))} · paneles: ${await p.evaluate(() => [...document.querySelectorAll("[data-panel]")].map((e) => e.getAttribute("data-panel")).join(" "))}`)
        for (let t = 0; t < y; t += alto / 4) {
          await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), t)
          await dormir(150)
        }
        await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
      } else if (PIE_DE !== 'home') {
        // El pie de una página: su pantalla arriba del cuadro.
        await p.evaluate(() => document.querySelector('[data-parte="pie-del-cierre"]')?.scrollIntoView({ block: 'start', behavior: 'instant' }))
      } else {
        await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), fondo)
      }
      await dormir(Number(process.env.ESPERA ?? '4000'))
      const archivo = path.join(carpeta, `${String(ancho)}-pie${process.env.SUFIJO ?? ''}.png`)
      await p.screenshot({ path: archivo })
      console.log(`${PIE_DE} ${String(ancho)}×${String(alto)} · innerWidth ${String(await p.evaluate(() => innerWidth))} · ${archivo}`)
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
