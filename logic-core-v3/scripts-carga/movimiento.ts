/**
 * [C2-81] EL MOVIMIENTO DEL TELÉFONO, EN EL SITIO — el Chrome del sistema a la vista contra el dev (`BASE`), táctil abajo de 1024, `/api/`
 * bloqueado, sin el preloader (la siembra de los bancos). Las lecturas del sensor son eventos `deviceorientation` de mentira mandados a la
 * ventana (beta, gamma); la cámara se lee con `__camaraDelBanco` y el moiré con `__moireDelBanco` (el banco de la escena).
 *
 *   en cada ancho táctil (`ANCHOS`, por defecto 390x844 y 768x1024), en el home:
 *     · el botón arriba a la derecha, apagado por defecto («Activar movimiento»);
 *     · tocarlo (Android: sin permiso) lo prende («Desactivar movimiento»); inclinar el teléfono MUEVE LA CÁMARA (más que lo que se
 *       mueve sola en el mismo tiempo) y EL MOIRÉ (su entrada de afuera sigue a la inclinación; si la trama se dibuja, se corre);
 *     · apagarlo suelta los dos (el moiré vuelve al mouse);
 *     · dura la sesión: prendido y recargado, vuelve prendido;
 *   390, iOS con el permiso concedido (`requestPermission` de mentira): lo pide en el toque y mueve;
 *   390, iOS con el permiso NEGADO: el botón queda apagado y nada se mueve (ni la cámara ni el moiré);
 *   390, con movimiento reducido: arranca apagado; a mano se prende (el moiré lo sigue; la cámara, con la física de la escena apagada,
 *     no: como el mouse);
 *   1440 (escritorio, sin táctil): no hay botón.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/movimiento.ts
 *   CONTROL=sin-camara …           la cámara no sigue a la inclinación (TIENE que dar FALLA en la cámara)
 *   CONTROL=sin-moire …            el moiré no sigue a la inclinación (TIENE que dar FALLA en el moiré)
 *   CONTROL=sin-permiso …          escucha aunque nieguen el permiso (TIENE que dar FALLA en el permiso negado)
 *   CONTROL=prendido-por-defecto … arranca prendido (TIENE que dar FALLA en el apagado por defecto)
 *
 * Los defectos van en `window.__defectosDelMovimiento` (nunca la URL; `_lib/escena/giroscopio.ts`). Sin correr al escribirse: lo corre el
 * orquestador. Fotos en la salida del banco (`salidaDelBanco('movimiento')`).
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'

import { chromium, type BrowserContext, type CDPSession, type Page } from '@playwright/test'

import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'
import { tocar } from './tactil'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const CONTROL = process.env.CONTROL ?? ''
const ANCHOS = (process.env.ANCHOS ?? '390x844,768x1024').split(',').map((a) => a.split('x').map(Number) as [number, number])
const SALIDA = salidaDelBanco('movimiento')
const BOTON = '[data-pieza="control-del-movimiento"]'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const fallas: string[] = []
const ver = (bien: boolean, que: string, detalle = ''): void => {
  console.log(`${bien ? 'ok   ' : 'FALLA'} ${que}${detalle === '' ? '' : ` — ${detalle}`}`)
  if (!bien) fallas.push(que)
}

type Permiso = 'android' | 'concedido' | 'negado'

const inicio = (permiso: Permiso): string => `(() => {
  window.__name = window.__name || ((f) => f)
  window.__entornoDeLaEscena = 'producto'
  try { sessionStorage.setItem('home:intro', '1') } catch (e) {}
  ${CONTROL === '' ? '' : `window.__defectosDelMovimiento = ${JSON.stringify(CONTROL)}`}
  ${permiso === 'android' ? '' : `window.__permisosPedidos = 0; DeviceOrientationEvent.requestPermission = () => { window.__permisosPedidos += 1; return Promise.resolve(${JSON.stringify(permiso === 'concedido' ? 'granted' : 'denied')}) }`}
  // El sensor de mentira: una lectura cada 16 ms, siempre (como uno de verdad); \`inclinar\` mueve lo que lee.
  window.__lectura = { beta: 60, gamma: 0 }
  setInterval(() => {
    try { window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: window.__lectura.beta, gamma: window.__lectura.gamma })) } catch (e) {}
  }, 16)
})()`

interface Abierto {
  readonly ctx: BrowserContext
  readonly p: Page
  readonly cdp: CDPSession
  readonly errores: string[]
}

async function abrir(ancho: number, alto: number, permiso: Permiso, reducido = false): Promise<Abierto> {
  const tactil = ancho < 1024
  const ctx = await chromium.launchPersistentContext(perfilDelBanco('movimiento'), {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: tactil,
    hasTouch: tactil,
    reducedMotion: reducido ? 'reduce' : 'no-preference',
    args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  await ctx.addInitScript(inicio(permiso))
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const errores: string[] = []
  p.on('pageerror', (e) => errores.push(e.message.slice(0, 200)))
  await p.route('**/api/**', (r) => r.abort())
  return { ctx, p, cdp: await ctx.newCDPSession(p), errores }
}

/** El home con la escena andando (el banco de la cámara publicado) y un respiro para que se asiente. */
async function cargar(p: Page): Promise<void> {
  await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
  await p.waitForFunction(() => typeof (window as unknown as { __camaraDelBanco?: unknown }).__camaraDelBanco === 'function', undefined, { timeout: 60000 }).catch(() => undefined)
  await dormir(3000)
}

