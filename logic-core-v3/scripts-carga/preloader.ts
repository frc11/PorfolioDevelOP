/**
 * [B12c] EL PRELOADER DEL SITIO, EN EL SITIO — el Chrome del sistema a la vista contra el dev o el build (`BASE`), `/api/` bloqueado.
 * Es el único banco que lo quiere ver: pide `window.__preloaderDelBanco = 'normal'` (decide el día y la navegación, como una persona;
 * los demás bancos salen sin él, ver `_chrome/preloader/decision.ts`). Mide, con el reloj del preloader (`window.__preloaderMedido`: el
 * tiempo que se ve, la etapa, el trazo, el pulso y si estaba listo, en cada cuadro) y un rAF propio (el scroll, la cubierta, los
 * cuadros largos):
 *
 *   en cada ancho (`ANCHOS`, por defecto 1440x900, 1024x768 y 390x844), el home y `/v3/pagina-base`, con el perfil limpio:
 *     · la primera entrada del día lo muestra desde el primer cuadro (la cubierta, antes de hidratar);
 *     · cuánto dura: con la carga lista antes del freno, de 5 a 6 s; si no, el freno en el último 20 % (nunca llega sin la carga) y,
 *       desde los 6 s, quieta con el pulso;
 *     · la punta de la flecha contra el botón del sonido, medido después: a su radio del centro (± 1,5 px), apuntando al centro;
 *     · el scroll: la rueda no mueve la página mientras está y hasta que entra lo que llega con la entrada (el logo del hero que cae, el
 *       título de la página); después sí (cuándo, en ms desde que el blanco se fue);
 *     · la recarga, otra entrada el mismo día: sin preloader (ni un cuadro de la cubierta); con la fecha de ayer: otra vez;
 *     · los tirones de la entrada: los cuadros de más de 50 ms en los 3 s después de que la página aparece, con el preloader y sin él
 *       (otro perfil con la siembra de siempre: aparece cuando se va el velo de carga, o enseguida en una página);
 *   con movimiento reducido (`reducedMotion`), 1440: cerca de 1 s (más lo que falte de la carga);
 *   la frase del sonido (1440): tocarla prende el sonido (la preferencia guardada) y el preloader sigue;
 *   la consola: 0 errores.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/preloader.ts
 *   LENTO=6 …              la CPU 6 veces más lenta (CDP): la carga llega tarde y se ve el freno y el pulso
 *   CONTROL=sin-freno …    la flecha no frena (con LENTO: el banco TIENE que dar FALLA en el freno)
 *   CONTROL=en-recargas …  aparece también en las recargas (TIENE que dar FALLA en la recarga)
 *   CONTROL=sin-bloqueo …  no bloquea el scroll (TIENE que dar FALLA en el bloqueo)
 *
 * Fotos en `~/.cache/b4-medicion/preloader/`. Sin correr al escribirse (B12c nocturno): lo corre el orquestador.
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type BrowserContext, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const CONTROL = process.env.CONTROL ?? ''
const LENTO = Number(process.env.LENTO ?? '1')
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1024x768,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/preloader')
const CLAVE_DEL_DIA = 'develop-v3-preloader'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const fallas: string[] = []
const ver = (bien: boolean, que: string, detalle = ''): void => {
  console.log(`${bien ? 'ok   ' : 'FALLA'} ${que}${detalle === '' ? '' : ` — ${detalle}`}`)
  if (!bien) fallas.push(que)
}

/** El pedido del banco y el registro por cuadro, instalados antes que la página (en cada carga del documento). */
const inicio = (conPreloader: boolean): string => `(() => {
  window.__name = window.__name || ((f) => f)
  window.__entornoDeLaEscena = 'producto'
  ${conPreloader ? `window.__preloaderDelBanco = 'normal'` : `try { sessionStorage.setItem('home:intro', '1') } catch (e) {}`}
  ${CONTROL === '' ? '' : `window.__defectosDelPreloader = ${JSON.stringify(CONTROL)}`}
  const log = (window.__cuadrosDelBanco = [])
  let antes = null
  const cuadro = (ahora) => {
    const cubierta = document.querySelector('[data-pieza="preloader"]')
    const velo = document.querySelector('[data-pieza="velo-de-carga"]')
    log.push({ t: ahora, dt: antes === null ? 0 : ahora - antes, y: window.scrollY, cubierta: cubierta !== null && getComputedStyle(cubierta).display !== 'none' && getComputedStyle(cubierta).visibility !== 'hidden' && Number(getComputedStyle(cubierta).opacity) > 0, velo: velo !== null, v3: document.querySelector('[data-v3]') !== null })
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
  readonly trazado?: { readonly punta: Punto; readonly direccion: Punto }
  readonly activado: boolean
  readonly t: number
}
interface Medido {
  readonly muestras: MuestraDelPreloader[]
  readonly final: FinalDelPreloader | null
}

async function abrir(ancho: number, alto: number, conPreloader: boolean, reducido = false): Promise<{ readonly ctx: BrowserContext; readonly p: Page; readonly errores: string[] }> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/preloader-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const movil = ancho < 768
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
  if (LENTO > 1) {
    const cdp = await ctx.newCDPSession(p)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: LENTO })
  }
  return { ctx, p, errores }
}

const cuadros = (p: Page): Promise<CuadroDelBanco[]> => p.evaluate(() => (window as unknown as { __cuadrosDelBanco: CuadroDelBanco[] }).__cuadrosDelBanco.slice())
const medido = (p: Page): Promise<Medido | null> => p.evaluate(() => (window as unknown as { __preloaderMedido?: Medido }).__preloaderMedido ?? null)
const elBoton = (p: Page): Promise<{ readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number } | null> =>
  p.evaluate(() => {
    const b = document.querySelector('[data-pieza="control-del-sonido"]')
    if (b === null) return null
    const r = b.getBoundingClientRect()
    return { x: r.left, y: r.top, ancho: r.width, alto: r.height }
  })

/** Rueda cada 200 ms mientras espera el final del preloader; devuelve cuándo (ms del reloj de la página) se movió el scroll por primera vez. */
async function esperarElFinal(p: Page, ms = 30000): Promise<Medido | null> {
  const t0 = Date.now()
  await p.mouse.move(700, 450).catch(() => undefined)
  while (Date.now() - t0 < ms) {
    const m = await medido(p)
    if (m?.final !== null && m?.final !== undefined) return m
    await p.mouse.wheel(0, 240).catch(() => undefined)
    await dormir(200)
  }
  return medido(p)
}

/** Sigue con la rueda hasta que la página se mueve (o `ms`): cuándo se movió, en el reloj de la página. */
async function esperarElScroll(p: Page, ms = 12000): Promise<number> {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    await p.mouse.wheel(0, 240).catch(() => undefined)
    await dormir(200)
    const c = await cuadros(p)
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

async function unaEntrada(ancho: number, alto: number, ruta: string): Promise<void> {
  const tag = `${String(ancho)} ${ruta}`
  const { ctx, p, errores } = await abrir(ancho, alto, true)
  try {
    await p.goto(`${BASE}${ruta}`, { waitUntil: 'commit', timeout: 300000 })
    const m = await esperarElFinal(p)
    const c = await cuadros(p)
    ver(c.find((x) => x.v3)?.cubierta === true, `${tag} · la primera entrada del día lo muestra desde el primer cuadro (el primero con la página en el documento ya está tapado)`, `${String(c.filter((x) => x.cubierta).length)} cuadros con la cubierta`)
    if (m === null || m.final === null) {
      ver(false, `${tag} · el preloader termina`, 'no terminó en 30 s')
      return
    }
    const fuera = m.muestras.find((x) => x.etapa === 'fuera') ?? m.muestras[m.muestras.length - 1]
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
    // La punta contra el botón, medido ya sin la cubierta.
    await dormir(400)
    const boton = await elBoton(p)
    const punta = m.final.trazado?.punta
    if (boton !== null && punta !== undefined) {
      const centro = { x: boton.x + boton.ancho / 2, y: boton.y + boton.alto / 2 }
      const radio = Math.min(boton.ancho, boton.alto) / 2
      const d = Math.hypot(punta.x - centro.x, punta.y - centro.y)
      ver(Math.abs(d - radio) <= 1.5, `${tag} · la punta de la flecha termina en el botón del sonido (a su radio del centro)`, `${d.toFixed(1)} px del centro, radio ${radio.toFixed(1)}`)
    } else ver(false, `${tag} · la punta de la flecha contra el botón`, `botón ${String(boton !== null)}, punta ${String(punta !== undefined)}`)
    // El scroll: nada se movió mientras estaba; se mueve recién cuando entra lo que llega con la entrada.
    const finEnLaPagina = fuera.ahora
    const movidoAntes = (await cuadros(p)).filter((x) => x.t < finEnLaPagina).some((x) => x.y > 0)
    ver(!movidoAntes, `${tag} · la rueda no mueve la página mientras está el preloader`)
    const seMovio = await esperarElScroll(p)
    const despues = seMovio - finEnLaPagina
    const minimo = ancho >= 1024 ? 2000 : 0
    ver(Number.isFinite(despues) && despues >= minimo && despues <= 6800, `${tag} · el scroll se suelta cuando entra lo que llega con la entrada (${ancho >= 1024 ? 'el logo que cae o el título' : 'abajo de 1024, enseguida'})`, `${despues.toFixed(0)} ms después de irse el blanco`)
    const t = tirones(await cuadros(p), finEnLaPagina)
    console.log(`       ${tag} · tirones con el preloader: ${String(t.largos)} cuadros de más de 50 ms en los 3 s de la entrada (el peor, ${t.peor.toFixed(0)} ms)`)
    await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}${ruta.replace(/\//g, '-')}-despues.png`) })

    // La recarga y otra entrada el mismo día: sin un cuadro de la cubierta. Con la fecha de ayer: otra vez.
    await p.reload({ waitUntil: 'load' })
    await dormir(2500)
    ver(!(await cuadros(p)).some((x) => x.cubierta), `${tag} · en la recarga no aparece (ni un cuadro)`)
    await p.goto(`${BASE}${ruta}`, { waitUntil: 'load' })
    await dormir(2500)
    ver(!(await cuadros(p)).some((x) => x.cubierta), `${tag} · otra entrada el mismo día: no aparece`)
    await p.evaluate((clave) => localStorage.setItem(clave, '2000-1-1'), CLAVE_DEL_DIA)
    await p.goto(`${BASE}${ruta}`, { waitUntil: 'commit' })
    await dormir(1500)
    ver((await cuadros(p)).some((x) => x.cubierta), `${tag} · con la fecha de otro día guardada, vuelve a aparecer`)
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
    const { ctx, p } = await abrir(1440, 900, true, true)
    try {
      await p.goto(`${BASE}/v3`, { waitUntil: 'commit', timeout: 300000 })
      const m = await esperarElFinal(p)
      const fuera = m?.muestras.find((x) => x.etapa === 'fuera')
      const listo = m?.muestras.find((x) => x.listo)
      ver(fuera !== undefined && fuera.t <= Math.max(1300, (listo?.t ?? 0) + 300) && (m?.muestras.every((x) => !x.pulsa) ?? false), '1440 · con movimiento reducido, cerca de 1 s y sin pulso', `${String(fuera?.t ?? -1)} ms (lista a los ${String(listo?.t ?? -1)})`)
    } finally {
      await ctx.close()
    }
  }

  // La frase del sonido: tocarla prende el sonido y el preloader sigue.
  {
    const { ctx, p } = await abrir(1440, 900, true)
    try {
      await p.goto(`${BASE}/v3`, { waitUntil: 'commit', timeout: 300000 })
      await p.waitForSelector('[data-pieza="preloader"] button', { timeout: 30000 })
      await dormir(500)
      await p.click('[data-pieza="preloader"] button')
      const m = await esperarElFinal(p)
      const prendido = await p.evaluate(() => localStorage.getItem('develop-v3-sonido'))
      ver(prendido === 'si' && m?.final?.activado === true, '1440 · tocar la frase prende el sonido (la preferencia) y la página entra con él', `preferencia ${String(prendido)}`)
      ver((await p.getAttribute('[data-pieza="control-del-sonido"]', 'aria-pressed')) === 'true', '1440 · el botón del sonido, donde apuntó la flecha, queda prendido')
    } finally {
      await ctx.close()
    }
  }

  console.log(`\n${fallas.length === 0 ? 'BIEN' : `FALLAS (${String(fallas.length)})`}${CONTROL === '' ? '' : ` · con el control ${CONTROL} (tiene que FALLAR)`}`)
  process.exit(fallas.length === 0 ? 0 : 1)
}

void main()
