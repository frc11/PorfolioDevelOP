/**
 * [C2-21] EL DESPLEGABLE DE SERVICIOS — el Chrome del sistema a la vista contra el dev o el build (`BASE`), `/api/` bloqueado. Por ancho
 * (1440 y 1024), con la barra abajo (el home arriba de todo: la lista abre hacia arriba) y arriba (scrolleado: la lista abre hacia abajo):
 *   · la alineación: el borde izquierdo de la lista contra el de «Servicios», |Δx| ≤ 1 px;
 *   · el hover: con el mouse en cada ítem de la lista, el resaltado de la barra sigue debajo de «Servicios» (visible y en su x, ± 1 px);
 *   · el sonido (sólo a 1440): un espía del audio (`AudioBufferSourceNode.start` y `HTMLMediaElement.play`) cuenta lo que suena al pasar
 *     el mouse por tres ítems de la barra y por los tres de la lista. Con el sonido prendido (`localStorage`, como lo deja el parlante),
 *     cada ítem de la lista suena como uno de la barra (al menos un arranque por ítem); con el sonido apagado (el defecto), nada suena.
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,1024 npx tsx scripts-carga/desplegable.ts
 *   CONTROL=corrido …        la lista corrida 12 px (una hoja inyectada): la alineación tiene que FALLAR
 *   CONTROL=sin-resaltado …  al entrar a la lista se despacha la salida de la píldora como antes (sin `relatedTarget`): el hover, FALLA
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type BrowserContext, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'corrido', 'sin-resaltado'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: corrido o sin-resaltado`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/desplegable')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const ESPIA = `(() => {
  const oidos = (window.__sonidosDelBanco = [])
  const arranque = AudioBufferSourceNode.prototype.start
  AudioBufferSourceNode.prototype.start = function (...a) { oidos.push(performance.now()); return arranque.apply(this, a) }
  const play = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function (...a) { if (this.tagName === 'AUDIO') oidos.push(performance.now()); return play.apply(this, a) }
})()`

async function abrir(ancho: number, sonido: boolean): Promise<{ readonly ctx: BrowserContext; readonly p: Page }> {
  const alto = 900
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/desplegable-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter', '--autoplay-policy=no-user-gesture-required'],
  })
  await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1'); localStorage.setItem('develop-v3-sonido', ${JSON.stringify(sonido ? 'si' : 'no')}) } catch (e) {} })()`)
  await ctx.addInitScript(ESPIA)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
  await p.mouse.move(2, 2)
  await dormir(6000)
  if (CONTROL === 'corrido') await p.addStyleTag({ content: '[data-pieza="barra"] > [data-parte="desplegable"] { margin-left: -12px !important; }' })
  return { ctx, p }
}

const centro = async (p: Page, sel: string): Promise<{ readonly x: number; readonly y: number } | null> =>
  p.evaluate((s) => {
    const el = document.querySelector(s)
    if (el === null) return null
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }, sel)

const SERVICIOS = '[data-pieza="barra"] [data-pieza="barra-enlace"][data-nav-id="servicios"]'
const LISTA = '[data-pieza="barra"] > [data-parte="desplegable"]'

/** Abre la lista con el hover sobre «Servicios» y mide su borde izquierdo contra el del enlace. */
async function alineacion(p: Page): Promise<{ readonly dx: number; readonly hacia: string; readonly abierta: boolean } | null> {
  const s = await centro(p, SERVICIOS)
  if (s === null) return null
  await p.mouse.move(s.x, s.y, { steps: 6 })
  await dormir(700)
  return p.evaluate(([a, l]) => {
    const enlace = document.querySelector(a ?? '')
    const lista = document.querySelector(l ?? '')
    if (enlace === null || lista === null) return null
    return { dx: lista.getBoundingClientRect().left - enlace.getBoundingClientRect().left, hacia: lista.getAttribute('data-hacia') ?? '', abierta: lista.hasAttribute('data-abierto') }
  }, [SERVICIOS, LISTA])
}

/** Con el mouse en cada ítem de la lista: ¿el resaltado sigue debajo de «Servicios»? Devuelve el peor |Δx| (o Infinity si se apagó). */
async function hoverEnLaLista(p: Page): Promise<number> {
  let peor = 0
  const items = await p.$$(`${LISTA} [data-pieza="desplegable-enlace"]`)
  for (const [k, item] of items.entries()) {
    const c = await item.boundingBox()
    if (c === null) return Number.POSITIVE_INFINITY
    await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 4 })
    if (CONTROL === 'sin-resaltado' && k === 0) await p.evaluate(() => document.querySelector('[data-pieza="barra"] [data-parte="pastilla"]')?.dispatchEvent(new PointerEvent('pointerleave')))
    await dormir(350)
    const d = await p.evaluate((sel) => {
      const enlace = document.querySelector(sel)
      const pastilla = document.querySelector<HTMLElement>('[data-pieza="barra"] [data-parte="pastilla"]')
      const resaltado = document.querySelector<HTMLElement>('[data-pieza="barra"] [data-parte="resaltado"]')
      if (enlace === null || pastilla === null || resaltado === null) return Number.POSITIVE_INFINITY
      if (resaltado.style.getPropertyValue('--resaltado-visible') !== '1') return Number.POSITIVE_INFINITY
      const esperado = enlace.getBoundingClientRect().left - pastilla.getBoundingClientRect().left + pastilla.scrollLeft
      return Math.abs(Number.parseFloat(resaltado.style.getPropertyValue('--resaltado-x')) - esperado)
    }, SERVICIOS)
    peor = Math.max(peor, d)
  }
  return items.length === 0 ? Number.POSITIVE_INFINITY : peor
}

