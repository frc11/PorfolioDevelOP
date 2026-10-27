/**
 * [B12c] EL PRELOADER DEL SITIO, EN EL SITIO — el Chrome del sistema a la vista contra el dev o el build (`BASE`), `/api/` bloqueado.
 * Es el único banco que lo quiere ver: pide `window.__preloaderDelBanco = 'normal'` (decide el día y la navegación, como una persona;
 * los demás bancos salen sin él, ver `_chrome/preloader/decision.ts`). Mide, con el reloj del preloader (`window.__preloaderMedido`: el
 * tiempo que se ve, la etapa, el trazo, el pulso, si estaba listo y la opacidad de la bienvenida que ve el hilo principal, en cada cuadro)
 * y un rAF propio (el scroll, la cubierta, los cuadros largos):
 *
 *   en cada ancho (`ANCHOS`, por defecto 1440x900, 1024x768, 768x1024 y 390x844; abajo de 1024, táctil), el home y `/v3/pagina-base`:
 *     · la primera entrada del día lo muestra desde el primer cuadro (la cubierta, antes de hidratar);
 *     · cuánto dura: con la carga lista antes del freno, de 5 a 6 s; si no, el freno en el último 20 % y, desde los 6 s, el pulso;
 *     · [C2-81] la frase: en escritorio la del sonido (una flecha); abajo de 1024, táctil, la del sonido y el movimiento (dos flechas);
 *     · [C2-81] la punta de cada flecha (lo que se ve: la marca de su vértice) contra su botón, medido después: a su radio del centro
 *       (|Δ| ≤ 4 px). La del sonido a 1440, 1024 y 390; la del movimiento a 768 y 390;
 *     · el scroll: la rueda (o el dedo, abajo de 1024) no mueve la página mientras está y hasta que entra lo que llega con la entrada;
 *     · la recarga, con la fecha de AYER guardada (así lo único que la frena es el tipo de navegación): sin preloader (ni un cuadro de la
 *       cubierta); volviendo con la flecha, igual; otra entrada el mismo día, tampoco; con la fecha de otro día y una entrada nueva, otra vez;
 *     · los tirones de la entrada: los cuadros de más de 50 ms en los 3 s después de que la página aparece, con el preloader y sin él;
 *   [C2-81] EL PRELOADER CONTINUO, en el home de cada ancho, con un trace de Chrome (el criterio de `ingreso.ts`, `fundidoEnElCompositor`):
 *     · la bienvenida es una animación nativa que arranca en el compositor (su `startTime`), compuesta (sin `compositeFailed`), y en su
 *       entrada (0,9 s) y su salida (0,6 s) el compositor presenta cuadros sin huecos (≤ 50 ms) y pierde ≤ 2: la opacidad por cuadro
 *       presentado (el modelo de la línea en el tiempo de cada cuadro) va a `opacidad-<ancho>.csv`, sin escalones (≤ 0,08 entre dos);
 *     · las tareas largas (Long Tasks) durante el preloader y lo que vio el hilo principal (sus cuadros y su peor hueco en el fundido):
 *       el «antes y después» se compara corriendo este banco contra la base con `ANTES=1`;
 *   con movimiento reducido (`reducedMotion`), 1440: cerca de 1 s (más lo que falte de la carga);
 *   la frase (1440): tocarla prende el sonido; (390) prende el sonido y el movimiento (los dos botones quedan prendidos);
 *   la consola: 0 errores.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/preloader.ts
 *   ANTES=1 …                sólo mide (la base: las tareas largas, el hilo principal, el trace); no afirma lo de C2-81
 *   LENTO=6 …                la CPU 6 veces más lenta (CDP): la carga llega tarde y se ve el freno y el pulso
 *   CONTROL=sin-freno …      la flecha no frena (con LENTO: el banco TIENE que dar FALLA en el freno)
 *   CONTROL=en-recargas …    aparece también en las recargas (TIENE que dar FALLA en la recarga: con la fecha de ayer, ya no la frena el día)
 *   CONTROL=sin-bloqueo …    no bloquea el scroll (TIENE que dar FALLA en el bloqueo)
 *   CONTROL=en-el-hilo …     el texto lo empuja el hilo principal, sus animaciones en pausa (TIENE que dar FALLA en el compositor)
 *   CONTROL=punta-corta …    las flechas terminan 20 px antes del botón (TIENE que dar FALLA en las puntas)
 *   CONTROL=sin-movimiento … el teléfono sin el movimiento (TIENE que dar FALLA en la frase de abajo de 1024)
 *
 * Fotos y el CSV en la salida del banco (`salidaDelBanco('preloader')`). Sin correr al escribirse (C2-81): lo corre el orquestador.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { chromium, type BrowserContext, type CDPSession, type Page } from '@playwright/test'

import { LINEA, lineaNueva, vistaDeLaLinea } from '../src/app/v3/_chrome/preloader/linea'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'
import { desplazarConElDedo, tocar } from './tactil'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const CONTROL = process.env.CONTROL ?? ''
const ANTES = process.env.ANTES === '1'
const LENTO = Number(process.env.LENTO ?? '1')
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1024x768,768x1024,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const SALIDA = salidaDelBanco('preloader')
const CLAVE_DEL_DIA = 'develop-v3-preloader'
const DEL_MOVIMIENTO = new Set(['sin-movimiento'])
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const fallas: string[] = []
const ver = (bien: boolean, que: string, detalle = ''): void => {
  console.log(`${bien ? 'ok   ' : 'FALLA'} ${que}${detalle === '' ? '' : ` — ${detalle}`}`)
  if (!bien) fallas.push(que)
}
/** Lo de C2-81: con `ANTES=1` (la base) sólo se informa. */
const verNuevo = (bien: boolean, que: string, detalle = ''): void => (ANTES ? console.log(`info  ${que} — ${detalle}`) : ver(bien, que, detalle))

