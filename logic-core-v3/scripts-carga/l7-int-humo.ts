/**
 * [L7-INT] EL HUMO DE TODAS LAS PÁGINAS DE L7, EN EL NAVEGADOR — después de juntar los dos carriles. El método es el de `l7a-paginas.ts`
 * (Chrome del sistema a la vista, `/api/` bloqueado, el banco de la escena), extendido a las páginas del carril B:
 * - con escena (las tres de servicio, Nosotros, Portfolio, el blog y una nota): consola, un `h1`, desborde, intro → cuerpo → cierre bajando
 *   y al revés subiendo, el FAQ que abre, el pie y los rótulos de su grupo «Páginas»; y la intro medida (su alto en pantallas, cuántas
 *   pantallas hasta que el cuerpo toma el centro, la caja del `h1`) con una tira de cuadros cada media pantalla para mirarla;
 * - las legales (sin escena): consola, un `h1`, desborde, cabecera → texto → pie bajando y subiendo, el pie;
 * - la 404: el estado, el `h1` y el botón al inicio.
 *
 *   ANCHOS=1440x900 npx tsx scripts-carga/l7-int-humo.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const NOTA = 'cuanto-cuesta-una-pagina-web-en-argentina'
type Tipo = 'escena' | 'legal' | 'no-encontrada'
const PAGINAS: readonly { readonly ruta: string; readonly carpeta: string; readonly h1: string; readonly tipo: Tipo }[] = [
  { ruta: 'paginas-web', carpeta: 'paginas-web', h1: 'Desarrollo web', tipo: 'escena' },
  { ruta: 'software-a-medida', carpeta: 'software-a-medida', h1: 'Software a medida', tipo: 'escena' },
  { ruta: 'ia-y-automatizaciones', carpeta: 'ia-y-automatizaciones', h1: 'Integraciones con IA', tipo: 'escena' },
  { ruta: 'nosotros', carpeta: 'nosotros', h1: 'Nosotros', tipo: 'escena' },
  { ruta: 'portfolio', carpeta: 'portfolio', h1: 'Portfolio', tipo: 'escena' },
  { ruta: 'blog', carpeta: 'blog', h1: 'Blog', tipo: 'escena' },
  { ruta: `blog/${NOTA}`, carpeta: 'nota', h1: 'Blog', tipo: 'escena' },
  { ruta: 'privacidad', carpeta: 'privacidad', h1: '', tipo: 'legal' },
  { ruta: 'terminos', carpeta: 'terminos', h1: '', tipo: 'legal' },
  { ruta: 'no-existe', carpeta: '404', h1: 'Esta página no existe, pero tu proyecto sí puede.', tipo: 'no-encontrada' },
]
const ROTULOS_DEL_PIE = ['Nosotros', 'Portfolio', 'Blog', 'Desarrollo web', 'Software a medida', 'Integraciones con IA']
const ANCHOS = (process.env.ANCHOS ?? '1440x900').split(',').map((a) => a.split('x').map(Number) as [number, number])
const ESPERA = Number(process.env.ESPERA ?? '6000')
const FOTOS = process.env.FOTOS ?? 'C:\\nocturno\\cola3-fotos\\L7'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

type Tramo = 'intro' | 'cuerpo' | 'cierre' | '?'

/** Qué tramo cubre el centro del cuadro. Con escena: la intro, el cuerpo en papel o el cierre común; en las legales: la cabecera, el texto o el pie. */
const tramoEnElCentro = (p: Page, tipo: Tipo): Promise<Tramo> =>
  p.evaluate((legal) => {
    const y = innerHeight / 2
    const adentro = (sel: string): boolean => [...document.querySelectorAll(sel)].some((el) => {
      const r = el.getBoundingClientRect()
      return r.top <= y && r.bottom >= y
    })
    if (legal) {
      if (adentro('[data-pagina-legal] > footer')) return 'cierre'
      if (adentro('[data-pagina-legal] section')) return 'cuerpo'
      if (adentro('[data-pagina-legal] > header')) return 'intro'
      return '?'
    }
    if (adentro('[data-cierre-de-pagina]')) return 'cierre'
    if (adentro('[data-bloque], [data-seccion-de-pagina], article, [data-pieza="notas-relacionadas"]')) return 'cuerpo'
    if (adentro('[data-intro-de-pagina]')) return 'intro'
    return '?'
  }, tipo === 'legal')

