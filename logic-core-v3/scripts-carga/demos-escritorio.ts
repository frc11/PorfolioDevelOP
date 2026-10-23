/**
 * [C2-41e] DEMOS EN ESCRITORIO, EN EL SITIO — los cuatro criterios de la tarea 41 (escritorio) contra el dev o el build (`BASE`), con
 * el Chrome del sistema a la vista, `/api/` bloqueado y el banco prendido (`__entornoDeLaEscena`). Cada modo llega a Demos como el
 * visitante: desde «la tuya», una muesca hacia abajo (el vuelo del Portfolio y la parada), y espera la llegada entera y la página quieta.
 *
 *   MODO=primera   la primera pantalla de Demos, sin la franja clara abajo: una foto a cada ancho y la luz de la banda de abajo de la
 *                  columna del logo (debajo del hueco). Pasa si la banda es oscura (media < 0,4 y ningún renglón > 0,55).
 *                  CONTROL=franja: la cámara vuelve a la pose del scroll (la de antes) y tiene que FALLAR.
 *   MODO=espejo    los títulos y las bajadas de Portfolio y Demos a la misma altura: |Δy| ≤ 2 px entre los dos títulos y entre las dos
 *                  bajadas (en el escenario pegado, sin transformadas), y el abanico entero en el cuadro.
 *                  CONTROL=sin-espejo: la columna de Demos sin el tope del espejo; tiene que FALLAR.
 *   MODO=hover     el mouse quieto 3 s sobre cada placa (adentro, cerca del borde de abajo, y en el borde pintado de la placa), contando
 *                  las veces que el hover se prende o se apaga (cada cuadro) y los pointerover/out. Pasa con 0 en todos los puntos.
 *                  CONTROL=area-movil: la placa vuelve a recibir el puntero (la de antes); tiene que FALLAR (≥ 2 cambios en algún punto).
 *   MODO=carga     cada demo abierta desde el sitio (el puntero quieto 300 ms sobre su placa y el clic): cuándo se monta el iframe, cuándo
 *                  carga y cuándo se ve (ms desde el clic), qué portada mostró la ventana mientras tanto, y las preconexiones de Demos a
 *                  la vista. Pasa si las cinco preconexiones están, el iframe se monta antes de 200 ms (durante el Genie) y la portada
 *                  es la de la ventana del catálogo. CONTROL=sin-precarga: sin preconexión, iframe con la ventana abierta; FALLA.
 *                  El número de antes (contra la URL de cada demo, en frío) está en `docs/rediseno/SPRINT-C2-41.md`.
 *
 *   BASE=http://localhost:3000 MODO=primera ANCHOS=1440,1024 npx tsx scripts-carga/demos-escritorio.ts
 *   CONTROL=franja MODO=primera …        CONTROL=sin-espejo MODO=espejo …
 *   CONTROL=area-movil MODO=hover …      CONTROL=sin-precarga MODO=carga …
 *
 * Escribe `~/.cache/b4-medicion/demos-41e/<modo>-<producto|control>.json` y las fotos de `primera`.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'

import { CATALOGO_DE_DEMOS } from '../src/app/v3/_secciones/trabajos/demos/catalogo'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const MODO = process.env.MODO ?? 'primera'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/demos-41e')
const REPOSO_MS = 3500
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const etiqueta = CONTROL === '' ? 'producto' : CONTROL

interface Fila {
  readonly ancho: number
  readonly caso: string
  readonly bien: boolean
  readonly detalle: string
}

/** Desde «la tuya», una muesca: el Portfolio vuela a Demos y la parada la deja quieta con la llegada entera. */
async function aDemos(p: Page): Promise<string | null> {
  await p.evaluate(() => {
    const ancla = document.getElementById('portfolio-la-tuya')
    if (ancla === null) throw new Error('sin el ancla de «la tuya» (¿abajo de 1024?)')
    window.scrollTo({ top: ancla.getBoundingClientRect().top + scrollY, behavior: 'instant' })
  })
  await dormir(3000)
  await p.mouse.wheel(0, 100)
  await dormir(REPOSO_MS)
  const estado = await p.evaluate(() => {
    const w = window as Window & { __gatillosDelBancoDe?: Record<string, { paso: () => number }>; __paradaDeDemos?: { llegada: () => number | null } }
    return { parada: w.__gatillosDelBancoDe?.demos?.paso() ?? Number.NaN, llegada: w.__paradaDeDemos?.llegada() ?? null }
  })
  return estado.parada === 0 && (estado.llegada ?? 0) >= 0.999 ? null : `no quedó en Demos con la llegada entera (parada ${String(estado.parada)}, llegada ${String(estado.llegada)})`
}

