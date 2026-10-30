/**
 * [L7a] LAS TRES PÁGINAS DE SERVICIO, EN EL NAVEGADOR — la verificación de 00-L7-COMMON: en cada ancho de `ANCHOS` y cada página, con el
 * Chrome del sistema a la vista, `/api/` bloqueado y el banco de la escena: la consola (errores y NaN), el `h1` (uno, el nombre), el
 * desborde (medido en el layout, con la ventana de escritorio achicada: con `isMobile` Chrome agranda la vista y lo esconde), el orden
 * intro → cuerpo → cierre bajando y al revés subiendo (qué tramo cubre el centro del cuadro en cada paso), y el FAQ que abre (la primera
 * pregunta, `aria-expanded`). Fotos en `C:\nocturno\cola3-fotos\L7\<página>\` (fuera del repo); con 1440, las tres intros lado a lado.
 * Además, `DESPLEGABLE=1`: a 1440, desde el home, cada ítem del desplegable de «Servicios» abre su página; `SERVICIOS_HOME=1`: a 1440, la
 * foto de la entrada de Servicios del home con los defaults nuevos (el aro en tercios).
 *
 *   ANCHOS=1440x900,1024x768,768x1024,390x844 npx tsx scripts-carga/l7a-paginas.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const PAGINAS = [
  { slug: 'paginas-web', h1: 'Desarrollo web' },
  { slug: 'software-a-medida', h1: 'Software a medida' },
  { slug: 'ia-y-automatizaciones', h1: 'Integraciones con IA' },
] as const
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1024x768,768x1024,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const ESPERA = Number(process.env.ESPERA ?? '6000')
const FOTOS = process.env.FOTOS ?? 'C:\\nocturno\\cola3-fotos\\L7'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

type Tramo = 'intro' | 'cuerpo' | 'cierre' | '?'

/** Qué tramo cubre el centro del cuadro: la intro, el cuerpo (los bloques en papel) o el cierre común. */
const tramoEnElCentro = (p: Page): Promise<Tramo> =>
  p.evaluate(() => {
    const y = innerHeight / 2
    const adentro = (sel: string): boolean => [...document.querySelectorAll(sel)].some((el) => {
      const r = el.getBoundingClientRect()
      return r.top <= y && r.bottom >= y
    })
    if (adentro('[data-cierre-de-pagina]')) return 'cierre'
    if (adentro('[data-bloque]')) return 'cuerpo'
    if (adentro('[data-intro-de-pagina]')) return 'intro'
    return '?'
  })

/** Las transiciones de una secuencia, sin repetidos ni huecos (`?`). */
const comprimida = (s: readonly Tramo[]): Tramo[] => s.filter((t) => t !== '?').filter((t, i, a) => i === 0 || a[i - 1] !== t)

interface Resultado { readonly linea: string; readonly bien: boolean }

