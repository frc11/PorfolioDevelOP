/**
 * [B1.2d] LA MATRIZ DEL PORTFOLIO EN EL SITIO (§14, A8, A3, A1, A10 y A9) — contra el dev server (sin `next build`: contrato O-10), con
 * `?diag=carga` y el Chrome del sistema a la vista. Ninguna ruta real: `/api/` bloqueado.
 *
 *   npx tsx scripts-carga/matriz.ts                 la matriz entera (`a8.ts`: cada combinación, tres idas y vueltas)
 *   SOLO=rueda-desde-arriba,flechas npx tsx …       sólo esas entradas
 *   CONTROL=a81 npx tsx …                           el control positivo: el caso de Valentino con el defecto de A8.1 reintroducido
 *   MODO=a3 | a1 | a9 npx tsx …                     la rueda con el mouse que se mueve, la píldora y el orden cuadro a cuadro, el hueco
 *   MODO=rafaga npx tsx …                           [F2] las combinaciones de la ráfaga (CONTROL=rafaga: con la rueda de antes, tienen que fallar)
 *   MODO=a2 npx tsx …                               [A2.1 y A2.2] el despeje del medio y el tiempo de la píldora, a 1440, 1280, 1180 y 1024
 *
 * Cada foto se toma en reposo (sin vuelo, con el orden asentado y el scroll quieto, a lo sumo `ESPERA_MS`) y se cuenta con `a8.ts`.
 * Escribe una fila por combinación en `~/.cache/b4-medicion/b12d/` y una línea por combinación en la consola.
 */
import { appendFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type BrowserContext, type Page } from '@playwright/test'

import { IDAS_Y_VUELTAS, combinaciones, combinacionesDeRafaga, desdeDemos, violaciones, violacionesDeLaRafaga, type Combinacion, type CombinacionDeRafaga, type FotoDelPortfolio, type GestoDeRafaga, type Violacion } from './a8'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const MODO = process.env.MODO ?? 'matriz'
const CONTROL = process.env.CONTROL ?? null
const TANDA = process.env.TANDA ?? 'b12d'
const SOLO = process.env.SOLO?.split(',') ?? null
/** `RANGO=3-10`: las combinaciones por su índice en `combinaciones()` (las tandas). */
const RANGO: readonly [number, number] | null = /^\d+-\d+$/.test(process.env.RANGO ?? '') ? ((process.env.RANGO ?? '').split('-').map(Number) as [number, number]) : null
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/b12d')
const ESPERA_MS = 9000
/** [F1] Los defectos que el arnés reintroduce antes de cargar (`medida.ts`, `DefectoDelPortfolio`): `true` es el de A8.1. */
type DefectoDelArnes = 'vuelo-sin-dueno' | 'rueda-en-la-entrada'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Px de la regla (contra 900 de alto) de los lugares de arranque: la aproximación y Demos ya llegado. */
const PX_ARRIBA = 450
const PX_EN_DEMOS = 8781

const ARRANQUE = `(() => {
  window.__name = window.__name || ((f) => f)
  try { sessionStorage.setItem('home:intro', '1') } catch (e) {}
})()`

async function abrir(defecto: boolean | DefectoDelArnes, ancho = 1440, alto = 900): Promise<{ readonly ctx: BrowserContext; readonly p: Page }> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/b12d-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  await ctx.addInitScript(ARRANQUE)
  if (defecto !== false) await ctx.addInitScript(`window.__defectosDelPortfolio = ${JSON.stringify(defecto === true ? 'vuelo-sin-dueno' : defecto)}`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  return { ctx, p }
}

async function cargar(p: Page, hash = '', busqueda = ''): Promise<void> {
  await p.goto('about:blank').catch(() => undefined)
  await p.goto(`${BASE}/v3?diag=carga${busqueda}${hash}`, { waitUntil: 'load', timeout: 240000 })
  const t0 = Date.now()
  while (Date.now() - t0 < 30000) {
    const lista = await p.evaluate(() => {
      const d = (window as unknown as { __v3diag?: { pulso: () => { escenaLista: boolean } } }).__v3diag
      return d?.pulso().escenaLista === true && document.querySelector('[data-pieza="escenario-del-portfolio"]') !== null
    }).catch(() => false)
    if (lista) break
    await dormir(200)
  }
  await dormir(2500)
}

const pasoAhora = (p: Page): Promise<number> => p.evaluate(() => Number(document.querySelector('[data-pieza="escenario-del-portfolio"]')?.getAttribute('data-paso') ?? NaN))

/** Lleva la página a un píxel de la regla, de un salto (el scroll nativo; Lenis lo adopta). */
async function alPx(p: Page, px: number): Promise<void> {
  await p.evaluate((x) => {
    const panel = document.querySelector('[data-panel="trabajos"]')
    if (panel === null) return
    const tope = panel.getBoundingClientRect().top + scrollY
    window.scrollTo({ top: tope - innerHeight + (x * innerHeight) / 900, behavior: 'instant' })
  }, px)
}

