/**
 * [M2] EL BANCO DEL BLOG, LA NOTA Y LA 404 — Chrome del sistema a la vista (el método de `l7-int-humo.ts`: `/api/` bloqueado, el banco de la
 * escena), contra el dev del carril (BASE). Por ancho:
 * - el blog: estado, un `h1`, desborde, consola; el carrusel avanza solo (≈5,5 s), mantener apretado lo pausa y al soltar no navega, un clic en la
 *   foto entra a la nota; la grilla: cada título debajo de su foto y, desde 1024, ninguna tarjeta pisa a otra;
 * - una nota: el hilo a la vista (su aguja en la línea de lectura, adentro del cuadro), las marcas que se llenan, sin tachado;
 * - la 404: estado 404, la tarjeta del encastre que arranca (y llega al contacto), y un toque que la repite.
 * Con `REDUCIDO=si`, además: con movimiento reducido el carrusel no avanza.
 *
 *   BASE=http://localhost:3004 ANCHOS=1440x900,1024x768,768x1024,390x844 npx tsx scripts-carga/m2-blog.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3004'
const NOTA = 'cuanto-cuesta-una-pagina-web-en-argentina'
const ANCHOS = (process.env.ANCHOS ?? '1440x900').split(',').map((a) => a.split('x').map(Number) as [number, number])
const FOTOS = process.env.FOTOS ?? 'C:\\nocturno\\cola3-fotos\\M2'
const REDUCIDO = process.env.REDUCIDO === 'si'
const HILO = process.env.HILO ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const lineas: string[] = []
let fallas = 0
const anotar = (bien: boolean, texto: string): void => {
  if (!bien) fallas += 1
  const l = `${bien ? 'ok   ' : 'FALLA'} ${texto}`
  lineas.push(l)
  console.log(l)
}

async function entorno(p: Page): Promise<string> {
  const e = await p.evaluate(() => ({ v: document.visibilityState, w: innerWidth, h: innerHeight }))
  return `${e.v} ${String(e.w)}×${String(e.h)}`
}

async function irA(p: Page, ruta: string): Promise<number> {
  const r = await p.goto(`${BASE}/v3/${ruta}`, { waitUntil: 'load', timeout: 120_000 })
  await dormir(4500)
  return r?.status() ?? 0
}

async function bajarA(p: Page, selector: string, fraccion = 0.15): Promise<void> {
  await p.evaluate(
    ([sel, f]) => {
      const el = document.querySelector(sel)
      if (el !== null) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - innerHeight * Number(f), behavior: 'instant' })
    },
    [selector, String(fraccion)] as const,
  )
  await dormir(1200)
}

const desborde = (p: Page): Promise<number> => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

async function elBlog(p: Page, ancho: number, carpeta: string, consola: string[]): Promise<void> {
  consola.length = 0
  const estado = await irA(p, 'blog')
  const h1 = await p.evaluate(() => [...document.querySelectorAll('h1')].map((h) => h.textContent?.trim() ?? ''))
  anotar(estado === 200 && h1.length === 1 && h1[0] === 'Blog', `blog · ${String(ancho)} · estado ${String(estado)} · h1 ${JSON.stringify(h1)} · ${await entorno(p)}`)

  await bajarA(p, '[data-pieza="carrusel-de-notas"]', 0.12)
  await dormir(600)
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-blog-carrusel.png`) })
  const indice = (): Promise<string> => p.evaluate(() => document.querySelector('[data-pieza="carrusel-de-tarjetas"]')?.getAttribute('data-indice') ?? '?')
  const pausa = (): Promise<string> => p.evaluate(() => document.querySelector('[data-pieza="carrusel-de-tarjetas"]')?.getAttribute('data-pausa') ?? '?')
  const antes = await indice()
  await dormir(6400)
  const despues = await indice()
  if (REDUCIDO) anotar(antes === despues && (await pausa()) === 'reducido', `blog · ${String(ancho)} · con movimiento reducido el carrusel no avanza (${antes} → ${despues}, pausa ${await pausa()})`)
  else anotar(antes !== despues, `blog · ${String(ancho)} · el carrusel avanza solo en ≈5,5 s (${antes} → ${despues})`)

  // Mantener apretado sobre la foto: pausa, y soltar no navega.
  const foto = await p.evaluate(() => {
    const r = document.querySelector('[data-parte="ranura"][data-activa="si"] [data-pieza="foto-de-nota"]')?.getBoundingClientRect()
    return r === undefined ? null : { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  })
  if (foto !== null && !REDUCIDO) {
    await p.mouse.move(foto.x, foto.y)
    await p.mouse.down()
    await dormir(1500)
    const enLaPausa = await pausa()
    const quieto1 = await indice()
    await dormir(5000)
    const quieto2 = await indice()
    await p.mouse.up()
    await dormir(1800)
    const sigue = p.url().endsWith('/v3/blog')
    anotar(enLaPausa === 'mantenido' && quieto1 === quieto2 && sigue, `blog · ${String(ancho)} · mantener apretado pausa (${enLaPausa}, ${quieto1} → ${quieto2} en 5 s) y al soltar no navega (${sigue ? 'sigue en el blog' : p.url()})`)
    // Un clic en la foto entra a la nota de ahora.
    const destino = await p.evaluate(() => document.querySelector('[data-parte="ranura"][data-activa="si"] a')?.getAttribute('href') ?? '')
    const f2 = await p.evaluate(() => {
      const r = document.querySelector('[data-parte="ranura"][data-activa="si"] [data-pieza="foto-de-nota"]')?.getBoundingClientRect()
      return r === undefined ? null : { x: r.left + r.width * 0.3, y: r.top + r.height * 0.3 }
    })
    if (f2 !== null) {
      await p.mouse.click(f2.x, f2.y)
      await p.waitForURL((u) => u.pathname === destino, { timeout: 15_000 }).catch(() => undefined)
      anotar(new URL(p.url()).pathname === destino && destino !== '', `blog · ${String(ancho)} · un clic en la foto entra a la nota (${destino})`)
      await irA(p, 'blog')
    }
  }

  await bajarA(p, '[data-pieza="notas-en-desorden"]', 0.1)
  await dormir(1500)
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-blog-grilla.png`) })
  // Recorrer la grilla para que todas las tarjetas lleguen, y medir.
  for (let i = 0; i < 6; i++) {
    await p.mouse.wheel(0, 500)
    await dormir(500)
  }
  await dormir(1500)
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-blog-grilla-2.png`) })
  const grilla = await p.evaluate(() => {
    const tarjetas = [...document.querySelectorAll('[data-pieza="notas-en-desorden"] [data-pieza="tarjeta-de-nota"]')].map((t) => {
      const f = t.querySelector('[data-pieza="foto-de-nota"]')?.getBoundingClientRect()
      const h = t.querySelector('h3')?.getBoundingClientRect()
      const c = t.getBoundingClientRect()
      return { f: f === undefined ? null : { top: f.top, bottom: f.bottom }, h: h === undefined ? null : { top: h.top }, c: { l: c.left, r: c.right, t: c.top + scrollY, b: c.bottom + scrollY } }
    })
    const debajo = tarjetas.every((t) => t.f !== null && t.h !== null && t.h.top >= t.f.bottom - 1)
    let pisadas = 0
    for (let i = 0; i < tarjetas.length; i++)
      for (let j = i + 1; j < tarjetas.length; j++) {
        const a = tarjetas[i]?.c
        const b = tarjetas[j]?.c
        if (a !== undefined && b !== undefined && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b) pisadas += 1
      }
    return { cuantas: tarjetas.length, debajo, pisadas }
  })
  anotar(grilla.cuantas === 6 && grilla.debajo && grilla.pisadas === 0, `blog · ${String(ancho)} · grilla: ${String(grilla.cuantas)} tarjetas, título debajo de la foto ${grilla.debajo ? 'sí' : 'NO'}, pisadas ${String(grilla.pisadas)}`)
  const d = await desborde(p)
  const errores = consola.filter((c) => !/Failed to load resource|ERR_FAILED|net::/.test(c))
  anotar(d <= 0 && errores.length === 0, `blog · ${String(ancho)} · desborde ${String(d)} px · consola ${errores.length === 0 ? 'limpia' : JSON.stringify(errores)}`)
}

async function laNota(p: Page, ancho: number, carpeta: string, consola: string[]): Promise<void> {
  consola.length = 0
  const estado = await irA(p, `blog/${NOTA}${HILO === '' ? '' : `?hilo=${HILO}`}`)
  await bajarA(p, '[data-pieza="recorrido-de-la-nota"]', -0.2)
  await dormir(1500)
  const hilo = await p.evaluate(() => {
    const aguja = document.querySelector('[data-parte="aguja-del-hilo"]')?.getBoundingClientRect()
    const riel = document.querySelector('[data-pieza="hilo-de-lectura"]')?.getBoundingClientRect()
    const marcas = [...document.querySelectorAll('[data-parte="marca-del-hilo"]')]
    return {
      aguja: aguja === undefined ? null : { x: aguja.left + aguja.width / 2, y: aguja.top + aguja.height / 2 },
      riel: riel === undefined ? null : { l: riel.left, w: riel.width },
      linea: innerHeight * 0.4,
      ancho: innerWidth,
      marcas: marcas.length,
      pasadas: marcas.filter((m) => m.getAttribute('data-pasada') === 'si').length,
      tachado: document.body.textContent?.includes('Leída') === true,
    }
  })
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-nota-hilo${HILO === '' ? '' : `-${HILO}`}.png`) })
  if (HILO === '') {
    const aLaVista = hilo.aguja !== null && hilo.aguja.x > 2 && hilo.aguja.x < hilo.ancho - 2 && Math.abs(hilo.aguja.y - hilo.linea) < 3
    anotar(estado === 200 && aLaVista && hilo.marcas >= 3 && hilo.pasadas >= 1 && !hilo.tachado, `nota · ${String(ancho)} · estado ${String(estado)} · aguja en x ${hilo.aguja?.x.toFixed(0) ?? '—'}, y ${hilo.aguja?.y.toFixed(0) ?? '—'} (línea ${hilo.linea.toFixed(0)}) · marcas ${String(hilo.pasadas)}/${String(hilo.marcas)} pasadas · sin tachado ${hilo.tachado ? 'NO' : 'sí'} · ${await entorno(p)}`)
  }
  await bajarA(p, '[data-pieza="frase-destacada"]', 0.5)
  await dormir(800)
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-nota-destacada.png`) })
  const d = await desborde(p)
  const errores = consola.filter((c) => !/Failed to load resource|ERR_FAILED|net::/.test(c))
  anotar(d <= 0 && errores.length === 0, `nota · ${String(ancho)} · desborde ${String(d)} px · consola ${errores.length === 0 ? 'limpia' : JSON.stringify(errores)}`)
}

async function la404(p: Page, ancho: number, carpeta: string, consola: string[]): Promise<void> {
  consola.length = 0
  const r = await p.goto(`${BASE}/v3/no-existe`, { waitUntil: 'load', timeout: 120_000 })
  const estado = r?.status() ?? 0
  await dormir(400)
  const temprano = await p.evaluate(() => document.querySelector('[data-pieza="logo-que-no-encaja"]')?.getAttribute('data-arranco') ?? '?')
  await dormir(5000)
  const tarde = await p.evaluate(() => ({
    arranco: document.querySelector('[data-pieza="logo-que-no-encaja"]')?.getAttribute('data-arranco') ?? '?',
    contacto: document.querySelector('[data-pieza="logo-que-no-encaja"] svg')?.hasAttribute('data-contacto') === true,
  }))
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-404.png`) })
  await p.click('[data-pieza="logo-que-no-encaja"] button')
  await dormir(60)
  const reinicio = await p.evaluate(() => document.querySelector('[data-pieza="logo-que-no-encaja"]')?.getAttribute('data-arranco') ?? '?')
  await dormir(2500)
  const otraVez = await p.evaluate(() => document.querySelector('[data-pieza="logo-que-no-encaja"] svg')?.hasAttribute('data-contacto') === true)
  const d = await desborde(p)
  const errores = consola.filter((c) => !/Failed to load resource|ERR_FAILED|net::|404/.test(c))
  anotar(
    estado === 404 && temprano === 'no' && tarde.arranco === 'si' && tarde.contacto && reinicio === 'no' && otraVez && d <= 0 && errores.length === 0,
    `404 · ${String(ancho)} · estado ${String(estado)} · a los 400 ms ${temprano}, a los 5 s arrancó ${tarde.arranco} y chocó ${tarde.contacto ? 'sí' : 'NO'} · el toque la repite ${reinicio}→${otraVez ? 'chocó' : 'NO'} · desborde ${String(d)} · consola ${errores.length === 0 ? 'limpia' : JSON.stringify(errores)}`,
  )
}

async function main(): Promise<void> {
  for (const [ancho, alto] of ANCHOS) {
    const carpeta = path.join(FOTOS, REDUCIDO ? 'reducido' : HILO === '' ? '' : `hilo-${HILO}`)
    mkdirSync(carpeta, { recursive: true })
    const perfil = perfilDelBanco('m2-blog')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: REDUCIDO ? 'reduce' : 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const consola: string[] = []
      p.on('console', (m) => {
        if (m.type() === 'error' || /NaN/.test(m.text())) consola.push(`${m.type()}: ${m.text().slice(0, 240)}`)
      })
      p.on('pageerror', (e) => consola.push(`pageerror: ${e.message.slice(0, 240)}`))
      const pasos = HILO === '' ? [elBlog, laNota, la404] : [laNota]
      for (const paso of pasos) await paso(p, ancho, carpeta, consola).catch((e: unknown) => anotar(false, `${String(ancho)} · se cayó: ${String(e).slice(0, 300)}`))
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
    }
  }
  console.log(`\n${String(lineas.length - fallas)} de ${String(lineas.length)} en verde`)
  process.exit(fallas === 0 ? 0 : 1)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