/** Cuántos arranques de audio suenan al pasar el mouse por cada pieza (en orden), con 400 ms entre una y otra. */
async function sonidosAlPasar(p: Page, selectores: readonly string[]): Promise<number[]> {
  const cuentas: number[] = []
  for (const sel of selectores) {
    const antes = await p.evaluate(() => (window as unknown as { __sonidosDelBanco: number[] }).__sonidosDelBanco.length)
    const c = await centro(p, sel)
    if (c === null) {
      cuentas.push(-1)
      continue
    }
    await p.mouse.move(c.x, c.y, { steps: 4 })
    await dormir(400)
    cuentas.push((await p.evaluate(() => (window as unknown as { __sonidosDelBanco: number[] }).__sonidosDelBanco.length)) - antes)
  }
  return cuentas
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: { readonly linea: string; readonly bien: boolean }[] = []
  const anotar = (linea: string, bien: boolean): void => {
    lineas.push({ linea: `${bien ? 'ok   ' : 'FALLA'} ${linea}`, bien })
    console.log(lineas[lineas.length - 1]?.linea)
  }
  for (const ancho of ANCHOS) {
    const { ctx, p } = await abrir(ancho, false)
    try {
      const modo = await p.evaluate(() => document.querySelector('[data-pieza="barra"]')?.getAttribute('data-modo') ?? '')
      if (modo !== 'barra') {
        console.log(`·     ${String(ancho)} · sin la barra de escritorio (modo «${modo}»): no se mide`)
        continue
      }
      for (const lugar of ['abajo', 'arriba'] as const) {
        if (lugar === 'arriba') {
          await p.mouse.move(2, 2)
          await p.evaluate(() => window.scrollTo({ top: innerHeight * 1.2, behavior: 'instant' }))
          await dormir(1500)
        }
        const a = await alineacion(p)
        anotar(`${String(ancho)} · la barra ${lugar} · la lista ${a === null ? 'NO SE ENCONTRÓ' : `${a.abierta ? 'abierta' : 'CERRADA'} hacia ${a.hacia}, su borde izquierdo a ${a.dx.toFixed(2)} px del de «Servicios»`} (tope 1 px)`, a !== null && a.abierta && Math.abs(a.dx) <= 1)
        const h = await hoverEnLaLista(p)
        anotar(`${String(ancho)} · la barra ${lugar} · con el mouse en la lista, el resaltado ${Number.isFinite(h) ? `debajo de «Servicios» a ${h.toFixed(2)} px` : 'SE FUE de «Servicios» (apagado o en otro ítem)'} (tope 1 px)`, h <= 1)
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${lugar}${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
        await p.mouse.move(2, 2)
        await dormir(600)
      }
    } finally {
      await ctx.close()
    }
  }
  // El sonido, a 1440: apagado (el defecto) y prendido.
  if (CONTROL === '') {
    const BARRA = ['quienes-somos', 'trabajos', 'tu-panel'].map((id) => `[data-pieza="barra"] [data-pieza="barra-enlace"][data-nav-id="${id}"]`)
    const ITEMS = [1, 2, 3].map((n) => `${LISTA} li:nth-child(${String(n)}) [data-pieza="desplegable-enlace"]`)
    for (const sonido of [false, true]) {
      const { ctx, p } = await abrir(1440, sonido)
      try {
        // La primera acción en la página (el motor espera una): una tecla que no hace nada.
        await p.keyboard.press('Shift')
        await dormir(3500)
        const deLaBarra = await sonidosAlPasar(p, BARRA)
        await p.mouse.move(2, 2)
        await dormir(500)
        const abierta = await alineacion(p)
        const deLaLista = abierta?.abierta === true ? await sonidosAlPasar(p, ITEMS) : [-1, -1, -1]
        const bien = sonido ? deLaBarra.every((n) => n >= 1) && deLaLista.every((n) => n >= 1) : [...deLaBarra, ...deLaLista].every((n) => n === 0)
        anotar(`1440 · el sonido ${sonido ? 'PRENDIDO' : 'apagado (el defecto)'} · arranques de audio al pasar por la barra: ${deLaBarra.join(', ')}; por la lista: ${deLaLista.join(', ')} (${sonido ? 'cada uno ≥ 1, como la barra' : 'todos 0: respeta el mute'})`, bien)
      } finally {
        await ctx.close()
      }
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  console.log(`desplegable: ${String(lineas.filter((l) => l.bien).length)} de ${String(lineas.length)} dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: lo suyo tiene que FALLAR)`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
