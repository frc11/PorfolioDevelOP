/**
 * [B12a.7] LA VUELTA AL HOME, EN EL SITIO — el Chrome del sistema a la vista contra el dev (o el build de D7), `/api/` bloqueado.
 * El criterio del plan (§10): la flecha devuelve el scroll con |Δy| ≤ 1 px, el mismo paso del Portfolio y la misma noche; «Home» va a 0
 * y amanece; el sonido respeta el mute. El recorrido (una sola carga de documento):
 *
 *   entra a `/v3/prueba-de-pagina` → «Volver al home» (al principio, amanece) → el ancla de un paso a mitad del Portfolio
 *   → A · se va a la página (en esta rama el home no tiene un enlace a una página: las de servicio llegan con el merge; se navega con
 *     el router de next, que es lo mismo que hace el `<Link>` de `EnlaceDeRuta`) → atrás (la flecha)
 *   → B · se va con la flecha (adelante) → atrás otra vez
 *
 * y mide cuadro a cuadro con un rAF en la página: la cobertura en el cuadro del cambio, el scroll, la noche (`__vueltaDelBanco`) y la
 * banda de la gota mientras destapa (con la noche devuelta, sin barrido: la banda escondida). A 1440, el sonido: con el sonido apagado
 * (el producto) ninguna fuente de audio arranca en una navegación; prendido, sí (el control del contador).
 *
 *   BASE=http://localhost:3002 ANCHO=1440|390 npx tsx scripts-carga/vuelta.ts
 *   CONTROL=sin-vuelta …   el control positivo (`window.__defectosDelVelo = 'sin-vuelta'`: la flecha lleva arriba): tiene que fallar
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHO = Number(process.env.ANCHO ?? '1440')
const MOVIL = ANCHO < 1024
const CONTROL = process.env.CONTROL ?? null
const ANCLA = '#trabajos'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Cuadro {
  readonly t: number
  readonly ruta: string
  readonly fase: string
  readonly cobertura: number
  readonly y: number
  readonly noche: number | null
  readonly gota: boolean
}

interface Estado {
  readonly y: number
  readonly paso: string
  readonly historia: string
  readonly noche: number
  readonly dia: boolean
}

const GRABAR = `(() => {
  const t0 = performance.now()
  const log = (window.__cuadrosDeLaVuelta = [])
  const cuadro = () => {
    const v = document.querySelector('[data-pieza="velo-de-navegacion"]')
    const g = document.querySelector('[data-pieza="gota"]')
    const b = window.__vueltaDelBanco ? window.__vueltaDelBanco() : null
    log.push({ t: Math.round((performance.now() - t0) * 10) / 10, ruta: location.pathname + location.hash, fase: v ? v.getAttribute('data-fase') : 'sin velo', cobertura: v ? Number(v.getAttribute('data-cobertura')) : 0, y: Math.round(scrollY), noche: b ? b.noche : null, gota: g ? getComputedStyle(g).visibility === 'visible' : false })
    if (!window.__pararLaVuelta) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

/** Cuenta las fuentes de audio que arrancan (WebAudio y los elementos de medios), desde antes de que cargue la página. */
const CONTAR_SONIDOS = `(() => {
  window.__sonidos = 0
  const s = AudioScheduledSourceNode.prototype.start
  AudioScheduledSourceNode.prototype.start = function (...a) { window.__sonidos += 1; return s.apply(this, a) }
  const sb = AudioBufferSourceNode.prototype.start
  AudioBufferSourceNode.prototype.start = function (...a) { window.__sonidos += 1; return sb.apply(this, a) }
  const p = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function (...a) { if (!(this instanceof HTMLVideoElement)) window.__sonidos += 1; return p.apply(this, a) }
})()`