/** El pedido del banco y el registro por cuadro, instalados antes que la página (en cada carga del documento). */
const inicio = (conPreloader: boolean): string => `(() => {
  window.__name = window.__name || ((f) => f)
  window.__entornoDeLaEscena = 'producto'
  ${conPreloader ? `window.__preloaderDelBanco = 'normal'` : `try { sessionStorage.setItem('home:intro', '1') } catch (e) {}`}
  ${CONTROL === '' ? '' : DEL_MOVIMIENTO.has(CONTROL) ? `window.__defectosDelMovimiento = ${JSON.stringify(CONTROL)}` : `window.__defectosDelPreloader = ${JSON.stringify(CONTROL)}`}
  // Las tareas largas, desde el principio de la navegación.
  window.__tareasLargas = []
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__tareasLargas.push({ inicio: e.startTime, dura: e.duration }) }).observe({ type: 'longtask', buffered: true }) } catch (e) {}
  // [C2-81] Las animaciones nativas del texto: cuándo se crean (con una marca para el trace) y cuándo arrancan en el compositor.
  const animar = Element.prototype.animate
  // La marca va ANTES de crearla: así en el trace la animación de cada parte cae entre su marca y la siguiente (el reloj maestro de la
  // capa, una animación sin objetivo que no se compone, se crea antes de la primera marca y queda afuera).
  Element.prototype.animate = function (...a) {
    const parte = this.getAttribute && this.getAttribute('data-parte')
    const propia = (parte === 'bienvenida' || parte === 'blanco' || parte === 'frase') && this.closest && this.closest('[data-pieza="preloader"]')
    let r = null
    if (propia) {
      r = { parte, creada: performance.now(), inicio: NaN, duracion: Number(a[1] && a[1].duration), demora: Number((a[1] && a[1].delay) || 0) }
      ;(window.__animacionesDelPreloader = window.__animacionesDelPreloader || []).push(r)
      performance.mark('preloader-' + parte + '-' + String(window.__animacionesDelPreloader.length))
    }
    const anim = animar.apply(this, a)
    if (r !== null) anim.ready.then(() => { r.inicio = anim.startTime === null ? NaN : Number(anim.startTime) }).catch(() => {})
    return anim
  }
  const log = (window.__cuadrosDelBanco = [])
  let antes = null
  const cuadro = (ahora) => {
    const cubierta = document.querySelector('[data-pieza="preloader"]')
    const velo = document.querySelector('[data-pieza="velo-de-carga"]')
    const bienvenida = document.querySelector('[data-pieza="preloader"] p')
    log.push({ t: ahora, dt: antes === null ? 0 : ahora - antes, y: window.scrollY, cubierta: cubierta !== null && getComputedStyle(cubierta).display !== 'none' && getComputedStyle(cubierta).visibility !== 'hidden' && Number(getComputedStyle(cubierta).opacity) > 0, velo: velo !== null, v3: document.querySelector('[data-v3]') !== null, bienvenida: bienvenida && bienvenida.parentElement ? Number(getComputedStyle(bienvenida.parentElement).opacity) : NaN })
    antes = ahora
    if (log.length > 4000) log.splice(0, 2000)
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

interface CuadroDelBanco {
  readonly t: number
  readonly dt: number
  readonly y: number
  readonly cubierta: boolean
  readonly velo: boolean
  /** El árbol de /v3 ya está en el documento (antes, no hay nada que tapar). */
  readonly v3: boolean
  /** La opacidad de la bienvenida que ve el hilo principal. */
  readonly bienvenida: number
}
interface MuestraDelPreloader {
  readonly t: number
  readonly ahora: number
  readonly etapa: string
  readonly trazo: number
  readonly pulsa: boolean
  readonly listo: boolean
}
interface Punto {
  readonly x: number
  readonly y: number
}
interface FinalDelPreloader {
  readonly puntas?: readonly { readonly objetivo: 'sonido' | 'movimiento'; readonly punta: Punto | null; readonly trazada: Punto | null }[]
  readonly conMovimiento?: boolean
  readonly activado: boolean
  readonly t: number
}
interface Medido {
  readonly muestras: MuestraDelPreloader[]
  readonly final: FinalDelPreloader | null
}
interface AnimacionDelTexto {
  readonly parte: string
  readonly creada: number
  readonly inicio: number
  readonly duracion: number
  readonly demora: number
}
interface EventoDelTrace {
  readonly name: string
  readonly ph: string
  readonly ts: number
  readonly id?: string
  readonly id2?: { readonly local?: string }
  readonly args?: { readonly data?: { readonly displayName?: string; readonly compositeFailed?: number }; readonly hasPartialUpdate?: boolean; readonly chrome_frame_reporter?: { readonly state?: string } }
}
interface Abierto {
  readonly ctx: BrowserContext
  readonly p: Page
  readonly cdp: CDPSession
  readonly errores: string[]
  readonly movil: boolean
}

async function abrir(ancho: number, alto: number, conPreloader: boolean, reducido = false): Promise<Abierto> {
  const perfil = perfilDelBanco('preloader')
  // Abajo de 1024, táctil (el teléfono y la tablet hacen lo mismo).
  const movil = ancho < 1024
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: movil,
    hasTouch: movil,
    reducedMotion: reducido ? 'reduce' : 'no-preference',
    args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  await ctx.addInitScript(inicio(conPreloader))
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const errores: string[] = []
  p.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text().slice(0, 200))
  })
  p.on('pageerror', (e) => errores.push(e.message.slice(0, 200)))
  await p.route('**/api/**', (r) => r.abort())
  const cdp = await ctx.newCDPSession(p)
  if (LENTO > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: LENTO })
  return { ctx, p, cdp, errores, movil }
}

const cuadros = (p: Page): Promise<CuadroDelBanco[]> => p.evaluate(() => (window as unknown as { __cuadrosDelBanco: CuadroDelBanco[] }).__cuadrosDelBanco.slice())
const medido = (p: Page): Promise<Medido | null> => p.evaluate(() => (window as unknown as { __preloaderMedido?: Medido }).__preloaderMedido ?? null)
const cajaDe = (p: Page, sel: string): Promise<{ readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number } | null> =>
  p.evaluate((s) => {
    const b = document.querySelector(s)
    if (b === null) return null
    const r = b.getBoundingClientRect()
    return { x: r.left, y: r.top, ancho: r.width, alto: r.height }
  }, sel)
const BOTONES = { sonido: '[data-pieza="control-del-sonido"]', movimiento: '[data-pieza="control-del-movimiento"]' } as const

/** Un intento de scroll: la rueda en escritorio, el dedo abajo de 1024. */
async function empujar(a: Abierto, ancho: number, alto: number): Promise<void> {
  if (a.movil) await desplazarConElDedo(a.cdp, ancho / 2, alto * 0.6, 240).catch(() => undefined)
  else await a.p.mouse.wheel(0, 240).catch(() => undefined)
}

/** Empuja el scroll cada 200 ms mientras espera el final del preloader. */
async function esperarElFinal(a: Abierto, ancho: number, alto: number, ms = 30000): Promise<Medido | null> {
  const t0 = Date.now()
  if (!a.movil) await a.p.mouse.move(ancho / 2, alto / 2).catch(() => undefined)
  while (Date.now() - t0 < ms) {
    const m = await medido(a.p)
    if (m?.final !== null && m?.final !== undefined) return m
    await empujar(a, ancho, alto)
    await dormir(200)
  }
  return medido(a.p)
}

/** Sigue empujando hasta que la página se mueve (o `ms`): cuándo se movió, en el reloj de la página. */
async function esperarElScroll(a: Abierto, ancho: number, alto: number, ms = 12000): Promise<number> {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    await empujar(a, ancho, alto)
    await dormir(200)
    const c = await cuadros(a.p)
    const movido = c.find((x) => x.y > 0)
    if (movido !== undefined) return movido.t
  }
  return Number.NaN
}

/** Los cuadros largos en la ventana [desde, desde + 3000]. */
function tirones(c: readonly CuadroDelBanco[], desde: number): { readonly largos: number; readonly peor: number } {
  const en = c.filter((x) => x.t > desde && x.t <= desde + 3000)
  return { largos: en.filter((x) => x.dt > 50).length, peor: Math.max(0, ...en.map((x) => x.dt)) }
}

async function grabarElTrace(cdp: CDPSession): Promise<() => Promise<EventoDelTrace[]>> {
  const eventos: EventoDelTrace[] = []
  cdp.on('Tracing.dataCollected', (d: { value: Record<string, unknown>[] }) => {
    for (const e of d.value) {
      const name = String(e.name ?? '')
      if (name === 'Animation' || name === 'PipelineReporter' || name === 'DroppedFrame' || name.startsWith('preloader-')) eventos.push(e as unknown as EventoDelTrace)
    }
  })
  await cdp.send('Tracing.start', { categories: 'blink.animations,devtools.timeline,cc,blink.user_timing,disabled-by-default-devtools.timeline.frame', transferMode: 'ReportEvents' })
  return async () => {
    const fin = new Promise<void>((r) => cdp.once('Tracing.tracingComplete', () => r()))
    await cdp.send('Tracing.end')
    await fin
    return eventos
  }
}

/**
 * [C2-81] LA BIENVENIDA EN EL COMPOSITOR (el criterio de `ingreso.ts`): cuándo arrancó la animación nativa (su `startTime`, alineado al trace
 * por su marca), si se compuso, y los cuadros que el compositor presentó en su entrada y su salida. La opacidad de cada cuadro presentado
 * es la del modelo (`vistaDeLaLinea`) en su tiempo: un hueco entre cuadros es un escalón.
 */
function bienvenidaEnElCompositor(eventos: readonly EventoDelTrace[], animaciones: readonly AnimacionDelTexto[], tag: string): { readonly bien: boolean; readonly detalle: string } {
  const i = animaciones.findLastIndex((a) => a.parte === 'bienvenida' && Number.isFinite(a.inicio))
  const a = animaciones[i]
  if (a === undefined) return { bien: false, detalle: 'sin una animación nativa corriendo sobre la bienvenida (la pinta el hilo principal)' }
  const marca = eventos.find((e) => e.name === `preloader-bienvenida-${String(i + 1)}`)
  if (marca === undefined) return { bien: false, detalle: 'sin la marca de la animación en el trace' }
  const desde = marca.ts + (a.inicio - a.creada) * 1000
  const clave = (e: EventoDelTrace): string => e.id2?.local ?? e.id ?? ''
  // La suya: la que nace entre su marca y la marca siguiente (la del blanco), nativa (sin `displayName`).
  const siguiente = eventos.filter((e) => e.name.startsWith('preloader-') && e.ts > marca.ts).reduce((m, e) => Math.min(m, e.ts), marca.ts + 5000)
  const propias = eventos.filter((e) => e.name === 'Animation' && e.ph === 'b' && e.ts >= marca.ts && e.ts < siguiente && e.args?.data?.displayName === '')
  const fallo = propias.flatMap((b) => eventos.filter((e) => e.name === 'Animation' && e.ph === 'n' && clave(e) === clave(b) && (e.args?.data?.compositeFailed ?? 0) !== 0))[0]
  const presentados = eventos.filter((e) => e.name === 'PipelineReporter' && e.ph === 'b' && e.args?.chrome_frame_reporter?.state !== 'STATE_DROPPED').map((e) => e.ts).sort((x, y) => x - y)
  const tramo = (t0: number, t1: number): { readonly cuadros: number[]; readonly hueco: number; readonly salto: number; readonly perdidos: number } => {
    const en = presentados.filter((ts) => ts >= desde + t0 * 1000 && ts <= desde + t1 * 1000)
    const bordes = [desde + t0 * 1000, ...en, desde + t1 * 1000]
    const hueco = Math.max(0, ...bordes.slice(1).map((ts, k) => (ts - bordes[k]) / 1000))
    const opacidad = (ts: number): number => vistaDeLaLinea({ ...lineaNueva(), t: (ts - desde) / 1000 }, false).bienvenida
    const salto = Math.max(0, ...en.slice(1).map((ts, k) => Math.abs(opacidad(ts) - opacidad(en[k]))))
    const perdidos = eventos.filter((e) => e.name === 'DroppedFrame' && e.ts >= desde + t0 * 1000 && e.ts <= desde + t1 * 1000 && e.args?.hasPartialUpdate !== true).length
    return { cuadros: en, hueco, salto, perdidos }
  }
  const entra = tramo(0, LINEA.bienvenidaEntraMs)
  const sale = tramo(LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs, LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs + LINEA.bienvenidaSaleMs)
  const csv = ['ms,opacidad,tramo', ...[...entra.cuadros.map((ts) => [ts, 'entra'] as const), ...sale.cuadros.map((ts) => [ts, 'sale'] as const)].map(([ts, q]) => `${((ts - desde) / 1000).toFixed(1)},${vistaDeLaLinea({ ...lineaNueva(), t: (ts - desde) / 1000 }, false).bienvenida.toFixed(4)},${q}`)].join('\n')
  writeFileSync(path.join(SALIDA, `opacidad-${tag}.csv`), csv)
  const bien = propias.length > 0 && fallo === undefined && entra.cuadros.length >= Math.floor(LINEA.bienvenidaEntraMs / 20) && entra.hueco <= 50 && sale.hueco <= 50 && entra.salto <= 0.08 && sale.salto <= 0.08 && entra.perdidos + sale.perdidos <= 2
  const compuesta = propias.length === 0 ? 'sin sus eventos en el trace' : fallo === undefined ? 'compuesta' : `NO compuesta (${String(fallo.args?.data?.compositeFailed)})`
  return {
    bien,
    detalle: `${compuesta}; entrada: ${String(entra.cuadros.length)} cuadros presentados, el peor hueco ${entra.hueco.toFixed(0)} ms, el peor salto de opacidad ${entra.salto.toFixed(3)}, ${String(entra.perdidos)} perdidos; salida: ${String(sale.cuadros.length)} cuadros, hueco ${sale.hueco.toFixed(0)} ms, salto ${sale.salto.toFixed(3)}; arrancó ${(a.inicio - a.creada).toFixed(0)} ms después de crearse`,
  }
}

/** Lo que vio el hilo principal de la bienvenida (sus cuadros en la entrada) y las tareas largas durante el preloader. */
async function loQueVioElHilo(p: Page, desde: number, hasta: number): Promise<string> {
  const c = (await cuadros(p)).filter((x) => x.t >= desde && x.t <= hasta)
  const subiendo = c.filter((x) => x.bienvenida > 0.001 && x.bienvenida < 0.999)
  const hueco = Math.max(0, ...subiendo.slice(1).map((x, k) => x.t - subiendo[k].t))
  const largas = (await p.evaluate(() => (window as unknown as { __tareasLargas?: { inicio: number; dura: number }[] }).__tareasLargas ?? [])).filter((x) => x.inicio >= desde - 50 && x.inicio <= hasta)
  return `el hilo principal: ${String(subiendo.length)} cuadros con la bienvenida a medio camino (el peor hueco ${hueco.toFixed(0)} ms); tareas largas durante el preloader: ${String(largas.length)} (${largas.reduce((n, x) => n + x.dura, 0).toFixed(0)} ms en total, la peor ${Math.max(0, ...largas.map((x) => x.dura)).toFixed(0)} ms)`
}

async function unaEntrada(ancho: number, alto: number, ruta: string): Promise<void> {
  const tag = `${String(ancho)} ${ruta}`
  const a = await abrir(ancho, alto, true)
  const { ctx, p, errores, movil } = a
  try {
    const conTrace = ruta === '/v3'
    const parar = conTrace ? await grabarElTrace(a.cdp) : null
    await p.goto(`${BASE}${ruta}`, { waitUntil: 'commit', timeout: 300000 })
    // La frase, mientras está (después se desmonta).
    const frase = await p.waitForSelector('[data-pieza="preloader"] button', { timeout: 30000, state: 'attached' }).then((h) => h.textContent()).catch(() => null)
    const m = await esperarElFinal(a, ancho, alto)
    const c = await cuadros(p)
    ver(c.find((x) => x.v3)?.cubierta === true, `${tag} · la primera entrada del día lo muestra desde el primer cuadro (el primero con la página en el documento ya está tapado)`, `${String(c.filter((x) => x.cubierta).length)} cuadros con la cubierta`)
    if (m === null || m.final === null) {
      ver(false, `${tag} · el preloader termina`, 'no terminó en 30 s')
      if (parar !== null) await parar()
      return
    }
    const primero = m.muestras[0]
    const fuera = m.muestras.find((x) => x.etapa === 'fuera') ?? m.muestras[m.muestras.length - 1]
    if (parar !== null) {
      const eventos = await parar()
      const animaciones = await p.evaluate(() => (window as unknown as { __animacionesDelPreloader?: AnimacionDelTexto[] }).__animacionesDelPreloader ?? [])
      const r = bienvenidaEnElCompositor(eventos, animaciones, `${String(ancho)}`)
      verNuevo(r.bien, `${tag} · la bienvenida, continua: en el compositor, sin huecos ni escalones por cuadro (C2-81; rojo: CONTROL=en-el-hilo)`, r.detalle)
      console.log(`info  ${tag} · ${await loQueVioElHilo(p, primero?.ahora ?? 0, fuera.ahora)}`)
    }
    // La frase y las flechas: abajo de 1024 (táctil), la del movimiento y dos flechas.
    const conMovimiento = movil
    const esperada = conMovimiento ? 'Recomendamos activar el sonido y el movimiento.' : 'Recomendamos activar el sonido.'
    verNuevo(frase?.trim() === esperada && m.final.conMovimiento === conMovimiento && (m.final.puntas?.length ?? 0) === (conMovimiento ? 2 : 1), `${tag} · la frase y sus flechas (${conMovimiento ? 'táctil: el sonido y el movimiento, dos flechas' : 'escritorio: el sonido, una flecha'})`, `«${String(frase)}» · ${String(m.final.puntas?.length ?? 0)} flechas`)
    const listo = m.muestras.find((x) => x.listo)
    const antesDelFreno = listo !== undefined && m.muestras.filter((x) => x.t <= listo.t).every((x) => x.trazo < 0.8)
    if (antesDelFreno) ver(fuera.t >= 5000 && fuera.t <= 6000, `${tag} · con la carga lista antes del freno, dura de 5 a 6 s`, `${String(fuera.t)} ms (lista a los ${String(listo?.t ?? -1)})`)
    else {
      const antesDeListo = m.muestras.filter((x) => listo === undefined || x.t < listo.t)
      const maximo = Math.max(0, ...antesDeListo.map((x) => x.trazo))
      const quieta = antesDeListo.filter((x) => x.t >= 6100)
      ver(maximo < 1 && maximo >= 0.8, `${tag} · sin la carga, la flecha frena en su último 20 % (no llega)`, `lo más dibujado sin la carga: ${maximo.toFixed(3)} · lista a los ${String(listo?.t ?? -1)} ms`)
      ver(quieta.length === 0 || quieta.every((x) => x.pulsa && x.trazo === quieta[0].trazo), `${tag} · desde los 6 s, quieta con el pulso`, `${String(quieta.length)} cuadros después de los 6 s sin la carga`)
    }
    // Las puntas (lo que se ve) contra los botones, medidos ya sin la cubierta.
    await dormir(400)
    for (const punta of m.final.puntas ?? []) {
      const boton = await cajaDe(p, BOTONES[punta.objetivo])
      const en = punta.punta
      if (boton !== null && en !== null) {
        const centro = { x: boton.x + boton.ancho / 2, y: boton.y + boton.alto / 2 }
        const radio = Math.min(boton.ancho, boton.alto) / 2
        const d = Math.hypot(en.x - centro.x, en.y - centro.y)
        verNuevo(Math.abs(d - radio) <= 4, `${tag} · la punta de la flecha del ${punta.objetivo} termina sobre su botón (a su radio del centro, |Δ| ≤ 4 px; rojo: CONTROL=punta-corta)`, `${d.toFixed(1)} px del centro, radio ${radio.toFixed(1)}, Δ ${(d - radio).toFixed(1)}`)
      } else verNuevo(false, `${tag} · la punta de la flecha del ${punta.objetivo} contra su botón`, `botón ${String(boton !== null)}, punta ${String(en !== null)}`)
    }
    // El scroll: nada se movió mientras estaba; se mueve recién cuando entra lo que llega con la entrada.
    const finEnLaPagina = fuera.ahora
    const movidoAntes = (await cuadros(p)).filter((x) => x.t < finEnLaPagina).some((x) => x.y > 0)
    ver(!movidoAntes, `${tag} · ${movil ? 'el dedo' : 'la rueda'} no mueve la página mientras está el preloader`)
    const seMovio = await esperarElScroll(a, ancho, alto)
    const despues = seMovio - finEnLaPagina
    const minimo = ancho >= 1024 ? 2000 : 0
    ver(Number.isFinite(despues) && despues >= minimo && despues <= 6800, `${tag} · el scroll se suelta cuando entra lo que llega con la entrada (${ancho >= 1024 ? 'el logo que cae o el título' : 'abajo de 1024, enseguida'})`, `${despues.toFixed(0)} ms después de irse el blanco`)
    const t = tirones(await cuadros(p), finEnLaPagina)
    console.log(`       ${tag} · tirones con el preloader: ${String(t.largos)} cuadros de más de 50 ms en los 3 s de la entrada (el peor, ${t.peor.toFixed(0)} ms)`)
    await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}${ruta.replace(/\//g, '-')}-despues.png`) })

    // La recarga: con la fecha de AYER guardada, lo único que lo frena es que sea una recarga (el control `en-recargas` lo muestra).
    const hoy = await p.evaluate((clave) => localStorage.getItem(clave), CLAVE_DEL_DIA)
    await p.evaluate((clave) => localStorage.setItem(clave, '2000-1-1'), CLAVE_DEL_DIA)
    await p.reload({ waitUntil: 'load' })
    await dormir(2500)
    ver(!(await cuadros(p)).some((x) => x.cubierta), `${tag} · en la recarga no aparece, aunque el día guardado sea otro (ni un cuadro; rojo: CONTROL=en-recargas)`)
    // Volviendo con la flecha: igual.
    await p.evaluate((clave) => localStorage.setItem(clave, '2000-1-1'), CLAVE_DEL_DIA)
    await p.goto(`${BASE}${ruta}?otra=1`, { waitUntil: 'load' })
    await dormir(1500)
    await p.evaluate((clave) => localStorage.setItem(clave, '2000-1-1'), CLAVE_DEL_DIA)
    await p.goBack({ waitUntil: 'load' })
    await dormir(2500)
    ver(!(await cuadros(p)).some((x) => x.cubierta), `${tag} · volviendo con la flecha (un documento del historial) no aparece, aunque el día guardado sea otro`)
    // Otra entrada el mismo día (lo guardado es hoy: lo que dejó la primera entrada): no.
    await p.evaluate(([clave, dia]) => localStorage.setItem(clave, dia ?? ''), [CLAVE_DEL_DIA, hoy] as const)
    await p.goto(`${BASE}${ruta}?y=1`, { waitUntil: 'load' })
    await dormir(2500)
    ver(!(await cuadros(p)).some((x) => x.cubierta), `${tag} · otra entrada el mismo día: no aparece`)
    await p.evaluate((clave) => localStorage.setItem(clave, '2000-1-1'), CLAVE_DEL_DIA)
    await p.goto(`${BASE}${ruta}`, { waitUntil: 'commit' })
    await dormir(1500)
    ver((await cuadros(p)).some((x) => x.cubierta), `${tag} · con la fecha de otro día guardada y una entrada nueva, vuelve a aparecer`)
    ver(errores.length === 0, `${tag} · la consola sin errores`, errores.slice(0, 3).join(' | '))
  } finally {
    await ctx.close()
  }
}

