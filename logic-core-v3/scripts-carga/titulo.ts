/**
 * [B12a.4] EL TÍTULO DE LAS PÁGINAS, EN EL SITIO — `/v3/prueba-de-pagina` con el Chrome del sistema a la vista: a 1440, las tres
 * combinaciones de `?titulo=` con un nombre de servicio (`?nombre=`); el título en volumen armado (el `h1` del DOM apagado, que es la
 * señal de la escena: `listo`), la caída con la intro en `CAIDA_DEL_TITULO.avance` y la vuelta; a 390, el `h1` del DOM a la vista, en
 * la cara de su combinación. Fotos en `~/.cache/b4-medicion/titulo/`.
 *
 *   BASE=http://localhost:3002 npx tsx scripts-carga/titulo.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/titulo')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Lo que dice el DOM del título: su texto, la opacidad de cada parte (0: la escena lo armó) y la familia que pinta. */
const delTitulo = (p: Page): Promise<{ texto: string; opacidad: string[]; familia: string[]; peso: string[] }> =>
  p.evaluate(() => {
    const h1 = document.querySelector('[data-intro-de-pagina] h1')
    const partes = [...document.querySelectorAll<HTMLElement>('[data-intro-de-pagina] h1 [data-parte^="titulo-"]')]
    return { texto: h1?.textContent ?? '', opacidad: partes.map((x) => getComputedStyle(x).opacity), familia: partes.map((x) => getComputedStyle(x).fontFamily.split(',')[0] ?? ''), peso: partes.map((x) => getComputedStyle(x).fontWeight) }
  })

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  for (const [ancho, alto, movil] of [[1440, 900, false], [390, 844, true]] as const) {
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/titulo-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      isMobile: movil,
      hasTouch: movil,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
    })
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    for (const combo of movil ? ['1'] : ['1', '2', '3']) {
      await p.goto(`${BASE}/v3/prueba-de-pagina?nombre=1&titulo=${combo}`, { waitUntil: 'load', timeout: 300000 })
      await dormir(7000)
      const arriba = await delTitulo(p)
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-titulo${combo}-arriba.png`) })
      console.log(`${String(ancho)} · ?titulo=${combo} · arriba: «${arriba.texto}» · partes ${arriba.familia.join(' + ')} (${arriba.peso.join('/')}) · opacidad del DOM ${arriba.opacidad.join('/')}`)
      if (movil) continue
      // La caída: la intro pasa la mitad (el papel ya entró) y vuelve.
      await p.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.5 * 0.62, behavior: 'instant' }))
      await dormir(400)
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-titulo${combo}-cayendo.png`) })
      await dormir(1500)
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-titulo${combo}-caido.png`) })
      await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await dormir(3500)
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-titulo${combo}-vuelta.png`) })
    }
    await ctx.close()
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
