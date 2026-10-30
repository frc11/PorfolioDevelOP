/**
 * [L2] EL PORTFOLIO, SU FORMULARIO, DEMOS Y EL SCROLL SIMPLE EN EL TELÉFONO Y LA TABLET, EN EL SITIO — contra el dev (`BASE`), con el Chrome del
 * sistema a la vista, `/api/` bloqueado y el dedo por CDP. Lo corre el orquestador (no el subagente).
 *
 *   MODO=pantalla    con el tope de la pantalla del Portfolio arriba del cuadro: el título, la bajada, la tarjeta activa, las flechas y las
 *                    barras, todos adentro del cuadro (0 ≤ top, bottom ≤ alto, right ≤ ancho). A 390×844, 375×667, 425×824 y 768×1024.
 *                    CONTROL=con-resena: la reseña de la tarjeta a la vista (la de antes); tiene que FALLAR a 375×667.
 *   MODO=ancla       la carga con `#portfolio-banu-scents`: lo mismo, con Banú activa.
 *   MODO=formulario  «la tuya» a 320×700, 360×740, 375×667, 390×844 y 425×824: ningún descendiente del bloque pasa su borde derecho, y el
 *                    hueco entre el pie de los mandos del carrusel y el tope del bloque ≤ 96 px.
 *                    CONTROL=desborde: los campos con su ancho de contenido (`min-width: max-content`); tiene que FALLAR.
 *   MODO=velo        el bloque de Demos con el halo (`text-shadow`) y su párrafo con el degradé (`::before`), como el del Portfolio.
 *   MODO=recorrido   la rueda y el dedo desde el Portfolio hasta «Nuestros servicios» y de vuelta, a 390×844 y 768×1024: ningún vuelo de
 *                    gatillo de Servicios en el cruce con Demos (bajando ni subiendo), cada gesto mueve la página (nada trabado) y el
 *                    tramo con Demos llenando el cuadro ≤ 0,1 pantallas (el recorrido largo de antes, ~3,3).
 *                    CONTROL=con-gatillo: Servicios con la entrada y la salida de arriba de antes (`con-gatillo-arriba`); tiene que FALLAR.
 *   MODO=alturas     la sección mide exactamente el flujo y una pantalla (Demos) y Servicios empieza en su pie: lo que supone el tramo anotado a
 *                    la escena (s76 §48 prueba la cuenta). A 320, 375, 390, 768 y 1000 de ancho.
 *
 *   BASE=http://localhost:3002 MODO=pantalla BANCO_FOTOS=C:\nocturno\cola3-fotos\L2 npx tsx scripts-carga/l2-telefono.ts
 */
import { rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'

import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'
import { desplazarConElDedo } from './tactil'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const MODO = process.env.MODO ?? 'pantalla'
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('l2-telefono')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const etiqueta = CONTROL === '' ? 'producto' : CONTROL

const TAMANOS: Readonly<Record<string, readonly (readonly [number, number])[]>> = {
  pantalla: [[390, 844], [375, 667], [425, 824], [768, 1024]],
  ancla: [[390, 844], [375, 667], [768, 1024]],
  formulario: [[320, 700], [360, 740], [375, 667], [390, 844], [425, 824]],
  velo: [[425, 824], [390, 844]],
  recorrido: [[390, 844], [768, 1024]],
  alturas: [[320, 700], [375, 667], [390, 844], [768, 1024], [1000, 800]],
}
const ELEGIDOS = process.env.ANCHOS?.split(',').map((a) => a.split('x').map(Number) as [number, number]) ?? TAMANOS[MODO] ?? []

const CSS_DEL_CONTROL: Readonly<Record<string, string>> = {
  desborde: '[data-pieza="la-tuya-del-carrusel"] input,[data-pieza="la-tuya-del-carrusel"] label{min-width:max-content!important}',
}

interface Fila {
  readonly tamano: string
  readonly caso: string
  readonly bien: boolean
  readonly detalle: string
}

async function abrir(ancho: number, alto: number, hash = ''): Promise<{ readonly p: Page; readonly cdp: CDPSession; readonly cerrar: () => Promise<void> }> {
  const perfil = perfilDelBanco('l2-telefono')
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  if (CONTROL === 'con-gatillo') await ctx.addInitScript(`window.__defectosDeLosGatillos = 'con-gatillo-arriba'`)
  const css = CSS_DEL_CONTROL[CONTROL]
  if (css !== undefined)
    await ctx.addInitScript(`(() => { const poner = () => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(css)}; document.head.appendChild(s) }; if (document.head) poner(); else document.addEventListener('DOMContentLoaded', poner) })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  const cdp = await ctx.newCDPSession(p)
  await p.goto(`${BASE}/v3${hash}`, { waitUntil: 'load', timeout: 240000 })
  const t0 = Date.now()
  while (Date.now() - t0 < 60000) {
    if (await p.evaluate(() => document.querySelector('[data-pantalla="portfolio"]') !== null && document.visibilityState === 'visible' && innerWidth > 0).catch(() => false)) break
    await dormir(250)
  }
  await dormir(2500)
  return { p, cdp, cerrar: () => ctx.close() }
}

const quieto = (p: Page): Promise<unknown> => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))))

async function irAlTopeDe(p: Page, selector: string, corrimiento = 0): Promise<void> {
  await p.evaluate(([s, c]) => {
    const el = document.querySelector(s as string)
    if (el === null) throw new Error(`sin ${String(s)}`)
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + (c as number), behavior: 'instant' })
  }, [selector, corrimiento] as const)
  await quieto(p)
}

/** Lo que tiene que entrar en el cuadro: el título, la bajada, la tarjeta activa, las flechas y las barras. */
async function loQueEntra(p: Page): Promise<{ readonly fuera: string[]; readonly activa: string | null }> {
  return p.evaluate(() => {
    const pant = document.querySelector('[data-pantalla="portfolio"]')
    const piezas: Record<string, Element | null> = {
      titulo: pant?.querySelector('h2') ?? null,
      bajada: pant?.querySelector('[data-pieza="encabezado-del-portfolio"] p') ?? null,
      tarjeta: pant?.querySelector('[data-parte="ranura"][data-activa="si"] [data-pieza="tarjeta-del-proyecto"]') ?? null,
      flechas: pant?.querySelector('[data-parte="mandos"]') ?? null,
      barras: pant?.querySelector('[data-parte="lineas"]') ?? null,
    }
    const fuera: string[] = []
    for (const [n, el] of Object.entries(piezas)) {
      if (el === null) {
        fuera.push(`${n}: no está`)
        continue
      }
      const r = el.getBoundingClientRect()
      if (r.top < -0.5 || r.bottom > innerHeight + 0.5 || r.right > innerWidth + 0.5 || r.left < -0.5) fuera.push(`${n} ${r.top.toFixed(0)}–${r.bottom.toFixed(0)} (cuadro ${String(innerHeight)})`)
    }
    // Lo que se lee de la tarjeta activa: ninguna fila de la ficha cortada por la tarjeta.
    const t = piezas.tarjeta
    if (t !== null) {
      const rt = t.getBoundingClientRect()
      // Cada pieza a la vista de la tarjeta (las filas, la reseña si se ve, el nombre): entera adentro de la tarjeta.
      for (const f of t.querySelectorAll('[data-pieza="ficha"] [data-fila], [data-pieza="ficha"] > figure, [data-fila="nombre"]')) {
        const r = f.getBoundingClientRect()
        if (r.height > 0 && r.bottom > rt.bottom - 4 + 0.5) fuera.push(`${f.getAttribute('data-fila') ?? f.getAttribute('data-parte') ?? '?'} cortada (${r.bottom.toFixed(0)} > ${(rt.bottom - 4).toFixed(0)})`)
      }
      const video = t.querySelector('figure')?.getBoundingClientRect()
      if (video !== undefined && video.height < 0.12 * innerHeight) fuera.push(`el video mide ${video.height.toFixed(0)} px (< 12 % del cuadro)`)
    }
    return { fuera, activa: t?.getAttribute('data-proyecto') ?? null }
  })
}

async function foto(p: Page, nombre: string): Promise<void> {
  writeFileSync(path.join(SALIDA, `${nombre}-${etiqueta}.png`), await p.screenshot({ type: 'png' }))
}

async function pantalla(ancho: number, alto: number): Promise<Fila[]> {
  const { p, cerrar } = await abrir(ancho, alto)
  try {
    await irAlTopeDe(p, '[data-pantalla="portfolio"]')
    await dormir(2200)
    // El control: la reseña a la vista (la `[hidden]` de Tailwind va en una capa con `!important`: un estilo inyectado no le gana).
    if (CONTROL === 'con-resena') await p.evaluate(() => document.querySelectorAll('[data-parte="resena"]').forEach((e) => e.removeAttribute('hidden')))
    await quieto(p)
    const m = await loQueEntra(p)
    await foto(p, `pantalla-${String(ancho)}x${String(alto)}`)
    return [{ tamano: `${String(ancho)}×${String(alto)}`, caso: 'el Portfolio en una pantalla', bien: m.fuera.length === 0, detalle: m.fuera.length === 0 ? 'todo adentro' : m.fuera.join(' · ') }]
  } finally {
    await cerrar()
  }
}

async function ancla(ancho: number, alto: number): Promise<Fila[]> {
  const { p, cerrar } = await abrir(ancho, alto, '#portfolio-banu-scents')
  try {
    await dormir(3000)
    const m = await loQueEntra(p)
    await foto(p, `ancla-${String(ancho)}x${String(alto)}`)
    const bien = m.fuera.length === 0 && m.activa === 'banu-scents'
    return [{ tamano: `${String(ancho)}×${String(alto)}`, caso: 'el ancla de Banú', bien, detalle: `activa ${String(m.activa)}; ${m.fuera.length === 0 ? 'todo adentro' : m.fuera.join(' · ')}` }]
  } finally {
    await cerrar()
  }
}

async function formulario(ancho: number, alto: number): Promise<Fila[]> {
  const { p, cerrar } = await abrir(ancho, alto)
  try {
    await irAlTopeDe(p, '[data-pieza="la-tuya-del-carrusel"]', -80)
    await dormir(1500)
    const m = await p.evaluate(() => {
      const bloque = document.querySelector('[data-pieza="la-tuya-del-carrusel"]')
      const mandos = document.querySelector('[data-pantalla="portfolio"] [data-parte="mandos"]')
      if (bloque === null || mandos === null) return null
      const rb = bloque.getBoundingClientRect()
      const desbordes: string[] = []
      for (const el of bloque.querySelectorAll('*')) {
        const r = el.getBoundingClientRect()
        if (r.width > 0 && r.right > rb.right + 0.5) desbordes.push(`${el.tagName.toLowerCase()}${el.getAttribute('data-parte') === null ? '' : `[${el.getAttribute('data-parte') ?? ''}]`} +${(r.right - rb.right).toFixed(0)}`)
      }
      const filaDelEnvio = bloque.querySelector('[data-parte="fila-del-envio"]')?.getBoundingClientRect()
      return { hueco: rb.top - mandos.getBoundingClientRect().bottom, desbordes, paginaAncha: document.documentElement.scrollWidth > innerWidth, fila: filaDelEnvio === undefined ? null : filaDelEnvio.height }
    })
    await foto(p, `formulario-${String(ancho)}x${String(alto)}`)
    if (m === null) return [{ tamano: `${String(ancho)}×${String(alto)}`, caso: 'el formulario', bien: false, detalle: 'sin el bloque o los mandos' }]
    const bien = m.desbordes.length === 0 && !m.paginaAncha && m.hueco <= 96
    return [{ tamano: `${String(ancho)}×${String(alto)}`, caso: 'el formulario', bien, detalle: `hueco ${m.hueco.toFixed(0)} px; ${m.desbordes.length === 0 ? 'nada desborda' : `desbordan ${m.desbordes.slice(0, 4).join(', ')}`}${m.paginaAncha ? '; la página se ensancha' : ''}; la fila del envío mide ${String(m.fila?.toFixed(0))}` }]
  } finally {
    await cerrar()
  }
}

async function velo(ancho: number, alto: number): Promise<Fila[]> {
  const { p, cerrar } = await abrir(ancho, alto)
  try {
    await irAlTopeDe(p, '[data-pantalla="demos"]')
    await dormir(2000)
    const m = await p.evaluate(() => {
      const leer = (bloque: Element | null, parrafo: Element | null): { readonly halo: string; readonly degrade: string } => ({
        halo: bloque === null ? '' : getComputedStyle(bloque).textShadow,
        degrade: parrafo === null ? '' : getComputedStyle(parrafo, '::before').backgroundImage,
      })
      const d = document.querySelector('[data-pantalla="demos"] [data-parte="titulo"]')
      const pf = document.querySelector('[data-pieza="encabezado-del-portfolio"]')
      return { demos: leer(d, d?.querySelector('p') ?? null), portfolio: leer(pf, pf?.querySelector('p') ?? null) }
    })
    await foto(p, `velo-${String(ancho)}x${String(alto)}`)
    const bien = m.demos.halo !== 'none' && m.demos.halo === m.portfolio.halo && m.demos.degrade.startsWith('radial-gradient') && m.demos.degrade === m.portfolio.degrade
    return [{ tamano: `${String(ancho)}×${String(alto)}`, caso: 'el velo de Demos', bien, detalle: `halo ${m.demos.halo === m.portfolio.halo ? 'igual' : 'distinto'} (${m.demos.halo.slice(0, 40)}…), degradé ${m.demos.degrade.slice(0, 30)}…` }]
  } finally {
    await cerrar()
  }
}

/** Una muestra del recorrido: el scroll, si Servicios está en un vuelo de gatillo y su paso, y lo que ocupa Demos. */
async function muestra(p: Page): Promise<{ readonly y: number; readonly vuelo: boolean; readonly paso: number; readonly demosLlena: boolean; readonly pista: number }> {
  return p.evaluate(() => {
    const pista = document.querySelector('[data-pieza="pista-de-servicios"]')
    const d = document.querySelector('[data-pantalla="demos"]')?.getBoundingClientRect()
    return {
      y: scrollY,
      vuelo: pista?.hasAttribute('data-en-vuelo') === true,
      paso: Number(pista?.getAttribute('data-paso') ?? 'NaN'),
      demosLlena: d !== undefined && d.top <= 0.5 && d.bottom >= innerHeight - 0.5,
      pista: pista === null ? Number.NaN : pista.getBoundingClientRect().top,
    }
  })
}

type Gesto = (p: Page, cdp: CDPSession, sentido: 1 | -1, ancho: number, alto: number) => Promise<void>
const RUEDA: Gesto = async (p, _cdp, sentido, ancho, alto) => {
  await p.mouse.move(ancho / 2, alto / 2)
  await p.mouse.wheel(0, sentido * 120)
}
const DEDO: Gesto = async (_p, cdp, sentido, ancho, alto) => desplazarConElDedo(cdp, ancho / 2, alto * 0.55, sentido * Math.round(alto * 0.3))

/**
 * Baja de a un gesto (con pausa: cada uno es un gesto nuevo) desde la pantalla del Portfolio hasta que Servicios queda anclado en su entrada, y
 * vuelve a subir hasta el Portfolio. Cuenta los vuelos de Servicios, los gestos que no movieron la página afuera del tramo de Servicios y
 * el scroll con Demos llenando el cuadro.
 */
async function recorrer(p: Page, cdp: CDPSession, gesto: Gesto, ancho: number, alto: number): Promise<{ readonly vuelos: number; readonly trabados: string[]; readonly llena: number; readonly gestos: number; readonly llego: boolean; readonly volvio: boolean }> {
  await irAlTopeDe(p, '[data-pantalla="portfolio"]')
  await dormir(800)
  const inicio = await muestra(p)
  let vuelos = 0
  const trabados: string[] = []
  let llena = 0
  let gestos = 0
  let antes = inicio
  let llego = false
  // Bajando: hasta que la pista de Servicios quede anclada (su tope arriba del cuadro) o 60 gestos.
  for (let i = 0; i < 60 && !llego; i++) {
    await gesto(p, cdp, 1, ancho, alto)
    gestos += 1
    for (let k = 0; k < 10; k++) {
      await dormir(60)
      if ((await muestra(p)).vuelo) vuelos += 1
    }
    await dormir(250)
    const ahora = await muestra(p)
    if (ahora.vuelo) vuelos += 1
    if (antes.demosLlena && ahora.demosLlena) llena += Math.abs(ahora.y - antes.y)
    if (Math.abs(ahora.y - antes.y) < 1 && ahora.pista > 0.5) trabados.push(`bajando, gesto ${String(i + 1)} en ${String(Math.round(ahora.y))}`)
    llego = ahora.pista <= 0.5 && ahora.paso === 0
    antes = ahora
  }
  // Subiendo: hasta volver al tope del Portfolio.
  let volvio = false
  for (let i = 0; i < 60 && !volvio; i++) {
    await gesto(p, cdp, -1, ancho, alto)
    gestos += 1
    for (let k = 0; k < 10; k++) {
      await dormir(60)
      if ((await muestra(p)).vuelo) vuelos += 1
    }
    await dormir(250)
    const ahora = await muestra(p)
    if (ahora.vuelo) vuelos += 1
    if (antes.demosLlena && ahora.demosLlena) llena += Math.abs(ahora.y - antes.y)
    if (Math.abs(ahora.y - antes.y) < 1 && ahora.y > inicio.y + 1) trabados.push(`subiendo, gesto ${String(i + 1)} en ${String(Math.round(ahora.y))}`)
    volvio = ahora.y <= inicio.y + 1
    antes = ahora
  }
  return { vuelos, trabados, llena, gestos, llego, volvio }
}

async function recorrido(ancho: number, alto: number): Promise<Fila[]> {
  const filas: Fila[] = []
  for (const [nombre, gesto] of [['rueda', RUEDA], ['dedo', DEDO]] as const) {
    const { p, cdp, cerrar } = await abrir(ancho, alto)
    try {
      const r = await recorrer(p, cdp, gesto, ancho, alto)
      const bien = r.vuelos === 0 && r.trabados.length === 0 && r.llena <= 0.1 * alto && r.llego && r.volvio
      filas.push({
        tamano: `${String(ancho)}×${String(alto)}`,
        caso: `recorrido con ${nombre}`,
        bien,
        detalle: `${String(r.gestos)} gestos; ${r.llego ? 'llegó a «Nuestros servicios»' : 'NO llegó a Servicios'}, ${r.volvio ? 'volvió al Portfolio' : 'NO volvió'}; vuelos ${String(r.vuelos)}; Demos llenando el cuadro ${(r.llena / alto).toFixed(2)} pantallas; ${r.trabados.length === 0 ? 'nada trabado' : `trabado: ${r.trabados.slice(0, 3).join(', ')}`}`,
      })
    } finally {
      await cerrar()
    }
  }
  return filas
}

/**
 * [L2] LA REGLA DE ALTURAS EN EL SITIO: el tramo anotado a la escena mide el flujo (`useMedioDelCarrusel`), así que la escena ve lo de siempre
 * después de la sección sólo si la sección mide EXACTAMENTE el flujo y una pantalla (Demos), sin piso de más, y Servicios empieza ahí.
 */
async function alturas(ancho: number, alto: number): Promise<Fila[]> {
  const { p, cerrar } = await abrir(ancho, alto)
  try {
    await dormir(1500)
    const m = await p.evaluate(() => {
      const panel = document.querySelector('[data-panel="trabajos"]')?.getBoundingClientRect()
      const flujo = document.querySelector('[data-pieza="flujo-del-portfolio"]')?.getBoundingClientRect()
      const despues = document.querySelector('[data-pieza="despues-del-flujo"]')?.getBoundingClientRect()
      const servicios = document.querySelector('[data-panel="servicios"]')?.getBoundingClientRect()
      return { panel: panel?.height ?? Number.NaN, tope: panel?.top ?? Number.NaN, flujo: flujo?.height ?? Number.NaN, despues: despues?.height ?? Number.NaN, servicios: servicios?.top ?? Number.NaN, pie: panel?.bottom ?? Number.NaN, vh: innerHeight }
    })
    const bien = Math.abs(m.panel - (m.flujo + m.vh)) <= 1 && Math.abs(m.despues - m.vh) <= 1 && Math.abs(m.servicios - m.pie) <= 1
    return [{ tamano: `${String(ancho)}×${String(alto)}`, caso: 'la sección mide el flujo y una pantalla', bien, detalle: `sección ${m.panel.toFixed(1)} = flujo ${m.flujo.toFixed(1)} + Demos ${m.despues.toFixed(1)} (cuadro ${String(m.vh)}); Servicios a ${(m.servicios - m.pie).toFixed(1)} px del pie` }]
  } finally {
    await cerrar()
  }
}

const MODOS: Readonly<Record<string, (ancho: number, alto: number) => Promise<Fila[]>>> = { pantalla, ancla, formulario, velo, recorrido, alturas }

async function main(): Promise<void> {
  const correr = MODOS[MODO]
  if (correr === undefined) throw new Error(`MODO desconocido: ${MODO}`)
  const filas: Fila[] = []
  for (const [ancho, alto] of ELEGIDOS) filas.push(...(await correr(ancho, alto)))
  for (const f of filas) console.log(`${f.bien ? '✓' : '✗'} ${f.tamano} · ${f.caso}: ${f.detalle}`)
  writeFileSync(path.join(SALIDA, `${MODO}-${etiqueta}.json`), JSON.stringify(filas, null, 2))
  const malos = filas.filter((f) => !f.bien).length
  console.log(CONTROL === '' ? `${malos === 0 ? '✓' : '✗'} ${MODO}: ${String(filas.length - malos)} de ${String(filas.length)}` : `control ${CONTROL}: ${malos > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'} (${String(malos)} casos fallan)`)
}

void main()