async function estado(p: Page): Promise<Estado> {
  return p.evaluate(() => {
    const b = (window as unknown as { __vueltaDelBanco?: () => { noche: number; dia: boolean } }).__vueltaDelBanco?.() ?? { noche: NaN, dia: false }
    const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
    // Las historias del teléfono (el paso que se ve), si están a la vista.
    const h = document.querySelector('[data-pieza="historias"]')
    const hv = h !== null && getComputedStyle(h).visibility !== 'hidden' && Number(getComputedStyle(h).opacity) > 0.5
    return { y: Math.round(scrollY), paso: e?.getAttribute('data-paso') ?? '-', historia: hv ? (h.getAttribute('data-indice') ?? '?') : '-', noche: b.noche, dia: b.dia }
  })
}

const texto = (e: Estado): string => `y ${String(e.y)} · paso ${e.paso} · historia ${e.historia} · noche ${e.noche.toFixed(3)} · día del final ${e.dia ? 'sí' : 'no'}`

/** Espera la ruta y el velo quieto (destapado), y un rato para que la página se asiente. */
async function esperarLlegada(p: Page, ruta: (r: string) => boolean, asentarMs = 2000): Promise<void> {
  const t0 = Date.now()
  while (Date.now() - t0 < 20000) {
    const r = await p.evaluate(() => ({ ruta: location.pathname + location.hash, fase: document.querySelector('[data-pieza="velo-de-navegacion"]')?.getAttribute('data-fase') ?? 'quieto' }))
    if (ruta(r.ruta) && r.fase === 'quieto') break
    await dormir(100)
  }
  await dormir(asentarMs)
}

async function grabar(p: Page, hacer: () => Promise<void>, ruta: (r: string) => boolean): Promise<Cuadro[]> {
  await p.evaluate(GRABAR)
  // Que la grabación ya tenga cuadros de la ruta de partida: si no, el cuadro del cambio no se ve.
  await p.waitForFunction(() => ((window as unknown as { __cuadrosDeLaVuelta?: unknown[] }).__cuadrosDeLaVuelta?.length ?? 0) >= 3)
  await hacer()
  await esperarLlegada(p, ruta, 1500)
  const cuadros = await p.evaluate(() => {
    ;(window as unknown as { __pararLaVuelta: boolean }).__pararLaVuelta = true
    return (window as unknown as { __cuadrosDeLaVuelta: Cuadro[] }).__cuadrosDeLaVuelta
  })
  await p.evaluate(() => {
    ;(window as unknown as { __pararLaVuelta: boolean }).__pararLaVuelta = false
  })
  return cuadros
}

/** La vuelta: el cuadro del cambio cubierto; desde que destapa, el scroll y la noche ya devueltos y la gota sin barrido; al final, lo mismo que antes. */
function juzgarLaVuelta(nombre: string, cuadros: readonly Cuadro[], antes: Estado, despues: Estado): string[] {
  const desde = cuadros[0]?.ruta ?? ''
  const i = cuadros.findIndex((c) => c.ruta !== desde)
  const cambio = i < 0 ? null : (cuadros[i] ?? null)
  const destape = cuadros.filter((c) => c.fase === 'destapando')
  const fallas: string[] = []
  if (cambio === null) fallas.push('no-cambio-la-ruta')
  else if (cambio.cobertura < 1) fallas.push(`cambio-sin-cubrir (${cambio.cobertura.toFixed(3)})`)
  if (destape.length === 0) fallas.push('no-destapo')
  const corrido = destape.find((c) => Math.abs(c.y - antes.y) > 1)
  if (corrido !== undefined) fallas.push(`destapa-corrido (y ${String(corrido.y)})`)
  const otraNoche = destape.find((c) => c.noche !== null && Math.abs(c.noche - antes.noche) > 0.01)
  if (otraNoche !== undefined) fallas.push(`destapa-con-otra-noche (${String(otraNoche.noche)})`)
  if (destape.some((c) => c.gota)) fallas.push('la-gota-barre-al-destapar')
  if (Math.abs(despues.y - antes.y) > 1) fallas.push(`|Δy| ${String(Math.abs(despues.y - antes.y))} px`)
  if (despues.paso !== antes.paso || despues.historia !== antes.historia) fallas.push('otro-paso')
  if (Math.abs(despues.noche - antes.noche) > 0.01 || despues.dia !== antes.dia) fallas.push('otra-noche')
  let hueco = 0
  for (let k = 1; k < cuadros.length; k++) {
    const a = cuadros[k - 1]
    const b = cuadros[k]
    if (a !== undefined && b !== undefined && (b.fase === 'destapando' || a.fase === 'destapando')) hueco = Math.max(hueco, b.t - a.t)
  }
  if (fallas.length > 0) console.log(`      las transiciones: ${cuadros.filter((c, k) => k === 0 || c.ruta !== cuadros[k - 1]?.ruta || c.fase !== cuadros[k - 1]?.fase).map((c) => `${String(c.t)} ${c.ruta} ${c.fase} ${c.cobertura.toFixed(2)} y${String(c.y)} n${String(c.noche)}`).join(' → ')}`)
  console.log(`${fallas.length === 0 ? 'ok   ' : 'FALLA'} ${String(ANCHO)} · ${nombre}: antes ${texto(antes)} → después ${texto(despues)} · cobertura en el cambio ${cambio?.cobertura.toFixed(3) ?? '?'} · ${String(destape.length)} cuadros destapando (hueco máximo ${hueco.toFixed(0)} ms)${fallas.length === 0 ? '' : ` · ${fallas.join(', ')}`}`)
  return fallas
}

