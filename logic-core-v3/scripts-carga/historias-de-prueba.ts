/**
 * [P-H31] LAS HISTORIAS FUERA DEL PORTFOLIO, EN EL SITIO — el bloque de la galería (`/v3/componentes`, `GaleriaHistorias.tsx`): tres pasos
 * sobre el acento de web, con una transición propia (un corte diagonal de prueba), las barras sobre el acento y el freno del arrastre que
 * ahora trae el componente común. El Chrome del sistema a 390, táctil, `/api/` bloqueado. Mide:
 *   a · la transición: un toque a la derecha pasa al paso siguiente con el saliente debajo y el que entra recortado desde abajo a la
 *       derecha; otro, al tercero; uno a la izquierda vuelve, recortado desde arriba a la izquierda; al terminar, sin recorte ni saliente;
 *   b · el freno: con las historias abiertas, un arrastre del dedo que empieza AFUERA de la caja no mueve la página; cerradas, sí;
 *   c · el contraste de las barras (los colores calculados por el navegador): el relleno contra el acento y contra la pista, ≥ 3:1.
 *
 *   BASE=http://localhost:3002 npx tsx scripts-carga/historias-de-prueba.ts
 *   CONTROL=sin-freno …   el control positivo (`window.__defectosDeLasHistorias = 'sin-freno'`): el arrastre de afuera mueve la página
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'

import { desplazarConElDedo } from './tactil'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const CONTROL = process.env.CONTROL ?? null
const ANCHO = 390
const ALTO = 844
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Cuadro {
  readonly t: number
  readonly indice: number
  readonly saliente: boolean
  readonly recorte: string
}

async function tocar(cdp: CDPSession, x: number, y: number): Promise<void> {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
  await dormir(60)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

async function caja(p: Page): Promise<{ readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number } | null> {
  return p.evaluate(() => {
    const r = document.querySelector('[data-pieza="historias-de-prueba"]')?.getBoundingClientRect()
    return r === undefined ? null : { x: r.left, y: r.top, ancho: r.width, alto: r.height }
  })
}

const GRABAR = `(() => {
  const t0 = performance.now()
  const log = (window.__cuadrosDePrueba = [])
  const c = () => {
    const h = document.querySelector('[data-pieza="historias-de-prueba"] [data-pieza="historias"]')
    const corte = h ? h.querySelector(':scope > div:not([data-parte="saliente"]) [data-parte="corte-diagonal"]') : null
    log.push({ t: Math.round(performance.now() - t0), indice: h ? Number(h.getAttribute('data-indice')) : -1, saliente: h ? h.querySelector('[data-parte="saliente"]') !== null : false, recorte: corte ? getComputedStyle(corte).clipPath : '?' })
    if (!window.__pararLaPrueba) requestAnimationFrame(c)
  }
  requestAnimationFrame(c)
})()`

/** Un color calculado (`rgb(…)`, `rgba(…)` o `color(srgb …)`) en 0–255 con su alfa. */
function color(css: string): { readonly c: readonly [number, number, number]; readonly a: number } {
  const srgb = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(css)
  if (srgb !== null) return { c: [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255], a: srgb[4] === undefined ? 1 : Number(srgb[4]) }
  const m = /rgba?\(([\d.]+),? ([\d.]+),? ([\d.]+)(?:,? \/? ?([\d.]+))?\)/.exec(css)
  if (m === null) throw new Error(`color sin leer: ${css}`)
  return { c: [Number(m[1]), Number(m[2]), Number(m[3])], a: m[4] === undefined ? 1 : Number(m[4]) }
}
const lineal = (v: number): number => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)
const luz = (c: readonly [number, number, number]): number => 0.2126 * lineal(c[0]) + 0.7152 * lineal(c[1]) + 0.0722 * lineal(c[2])
const razon = (a: readonly [number, number, number], b: readonly [number, number, number]): number => (Math.max(luz(a), luz(b)) + 0.05) / (Math.min(luz(a), luz(b)) + 0.05)
const sobre = (x: { readonly c: readonly [number, number, number]; readonly a: number }, fondo: readonly [number, number, number]): [number, number, number] => [0, 1, 2].map((i) => (x.c[i] ?? 0) * x.a + (fondo[i] ?? 0) * (1 - x.a)) as [number, number, number]

