/**
 * [B6] LA SECCIÓN DEL PANEL, EN EL SITIO — lo que `s6-tu-panel` afirma con sus modelos y sólo el navegador puede medir. El Chrome del
 * sistema, `/api/` bloqueado (el newsletter nunca se envía). Mide, a 1440 × 900 y a 1024 × 768:
 *   a · el pintado del título: scrolleando de a poco, el centro del título (en % del alto) cuando la última palabra termina de pintarse
 *       (`--pintado` = 1): entre 45 y 55;
 *   b · el eje de cada grupo: los centros en x de la palabra fundida, el título y la descripción, a ±1 % del ancho; y su posición vertical
 *       con `?grupo=final` (el pie del grupo al del módulo) y `?grupo=union` (su centro en la mitad del aire hasta el siguiente);
 *   c · la rueda sobre un módulo: con el candado puesto, tres muescas mueven la PÁGINA, el contenido del panel no se mueve y el cartel se
 *       ve; después de un clic (el CONTROL: el mismo detector tiene que ver lo contrario), la rueda mueve el contenido; al sacar el
 *       ratón, el candado vuelve;
 *   d · el contraste AA de todo el texto de la sección, ya pintado, con los colores que calcula el navegador;
 *   e · el CTA: mide al menos una pantalla y «Probar el panel» no navega;
 *   f · el alto de la sección: 7,00 pantallas desde 1024 (la tabla; `k = 1`).
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/panel-b6.ts
 *   ANCHOS=1440x900,1024x768 …   los tamaños (por defecto, esos dos)
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1024x768').split(',').map((a) => a.split('x').map(Number) as [number, number])
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const lineal = (v: number): number => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)
const luz = (c: readonly number[]): number => 0.2126 * lineal(c[0] ?? 0) + 0.7152 * lineal(c[1] ?? 0) + 0.0722 * lineal(c[2] ?? 0)
const razon = (a: readonly number[], b: readonly number[]): number => (Math.max(luz(a), luz(b)) + 0.05) / (Math.min(luz(a), luz(b)) + 0.05)
function rgb(css: string): number[] {
  const srgb = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/.exec(css)
  if (srgb !== null) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255]
  const m = /rgba?\(([\d.]+),? ([\d.]+),? ([\d.]+)/.exec(css)
  return m === null ? [Number.NaN, Number.NaN, Number.NaN] : [Number(m[1]), Number(m[2]), Number(m[3])]
}

async function irA(p: Page, consulta: string): Promise<void> {
  await p.goto(`${BASE}/v3${consulta}`, { waitUntil: 'load', timeout: 300000 })
  await dormir(4000)
  const visible = await p.evaluate(() => document.visibilityState === 'visible' && window.innerWidth > 0)
  if (!visible) throw new Error('la pestaña no está visible: toda medición de scroll daría cero')
}

/** Lleva el tope del elemento a `fraccion` del alto (scroll instantáneo) y espera dos cuadros. */
async function llevar(p: Page, selector: string, fraccion: number): Promise<void> {
  await p.evaluate(
    ([s, f]) => {
      const el = document.querySelector(s as string)
      if (el === null) return
      const r = el.getBoundingClientRect()
      window.scrollTo({ top: window.scrollY + r.top - window.innerHeight * (f as number), behavior: 'instant' })
    },
    [selector, fraccion] as const,
  )
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
}

async function pintado(p: Page): Promise<{ readonly fin: number | null }> {
  const titulo = '[data-panel="tu-panel"] h2[data-pieza="titulo-que-se-pinta"]'
  let fin: number | null = null
  for (let f = 1.05; f >= 0.2; f -= 0.01) {
    await llevar(p, titulo, f)
    const m = await p.evaluate((s) => {
      const h = document.querySelector(s)
      const palabras = h === null ? [] : [...h.querySelectorAll<HTMLElement>('[data-palabra]')]
      const ultima = palabras[palabras.length - 1]
      const r = h?.getBoundingClientRect()
      return { centro: r === undefined ? Number.NaN : (r.top + r.height / 2) / window.innerHeight, pintada: ultima === undefined ? Number.NaN : Number(getComputedStyle(ultima).getPropertyValue('--pintado') || '1') }
    }, titulo)
    if (m.pintada >= 0.999 && fin === null) fin = m.centro
  }
  return { fin }
}

