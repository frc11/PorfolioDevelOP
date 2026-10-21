/**
 * [B12a.5] LA NAVBAR EN LAS PÁGINAS, EN EL SITIO — el Chrome del sistema a la vista contra el dev o el build (`BASE`), `/api/` bloqueado.
 *
 * [B12a.8] Rehecho para la navbar de B12a.8 (el punto 3 y T2). Mide:
 *   1 · la píldora (1440): en el home nace abajo y sube al reposo; en una página nace ARRIBA, en el reposo del home (±0,5 px), y no se
 *       mueve con el scroll; con `?navbar=abajo`, la del home (para comparar). «Home» es el primero de la píldora;
 *   2 · el desplegable de «Servicios» (1440, en la página): «Servicios» es un enlace (al home, `#servicios`) y la lista abre aparte: el
 *       hover con intención (de paso no abre; quieto encima, sí; el puntero que se va la cierra), sus tres páginas sin «Todos los
 *       servicios», el contraste de sus ítems (AA), el clic en la flechita (queda abierta; un clic afuera la cierra), la flecha abajo en
 *       «Servicios» (abre con el foco adentro; Esc la cierra y el foco vuelve a «Servicios»), Enter en la flechita (abre con el foco
 *       adentro), el orden del Tab (la lista y después «Panel»; Shift+Tab vuelve a la flechita);
 *   3 · a dónde llevan (1440): «Servicios» desde la página → el home en su sección; «Home» desde la página → el home arriba; «Home» en el
 *       home, abajo → arriba. Los dos primeros, con el velo;
 *   4 · el menú del teléfono (390): «Home» primero; la fila de «Servicios» es un enlace y una flechita; la flechita abre el acordeón con
 *       las tres páginas (AA); tocar «Servicios» navega al home en su sección.
 *
 * Fotos en `~/.cache/b4-medicion/barra/`.
 *   BASE=http://localhost:3004 npx tsx scripts-carga/barra.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

import { TRANSPARENTE, medirLaPieza, type Medida } from './contraste'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/barra')
const PAGINA = '/v3/pagina-base'
const PAGINAS = ['Páginas web', 'Software a medida', 'IA y automatizaciones']
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
  await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  return { p, cerrar: () => ctx.close() }
}

async function cargar(p: Page, ruta: string, transparente = true): Promise<void> {
  await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
  await dormir(6000)
  if (!transparente) return
  await p.evaluate((css) => {
    const s = document.createElement('style')
    s.textContent = css
    document.head.appendChild(s)
  }, TRANSPARENTE)
}

/** Espera la ruta pedida con el velo quieto (destapado, después de haberlo visto moverse), y un respiro. */
async function llegar(p: Page, ok: (ruta: string) => boolean): Promise<boolean> {
  const t0 = Date.now()
  let visto = false
  while (Date.now() - t0 < 12000) {
    const e = await p.evaluate(() => ({ ruta: location.pathname + location.hash, fase: document.querySelector('[data-pieza="velo-de-navegacion"]')?.getAttribute('data-fase') ?? '' }))
    if (e.fase !== 'quieto') visto = true
    if (ok(e.ruta) && e.fase === 'quieto' && visto) break
    await dormir(60)
  }
  await dormir(2500)
  return visto
}

/** Un clic como una persona (el `click()` de Playwright lleva la pieza a la vista y, con la cabecera `sticky`, mueve el scroll). */
async function tocar(p: Page, selector: string): Promise<void> {
  const caja = await p.locator(selector).first().boundingBox()
  if (caja === null) throw new Error(`no está: ${selector}`)
  await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2)
  await dormir(250)
  await p.mouse.down()
  await p.mouse.up()
}

/** La rueda hasta pasar `y` px (Lenis manda el scroll: un `scrollTo` directo lo pisa), y quieto. */
async function rodar(p: Page, y: number): Promise<void> {
  await p.mouse.move(700, 450)
  for (let i = 0; i < 120 && (await p.evaluate(() => window.scrollY)) < y; i += 1) {
    await p.mouse.wheel(0, 120)
    await dormir(40)
  }
  await dormir(1800)
}

const cajaDeLaPildora = (p: Page): Promise<{ x: number; y: number; ancho: number; alto: number }> =>
  p.evaluate(() => {
    const r = document.querySelector('[data-pieza="barra"] > [data-parte="pastilla"]')?.getBoundingClientRect()
    return { x: r?.left ?? Number.NaN, y: r?.top ?? Number.NaN, ancho: r?.width ?? Number.NaN, alto: r?.height ?? Number.NaN }
  })