async function main(): Promise<void> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/historias-prueba-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'no-preference',
    args: ['--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  if (CONTROL !== null) await ctx.addInitScript(`window.__defectosDeLasHistorias = ${JSON.stringify(CONTROL)}`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  const cdp = await ctx.newCDPSession(p)
  await p.goto(`${BASE}/v3/componentes`, { waitUntil: 'load', timeout: 300000 })
  await dormir(5000)
  const fallas: string[] = []
  const boton = p.locator('[data-pieza="abrir-historias-de-prueba"]')
  const tocarElBoton = async (): Promise<void> => {
    await boton.evaluate((b) => b.scrollIntoView({ block: 'start', behavior: 'instant' }))
    await dormir(600)
    const r = await boton.boundingBox()
    if (r !== null) await tocar(cdp, r.x + r.width / 2, r.y + r.height / 2)
    await dormir(1200)
  }
  await tocarElBoton()
  // La caja entera en el cuadro (más alta que lo que queda debajo del botón).
  await p.locator('[data-pieza="historias-de-prueba"]').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await dormir(600)
  const k = await caja(p)
  if (k === null) throw new Error('las historias de prueba no se abrieron')

  // c · El contraste, con los colores que calcula el navegador.
  const colores = await p.evaluate(() => {
    const raiz = document.querySelector('[data-pieza="historias-de-prueba"]')
    const pista = raiz?.querySelector('[data-barra="activa"]')
    const relleno = pista?.firstElementChild
    return { fondo: raiz ? getComputedStyle(raiz).backgroundColor : '', pista: pista ? getComputedStyle(pista).backgroundColor : '', relleno: relleno ? getComputedStyle(relleno).backgroundColor : '' }
  })
  const fondo = color(colores.fondo).c
  const relleno = sobre(color(colores.relleno), fondo)
  const contraElAcento = razon(relleno, fondo)
  const contraLaPista = razon(relleno, sobre(color(colores.pista), fondo))
  const contrasteBien = contraElAcento >= 3 && contraLaPista >= 3
  console.log(`${contrasteBien ? 'ok   ' : 'FALLA'} c · las barras sobre el acento (${colores.fondo}): el relleno ${contraElAcento.toFixed(2)}:1 contra el acento y ${contraLaPista.toFixed(2)}:1 contra la pista (${colores.relleno} sobre ${colores.pista})`)
  if (!contrasteBien) fallas.push('contraste')

  // a · La transición: derecha, derecha (los tres pasos), izquierda.
  await p.evaluate(GRABAR)
  const pasos: { readonly hacia: 'derecha' | 'izquierda'; readonly espera: number; readonly punta: string }[] = [
    { hacia: 'derecha', espera: 1, punta: '100% 100%' },
    { hacia: 'derecha', espera: 2, punta: '100% 100%' },
    { hacia: 'izquierda', espera: 1, punta: '0% 0%' },
  ]
  for (const paso of pasos) {
    const desde = await p.evaluate(() => (window as unknown as { __cuadrosDePrueba: unknown[] }).__cuadrosDePrueba.length)
    await tocar(cdp, k.x + k.ancho * (paso.hacia === 'derecha' ? 0.85 : 0.15), k.y + k.alto * 0.5)
    await dormir(1300)
    const cuadros = (await p.evaluate(() => (window as unknown as { __cuadrosDePrueba: Cuadro[] }).__cuadrosDePrueba)).slice(desde)
    const conSaliente = cuadros.filter((c) => c.saliente)
    const primero = cuadros.find((c) => c.recorte.startsWith('polygon'))
    const ultimo = cuadros[cuadros.length - 1]
    const bien = ultimo !== undefined && ultimo.indice === paso.espera && conSaliente.length > 0 && primero !== undefined && primero.recorte.includes(paso.punta) && ultimo.recorte === 'none' && !ultimo.saliente
    console.log(`${bien ? 'ok   ' : 'FALLA'} a · un toque a la ${paso.hacia}: paso ${String(ultimo?.indice ?? '?')} (se esperaba ${String(paso.espera)}) · ${String(conSaliente.length)} cuadros con el saliente debajo (${String(conSaliente.length > 0 ? (conSaliente[conSaliente.length - 1]?.t ?? 0) - (conSaliente[0]?.t ?? 0) : 0)} ms) · el primer recorte ${primero?.recorte ?? 'ninguno'} · al final ${ultimo?.recorte ?? '?'}${ultimo?.saliente === true ? ' con saliente' : ''}`)
    if (!bien) fallas.push(`transicion-${paso.hacia}-${String(paso.espera)}`)
  }
  await p.evaluate(() => {
    ;(window as unknown as { __pararLaPrueba: boolean }).__pararLaPrueba = true
  })

  // b · El freno: un arrastre que empieza afuera de la caja (el margen de la izquierda), abiertas y cerradas; hacia arriba (la galería
  // termina cerca: hacia abajo no habría lugar).
  const arrastrar = async (): Promise<number> => {
    const antes = await p.evaluate(() => window.scrollY)
    await desplazarConElDedo(cdp, 6, ALTO * 0.5, -260)
    await dormir(700)
    return (await p.evaluate(() => window.scrollY)) - antes
  }
  const abiertas = await arrastrar()
  const sigueAbierta = (await caja(p)) !== null
  await tocarElBoton()
  const cerradas = (await caja(p)) === null ? await arrastrar() : NaN
  const frenoBien = sigueAbierta && Math.abs(abiertas) < 2 && Math.abs(cerradas) > 100
  console.log(`${frenoBien ? 'ok   ' : 'FALLA'} b · el freno: el dedo afuera de la caja movió la página ${abiertas.toFixed(0)} px con las historias abiertas${sigueAbierta ? '' : ' (se cerraron)'} y ${Number.isNaN(cerradas) ? '?' : cerradas.toFixed(0)} px cerradas`)
  if (!frenoBien) fallas.push('freno')

  await ctx.close()
  console.log(fallas.length === 0 ? 'historias-de-prueba: todo en verde' : `historias-de-prueba: ${String(fallas.length)} fallas (${fallas.join(', ')})`)
  if (fallas.length > 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
