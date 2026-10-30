/**
 * [L7g · 2 y 3] LOS ENLACES NUEVOS DEL HOME, EN EL NAVEGADOR: «Conocé más sobre nosotros» (final de Quiénes somos) y «Ver todos los trabajos»
 * (encabezado de Portfolio). Por ancho: se baja con la rueda hasta que el enlace se ve (visible, opaco y en el cuadro), se saca la foto, se
 * comprueba que el clic le cae a él (lo que hay en su centro es el propio enlace, no una capa de encima) y se hace clic: tiene que llegar a la
 * página sin recargar el documento (el velo). Desde 1025 también: Privacidad y Términos del pie 3D (visibles, con su clic y su destino).
 *
 *   ANCHOS=1440x900,390x844 npx tsx scripts-carga/l7g-enlaces.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,768x1024,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const FOTOS = process.env.FOTOS ?? 'C:\\nocturno\\cola3-fotos\\L7\\enlaces'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Estado { readonly hay: boolean; readonly visible: boolean; readonly opaco: boolean; readonly enElCuadro: boolean; readonly alcanzable: boolean; readonly texto: string }

const estadoDe = (p: Page, selector: string): Promise<Estado> =>
  p.evaluate((sel) => {
    const a = document.querySelector<HTMLElement>(sel)
    if (a === null) return { hay: false, visible: false, opaco: false, enElCuadro: false, alcanzable: false, texto: '' }
    const r = a.getBoundingClientRect()
    let opaco = true
    for (let e: HTMLElement | null = a; e !== null; e = e.parentElement) {
      const c = getComputedStyle(e)
      if (Number(c.opacity) < 0.95 || c.visibility === 'hidden' || c.display === 'none') opaco = false
    }
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const enElCuadro = r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth
    const encima = enElCuadro ? document.elementFromPoint(cx, cy) : null
    return { hay: true, visible: r.width > 0 && r.height > 0, opaco, enElCuadro, alcanzable: encima !== null && (encima === a || a.contains(encima)), texto: (a.textContent ?? '').trim() }
  }, selector)

/** Baja con la rueda hasta que el enlace se ve entero, opaco y alcanzable (o se acaba el documento). `alFondo`: a saltos hasta el pie y se espera a que la escena lo arme. */
async function bajarHasta(p: Page, selector: string, ancho: number, alto: number, alFondo: boolean): Promise<Estado> {
  await p.mouse.move(ancho / 2, alto / 2)
  if (alFondo) {
    const fondo = await p.evaluate(() => document.documentElement.offsetHeight - innerHeight)
    for (let y = 0; y < fondo; y += alto / 2) {
      await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
      await dormir(120)
    }
    await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), fondo)
    await dormir(12000)
    return estadoDe(p, selector)
  }
  let e = await estadoDe(p, selector)
  for (let i = 0; i < 400; i++) {
    if (e.hay && e.visible && e.opaco && e.enElCuadro && e.alcanzable) {
      await dormir(1200)
      e = await estadoDe(p, selector)
      if (e.opaco && e.enElCuadro && e.alcanzable) return e
    }
    const hasta = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)
    if (hasta <= 2) break
    await p.mouse.wheel(0, 220)
    await dormir(140)
    e = await estadoDe(p, selector)
  }
  return e
}

async function main(): Promise<void> {
  mkdirSync(FOTOS, { recursive: true })
  const fallas: string[] = []
  for (const [ancho, alto] of ANCHOS) {
    const perfil = perfilDelBanco('l7g-enlaces')
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
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const consola: string[] = []
      p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|net::/.test(m.text())) consola.push(m.text().slice(0, 200)) })
      p.on('pageerror', (e) => consola.push(`pageerror: ${e.message.slice(0, 200)}`))
      const pruebas: readonly { readonly nombre: string; readonly selector: string; readonly ruta: string; readonly desde?: number }[] = [
        { nombre: 'quienes-somos', selector: '[data-panel="quienes-somos"] [data-pieza="enlace-discreto"]', ruta: '/v3/nosotros' },
        { nombre: 'portfolio', selector: '[data-parte="enlace-del-portfolio"] [data-pieza="enlace-discreto"]', ruta: '/v3/portfolio' },
        { nombre: 'pie-privacidad', selector: '[data-pieza="legales-del-pie"] a[href="/v3/privacidad"]', ruta: '/v3/privacidad', desde: 1025 },
        { nombre: 'pie-terminos', selector: '[data-pieza="legales-del-pie"] a[href="/v3/terminos"]', ruta: '/v3/terminos', desde: 1025 },
      ]
      for (const prueba of pruebas) {
        if (prueba.desde !== undefined && ancho < prueba.desde) continue
        await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
        await p.waitForSelector('[data-pantalla]', { state: 'attached', timeout: 120000 }).catch(() => undefined)
        await dormir(5000)
        await p.evaluate(() => { (window as unknown as { __sinRecarga?: boolean }).__sinRecarga = true })
        consola.length = 0
        const e = await bajarHasta(p, prueba.selector, ancho, alto, prueba.nombre.startsWith('pie-'))
        const foto = path.join(FOTOS, `${prueba.nombre}-${String(ancho)}.png`)
        await p.screenshot({ path: foto })
        let llego = false
        let sinRecarga = false
        if (e.enElCuadro && e.alcanzable) {
          await p.locator(prueba.selector).first().click({ timeout: 15000 }).catch(() => undefined)
          await p.waitForURL(`**${prueba.ruta}`, { timeout: 20000 }).catch(() => undefined)
          await dormir(2500)
          llego = new URL(p.url()).pathname === prueba.ruta
          sinRecarga = await p.evaluate(() => (window as unknown as { __sinRecarga?: boolean }).__sinRecarga === true)
        }
        const bien = e.hay && e.visible && e.opaco && e.enElCuadro && e.alcanzable && llego && sinRecarga && consola.length === 0
        console.log(`${bien ? 'ok   ' : 'FALLA'} ${prueba.nombre} · ${String(ancho)} · «${e.texto}» · se ve ${e.opaco && e.enElCuadro ? 'sí' : 'NO'} · el clic le cae ${e.alcanzable ? 'sí' : 'NO'} · llegó a ${prueba.ruta} ${llego ? 'sí' : 'NO'} · sin recargar ${sinRecarga ? 'sí' : 'NO'} · consola ${consola.length === 0 ? 'limpia' : JSON.stringify(consola)} · ${foto}`)
        if (!bien) fallas.push(`${prueba.nombre}@${String(ancho)}`)
      }
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
    }
  }
  console.log(fallas.length === 0 ? '\ntodo en verde' : `\nFALLAN: ${fallas.join(' | ')}`)
  process.exit(fallas.length === 0 ? 0 : 1)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
