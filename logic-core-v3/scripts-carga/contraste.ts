/**
 * [B · lo que no corrió] EL CONTRASTE DE LO NUEVO, EN EL SITIO — la ficha de cada historia sobre su video (390 y 768), «Enviar» y el resto
 * del formulario de «la tuya» (1440) y el disco de la pausa con el foco del teclado sobre el video del panel (1440). Contra el dev server,
 * con el Chrome del sistema a la vista y `/api/` bloqueado; los videos en pausa (el fondo es el mismo en las dos capturas).
 *
 *   npx tsx scripts-carga/contraste.ts
 *
 * Por pieza, dos capturas de su caja: como se ve, y con su texto (o su ícono) transparente, que deja el fondo real debajo. Los píxeles que
 * cambian son el glifo; en cada uno, la razón de contraste del color del texto contra el fondo de abajo (WCAG). Se informa el percentil 5
 * (el borde antialiaseado no cuenta como texto) contra 4,5:1 (texto), 3:1 (texto grande: 24 px, o 18,66 px en negrita) o 3:1 (un ícono).
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'
import sharp from 'sharp'

import { deslizar, desplazarConElDedo } from './tactil'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/contraste')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

export const TRANSPARENTE = `[data-contraste-objetivo], [data-contraste-objetivo] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; }
[data-contraste-objetivo] svg, [data-contraste-objetivo] svg * { fill: transparent !important; stroke: transparent !important; }`

const lineal = (c: number): number => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const luminancia = (r: number, g: number, b: number): number => 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b)
const razon = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

async function crudo(png: Buffer): Promise<{ readonly datos: Buffer; readonly ancho: number }> {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { datos: data, ancho: info.width }
}

export interface Medida {
  readonly pieza: string
  readonly texto: string
  readonly glifo: number
  readonly p5: number
  readonly minimo: number
  readonly umbral: number
}

/** Una pieza: su caja, su color (el del texto o el del trazo del ícono), y la razón píxel a píxel contra el fondo de abajo. */
export async function medirLaPieza(p: Page, el: import('@playwright/test').ElementHandle<Element>, nombre: string, icono = false): Promise<Medida | null> {
  const datos = await el.evaluate((e, esIcono) => {
    const r = e.getBoundingClientRect()
    const c = getComputedStyle(esIcono ? (e.querySelector('svg') ?? e) : e)
    const color = esIcono && c.stroke !== 'none' && c.stroke !== '' ? c.stroke : c.color
    const tam = parseFloat(c.fontSize)
    const peso = Number(c.fontWeight)
    // El color, resuelto por un lienzo (oklab, con alfa: el rubro va en la tinta al 70 %): sRGB y su alfa.
    const lienzo = document.createElement('canvas').getContext('2d')
    let rgba = [0, 0, 0, 0]
    if (lienzo !== null) {
      lienzo.fillStyle = color
      lienzo.fillRect(0, 0, 1, 1)
      rgba = [...lienzo.getImageData(0, 0, 1, 1).data]
    }
    return { caja: { x: Math.max(0, r.left - 2), y: Math.max(0, r.top - 2), width: r.width + 4, height: r.height + 4 }, rgba, grande: tam >= 24 || (tam >= 18.66 && peso >= 700), texto: (e.textContent ?? '').trim().slice(0, 40) }
  }, icono)
  if (datos.caja.width < 2 || datos.caja.height < 2) return null
  const [tr = 0, tg = 0, tb = 0, ta = 255] = datos.rgba
  const alfa = ta / 255
  const como = await crudo(await p.screenshot({ clip: datos.caja }))
  await el.evaluate((e) => e.setAttribute('data-contraste-objetivo', ''))
  await dormir(120)
  const debajo = await crudo(await p.screenshot({ clip: datos.caja }))
  await el.evaluate((e) => e.removeAttribute('data-contraste-objetivo'))
  const razones: number[] = []
  for (let i = 0; i < Math.min(como.datos.length, debajo.datos.length); i += 4) {
    const dif = Math.abs((como.datos[i] ?? 0) - (debajo.datos[i] ?? 0)) + Math.abs((como.datos[i + 1] ?? 0) - (debajo.datos[i + 1] ?? 0)) + Math.abs((como.datos[i + 2] ?? 0) - (debajo.datos[i + 2] ?? 0))
    if (dif < 90) continue
    const [br, bg, bb] = [debajo.datos[i] ?? 0, debajo.datos[i + 1] ?? 0, debajo.datos[i + 2] ?? 0]
    // El texto con alfa se mezcla con lo de abajo (en sRGB, como el navegador).
    const efectivo = luminancia(alfa * tr + (1 - alfa) * br, alfa * tg + (1 - alfa) * bg, alfa * tb + (1 - alfa) * bb)
    razones.push(razon(efectivo, luminancia(br, bg, bb)))
  }
  if (razones.length === 0) return { pieza: nombre, texto: datos.texto, glifo: 0, p5: Number.NaN, minimo: Number.NaN, umbral: icono || datos.grande ? 3 : 4.5 }
  razones.sort((a, b) => a - b)
  return { pieza: nombre, texto: datos.texto, glifo: razones.length, p5: razones[Math.floor(razones.length * 0.05)] ?? Number.NaN, minimo: razones[0] ?? Number.NaN, umbral: icono || datos.grande ? 3 : 4.5 }
}