/**
 * Espera el reposo: sin vuelo, el orden asentado, Lenis quieto y el scroll, el panel y la píldora quietos 600 ms (el orden se asienta
 * cuando el panel ARRANCA su transición de 700 ms: la foto espera a que termine). Devuelve si llegó antes del tope.
 */
async function reposo(p: Page): Promise<boolean> {
  const t0 = Date.now()
  let ultimo = ''
  let quietoDesde = Date.now()
  while (Date.now() - t0 < ESPERA_MS) {
    const s = await p.evaluate(() => {
      const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
      const c = document.querySelector('[data-pieza="caja-del-portfolio"]')
      const panel = document.querySelector('[data-pieza="panel-del-portfolio"]')?.getBoundingClientRect().left ?? 0
      const pastilla = document.querySelector('[data-pieza="barra"] [data-parte="pastilla"]')?.getBoundingClientRect()
      const d = (window as unknown as { __v3diag?: { pulso: () => { lenis: string | null } } }).__v3diag
      return { donde: [scrollY, panel, pastilla?.left ?? 0, pastilla?.right ?? 0].map((x) => x.toFixed(1)).join(','), vuelo: c?.getAttribute('data-en-vuelo') === 'si', orden: e?.getAttribute('data-orden-quieto') === 'si', lenis: d?.pulso().lenis ?? null }
    })
    if (s.donde !== ultimo) {
      ultimo = s.donde
      quietoDesde = Date.now()
    }
    if (!s.vuelo && s.orden && (s.lenis === null || s.lenis === 'false') && Date.now() - quietoDesde >= 600) return true
    await dormir(100)
  }
  return false
}

async function foto(p: Page, quieta: boolean): Promise<FotoDelPortfolio> {
  const f = await p.evaluate(() => {
    const e = document.querySelector<HTMLElement>('[data-pieza="escenario-del-portfolio"]')
    const c = document.querySelector('[data-pieza="caja-del-portfolio"]')
    const panel = document.querySelector<HTMLElement>('[data-pieza="panel-del-portfolio"]')
    const columna = document.querySelector('[data-pieza="columna-del-portfolio"]')
    const pastilla = document.querySelector<HTMLElement>('[data-pieza="barra"] [data-parte="pastilla"]')
    const sonido = document.querySelector('[data-pieza="control-del-sonido"], [data-pieza="sonido-de-la-esquina"]')
    const d = (window as unknown as { __v3diag?: { fallas: () => { tipo: string; detalle: string }[] } }).__v3diag
    const caja = (x: Element | null | undefined): DOMRect | null => x?.getBoundingClientRect() ?? null
    const er = caja(e)
    const cr = caja(columna)
    const pr = caja(pastilla)
    return {
      ancho: innerWidth,
      paso: Number(e?.getAttribute('data-paso') ?? NaN),
      panelAdentro: e?.getAttribute('data-panel-adentro') === 'si',
      ordenQuieto: e?.getAttribute('data-orden-quieto') === 'si',
      enVuelo: c?.getAttribute('data-en-vuelo') === 'si',
      barra: e?.getAttribute('data-barra') === 'si',
      panelIzq: caja(panel)?.left ?? Number.NaN,
      bordeDelPanel: er === null || e === null || panel === null ? Number.NaN : er.left + e.clientWidth - panel.offsetWidth,
      eje: cr === null ? Number.NaN : cr.left + cr.width / 2,
      finDelSonido: caja(sonido)?.right ?? 0,
      pastilla: { l: pr?.left ?? Number.NaN, r: pr?.right ?? Number.NaN },
      pastillaEnLinea: pastilla !== null && pastilla.style.getPropertyValue('left') !== '',
      fallas: (d?.fallas() ?? []).filter((x) => x.tipo.startsWith('portfolio-')).map((x) => `${x.tipo}: ${x.detalle}`),
    }
  })
  return { ...f, quieta }
}

// ─── Los gestos ───────────────────────────────────────────────────────────

const adentro = (paso: number): boolean => paso >= 0 && paso <= 3

/** La rueda hasta que se cumpla `listo`: de a una muesca (lenta) o un deslizamiento con inercia (rápida, el trackpad). */
async function rueda(p: Page, sentido: 1 | -1, velocidad: 'lenta' | 'rapida', listo: (paso: number) => boolean): Promise<void> {
  for (let i = 0; i < (velocidad === 'lenta' ? 40 : 10); i++) {
    if (velocidad === 'lenta') {
      await p.mouse.wheel(0, 100 * sentido)
      await dormir(700)
    } else {
      for (let k = 0; k < 45; k++) {
        await p.mouse.wheel(0, sentido * Math.max(2, 80 * 0.94 ** k))
        await dormir(16)
      }
      await dormir(900)
    }
    if (listo(await pasoAhora(p))) return
  }
}

