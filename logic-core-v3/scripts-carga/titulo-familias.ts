/**
 * [B12a.8] LAS FAMILIAS DEL TÍTULO, EN EL SITIO — `/v3/pagina-base?nombre=<N>&titulo=1|2|3` a 1440 con el Chrome del sistema: lo que
 * pinta el DOM (familia y peso de cada parte), lo que la escena armó (la fuente de cada título del registro) y una foto recortada al
 * título, para comparar las combinaciones lado a lado. Fotos en `~/.cache/b4-medicion/titulo-familias/`.
 *
 *   BASE=http://localhost:3002 NOMBRE=6 npx tsx scripts-carga/titulo-familias.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const NOMBRE = process.env.NOMBRE ?? '6'
const RUTA = process.env.RUTA ?? '/v3/pagina-base'
const COMBOS = (process.env.COMBOS ?? '1,2,3').split(',')
const SALIDA = salidaDelBanco('titulo-familias')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const perfil = perfilDelBanco('titulo-familias')
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  for (const combo of COMBOS) {
    const sep = RUTA.includes('?') ? '&' : '?'
    await p.goto(`${BASE}${RUTA}${sep}nombre=${NOMBRE}&titulo=${combo}`, { waitUntil: 'load', timeout: 300000 })
    await dormir(8000)
    const datos = await p.evaluate(() => {
      const h1 = document.querySelector('[data-intro-de-pagina] h1')
      const partes = [...document.querySelectorAll<HTMLElement>('[data-intro-de-pagina] h1 [data-parte^="titulo-"]')]
      const caja = h1?.getBoundingClientRect()
      return {
        texto: h1?.textContent ?? '',
        dom: partes.map((x) => `${getComputedStyle(x).fontFamily.split(',')[0] ?? ''}/${getComputedStyle(x).fontWeight}/op ${getComputedStyle(x).opacity}`),
        caja: caja === undefined ? null : { x: caja.left, y: caja.top, w: caja.width, h: caja.height },
        visible: document.visibilityState,
      }
    })
    console.log(`?titulo=${combo} · «${datos.texto}» · DOM ${datos.dom.join(' | ')} · ${datos.visible}`)
    await p.screenshot({ path: path.join(SALIDA, `nombre${NOMBRE}-titulo${combo}.png`), clip: { x: 0, y: 0, width: 1440, height: 560 } })
    await p.evaluate(() => {
      document.querySelectorAll<HTMLElement>('[data-intro-de-pagina] h1 [data-parte^="titulo-"]').forEach((x) => x.style.setProperty('opacity', '1', 'important'))
    })
    await dormir(300)
    await p.screenshot({ path: path.join(SALIDA, `nombre${NOMBRE}-titulo${combo}-dom.png`), clip: { x: 0, y: 0, width: 1440, height: 560 } })
  }
  await ctx.close()
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
