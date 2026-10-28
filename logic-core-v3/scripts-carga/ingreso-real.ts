/**
 * [L6 · 80] EL LOGIN DE VERDAD, EN EL SITIO — la ÚNICA excepción a «los bancos no tocan la autenticación»: con la cuenta de prueba de
 * `.env.local` (`E2E_LOGIN_EMAIL` y `E2E_LOGIN_PASSWORD`; este archivo los lee y NUNCA los imprime, los guarda ni los fotografía: los
 * campos no se capturan llenos). Chrome del sistema a la vista contra el dev (`BASE`, por defecto http://localhost:3003).
 *
 *   1. LA ENTRADA SIEMPRE ANIMA (ítem 1): la hoja pasa por `abriendo` (el avance de 1 a 0, con varios valores intermedios: la animación
 *      pasó de verdad) y termina en `abierta`, en cada manera de abrirla: la entrada directa (`?ingresar`), «Login» de la barra (1440),
 *      cerrar y volver a abrir, y después de un intento fallido (al cerrar y reabrir);
 *   2. EL INTENTO FALLIDO se queda en el login nuevo (ítem 2): la contraseña equivocada muestra el error del formulario, la ruta sigue
 *      siendo la de /v3 (nunca `/login`);
 *   3. «¿OLVIDASTE TU CONTRASEÑA?» (ítem 2): no sale a `/forgot-password`; es otra vista de la hoja (con `?envio=lento`, para no mandar un
 *      mail de verdad: el envío está simulado y el aviso es el de siempre);
 *   4. EL INGRESO con la cuenta: la ruta sale de /v3 hacia el panel (`/admin`, `/dashboard`, `/setter` o `/bienvenida`), con sesión.
 *
 *   BASE=http://localhost:3003 npx tsx scripts-carga/ingreso-real.ts
 *   CONTROL=sin-reintento-de-la-entrada …  (reservado) el defecto que hace que la hoja no anime la segunda vez
 *
 * Sin correr al escribirse: lo corre el orquestador. Fotos en la salida del banco (`salidaDelBanco('ingreso-real')`).
 */
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3003'
const SALIDA = salidaDelBanco('ingreso-real')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const fallas: string[] = []
const ver = (bien: boolean, que: string, detalle = ''): void => {
  console.log(`${bien ? 'ok   ' : 'FALLA'} ${que}${detalle === '' ? '' : ` — ${detalle}`}`)
  if (!bien) fallas.push(que)
}

/** La cuenta de prueba, de `.env.local` (sin imprimirla). */
function cuenta(): { readonly email: string; readonly clave: string } {
  const texto = readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
  const de = (nombre: string): string => {
    const m = new RegExp(`^${nombre}=(.*)$`, 'm').exec(texto)
    return (m?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '')
  }
  const email = de('E2E_LOGIN_EMAIL')
  const clave = de('E2E_LOGIN_PASSWORD')
  if (email === '' || clave === '') throw new Error('faltan E2E_LOGIN_EMAIL o E2E_LOGIN_PASSWORD en .env.local')
  return { email, clave }
}