async function teclas(p: Page, tecla: string, velocidad: 'lenta' | 'rapida', listo: (paso: number) => boolean): Promise<void> {
  const flechas = tecla.startsWith('Arrow')
  // Una flecha corre ~40 px: de El Garage a Demos son ~5.000, así que la lenta necesita hasta 200.
  for (let i = 0; i < (velocidad === 'lenta' ? (flechas ? 200 : 20) : 8); i++) {
    if (velocidad === 'lenta') {
      await p.keyboard.press(tecla)
      await dormir(flechas ? 250 : 900)
    } else {
      for (let k = 0; k < (flechas ? 25 : 6); k++) {
        await p.keyboard.press(tecla)
        await dormir(flechas ? 25 : 60)
      }
      await dormir(900)
    }
    if (listo(await pasoAhora(p))) return
  }
}

/** El arrastre de la barra (oculta en el sitio): scroll nativo sin rueda ni teclas, de a poco (lento) o a saltos (rápido). */
async function arrastre(p: Page, sentido: 1 | -1, velocidad: 'lenta' | 'rapida', listo: (paso: number) => boolean): Promise<void> {
  const paso = velocidad === 'lenta' ? 60 : 400
  for (let i = 0; i < 400; i++) {
    await p.evaluate((d) => window.scrollTo({ top: scrollY + d, behavior: 'instant' }), paso * sentido)
    await dormir(velocidad === 'lenta' ? 40 : 30)
    if (i % 5 === 4 && listo(await pasoAhora(p))) return
  }
}

const HOVER = (ancho: number, alto: number): { readonly x: number; readonly y: number } => ({ x: ancho * 0.75, y: alto * 0.5 })
const COLUMNA = (ancho: number, alto: number): { readonly x: number; readonly y: number } => ({ x: ancho * 0.2, y: alto * 0.55 })

async function entrar(p: Page, c: Combinacion, vuelta: number): Promise<void> {
  const v = c.velocidad
  if (c.entrada === 'hash-trabajos' || c.entrada === 'hash-portfolio') {
    const hash = c.entrada === 'hash-trabajos' ? '#trabajos' : '#portfolio-esquina-estudio'
    if (vuelta === 0) {
      await cargar(p, hash)
      return
    }
    await p.evaluate((h) => {
      history.replaceState(null, '', location.pathname + location.search)
      location.hash = h
    }, hash)
    return
  }
  await alPx(p, desdeDemos(c.entrada) ? PX_EN_DEMOS : PX_ARRIBA)
  await reposo(p)
  const listo = adentro
  switch (c.entrada) {
    case 'rueda-desde-arriba':
      return rueda(p, 1, v, listo)
    case 'rueda-desde-demos':
      return rueda(p, -1, v, listo)
    case 'pagina-abajo':
      return teclas(p, 'PageDown', v, listo)
    case 'pagina-arriba':
      return teclas(p, 'PageUp', v, listo)
    case 'flechas':
      return teclas(p, 'ArrowDown', v, listo)
    case 'barra-de-scroll':
      return arrastre(p, 1, v, listo)
    case 'barra-de-navegacion': {
      const b = await p.locator('[data-pieza="barra"] a[data-nav-id="trabajos"]').boundingBox()
      if (b !== null) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
      return
    }
  }
}

async function salir(p: Page, c: Combinacion, ancho: number, alto: number): Promise<void> {
  const v = c.velocidad
  if (c.salida === 'clic-afuera') {
    await p.mouse.click(ancho * 0.25, alto * 0.8)
    return
  }
  const sentido: 1 | -1 = c.salida === 'demos' ? 1 : -1
  const listo = (paso: number): boolean => (c.salida === 'demos' ? paso === 4 : paso === -1)
  // Como el visitante, que «sigue hasta Demos» (o hacia arriba): después de salir, dos gestos más en el mismo sentido (durante el viaje
  // de la salida: es lo que se lo pisaba en A8.1).
  let gestos = 0
  const yaSalioYSiguio = (paso: number): boolean => listo(paso) && ++gestos > 2
  switch (c.entrada) {
    case 'pagina-abajo':
    case 'pagina-arriba':
      return teclas(p, sentido === 1 ? 'PageDown' : 'PageUp', v, yaSalioYSiguio)
    case 'flechas':
      return teclas(p, sentido === 1 ? 'ArrowDown' : 'ArrowUp', v, yaSalioYSiguio)
    case 'barra-de-scroll':
      return arrastre(p, sentido, v, listo)
    default:
      return rueda(p, sentido, v, yaSalioYSiguio)
  }
}

const nombre = (c: Combinacion): string => `${c.entrada} → ${c.salida} · ${c.hover ? 'con hover' : 'sin hover'} · ${c.velocidad}`

