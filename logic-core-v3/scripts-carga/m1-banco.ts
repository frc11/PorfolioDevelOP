/**
 * [M1] EL BANCO DE M1, EN EL NAVEGADOR (Chrome del sistema a la vista, `/api/` bloqueado):
 *   · la intro de día: su alto en pantallas y una tira de cuadros cada media pantalla (Nosotros, Portfolio y el blog);
 *   · el equipo en el teléfono: la segunda toma se abre al cruzar la mitad y se cierra al volver (por `aria-pressed`);
 *   · los casos: de qué lado queda el medio (y apilados en el teléfono);
 *   · las tapas de las demos (desde 1024): cada cuadro de un recorrido del mouse por las cinco, que ninguna tapa de ADELANTE pise a una que
 *     no está en reposo (las cuatro esquinas de cada cara con su transformada viva, ejes separadores) y que el apilado no cambie;
 *   · la ventana de una demo (desde 1024): abre con el Genie y cierra con Esc.
 *
 *   BASE=http://localhost:3003 ANCHOS=1440x900,390x844 npx tsx scripts-carga/m1-banco.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3003'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const FOTOS = process.env.FOTOS ?? 'C:\\nocturno\\cola3-fotos\\M1'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
let fallas = 0
const informar = (bien: boolean, linea: string): void => {
  if (!bien) fallas += 1
  console.log(`${bien ? 'ok   ' : 'FALLA'} ${linea}`)
}

async function ir(p: Page, ruta: string, ancho: number, alto: number): Promise<void> {
  await p.goto(`${BASE}/v3/${ruta}`, { waitUntil: 'load', timeout: 300000 })
  await p.mouse.move(ancho / 2, alto / 2)
  await dormir(5000)
}

async function laIntro(p: Page, ruta: string, ancho: number, alto: number): Promise<void> {
  await ir(p, ruta, ancho, alto)
  const carpeta = path.join(FOTOS, ruta.replace(/\//g, '_'))
  mkdirSync(carpeta, { recursive: true })
  const m = await p.evaluate(() => {
    const intro = document.querySelector<HTMLElement>('[data-intro-de-pagina]')
    const giro = document.querySelector('[data-parte="marco-del-giro"]')
    return { alto: intro === null ? 0 : intro.offsetHeight / innerHeight, giro: giro !== null, ancho: innerWidth, visible: document.visibilityState }
  })
  const cuadros: string[] = []
  for (let k = 0; k <= 8; k++) {
    await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), (k * alto) / 2)
    await dormir(1300)
    const archivo = path.join(carpeta, `${String(ancho)}-intro-${String(k)}.png`)
    await p.screenshot({ path: archivo })
    cuadros.push(archivo)
  }
  const escala = ancho > 800 ? 0.25 : 0.5
  const w = Math.round(ancho * escala)
  const h = Math.round(alto * escala)
  const chicos = await Promise.all(cuadros.map((c) => sharp(c).resize(w, h).png().toBuffer()))
  await sharp({ create: { width: w * chicos.length, height: h, channels: 3, background: '#000' } })
    .composite(chicos.map((input, i) => ({ input, left: w * i, top: 0 })))
    .png()
    .toFile(path.join(carpeta, `${String(ancho)}-intro-tira.png`))
  // Se guardan dos cuadros enteros: el título y el bloque del giro.
  for (const [i, c] of cuadros.entries()) if (i !== 0 && i !== 4) rmSync(c, { force: true })
  informar(Math.abs(m.alto - 3.4) < 0.05 && m.giro && m.ancho === ancho, `${ruta} · ${String(ancho)} (innerWidth ${String(m.ancho)}, ${m.visible}) · intro ${m.alto.toFixed(2)} pantallas · marco del giro ${m.giro ? 'sí' : 'NO'} · tira ${String(ancho)}-intro-tira.png`)
}

async function elEquipo(p: Page, ancho: number, alto: number): Promise<void> {
  await ir(p, 'nosotros', ancho, alto)
  const leer = (): Promise<string | null> => p.evaluate(() => document.querySelector('[data-persona="Franco"] [data-toque="marco"]')?.getAttribute('aria-pressed') ?? null)
  const centroDe = (): Promise<number> => p.evaluate(() => {
    const r = document.querySelector('[data-persona="Franco"] [data-toque="marco"]')?.getBoundingClientRect()
    return r === undefined ? -1 : r.top + r.height / 2 + scrollY
  })
  const c = await centroDe()
  // La foto con su centro abajo de la línea (0,8 del alto): cerrada; al 0,4: abierta; de vuelta al 0,85: cerrada.
  await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), c - alto * 0.85)
  await dormir(900)
  const antes = await leer()
  await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), c - alto * 0.4)
  await dormir(1400)
  const cruzada = await leer()
  mkdirSync(path.join(FOTOS, 'nosotros'), { recursive: true })
  await p.screenshot({ path: path.join(FOTOS, 'nosotros', `${String(ancho)}-equipo-abierta.png`) })
  await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), c - alto * 0.85)
  await dormir(1400)
  const vuelta = await leer()
  const telefono = ancho < 1024
  const bien = telefono ? antes === 'false' && cruzada === 'true' && vuelta === 'false' : antes === 'false' && cruzada === 'false'
  informar(bien, `nosotros · ${String(ancho)} · la segunda toma de Franco: abajo ${String(antes)} · cruzando la mitad ${String(cruzada)} · de vuelta ${String(vuelta)} (${telefono ? 'por scroll' : 'en escritorio no se abre sola'})`)
}

async function losCasos(p: Page, ancho: number, alto: number): Promise<void> {
  await ir(p, 'portfolio', ancho, alto)
  const lados = await p.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-caso]')].map((c) => {
      const medio = c.querySelector('[data-parte="recorrido"]')?.getBoundingClientRect()
      const texto = c.querySelector('h3')?.getBoundingClientRect()
      if (medio === undefined || texto === undefined) return '?'
      if (medio.bottom <= texto.top + 1) return 'arriba'
      return medio.left < texto.left ? 'izquierda' : 'derecha'
    }),
  )
  const esperado = ancho >= 1024 ? ['izquierda', 'derecha', 'izquierda'] : ['arriba', 'arriba', 'arriba']
  informar(JSON.stringify(lados) === JSON.stringify(esperado), `portfolio · ${String(ancho)} · el medio de cada caso: ${lados.join(', ')} (esperado ${esperado.join(', ')})`)
  const tope = await p.evaluate(() => (document.querySelector('[data-caso]')?.getBoundingClientRect().top ?? 0) + scrollY)
  await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), tope - alto * 0.1)
  await dormir(2200)
  mkdirSync(path.join(FOTOS, 'portfolio'), { recursive: true })
  await p.screenshot({ path: path.join(FOTOS, 'portfolio', `${String(ancho)}-caso-1.png`) })
  const segundo = await p.evaluate(() => (document.querySelectorAll('[data-caso]')[1]?.getBoundingClientRect().top ?? 0) + scrollY)
  await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), segundo + alto * 0.2)
  await dormir(2200)
  await p.screenshot({ path: path.join(FOTOS, 'portfolio', `${String(ancho)}-caso-2.png`) })
}

/** Lo que corre en la página: muestrea cada cuadro las esquinas vivas de cada cara y anota la primera vez que una de adelante pisa a una movida. */
const MUESTREO = `(() => {
  const tapas = [...document.querySelectorAll('[data-tapa]')]
  const caras = tapas.map((t) => t.querySelector('[data-parte="cara"]'))
  const reposo = caras.map((c) => getComputedStyle(c).transform)
  const esquinas = (i) => {
    const li = tapas[i].getBoundingClientRect()
    const c = caras[i]
    const m = new DOMMatrix(getComputedStyle(c).transform)
    const x0 = li.left + c.offsetLeft, y0 = li.top + c.offsetTop, w = c.offsetWidth, h = c.offsetHeight
    const ox = x0 + w / 2, oy = y0 + h
    return [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]].map(([x, y]) => { const p = m.transformPoint(new DOMPoint(x - ox, y - oy)); return [p.x + ox, p.y + oy] })
  }
  const pisan = (a, b) => {
    for (const pol of [a, b]) for (let k = 0; k < 4; k++) {
      const p = pol[k], q = pol[(k + 1) % 4], e = [q[1] - p[1], p[0] - q[0]]
      const pr = (s) => { const v = s.map((t) => t[0] * e[0] + t[1] * e[1]); return [Math.min(...v), Math.max(...v)] }
      const [a0, a1] = pr(a), [b0, b1] = pr(b)
      if (a1 <= b0 + 0.5 || b1 <= a0 + 0.5) return false
    }
    return true
  }
  const z = () => tapas.map((t) => getComputedStyle(t).zIndex).join(',')
  const z0 = z()
  const r = { cuadros: 0, cruces: [], zCambia: false, movidas: 0 }
  window.__estante = r
  const paso = () => {
    r.cuadros++
    if (z() !== z0) r.zCambia = true
    const q = caras.map((_, i) => esquinas(i))
    caras.forEach((c, i) => {
      if (getComputedStyle(c).transform === reposo[i]) return
      r.movidas++
      for (let j = i + 1; j < caras.length; j++) if (pisan(q[i], q[j]) && r.cruces.length < 5) r.cruces.push('cuadro ' + r.cuadros + ': la ' + j + ' pisa a la ' + i)
    })
    if (!r.parar) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
})()`