async function ejes(p: Page): Promise<{ readonly desvio: number; readonly vertical: number[] }> {
  return p.evaluate(() => {
    const ancho = window.innerWidth
    let desvio = 0
    const vertical: number[] = []
    for (const fila of document.querySelectorAll<HTMLElement>('[data-pieza="fila-del-panel"]')) {
      const grupo = fila.querySelector<HTMLElement>('[data-pieza="grupo-del-modulo"]')
      const piezas = [grupo?.querySelector('[data-pieza="palabra-fundida"]'), grupo?.querySelector('h3'), grupo?.querySelector('p')].filter((x): x is Element => x !== null && x !== undefined)
      const centros = piezas.map((x) => {
        const r = x.getBoundingClientRect()
        // El texto, no la caja: el centro de la tinta de cada línea es el de su rango.
        const rango = document.createRange()
        rango.selectNodeContents(x)
        const t = rango.getBoundingClientRect()
        return (t.width > 0 ? t.left + t.width / 2 : r.left + r.width / 2) / ancho
      })
      desvio = Math.max(desvio, Math.max(...centros) - Math.min(...centros))
      const modulo = fila.querySelector('[data-parte="marco"]')?.getBoundingClientRect()
      const g = grupo?.getBoundingClientRect()
      if (modulo !== undefined && g !== undefined) vertical.push(Math.round(g.bottom - modulo.bottom), Math.round(g.top + g.height / 2 - modulo.bottom))
    }
    return { desvio, vertical }
  })
}

async function rueda(p: Page): Promise<{ readonly puesto: { pagina: number; adentro: number; cartel: boolean }; readonly libre: { pagina: number; adentro: number; candado: string }; readonly alSalir: string }> {
  await llevar(p, '[data-pieza="fila-del-panel"] [data-parte="marco"]', 0.2)
  await dormir(2500)
  const caja = await p.locator('[data-pieza="fila-del-panel"] [data-parte="marco"]').first().boundingBox()
  if (caja === null) throw new Error('sin módulo')
  const medir = (): Promise<{ y: number; adentro: number; cartel: boolean; candado: string }> =>
    p.evaluate(() => {
      const marco = document.querySelector('[data-pieza="fila-del-panel"] [data-parte="marco"]')
      return {
        y: window.scrollY,
        adentro: marco?.querySelector('[data-parte="contenido-del-panel"]')?.scrollTop ?? Number.NaN,
        cartel: marco?.querySelector('[data-parte="cartel"]')?.hasAttribute('data-visible') ?? false,
        candado: marco?.getAttribute('data-candado') ?? '?',
      }
    })
  await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height * 0.6)
  await dormir(300)
  const a = await medir()
  for (let k = 0; k < 3; k += 1) {
    await p.mouse.wheel(0, 100)
    await dormir(120)
  }
  await dormir(600)
  const b = await medir()
  await p.mouse.click(caja.x + caja.width / 2, caja.y + caja.height * 0.6)
  await dormir(400)
  const c = await medir()
  for (let k = 0; k < 3; k += 1) {
    await p.mouse.wheel(0, 100)
    await dormir(120)
  }
  await dormir(600)
  const d = await medir()
  await p.mouse.move(2, 2)
  await dormir(300)
  const e = await medir()
  return { puesto: { pagina: b.y - a.y, adentro: b.adentro - a.adentro, cartel: b.cartel }, libre: { pagina: d.y - c.y, adentro: d.adentro - c.adentro, candado: c.candado }, alSalir: e.candado }
}

async function contraste(p: Page): Promise<{ readonly peor: number; readonly donde: string }> {
  await llevar(p, '[data-panel="tu-panel"] h2', 0.1)
  await dormir(800)
  return p.evaluate(() => {
    const seccion = document.querySelector('[data-panel="tu-panel"]')
    const fondo = getComputedStyle(seccion ?? document.body).backgroundColor
    const textos = [...(seccion?.querySelectorAll<HTMLElement>('h2 [data-palabra], h3, p, label, [data-pieza="cta"]') ?? [])].filter((x) => x.closest('[aria-hidden="true"]') === null && x.closest('[data-parte="marco"]') === null)
    return { fondo, colores: textos.map((x) => ({ color: getComputedStyle(x).color, texto: (x.textContent ?? '').slice(0, 30) })) }
  }).then(({ fondo, colores }) => {
    let peor = Number.POSITIVE_INFINITY
    let donde = ''
    for (const c of colores) {
      const r = razon(rgb(c.color), rgb(fondo))
      if (r < peor) {
        peor = r
        donde = c.texto
      }
    }
    return { peor, donde }
  })
}