const comprimida = (s: readonly Tramo[]): Tramo[] => s.filter((t) => t !== '?').filter((t, i, a) => i === 0 || a[i - 1] !== t)

interface Resultado { readonly linea: string; readonly bien: boolean }

/** Los rótulos del grupo «Páginas» del pie que haya en el documento (puede haber uno por modo del pie). */
const rotulosDelPie = (p: Page): Promise<string[][]> =>
  p.evaluate(() => [...document.querySelectorAll('[aria-label="Páginas"]')].map((g) => [...g.querySelectorAll('a')].map((a) => (a.textContent ?? '').trim())))

/** [3] La intro, medida: su alto, cuándo el cuerpo toma el centro, la caja del `h1`; y una tira de cuadros cada media pantalla. */
async function laIntro(p: Page, carpeta: string, ancho: number, alto: number): Promise<string> {
  const m = await p.evaluate(() => {
    const intro = document.querySelector<HTMLElement>('[data-intro-de-pagina]')
    const h1 = document.querySelector('h1')
    const r = h1?.getBoundingClientRect()
    return {
      alto: intro === null ? 0 : intro.offsetHeight / innerHeight,
      h1: r === undefined ? null : { arriba: Math.round(r.top), abajo: Math.round(r.bottom), izq: Math.round(r.left), der: Math.round(r.right) },
      recortado: h1 === null ? false : h1.scrollWidth > h1.clientWidth + 1 || h1.scrollHeight > h1.clientHeight + 1,
    }
  })
  const cuadros: string[] = []
  let cuerpoEn = -1
  for (let k = 0; k <= 6; k++) {
    await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), (k * alto) / 2)
    await dormir(1200)
    if (cuerpoEn < 0 && (await tramoEnElCentro(p, 'escena')) === 'cuerpo') cuerpoEn = k / 2
    const archivo = path.join(carpeta, `${String(ancho)}-intro-${String(k)}.png`)
    await p.screenshot({ path: archivo })
    cuadros.push(archivo)
  }
  const escala = 0.3
  const w = Math.round(ancho * escala)
  const h = Math.round(alto * escala)
  const chicos = await Promise.all(cuadros.map((c) => sharp(c).resize(w, h).png().toBuffer()))
  await sharp({ create: { width: w * chicos.length, height: h, channels: 3, background: '#000' } })
    .composite(chicos.map((input, i) => ({ input, left: w * i, top: 0 })))
    .png()
    .toFile(path.join(carpeta, `${String(ancho)}-intro-tira.png`))
  for (const c of cuadros) rmSync(c, { force: true })
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await dormir(1200)
  const caja = m.h1 === null ? 'sin h1' : `h1 ${String(m.h1.izq)}…${String(m.h1.der)} × ${String(m.h1.arriba)}…${String(m.h1.abajo)}${m.recortado ? ' RECORTADO' : ''}`
  return `intro ${m.alto.toFixed(2)} pantallas · el cuerpo al centro a las ${cuerpoEn < 0 ? '>3' : cuerpoEn.toFixed(1)} · ${caja}`
}

