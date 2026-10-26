/**
 * [C2-51] EL RECOMENDADOR DE SERVICIOS EN EL SITIO — el Chrome del sistema a la vista contra el dev o el build (`BASE`), con el banco
 * prendido (`__entornoDeLaEscena`: la máquina publica `__gatillosDelBanco`). NUNCA llama a `/api/` de verdad: todo `/api/**` se
 * intercepta con `page.route` (`/api/contacto` responde lo que pide cada paso; lo demás, cortado). Cada selector va acotado a la pieza
 * (`[data-pieza="recomendador"]`): el home tiene otros formularios y otros estados de envío.
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,390 npx tsx scripts-carga/recomendador.ts
 *
 * Por ancho:
 *   TRAMO       desde IA (el último servicio, puesto por el scroll), la rueda (1440) o el dedo (390) baja la página NORMAL hasta el
 *               Panel: cada gesto la mueve (más de 20 px), ninguno lanza un vuelo (`data-en-vuelo`), el escenario de IA se va con el
 *               primero (no queda retenido) y se llega al Panel.
 *   ETAPAS      la primera etapa (el indicador en 1, la pregunta, cinco opciones, sin «Atrás»); elegir y «Siguiente»; «Atrás» vuelve y
 *               conserva lo elegido (también al volver a avanzar); en la tercera, «Siguiente» sin elegir avisa («Elegí una opción…») y
 *               no avanza; elegir lo saca.
 *   PROCESANDO  «Ver mi recomendación»: la carga de develOP y las tres líneas en orden, visibles; el resultado a los 2,5–4,2 s.
 *   RESULTADO   A y B las de la lógica (`logica.ts`) para las respuestas tocadas, y el análisis armado, letra por letra.
 *   ELEGIR      tocar B: A se desvanece (opacidad entre 0 y 1 antes de irse) y se va; aparece el contacto con su título, la precarga del
 *               servicio y el mensaje con las respuestas.
 *   ENVIO       con el mensaje editado: éxito (carga → «¡Recibido!» → el formulario vuelve, vacío y precargado de nuevo) y error (carga →
 *               «Algo falló» → vuelve con lo escrito); un pedido por intento, con el mensaje editado, el medio y los intereses del servicio.
 *   REINICIO    «Empezar de nuevo»: la primera etapa, sin nada elegido.
 * Fotos de cada etapa en ~/.cache/b4-medicion/recomendador.
 *
 *   CONTROL=con-gatillo      la salida de abajo de B4 (`__defectosDeLosGatillos`): el TRAMO tiene que dar FALLA.
 *   CONTROL=sin-falta        esconde el aviso de la etapa: ETAPAS tiene que dar FALLA.
 *   CONTROL=sin-procesando   esconde las líneas del procesando: PROCESANDO tiene que dar FALLA.
 *   CONTROL=sin-desvanecer   la otra tarjeta no se desvanece (opacidad fija): ELEGIR tiene que dar FALLA.
 *   CONTROL=sin-precarga     vacía el mensaje precargado al aparecer: ELEGIR tiene que dar FALLA.
 *   CONTROL=envio-ciego      esconde el mensaje del envío: ENVIO tiene que dar FALLA.
 *   CONTROL=sin-reinicio     «Empezar de nuevo» no llega a la página: REINICIO tiene que dar FALLA.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

import { PRECARGA_POR_SERVICIO } from '../src/app/v3/_chrome/contacto/contenido'
import { PREGUNTAS, TEXTOS_DEL_RECOMENDADOR, analisis, mensajeDelContacto, recomendar, solucion, type Respuestas } from '../src/app/v3/_secciones/servicios/recomendador/logica'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,390').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
const R = '[data-pieza="recomendador"]'
const CONTROLES: Readonly<Record<string, { readonly css?: string; readonly script?: string; readonly defecto?: string }>> = {
  'con-gatillo': { defecto: 'con-gatillo-al-final' },
  'sin-falta': { css: `${R} [data-pieza="etapa-del-recomendador"] p[id$="-falta"] { display: none !important; }` },
  'sin-procesando': { css: `${R} [data-parte="linea-del-procesando"] { display: none !important; }` },
  'sin-desvanecer': { css: `${R} div:has(> [data-pieza="tarjeta-de-solucion"]) { opacity: 1 !important; }` },
  'sin-precarga': {
    script: `new MutationObserver(() => { const t = document.querySelector('#recomendador-mensaje'); if (t && !t.dataset.vaciado) { t.dataset.vaciado = '1'; Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, ''); t.dispatchEvent(new Event('input', { bubbles: true })) } }).observe(document, { childList: true, subtree: true })`,
  },
  'envio-ciego': { css: `${R} [data-parte="mensaje-del-envio"] { display: none !important; }` },
  'sin-reinicio': { script: `window.addEventListener('click', (e) => { if (e.target instanceof Element && e.target.closest('[data-parte="empezar-de-nuevo"]')) e.stopPropagation() }, true)` },
}
if (CONTROL !== '' && !(CONTROL in CONTROLES)) throw new Error(`CONTROL=${CONTROL}: ${Object.keys(CONTROLES).join(' | ')}`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/recomendador')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Las respuestas que toca el banco (la segunda opción de cada pregunta): A tienda, B chatbot; elige B. */
const RESPUESTAS: Respuestas = [1, 1, 1]
const REC = recomendar(RESPUESTAS)
const ELEGIDA = REC.b

