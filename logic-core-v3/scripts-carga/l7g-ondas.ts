/**
 * [L7g · 8] LAS ONDAS DEL SONIDO, EN EL NAVEGADOR: sólo con el preloader en pantalla. Un observador del DOM (instalado antes de que cargue
 * nada) anota cada vez que aparece una onda del preloader (`onda-del-pulso`, el control positivo: el observador sí las ve) o el latido de la
 * entrada de L8b/L9b (`latido-de-la-entrada`, el que L7d apagó con `fueraDelPreloader: false`). A 1440 (el latido sólo existe desde 1024).
 *
 *   A · carga normal, primer ingreso del día (sin la siembra de los bancos): hay preloader y sus ondas; el latido, ninguno;
 *   B · recarga dura (F5): no hay preloader ni ondas ni latido;
 *   C · otra carga normal el mismo día: tampoco;
 *   D · navegación interna (un enlace del pie a otra página, con el velo): ninguno.
 *
 *   npx tsx scripts-carga/l7g-ondas.ts
 */
import { rmSync } from 'node:fs'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const OBSERVADOR = `(() => {
  window.__name = window.__name || ((f) => f)
  window.__preloaderDelBanco = 'normal'
  const cuenta = { ondasDelPreloader: 0, latidos: 0, preloaderVisto: false }
  window.__cuentaDeOndas = cuenta
  const mirar = (n) => {
    if (!(n instanceof Element)) return
    const dentro = (s) => (n.matches(s) ? 1 : 0) + n.querySelectorAll(s).length
    cuenta.ondasDelPreloader += dentro('[data-parte="onda-del-pulso"]')
    cuenta.latidos += dentro('[data-pieza="latido-de-la-entrada"]')
  }
  const o = new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) mirar(n) })
  const arrancar = () => { o.observe(document.documentElement, { childList: true, subtree: true }); mirar(document.documentElement) }
  if (document.documentElement) arrancar(); else document.addEventListener('readystatechange', arrancar, { once: true })
  setInterval(() => {
    cuenta.ondasDelPreloader = Math.max(cuenta.ondasDelPreloader, document.querySelectorAll('[data-parte="onda-del-pulso"]').length)
    cuenta.latidos = Math.max(cuenta.latidos, document.querySelectorAll('[data-pieza="latido-de-la-entrada"]').length)
    if (window.__preloaderDelSitio && window.__preloaderDelSitio.activo) cuenta.preloaderVisto = true
  }, 50)
})()`

interface Cuenta { readonly ondasDelPreloader: number; readonly latidos: number; readonly preloaderVisto: boolean; readonly visible: boolean; readonly ancho: number; readonly url: string }

const leer = (p: Page): Promise<Cuenta> =>
  p.evaluate(() => {
    const c = (window as unknown as { __cuentaDeOndas?: { ondasDelPreloader: number; latidos: number; preloaderVisto: boolean } }).__cuentaDeOndas
    return { ondasDelPreloader: c?.ondasDelPreloader ?? -1, latidos: c?.latidos ?? -1, preloaderVisto: c?.preloaderVisto ?? false, visible: document.visibilityState === 'visible', ancho: innerWidth, url: location.pathname }
  })

async function main(): Promise<void> {
  const perfil = perfilDelBanco('l7g-ondas')
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
  })
  const fallas: string[] = []
  const linea = (nombre: string, c: Cuenta, espera: { preloader: boolean; ondas: boolean }): void => {
    const bien = c.visible && c.ancho === 1440 && c.latidos === 0 && c.preloaderVisto === espera.preloader && (espera.ondas ? c.ondasDelPreloader > 0 : c.ondasDelPreloader === 0)
    console.log(`${bien ? 'ok   ' : 'FALLA'} ${nombre} · ${c.url} · ancho ${String(c.ancho)} · preloader ${c.preloaderVisto ? 'sí' : 'no'} · ondas del preloader ${String(c.ondasDelPreloader)} · latidos de la entrada ${String(c.latidos)}${c.visible ? '' : ' · PESTAÑA OCULTA'}`)
    if (!bien) fallas.push(nombre)
  }
  try {
    await ctx.addInitScript(OBSERVADOR)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    // A · el primer ingreso del día: el preloader dura hasta ~20 s como tope; se mira 30 s.
    await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
    await p.mouse.move(720, 450)
    await dormir(30000)
    linea('A · carga normal (primer ingreso del día)', await leer(p), { preloader: true, ondas: true })
    // B · recarga dura.
    await p.reload({ waitUntil: 'load', timeout: 300000 })
    await dormir(9000)
    linea('B · recarga dura', await leer(p), { preloader: false, ondas: false })
    // C · otra carga normal, el mismo día.
    await p.goto(`${BASE}/v3/nosotros`, { waitUntil: 'load', timeout: 300000 })
    await dormir(9000)
    linea('C · carga normal del mismo día', await leer(p), { preloader: false, ondas: false })
    // D · navegación interna: un enlace del pie (con el velo), sin recargar el documento.
    await p.evaluate(() => { (window as unknown as { __sinRecarga?: boolean }).__sinRecarga = true })
    const enlace = p.locator('[aria-label="Páginas"] a[href="/v3/portfolio"]').first()
    await enlace.scrollIntoViewIfNeeded({ timeout: 20000 })
    await dormir(1500)
    await enlace.click({ timeout: 20000 })
    await dormir(9000)
    const d = await leer(p)
    const sinRecarga = await p.evaluate(() => (window as unknown as { __sinRecarga?: boolean }).__sinRecarga === true)
    console.log(`     (D navegó a ${d.url}; el documento ${sinRecarga ? 'no se recargó' : 'SE RECARGÓ: no es navegación interna'})`)
    linea('D · navegación interna', d, { preloader: false, ondas: false })
    if (!sinRecarga || d.url !== '/v3/portfolio') fallas.push('D · no fue una navegación interna')
  } finally {
    await ctx.close()
    rmSync(perfil, { recursive: true, force: true })
  }
  console.log(fallas.length === 0 ? '\n4 de 4 en verde' : `\nFALLAN: ${fallas.join(' | ')}`)
  process.exit(fallas.length === 0 ? 0 : 1)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