async function lasTapas(p: Page, ancho: number, alto: number): Promise<void> {
  await ir(p, 'portfolio', ancho, alto)
  const tope = await p.evaluate(() => (document.querySelector('[data-pieza="estante-de-demos"]')?.getBoundingClientRect().top ?? 0) + scrollY)
  await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), tope - alto * 0.35)
  await dormir(1800)
  const centros = await p.evaluate(() => [...document.querySelectorAll('[data-tapa] [data-parte="cara"]')].map((c) => {
    const r = c.getBoundingClientRect()
    return [r.left + r.width / 2, r.top + r.height * 0.75] as [number, number]
  }))
  await p.mouse.move(5, 5)
  await dormir(600)
  await p.evaluate(MUESTREO)
  // Despacio, una por una, ida y vuelta; después rápido de punta a punta; después saltos.
  for (const i of [0, 1, 2, 3, 4, 3, 2, 1, 0]) {
    const c = centros[i]
    if (c !== undefined) await p.mouse.move(c[0], c[1], { steps: 8 })
    await dormir(700)
  }
  mkdirSync(path.join(FOTOS, 'portfolio'), { recursive: true })
  await p.screenshot({ path: path.join(FOTOS, 'portfolio', `${String(ancho)}-tapa-levantada.png`) })
  for (const i of [0, 4, 0, 4]) {
    const c = centros[i]
    if (c !== undefined) await p.mouse.move(c[0], c[1], { steps: 6 })
    await dormir(60)
  }
  for (const i of [2, 0, 4, 1, 3]) {
    const c = centros[i]
    if (c !== undefined) await p.mouse.move(c[0], c[1])
    await dormir(150)
  }
  await p.mouse.move(5, 5)
  await dormir(1200)
  const r = await p.evaluate(() => {
    const e = (window as unknown as { __estante: { cuadros: number; cruces: string[]; zCambia: boolean; movidas: number; parar?: boolean } }).__estante
    e.parar = true
    return e
  })
  informar(r.cruces.length === 0 && !r.zCambia && r.movidas > 0, `portfolio · ${String(ancho)} · las tapas: ${String(r.cuadros)} cuadros, ${String(r.movidas)} tapa-cuadro movidas, cruces ${r.cruces.length === 0 ? 'ninguno' : r.cruces.join(' / ')} · apilado ${r.zCambia ? 'CAMBIA' : 'fijo'}`)
}