// ─── primera: la banda de abajo de la columna del logo ─────────────────────
async function primera(p: Page, ancho: number, alto: number): Promise<Fila> {
  const png = await p.screenshot({ type: 'png' })
  writeFileSync(path.join(SALIDA, `primera-${String(ancho)}-${etiqueta}.png`), png)
  // La banda: el 8 % de abajo, en la columna del logo (del 4 al 46 % del ancho), debajo del hueco del logo.
  const banda = { left: Math.round(ancho * 0.04), top: Math.round(alto * 0.92), width: Math.round(ancho * 0.42), height: Math.round(alto * 0.08) }
  const { data, info } = await sharp(png).extract(banda).greyscale().raw().toBuffer({ resolveWithObject: true })
  const renglones: number[] = []
  for (let y = 0; y < info.height; y++) {
    let s = 0
    for (let x = 0; x < info.width; x++) s += data[y * info.width + x] ?? 0
    renglones.push(s / info.width / 255)
  }
  const media = renglones.reduce((a, b) => a + b, 0) / renglones.length
  const peor = Math.max(...renglones)
  return { ancho, caso: 'primera pantalla sin franja', bien: media < 0.4 && peor <= 0.55, detalle: `banda de abajo: media ${media.toFixed(3)}, el renglón más claro ${peor.toFixed(3)}` }
}

// ─── espejo: las alturas de los títulos y las bajadas ──────────────────────
async function espejo(p: Page, ancho: number): Promise<Fila> {
  const m = await p.evaluate(() => {
    const esc = document.querySelector<HTMLElement>('[data-pieza="escenario-del-portfolio"]')
    const tope = (sel: string): number => {
      const el = document.querySelector<HTMLElement>(sel)
      let y = 0
      let e: HTMLElement | null = el
      while (e !== null && e !== esc) {
        y += e.offsetTop
        e = e.offsetParent instanceof HTMLElement ? e.offsetParent : null
      }
      return el !== null && e === esc ? y : Number.NaN
    }
    const abanico = document.querySelector<HTMLElement>('[data-capa="demos"] [data-pieza="estante"]')?.getBoundingClientRect()
    const placa = document.querySelector<HTMLElement>('[data-capa="demos"] [data-pieza="libro"]')?.getBoundingClientRect()
    return {
      tituloP: tope('[data-pieza="encabezado-del-portfolio"] h2'),
      tituloD: tope('#demos h3'),
      bajadaP: tope('[data-pieza="encabezado-del-portfolio"] p'),
      bajadaD: tope('#demos p'),
      abajoDelAbanico: abanico === undefined ? Number.NaN : abanico.bottom,
      placa: placa === undefined ? Number.NaN : placa.width,
      alto: innerHeight,
    }
  })
  const dT = Math.abs(m.tituloP - m.tituloD)
  const dB = Math.abs(m.bajadaP - m.bajadaD)
  const entra = m.abajoDelAbanico <= m.alto
  return { ancho, caso: 'alturas espejo', bien: dT <= 2 && dB <= 2 && entra, detalle: `títulos ${m.tituloP.toFixed(1)} / ${m.tituloD.toFixed(1)} (Δ ${dT.toFixed(1)}), bajadas ${m.bajadaP.toFixed(1)} / ${m.bajadaD.toFixed(1)} (Δ ${dB.toFixed(1)}); placa ${m.placa.toFixed(0)} px; el abanico termina en ${m.abajoDelAbanico.toFixed(0)} de ${String(m.alto)}` }
}