const estado = (p: Page): Promise<{ readonly estado: string | null; readonly etiqueta: string | null } | null> =>
  p.evaluate((sel) => {
    const b = document.querySelector(sel)
    return b === null ? null : { estado: b.getAttribute('data-estado'), etiqueta: b.getAttribute('aria-label') }
  }, BOTON)
const camara = (p: Page): Promise<readonly number[] | null> => p.evaluate(() => (window as unknown as { __camaraDelBanco?: () => { p: number[] } }).__camaraDelBanco?.().p ?? null)
interface Moire {
  readonly dibuja: boolean
  readonly gruesa: number[]
  readonly entrada: { readonly x: number; readonly y: number; readonly deAfuera: boolean }
}
const moire = (p: Page): Promise<Moire | null> => p.evaluate(() => (window as unknown as { __moireDelBanco?: { estado: () => Moire } }).__moireDelBanco?.estado() ?? null)
const distancia = (a: readonly number[] | null, b: readonly number[] | null): number => (a === null || b === null ? Number.NaN : Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]))

/** Lo que lee el sensor de mentira durante `ms`: de (beta, desde) a (beta, hasta), en línea recta. */
async function inclinar(p: Page, beta: number, desde: number, hasta: number, ms: number): Promise<void> {
  await p.evaluate(
    ([b, g0, g1, dura]) =>
      new Promise<void>((listo) => {
        const w = window as unknown as { __lectura: { beta: number; gamma: number } }
        const t0 = performance.now()
        const paso = (): void => {
          const k = Math.min(1, (performance.now() - t0) / dura)
          w.__lectura = { beta: b, gamma: g0 + (g1 - g0) * k }
          if (k < 1) setTimeout(paso, 16)
          else listo()
        }
        paso()
      }),
    [beta, desde, hasta, ms] as const,
  )
}