/** Sin el preloader (la siembra de siempre): los tirones de la entrada, para comparar. */
async function sinPreloader(ancho: number, alto: number, ruta: string): Promise<void> {
  const { ctx, p } = await abrir(ancho, alto, false)
  try {
    await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
    await dormir(9000)
    const c = await cuadros(p)
    ver(!c.some((x) => x.cubierta), `${String(ancho)} ${ruta} · [control] con la siembra de los bancos no aparece`)
    const aparece = ruta === '/v3' ? (c.find((x) => !x.velo)?.t ?? c[0]?.t ?? 0) : (c[0]?.t ?? 0)
    const t = tirones(c, aparece)
    console.log(`       ${String(ancho)} ${ruta} · tirones sin el preloader: ${String(t.largos)} cuadros de más de 50 ms en los 3 s de la entrada (el peor, ${t.peor.toFixed(0)} ms)`)
  } finally {
    await ctx.close()
  }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  for (const [ancho, alto] of ANCHOS) {
    for (const ruta of ['/v3', '/v3/pagina-base']) {
      await unaEntrada(ancho, alto, ruta)
      await sinPreloader(ancho, alto, ruta)
    }
  }

  // Con movimiento reducido: ~1 s (más lo que falte de la carga).
  {
    const a = await abrir(1440, 900, true, true)
    try {
      await a.p.goto(`${BASE}/v3`, { waitUntil: 'commit', timeout: 300000 })
      const m = await esperarElFinal(a, 1440, 900)
      const fuera = m?.muestras.find((x) => x.etapa === 'fuera')
      const listo = m?.muestras.find((x) => x.listo)
      ver(fuera !== undefined && fuera.t <= Math.max(1300, (listo?.t ?? 0) + 300) && (m?.muestras.every((x) => !x.pulsa) ?? false), '1440 · con movimiento reducido, cerca de 1 s y sin pulso', `${String(fuera?.t ?? -1)} ms (lista a los ${String(listo?.t ?? -1)})`)
    } finally {
      await a.ctx.close()
    }
  }

  // La frase: tocarla prende el sonido (1440) y, en el teléfono, también el movimiento (390: el sensor de mentira manda lecturas).
  for (const [ancho, alto] of [
    [1440, 900],
    [390, 844],
  ] as const) {
    const a = await abrir(ancho, alto, true)
    try {
      await a.p.goto(`${BASE}/v3`, { waitUntil: 'commit', timeout: 300000 })
      await a.p.waitForSelector('[data-pieza="preloader"] button', { timeout: 30000 })
      await dormir(4000)
      const caja = await cajaDe(a.p, '[data-pieza="preloader"] button')
      if (a.movil && caja !== null) await tocar(a.cdp, caja.x + caja.ancho / 2, caja.y + caja.alto / 2)
      else await a.p.click('[data-pieza="preloader"] button')
      const lecturas = a.movil ? setInterval(() => void a.p.evaluate(() => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: 60, gamma: 4 }))).catch(() => undefined), 100) : null
      const m = await esperarElFinal(a, ancho, alto)
      const prendido = await a.p.evaluate(() => localStorage.getItem('develop-v3-sonido'))
      ver(prendido === 'si' && m?.final?.activado === true, `${String(ancho)} · tocar la frase prende el sonido (la preferencia) y la página entra con él`, `preferencia ${String(prendido)}`)
      ver((await a.p.getAttribute(BOTONES.sonido, 'aria-pressed')) === 'true', `${String(ancho)} · el botón del sonido, donde apuntó la flecha, queda prendido`)
      if (a.movil) {
        const mov = { estado: await a.p.getAttribute(BOTONES.movimiento, 'data-estado'), etiqueta: await a.p.getAttribute(BOTONES.movimiento, 'aria-label') }
        verNuevo(mov.estado === 'prendido' && mov.etiqueta === 'Desactivar movimiento', `${String(ancho)} · y el movimiento: su botón queda prendido («Desactivar movimiento»)`, `${String(mov.estado)} · «${String(mov.etiqueta)}»`)
      }
      if (lecturas !== null) clearInterval(lecturas)
    } finally {
      await a.ctx.close()
    }
  }

  console.log(`\n${fallas.length === 0 ? 'BIEN' : `FALLAS (${String(fallas.length)})`}${CONTROL === '' ? '' : ` · con el control ${CONTROL} (tiene que FALLAR)`}${ANTES ? ' · ANTES: lo de C2-81, sólo informado' : ''}`)
  process.exit(fallas.length === 0 ? 0 : 1)
}

void main()
