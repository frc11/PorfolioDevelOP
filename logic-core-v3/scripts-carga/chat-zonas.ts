/**
 * [C2-21] EL CHAT EN LAS ZONAS CRUCIALES Y CON LOS COLORES DEL HOME — el Chrome del sistema a la vista contra el dev o el build (`BASE`),
 * `/api/` bloqueado y la config del bot SIMULADA (nunca la API real) con los colores de la prueba vieja del panel del cliente (el tinte
 * turquesa, los chips en rojo, la onda): /v3 tiene que fijar los suyos. El banco pide el chat (`window.__chatDelBanco`). Por ancho:
 *   · el chat cerrado (la capa que envuelve al widget, `data-parte="desvanecido"`): opacidad 1 en el hero; 0 (e `inert`) con el Portfolio,
 *     con Servicios y con su recomendador en la línea del chat; 1 de vuelta en el Panel y en el hero;
 *   · abierto (un clic en la burbuja, en el hero) y llevado al Portfolio: se queda (opacidad 1, la ventana abierta);
 *   · la ventana con los colores del home: su fondo en la tinta (#111111, casi opaco) y la letra de los chips en el papel (#F7F7F5);
 *   · el avatar: el geométrico (ningún anillo de la onda) y ningún error de consola «attribute r».
 * Y la foto del sitio vivo (`/`, el chat abierto con la misma config simulada) en `~/.cache/b4-medicion/chat-zonas/vivo-<ancho>.png`:
 * correrlo contra la base y contra esta rama, y comparar (`SOLO_VIVO=1` saca sólo esas fotos).
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,1024,390 npx tsx scripts-carga/chat-zonas.ts
 *   CONTROL=sin-desvanecer …  una hoja inyectada deja la capa en opacidad 1: las zonas tienen que FALLAR
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type BrowserContext, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024,390').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'sin-desvanecer'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: sin-desvanecer`)
const SOLO_VIVO = process.env.SOLO_VIVO === '1'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/chat-zonas')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** La config del bot, simulada: los colores de la prueba vieja del panel (los textos son del banco, no contenido del sitio). */
const CONFIG_DEL_BANCO = {
  botName: 'Banco',
  isActive: true,
  accentColor: '#f59e0b',
  accentSecondary: '#ef4444',
  chatSurfaceTint: '#14b8a6',
  avatarStyle: 'onda',
  avatarImageUrl: null,
  avatarEmoji: null,
  borderRadius: 'medium',
  surfaceStyle: 'glass',
  position: 'bottom_right',
  fontStyle: 'sans',
  bubbleStyle: 'rounded',
  intensityLevel: 'MEDIUM',
  welcomeMessage: 'Mensaje del banco.',
  quickReplies: [
    { label: 'Chip uno', promptToSend: 'uno', emoji: null },
    { label: 'Chip dos', promptToSend: 'dos', emoji: null },
  ],
  routeColorMap: {},
  proactivePrompts: { default: ['Globo del banco.'] },
  whatsappNumber: null,
  paused: null,
}

const CAPA = '[data-pieza="chat-del-sitio"] [data-parte="desvanecido"]'