async function tocarElBoton(a: Abierto): Promise<void> {
  const caja = await a.p.evaluate((sel) => {
    const r = document.querySelector(sel)?.getBoundingClientRect()
    return r === undefined ? null : { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }, BOTON)
  if (caja !== null) await tocar(a.cdp, caja.x, caja.y)
  await dormir(150)
}

/** Prendido: inclinar mueve la cámara (más que su deriva quieta en el mismo tiempo) y el moiré. */
async function mueveLaCamaraYElMoire(a: Abierto, tag: string): Promise<void> {
  const { p } = a
  await inclinar(p, 60, 0, 0, 600)
  const quieta0 = await camara(p)
  const moire0 = await moire(p)
  await inclinar(p, 60, 0, 0, 1500)
  const quieta1 = await camara(p)
  await inclinar(p, 60, 0, 16, 1500)
  await inclinar(p, 60, 16, 16, 800)
  const movida = await camara(p)
  const moire1 = await moire(p)
  const deriva = distancia(quieta0, quieta1)
  const mueve = distancia(quieta1, movida)
  ver(Number.isFinite(mueve) && mueve > Math.max(0.02, 4 * deriva), `${tag} · inclinar el teléfono mueve la cámara (como el mouse; rojo: CONTROL=sin-camara)`, `${mueve.toFixed(3)} con la inclinación · ${deriva.toFixed(3)} quieta en el mismo tiempo`)
  const corre = moire0 !== null && moire1 !== null && (!moire1.dibuja || Math.abs(moire1.gruesa[0] - moire0.gruesa[0]) + Math.abs(moire1.gruesa[1] - moire0.gruesa[1]) > 1e-4)
  ver(moire1 !== null && moire1.entrada.deAfuera && moire1.entrada.x > 0.5 && corre, `${tag} · y maneja el moiré (su entrada sigue a la inclinación; rojo: CONTROL=sin-moire)`, moire1 === null ? 'sin el banco del moiré' : `entrada ${moire1.entrada.x.toFixed(2)}, ${moire1.entrada.y.toFixed(2)} (de afuera: ${String(moire1.entrada.deAfuera)}) · la trama ${moire1.dibuja ? 'se corrió' : 'no se dibuja en este ancho'}`)
  await p.screenshot({ path: path.join(SALIDA, `${tag.replace(/\W+/g, '-')}-inclinado.png`) })
}

async function android(ancho: number, alto: number): Promise<void> {
  const tag = String(ancho)
  const a = await abrir(ancho, alto, 'android')
  try {
    await cargar(a.p)
    const al = await estado(a.p)
    ver(al?.estado === 'apagado' && al.etiqueta === 'Activar movimiento', `${tag} · el botón del movimiento, arriba a la derecha, apagado por defecto («Activar movimiento»; rojo: CONTROL=prendido-por-defecto)`, JSON.stringify(al))
    const caja = await a.p.evaluate((sel) => {
      const r = document.querySelector(sel)?.getBoundingClientRect()
      return r === undefined ? undefined : { left: r.left, top: r.top, width: r.width }
    }, BOTON)
    ver(caja !== undefined && caja.left + caja.width > ancho - 40 && caja.top < 40, `${tag} · arriba a la derecha`, JSON.stringify(caja))
    await tocarElBoton(a)
    const prendido = await estado(a.p)
    ver(prendido?.estado === 'prendido' && prendido.etiqueta === 'Desactivar movimiento', `${tag} · tocarlo lo prende (en Android sin permiso): «Desactivar movimiento»`, JSON.stringify(prendido))
    await mueveLaCamaraYElMoire(a, tag)
    // Dura la sesión: recargado, vuelve prendido (en Android, sin otro toque).
    await a.p.reload({ waitUntil: 'load' })
    await dormir(3000)
    await inclinar(a.p, 60, 0, 0, 300)
    ver((await estado(a.p))?.estado === 'prendido', `${tag} · prendido y recargado, vuelve prendido (dura la sesión)`)
    // Apagarlo suelta los dos.
    await tocarElBoton(a)
    await inclinar(a.p, 60, 0, 12, 600)
    const m = await moire(a.p)
    ver((await estado(a.p))?.estado === 'apagado' && m !== null && !m.entrada.deAfuera, `${tag} · apagado, el moiré vuelve al mouse (sin entrada de afuera)`)
    ver(a.errores.length === 0, `${tag} · sin errores en la página`, a.errores.slice(0, 3).join(' | '))
  } finally {
    await a.ctx.close()
  }
}

async function ios(permiso: 'concedido' | 'negado'): Promise<void> {
  const tag = `390 iOS ${permiso}`
  const a = await abrir(390, 844, permiso)
  try {
    await cargar(a.p)
    await tocarElBoton(a)
    await dormir(200)
    const pedidos = await a.p.evaluate(() => (window as unknown as { __permisosPedidos?: number }).__permisosPedidos ?? 0)
    const e = await estado(a.p)
    if (permiso === 'concedido') {
      ver(pedidos === 1 && e?.estado === 'prendido', `${tag} · el permiso se pide en el toque y, concedido, lo prende`, `${String(pedidos)} pedidos · ${JSON.stringify(e)}`)
      await mueveLaCamaraYElMoire(a, tag)
    } else {
      await inclinar(a.p, 60, 0, 0, 600)
      const c0 = await camara(a.p)
      await inclinar(a.p, 60, 0, 16, 1500)
      await inclinar(a.p, 60, 16, 16, 800)
      const c1 = await camara(a.p)
      const m = await moire(a.p)
      ver(pedidos === 1 && e?.estado === 'negado' && e.etiqueta === 'Activar movimiento' && m !== null && !m.entrada.deAfuera && distancia(c0, c1) < 0.02, `${tag} · con el permiso negado no pasa nada: el botón queda apagado, ni la cámara ni el moiré se mueven (rojo: CONTROL=sin-permiso)`, `${JSON.stringify(e)} · la cámara ${distancia(c0, c1).toFixed(3)} · moiré de afuera ${String(m?.entrada.deAfuera)}`)
      await tocarElBoton(a)
      const otra = await a.p.evaluate(() => (window as unknown as { __permisosPedidos?: number }).__permisosPedidos ?? 0)
      ver(otra === 1, `${tag} · otro toque no lo vuelve a pedir`, `${String(otra)} pedidos`)
    }
  } finally {
    await a.ctx.close()
  }
}

async function reducido(): Promise<void> {
  const tag = '390 movimiento reducido'
  const a = await abrir(390, 844, 'android', true)
  try {
    await cargar(a.p)
    const al = await estado(a.p)
    ver(al?.estado === 'apagado', `${tag} · arranca apagado (rojo: CONTROL=prendido-por-defecto)`, JSON.stringify(al))
    await tocarElBoton(a)
    await inclinar(a.p, 60, 0, 0, 300)
    await inclinar(a.p, 60, 0, 16, 1200)
    const m = await moire(a.p)
    ver((await estado(a.p))?.estado === 'prendido' && m !== null && m.entrada.deAfuera, `${tag} · a mano se prende y el moiré lo sigue (la cámara, sin física con movimiento reducido, se queda: como con el mouse)`)
  } finally {
    await a.ctx.close()
  }
}

async function escritorio(): Promise<void> {
  const a = await abrir(1440, 900, 'android')
  try {
    await cargar(a.p)
    ver((await estado(a.p)) === null, '1440 · en escritorio no hay botón de movimiento')
  } finally {
    await a.ctx.close()
  }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  for (const [ancho, alto] of ANCHOS) await android(ancho, alto)
  await ios('concedido')
  await ios('negado')
  await reducido()
  await escritorio()
  console.log(`\n${fallas.length === 0 ? 'BIEN' : `FALLAS (${String(fallas.length)})`}${CONTROL === '' ? '' : ` · con el control ${CONTROL} (tiene que FALLAR)`}`)
  process.exit(fallas.length === 0 ? 0 : 1)
}

void main()