// ─── hover: el mouse quieto 3 s ─────────────────────────────────────────────
const CONTAR = `(() => {
  const libros = [...document.querySelectorAll('[data-capa="demos"] [data-pieza="libro"]')]
  const w = window
  w.__hoverDeDemos = { cambios: 0, eventos: 0 }
  let antes = libros.map((l) => l.matches(':hover'))
  const cuadro = () => {
    if (!w.__hoverDeDemos) return
    const ahora = libros.map((l) => l.matches(':hover'))
    if (ahora.some((h, i) => h !== antes[i])) w.__hoverDeDemos.cambios += 1
    antes = ahora
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
  const contar = (e) => { if (e.target instanceof Element && e.target.closest('[data-pieza="libro"]')) w.__hoverDeDemos.eventos += 1 }
  document.addEventListener('pointerover', contar, true)
  document.addEventListener('pointerout', contar, true)
  w.__soltarElConteo = () => { document.removeEventListener('pointerover', contar, true); document.removeEventListener('pointerout', contar, true); w.__hoverDeDemos = null }
})()`

async function hover(p: Page, ancho: number): Promise<Fila[]> {
  const puntos = await p.evaluate(() => {
    const libros = [...document.querySelectorAll<HTMLElement>('[data-capa="demos"] [data-pieza="libro"]')]
    return libros.flatMap((l, i) => {
      const a = l.getBoundingClientRect()
      const placa = l.querySelector<HTMLElement>('[data-parte="placa"]')?.getBoundingClientRect() ?? a
      const derecha = Math.min(a.right, libros[i + 1]?.getBoundingClientRect().left ?? a.right)
      const sobra = placa.bottom - a.bottom
      return [
        { demo: l.dataset.demo ?? String(i), donde: 'adentro, cerca del borde de abajo', x: (a.left + derecha) / 2, y: a.bottom - 3 },
        { demo: l.dataset.demo ?? String(i), donde: 'el borde pintado de la placa', x: placa.left + 4, y: sobra >= 1.5 ? a.bottom + Math.min(2, sobra / 2) : a.bottom - 1 },
      ]
    })
  })
  const filas: Fila[] = []
  for (const q of puntos) {
    await p.mouse.move(q.x, q.y - 40)
    await p.mouse.move(q.x, q.y, { steps: 8 })
    await dormir(800)
    await p.evaluate(CONTAR)
    await dormir(3000)
    const r = await p.evaluate(() => {
      const w = window as Window & { __hoverDeDemos?: { cambios: number; eventos: number } | null; __soltarElConteo?: () => void }
      const c = { cambios: w.__hoverDeDemos?.cambios ?? -1, eventos: w.__hoverDeDemos?.eventos ?? -1 }
      w.__soltarElConteo?.()
      return c
    })
    filas.push({ ancho, caso: `hover · ${q.demo} · ${q.donde}`, bien: r.cambios === 0 && r.eventos === 0, detalle: `${String(r.cambios)} cambios del hover y ${String(r.eventos)} pointerover/out en 3 s` })
  }
  return filas
}

// ─── carga: cada demo abierta desde el sitio ───────────────────────────────
const VIGILAR = `(() => {
  const w = window
  const t = (w.__cargaDeDemo = { clic: 0, montado: -1, cargado: -1, visible: -1, portada: '' })
  document.addEventListener('click', () => { if (t.clic === 0) t.clic = performance.now() }, true)
  const mirar = () => {
    if (w.__cargaDeDemo !== t) return
    const f = document.querySelector('[data-pieza="dialogo-de-demo"] iframe')
    if (f && t.montado < 0 && t.clic > 0) {
      t.montado = performance.now() - t.clic
      f.addEventListener('load', () => { t.cargado = performance.now() - t.clic })
    }
    const portada = document.querySelector('[data-pieza="portada-de-la-ventana"]')
    if (portada && t.portada === '') t.portada = portada.style.backgroundImage
    if (f && t.visible < 0 && Number(getComputedStyle(f).opacity) > 0.5 && getComputedStyle(f.closest('[role="dialog"]')).visibility === 'visible') t.visible = performance.now() - t.clic
    requestAnimationFrame(mirar)
  }
  requestAnimationFrame(mirar)
})()`

