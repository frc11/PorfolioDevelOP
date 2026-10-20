/**
 * [B12a.5] LA NAVBAR EN LAS PÁGINAS, EN EL SITIO — el Chrome del sistema a la vista contra el dev, `/api/` bloqueado. Mide:
 *
 *   1 · la píldora igual en el home y en una página (1440): su caja al cargar arriba y pegada después de scrollear (±0,5 px);
 *   2 · el desplegable de «Servicios» (1440, en la página): el hover con intención (no abre de paso; abre quieto encima), el clic, Enter
 *       con el foco adentro, el orden del Tab (de la lista al ítem siguiente de la píldora; Shift+Tab vuelve), Esc con el foco de vuelta;
 *   3 · el contraste de sus ítems (las dos capturas de `contraste.ts`: AA, 4,5:1);
 *   4 · el acordeón de «Servicios» en el menú del teléfono (390): abre, sus ítems y su contraste.
 *
 * Fotos en `~/.cache/b4-medicion/barra/`.
 *   BASE=http://localhost:3002 npx tsx scripts-carga/barra.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

import { TRANSPARENTE, medirLaPieza, type Medida } from './contraste'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/barra')
const PAGINA = '/v3/prueba-de-pagina'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const fallas: string[] = []
const ver = (bien: boolean, que: string, detalle = ''): void => {
  console.log(`${bien ? 'ok   ' : 'FALLA'} ${que}${detalle === '' ? '' : ` — ${detalle}`}`)
  if (!bien) fallas.push(que)
}

async function abrir(ancho: number, alto: number, movil: boolean): Promise<{ readonly p: Page; readonly cerrar: () => Promise<void> }> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/barra-perfil-${String(Date.now())}`)
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
  await ctx.addInitScript(`try { sessionStorage.setItem('home:intro', '1') } catch (e) {}`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  return { p, cerrar: () => ctx.close() }
}

async function cargar(p: Page, ruta: string): Promise<void> {
  await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
  await dormir(6000)
  await p.evaluate((css) => {
    const s = document.createElement('style')
    s.textContent = css
    document.head.appendChild(s)
  }, TRANSPARENTE)
}

const cajaDeLaPildora = (p: Page): Promise<{ x: number; y: number; ancho: number; alto: number }> =>
  p.evaluate(() => {
    const r = document.querySelector('[data-pieza="barra"] > [data-parte="pastilla"]')?.getBoundingClientRect()
    return { x: r?.left ?? Number.NaN, y: r?.top ?? Number.NaN, ancho: r?.width ?? Number.NaN, alto: r?.height ?? Number.NaN }
  })
const abierto = (p: Page): Promise<string | null> => p.evaluate(() => document.querySelector('[aria-controls="desplegable-de-servicios"]')?.getAttribute('aria-expanded') ?? null)
const activo = (p: Page): Promise<string> =>
  p.evaluate(() => {
    const a = document.activeElement
    return a === null ? 'null' : `${a.tagName.toLowerCase()}${a.getAttribute('data-nav-id') !== null ? `[${a.getAttribute('data-nav-id') ?? ''}]` : ''}${a.textContent !== null ? ` «${a.textContent.trim().slice(0, 30)}»` : ''}`
  })

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  // 1 · La píldora, igual en el home y en la página.
  {
    const { p, cerrar } = await abrir(1440, 900, false)
    const cajas: Record<string, { x: number; y: number; ancho: number; alto: number }> = {}
    for (const ruta of ['/v3', PAGINA]) {
      await cargar(p, ruta)
      cajas[`${ruta} arriba`] = await cajaDeLaPildora(p)
      await p.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }))
      await dormir(1500)
      cajas[`${ruta} pegada`] = await cajaDeLaPildora(p)
    }
    for (const momento of ['arriba', 'pegada']) {
      const h = cajas[`/v3 ${momento}`]
      const g = cajas[`${PAGINA} ${momento}`]
      const d = h === undefined || g === undefined ? Number.NaN : Math.max(Math.abs(h.x - g.x), Math.abs(h.y - g.y), Math.abs(h.ancho - g.ancho), Math.abs(h.alto - g.alto))
      ver(d <= 0.5, `1440 · la píldora ${momento}, home y página`, `home ${JSON.stringify(h)} · página ${JSON.stringify(g)} · Δ ${d.toFixed(2)} px`)
    }
    await cerrar()
  }

  // 2 y 3 · El desplegable, en la página.
  {
    const { p, cerrar } = await abrir(1440, 900, false)
    await cargar(p, PAGINA)
    const boton = p.locator('[aria-controls="desplegable-de-servicios"]')
    const caja = await boton.boundingBox()
    if (caja === null) throw new Error('sin «Servicios» en la barra')
    // El hover con intención: de paso (60 ms) no abre; quieto encima, sí; y el puntero que se va lo cierra.
    await p.mouse.move(caja.x - 40, caja.y + caja.height / 2)
    await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2, { steps: 2 })
    await dormir(60)
    await p.mouse.move(caja.x + caja.width + 80, caja.y + caja.height / 2, { steps: 2 })
    await dormir(300)
    ver((await abierto(p)) === 'false', 'el hover de paso no abre')
    await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2, { steps: 2 })
    await dormir(400)
    ver((await abierto(p)) === 'true', 'quieto encima, abre (hover con intención)')
    await p.screenshot({ path: path.join(SALIDA, '1440-desplegable-pagina.png') })
    // Contraste de los ítems abiertos.
    const medidas: Medida[] = []
    for (const el of await p.$$('[data-pieza="desplegable-enlace"]')) {
      const m = await medirLaPieza(p, el, 'desplegable')
      if (m !== null) medidas.push(m)
      await el.dispose()
    }
    for (const m of medidas) ver(m.p5 >= m.umbral, `AA · «${m.texto}»`, `p5 ${m.p5.toFixed(2)}:1 (mín ${m.minimo.toFixed(2)}, ${String(m.glifo)} px de glifo; umbral ${String(m.umbral)})`)
    await p.mouse.move(caja.x + caja.width / 2, 600, { steps: 4 })
    await dormir(600)
    ver((await abierto(p)) === 'false', 'abierto con el hover, el puntero que se va lo cierra')
    // El clic: abre y queda abierto aunque el puntero se vaya; un clic afuera lo cierra.
    await boton.click()
    await p.mouse.move(caja.x + caja.width / 2, 600, { steps: 4 })
    await dormir(600)
    ver((await abierto(p)) === 'true', 'con un clic queda abierto aunque el puntero se vaya')
    await p.mouse.click(700, 500)
    await dormir(300)
    ver((await abierto(p)) === 'false', 'un clic afuera lo cierra')
    // El teclado: Enter abre con el foco en el primero; Tab recorre la lista y sigue con «Panel»; Shift+Tab vuelve; Esc devuelve el foco.
    await boton.focus()
    await p.keyboard.press('Enter')
    await dormir(300)
    const primero = await activo(p)
    ver((await abierto(p)) === 'true' && primero.includes('Todos los servicios'), 'Enter abre y el foco entra a la lista', primero)
    const recorrido: string[] = [primero]
    for (let i = 0; i < 4; i++) {
      await p.keyboard.press('Tab')
      await dormir(120)
      recorrido.push(await activo(p))
    }
    ver(recorrido[4]?.includes('[tu-panel]') === true && (await abierto(p)) === 'false', 'Tab recorre la lista y desde el último sigue con «Panel» (y la lista se cierra)', recorrido.join(' → '))
    await p.keyboard.press('Shift+Tab')
    await dormir(120)
    const atras = await activo(p)
    ver(atras.includes('[servicios]'), 'Shift+Tab desde «Panel» vuelve a «Servicios»', atras)
    await p.keyboard.press('Enter')
    await dormir(300)
    await p.keyboard.press('Shift+Tab')
    await dormir(120)
    ver((await activo(p)).includes('[servicios]') && (await abierto(p)) === 'true', 'Shift+Tab desde el primero de la lista vuelve a «Servicios» (abierta)')
    await p.keyboard.press('Tab')
    await dormir(120)
    await p.keyboard.press('Escape')
    await dormir(300)
    const trasEsc = await activo(p)
    ver((await abierto(p)) === 'false' && trasEsc.includes('[servicios]'), 'Esc la cierra y el foco vuelve a «Servicios»', trasEsc)
    await cerrar()
  }

  // 4 · El acordeón del menú del teléfono.
  {
    const { p, cerrar } = await abrir(390, 844, true)
    await cargar(p, PAGINA)
    await p.locator('[aria-controls="menu-movil"]').first().click()
    await dormir(1500)
    const acordeon = p.locator('[aria-controls="acordeon-de-servicios"]')
    await acordeon.click()
    await dormir(900)
    const estado = await p.evaluate(() => ({
      expandido: document.querySelector('[aria-controls="acordeon-de-servicios"]')?.getAttribute('aria-expanded') ?? null,
      items: [...document.querySelectorAll('#acordeon-de-servicios a')].map((a) => `${a.getAttribute('data-parte') ?? ''}:${(a.textContent ?? '').trim()}→${a.getAttribute('href') ?? ''}`),
      alto: Math.round(document.querySelector('#acordeon-de-servicios')?.getBoundingClientRect().height ?? 0),
    }))
    ver(estado.expandido === 'true' && estado.items.length === 4 && estado.items.every((x) => x.startsWith('item-del-menu:')) && estado.alto > 100, '390 · el acordeón de «Servicios» abre con sus cuatro ítems (piezas del menú, con su destino)', JSON.stringify(estado))
    await p.screenshot({ path: path.join(SALIDA, '390-acordeon.png') })
    const medidas: Medida[] = []
    for (const el of await p.$$('#acordeon-de-servicios a')) {
      const m = await medirLaPieza(p, el, 'acordeon')
      if (m !== null) medidas.push(m)
      await el.dispose()
    }
    for (const m of medidas) ver(m.p5 >= m.umbral, `390 · AA · «${m.texto}»`, `p5 ${m.p5.toFixed(2)}:1 (umbral ${String(m.umbral)})`)
    await cerrar()
  }
  console.log(fallas.length === 0 ? 'barra: todo en verde' : `barra: ${String(fallas.length)} fallas`)
  if (fallas.length > 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