type Caja = Awaited<ReturnType<typeof cajaDeLaPildora>>
const delta = (a: Caja | undefined, b: Caja | undefined): number => (a === undefined || b === undefined ? Number.NaN : Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.ancho - b.ancho), Math.abs(a.alto - b.alto)))
const abierto = (p: Page): Promise<string | null> => p.evaluate(() => document.querySelector('[data-parte="abrir-servicios"]')?.getAttribute('aria-expanded') ?? null)
const activo = (p: Page): Promise<string> =>
  p.evaluate(() => {
    const a = document.activeElement
    if (a === null) return 'null'
    const id = a.getAttribute('data-nav-id') ?? a.getAttribute('data-parte')
    return `${a.tagName.toLowerCase()}${id !== null ? `[${id}]` : ''}${a.textContent !== null && a.textContent.trim() !== '' ? ` «${a.textContent.trim().slice(0, 30)}»` : ''}`
  })
const scrollY = (p: Page): Promise<number> => p.evaluate(() => Math.round(window.scrollY))
const topeDe = (p: Page, sel: string): Promise<number> => p.evaluate((s) => Math.round(document.querySelector(s)?.getBoundingClientRect().top ?? Number.NaN), sel)

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  // 1 · La píldora: abajo en el home, arriba en la página (en el reposo del home), quieta con el scroll; `?navbar=abajo`, la del home.
  {
    const { p, cerrar } = await abrir(1440, 900, false)
    const cajas: Record<string, Caja> = {}
    for (const ruta of ['/v3', PAGINA, `${PAGINA}?navbar=abajo`]) {
      await cargar(p, ruta)
      cajas[`${ruta} al cargar`] = await cajaDeLaPildora(p)
      if (ruta === PAGINA) await p.screenshot({ path: path.join(SALIDA, '1440-pagina-arriba.png') })
      if (ruta === `${PAGINA}?navbar=abajo`) await p.screenshot({ path: path.join(SALIDA, '1440-pagina-abajo.png') })
      await rodar(p, 1200)
      cajas[`${ruta} con scroll`] = await cajaDeLaPildora(p)
    }
    const home0 = cajas['/v3 al cargar']
    const homeArriba = cajas['/v3 con scroll']
    ver((home0?.y ?? 0) > 600 && (homeArriba?.y ?? 900) < 60, '1440 · en el home la píldora nace abajo y sube al reposo', `al cargar y ${String(home0?.y)} · con scroll y ${String(homeArriba?.y)}`)
    const d1 = delta(cajas[`${PAGINA} al cargar`], homeArriba)
    ver(d1 <= 0.5, '1440 · en la página nace arriba, en el reposo del home', `página ${JSON.stringify(cajas[`${PAGINA} al cargar`])} · home ${JSON.stringify(homeArriba)} · Δ ${d1.toFixed(2)} px`)
    const d2 = delta(cajas[`${PAGINA} al cargar`], cajas[`${PAGINA} con scroll`])
    ver(d2 <= 0.5, '1440 · en la página no se mueve con el scroll', `Δ ${d2.toFixed(2)} px`)
    const d3 = delta(cajas[`${PAGINA}?navbar=abajo al cargar`], home0)
    ver(d3 <= 0.5, '1440 · con ?navbar=abajo nace abajo, como en el home', `Δ ${d3.toFixed(2)} px`)
    const orden = await p.evaluate(() => [...document.querySelectorAll('[data-pieza="barra"] [data-parte="lista"] [data-nav-id]')].map((a) => (a.textContent ?? '').trim()))
    ver(orden[0] === 'Home', '1440 · «Home» es el primero de la píldora', orden.join(' · '))
    await cerrar()
  }

  // 2 · El desplegable, en la página.
  {
    const { p, cerrar } = await abrir(1440, 900, false)
    await cargar(p, PAGINA)
    const enlace = p.locator('[data-pieza="barra"] [data-nav-id="servicios"]')
    const flechita = p.locator('[data-pieza="barra"] [data-parte="abrir-servicios"]')
    const caja = await enlace.boundingBox()
    if (caja === null) throw new Error('sin «Servicios» en la barra')
    ver((await enlace.getAttribute('href')) === '/v3#servicios', '«Servicios» es un enlace a la sección del home', String(await enlace.getAttribute('href')))
    // El hover con intención: de paso (60 ms) no abre; quieto encima, sí; y el puntero que se va lo cierra.
    await p.mouse.move(caja.x - 40, caja.y + caja.height / 2)
    await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2, { steps: 2 })
    await dormir(60)
    await p.mouse.move(caja.x + caja.width / 2, caja.y + 300, { steps: 2 })
    await dormir(400)
    ver((await abierto(p)) === 'false', 'el hover de paso no abre')
    await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2, { steps: 2 })
    await dormir(450)
    ver((await abierto(p)) === 'true', 'quieto encima de «Servicios», abre (hover con intención)')
    await p.screenshot({ path: path.join(SALIDA, '1440-desplegable-pagina.png') })
    const items = await p.evaluate(() => [...document.querySelectorAll('[data-pieza="desplegable-enlace"]')].map((a) => (a.textContent ?? '').trim()))
    ver(JSON.stringify(items) === JSON.stringify(PAGINAS), 'la lista: las tres páginas, sin «Todos los servicios»', items.join(' · '))
    await p.mouse.move(caja.x + caja.width / 2, 600, { steps: 4 })
    await dormir(700)
    ver((await abierto(p)) === 'false', 'abierta con el hover, el puntero que se va la cierra')
    // El clic en la flechita: abre y queda abierta aunque el puntero se vaya; un clic afuera la cierra.
    const cf = await flechita.boundingBox()
    if (cf === null) throw new Error('sin la flechita')
    await p.mouse.move(cf.x + cf.width / 2, cf.y + cf.height / 2)
    await p.mouse.down()
    await p.mouse.up()
    await p.mouse.move(cf.x + cf.width / 2, 600, { steps: 4 })
    await dormir(700)
    ver((await abierto(p)) === 'true', 'con un clic en la flechita queda abierta aunque el puntero se vaya')
    // El contraste de sus ítems con la lista abierta y el mouse lejos (con el hover, el anillo del cursor de la sala queda encima).
    await dormir(800)
    const medidas: Medida[] = []
    for (const el of await p.$$('[data-pieza="desplegable-enlace"]')) {
      const m = await medirLaPieza(p, el, 'desplegable')
      if (m !== null) medidas.push(m)
      await el.dispose()
    }
    for (const m of medidas) ver(m.p5 >= m.umbral, `AA · «${m.texto}»`, `p5 ${m.p5.toFixed(2)}:1 (mín ${m.minimo.toFixed(2)}, ${String(m.glifo)} px de glifo; umbral ${String(m.umbral)})`)
    await p.mouse.click(700, 500)
    await dormir(400)
    ver((await abierto(p)) === 'false', 'un clic afuera la cierra')
    // La flecha abajo en «Servicios»: abre con el foco en la primera; Esc la cierra y el foco vuelve a «Servicios».
    await p.mouse.move(700, 600)
    await enlace.focus()
    await p.keyboard.press('ArrowDown')
    await dormir(350)
    const primeroFlecha = await activo(p)
    ver((await abierto(p)) === 'true' && primeroFlecha.includes(PAGINAS[0] ?? '-'), 'la flecha abajo en «Servicios» abre con el foco adentro', primeroFlecha)
    await p.keyboard.press('Escape')
    await dormir(350)
    const trasEsc = await activo(p)
    ver((await abierto(p)) === 'false' && trasEsc.includes('[servicios]'), 'Esc la cierra y el foco vuelve a «Servicios»', trasEsc)
    // Enter en la flechita: abre con el foco en la primera; Tab recorre la lista y sigue con «Panel»; Shift+Tab vuelve a la flechita.
    await flechita.focus()
    await p.keyboard.press('Enter')
    await dormir(350)
    const primero = await activo(p)
    ver((await abierto(p)) === 'true' && primero.includes(PAGINAS[0] ?? '-'), 'Enter en la flechita abre con el foco adentro', primero)
    const recorrido: string[] = [primero]
    for (let i = 0; i < 3; i++) {
      await p.keyboard.press('Tab')
      await dormir(150)
      recorrido.push(await activo(p))
    }
    ver(recorrido[3]?.includes('[tu-panel]') === true && (await abierto(p)) === 'false', 'Tab recorre la lista y desde la última sigue con «Panel» (y la lista se cierra)', recorrido.join(' → '))
    await p.keyboard.press('Shift+Tab')
    await dormir(150)
    const atras = await activo(p)
    ver(atras.includes('[abrir-servicios]'), 'Shift+Tab desde «Panel» vuelve a la flechita', atras)
    await p.keyboard.press('Enter')
    await dormir(350)
    await p.keyboard.press('Shift+Tab')
    await dormir(150)
    ver((await activo(p)).includes('[abrir-servicios]') && (await abierto(p)) === 'true', 'Shift+Tab desde la primera de la lista vuelve a la flechita (abierta)')
    await p.keyboard.press('Escape')
    await dormir(300)
    await cerrar()
  }

  // 3 · A dónde llevan: «Servicios» y «Home» desde la página, «Home» en el home.
  {
    const { p, cerrar } = await abrir(1440, 900, false)
    await cargar(p, PAGINA, false)
    await tocar(p, '[data-pieza="barra"] [data-nav-id="servicios"]')
    const conVelo1 = await llegar(p, (r) => r === '/v3#servicios')
    const tope = await topeDe(p, '#servicios')
    const ruta1 = await p.evaluate(() => location.pathname + location.hash)
    ver(conVelo1 && ruta1 === '/v3#servicios' && Math.abs(tope) <= 120, '«Servicios» desde la página → el home en su sección, con el velo', `${ruta1}, la sección a ${String(tope)} px del tope`)
    await p.screenshot({ path: path.join(SALIDA, '1440-servicios-desde-la-pagina.png') })
    await cargar(p, PAGINA, false)
    await tocar(p, '[data-pieza="barra"] [data-nav-id="hero"]')
    const conVelo2 = await llegar(p, (r) => r === '/v3')
    const y2 = await scrollY(p)
    ver(conVelo2 && y2 <= 2, '«Home» desde la página → el home arriba, con el velo', `y ${String(y2)}`)
    await rodar(p, 2600)
    const antes = await scrollY(p)
    await tocar(p, '[data-pieza="barra"] [data-nav-id="hero"]')
    await dormir(6000)
    const y3 = await scrollY(p)
    ver(antes > 2000 && y3 <= 2, '«Home» en el home, abajo → arriba', `de y ${String(antes)} a ${String(y3)}`)
    await cerrar()
  }

  // 4 · El menú del teléfono.
  {
    const { p, cerrar } = await abrir(390, 844, true)
    await cargar(p, PAGINA)
    await p.locator('[aria-controls="menu-movil"]').first().click()
    await dormir(1500)
    const filas = await p.evaluate(() => [...document.querySelectorAll('[data-pieza="menu-movil"] [data-parte="item-del-menu"]')].map((a) => (a.textContent ?? '').trim()).filter((t) => t !== ''))
    ver(filas[0] === 'Home', '390 · «Home» es el primero del menú', filas.join(' · '))
    const servicios = await p.evaluate(() => {
      const a = [...document.querySelectorAll<HTMLAnchorElement>('[data-pieza="menu-movil"] a[data-parte="item-del-menu"]')].find((x) => (x.textContent ?? '').trim() === 'Servicios')
      return { href: a?.getAttribute('href') ?? null, flechita: a?.parentElement?.querySelector('[data-parte="abrir-el-acordeon"]') !== null && a !== undefined }
    })
    ver(servicios.href === '/v3#servicios' && servicios.flechita, '390 · «Servicios» es un enlace con su flechita al costado', JSON.stringify(servicios))
    await tocar(p, '[data-parte="abrir-el-acordeon"]')
    await dormir(900)
    const estado = await p.evaluate(() => ({
      expandido: document.querySelector('[data-parte="abrir-el-acordeon"]')?.getAttribute('aria-expanded') ?? null,
      items: [...document.querySelectorAll('#acordeon-de-servicios a')].map((a) => (a.textContent ?? '').trim()),
      alto: Math.round(document.querySelector('#acordeon-de-servicios')?.getBoundingClientRect().height ?? 0),
    }))
    ver(estado.expandido === 'true' && JSON.stringify(estado.items) === JSON.stringify(PAGINAS) && estado.alto > 80, '390 · la flechita abre el acordeón con las tres páginas', JSON.stringify(estado))
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
  {
    const { p, cerrar } = await abrir(390, 844, true)
    await cargar(p, PAGINA, false)
    await p.locator('[aria-controls="menu-movil"]').first().click()
    await dormir(1500)
    await tocar(p, '[data-pieza="menu-movil"] a[data-parte="item-del-menu"][href="/v3#servicios"]')
    const conVelo = await llegar(p, (r) => r === '/v3#servicios')
    const tope = await topeDe(p, '#servicios')
    const menu = await p.evaluate(() => document.querySelector('[aria-controls="menu-movil"]')?.getAttribute('aria-expanded') ?? null)
    ver(conVelo && Math.abs(tope) <= 120 && menu !== 'true', '390 · tocar «Servicios» navega al home en su sección (el menú se cierra)', `la sección a ${String(tope)} px, el menú ${String(menu)}`)
    await p.screenshot({ path: path.join(SALIDA, '390-servicios-desde-el-menu.png') })
    await cerrar()
  }
  console.log(fallas.length === 0 ? 'barra: todo en verde' : `barra: ${String(fallas.length)} fallas`)
  if (fallas.length > 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