async function unaCombinacion(p: Page, c: Combinacion, archivo: string, ancho: number, alto: number, defecto = false): Promise<boolean> {
  const fotos: { readonly vuelta: number; readonly momento: string; readonly violaciones: Violacion[]; readonly foto: FotoDelPortfolio }[] = []
  const puesto = c.hover ? HOVER(ancho, alto) : COLUMNA(ancho, alto)
  if (c.entrada !== 'hash-trabajos' && c.entrada !== 'hash-portfolio') await cargar(p)
  for (let vuelta = 0; vuelta < IDAS_Y_VUELTAS; vuelta++) {
    await p.mouse.move(puesto.x, puesto.y, { steps: 4 })
    await entrar(p, c, vuelta)
    const f1 = await foto(p, await reposo(p))
    fotos.push({ vuelta, momento: 'adentro', violaciones: violaciones(f1, 'adentro'), foto: f1 })
    await salir(p, c, ancho, alto)
    const f2 = await foto(p, await reposo(p))
    fotos.push({ vuelta, momento: 'afuera', violaciones: violaciones(f2, 'afuera'), foto: f2 })
  }
  const malas = fotos.filter((f) => f.violaciones.length > 0)
  appendFileSync(archivo, `${JSON.stringify({ tipo: 'combinacion', ...c, defecto, ok: malas.length === 0, fotos })}\n`)
  const resumen = malas.map((f) => `${String(f.vuelta + 1)}·${f.momento}: ${f.violaciones.join(',')}${f.foto.fallas.length > 0 ? ` (${f.foto.fallas.join(' | ')})` : ''}`).join(' ; ')
  console.log(`${malas.length === 0 ? 'ok   ' : 'FALLA'} ${nombre(c)}${defecto ? ' (con el defecto de A8.1)' : ''}${resumen === '' ? '' : ` · ${resumen}`}`)
  return malas.length === 0
}

// ─── A3: la rueda con el mouse que se mueve a mitad de la transición ─────