/** La fase y el avance de la hoja por cuadro (lo que publica en `data-fase` y `data-avance`), desde el principio de cada documento. */
const INICIO = `(() => {
  window.__name = window.__name || ((f) => f)
  window.__entornoDeLaEscena = 'producto'
  try { sessionStorage.setItem('home:intro', '1') } catch (e) {}
  window.__hoja = []
  const cuadro = () => {
    const raiz = document.querySelector('[data-pieza="ingreso"]')
    if (raiz) {
      const fondo = raiz.querySelector('[data-parte="fondo"]')
      window.__hoja.push({ t: performance.now(), fase: raiz.getAttribute('data-fase'), avance: fondo ? Number(fondo.getAttribute('data-avance')) : NaN })
      if (window.__hoja.length > 6000) window.__hoja.splice(0, 3000)
    }
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

interface CuadroDeLaHoja {
  readonly t: number
  readonly fase: string | null
  readonly avance: number
}
const hoja = (p: Page): Promise<CuadroDeLaHoja[]> => p.evaluate(() => [...((window as unknown as { __hoja?: CuadroDeLaHoja[] }).__hoja ?? [])])
const vaciar = (p: Page): Promise<void> => p.evaluate(() => void ((window as unknown as { __hoja?: CuadroDeLaHoja[] }).__hoja = []))

/** ¿La apertura animó? Pasó por `abriendo` con varios avances intermedios, distintos y que bajan, y terminó en `abierta`. */
function animoLaApertura(c: readonly CuadroDeLaHoja[]): { readonly bien: boolean; readonly detalle: string } {
  const abriendo = c.filter((x) => x.fase === 'abriendo')
  const medios = new Set(abriendo.map((x) => x.avance.toFixed(2)).filter((v) => v !== '1.00' && v !== '0.00' && v !== 'NaN'))
  const termina = c.some((x) => x.fase === 'abierta')
  const dura = abriendo.length === 0 ? 0 : abriendo[abriendo.length - 1].t - abriendo[0].t
  return { bien: abriendo.length > 3 && medios.size >= 4 && termina && dura >= 120, detalle: `${String(abriendo.length)} cuadros en «abriendo» (${dura.toFixed(0)} ms), ${String(medios.size)} avances intermedios, abierta ${String(termina)}` }
}

async function esperarAbierta(p: Page): Promise<void> {
  await p.waitForSelector('[data-pieza="ingreso"][data-fase="abierta"]', { timeout: 20000 })
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const { email, clave } = cuenta()
  const ctx = await chromium.launchPersistentContext(perfilDelBanco('ingreso-real'), {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ['--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  })
  await ctx.addInitScript(INICIO)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const errores: string[] = []
  p.on('pageerror', (e) => errores.push(e.message.slice(0, 200)))
  try {
    // 1 · la entrada directa.
    await p.goto(`${BASE}/v3?ingresar`, { waitUntil: 'load', timeout: 300000 })
    await esperarAbierta(p)
    const directa = animoLaApertura(await hoja(p))
    ver(directa.bien, '1440 · la entrada directa (?ingresar) anima la apertura', directa.detalle)

    // Cerrar con «Volver al home» y abrir desde la barra.
    await p.click('[data-parte="volver"]')
    await p.waitForSelector('[data-pieza="ingreso"]', { state: 'detached', timeout: 20000 })
    await vaciar(p)
    await p.click('[data-abre-ingreso]')
    await esperarAbierta(p)
    const delBoton = animoLaApertura(await hoja(p))
    ver(delBoton.bien, '1440 · «Login» de la barra, después de cerrar, anima la apertura', delBoton.detalle)

    // 2 · el intento fallido: se queda en el login nuevo, con el error del formulario.
    await p.fill('input[name="email"]', email)
    await p.fill('input[name="password"]', `${clave}-incorrecta`)
    await p.click('[data-pieza="ingreso-con-clave"] button[type="submit"]')
    await p.waitForSelector('[data-parte="error-del-ingreso"] [id]:not(:empty), [data-parte="error-del-ingreso"]:not(.sr-only)', { timeout: 20000 }).catch(() => undefined)
    await dormir(1500)
    const ruta = new URL(p.url())
    const textoDelError = ((await p.textContent('[data-parte="error-del-ingreso"]')) ?? '').trim()
    ver(ruta.pathname.startsWith('/v3') && ruta.pathname !== '/login' && textoDelError !== '', '1440 · el intento fallido se queda en el login nuevo, con el error del formulario', `ruta ${ruta.pathname}${ruta.search === '' ? '' : '?…'} · error «${textoDelError}»`)
    await p.screenshot({ path: path.join(SALIDA, 'intento-fallido.png') })

    // Reabrir después del intento fallido: anima igual.
    if (ruta.pathname.startsWith('/v3')) {
      await p.click('[data-parte="volver"]')
      await p.waitForSelector('[data-pieza="ingreso"]', { state: 'detached', timeout: 20000 })
      await vaciar(p)
      await p.click('[data-abre-ingreso]')
      await esperarAbierta(p)
      const luego = animoLaApertura(await hoja(p))
      ver(luego.bien, '1440 · después de un intento fallido, abrir de nuevo anima la apertura', luego.detalle)

      // 3 · «¿Olvidaste tu contraseña?»: otra vista de la hoja, sin salir de /v3 (con el envío simulado: no se manda ningún mail).
      await p.click('[data-parte="volver"]')
      await p.waitForSelector('[data-pieza="ingreso"]', { state: 'detached', timeout: 20000 })
      await p.goto(`${BASE}/v3?ingresar&envio=lento`, { waitUntil: 'load', timeout: 300000 })
      await esperarAbierta(p)
      await p.click('[data-parte="olvido"]')
      await p.waitForSelector('[data-pieza="ingreso-olvido"]', { timeout: 10000 })
      ver(new URL(p.url()).pathname.startsWith('/v3'), '1440 · «¿Olvidaste tu contraseña?» no sale del login nuevo (otra vista de la hoja)', new URL(p.url()).pathname)
      await p.click('[data-pieza="ingreso-olvido"] button[type="submit"]')
      const sinEmail = ((await p.textContent('[data-pieza="ingreso-olvido"]')) ?? '').includes('El email es requerido.')
      ver(sinEmail, '  y valida el email vacío con el error del campo (sin enviar)')
      await p.fill('[data-pieza="ingreso-olvido"] input[name="email"]', 'alguien@ejemplo.com')
      await p.click('[data-pieza="ingreso-olvido"] button[type="submit"]')
      await p.waitForSelector('[data-parte="olvido-enviado"]', { timeout: 20000 })
      ver(((await p.textContent('[data-parte="olvido-enviado"]')) ?? '').includes('Si la cuenta existe'), '  y el aviso de enviado es el de siempre (no revela si la cuenta existe)')
      await p.click('[data-parte="volver-al-ingreso"]')
      await p.waitForSelector('[data-pieza="ingreso-con-clave"]', { timeout: 10000 })
      ver(true, '  y «Volver a iniciar sesión» vuelve al formulario del login')
    }

    // 4 · el ingreso con la cuenta de prueba.
    await p.goto(`${BASE}/v3?ingresar`, { waitUntil: 'load', timeout: 300000 })
    await esperarAbierta(p)
    await p.fill('input[name="email"]', email)
    await p.fill('input[name="password"]', clave)
    await p.click('[data-pieza="ingreso-con-clave"] button[type="submit"]')
    await p.waitForURL((u) => !u.pathname.startsWith('/v3'), { timeout: 90000 }).catch(() => undefined)
    const destino = new URL(p.url()).pathname
    ver(/^\/(admin|dashboard|setter|bienvenida)/.test(destino), '1440 · el ingreso con la cuenta de prueba lleva al panel', destino)
    ver(errores.length === 0, '1440 · sin errores en la página', errores.slice(0, 3).join(' | '))
  } finally {
    await ctx.close()
  }
  console.log(`\n${fallas.length === 0 ? 'BIEN' : `FALLAS (${String(fallas.length)})`}`)
  process.exit(fallas.length === 0 ? 0 : 1)
}

void main()