async function unaPagina(p: Page, pagina: (typeof PAGINAS)[number], ancho: number, alto: number, consola: string[]): Promise<Resultado> {
  consola.length = 0
  const carpeta = path.join(FOTOS, pagina.carpeta)
  mkdirSync(carpeta, { recursive: true })
  const respuesta = await p.goto(`${BASE}/v3/${pagina.ruta}`, { waitUntil: 'load', timeout: 300000 })
  const estado = respuesta?.status() ?? 0
  await p.mouse.move(ancho / 2, alto / 2)
  await dormir(ESPERA)
  const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
  const h1s = await p.evaluate(() => [...document.querySelectorAll('h1')].map((h) => (h.textContent ?? '').trim()))
  const h1Bien = h1s.length === 1 && (pagina.h1 === '' ? h1s[0].length > 0 : h1s[0] === pagina.h1)
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-1-intro.png`) })
  const errores = (): string[] => consola.filter((c) => !/Failed to load resource|ERR_FAILED|net::/.test(c))
  if (pagina.tipo === 'no-encontrada') {
    const inicio = await p.evaluate(() => [...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === '/v3' && /inicio/i.test(a.textContent ?? '')))
    const bien = visible && estado === 404 && h1Bien && inicio && errores().length === 0
    return { bien, linea: `${bien ? 'ok   ' : 'FALLA'} ${pagina.carpeta} · ${String(ancho)} · estado ${String(estado)} · h1 ${JSON.stringify(h1s)} · al inicio ${inicio ? 'sí' : 'NO'} · consola ${errores().length === 0 ? 'limpia' : JSON.stringify(errores())}` }
  }
  const intro = pagina.tipo === 'escena' && ancho === 1440 ? ` · ${await laIntro(p, carpeta, ancho, alto)}` : ''
  const fondo = await p.evaluate(() => document.documentElement.offsetHeight - innerHeight)
  const paso = alto / 3
  const bajando: Tramo[] = []
  let desborde = 0
  let fotoDelCuerpo = false
  for (let y = 0; y <= fondo + paso; y += paso) {
    await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Math.min(y, fondo))
    await dormir(140)
    const t = await tramoEnElCentro(p, pagina.tipo)
    bajando.push(t)
    desborde = Math.max(desborde, await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
    if (!fotoDelCuerpo && t === 'cuerpo' && y > alto) {
      await dormir(900)
      await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-2-cuerpo.png`) })
      fotoDelCuerpo = true
    }
  }
  await dormir(2500)
  let faq = pagina.tipo === 'legal'
  if (pagina.tipo === 'escena') {
    if (ancho >= 1024) {
      await p.mouse.move(ancho / 2, alto / 2)
      for (let i = 0; i < 2; i++) {
        await p.mouse.wheel(0, 240)
        await dormir(1600)
      }
    }
    const pregunta = p.locator('button[id^="faq-del-pie-pregunta-"]').filter({ visible: true }).first()
    if ((await pregunta.count()) > 0) {
      await pregunta.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => undefined)
      await dormir(800)
      await pregunta.click({ timeout: 5000 }).catch(() => undefined)
      await dormir(1500)
      faq = (await p.locator('button[id^="faq-del-pie-pregunta-"][aria-expanded="true"]').count()) > 0
    }
  }
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-3-cierre.png`) })
  const pie = await p.evaluate((legal) => document.querySelector(legal ? '[data-pagina-legal] > footer' : '[data-parte="pie-del-cierre"]') !== null, pagina.tipo === 'legal')
  const rotulos = await rotulosDelPie(p)
  const rotulosBien = rotulos.length > 0 && rotulos.every((r) => JSON.stringify(r) === JSON.stringify(ROTULOS_DEL_PIE))
  const subiendo: Tramo[] = []
  for (let y = fondo; y >= -paso; y -= paso) {
    await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Math.max(y, 0))
    await dormir(140)
    subiendo.push(await tramoEnElCentro(p, pagina.tipo))
  }
  const abajo = comprimida(bajando).join('>')
  const arriba = comprimida(subiendo).join('>')
  const bien = visible && estado === 200 && h1Bien && desborde <= 0 && abajo === 'intro>cuerpo>cierre' && arriba === 'cierre>cuerpo>intro' && faq && pie && rotulosBien && errores().length === 0
  return {
    bien,
    linea: `${bien ? 'ok   ' : 'FALLA'} ${pagina.carpeta} · ${String(ancho)}×${String(alto)} · estado ${String(estado)} · h1 ${JSON.stringify(h1s)} · desborde ${String(desborde)} px · bajando ${abajo} · subiendo ${arriba} · FAQ ${pagina.tipo === 'legal' ? 'no lleva' : faq ? 'abre' : 'NO abre'} · pie ${pie ? 'sí' : 'NO'} · «Páginas» ${rotulosBien ? 'bien' : JSON.stringify(rotulos)} · consola ${errores().length === 0 ? 'limpia' : JSON.stringify(errores())}${visible ? '' : ' · PESTAÑA OCULTA'}${intro}`,
  }
}

async function main(): Promise<void> {
  const lineas: Resultado[] = []
  for (const [ancho, alto] of ANCHOS) {
    const perfil = perfilDelBanco('l7-int')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
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
        const r = await unaPagina(p, pagina, ancho, alto, consola).catch((e: unknown) => ({ bien: false, linea: `FALLA ${pagina.carpeta} · ${String(ancho)} · se cayó: ${String(e).slice(0, 240)}` }))
        console.log(r.linea)
        lineas.push(r)
      }
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
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