async function a3(p: Page, archivo: string): Promise<void> {
  await cargar(p, '#portfolio-el-garage')
  const lomo = await p.evaluate(() => {
    const r = document.querySelector('[data-tira="banu-scents"]')?.getBoundingClientRect()
    return r === undefined ? null : { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  })
  if (lomo === null) return
  // `A3_PX=1` u `8`: un solo caso (la tanda partida a la mitad, si se cae por memoria).
  for (const px of process.env.A3_PX === undefined ? [1, 8] : [Number(process.env.A3_PX)]) {
    // El mouse estacionado sobre el lomo de Banú ANTES de cargar (llega quieto: no lo activa) y una muesca hacia abajo: a Esquina.
    await p.goto('about:blank')
    await p.mouse.move(lomo.x, lomo.y)
    await cargar(p, '#portfolio-el-garage')
    await reposo(p)
    const antes = await pasoAhora(p)
    await p.mouse.wheel(0, 100)
    await dormir(150)
    await p.mouse.move(lomo.x + px, lomo.y)
    await reposo(p)
    const despues = await pasoAhora(p)
    const ok = antes === 0 && despues === 1
    appendFileSync(archivo, `${JSON.stringify({ tipo: 'a3', px, antes, despues, ok })}\n`)
    console.log(`${ok ? 'ok   ' : 'FALLA'} A3 · una muesca y ${String(px)} px de mouse a mitad de la transición · ${String(antes)} → ${String(despues)} (tiene que ser 0 → 1)`)
  }
}

// ─── A1 y A10: la píldora y el orden, cuadro a cuadro ────────────────────

const MUESTREO = `(() => {
  const t0 = performance.now()
  const log = (window.__cuadros = [])
  const cuadro = () => {
    const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
    const pastilla = document.querySelector('[data-pieza="barra"] [data-parte="pastilla"]')
    const panel = document.querySelector('[data-pieza="panel-del-portfolio"]')
    const enlace = document.querySelector('[data-pieza="barra"] a[data-nav-id="servicios"]')
    const p = pastilla ? pastilla.getBoundingClientRect() : null
    const b = enlace ? enlace.getBoundingClientRect() : null
    const debajo = b ? document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2) : null
    log.push({
      t: performance.now() - t0,
      encabezado: e ? e.getAttribute('data-encabezado') : null,
      camara: e ? e.getAttribute('data-camara') : null,
      panelIzq: panel ? panel.getBoundingClientRect().left : null,
      l: p ? p.left : null, r: p ? p.right : null,
      usable: debajo !== null && enlace !== null && enlace.contains(debajo),
    })
    if (log.length < 600) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

interface Cuadro {
  readonly t: number
  readonly encabezado: string | null
  readonly camara: string | null
  readonly panelIzq: number | null
  readonly l: number | null
  readonly r: number | null
  readonly usable: boolean
}

async function a1(archivo: string): Promise<void> {
  for (const [ancho, alto] of [[1440, 900], [1280, 800], [1024, 768]] as const) {
    const { ctx, p } = await abrir(false, ancho, alto)
    try {
      await cargar(p)
      await p.mouse.move(ancho * 0.2, alto * 0.55)
      await alPx(p, 880)
      await reposo(p)
      await p.evaluate(MUESTREO)
      // Una muesca: entra al pin y el orden corre entero.
      await p.mouse.wheel(0, 100)
      await dormir(4500)
      const cuadros = await p.evaluate(() => (window as unknown as { __cuadros: Cuadro[] }).__cuadros)
      const f = await foto(p, await reposo(p))
      const l0 = cuadros[0]?.l ?? Number.NaN
      const r0 = cuadros[0]?.r ?? Number.NaN
      const titulo = cuadros.find((c) => c.encabezado === 'si')?.t ?? Number.NaN
      const panel = cuadros.find((c) => c.panelIzq !== null && c.panelIzq < ancho - 1)?.t ?? Number.NaN
      const mueveL = cuadros.find((c) => c.l !== null && Math.abs(c.l - l0) > 0.5)?.t ?? Number.NaN
      const mueveR = cuadros.find((c) => c.r !== null && Math.abs(c.r - r0) > 0.5)?.t ?? Number.NaN
      const fin = cuadros.filter((c) => c.l !== null && c.r !== null).map((c) => c.l ?? 0)
      const lFinal = fin[fin.length - 1] ?? Number.NaN
      const quietaDesde = cuadros.find((c, i) => i > 0 && c.l !== null && Math.abs((c.l ?? 0) - lFinal) < 0.5 && Math.abs((c.r ?? 0) - (cuadros[cuadros.length - 1]?.r ?? 0)) < 0.5 && c.t > mueveL)?.t ?? Number.NaN
      const anchoMinimo = Math.min(...cuadros.filter((c) => c.l !== null && c.r !== null).map((c) => (c.r ?? 0) - (c.l ?? 0)))
      const medida = {
        ancho,
        tituloAlPanel: (panel - titulo) / 1400,
        pastilla: { izquierdaFinal: Math.round(f.pastilla.l), derechaFinal: Math.round(f.pastilla.r), eje: Math.round(f.eje), aDelEje: Math.abs((f.pastilla.l + f.pastilla.r) / 2 - f.eje) / ancho, alSonido: Math.round(f.pastilla.l - f.finDelSonido), alPanel: Math.round(f.bordeDelPanel - f.pastilla.r) },
        primeroElIzquierdo: mueveL < mueveR,
        duracionMs: quietaDesde - mueveL,
        terminaAntesDelPanel: quietaDesde <= panel + 17,
        nuncaMasAngosta: anchoMinimo >= r0 - l0 - 0.5,
        usableSiempre: cuadros.every((c) => c.usable),
        violaciones: violaciones(f, 'adentro'),
      }
      appendFileSync(archivo, `${JSON.stringify({ tipo: 'a1', ...medida, cuadros })}\n`)
      console.log(`A1/A10 · ${String(ancho)} · título→panel ${(medida.tituloAlPanel * 100).toFixed(1)} % · píldora ${String(medida.pastilla.izquierdaFinal)}–${String(medida.pastilla.derechaFinal)} (eje ${String(medida.pastilla.eje)}, ${(medida.pastilla.aDelEje * 100).toFixed(2)} %; al sonido ${String(medida.pastilla.alSonido)} px, al panel ${String(medida.pastilla.alPanel)} px) · primero el izquierdo ${String(medida.primeroElIzquierdo)} · ${medida.duracionMs.toFixed(0)} ms · antes del panel ${String(medida.terminaAntesDelPanel)} · nunca más angosta ${String(medida.nuncaMasAngosta)} · usable ${String(medida.usableSiempre)} · ${medida.violaciones.join(',') || 'invariante ok'}`)
    } finally {
      await ctx.close()
    }
  }
}

// ─── A9: el hueco entre la salida del Portfolio y la entrada de Demos ────

async function a9(p: Page, archivo: string): Promise<void> {
  await cargar(p)
  for (const sentido of ['bajando', 'subiendo'] as const) {
    let vacios = 0
    const puntos: number[] = []
    for (let i = 0; i <= 40; i++) puntos.push(6100 + i * 25)
    if (sentido === 'subiendo') puntos.reverse()
    await alPx(p, sentido === 'bajando' ? 5900 : 7300)
    await reposo(p)
    const filas: { readonly px: number; readonly portfolio: boolean; readonly demos: number }[] = []
    for (const px of puntos) {
      await alPx(p, px)
      await reposo(p)
      const r = await p.evaluate(() => {
        const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
        const t = document.querySelector<HTMLElement>('[data-capa="demos"] #demos > div:first-child')
        return { portfolio: e?.getAttribute('data-panel-adentro') === 'si' || e?.getAttribute('data-encabezado') === 'si', demos: t === null ? 0 : Number(t.style.opacity || '0') }
      })
      if (!r.portfolio && r.demos <= 0.001) vacios += 25
      filas.push({ px, ...r })
    }
    appendFileSync(archivo, `${JSON.stringify({ tipo: 'a9', sentido, vacios, filas })}\n`)
    console.log(`A9 · ${sentido}: ${String(vacios)} px de la regla con la escena sola (de a 25 px, entre 6100 y 7100)`)
  }
}

// ─── [B1.2d] A2.3: la ráfaga ──────────────────────────────────────────────

/** Px de la regla de la cola, con el Portfolio ya ido (la ráfaga que sube desde ahí entra al tramo con cinco muescas). */
const PX_EN_LA_COLA = 6700
/** El centro de Banú (el tercer paso): desde ahí la ráfaga que sube tiene dos proyectos por recorrer. */
const PX_EN_BANU = 4275

const GRABACION = `(() => {
  const log = (window.__rafaga = [])
  const cuadro = () => {
    const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
    log.push({ barra: e ? e.getAttribute('data-barra') === 'si' : false, panel: e ? e.getAttribute('data-panel-adentro') === 'si' : false, paso: Number(e ? e.getAttribute('data-paso') : NaN) })
    if (log.length < 900) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

/** Una ráfaga: cinco muescas en 200 ms, o el deslizamiento con inercia del trackpad (el «rápido» de antes). */
async function gestoDeRafaga(p: Page, sentido: 1 | -1, gesto: GestoDeRafaga): Promise<void> {
  if (gesto === 'muescas') {
    for (let k = 0; k < 5; k++) {
      await p.mouse.wheel(0, 100 * sentido)
      await dormir(50)
    }
    return
  }
  for (let k = 0; k < 45; k++) {
    await p.mouse.wheel(0, sentido * Math.max(2, 80 * 0.94 ** k))
    await dormir(16)
  }
}

/** [F2] Espera (a lo sumo 4 s) a que el paso sea el de aterrizaje con el panel todavía afuera: `false` si el panel entró antes. */
async function aterrizandoSinPanel(p: Page, paso: number): Promise<boolean> {
  const t0 = Date.now()
  while (Date.now() - t0 < 4000) {
    const s = await p.evaluate(() => {
      const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
      return { paso: Number(e?.getAttribute('data-paso') ?? NaN), panel: e?.getAttribute('data-panel-adentro') === 'si' }
    })
    if (s.panel) return false
    if (s.paso === paso) return true
    await dormir(40)
  }
  return false
}

async function unaRafaga(p: Page, c: CombinacionDeRafaga, archivo: string, ancho: number, alto: number): Promise<boolean> {
  const fotos: { readonly vuelta: number; readonly momento: string; readonly violaciones: string[]; readonly foto: FotoDelPortfolio }[] = []
  const puesto = c.hover ? HOVER(ancho, alto) : COLUMNA(ancho, alto)
  const baja = c.rafaga.endsWith('bajando')
  const entra = c.rafaga.startsWith('entrar')
  await cargar(p)
  for (let vuelta = 0; vuelta < IDAS_Y_VUELTAS; vuelta++) {
    await p.mouse.move(puesto.x, puesto.y, { steps: 4 })
    let desde = baja ? -1 : 4
    if (c.rafaga === 'entrar-bajando') await alPx(p, PX_ARRIBA)
    else if (c.rafaga === 'entrar-subiendo') await alPx(p, PX_EN_LA_COLA)
    else {
      // Adentro: bajando, una muesca suelta desde justo antes del pin (El Garage); subiendo, desde Banú.
      await alPx(p, baja ? 880 : PX_EN_BANU)
      await reposo(p)
      if (baja) await p.mouse.wheel(0, 100)
      const f0 = await foto(p, await reposo(p))
      fotos.push({ vuelta, momento: 'adentro', violaciones: violaciones(f0, 'adentro'), foto: f0 })
      desde = f0.paso
    }
    await reposo(p)
    await p.evaluate(GRABACION)
    await gestoDeRafaga(p, baja ? 1 : -1, c.gesto)
    // [F2] Entrando, el resto del impulso: con el paso ya en el de aterrizaje y el panel todavía afuera (el caso de F1), otra ráfaga; se tiene
    // que descartar. El trackpad del arnés dura unos 2,9 s (cada evento de Playwright tarda ~64 ms): su propia cola ya cubre la entrada.
    const otra = entra && (await aterrizandoSinPanel(p, baja ? 0 : 3))
    if (otra) await gestoDeRafaga(p, baja ? 1 : -1, c.gesto)
    const f = await foto(p, await reposo(p))
    const cuadros = await p.evaluate(() => (window as unknown as { __rafaga: { barra: boolean; panel: boolean; paso: number }[] }).__rafaga)
    fotos.push({ vuelta, momento: otra ? 'despues (dos ráfagas)' : 'despues', violaciones: [...violaciones(f, 'adentro'), ...violacionesDeLaRafaga(c.rafaga, cuadros, desde, f.paso)], foto: f })
  }
  const malas = fotos.filter((f) => f.violaciones.length > 0)
  appendFileSync(archivo, `${JSON.stringify({ tipo: 'rafaga', ...c, control: CONTROL, ok: malas.length === 0, fotos })}\n`)
  const resumen = malas.map((f) => `${String(f.vuelta + 1)}·${f.momento}: ${f.violaciones.join(',')} (paso ${String(f.foto.paso)})`).join(' ; ')
  console.log(`${malas.length === 0 ? 'ok   ' : 'FALLA'} ráfaga ${c.rafaga} · ${c.gesto} · ${c.hover ? 'con hover' : 'sin hover'}${CONTROL === 'rafaga' ? ' (con la rueda de antes)' : ''}${resumen === '' ? '' : ` · ${resumen}`}`)
  return malas.length === 0
}

// ─── [B1.2d] A2.1 y A2.2: el despeje del medio y el tiempo de la píldora ──

const MEDIDA_DEL_DESPEJE = `(() => {
  const pastilla = document.querySelector('[data-pieza="barra"] [data-parte="pastilla"]')
  const panel = document.querySelector('[data-pieza="panel-del-portfolio"]')
  const medio = [...document.querySelectorAll('[id^="portfolio-medio-"]')].find((m) => !m.hidden)
  const figura = medio ? medio.querySelector('figure') : null
  const region = [...document.querySelectorAll('[id^="portfolio-region-"]')].find((m) => !m.hidden)
  const p = pastilla ? pastilla.getBoundingClientRect() : null
  const pa = panel ? panel.getBoundingClientRect() : null
  const f = figura ? figura.getBoundingClientRect() : null
  const ultimo = region ? [...region.querySelectorAll('*')].reduce((m, x) => Math.max(m, x.getBoundingClientRect().bottom), 0) : 0
  return { pastilla: p ? { l: p.left, r: p.right, abajo: p.bottom } : null, panel: pa ? { l: pa.left, abajo: pa.bottom } : null, medio: f ? { arriba: f.top, abajo: f.bottom, alto: f.height } : null,
    ultimoDeLaFicha: ultimo, desborda: region ? region.scrollHeight > region.clientHeight + 1 : null }
})()`

interface MedidaDelDespeje {
  readonly pastilla: { readonly l: number; readonly r: number; readonly abajo: number } | null
  readonly panel: { readonly l: number; readonly abajo: number } | null
  readonly medio: { readonly arriba: number; readonly abajo: number; readonly alto: number } | null
  readonly ultimoDeLaFicha: number
  readonly desborda: boolean | null
}

/** El primer cuadro que cumple (su tiempo, ms), o NaN. */
const primero = (cs: readonly Cuadro[], f: (c: Cuadro, i: number) => boolean): number => cs.find(f)?.t ?? Number.NaN

async function a2(archivo: string): Promise<void> {
  for (const [ancho, alto] of [[1440, 900], [1280, 800], [1180, 800], [1024, 768]] as const) {
    const { ctx, p } = await abrir(false, ancho, alto)
    try {
      await cargar(p)
      await p.mouse.move(ancho * 0.2, alto * 0.55)
      await alPx(p, 880)
      await reposo(p)
      await p.evaluate(MUESTREO)
      await p.mouse.wheel(0, 100)
      await dormir(4500)
      const entrada = await p.evaluate(() => (window as unknown as { __cuadros: Cuadro[] }).__cuadros)
      await reposo(p)
      const d = (await p.evaluate(MEDIDA_DEL_DESPEJE)) as MedidaDelDespeje
      // La salida: una muesca hacia arriba desde El Garage (la rueda sale hacia arriba).
      await p.evaluate(MUESTREO)
      await p.mouse.wheel(0, -100)
      await dormir(4500)
      const salida = await p.evaluate(() => (window as unknown as { __cuadros: Cuadro[] }).__cuadros)
      const panelEntra = primero(entrada, (c) => c.panelIzq !== null && c.panelIzq < ancho - 1)
      const rMax = Math.max(...entrada.map((c) => c.r ?? Number.NEGATIVE_INFINITY))
      const enElMaximo = primero(entrada, (c) => c.r === rMax)
      const contrae = primero(entrada, (c) => c.r !== null && c.r < rMax - 0.5 && c.t > enElMaximo)
      const estira = primero(entrada, (c) => c.l !== null && c.l < (entrada[0]?.l ?? 0) - 0.5)
      const panelSale = primero(salida, (c, i) => i > 0 && c.panelIzq !== null && c.panelIzq > (salida[0]?.panelIzq ?? 0) + 0.5)
      const expande = primero(salida, (c) => c.r !== null && c.r > (salida[0]?.r ?? 0) + 0.5)
      const comprime = primero(salida, (c) => c.l !== null && c.l > (salida[0]?.l ?? 0) + 0.5)
      const superpone = d.pastilla !== null && d.panel !== null && d.pastilla.r + 16 > d.panel.l
      const medida = {
        ancho,
        alto,
        superpone,
        alPanel: d.pastilla !== null && d.panel !== null ? Math.round(d.panel.l - d.pastilla.r) : null,
        medioBajoLaPastilla: d.pastilla !== null && d.medio !== null ? Math.round(d.medio.arriba - d.pastilla.abajo) : null,
        medio: d.medio,
        ultimoDeLaFicha: Math.round(d.ultimoDeLaFicha),
        panelAbajo: d.panel?.abajo ?? null,
        desborda: d.desborda,
        entrada: { estiraMs: Math.round(estira), contraeMs: Math.round(contrae), panelMs: Math.round(panelEntra), contraeAlPanelMs: Math.round(contrae - panelEntra) },
        salida: { panelMs: Math.round(panelSale), expandeMs: Math.round(expande), comprimeMs: Math.round(comprime), expandeALaSalidaMs: Math.round(expande - panelSale) },
      }
      appendFileSync(archivo, `${JSON.stringify({ tipo: 'a2', ...medida, entradaCuadros: entrada, salidaCuadros: salida })}\n`)
      console.log(`A2 · ${String(ancho)}×${String(alto)} · píldora al panel ${String(medida.alPanel)} px (${superpone ? 'se mete' : 'entra'}) · medio ${String(medida.medioBajoLaPastilla)} px bajo la píldora · ficha hasta ${String(medida.ultimoDeLaFicha)} de ${String(medida.panelAbajo)} (desborda ${String(medida.desborda)}) · entrada: estira ${String(medida.entrada.estiraMs)}, contrae ${String(medida.entrada.contraeMs)}, panel ${String(medida.entrada.panelMs)} (Δ ${String(medida.entrada.contraeAlPanelMs)} ms) · salida: panel ${String(medida.salida.panelMs)}, expande ${String(medida.salida.expandeMs)} (Δ ${String(medida.salida.expandeALaSalidaMs)} ms), comprime ${String(medida.salida.comprimeMs)}`)
    } finally {
      await ctx.close()
    }
  }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const archivo = path.join(SALIDA, `${MODO}-${CONTROL ?? TANDA}${RANGO === null ? '' : `-${String(RANGO[0])}-${String(RANGO[1])}`}.jsonl`)
  writeFileSync(archivo, '')
  if (MODO === 'a1') {
    await a1(archivo)
    return
  }
  if (MODO === 'a2') {
    await a2(archivo)
    return
  }
  if (MODO === 'rafaga') {
    // Un Chrome nuevo por combinación. [F2] Con CONTROL=rafaga, la rueda de antes (`rueda-en-la-entrada`: sin la trampa): las de entrar
    // con muescas tienen que fallar (la segunda ráfaga avanza mientras el Portfolio entra; el trackpad del arnés no discrimina: su cola es
    // un solo gesto).
    const todas = combinacionesDeRafaga().filter((c, i) => (CONTROL !== 'rafaga' || (c.rafaga.startsWith('entrar') && c.gesto === 'muescas')) && (RANGO === null || (i >= RANGO[0] && i <= RANGO[1])))
    let bien = 0
    for (const c of todas) {
      const { ctx, p } = await abrir(CONTROL === 'rafaga' ? 'rueda-en-la-entrada' : false)
      try {
        if ((await unaRafaga(p, c, archivo, 1440, 900)) === (CONTROL !== 'rafaga')) bien += 1
      } finally {
        await ctx.close()
      }
    }
    console.log(`ráfaga${CONTROL === null ? '' : ` (control ${CONTROL})`}: ${String(bien)} de ${String(todas.length)} como tenían que dar`)
    return
  }
  if (MODO === 'a3' || MODO === 'a9') {
    const { ctx, p } = await abrir(false)
    try {
      if (MODO === 'a3') await a3(p, archivo)
      else await a9(p, archivo)
    } finally {
      await ctx.close()
    }
    return
  }
  // La matriz: un Chrome nuevo por combinación (uno solo, reusado, juntaba memoria hasta que el sistema cortaba la corrida).
  const todas = combinaciones().map((c, i) => ({ c, i }))
  const elegidas = CONTROL === 'a81' ? todas.filter(({ i }) => i === 0).map(({ c }) => ({ c, defecto: true }))
    : CONTROL === 'final' ? [...todas.filter(({ i }) => i <= 2).map(({ c }) => ({ c, defecto: false })), ...todas.filter(({ i }) => i === 0).map(({ c }) => ({ c, defecto: true }))]
      : todas.filter(({ c, i }) => (SOLO === null || SOLO.includes(c.entrada)) && (RANGO === null || (i >= RANGO[0] && i <= RANGO[1]))).map(({ c }) => ({ c, defecto: false }))
  let malas = 0
  for (const { c, defecto } of elegidas) {
    const { ctx, p } = await abrir(defecto)
    try {
      const bien = await unaCombinacion(p, c, archivo, 1440, 900, defecto)
      if (bien === defecto) malas += 1
    } finally {
      await ctx.close()
    }
  }
  console.log(`matriz${CONTROL === null ? '' : ` (control ${CONTROL})`}${RANGO === null ? '' : ` [${String(RANGO[0])}–${String(RANGO[1])}]`}: ${String(elegidas.length - malas)} de ${String(elegidas.length)} como tenían que dar (las del defecto, en falla)`)
}
void main()
