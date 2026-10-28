/**
 * [C2-41t] DEMOS EN EL TELÉFONO Y LA TABLET, EN EL SITIO — abajo de 1024 Demos es una sección más (entra deslizándose pegada al pie de «la
 * tuya» y se queda pegada la cola), el título se levanta desde abajo y el muestrario es el carrusel común que asoma. Con el dedo (CDP), el
 * Chrome del sistema a la vista, contra el dev server y `/api/` bloqueado. NO lo corre el subagente: lo corre el orquestador.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/demos-telefono.ts         los tres casos, a 390×844 y 768×1024
 *   ANCHOS=390x844 CASOS=muestrario …                                          un ancho, algunos casos
 *   CONTROL=desde-atras …     la pantalla de Demos achicada (como la capa que crecía desde atrás del logo): `entrada` tiene que FALLAR
 *   CONTROL=sin-levantarse …  el titular sin su transformada (sólo el fundido): `titulo` tiene que FALLAR
 *   CONTROL=sin-asomar …      las tarjetas de afuera escondidas (la tarjeta sola de antes): `muestrario` tiene que FALLAR (asoma)
 *   CONTROL=sin-dedo …        el movimiento del dedo no le llega al carrusel (sólo el deslice al soltar): `muestrario` tiene que FALLAR (sigue)
 *   CONTROL=barras-vacias …   la barra de la demo ya vista, apagada: `muestrario` tiene que FALLAR (barras)
 *
 * Los casos:
 *   entrada     se scrollea de a 4 % del cuadro desde que el pie del flujo asoma hasta pasar el tope de la caja de Demos: la pantalla de Demos
 *               (`data-pantalla="demos"`) entra pegada al pie del flujo (su tope es el de la caja, ±2 px: se mueve con el scroll), a su ancho
 *               (≥ 98 % del cuadro: sin escala) y, ya arriba, queda pegada (tope 0 ± 2); la capa vieja (`data-capa="demos"`) no está
 *   titulo      con la pantalla debajo del cuadro, el titular está acostado y corrido debajo de su ventana (≥ 0,9 de su alto, con transformada);
 *               al llevarla arriba sube a su lugar (± 2 px) en menos de 1,2 s, con el bloque que se funde a 1
 *   muestrario  pegado: la tarjeta de ahora grande y entera en el cuadro (≥ 40 % del alto) con las flechas; la siguiente asoma (≥ 24 px a la
 *               vista, a su derecha); el dedo de costado la arrastra (a mitad del gesto la tarjeta se corrió ≥ 50 % de lo que se movió el
 *               dedo) y al soltar pasa a la siguiente y se asienta donde estaba la de antes (± 3 px); la barra de la que se vio queda llena;
 *               un toque a la que asoma la trae; el dedo vertical sobre la tarjeta mueve la página
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'

import { desplazarConElDedo, tocar } from './tactil'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '390x844,768x1024').split(',').map((a) => a.split('x').map(Number) as [number, number])
const TODOS = ['entrada', 'titulo', 'muestrario'] as const
type Caso = (typeof TODOS)[number]
const CASOS = (process.env.CASOS ?? TODOS.join(',')).split(',').filter((c): c is Caso => (TODOS as readonly string[]).includes(c))
const CONTROL = process.env.CONTROL ?? null
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('c2-41t')
const CANTIDAD = 5
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const PANTALLA = '[data-pantalla="demos"]'
const CARRUSEL = `${PANTALLA} [data-pieza="carrusel-de-tarjetas"]`

/** Los controles por CSS: cada uno rompe a propósito lo que mide su caso. */
const ESTILO_DEL_CONTROL: Readonly<Record<string, string>> = {
  'desde-atras': '[data-pantalla="demos"]{transform:scale(.35)!important;transform-origin:50% 60%!important}',
  'sin-levantarse': '[data-parte="se-levanta"]{transform:none!important}',
  'sin-asomar': '[data-asoma][data-activa="no"]{visibility:hidden!important}',
  'barras-vacias': '[data-linea="vista"]{opacity:0!important}',
}
const ESTILO_DE_CONTROL = (css: string): string => `(() => {
  const poner = () => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(css)}; document.head.appendChild(s) }
  if (document.head) poner(); else document.addEventListener('DOMContentLoaded', poner)
})()`
/** [CONTROL=sin-dedo] El movimiento del dedo se corta antes de llegar al carrusel (React escucha en la raíz). */
const SIN_DEDO = `(() => {
  window.addEventListener('pointermove', (e) => { if (e.target instanceof Element && e.target.closest('[data-pantalla="demos"] [data-parte="vista"]')) e.stopPropagation() }, true)
})()`

