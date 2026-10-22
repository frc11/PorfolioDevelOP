/**
 * [B12a.8 · T3] EL CHROME EN TODOS LOS ANCHOS — nada cortado contra un borde ni encimado: el parlante (y su cartel, después de tocarlo),
 * la píldora, Contacto y Login, el botón del menú y el título de la intro. Una carga por ruta y el cuadro que cambia de ancho (360 a 1920,
 * con paso fino alrededor de 1024 y de 1070), con el Chrome del sistema a la vista y `/api/` bloqueado. Por ancho: las cajas de cada pieza a
 * la vista, si alguna se sale del cuadro (más de 0,5 px) y si dos se pisan. Fotos de los anchos con falla en `~/.cache/b4-medicion/chrome/`.
 * [B12a.8] T3 · Y la página: que no se desborde a lo ancho (`scrollWidth`), y la consola de toda la corrida (errores, avisos y cualquier
 * «NaN»), contada por mensaje al final.
 * [B11] Y EL CHAT, abajo a la derecha (y su globo): el banco lo pide (`window.__chatDelBanco`; sin eso las pruebas no lo cargan) y le
 * SIMULA la config del bot (`/api/chatbot/…/config`, con el orbe 3D y la esquina izquierda: /v3 tiene que fijar el avatar liviano y la
 * derecha). Por carga: cuándo llegó (con la escena preparada y sin el velo de carga) y que no trae 3D (ningún canvas). `CHAT=no` lo
 * saca; `CONTROL=chat-al-centro` lo corre abajo al centro (tiene que dar «chat pisa píldora» desde 860 en el home al cargar).
 *
 *   RUTAS=/v3/pagina-base?composicion=1,/v3 npx tsx scripts-carga/chrome-en-los-anchos.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const RUTAS = (process.env.RUTAS ?? '/v3/pagina-base?composicion=1').split(',')
const ALTO = Number(process.env.ALTO ?? '800')
const ANCHOS = (process.env.ANCHOS ?? '360,390,430,600,768,820,860,900,960,1000,1010,1020,1023,1024,1030,1040,1050,1060,1070,1080,1090,1100,1120,1200,1280,1366,1440,1600,1920').split(',').map(Number)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/chrome')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const CON_CHAT = process.env.CHAT !== 'no'
const CONTROL = process.env.CONTROL ?? ''

/**
 * [B11] La config del bot, SIMULADA (nunca la API real): el orbe 3D y la esquina izquierda a propósito, para ver que /v3 fija el avatar
 * liviano y la derecha. Los textos son del banco, no contenido del sitio.
 */
const CONFIG_DEL_BANCO = {
  botName: 'Banco',
  isActive: true,
  accentColor: '#111111',
  accentSecondary: null,
  chatSurfaceTint: null,
  avatarStyle: 'neuro',
  avatarImageUrl: null,
  avatarEmoji: null,
  borderRadius: 'medium',
  surfaceStyle: 'glass',
  position: 'bottom_left',
  fontStyle: 'sans',
  bubbleStyle: 'rounded',
  intensityLevel: 'medium',
  welcomeMessage: 'Mensaje del banco.',
  quickReplies: [],
  routeColorMap: {},
  proactivePrompts: { default: ['Globo del banco: una pregunta de largo normal para medir su caja.'] },
  whatsappNumber: null,
  paused: null,
}

/** Cuándo llegó el chat (lo anota la página al aparecer su botón): con la escena preparada y sin el velo de carga, sin canvas. */
const ANOTAR_LA_LLEGADA = `(() => {
  window.__chatDelBanco = true;
  const mirar = () => {
    const boton = document.querySelector('[data-chatbot-avatar]');
    if (boton === null || window.__llegadaDelChat !== undefined) return;
    window.__llegadaDelChat = { t: Math.round(performance.now()), escenaPreparada: window.__precompiladoDelBanco !== undefined, velo: document.querySelector('[data-pieza="velo-de-carga"]') !== null };
  };
  new MutationObserver(mirar).observe(document, { childList: true, subtree: true });
})()`

interface Caja {
  readonly pieza: string
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
}

const PIEZAS: readonly (readonly [string, string])[] = [
  ['parlante', '[data-pieza="control-del-sonido"]'],
  ['cartel del sonido', '[data-pieza="cartel-del-sonido"]'],
  ['píldora', '[data-pieza="barra"] [data-parte="pastilla"]'],
  ['contacto y login', '[data-pieza="barra"] [data-parte="esquina"]'],
  ['botón del menú', '[aria-controls="menu-movil"]'],
  ['título', '[data-intro-de-pagina] h1'],
  // [B11] El chat (su botón) y su globo, que aparece a los 3 s del botón.
  ['chat', '[data-chatbot-avatar]'],
  ['globo del chat', '[data-chatbot-avatar] [class*="bottom-full"]'],
]

