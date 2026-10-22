/**
 * [B1.2e] LA MATRIZ DEL CARRUSEL, EN EL SITIO — debajo de 1024 el Portfolio es un flujo (el título, el carrusel y «la tuya») y después Demos.
 * Con el dedo (`tactil.ts`), el Chrome del sistema a la vista, contra el dev server y `/api/` bloqueado. La cuenta es `carrusel-cuenta.ts`.
 * Reemplaza a `historias.ts` (las historias se fueron del Portfolio). NO lo corre el subagente: lo corre el orquestador.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/carrusel.ts                       la matriz entera, a 390×844, 768×1024, 820×1180 y 1023×768
 *   ANCHOS=390x844 CASOS=rotacion,mantener …                                            un ancho, algunos casos
 *   CONTROL=trampa …           el control positivo: la vista del carrusel con `touch-action: none` y el `touchmove` cancelado (la trampa de
 *                              las historias): el caso `recorrido` tiene que FALLAR (el dedo sobre el carrusel no mueve la página)
 *   CONTROL=sin-pausa-fuera …  el control positivo: el observador de la vista miente (siempre a la vista): el caso `fuera` tiene que FALLAR
 *
 * Los casos (todos por defecto, en este orden):
 *   modo       el flujo (no las historias), el escenario sólo de Demos; el carrusel no ocupa la pantalla (≤ 85 % del alto); nada cortado
 *              (cada tarjeta y «la tuya» entran en su caja) y sin desborde horizontal; imprime los altos (la sección, el flujo) y la `k`
 *   recorrido  entrar y salir scrolleando con el dedo en los dos sentidos (de Números a Demos y de vuelta), grabando cuadro a cuadro: cada
 *              arrastre mueve la página (sin trampa) y nunca más de una pantalla sin nada a la vista
 *   rotacion   a la vista rota sola cada 10 s, de a una y dando la vuelta; la línea de la tarjeta se llena (a los ~5 s, por la mitad)
 *   reinicio   un cambio a mano a los 6 s: el siguiente cambio solo llega 10 s después de ESE cambio (el reloj vuelve a empezar)
 *   flechas    la siguiente tres veces vuelve a la misma (la vuelta hacia adelante); la anterior desde la primera va a la última
 *   deslices   de costado: a la izquierda la siguiente, a la derecha la anterior, dando la vuelta en los dos sentidos; un dedo vertical sobre
 *              el carrusel no cambia la tarjeta y mueve la página
 *   mantener   el dedo quieto 12 s sobre la tarjeta: pausa (`data-pausa="mantenido"`, el video quieto) y no cambia; al soltar sigue
 *   fuera      fuera de la vista 12 s: no cambia (`data-pausa="fuera-de-vista"`); al volver, corre
 *   reducido   con movimiento reducido (otro Chrome): no rota en 12 s (`data-pausa="reducido"`), las flechas andan
 *   cta        «la tuya»: a la vista, los tres campos, se escribe; «Enviar» vacío marca el error sin pedir nada; lleno, el envío (bloqueado)
 *              muestra el error con WhatsApp: ningún envío real
 *   ancla      `/v3#portfolio-esquina-estudio` carga con Esquina en el carrusel, a la vista; `#portfolio-la-tuya`, con «la tuya» a la vista
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'

import {
  CRITERIOS_DEL_CARRUSEL, arrastreLibre, noOcupaLaPantalla, quieto, reinicioDelReloj, rotaSola, vacioMaximo,
  type MuestraDelRecorrido, type MuestraDelReloj,
} from './carrusel-cuenta'
import { deslizar, desplazarConElDedo, tocar } from './tactil'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '390x844,768x1024,820x1180,1023x768').split(',').map((a) => a.split('x').map(Number) as [number, number])
const TODOS = ['modo', 'recorrido', 'rotacion', 'reinicio', 'flechas', 'deslices', 'mantener', 'fuera', 'reducido', 'cta', 'ancla'] as const
type Caso = (typeof TODOS)[number]
const CASOS = (process.env.CASOS ?? TODOS.join(',')).split(',').filter((c): c is Caso => (TODOS as readonly string[]).includes(c))
const CONTROL = process.env.CONTROL ?? null
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/b12e')
const CANTIDAD = 3
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** [CONTROL=trampa] La trampa de las historias, puesta sobre el carrusel: la vista no deja pasar el dedo vertical. */
const TRAMPA = `(() => {
  const poner = () => {
    const c = document.querySelector('[data-pieza="carrusel"]')
    const v = c && c.querySelector('[data-parte="vista"]')
    if (!c || !v || c.__trampa) return
    c.__trampa = true
    v.style.touchAction = 'none'
    c.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false })
  }
  setInterval(poner, 200)
})()`