interface Contexto {
  readonly p: Page
  readonly cdp: CDPSession
  readonly ancho: number
  readonly alto: number
}
type Resultado = { readonly ok: boolean; readonly detalle: string }

async function abrir(ancho: number, alto: number): Promise<{ readonly cerrar: () => Promise<void>; readonly c: Contexto }> {
  const perfil = perfilDelBanco('c2-41t')
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
  if (CONTROL === 'sin-dedo') await ctx.addInitScript(SIN_DEDO)
  if (CONTROL !== null && ESTILO_DEL_CONTROL[CONTROL] !== undefined) await ctx.addInitScript(ESTILO_DE_CONTROL(ESTILO_DEL_CONTROL[CONTROL]))
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  // Ningún `/api/` real (la base es compartida): todo se corta.
  await p.route('**/api/**', (r) => r.abort())
  const cdp = await ctx.newCDPSession(p)
  await p.goto(`${BASE}/v3?diag=carga`, { waitUntil: 'load', timeout: 240000 })
  const t0 = Date.now()
  while (Date.now() - t0 < 60000) {
    if (await p.evaluate((s) => document.querySelector(s) !== null, PANTALLA).catch(() => false)) break
    await dormir(250)
  }
  await dormir(2500)
  return { cerrar: () => ctx.close(), c: { p, cdp, ancho, alto } }
}

/** El tope de la caja de Demos (la que sigue al flujo) en el documento. */
const topeDeLaCaja = (p: Page): Promise<number> =>
  p.evaluate(() => {
    const caja = document.querySelector('[data-pieza="despues-del-flujo"]')
    return caja === null ? Number.NaN : caja.getBoundingClientRect().top + scrollY
  })

async function irA(p: Page, y: number): Promise<void> {
  await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))))
}

