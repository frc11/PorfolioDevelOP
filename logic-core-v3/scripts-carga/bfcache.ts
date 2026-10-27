/**
 * [B12a.8 · P-H35] LA PÁGINA QUE VUELVE DEL BFCACHE — contra el BUILD (el dev no entra al bfcache: su socket de recarga lo impide), con
 * el Chrome del sistema a la vista y el bfcache prendido (Playwright lo apaga por defecto). Sin interceptar la red (la intercepción también
 * lo apaga): se cuenta que ningún pedido vaya a `/api/`.
 *
 *   la página base, con la intro a medio camino (la luz de la variante arriba) → la salida de la variante (como la pide una navegación) y
 *   una navegación que CAMBIA DE DOCUMENTO (la de servicios: la raíz que vuelve a apretar el enlace con recarga) → ATRÁS
 *
 * El criterio: la página vuelve del bfcache (`pageshow` con `persisted`) y la variante vuelve a su avance (no queda `saliendo`, y la luz de
 * abajo vuelve a la del scroll de ahora, la de antes de irse), con el velo quieto.
 *
 *   BASE=http://localhost:3004 npx tsx scripts-carga/bfcache.ts          (CONTROL=sin-bfcache: la ranura no escucha el bfcache)
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3004'
const CONTROL = process.env.CONTROL ?? ''
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

type EstadoDeLaRanura = { readonly id: string | null; readonly saliendo: boolean; readonly energia: number } | null

async function main(): Promise<void> {
  const perfil = perfilDelBanco('bfcache')
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    ignoreDefaultArgs: ['--disable-back-forward-cache'],
    args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  let bien = false
  try {
    await ctx.addInitScript(`(() => {
      window.__name = window.__name || ((f) => f)
      window.__entornoDeLaEscena = 'producto'
      window.__ranuraSinBfcache = ${CONTROL === 'sin-bfcache' ? 'true' : 'false'}
      try { sessionStorage.setItem('home:intro', '1') } catch (e) {}
      window.addEventListener('pageshow', (e) => { window.__vueltas = (window.__vueltas || []).concat(e.persisted ? 'bfcache' : 'carga') })
    })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    let alApi = 0
    p.on('request', (r) => {
      if (r.url().includes('/api/')) alApi += 1
    })
    await p.goto(`${BASE}/v3/pagina-base`, { waitUntil: 'load', timeout: 300000 })
    await dormir(6000)
    // La intro a medio camino: la variante enciende la luz de abajo en la primera mitad del avance.
    await p.mouse.move(720, 450)
    const alto = await p.evaluate(() => window.innerHeight)
    for (let i = 0; i < 60 && (await p.evaluate(() => window.scrollY)) < 0.9 * alto; i += 1) {
      await p.mouse.wheel(0, 120)
      await dormir(50)
    }
    await dormir(2500)
    const ranura = (): Promise<EstadoDeLaRanura> => p.evaluate(() => (window as unknown as { __ranuraDelBanco?: () => EstadoDeLaRanura }).__ranuraDelBanco?.() ?? null)
    const antes = await ranura()
    const avance = await p.evaluate(() => (window as unknown as { __avanceDeLaIntro?: () => number }).__avanceDeLaIntro?.() ?? Number.NaN)
    console.log(`·     antes de irse: avance ${avance.toFixed(3)}, la variante ${JSON.stringify(antes)}`)
    // La salida (como la pide una navegación) y una navegación que cambia de documento.
    await p.evaluate(async () => {
      await (window as unknown as { __pedirLaSalidaDelBanco?: () => Promise<void> }).__pedirLaSalidaDelBanco?.()
    })
    const alIrse = await ranura()
    console.log(`·     con la salida pedida: ${JSON.stringify(alIrse)}`)
    await p.evaluate(() => {
      window.location.href = '/v3/componentes'
    })
    await p.waitForURL('**/v3/componentes', { timeout: 120000 })
    await dormir(2500)
    // Una vuelta del bfcache no dispara `load`: se espera el commit.
    await p.goBack({ waitUntil: 'commit', timeout: 120000 })
    await dormir(2500)
    const vueltas = await p.evaluate(() => (window as unknown as { __vueltas?: string[] }).__vueltas ?? [])
    const despues = await ranura()
    const velo = await p.evaluate(() => document.querySelector('[data-pieza="velo-de-navegacion"]')?.getAttribute('data-fase') ?? '')
    const delBfcache = vueltas[vueltas.length - 1] === 'bfcache'
    const volvio = despues !== null && !despues.saliendo && antes !== null && Math.abs(despues.energia - antes.energia) < 0.02
    bien = delBfcache && volvio && velo === 'quieto' && alApi === 0
    console.log(`${delBfcache ? 'ok   ' : 'FALLA'} la página vuelve del bfcache (pageshow: ${vueltas.join(', ')})`)
    console.log(`${volvio ? 'ok   ' : 'FALLA'} la variante vuelve a su avance: ${JSON.stringify(despues)} (antes de irse, la luz en ${antes?.energia.toFixed(3) ?? '—'}; con la salida, ${alIrse?.energia.toFixed(3) ?? '—'})`)
    console.log(`${velo === 'quieto' ? 'ok   ' : 'FALLA'} el velo, ${velo}`)
    console.log(`${alApi === 0 ? 'ok   ' : 'FALLA'} pedidos a /api/: ${String(alApi)}`)
  } finally {
    await ctx.close()
  }
  console.log(`bfcache: ${bien ? 'en verde' : 'en rojo'}${CONTROL === '' ? '' : ` (CONTROL=${CONTROL})`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