async function main(): Promise<void> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/vuelta-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: ANCHO, height: MOVIL ? 844 : 900 },
    deviceScaleFactor: 1,
    isMobile: MOVIL,
    hasTouch: MOVIL,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ${CONTROL === null ? '' : `window.__defectosDelVelo = ${JSON.stringify(CONTROL)};`} })()`)
  await ctx.addInitScript(CONTAR_SONIDOS)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  await p.goto(`${BASE}/v3/prueba-de-pagina`, { waitUntil: 'load', timeout: 300000 })
  await dormir(7000)
  await p.evaluate(() => {
    ;(window as unknown as { __marcaDelDocumento: string }).__marcaDelDocumento = 'entrada'
  })
  const fallas: string[] = []
  const sonidos = (): Promise<number> => p.evaluate(() => (window as unknown as { __sonidos: number }).__sonidos)

  // 1 · «Home» (el enlace de la página al home, sin ancla): al principio, y amanece. Con el sonido apagado, ninguna fuente arranca.
  await p.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.75, behavior: 'instant' }))
  await dormir(1500)
  const sonidosAntes = await sonidos()
  await p.getByText('Volver al home').first().click()
  await esperarLlegada(p, (r) => r === '/v3')
  console.log(`·     ${String(ANCHO)} · «Home»: llegó (${await p.evaluate(() => location.pathname + location.hash)}, y ${String(await p.evaluate(() => Math.round(scrollY)))})`)
  const alHome = await estado(p)
  const color = await p.evaluate(() => {
    const v = document.querySelector('[data-pieza="velo-de-navegacion"]')
    const prueba = document.createElement('div')
    prueba.style.backgroundColor = 'var(--color-fondo)'
    document.body.appendChild(prueba)
    const papel = getComputedStyle(prueba).backgroundColor
    prueba.remove()
    return { velo: v === null ? '' : getComputedStyle(v).backgroundColor, papel }
  })
  const callados = (await sonidos()) - sonidosAntes
  const homeBien = alHome.y === 0 && alHome.noche === 0 && !alHome.dia && color.velo === color.papel
  console.log(`${homeBien ? 'ok   ' : 'FALLA'} ${String(ANCHO)} · «Home» (la página al home): ${texto(alHome)} · el velo ${color.velo} (el papel ${color.papel})`)
  if (!homeBien) fallas.push('home-no-va-a-0-o-no-amanece')
  console.log(`${callados === 0 ? 'ok   ' : 'FALLA'} ${String(ANCHO)} · con el sonido apagado, fuentes de audio que arrancaron en la navegación: ${String(callados)}`)
  if (callados !== 0) fallas.push('suena-con-el-mute')

  // 2 · A mitad del Portfolio: «Portfolio» de la barra deja `#trabajos` en la URL (el viaje la empuja con `pushState`, que next completa
  // con su estado; un `location.hash` a mano deja una entrada sin él, que next no restaura con la flecha) y el ancla de la carga lleva a
  // El Garage; de ahí, un paso y 120 px más (lejos del ancla: sin la vuelta, la flecha caería en El Garage).
  await p.evaluate((a) => {
    window.history.pushState(null, '', a)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }, ANCLA)
  await dormir(3000)
  await p.evaluate(() => window.scrollTo({ top: Math.round(window.scrollY + window.innerHeight * 1.5 + 120), behavior: 'instant' }))
  await dormir(4000)
  const enElPortfolio = await estado(p)
  console.log(`·     ${String(ANCHO)} · a mitad del Portfolio: ${texto(enElPortfolio)}`)

  // A · Se va a la página (el router de next, como el <Link>) y vuelve con la flecha.
  await p.evaluate(() => (window as unknown as { next: { router: { push: (h: string) => void } } }).next.router.push('/v3/prueba-de-pagina'))
  await esperarLlegada(p, (r) => r.startsWith('/v3/prueba-de-pagina'))
  const guardada = await p.evaluate(() => (window as unknown as { __vueltaDelBanco?: () => { guardada: unknown } }).__vueltaDelBanco?.().guardada ?? null)
  console.log(`·     ${String(ANCHO)} · en la página, la posición guardada: ${JSON.stringify(guardada)}`)
  const cuadrosA = await grabar(p, () => p.goBack().then(() => undefined), (r) => r.startsWith('/v3#'))
  const vueltaA = await estado(p)
  fallas.push(...juzgarLaVuelta('A · se fue con un enlace y vuelve con la flecha', cuadrosA, enElPortfolio, vueltaA))

  // B · Se va con la flecha (adelante) y vuelve con la flecha.
  await p.goForward()
  await esperarLlegada(p, (r) => r.startsWith('/v3/prueba-de-pagina'))
  const cuadrosB = await grabar(p, () => p.goBack().then(() => undefined), (r) => r.startsWith('/v3#'))
  const vueltaB = await estado(p)
  fallas.push(...juzgarLaVuelta('B · se fue con la flecha y vuelve con la flecha', cuadrosB, enElPortfolio, vueltaB))

  // El contador de sonidos distingue: con el sonido prendido, la misma vuelta suena (el pestillo del velo al destapar).
  if (!MOVIL) {
    await p.locator('[data-pieza="control-del-sonido"]').first().click()
    await dormir(4000)
    console.log(`·     ${String(ANCHO)} · el sonido: aria-pressed ${String(await p.locator('[data-pieza="control-del-sonido"]').first().getAttribute('aria-pressed'))}`)
    await p.goForward()
    await esperarLlegada(p, (r) => r.startsWith('/v3/prueba-de-pagina'))
    const prendidoAntes = await sonidos()
    await p.goBack()
    await esperarLlegada(p, (r) => r.startsWith('/v3#'))
    const prendidos = (await sonidos()) - prendidoAntes
    console.log(`${prendidos > 0 ? 'ok   ' : 'FALLA'} ${String(ANCHO)} · [control] con el sonido prendido, la vuelta arranca ${String(prendidos)} fuentes de audio`)
    if (prendidos === 0) fallas.push('el-contador-no-cuenta')
  }

  const mismo = await p.evaluate(() => (window as unknown as { __marcaDelDocumento?: string }).__marcaDelDocumento === 'entrada')
  console.log(`${mismo ? 'ok   ' : 'FALLA'} ${String(ANCHO)} · cargas de documento después de la entrada: ${mismo ? '0' : 'al menos 1'}`)
  if (!mismo) fallas.push('recargo')
  await ctx.close()
  console.log(fallas.length === 0 ? 'vuelta: todo en verde' : `vuelta: ${String(fallas.length)} fallas`)
  if (fallas.length > 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