const CASO: Record<Caso, (c: Contexto) => Promise<Resultado>> = {
  async entrada(c) {
    const tope = await topeDeLaCaja(c.p)
    if (!Number.isFinite(tope)) return { ok: false, detalle: 'sin la caja de Demos (¿el carrusel no está?)' }
    const malos: string[] = []
    let muestras = 0
    for (let y = tope - c.alto - 0.1 * c.alto; y <= tope + 0.3 * c.alto; y += 0.04 * c.alto) {
      await irA(c.p, Math.round(y))
      const m = await c.p.evaluate((s) => {
        const el = document.querySelector(s)
        const caja = document.querySelector('[data-pieza="despues-del-flujo"]')
        if (el === null || caja === null) return null
        const r = el.getBoundingClientRect()
        return { top: r.top, ancho: r.width, cajaTop: caja.getBoundingClientRect().top, vieja: document.querySelector('[data-capa="demos"]') !== null, vw: innerWidth, vh: innerHeight }
      }, PANTALLA)
      if (m === null) return { ok: false, detalle: 'sin la pantalla de Demos' }
      if (m.vieja) malos.push('la capa vieja está montada')
      if (m.top >= m.vh) continue
      muestras += 1
      const esperado = Math.max(0, m.cajaTop)
      if (Math.abs(m.top - esperado) > 2) malos.push(`y ${String(Math.round(y))}: tope ${m.top.toFixed(0)} (la caja en ${m.cajaTop.toFixed(0)})`)
      if (m.ancho < 0.98 * m.vw) malos.push(`y ${String(Math.round(y))}: ancho ${m.ancho.toFixed(0)} de ${String(m.vw)} (escalada)`)
    }
    const ok = muestras >= 10 && malos.length === 0
    return { ok, detalle: `${String(muestras)} cuadros con Demos a la vista; ${malos.length === 0 ? 'entra pegada al pie del flujo, a su ancho, y queda arriba' : malos.slice(0, 4).join(' · ')}` }
  },

  async titulo(c) {
    const tope = await topeDeLaCaja(c.p)
    await irA(c.p, Math.round(tope - c.alto - 40))
    await dormir(1200)
    const medir = (): Promise<{ readonly corrido: number; readonly alto: number; readonly transformada: string; readonly fundido: number } | null> =>
      c.p.evaluate((s) => {
        const sube = document.querySelector<HTMLElement>(`${s} [data-parte="se-levanta"]`)
        // La ventana que recorta: el primer ancestro que corta lo que se sale.
        let ventana = sube?.parentElement ?? null
        while (ventana !== null && !/clip|hidden/.test(getComputedStyle(ventana).overflowY)) ventana = ventana.parentElement
        const bloque = document.querySelector<HTMLElement>(`${s} [data-parte="titulo"]`)
        if (sube === null || ventana === null || bloque === null) return null
        const r = sube.getBoundingClientRect()
        const v = ventana.getBoundingClientRect()
        // Desde el tope del CONTENIDO de la ventana: en reposo el titular queda sobre su padding (8 px), no sobre su borde.
        return { corrido: r.top - v.top - Number.parseFloat(getComputedStyle(ventana).paddingTop), alto: sube.offsetHeight, transformada: getComputedStyle(sube).transform, fundido: Number(getComputedStyle(bloque).opacity) }
      }, PANTALLA)
    const antes = await medir()
    if (antes === null) return { ok: false, detalle: 'sin el titular de Demos' }
    await irA(c.p, Math.round(tope + 10))
    const t0 = Date.now()
    let llego: number | null = null
    let ultimo = antes
    while (Date.now() - t0 < 2000) {
      const m = await medir()
      if (m !== null) ultimo = m
      if (m !== null && Math.abs(m.corrido) <= 2 && m.fundido > 0.99) {
        llego = Date.now() - t0
        break
      }
      await dormir(50)
    }
    const acostado = antes.corrido >= 0.9 * antes.alto && antes.transformada !== 'none'
    const ok = acostado && llego !== null && llego <= 1200
    return { ok, detalle: `debajo del cuadro: corrido ${antes.corrido.toFixed(0)} px de ${String(antes.alto)} (${antes.transformada === 'none' ? 'sin transformada' : 'acostado'}), fundido ${antes.fundido.toFixed(2)}; arriba: ${llego === null ? `NO llegó (corrido ${ultimo.corrido.toFixed(0)}, fundido ${ultimo.fundido.toFixed(2)})` : `en su lugar a los ${String(llego)} ms`}` }
  },

  async muestrario(c) {
    const tope = await topeDeLaCaja(c.p)
    await irA(c.p, Math.round(tope + 0.3 * c.alto))
    await dormir(1200)
    const foto = (): Promise<{ readonly indice: number; readonly activa: DOMRectJSON | null; readonly siguiente: DOMRectJSON | null; readonly opSig: number; readonly flechas: boolean } | null> =>
      c.p.evaluate((s) => {
        const raiz = document.querySelector<HTMLElement>(s)
        if (raiz === null) return null
        const indice = Number(raiz.getAttribute('data-indice'))
        const ranuras = [...raiz.querySelectorAll<HTMLElement>('[data-parte="ranura"]')]
        const rect = (e: Element | undefined): DOMRectJSON | null => (e === undefined ? null : (e.getBoundingClientRect().toJSON() as DOMRectJSON))
        const sig = ranuras[(indice + 1) % ranuras.length]
        const flechas = [...raiz.querySelectorAll('[data-flecha]')].every((f) => { const r = f.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight })
        return { indice, activa: rect(ranuras[indice]), siguiente: rect(sig), opSig: sig === undefined ? 0 : Number(getComputedStyle(sig).opacity) * (getComputedStyle(sig).visibility === 'hidden' ? 0 : 1), flechas }
      }, CARRUSEL)
    // Desde la última, la que sigue es la primera y ninguna barra queda «vista»: se empieza en otra.
    const primera = await foto()
    if (primera !== null && primera.indice === CANTIDAD - 1) {
      const f = await c.p.evaluate((s) => document.querySelector(`${s} [data-flecha="siguiente"]`)?.getBoundingClientRect().toJSON() as DOMRectJSON | undefined, CARRUSEL)
      if (f !== undefined) await tocar(c.cdp, f.left + f.width / 2, f.top + f.height / 2)
      await dormir(900)
    }
    const a = await foto()
    if (a === null || a.activa === null || a.siguiente === null) return { ok: false, detalle: 'sin el muestrario' }
    const partes: string[] = []
    const grande = a.activa.height >= 0.4 * c.alto && a.activa.top >= 0 && a.activa.bottom <= c.alto && a.flechas
    partes.push(`tarjeta ${a.activa.width.toFixed(0)}×${a.activa.height.toFixed(0)} ${grande ? 'grande y entera' : 'NO grande/entera'} (flechas ${a.flechas ? 'a la vista' : 'fuera'})`)
    const aLaVista = Math.min(c.ancho, a.siguiente.right) - Math.max(0, a.siguiente.left)
    const asoma = aLaVista >= 24 && a.siguiente.left > a.activa.right && a.opSig > 0.3
    partes.push(`la siguiente ${asoma ? 'asoma' : 'NO asoma'} (${aLaVista.toFixed(0)} px, opacidad ${a.opSig.toFixed(2)})`)
    // El dedo de costado, sostenido: a mitad del gesto la tarjeta lo sigue.
    const x0 = a.activa.left + a.activa.width * 0.7
    const y0 = a.activa.top + a.activa.height * 0.5
    const dx = -Math.round(a.activa.width * 0.6)
    await c.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] })
    for (let i = 1; i <= 12; i++) {
      await dormir(20)
      await c.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (dx * i) / 12, y: y0 + i * 0.2, id: 1 }] })
    }
    await dormir(60)
    const medio = await foto()
    await c.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await dormir(900)
    const b = await foto()
    const corrida = medio === null || medio.activa === null ? 0 : a.activa.left - medio.activa.left
    const sigue = corrida >= 0.5 * Math.abs(dx)
    partes.push(`a mitad del gesto la tarjeta ${sigue ? 'sigue al dedo' : 'NO sigue al dedo'} (${corrida.toFixed(0)} de ${String(Math.abs(dx))} px)`)
    const paso = b !== null && b.indice === (a.indice + 1) % CANTIDAD && b.activa !== null && Math.abs(b.activa.left - a.activa.left) <= 3
    partes.push(`al soltar ${paso ? 'pasó a la siguiente y se asentó' : `NO (índice ${String(b?.indice)}, izquierda ${b?.activa?.left.toFixed(0) ?? '—'} contra ${a.activa.left.toFixed(0)})`}`)
    const barra = await c.p.evaluate(([s, i]) => {
      const l = document.querySelectorAll<HTMLElement>(`${s} [data-parte="linea"]`)[i]
      if (l === undefined) return null
      const cs = getComputedStyle(l)
      return { vista: l.getAttribute('data-linea') === 'vista', opacidad: Number(cs.opacity), fondo: cs.backgroundColor }
    }, [CARRUSEL, a.indice] as const)
    const barras = barra !== null && barra.vista && barra.opacidad > 0.99 && !/rgba\([^)]*, 0\.[0-4]/.test(barra.fondo)
    partes.push(`la barra de la vista ${barras ? 'llena' : `NO llena (${JSON.stringify(barra)})`}`)
    // Un toque a la que asoma la trae.
    const c2 = await foto()
    let toque = false
    if (c2 !== null && c2.siguiente !== null) {
      const xs = Math.min(c.ancho - 6, Math.max(c2.siguiente.left + 12, (c2.siguiente.left + Math.min(c.ancho, c2.siguiente.right)) / 2))
      await tocar(c.cdp, xs, c2.siguiente.top + c2.siguiente.height / 2)
      await dormir(900)
      toque = (await foto())?.indice === (c2.indice + 1) % CANTIDAD
    }
    partes.push(`el toque a la que asoma ${toque ? 'la trae' : 'NO la trae'}`)
    // El dedo vertical sobre la tarjeta es de la página.
    const antes = await c.p.evaluate(() => scrollY)
    const d = await foto()
    if (d !== null && d.activa !== null) await desplazarConElDedo(c.cdp, d.activa.left + d.activa.width / 2, d.activa.top + d.activa.height / 2, 240)
    await dormir(400)
    const movio = (await c.p.evaluate(() => scrollY)) - antes
    const libre = movio >= 120
    partes.push(`el dedo vertical ${libre ? 'mueve la página' : 'NO mueve la página'} (${String(movio)} de 240)`)
    return { ok: grande && asoma && sigue && paso && barras && toque && libre, detalle: partes.join('; ') }
  },
}

interface DOMRectJSON {
  readonly top: number
  readonly bottom: number
  readonly left: number
  readonly right: number
  readonly width: number
  readonly height: number
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  let malas = 0
  let todas = 0
  for (const [ancho, alto] of ANCHOS) {
    const { cerrar, c } = await abrir(ancho, alto)
    try {
      for (const caso of CASOS) {
        const r = await CASO[caso](c)
        todas += 1
        if (!r.ok) malas += 1
        console.log(`${r.ok ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)} · ${caso}${CONTROL === null ? '' : ` [control ${CONTROL}]`} · ${r.detalle}`)
        appendFileSync(path.join(SALIDA, 'demos-telefono.jsonl'), `${JSON.stringify({ ancho, alto, caso, control: CONTROL, ...r })}\n`)
      }
    } finally {
      await cerrar()
    }
  }
  console.log(`demos-telefono: ${String(todas - malas)} de ${String(todas)} bien${CONTROL === null ? '' : ` (control ${CONTROL}: tiene que fallar el caso que le toca)`}`)
  process.exit(malas === 0 ? 0 : 1)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