async function carga(p: Page, ancho: number): Promise<Fila[]> {
  const preconexiones = await p.evaluate(() => document.querySelectorAll('link[data-demos-preconexion]').length)
  const filas: Fila[] = [{ ancho, caso: 'carga · preconexiones con Demos a la vista', bien: preconexiones === CATALOGO_DE_DEMOS.length, detalle: `${String(preconexiones)} de ${String(CATALOGO_DE_DEMOS.length)}` }]
  for (const demo of CATALOGO_DE_DEMOS) {
    const c = await p.evaluate((slug) => {
      const r = document.querySelector<HTMLElement>(`[data-capa="demos"] [data-pieza="libro"][data-demo="${slug}"]`)?.getBoundingClientRect()
      return r === undefined ? null : { x: r.left + Math.min(40, r.width / 4), y: r.top + r.height / 2 }
    }, demo.slug)
    if (c === null) {
      filas.push({ ancho, caso: `carga · ${demo.slug}`, bien: false, detalle: 'sin su placa' })
      continue
    }
    await p.mouse.move(c.x, c.y, { steps: 6 })
    await dormir(300)
    await p.evaluate(VIGILAR)
    await p.mouse.click(c.x, c.y)
    await dormir(9000)
    const t = await p.evaluate(() => (window as Window & { __cargaDeDemo?: { montado: number; cargado: number; visible: number; portada: string } }).__cargaDeDemo ?? null)
    await p.keyboard.press('Escape')
    await dormir(1500)
    if (t === null) {
      filas.push({ ancho, caso: `carga · ${demo.slug}`, bien: false, detalle: 'sin medir' })
      continue
    }
    const portadaBien = t.portada.includes(demo.ventana)
    filas.push({ ancho, caso: `carga · ${demo.slug}`, bien: t.montado >= 0 && t.montado < 200 && t.cargado >= 0 && portadaBien, detalle: `iframe montado a ${t.montado.toFixed(0)} ms del clic, cargado a ${t.cargado.toFixed(0)}, visible a ${t.visible.toFixed(0)}; portada ${portadaBien ? 'la de la ventana' : `OTRA (${t.portada})`}` })
  }
  return filas
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const filas: Fila[] = []
  for (const ancho of MODO === 'carga' ? [ANCHOS[0] ?? 1440] : ANCHOS) {
    const alto = ancho <= 1024 ? 768 : 900
    const perfil = path.join(SALIDA, `perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__defectosDeDemos = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3#trabajos`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(7000)
      const fallo = await aDemos(p)
      if (fallo !== null) {
        filas.push({ ancho, caso: 'llegar a Demos', bien: false, detalle: fallo })
        continue
      }
      if (MODO === 'primera') filas.push(await primera(p, ancho, alto))
      else if (MODO === 'espejo') filas.push(await espejo(p, ancho))
      else if (MODO === 'hover') filas.push(...(await hover(p, ancho)))
      else if (MODO === 'carga') filas.push(...(await carga(p, ancho)))
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
    }
  }
  for (const f of filas) console.log(`${f.bien ? '✓' : '✗'} ${String(f.ancho)} · ${f.caso}: ${f.detalle}`)
  writeFileSync(path.join(SALIDA, `${MODO}-${etiqueta}.json`), JSON.stringify(filas, null, 2))
  const malos = filas.filter((f) => !f.bien).length
  console.log(CONTROL === '' ? `${malos === 0 ? '✓' : '✗'} ${MODO}: ${String(filas.length - malos)} de ${String(filas.length)}` : `control ${CONTROL}: ${malos > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'} (${String(malos)} casos fallan)`)
}

void main()