const lineas: { texto: string; bien: boolean | null }[] = []
const anotar = (bien: boolean | null, rotulo: string, ancho: number, detalle: string): void => {
  const texto = `${bien === null ? 'info ' : bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ${rotulo} · ${detalle}`
  console.log(texto)
  lineas.push({ texto, bien })
}

async function esperar(p: Page, expresion: string, ms: number): Promise<boolean> {
  const hasta = Date.now() + ms
  while (Date.now() < hasta) {
    if ((await p.evaluate(expresion)) === true) return true
    await dormir(80)
  }
  return false
}
/** Una foto del cuadro; después se re-emula el cuadro (la captura congela los pasos de render: CLAUDE.md, «captureScreenshot»). */
async function foto(p: Page, ancho: number, alto: number, nombre: string): Promise<void> {
  await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${CONTROL === '' ? 'producto' : CONTROL}-${nombre}.png`) })
  await p.setViewportSize({ width: ancho, height: alto })
}
const visible = (sel: string): string => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return false; const c = getComputedStyle(e); return e.getClientRects().length > 0 && c.display !== 'none' && c.visibility !== 'hidden' && Number(c.opacity) > 0.5 })()`

async function leerTexto(p: Page, sel: string): Promise<string> {
  return p.evaluate((s) => (document.querySelector(s)?.textContent ?? '').replace(/\s+/g, ' ').trim(), sel)
}

/** El último servicio, puesto por el scroll (sin gesto), donde aterriza: al pie de su tramo. */
async function ponerEnIa(p: Page): Promise<void> {
  await p.evaluate(() => {
    const g = (window as Window & { __gatillosDelBanco?: { regla: () => { pasoPx: number; inicio: number; cantidad: number } } }).__gatillosDelBanco
    if (!g) throw new Error('sin __gatillosDelBanco (¿el banco prendido? ¿la coreografía?)')
    const r = g.regla()
    window.scrollTo({ top: r.inicio + r.cantidad * r.pasoPx - 4, behavior: 'instant' })
  })
  await dormir(3200)
}

async function tramo(p: Page, ancho: number, alto: number, movil: boolean): Promise<void> {
  await ponerEnIa(p)
  const paso = await p.evaluate(() => (window as Window & { __gatillosDelBanco?: { paso: () => number } }).__gatillosDelBanco?.paso() ?? -9)
  await foto(p, ancho, alto, '0-ia')
  await p.evaluate(() => {
    const w = window as Window & { __vuelos?: number }
    w.__vuelos = 0
    const mirar = (): void => {
      if (document.querySelector('[data-pieza="pista-de-servicios"]')?.getAttribute('data-en-vuelo') === 'si') w.__vuelos = (w.__vuelos ?? 0) + 1
      requestAnimationFrame(mirar)
    }
    requestAnimationFrame(mirar)
  })
  const cdp = movil ? await p.context().newCDPSession(p) : null
  const deltas: number[] = []
  let escenarioSeFue = false
  let llego = false
  for (let k = 0; k < 80 && !llego; k++) {
    const antes = await p.evaluate(() => window.scrollY)
    if (cdp !== null) await cdp.send('Input.synthesizeScrollGesture', { x: ancho / 2, y: alto * 0.6, yDistance: -240, gestureSourceType: 'touch', speed: 1200 })
    else await p.mouse.wheel(0, 100)
    await dormir(cdp !== null ? 500 : 260)
    const ahora = await p.evaluate(() => ({ y: window.scrollY, escenario: document.querySelector('[data-pieza="escenario-de-servicios"]')?.getBoundingClientRect().top ?? 0, panel: document.querySelector('[data-panel="tu-panel"]')?.getBoundingClientRect().top ?? 1e9 }))
    deltas.push(ahora.y - antes)
    if (k === 0) escenarioSeFue = ahora.escenario < -10
    if (k === 2) await foto(p, ancho, alto, '1-bajando')
    llego = ahora.panel < alto * 0.5
  }
  const vuelos = await p.evaluate(() => (window as Window & { __vuelos?: number }).__vuelos ?? 0)
  const quietos = deltas.filter((d) => d <= 20).length
  const bien = paso === 3 && vuelos === 0 && quietos === 0 && escenarioSeFue && llego
  anotar(bien, 'TRAMO', ancho, `en IA ${paso === 3 ? 'sí' : `NO (paso ${String(paso)})`} · ${String(deltas.length)} gestos hasta el Panel${llego ? '' : ' (NO LLEGÓ)'} · vuelos ${String(vuelos)} · gestos que no movieron la página ${String(quietos)} · el escenario de IA se fue con el primero ${escenarioSeFue ? 'sí' : 'NO'} · Δ ${deltas.slice(0, 6).map((d) => d.toFixed(0)).join(' ')}…`)
}

const SIGUIENTE = `${R} [data-pieza="etapa-del-recomendador"] button[type="submit"]`
const etapaEs = (i: number, pregunta: string): string => `(() => { const e = document.querySelector('${R} [data-pieza="etapa-del-recomendador"]'); const l = e?.querySelector('legend'); return e?.getAttribute('data-etapa') === '${String(i)}' && (l?.textContent ?? '') === ${JSON.stringify(pregunta)} && Number(getComputedStyle(l.closest('fieldset')).opacity) > 0.95 })()`
const marcada = (p: Page): Promise<number> => p.evaluate((r) => [...document.querySelectorAll(`${r} [data-pieza="opcion-del-recomendador"] input`)].findIndex((x) => (x as HTMLInputElement).checked), R)
const opcion = (p: Page, i: number): Promise<void> => p.locator(`${R} [data-pieza="opcion-del-recomendador"]`).nth(i).click()

async function flujo(p: Page, ancho: number, alto: number): Promise<void> {
  await p.evaluate((r) => {
    const c = document.querySelector(`${r} [data-parte="cuerpo-del-recomendador"]`)
    if (c) window.scrollTo({ top: c.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' })
  }, R)
  await dormir(1500)
  // ── ETAPAS
  const e: string[] = []
  const indicador = (): Promise<number> => p.evaluate((r) => [...document.querySelectorAll(`${r} [data-parte="indicador-de-pasos"] li`)].findIndex((x) => x.getAttribute('aria-current') === 'step'), R)
  const primera = (await p.evaluate(etapaEs(0, PREGUNTAS[0].texto))) === true && (await p.locator(`${R} [data-pieza="opcion-del-recomendador"]`).count()) === 5 && (await p.locator(`${R} [data-parte="atras"]`).count()) === 0 && (await indicador()) === 0
  if (!primera) e.push('la primera etapa')
  await foto(p, ancho, alto, '2-etapa-1')
  await opcion(p, RESPUESTAS[0])
  await p.locator(SIGUIENTE).click()
  if (!(await esperar(p, etapaEs(1, PREGUNTAS[1].texto), 3000)) || (await indicador()) !== 1) e.push('la segunda etapa')
  await opcion(p, RESPUESTAS[1])
  await foto(p, ancho, alto, '3-etapa-2')
  await p.locator(`${R} [data-parte="atras"]`).click()
  if (!(await esperar(p, etapaEs(0, PREGUNTAS[0].texto), 3000)) || (await marcada(p)) !== RESPUESTAS[0]) e.push('Atrás (con lo elegido)')
  await p.locator(SIGUIENTE).click()
  if (!(await esperar(p, etapaEs(1, PREGUNTAS[1].texto), 3000)) || (await marcada(p)) !== RESPUESTAS[1]) e.push('volver a avanzar (con lo elegido)')
  await p.locator(SIGUIENTE).click()
  if (!(await esperar(p, etapaEs(2, PREGUNTAS[2].texto), 3000))) e.push('la tercera etapa')
  await p.locator(SIGUIENTE).click()
  await dormir(500)
  const falta = `${R} [data-pieza="etapa-del-recomendador"] p[id$="-falta"]`
  const avisa = (await p.evaluate(visible(falta))) === true && (await leerTexto(p, falta)) === TEXTOS_DEL_RECOMENDADOR.faltaElegir && (await p.evaluate(etapaEs(2, PREGUNTAS[2].texto))) === true
  if (!avisa) e.push('el aviso sin elegir')
  await foto(p, ancho, alto, '4-etapa-3-sin-elegir')
  await opcion(p, RESPUESTAS[2])
  if ((await p.locator(falta).count()) !== 0) e.push('el aviso que se va al elegir')
  anotar(e.length === 0, 'ETAPAS', ancho, e.length === 0 ? 'tres etapas, el indicador, Atrás con lo elegido y el aviso' : `falla: ${e.join(', ')}`)
  // ── PROCESANDO
  const t0 = Date.now()
  await p.locator(SIGUIENTE).click()
  const vistas: string[] = []
  let carga = false
  let fin = 0
  let fotografiado = false
  while (Date.now() - t0 < 7000) {
    const m = await p.evaluate((r) => {
      const l = document.querySelector(`${r} [data-parte="linea-del-procesando"]`)
      const c = l ? getComputedStyle(l) : null
      const cargaVista = [...document.querySelectorAll(`${r} [data-pieza="procesando-del-recomendador"] [data-pieza="carga"]`)].some((x) => x.getClientRects().length > 0)
      return { linea: l && c && l.getClientRects().length > 0 && Number(c.opacity) > 0.5 ? (l.textContent ?? '') : '', carga: cargaVista, resultado: document.querySelector(`${r} [data-pieza="resultado-del-recomendador"]`) !== null }
    }, R)
    if (m.linea !== '' && vistas[vistas.length - 1] !== m.linea) vistas.push(m.linea)
    carga ||= m.carga
    if (m.resultado) {
      fin = Date.now() - t0
      break
    }
    if (vistas.length === 2 && !fotografiado) {
      fotografiado = true
      await foto(p, ancho, alto, '5-procesando')
    }
    await dormir(50)
  }
  const ordenBien = vistas.join('|') === TEXTOS_DEL_RECOMENDADOR.procesando.join('|')
  anotar(ordenBien && carga && fin >= 2500 && fin <= 4200, 'PROCESANDO', ancho, `líneas vistas: ${vistas.length === 0 ? '(ninguna)' : vistas.join(' → ')} · carga ${carga ? 'sí' : 'NO'} · el resultado a los ${String(fin)} ms`)
  // ── RESULTADO
  await esperar(p, `(() => { const t = document.querySelector('${R} [data-parte="analisis"]'); return !!t && Number(getComputedStyle(t).opacity) > 0.9 })()`, 3000)
  await dormir(2200)
  const ab = await p.evaluate((r) => { const x = document.querySelector(`${r} [data-pieza="resultado-del-recomendador"]`); return [x?.getAttribute('data-a') ?? '', x?.getAttribute('data-b') ?? ''] }, R)
  const analizado = await leerTexto(p, `${R} [data-parte="analisis"]`)
  anotar(ab[0] === REC.a && ab[1] === REC.b && analizado === analisis(RESPUESTAS), 'RESULTADO', ancho, `A ${ab[0] ?? '?'} y B ${ab[1] ?? '?'} (la lógica: ${REC.a} y ${REC.b}) · análisis ${analizado === analisis(RESPUESTAS) ? 'el armado' : `DISTINTO: «${analizado.slice(0, 80)}…»`}`)
  await foto(p, ancho, alto, '6-resultado')
  // ── ELEGIR
  await p.evaluate((r) => {
    const w = window as Window & { __opacidadDeA?: number[] }
    w.__opacidadDeA = []
    const mirar = (): void => {
      const a = document.querySelector(`${r} [data-destacada="si"]`)?.parentElement
      w.__opacidadDeA?.push(a ? Number(getComputedStyle(a).opacity) : -1)
      if (a) requestAnimationFrame(mirar)
    }
    requestAnimationFrame(mirar)
  }, R)
  await p.locator(`${R} [data-solucion="${ELEGIDA}"]`).first().click()
  await dormir(1800)
  const opacidades = await p.evaluate(() => (window as Window & { __opacidadDeA?: number[] }).__opacidadDeA ?? [])
  const sedesvanecio = opacidades.some((o) => o > 0.05 && o < 0.95) && opacidades[opacidades.length - 1] === -1
  const mensaje = await p.evaluate(() => (document.querySelector('#recomendador-mensaje') as HTMLTextAreaElement | null)?.value ?? '')
  const precarga = await p.evaluate((r) => document.querySelector(`${r} [data-pieza="contacto-del-recomendador"] form`)?.getAttribute('data-precarga') ?? '', R)
  const servicio = solucion(ELEGIDA).servicio
  const elegirBien = sedesvanecio && (await p.locator(`${R} [data-pieza="tarjeta-de-solucion"]`).count()) === 1 && mensaje === mensajeDelContacto(RESPUESTAS, ELEGIDA) && precarga === servicio
  anotar(elegirBien, 'ELEGIR', ancho, `A se desvanece ${sedesvanecio ? 'sí' : 'NO'} (${String(opacidades.length)} cuadros) · precarga ${precarga} · mensaje ${mensaje === mensajeDelContacto(RESPUESTAS, ELEGIDA) ? 'el de las respuestas' : `DISTINTO: «${mensaje.slice(0, 60)}»`}`)
  await foto(p, ancho, alto, '7-contacto')
  // ── ENVIO (éxito y error; el servidor lo pone `main` con `modo`)
  await envio(p, ancho, alto, servicio)
  // ── REINICIO
  await p.evaluate((r) => (document.querySelector(`${r} [data-parte="empezar-de-nuevo"]`) as HTMLElement | null)?.click(), R)
  const volvio = await esperar(p, `${etapaEs(0, PREGUNTAS[0].texto)} && document.querySelector('${R}')?.getAttribute('data-fase') === 'preguntas'`, 4000)
  anotar(volvio && (await marcada(p)) === -1, 'REINICIO', ancho, volvio ? 'la primera etapa, sin nada elegido' : 'NO volvió a la primera etapa')
  await foto(p, ancho, alto, '9-de-nuevo')
}

const servidor = { modo: 'exito' as 'exito' | 'error', pedidos: [] as Record<string, unknown>[] }
const VISTAS = `(() => { window.__vistas = []; const el = document.querySelector('${R} [data-pieza="estado-de-envio"]'); if (!el) return; window.__vistas.push(el.getAttribute('data-vista')); new MutationObserver(() => window.__vistas.push(el.getAttribute('data-vista'))).observe(el, { attributes: true, attributeFilter: ['data-vista'] }) })()`
const MENSAJE_VISTO = `(() => { const m = document.querySelector('${R} [data-parte="mensaje-del-envio"]'); if (!m) return ''; const c = getComputedStyle(m); return m.getClientRects().length > 0 && c.display !== 'none' && Number(c.opacity) > 0.9 ? (m.textContent || '') : '' })()`

async function unEnvio(p: Page, modo: 'exito' | 'error', esperado: string): Promise<{ vistas: string[]; visto: boolean; pedidos: number }> {
  servidor.modo = modo
  const antes = servidor.pedidos.length
  await p.evaluate(VISTAS)
  await p.locator(`${R} [data-pieza="contacto-del-recomendador"] button[type="submit"]`).click()
  const visto = await esperar(p, `${MENSAJE_VISTO}.includes(${JSON.stringify(esperado)})`, 6000)
  await esperar(p, `document.querySelector('${R} [data-pieza="estado-de-envio"]')?.getAttribute('data-vista') === 'formulario'`, 7000)
  await dormir(600)
  return { vistas: await p.evaluate('window.__vistas') as string[], visto, pedidos: servidor.pedidos.length - antes }
}

async function envio(p: Page, ancho: number, alto: number, servicio: string): Promise<void> {
  const editado = `${mensajeDelContacto(RESPUESTAS, ELEGIDA)} Lo escribió el banco.`
  await p.locator('#recomendador-nombre').fill('Banco de prueba')
  await p.locator('#recomendador-medio').fill('banco@ejemplo.com')
  await p.locator('#recomendador-mensaje').fill(editado)
  const exito = await unEnvio(p, 'exito', '¡Recibido!')
  const cuerpo = servidor.pedidos[servidor.pedidos.length - 1] ?? {}
  const despues = await p.evaluate(() => [(document.querySelector('#recomendador-nombre') as HTMLInputElement | null)?.value ?? '?', (document.querySelector('#recomendador-mensaje') as HTMLTextAreaElement | null)?.value ?? '?'])
  const cuerpoBien = cuerpo.mensaje === editado && cuerpo.medio === 'banco@ejemplo.com' && JSON.stringify(cuerpo.intereses) === JSON.stringify(PRECARGA_POR_SERVICIO[servicio] ?? [])
  const exitoBien = exito.visto && exito.pedidos === 1 && exito.vistas.join(',').includes('carga,exito') && cuerpoBien && despues[0] === '' && despues[1] === mensajeDelContacto(RESPUESTAS, ELEGIDA)
  anotar(exitoBien, 'ENVIO (éxito)', ancho, `vistas ${exito.vistas.join(' → ')} · «¡Recibido!» ${exito.visto ? 'sí' : 'NO'} · ${String(exito.pedidos)} pedido · cuerpo ${cuerpoBien ? 'el editado, con el medio y los intereses del servicio' : JSON.stringify(cuerpo).slice(0, 120)} · vuelve ${despues[0] === '' ? 'vacío y precargado' : 'CON LO DE ANTES'}`)
  await p.locator('#recomendador-nombre').fill('Banco de prueba')
  await p.locator('#recomendador-medio').fill('banco@ejemplo.com')
  const error = await unEnvio(p, 'error', 'Algo falló')
  const conLoEscrito = await p.evaluate(() => (document.querySelector('#recomendador-nombre') as HTMLInputElement | null)?.value === 'Banco de prueba')
  anotar(error.visto && error.pedidos === 1 && error.vistas.join(',').includes('carga,error') && conLoEscrito, 'ENVIO (error)', ancho, `vistas ${error.vistas.join(' → ')} · «Algo falló» ${error.visto ? 'sí' : 'NO'} · ${String(error.pedidos)} pedido · vuelve ${conLoEscrito ? 'con lo escrito' : 'SIN LO ESCRITO'}`)
  await foto(p, ancho, alto, '8-despues-del-envio')
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const control = CONTROLES[CONTROL] ?? {}
  for (const ancho of ANCHOS) {
    const alto = ancho < 1024 ? 844 : ancho <= 1024 ? 768 : 900
    const movil = ancho < 1024
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/recomendador-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      isMobile: movil,
      hasTouch: movil,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      const estilo = control.css === undefined ? '' : `document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(control.css)}; document.head.appendChild(s) });`
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; window.__defectosDeLosGatillos = ${JSON.stringify(control.defecto ?? '')}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ${estilo} ${control.script ?? ''} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', async (r) => {
        if (r.request().method() === 'POST' && r.request().url().includes('/api/contacto')) {
          servidor.pedidos.push((r.request().postDataJSON() as Record<string, unknown> | null) ?? {})
          await dormir(400)
          return servidor.modo === 'exito'
            ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
            : r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'No se pudo enviar.' }) })
        }
        return r.abort()
      })
      await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(7000)
      await tramo(p, ancho, alto, movil)
      await flujo(p, ancho, alto)
    } catch (err) {
      anotar(false, 'EL BANCO', ancho, `se cayó: ${err instanceof Error ? err.message.split('\n')[0] ?? '' : String(err)}`)
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `recomendador-${CONTROL === '' ? 'producto' : CONTROL}.json`), JSON.stringify(lineas, null, 2))
  const malas = lineas.filter((l) => l.bien === false).length
  console.log(CONTROL === '' ? `${malas === 0 ? '✓' : '✗'} ${String(lineas.length - malas)} de ${String(lineas.length)}` : `control ${CONTROL}: ${malas > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'} (${String(malas)} fallas)`)
}

void main()