async function main(): Promise<void> {
  const fallas: string[] = []
  const anotar = (bien: boolean, texto: string, nombre: string): void => {
    console.log(`${bien ? 'ok   ' : 'FALLA'} ${texto}`)
    if (!bien) fallas.push(nombre)
  }
  for (const [ancho, alto] of ANCHOS) {
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/panel-b6-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
    })
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    const tag = `${String(ancho)}×${String(alto)}`

    await irA(p, '')
    const alto7 = await p.evaluate(() => (document.querySelector('[data-panel="tu-panel"]')?.getBoundingClientRect().height ?? 0) / window.innerHeight)
    anotar(Math.abs(alto7 - 7) < 0.02, `${tag} f · la sección mide ${alto7.toFixed(3)} pantallas (la tabla: 7; k = 1)`, `alto-${tag}`)
    const { fin } = await pintado(p)
    anotar(fin !== null && fin >= 0.45 && fin <= 0.55, `${tag} a · el título termina de pintarse con su centro al ${fin === null ? '?' : (fin * 100).toFixed(1)} % del alto (45 a 55)`, `pintado-${tag}`)
    const final = await ejes(p)
    anotar(final.desvio <= 0.01, `${tag} b · el eje de los grupos: a lo sumo ${(final.desvio * 100).toFixed(2)} % del ancho entre la palabra, el título y la descripción`, `eje-${tag}`)
    anotar(final.vertical.filter((_, i) => i % 2 === 0).every((v) => Math.abs(v) <= 2), `${tag} b · ?grupo=final (defecto): el pie de cada grupo al del módulo (${final.vertical.filter((_, i) => i % 2 === 0).join(' · ')} px)`, `final-${tag}`)
    const r = await rueda(p)
    anotar(r.puesto.pagina > 100 && Math.abs(r.puesto.adentro) < 1 && r.puesto.cartel, `${tag} c · bloqueado, la rueda movió la página ${String(r.puesto.pagina)} px, el contenido ${String(r.puesto.adentro)} px y el cartel ${r.puesto.cartel ? 'se ve' : 'NO se ve'}`, `rueda-${tag}`)
    anotar(r.libre.candado === 'libre' && r.libre.adentro > 0, `${tag} c · CONTROL: después del clic (candado ${r.libre.candado}) la rueda movió el contenido ${String(r.libre.adentro)} px y la página ${String(r.libre.pagina)} px`, `rueda-libre-${tag}`)
    anotar(r.alSalir === 'puesto', `${tag} c · al sacar el ratón, el candado: ${r.alSalir}`, `rueda-salida-${tag}`)
    const aa = await contraste(p)
    anotar(aa.peor >= 4.5, `${tag} d · el texto de la sección, pintado: el peor contraste ${aa.peor.toFixed(2)}:1 («${aa.donde}»)`, `aa-${tag}`)
    const cta = await p.evaluate(() => {
      const c = document.querySelector('[data-pieza="cta-del-panel"]')
      return (c?.getBoundingClientRect().height ?? 0) / window.innerHeight
    })
    await llevar(p, '[data-pieza="probar-el-panel"]', 0.5)
    const antes = p.url()
    await p.locator('[data-pieza="probar-el-panel"] button').click()
    await dormir(800)
    anotar(cta >= 0.999 && p.url() === antes, `${tag} e · el CTA mide ${cta.toFixed(2)} pantallas y «Probar el panel» no navegó`, `cta-${tag}`)

    await irA(p, '?grupo=union')
    const union = await ejes(p)
    const huecos = await p.evaluate(() => {
      const filas = [...document.querySelectorAll('[data-pieza="fila-del-panel"]')]
      return filas.slice(0, -1).map((f, i) => {
        const a = f.querySelector('[data-parte="marco"]')?.getBoundingClientRect()
        const b = filas[i + 1]?.querySelector('[data-parte="marco"]')?.getBoundingClientRect()
        return a === undefined || b === undefined ? Number.NaN : Math.min(b.top, filas[i + 1]?.getBoundingClientRect().top ?? b.top) - a.bottom
      })
    })
    const centros = union.vertical.filter((_, i) => i % 2 === 1)
    anotar(centros.slice(0, huecos.length).every((c, i) => Math.abs(c - (huecos[i] ?? 0) / 2) <= 4), `${tag} b · ?grupo=union: el centro de cada grupo a ${centros.join(' · ')} px del pie de su módulo (la mitad del aire: ${huecos.map((h) => (h / 2).toFixed(0)).join(' · ')})`, `union-${tag}`)
    await ctx.close()
  }
  console.log(fallas.length === 0 ? 'panel-b6: todo en verde' : `panel-b6: ${String(fallas.length)} fallas (${fallas.join(', ')})`)
  if (fallas.length > 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