async function abrir(ancho: number, alto: number, movil: boolean): Promise<{ readonly p: Page; readonly cdp: CDPSession; readonly cerrar: () => Promise<void> }> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/contraste-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: movil,
    hasTouch: movil,
    args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  return { p, cdp, cerrar: () => ctx.close() }
}

async function cargar(p: Page, ruta: string): Promise<void> {
  await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 240000 })
  const t0 = Date.now()
  while (Date.now() - t0 < 60000) {
    const lista = await p.evaluate(() => document.querySelector('[data-pieza="escenario-del-portfolio"]') !== null).catch(() => false)
    if (lista) break
    await dormir(300)
  }
  await dormir(3500)
  await p.evaluate((css) => {
    const s = document.createElement('style')
    s.textContent = css
    document.head.appendChild(s)
  }, TRANSPARENTE)
}

const pausarLosVideos = (p: Page): Promise<void> => p.evaluate(() => document.querySelectorAll('video').forEach((v) => v.pause()))

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const medidas: (Medida & { readonly ancho: number })[] = []
  // 1 · La ficha de cada historia sobre su video, a 390 y a 768.
  for (const [ancho, alto] of [[390, 844], [768, 1024]] as const) {
    const { p, cdp, cerrar } = await abrir(ancho, alto, true)
    try {
      await cargar(p, '/v3')
      await p.evaluate(() => {
        const panel = document.querySelector('[data-panel="trabajos"]')
        if (panel === null) return
        window.scrollTo({ top: panel.getBoundingClientRect().top + scrollY - innerHeight + (450 * innerHeight) / 900, behavior: 'instant' })
      })
      await dormir(1500)
      for (let i = 0; i < 8 && (await p.evaluate(() => document.querySelector('[data-pieza="historias"]') === null)); i++) {
        await desplazarConElDedo(cdp, ancho / 2, alto / 2, 300)
        await dormir(500)
      }
      await dormir(2500)
      for (let historia = 0; historia < 3; historia++) {
        if (historia > 0) {
          await deslizar(cdp, ancho / 2, alto * 0.4, -200, 0)
          await dormir(2500)
        }
        // Mantener apretado (su pausa: el tiempo de la historia no corre) mientras se mide, y soltar antes del deslice siguiente.
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: ancho / 2, y: alto * 0.3, id: 1 }] })
        await dormir(400)
        await pausarLosVideos(p)
        await dormir(300)
        const ficha = await p.$('[data-pieza="ficha-de-la-historia"]')
        if (ficha === null) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
          continue
        }
        const nombre = await ficha.evaluate((x) => x.querySelector('h3')?.textContent ?? '?')
        // Cuatro cuadros del video (al 10, 35, 60 y 85 % de su largo): el fondo cambia; se queda el peor de cada pieza.
        for (const f of [0.1, 0.35, 0.6, 0.85]) {
          await p.evaluate((fr) => {
            const v = document.querySelector<HTMLVideoElement>('[data-historia] video')
            if (v !== null && Number.isFinite(v.duration)) v.currentTime = v.duration * fr
          }, f)
          await dormir(600)
          await p.screenshot({ path: path.join(SALIDA, `ficha-${String(ancho)}-${String(historia)}-${String(f)}.png`) })
          for (const [i, e] of (await ficha.$$('h3, p, a span, span')).entries()) {
            const visible = await e.evaluate((x) => x.childElementCount === 0 && (x.textContent ?? '').trim() !== '' && x.getClientRects().length > 0 && getComputedStyle(x).visibility !== 'hidden')
            if (!visible) continue
            const m = await medirLaPieza(p, e, `${nombre} · ${String(i)} · cuadro al ${String(Math.round(f * 100))} %`)
            if (m !== null) medidas.push({ ...m, ancho })
          }
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
        await dormir(300)
      }
    } finally {
      await cerrar()
    }
  }
  // 2 · «Enviar» y el formulario de «la tuya», y 3 · la pausa con el foco del teclado, a 1440.
  {
    const { p, cerrar } = await abrir(1440, 900, false)
    try {
      await cargar(p, '/v3#portfolio-la-tuya')
      await p.mouse.move(200, 500)
      const formulario = await p.$('[data-tira="la-tuya"] [data-pieza="formulario-de-la-tuya"]')
      if (formulario !== null) {
        for (const [i, e] of (await formulario.$$('label, span, button, a')).entries()) {
          const visible = await e.evaluate((x) => x.childElementCount === 0 && (x.textContent ?? '').trim() !== '' && x.getClientRects().length > 0 && getComputedStyle(x).visibility !== 'hidden' && getComputedStyle(x).opacity !== '0')
          if (!visible) continue
          const m = await medirLaPieza(p, e, `la tuya · ${String(i)}`)
          if (m !== null) medidas.push({ ...m, ancho: 1440 })
        }
      }
      await cargar(p, '/v3#portfolio-el-garage')
      await p.keyboard.press('Shift')
      await p.evaluate(() => {
        const b = [...document.querySelectorAll<HTMLElement>('[data-pieza="panel-del-portfolio"] [data-pieza="boton-pausa"]')].find((x) => x.getClientRects().length > 0)
        const lista = [...document.querySelectorAll<HTMLElement>('a[href], button, input, textarea, select, [tabindex]')].filter((e) => e.tabIndex >= 0 && e.getClientRects().length > 0)
        const i = b === undefined ? -1 : lista.indexOf(b)
        if (i > 0) lista[i - 1]?.focus({ preventScroll: true })
      })
      await p.keyboard.press('Tab')
      await dormir(600)
      await pausarLosVideos(p)
      const pausa = await p.$('[data-pieza="panel-del-portfolio"] [data-pieza="boton-pausa"]')
      if (pausa !== null) {
        await p.screenshot({ path: path.join(SALIDA, 'pausa-1440.png') })
        const m = await medirLaPieza(p, pausa, 'la pausa · el ícono', true)
        if (m !== null) medidas.push({ ...m, ancho: 1440 })
      }
    } finally {
      await cerrar()
    }
  }
  let malas = 0
  let sinGlifo = 0
  for (const m of medidas) {
    // Sin glifo a la vista (la copia de abajo del rollover, recortada): no se ve, no se cuenta.
    if (m.glifo === 0) {
      sinGlifo += 1
      continue
    }
    const bien = m.p5 >= m.umbral
    if (!bien) malas += 1
    appendFileSync(path.join(SALIDA, 'contraste.jsonl'), `${JSON.stringify(m)}\n`)
    console.log(`${bien ? 'ok   ' : 'FALLA'} ${String(m.ancho)} · ${m.pieza} «${m.texto}» · p5 ${m.p5.toFixed(2)}:1 (mínimo ${m.minimo.toFixed(2)}) contra ${String(m.umbral)}:1 · ${String(m.glifo)} px de glifo`)
  }
  console.log(`contraste: ${String(medidas.length - sinGlifo - malas)} de ${String(medidas.length - sinGlifo)} piezas a la vista en AA (${String(sinGlifo)} sin glifo a la vista: la copia escondida del rollover)`)
}

// Sólo como script: otro arnés lo importa por `medirLaPieza` ([B12a.5] `barra.ts`).
if (/contraste\.ts$/.test(process.argv[1] ?? '')) {
  main().catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
}
