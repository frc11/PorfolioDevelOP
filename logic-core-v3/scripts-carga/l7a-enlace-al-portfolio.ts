/**
 * [L7a] EL ENLACE AL PORTFOLIO DE DESARROLLO WEB — «Ver el portfolio» (Cómo trabajamos) era un `<a>` con recarga y ahora es `EnlaceDeRuta`
 * (el velo, la salida de la variante, la navegación cliente). Que llegue al home EN el caso (`#portfolio-el-garage`): a 1440, con el Chrome
 * del sistema a la vista y `/api/` bloqueado, la página, el enlace a la vista, un clic, y dónde quedó (la ruta, el hash y si el ancla del
 * caso está en el cuadro).
 *
 *   npx tsx scripts-carga/l7a-enlace-al-portfolio.ts
 */
import { rmSync } from 'node:fs'

import { chromium } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  const perfil = perfilDelBanco('l7a-enlace')
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: 1440, height: 900 },
    args: ['--force_high_performance_gpu', '--window-size=1460,1000', '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  let bien = false
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    await p.goto(`${BASE}/v3/paginas-web`, { waitUntil: 'load', timeout: 300000 })
    await dormir(5000)
    const enlace = p.locator('[data-bloque="proceso"] a[data-pieza="cta"]').first()
    await enlace.scrollIntoViewIfNeeded()
    await dormir(1500)
    const href = await enlace.getAttribute('href')
    await enlace.click()
    await p.waitForURL('**/v3#portfolio-el-garage', { timeout: 20000 }).catch(() => undefined)
    await dormir(6000)
    const llegada = await p.evaluate(() => {
      const ancla = document.getElementById('portfolio-el-garage')
      const r = ancla?.getBoundingClientRect()
      return { ruta: location.pathname, hash: location.hash, ancla: ancla !== null, enElCuadro: r !== undefined && r.top < innerHeight && r.bottom > 0, scrollY: Math.round(scrollY) }
    })
    bien = href === '/v3#portfolio-el-garage' && llegada.ruta === '/v3' && llegada.hash === '#portfolio-el-garage' && llegada.enElCuadro
    console.log(`${bien ? 'ok   ' : 'FALLA'} «Ver el portfolio» (${String(href)}) → ${llegada.ruta}${llegada.hash} · el ancla ${llegada.ancla ? 'existe' : 'NO existe'} y ${llegada.enElCuadro ? 'está en el cuadro' : 'NO está en el cuadro'} · scrollY ${String(llegada.scrollY)}`)
  } finally {
    await ctx.close()
    rmSync(perfil, { recursive: true, force: true })
  }
  process.exit(bien ? 0 : 1)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