async function laVentana(p: Page, ancho: number, alto: number): Promise<void> {
  // Sigue en el Portfolio, con el estante a la vista.
  const tapa = p.locator('[data-tapa="skyline"] a')
  await tapa.click()
  await dormir(1800)
  const abierta = await p.evaluate(() => {
    const d = document.querySelector<HTMLElement>('[data-pieza="dialogo-de-demo"] [role="dialog"]')
    return d !== null && getComputedStyle(d).visibility === 'visible'
  })
  await p.screenshot({ path: path.join(FOTOS, 'portfolio', `${String(ancho)}-ventana.png`) })
  const pestanas = p.context().pages().length
  await p.keyboard.press('Escape')
  await dormir(1500)
  const cerrada = await p.evaluate(() => document.querySelector('[data-pieza="dialogo-de-demo"]') === null)
  informar(abierta && cerrada && pestanas === 1, `portfolio · ${String(ancho)}×${String(alto)} · la ventana del home: abre ${abierta ? 'sí' : 'NO'} · cierra con Esc ${cerrada ? 'sí' : 'NO'} · pestañas ${String(pestanas)}`)
}

async function main(): Promise<void> {
  for (const [ancho, alto] of ANCHOS) {
    const perfil = perfilDelBanco('m1-banco')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: [`--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const errores: string[] = []
      p.on('pageerror', (e) => errores.push(e.message.slice(0, 200)))
      const pasos: (() => Promise<void>)[] = [
        () => laIntro(p, 'nosotros', ancho, alto),
        () => laIntro(p, 'portfolio', ancho, alto),
        () => laIntro(p, 'blog', ancho, alto),
        () => elEquipo(p, ancho, alto),
        () => losCasos(p, ancho, alto),
      ]
      if (ancho >= 1024) pasos.push(async () => {
        await lasTapas(p, ancho, alto)
        await laVentana(p, ancho, alto)
      })
      for (const paso of pasos) await paso().catch((e: unknown) => informar(false, `${String(ancho)} · se cayó: ${String(e).slice(0, 240)}`))
      informar(errores.length === 0, `${String(ancho)} · errores de la página: ${errores.length === 0 ? 'ninguno' : JSON.stringify(errores)}`)
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
    }
  }
  console.log(`\n${String(fallas)} fallas`)
  process.exit(fallas === 0 ? 0 : 1)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