const cajas = (p: Page): Promise<Caja[]> =>
  p.evaluate((piezas) => {
    const salida: { pieza: string; x0: number; x1: number; y0: number; y1: number }[] = []
    for (const [pieza, sel] of piezas) {
      for (const el of document.querySelectorAll(sel)) {
        if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue
        const r = el.getBoundingClientRect()
        if (r.width <= 0 || r.height <= 0 || r.bottom < 0 || r.top > window.innerHeight) continue
        salida.push({ pieza, x0: r.left, x1: r.right, y0: r.top, y1: r.bottom })
      }
    }
    return salida
  }, PIEZAS)

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/chrome-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: 1440, height: ALTO },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', '--window-size=1960,1000', '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  let fallas = 0
  const consola = new Map<string, number>()
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    if (CON_CHAT) await ctx.addInitScript(ANOTAR_LA_LLEGADA)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    // [B11] Registrada después, corre antes: la config del bot, simulada (el resto de `/api/` sigue cortado).
    if (CON_CHAT) await p.route('**/api/chatbot/*/config', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CONFIG_DEL_BANCO) }))
    p.on('console', (m) => {
      const texto = m.text()
      if (m.type() === 'error' || m.type() === 'warning' || texto.includes('NaN')) consola.set(`${m.type()}: ${texto.slice(0, 160)}`, (consola.get(`${m.type()}: ${texto.slice(0, 160)}`) ?? 0) + 1)
    })
    p.on('pageerror', (e) => consola.set(`pageerror: ${e.message.slice(0, 160)}`, (consola.get(`pageerror: ${e.message.slice(0, 160)}`) ?? 0) + 1))
    for (const ruta of RUTAS) {
      await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
      await dormir(5000)
      if (CON_CHAT) {
        const llego = await p.waitForSelector('[data-chatbot-avatar]', { timeout: 30000 }).then(() => true).catch(() => false)
        const llegada = await p.evaluate(() => (window as unknown as { __llegadaDelChat?: unknown }).__llegadaDelChat ?? null)
        if (!llego) fallas += 1
        console.log(`${llego ? 'ok   ' : 'FALLA'} ${ruta} · el chat ${llego ? `llegó: ${JSON.stringify(llegada)}` : 'no llegó en 30 s'}`)
        if (CONTROL === 'chat-al-centro') await p.addStyleTag({ content: '[data-chatbot-avatar] { left: calc(50% - 28px) !important; right: auto !important; }' })
        await dormir(4000)
      }
      for (const ancho of ANCHOS) {
        await p.setViewportSize({ width: ancho, height: ALTO })
        await dormir(ancho === 1024 || ancho === 1023 ? 2500 : 900)
        // El parlante con su cartel (lo muestra tocarlo; se toca dos veces: queda como estaba).
        const parlante = p.locator('[data-pieza="control-del-sonido"]').first()
        if (await parlante.isVisible().catch(() => false)) {
          await parlante.click({ timeout: 3000 }).catch(() => undefined)
          await dormir(350)
        }
        const medidas = await cajas(p)
        if (await parlante.isVisible().catch(() => false)) {
          await parlante.click({ timeout: 3000 }).catch(() => undefined)
          await dormir(150)
        }
        const malas: string[] = []
        const desborde = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        if (desborde > 0.5) malas.push(`la página se desborda ${desborde.toFixed(0)} px a lo ancho`)
        // [B11] Sin 3D: ningún canvas en el chat (la config simulada pide el orbe), y su botón abajo a la derecha.
        if (CON_CHAT) {
          const chat = await p.evaluate(() => ({ canvas: document.querySelectorAll('[data-pieza="chat-del-sitio"] canvas').length, derecha: (document.querySelector('[data-chatbot-avatar]')?.getBoundingClientRect().right ?? 0) > window.innerWidth / 2 }))
          if (chat.canvas > 0) malas.push(`el chat trae 3D (${String(chat.canvas)} canvas)`)
          if (!chat.derecha && CONTROL !== 'chat-al-centro') malas.push('el chat no está a la derecha')
        }
        for (const c of medidas) if (c.x0 < -0.5 || c.x1 > ancho + 0.5 || c.y0 < -0.5) malas.push(`${c.pieza} se sale (x ${c.x0.toFixed(1)}…${c.x1.toFixed(1)}, y ${c.y0.toFixed(1)})`)
        for (let i = 0; i < medidas.length; i += 1) {
          for (let j = i + 1; j < medidas.length; j += 1) {
            const a = medidas[i]
            const b = medidas[j]
            if (a === undefined || b === undefined || a.pieza === b.pieza) continue
            const pisa = a.x0 < b.x1 - 0.5 && b.x0 < a.x1 - 0.5 && a.y0 < b.y1 - 0.5 && b.y0 < a.y1 - 0.5
            if (pisa) malas.push(`${a.pieza} pisa ${b.pieza}`)
          }
        }
        if (malas.length > 0) {
          fallas += 1
          await p.screenshot({ path: path.join(SALIDA, `${ruta.replace(/[^a-z0-9]+/gi, '_')}-${String(ancho)}.png`) })
        }
        console.log(`${malas.length === 0 ? 'ok   ' : 'FALLA'} ${ruta} · ${String(ancho)} · ${medidas.map((c) => c.pieza).join(', ')}${malas.length === 0 ? '' : ` · ${malas.join('; ')}`}`)
      }
    }
  } finally {
    await ctx.close()
  }
  console.log(`chrome-en-los-anchos: ${String(fallas)} anchos con falla`)
  console.log(`la consola: ${consola.size === 0 ? 'limpia (ni errores, ni avisos, ni NaN)' : `${String(consola.size)} mensajes distintos`}`)
  for (const [m, n] of consola) console.log(`  ${String(n)} × ${m}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