async function abrir(ancho: number, ruta: string): Promise<{ readonly ctx: BrowserContext; readonly p: Page; readonly errores: string[] }> {
  const alto = ancho < 1024 ? 844 : 900
  const movil = ancho < 1024
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/chat-zonas-perfil-${String(Date.now())}`)
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
  await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__chatDelBanco = true; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const errores: string[] = []
  p.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text())
  })
  await p.route('**/api/**', (r) => r.abort())
  await p.route('**/api/chatbot/*/config', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CONFIG_DEL_BANCO) }))
  await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
  await p.mouse.move(2, 2)
  return { ctx, p, errores }
}

/** Lleva la página a `y` (un salto nativo) y lee la capa del chat después de su fundido. */
async function capaEn(p: Page, donde: string): Promise<{ readonly opacidad: number; readonly inerte: boolean } | null> {
  const ok = await p.evaluate((d) => {
    const y = (() => {
      if (d === 'hero') return 0
      if (d === 'recomendador') {
        const r = document.querySelector('[data-pieza="recomendador"]')
        return r === null ? null : r.getBoundingClientRect().top + scrollY - innerHeight * 0.3
      }
      const el = document.querySelector(`[data-panel="${d}"]`)
      if (el === null) return null
      // El Portfolio: adentro de su pin (dos pantallas); las demás, su tope arriba (la línea del chat cae adentro).
      return el.getBoundingClientRect().top + scrollY + (d === 'trabajos' ? innerHeight * 2 : 0)
    })()
    if (y === null) return false
    window.scrollTo({ top: y, behavior: 'instant' })
    return true
  }, donde)
  if (!ok) return null
  await dormir(1200)
  return p.evaluate((sel) => {
    const capa = document.querySelector<HTMLElement>(sel)
    return capa === null ? null : { opacidad: Number(getComputedStyle(capa).opacity), inerte: capa.inert }
  }, CAPA)
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: { readonly linea: string; readonly bien: boolean }[] = []
  const anotar = (linea: string, bien: boolean): void => {
    lineas.push({ linea: `${bien ? 'ok   ' : 'FALLA'} ${linea}`, bien })
    console.log(lineas[lineas.length - 1]?.linea)
  }
  for (const ancho of ANCHOS) {
    // La foto del sitio vivo: `/`, el chat abierto.
    {
      const { ctx, p } = await abrir(ancho, '/')
      try {
        const llego = await p.waitForSelector('[data-chatbot-avatar]', { timeout: 30000 }).then(() => true).catch(() => false)
        if (llego) {
          await dormir(1500)
          await p.click('[data-chatbot-avatar]')
          await dormir(1500)
        }
        await p.screenshot({ path: path.join(SALIDA, `vivo-${String(ancho)}.png`) })
        console.log(`·     ${String(ancho)} · el sitio vivo: ${llego ? 'chat abierto' : 'SIN CHAT'} → vivo-${String(ancho)}.png (comparar contra la base)`)
      } finally {
        await ctx.close()
      }
    }
    if (SOLO_VIVO) continue
    const { ctx, p, errores } = await abrir(ancho, '/v3')
    try {
      const llego = await p.waitForSelector('[data-chatbot-avatar]', { timeout: 30000 }).then(() => true).catch(() => false)
      if (!llego) {
        anotar(`${String(ancho)} · el chat no apareció en 30 s`, false)
        continue
      }
      await dormir(2000)
      if (CONTROL === 'sin-desvanecer') await p.addStyleTag({ content: `${CAPA} { opacity: 1 !important; }` })
      // 1 · Cerrado: se desvanece en las zonas y vuelve fuera.
      const esperado: readonly (readonly [string, boolean])[] = [['hero', true], ['trabajos', false], ['quienes-somos', true], ['servicios', false], ['recomendador', false], ['tu-panel', true], ['hero', true]]
      for (const [donde, visible] of esperado) {
        const c = await capaEn(p, donde)
        const bien = c !== null && (visible ? c.opacidad >= 0.99 && !c.inerte : c.opacidad <= 0.01 && c.inerte)
        anotar(`${String(ancho)} · cerrado, en ${donde}: ${c === null ? 'NO SE MIDIÓ' : `opacidad ${c.opacidad.toFixed(2)}${c.inerte ? ', inerte' : ''}`} (esperado ${visible ? 'a la vista' : 'desvanecido'})`, bien)
      }
      // 2 · Abierto en el hero y llevado al Portfolio: se queda. Y los colores de la ventana.
      await capaEn(p, 'hero')
      await p.click('[data-chatbot-avatar]')
      await dormir(1500)
      const ventana = await p.evaluate(() => {
        const v = document.querySelector<HTMLElement>('[data-chatbot-window]')
        if (v === null) return null
        // El fondo del panel: el primer ancestro o descendiente con color de fondo propio (la ventana pinta su superficie adentro).
        const conFondo = [v, ...v.querySelectorAll<HTMLElement>('*')].find((el) => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)')
        const chip = [...v.querySelectorAll<HTMLElement>('button')].find((b) => (b.textContent ?? '').includes('Chip uno'))
        return { fondo: conFondo === undefined ? '' : getComputedStyle(conFondo).backgroundColor, chip: chip === undefined ? '' : getComputedStyle(chip).color, anillos: document.querySelectorAll('[data-chatbot-avatar] svg circle[fill="none"]').length }
      })
      const fondoBien = ventana !== null && /^rgba?\(17, 17, 17/.test(ventana.fondo)
      const chipBien = ventana !== null && /^rgba?\(247, 247, 245/.test(ventana.chip)
      anotar(`${String(ancho)} · la ventana: fondo ${ventana?.fondo ?? 'NO ABRIÓ'} (la tinta), la letra de los chips ${ventana?.chip || 'sin chips'} (el papel), anillos de la onda en el botón: ${String(ventana?.anillos ?? -1)}`, fondoBien && chipBien && ventana.anillos === 0)
      const abierto = await capaEn(p, 'trabajos')
      const sigue = await p.evaluate(() => document.querySelector('[data-chatbot-window]') !== null)
      anotar(`${String(ancho)} · abierto y llevado al Portfolio: ${abierto === null ? 'NO SE MIDIÓ' : `opacidad ${abierto.opacidad.toFixed(2)}`}, la ventana ${sigue ? 'sigue abierta' : 'SE CERRÓ'} (esperado: se queda)`, abierto !== null && abierto.opacidad >= 0.99 && sigue)
      await p.screenshot({ path: path.join(SALIDA, `v3-${String(ancho)}-abierto-en-el-portfolio${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
      const delR = errores.filter((e) => /attribute r\b/.test(e))
      anotar(`${String(ancho)} · errores de consola «attribute r»: ${String(delR.length)}`, delR.length === 0)
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  console.log(`chat-zonas: ${String(lineas.filter((l) => l.bien).length)} de ${String(lineas.length)} dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: las zonas tienen que FALLAR)`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