/** [CONTROL=sin-pausa-fuera] El observador miente para el carrusel: siempre entero a la vista. */
const SIN_PAUSA_FUERA = `(() => {
  const Nativo = window.IntersectionObserver
  window.IntersectionObserver = class extends Nativo {
    constructor(cb, op) {
      super(cb, op)
      this.__cb = cb
    }
    observe(el) {
      super.observe(el)
      if (el && el.matches && el.matches('[data-pieza="carrusel"]')) {
        const avisar = () => {
          const r = el.getBoundingClientRect()
          this.__cb([{ target: el, isIntersecting: true, intersectionRatio: 1, boundingClientRect: r, intersectionRect: r, rootBounds: null, time: performance.now() }], this)
        }
        setInterval(avisar, 300)
      }
    }
  }
})()`

/** Lo que se ve de cada pieza, grabado cuadro por medio (rAF): el título, el carrusel, «la tuya» y Demos. */
const GRABAR = `(() => {
  const log = (window.__carrusel = [])
  const cruce = (a, b) => ({ l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) })
  const area = (a) => Math.max(0, a.r - a.l) * Math.max(0, a.b - a.t)
  const visible = (el) => {
    if (!el) return 0
    const q = el.getBoundingClientRect()
    let r = { l: q.left, t: q.top, r: q.right, b: q.bottom }
    const total = area(r)
    if (total <= 0) return 0
    let op = 1
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const c = getComputedStyle(e)
      if (c.display === 'none' || c.visibility === 'hidden') return 0
      op *= parseFloat(c.opacity || '1')
      if (e !== el && /(hidden|clip)/.test(c.overflowX + c.overflowY)) {
        const k = e.getBoundingClientRect()
        r = cruce(r, { l: k.left, t: k.top, r: k.right, b: k.bottom })
      }
    }
    const escala = el.offsetWidth > 0 ? Math.min(1, q.width / el.offsetWidth) : 1
    return Math.min(1, area(cruce(r, { l: 0, t: 0, r: innerWidth, b: innerHeight })) / total) * op * escala
  }
  let impar = false
  const cuadro = () => {
    impar = !impar
    if (!impar) {
      const s = document.querySelector('[data-panel="trabajos"]')
      const b = s ? s.getBoundingClientRect() : null
      log.push({
        y: Math.round(scrollY),
        enCuadro: b ? Math.min(b.bottom, innerHeight) - Math.max(b.top, 0) > innerHeight / 2 : false,
        titulo: visible(document.querySelector('[data-pantalla="titulo"] h2')),
        carrusel: visible(document.querySelector('[data-pieza="carrusel"]')),
        laTuya: visible(document.querySelector('[data-pieza="la-tuya-del-carrusel"]')),
        demos: Math.max(visible(document.querySelector('#demos > div:first-child')), visible(document.querySelector('#demos > div:nth-child(2) > div'))),
      })
    }
    if (!window.__pararElCarrusel) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

interface Contexto {
  readonly p: Page
  readonly cdp: CDPSession
  readonly ancho: number
  readonly alto: number
  /** Las peticiones a `/api/` que la página intentó (todas bloqueadas). */
  readonly api: string[]
}

type Resultado = { readonly ok: boolean; readonly detalle: string }

async function abrir(ancho: number, alto: number, reducido: boolean, ruta = '/v3?diag=carga'): Promise<{ readonly cerrar: () => Promise<void>; readonly c: Contexto }> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/b12e-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    // Sin las animaciones de Windows (TeamViewer) el Chrome pide movimiento reducido: el banco lo fija.
    reducedMotion: reducido ? 'reduce' : 'no-preference',
    args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  if (CONTROL === 'trampa') await ctx.addInitScript(TRAMPA)
  if (CONTROL === 'sin-pausa-fuera') await ctx.addInitScript(SIN_PAUSA_FUERA)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const api: string[] = []
  p.on('request', (r) => {
    if (r.url().includes('/api/')) api.push(r.url())
  })
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 240000 })
  const t0 = Date.now()
  while (Date.now() - t0 < 60000) {
    const listo = await p.evaluate(() => document.querySelector('[data-pieza="flujo-del-portfolio"]') !== null).catch(() => false)
    if (listo) break
    await dormir(250)
  }
  await dormir(2500)
  return { cerrar: () => ctx.close(), c: { p, cdp, ancho, alto, api } }
}

/** Lleva la página a un píxel de la regla del Portfolio, de un salto. */
async function alPx(p: Page, px: number): Promise<void> {
  await p.evaluate((x) => {
    const panel = document.querySelector('[data-panel="trabajos"]')
    if (panel === null) return
    const tope = panel.getBoundingClientRect().top + scrollY
    window.scrollTo({ top: tope - innerHeight + (x * innerHeight) / 900, behavior: 'instant' })
  }, px)
}

/** Pone un elemento en el medio del cuadro, de un salto. */
async function alCentro(p: Page, selector: string): Promise<void> {
  await p.evaluate((s) => {
    const el = document.querySelector(s)
    if (el === null) return
    const r = el.getBoundingClientRect()
    window.scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight / 2, behavior: 'instant' })
  }, selector)
  await dormir(600)
}

const indice = (p: Page): Promise<number> => p.evaluate(() => Number(document.querySelector('[data-pieza="carrusel"]')?.getAttribute('data-indice') ?? Number.NaN))
const pausa = (p: Page): Promise<string> => p.evaluate(() => document.querySelector('[data-pieza="carrusel"]')?.getAttribute('data-pausa') ?? '')
const centroDe = (p: Page, selector: string): Promise<{ readonly x: number; readonly y: number } | null> =>
  p.evaluate((s) => {
    const r = document.querySelector(s)?.getBoundingClientRect()
    return r === undefined ? null : { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }, selector)

/** El índice cada 100 ms durante `ms` (con el tiempo desde que arranca la serie). */
async function serie(p: Page, ms: number, t0 = Date.now()): Promise<MuestraDelReloj[]> {
  const salida: MuestraDelReloj[] = []
  while (Date.now() - t0 < ms) {
    salida.push({ t: Date.now() - t0, indice: await indice(p) })
    await dormir(100)
  }
  return salida
}

/** Espera el próximo cambio de tarjeta (a lo sumo `ms`) y devuelve cuándo fue (Date.now()), o `null`. */
async function proximoCambio(p: Page, ms: number): Promise<number | null> {
  const desde = await indice(p)
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if ((await indice(p)) !== desde) return Date.now()
    await dormir(50)
  }
  return null
}

async function tocarLaFlecha(c: Contexto, cual: 'anterior' | 'siguiente'): Promise<void> {
  const centro = await centroDe(c.p, `[data-pieza="carrusel"] [data-flecha="${cual}"]`)
  if (centro !== null) await tocar(c.cdp, centro.x, centro.y)
  await dormir(700)
}

/** Va a la tarjeta `i` con la flecha siguiente (sin depender del reloj: cada toque reinicia). */
async function irA(c: Contexto, i: number): Promise<void> {
  for (let k = 0; k < CANTIDAD && (await indice(c.p)) !== i; k++) await tocarLaFlecha(c, 'siguiente')
}

const CASO: Readonly<Record<Caso, (c: Contexto) => Promise<Resultado>>> = {
  async modo(c) {
    await alCentro(c.p, '[data-pieza="carrusel"]')
    const m = await c.p.evaluate(() => {
      const q = (s: string): Element | null => document.querySelector(s)
      const alto = (s: string): number => q(s)?.getBoundingClientRect().height ?? 0
      const cortadas = [...document.querySelectorAll<HTMLElement>('[data-pieza="tarjeta-del-proyecto"], [data-pieza="la-tuya-del-carrusel"]')].filter((e) => e.scrollHeight > e.clientHeight + 1).length
      return {
        flujo: q('[data-pieza="flujo-del-portfolio"]') !== null,
        historias: q('[data-pieza="historias"]') !== null,
        demos: q('[data-pieza="escenario-de-demos"]') !== null && q('[data-pieza="escenario-del-portfolio"]') === null,
        carrusel: alto('[data-pieza="carrusel"]'),
        tarjeta: alto('[data-pieza="tarjeta-del-proyecto"]'),
        laTuya: alto('[data-pieza="la-tuya-del-carrusel"]'),
        altoDelFlujo: alto('[data-pieza="flujo-del-portfolio"]'),
        seccion: alto('[data-panel="trabajos"]'),
        cortadas,
        desborde: document.documentElement.scrollWidth - innerWidth,
        ventana: innerHeight,
        ancho: innerWidth,
      }
    })
    const medio = (m.altoDelFlujo * 900) / m.ventana
    const k = medio / (m.ancho < 426 ? 4462 : 3722)
    const ok = m.flujo && !m.historias && m.demos && noOcupaLaPantalla(m.carrusel, m.ventana) && m.cortadas === 0 && m.desborde <= 0
    return {
      ok,
      detalle: `carrusel ${String(Math.round(m.carrusel))} px (${((m.carrusel / m.ventana) * 100).toFixed(0)} % del alto), tarjeta ${String(Math.round(m.tarjeta))}, «la tuya» ${String(Math.round(m.laTuya))}; cortadas ${String(m.cortadas)}, desborde ${String(m.desborde)} px · ALTOS: sección ${String(Math.round(m.seccion))} px (${(m.seccion / m.ventana).toFixed(4)} pantallas), flujo ${String(Math.round(m.altoDelFlujo))} px (medio ${medio.toFixed(1)} de la regla), k ${k.toFixed(5)}`,
    }
  },

  async recorrido(c) {
    await alPx(c.p, -300)
    await dormir(1500)
    await c.p.evaluate(GRABAR)
    const malos: string[] = []
    const arrastrar = async (dy: number): Promise<void> => {
      const antes = await c.p.evaluate(() => scrollY)
      await desplazarConElDedo(c.cdp, c.ancho / 2, c.alto / 2, dy)
      await dormir(250)
      const despues = await c.p.evaluate(() => scrollY)
      const sobreElCarrusel = await c.p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[data-pieza="carrusel"]') !== null, [c.ancho / 2, c.alto / 2] as const)
      if (!arrastreLibre(dy, despues - antes)) malos.push(`${sobreElCarrusel ? 'sobre el carrusel' : 'afuera'}: ${String(dy)} → ${String(despues - antes)}`)
    }
    const fin = await c.p.evaluate(() => {
      const s = document.querySelector('[data-panel="trabajos"]')
      return s === null ? 0 : s.getBoundingClientRect().bottom + scrollY - innerHeight * 0.5
    })
    for (let i = 0; i < 80 && (await c.p.evaluate(() => scrollY)) < fin; i++) await arrastrar(300)
    const bajada = await c.p.evaluate(() => (window as unknown as { __carrusel: MuestraDelRecorrido[] }).__carrusel.splice(0))
    for (let i = 0; i < 80; i++) {
      const y = await c.p.evaluate(() => {
        const s = document.querySelector('[data-panel="trabajos"]')
        return s === null ? 0 : s.getBoundingClientRect().top - innerHeight
      })
      if (y > 300) break
      await arrastrar(-300)
    }
    const subida = await c.p.evaluate(() => {
      ;(window as unknown as { __pararElCarrusel: boolean }).__pararElCarrusel = true
      return (window as unknown as { __carrusel: MuestraDelRecorrido[] }).__carrusel
    })
    const vacio = Math.max(vacioMaximo(bajada, c.alto), vacioMaximo(subida, c.alto))
    appendFileSync(path.join(SALIDA, 'recorrido.jsonl'), `${JSON.stringify({ ancho: c.ancho, alto: c.alto, control: CONTROL, malos, bajada, subida })}\n`)
    return { ok: malos.length === 0 && vacio <= CRITERIOS_DEL_CARRUSEL.vacioPantallas, detalle: `arrastres atrapados ${String(malos.length)}${malos.length === 0 ? '' : ` (${malos.slice(0, 3).join('; ')})`}; el tramo más largo sin nada a la vista, ${vacio.toFixed(2)} pantallas` }
  },

  async rotacion(c) {
    await alCentro(c.p, '[data-pieza="carrusel"]')
    const primero = await proximoCambio(c.p, CRITERIOS_DEL_CARRUSEL.duracionMs + 2000)
    if (primero === null) return { ok: false, detalle: `no cambió en ${String(CRITERIOS_DEL_CARRUSEL.duracionMs / 1000 + 2)} s (pausa: ${await pausa(c.p)})` }
    await dormir(5000 - (Date.now() - primero))
    const linea = await c.p.evaluate(() => {
      const l = document.querySelector('[data-pieza="carrusel"] [data-linea="activa"] > span')
      const m = l === null ? null : /matrix\(([^,]+)/.exec(getComputedStyle(l).transform)
      return m === null ? Number.NaN : Number(m[1])
    })
    const s = await serie(c.p, 2 * CRITERIOS_DEL_CARRUSEL.duracionMs + 1200, primero)
    const r = rotaSola([{ t: 0, indice: (s[0]?.indice ?? 0) }, ...s], CANTIDAD)
    const lineaBien = linea > 0.35 && linea < 0.65
    return { ok: r.ok && lineaBien, detalle: `intervalos ${r.intervalos.map((ms) => String(ms)).join(', ')} ms; la línea a los 5 s, ${linea.toFixed(2)}` }
  },

  async reinicio(c) {
    await alCentro(c.p, '[data-pieza="carrusel"]')
    const primero = await proximoCambio(c.p, CRITERIOS_DEL_CARRUSEL.duracionMs + 2000)
    if (primero === null) return { ok: false, detalle: 'no rota' }
    await dormir(6000 - (Date.now() - primero))
    await tocarLaFlecha(c, 'siguiente')
    const aMano = Date.now()
    const s = await serie(c.p, CRITERIOS_DEL_CARRUSEL.duracionMs + 2000, aMano)
    const r = reinicioDelReloj(s, 0)
    return { ok: r.ok, detalle: `después del cambio a mano (a los 6 s), el siguiente solo a los ${r.despues === null ? '—' : String(r.despues)} ms (10.000 ± ${String(CRITERIOS_DEL_CARRUSEL.toleranciaMs)})` }
  },

  async flechas(c) {
    await alCentro(c.p, '[data-pieza="carrusel"]')
    await irA(c, 0)
    const recorrido: number[] = [await indice(c.p)]
    for (let k = 0; k < CANTIDAD; k++) {
      await tocarLaFlecha(c, 'siguiente')
      recorrido.push(await indice(c.p))
    }
    await tocarLaFlecha(c, 'anterior')
    recorrido.push(await indice(c.p))
    const esperado = [0, 1, 2, 0, 2]
    return { ok: JSON.stringify(recorrido) === JSON.stringify(esperado), detalle: `${recorrido.join(' → ')} (esperado ${esperado.join(' → ')})` }
  },

  async deslices(c) {
    await alCentro(c.p, '[data-pieza="carrusel"]')
    await irA(c, 0)
    const centro = await centroDe(c.p, '[data-pieza="carrusel"] [data-parte="vista"]')
    if (centro === null) return { ok: false, detalle: 'sin carrusel' }
    const recorrido: number[] = [await indice(c.p)]
    for (const dx of [-200, -200, -200, 200, 200]) {
      await deslizar(c.cdp, centro.x, centro.y, dx, 0)
      await dormir(700)
      recorrido.push(await indice(c.p))
    }
    const antes = await c.p.evaluate(() => scrollY)
    const tarjeta = await indice(c.p)
    await desplazarConElDedo(c.cdp, centro.x, centro.y, 240)
    await dormir(400)
    const movio = (await c.p.evaluate(() => scrollY)) - antes
    const esperado = [0, 1, 2, 0, 2, 1]
    const vertical = (await indice(c.p)) === tarjeta && arrastreLibre(240, movio)
    return { ok: JSON.stringify(recorrido) === JSON.stringify(esperado) && vertical, detalle: `${recorrido.join(' → ')} (esperado ${esperado.join(' → ')}); el dedo vertical sobre el carrusel movió la página ${String(movio)} de 240 px y la tarjeta ${vertical ? 'no cambió' : 'cambió'}` }
  },

  async mantener(c) {
    await alCentro(c.p, '[data-pieza="carrusel"]')
    await tocarLaFlecha(c, 'siguiente')
    const centro = await centroDe(c.p, '[data-pieza="carrusel"] [data-parte="ranura"][data-activa="si"] figure')
    if (centro === null) return { ok: false, detalle: 'sin la tarjeta' }
    const desde = await indice(c.p)
    await c.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: centro.x, y: centro.y, id: 1 }] })
    await dormir(1000)
    const enLaPausa = await pausa(c.p)
    const video = await c.p.evaluate(() => document.querySelector<HTMLVideoElement>('[data-pieza="carrusel"] [data-activa="si"] video')?.paused ?? true)
    await dormir(11_000)
    const seQuedo = (await indice(c.p)) === desde
    await c.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    const suelto = Date.now()
    await dormir(300)
    const despues = await pausa(c.p)
    const sigue = await proximoCambio(c.p, CRITERIOS_DEL_CARRUSEL.duracionMs + 1000)
    const ok = enLaPausa === 'mantenido' && video && seQuedo && despues === 'no' && sigue !== null
    return { ok, detalle: `apretado: pausa «${enLaPausa}», video ${video ? 'quieto' : 'corriendo'}, ${seQuedo ? 'no cambió en 12 s' : 'CAMBIÓ'}; suelto: pausa «${despues}», cambió a los ${sigue === null ? '—' : String(sigue - suelto)} ms` }
  },

  async fuera(c) {
    await alCentro(c.p, '[data-pantalla="titulo"]')
    await c.p.evaluate(() => window.scrollBy({ top: -Math.round(innerHeight * 0.4), behavior: 'instant' }))
    await dormir(800)
    const motivo = await pausa(c.p)
    const s = await serie(c.p, 12_000)
    await alCentro(c.p, '[data-pieza="carrusel"]')
    await dormir(800)
    const vuelve = await pausa(c.p)
    return { ok: quieto(s) && motivo === 'fuera-de-vista' && vuelve === 'no', detalle: `afuera: pausa «${motivo}», ${quieto(s) ? 'no cambió en 12 s' : 'CAMBIÓ'}; de vuelta a la vista: pausa «${vuelve}»` }
  },

  async reducido() {
    // Corre en su propio Chrome (ver `main`): acá no hace nada.
    return { ok: true, detalle: '(en su Chrome)' }
  },

  async cta(c) {
    await alCentro(c.p, '[data-pieza="la-tuya-del-carrusel"]')
    await dormir(800)
    const vista = await c.p.evaluate(() => {
      const r = document.querySelector('[data-pieza="la-tuya-del-carrusel"]')?.getBoundingClientRect()
      return r !== undefined && r.top >= -1 && r.bottom <= innerHeight + 1
    })
    const campos = await c.p.locator('[data-pieza="la-tuya-del-carrusel"] input, [data-pieza="la-tuya-del-carrusel"] textarea').count()
    await c.p.locator('#la-tuya-nombre').fill('Prueba del banco')
    const escrito = await c.p.locator('#la-tuya-nombre').inputValue()
    const pedidosAntes = c.api.length
    await c.p.locator('[data-pieza="la-tuya-del-carrusel"] button[type="submit"]').click()
    await dormir(800)
    const errorVacio = (await c.p.locator('[data-pieza="la-tuya-del-carrusel"] [aria-invalid="true"]').count()) > 0
    const sinPedido = c.api.length === pedidosAntes
    await c.p.locator('#la-tuya-medio').fill('banco@ejemplo.com')
    await c.p.locator('#la-tuya-mensaje').fill('Un mensaje del banco: nunca llega (la API está bloqueada).')
    await c.p.locator('[data-pieza="la-tuya-del-carrusel"] button[type="submit"]').click()
    await dormir(2500)
    const resultado = await c.p.locator('[data-pieza="la-tuya-del-carrusel"] [data-parte="resultado"]').count()
    const ok = vista && campos === 3 && escrito === 'Prueba del banco' && errorVacio && sinPedido && resultado === 1
    return { ok, detalle: `a la vista ${vista ? 'sí' : 'NO'}; ${String(campos)} campos; vacío: ${errorVacio ? 'marca el error' : 'NO marca'} y ${sinPedido ? 'no pide nada' : 'PIDIÓ'}; lleno: ${resultado === 1 ? 'el resultado (bloqueado: el error con WhatsApp)' : 'sin resultado'}; pedidos a /api/ (todos bloqueados): ${String(c.api.length)}` }
  },

  async ancla() {
    // Abre su propia página (ver `main`).
    return { ok: true, detalle: '(en su página)' }
  },
}

async function anclas(ancho: number, alto: number): Promise<Resultado> {
  const partes: string[] = []
  let ok = true
  for (const [hash, selector, indiceEsperado] of [['#portfolio-esquina-estudio', '[data-pieza="carrusel"]', 1], ['#portfolio-la-tuya', '[data-pieza="la-tuya-del-carrusel"]', null]] as const) {
    const { cerrar, c } = await abrir(ancho, alto, false, `/v3${hash}`)
    try {
      await dormir(2000)
      const r = await c.p.evaluate((s) => {
        const b = document.querySelector(s)?.getBoundingClientRect()
        return { aLaVista: b !== undefined && b.top >= -2 && b.top < innerHeight * 0.6, indice: Number(document.querySelector('[data-pieza="carrusel"]')?.getAttribute('data-indice') ?? Number.NaN) }
      }, selector)
      const bien = r.aLaVista && (indiceEsperado === null || r.indice === indiceEsperado)
      ok &&= bien
      partes.push(`${hash}: ${r.aLaVista ? 'a la vista' : 'NO a la vista'}${indiceEsperado === null ? '' : `, la tarjeta ${String(r.indice)}`}`)
    } finally {
      await cerrar()
    }
  }
  return { ok, detalle: partes.join('; ') }
}

async function conReducido(ancho: number, alto: number): Promise<Resultado> {
  const { cerrar, c } = await abrir(ancho, alto, true)
  try {
    await alCentro(c.p, '[data-pieza="carrusel"]')
    const motivo = await pausa(c.p)
    const s = await serie(c.p, 12_000)
    const desde = await indice(c.p)
    await tocarLaFlecha(c, 'siguiente')
    const anda = (await indice(c.p)) === (desde + 1) % CANTIDAD
    return { ok: motivo === 'reducido' && quieto(s) && anda, detalle: `pausa «${motivo}», ${quieto(s) ? 'no rotó en 12 s' : 'ROTÓ'}, la flecha ${anda ? 'anda' : 'NO anda'}` }
  } finally {
    await cerrar()
  }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  let malas = 0
  let todas = 0
  const informar = (ancho: number, alto: number, caso: Caso, r: Resultado): void => {
    todas += 1
    if (!r.ok) malas += 1
    console.log(`${r.ok ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)} · ${caso}${CONTROL === null ? '' : ` [control ${CONTROL}]`} · ${r.detalle}`)
    appendFileSync(path.join(SALIDA, 'carrusel.jsonl'), `${JSON.stringify({ ancho, alto, caso, control: CONTROL, ...r })}\n`)
  }
  for (const [ancho, alto] of ANCHOS) {
    const enLaPagina = CASOS.filter((k) => k !== 'reducido' && k !== 'ancla')
    if (enLaPagina.length > 0) {
      const { cerrar, c } = await abrir(ancho, alto, false)
      try {
        for (const caso of enLaPagina) informar(ancho, alto, caso, await CASO[caso](c))
      } finally {
        await cerrar()
      }
    }
    if (CASOS.includes('reducido')) informar(ancho, alto, 'reducido', await conReducido(ancho, alto))
    if (CASOS.includes('ancla')) informar(ancho, alto, 'ancla', await anclas(ancho, alto))
  }
  console.log(`carrusel: ${String(todas - malas)} de ${String(todas)} bien${CONTROL === null ? '' : ` (control ${CONTROL}: tiene que fallar el caso que le toca)`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