async function unaPagina(p: Page, slug: string, h1: string, ancho: number, alto: number, consola: string[]): Promise<Resultado> {
  consola.length = 0
  const carpeta = path.join(FOTOS, slug)
  mkdirSync(carpeta, { recursive: true })
  await p.goto(`${BASE}/v3/${slug}`, { waitUntil: 'load', timeout: 300000 })
  await p.mouse.move(ancho / 2, alto / 2)
  await dormir(ESPERA)
  const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
  const h1s = await p.evaluate(() => [...document.querySelectorAll('h1')].map((h) => (h.textContent ?? '').trim()))
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-1-intro.png`) })
  // Bajando de a pasos de un tercio de pantalla hasta el fondo, y subiendo igual.
  const fondo = await p.evaluate(() => document.documentElement.offsetHeight - innerHeight)
  const paso = alto / 3
  const bajando: Tramo[] = []
  let desborde = 0
  let fotoDelCuerpo = false
  for (let y = 0; y <= fondo + paso; y += paso) {
    await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Math.min(y, fondo))
    await dormir(140)
    const t = await tramoEnElCentro(p)
    bajando.push(t)
    desborde = Math.max(desborde, await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
    if (!fotoDelCuerpo && t === 'cuerpo' && y > 2 * alto) {
      await dormir(900)
      await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-2-cuerpo.png`) })
      fotoDelCuerpo = true
    }
  }
  await dormir(2500)
  // El FAQ, al fondo: la primera pregunta a la vista abre su respuesta.
  const pregunta = p.locator('button[aria-expanded]').filter({ visible: true }).first()
  let faq = false
  if ((await pregunta.count()) > 0) {
    await pregunta.click({ timeout: 5000 }).catch(() => undefined)
    await dormir(1500)
    faq = (await p.locator('button[aria-expanded="true"]').count()) > 0
  }
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-3-cierre.png`) })
  const subiendo: Tramo[] = []
  for (let y = fondo; y >= -paso; y -= paso) {
    await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Math.max(y, 0))
    await dormir(140)
    subiendo.push(await tramoEnElCentro(p))
  }
  const abajo = comprimida(bajando).join('>')
  const arriba = comprimida(subiendo).join('>')
  const errores = consola.filter((c) => !/Failed to load resource|ERR_FAILED|net::/.test(c))
  const bien = visible && h1s.length === 1 && h1s[0] === h1 && desborde <= 0 && abajo === 'intro>cuerpo>cierre' && arriba === 'cierre>cuerpo>intro' && faq && errores.length === 0
  return {
    bien,
    linea: `${bien ? 'ok   ' : 'FALLA'} ${slug} · ${String(ancho)}×${String(alto)} · h1 ${JSON.stringify(h1s)} · desborde ${String(desborde)} px · bajando ${abajo} · subiendo ${arriba} · FAQ ${faq ? 'abre' : 'NO abre'} · consola ${errores.length === 0 ? 'limpia' : `\n      ${errores.join('\n      ')}`}${visible ? '' : ' · ⚠ pestaña oculta'}`,
  }
}

async function desplegable(p: Page): Promise<Resultado[]> {
  const salida: Resultado[] = []
  for (const [k, pagina] of PAGINAS.entries()) {
    await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
    await dormir(ESPERA)
    const servicios = await p.locator('[data-pieza="barra"] [data-pieza="barra-enlace"][data-nav-id="servicios"]').first().boundingBox()
    if (servicios === null) {
      salida.push({ bien: false, linea: 'FALLA desplegable · no está «Servicios» en la barra' })
      continue
    }
    await p.mouse.move(servicios.x + servicios.width / 2, servicios.y + servicios.height / 2, { steps: 6 })
    await dormir(800)
    const item = p.locator(`[data-pieza="barra"] > [data-parte="desplegable"] li:nth-child(${String(k + 1)}) [data-pieza="desplegable-enlace"]`)
    const rotulo = ((await item.textContent().catch(() => '')) ?? '').trim()
    await item.click({ timeout: 5000 }).catch(() => undefined)
    await p.waitForURL(`**/v3/${pagina.slug}`, { timeout: 20000 }).catch(() => undefined)
    await dormir(3000)
    const ruta = new URL(p.url()).pathname
    const h1 = await p.evaluate(() => (document.querySelector('h1')?.textContent ?? '').trim())
    const bien = ruta === `/v3/${pagina.slug}` && h1 === pagina.h1 && rotulo === pagina.h1
    salida.push({ bien, linea: `${bien ? 'ok   ' : 'FALLA'} desplegable · «${rotulo}» → ${ruta} · h1 «${h1}»` })
  }
  return salida
}

async function main(): Promise<void> {
  const lineas: Resultado[] = []
  for (const [ancho, alto] of ANCHOS) {
    const perfil = perfilDelBanco('l7a')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const consola: string[] = []
      p.on('console', (m) => {
        if (m.type() === 'error' || /NaN/.test(m.text())) consola.push(`${m.type()}: ${m.text().slice(0, 240)}`)
      })
      p.on('pageerror', (e) => consola.push(`pageerror: ${e.message.slice(0, 240)}`))
      for (const pagina of PAGINAS) {
        const r = await unaPagina(p, pagina.slug, pagina.h1, ancho, alto, consola)
        console.log(r.linea)
        lineas.push(r)
      }
      if (process.env.SERVICIOS_HOME === '1' && ancho === 1440) {
        await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
        await dormir(ESPERA)
        const caja = await p.locator('[data-pieza="barra"] [data-nav-id="servicios"]').first().boundingBox()
        if (caja !== null) {
          await p.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2)
          await dormir(4500)
          await p.mouse.move(60, alto - 60)
          await dormir(1500)
          mkdirSync(FOTOS, { recursive: true })
          await p.screenshot({ path: path.join(FOTOS, 'home-servicios-1440.png') })
          console.log(`foto · la entrada de Servicios del home a 1440 · ${path.join(FOTOS, 'home-servicios-1440.png')}`)
        }
      }
      if (process.env.DESPLEGABLE === '1' && ancho >= 1024) for (const r of await desplegable(p)) {
        console.log(r.linea)
        lineas.push(r)
      }
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
    }
    if (ancho === 1440) {
      const fotos = PAGINAS.map((x) => path.join(FOTOS, x.slug, '1440-1-intro.png'))
      await sharp({ create: { width: 1440 * 3, height: alto, channels: 3, background: '#000' } })
        .composite(fotos.map((input, i) => ({ input, left: 1440 * i, top: 0 })))
        .png()
        .toFile(path.join(FOTOS, 'servicios-intros-1440.png'))
    }
  }
  const fallas = lineas.filter((l) => !l.bien).length
  console.log(`\n${String(lineas.length - fallas)} de ${String(lineas.length)} en verde`)
  process.exit(fallas === 0 ? 0 : 1)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
