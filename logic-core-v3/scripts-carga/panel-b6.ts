/**
 * [B6] LA SECCIÓN DEL PANEL, EN EL SITIO — lo que `s6-tu-panel` afirma con sus modelos y sólo el navegador puede medir. El Chrome del
 * sistema, `/api/` bloqueado (el newsletter nunca se envía). Mide, a 1440 × 900 y a 1024 × 768:
 *   a · el pintado del título: scrolleando de a poco, el centro del título (en % del alto) cuando la última palabra termina de pintarse
 *       (`--pintado` = 1): entre 45 y 55;
 *   b · el eje de cada grupo: los centros en x de la TINTA VISIBLE de la palabra fundida, el título y la descripción, a ±1 % del ancho;
 *       y su posición vertical contra la caja de LAYOUT del módulo: `final` (el pie del grupo al del módulo; [C2 60b] era
 *       `?grupo=final`, el producto: `union` y la bandera se borraron);
 *   c · la rueda sobre un módulo, con el ratón siempre encima: con el candado puesto, una muesca mueve la PÁGINA, el contenido del panel
 *       no se mueve y el cartel se ve; después de un clic (el CONTROL: el mismo detector tiene que ver lo contrario), la rueda es del
 *       módulo: mueve el contenido si tiene recorrido y la página NO se mueve, tampoco en el borde; al sacar el ratón, el candado vuelve;
 *   d · el contraste AA de todo el texto de la sección, ya pintado, con los colores que calcula el navegador;
 *   e · el CTA (su forma es de la tarea 60c): mide al menos una pantalla y su primer botón no navega;
 *   f · [C2 60b] el alto de la sección: mide su CONTENIDO (los espacios se achicaron), menos de 5 pantallas desde 1024; la escena
 *       lo descuenta con el tramo anotado (`tramo.ts`, k = alto / 7 pantallas de la tabla), que se imprime.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/panel-b6.ts
 *   ANCHOS=1440x900,1024x768 …   los tamaños (por defecto, esos dos)
 *
 * [C2 60b] MODO=espacios: LOS ESPACIOS DEL CUERPO, medidos en el sitio a 1440 × 900, 1024 × 768, 768 × 1024 y 390 × 844 (en cajas de
 * LAYOUT: la cabecera, las filas, el CTA), contra lo que declara `geometria.ts` (a ±2 px) y, desde 1024, contra los topes del ítem 15
 * (título → primer módulo ≤ 20svh, entre módulos ≤ 25svh, último módulo → CTA ≤ 10svh). Imprime también el aire VISIBLE hasta el
 * titular del CTA (con el de adentro del CTA, de la 60c), el alto de la sección y su `k`, y lo que sólo se ve en el sitio: los
 * renglones del título (2 desde 1024, 3 abajo), «Lo que nos distingue» (1 renglón desde 1024, 2 abajo, de lado a lado), abajo de
 * 1024 cada palabra fundida del ancho de la sección y los títulos de los módulos en Archivo a 600.
 *   MODO=espacios npx tsx scripts-carga/panel-b6.ts
 *   MODO=espacios CONTROL=espacios-de-antes …   le devuelve a la sección los espacios de antes (una hoja con `!important` sobre sus
 *                                               variables): los espacios tienen que dar FALLA en los cuatro anchos.
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

import { RITMO, RITMO_ANGOSTO } from '../src/app/v3/_secciones/tu-panel/geometria'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const MODO = process.env.MODO ?? ''
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'espacios'].includes(MODO)) throw new Error(`MODO=${MODO}: espacios`)
if (!['', 'espacios-de-antes'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: espacios-de-antes`)
const ANCHOS = (process.env.ANCHOS ?? (MODO === 'espacios' ? '1440x900,1024x768,768x1024,390x844' : '1440x900,1024x768')).split(',').map((a) => a.split('x').map(Number) as [number, number])
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

/**
 * [B6, corregido] EL EJE Y LA POSICIÓN DE LOS GRUPOS, sobre el LAYOUT y la TINTA VISIBLE:
 *   · el centro de cada pieza es el de la tinta que se ve: la unión de los rectángulos de sus textos SIN las copias para el lector
 *     (con la coreografía, el título y la descripción llevan el texto entero en un `sr-only` de 1 px con `white-space: nowrap`, que
 *     desborda a la derecha: la primera versión lo contaba y daba 49,6 % y 76,3 % de desvío con el grupo centrado a la vista);
 *   · el módulo se mide en su caja de layout (el `Bloque`, el primer hijo de `modulo-del-panel`, que nunca se transforma), no en el
 *     marco: el marco lleva la llegada de P2 (sube desde el 60 % de su alto) y, sin llegar, corría el pie 327 px a 1440 y 263 a 1024.
 */
async function ejes(p: Page): Promise<{ readonly desvio: number; readonly vertical: number[]; readonly huecos: number[] }> {
  return p.evaluate(() => {
    const ancho = window.innerWidth
    const oculto = (el: Element, hasta: Element): boolean => {
      for (let a: Element | null = el; a !== null && a !== hasta.parentElement; a = a.parentElement) {
        const s = getComputedStyle(a)
        if (s.display === 'none' || s.visibility === 'hidden') return true
        if (s.position === 'absolute' && a.getBoundingClientRect().width <= 1) return true
        if (s.clipPath.startsWith('inset(50%') || (s.clip !== 'auto' && s.clip !== '')) return true
      }
      return false
    }
    const centroDeLaTinta = (x: Element): number => {
      let izq = Number.POSITIVE_INFINITY
      let der = Number.NEGATIVE_INFINITY
      const textos = document.createTreeWalker(x, NodeFilter.SHOW_TEXT)
      for (let n = textos.nextNode(); n !== null; n = textos.nextNode()) {
        if ((n.textContent ?? '').trim() === '' || n.parentElement === null || oculto(n.parentElement, x)) continue
        const rango = document.createRange()
        rango.selectNodeContents(n)
        for (const r of rango.getClientRects()) {
          if (r.width <= 0) continue
          izq = Math.min(izq, r.left)
          der = Math.max(der, r.right)
        }
      }
      return Number.isFinite(izq) ? (izq + der) / 2 / ancho : Number.NaN
    }
    let desvio = 0
    const vertical: number[] = []
    const huecos: number[] = []
    const filas = [...document.querySelectorAll<HTMLElement>('[data-pieza="fila-del-panel"]')]
    filas.forEach((fila, i) => {
      const grupo = fila.querySelector<HTMLElement>('[data-pieza="grupo-del-modulo"]')
      const piezas = [grupo?.querySelector('[data-pieza="palabra-fundida"]'), grupo?.querySelector('h3'), grupo?.querySelector('p')].filter((x): x is Element => x !== null && x !== undefined)
      const centros = piezas.map(centroDeLaTinta)
      desvio = Math.max(desvio, centros.some((c) => Number.isNaN(c)) ? 1 : Math.max(...centros) - Math.min(...centros))
      const modulo = fila.querySelector('[data-pieza="modulo-del-panel"]')?.firstElementChild?.getBoundingClientRect()
      const g = grupo?.getBoundingClientRect()
      if (modulo !== undefined && g !== undefined) vertical.push(Math.round(g.bottom - modulo.bottom), Math.round(g.top + g.height / 2 - modulo.bottom))
      // El aire hasta lo que sigue: la fila siguiente (su caja de layout) o, después de la última, el CTA.
      const siguiente = (filas[i + 1] ?? document.querySelector('[data-pieza="cta-del-panel"]'))?.getBoundingClientRect()
      if (modulo !== undefined && siguiente !== undefined) huecos.push(Math.round(siguiente.top - modulo.bottom))
    })
    return { desvio, vertical, huecos }
  })
}

interface EstadoDeLaRueda {
  readonly y: number
  readonly adentro: number
  readonly recorrido: number
  readonly cartel: boolean
  readonly candado: string
}

/**
 * [B6, corregido] LA RUEDA SOBRE UN MÓDULO, con el ratón SIEMPRE encima: la primera versión dejaba el ratón al 60 % del módulo y
 * daba tres muescas (~300 px): la página sacaba el módulo de abajo del ratón (un `pointerleave`) y el clic de después caía con la
 * caja vieja, afuera. Ahora: el ratón cerca del tope de la parte visible, una muesca, y la caja se vuelve a leer antes de cada paso.
 */
async function rueda(p: Page): Promise<{ readonly puesto: { pagina: number; adentro: number; cartel: boolean }; readonly libre: { pagina: number; adentro: number; recorrido: number; candado: string; pagina2: number; adentro2: number }; readonly alSalir: string }> {
  const MARCO = '[data-pieza="fila-del-panel"] [data-parte="marco"]'
  await llevar(p, MARCO, 0.2)
  await dormir(2500)
  const medir = (): Promise<EstadoDeLaRueda> =>
    p.evaluate((sel) => {
      const marco = document.querySelector(sel)
      const contenido = marco?.querySelector<HTMLElement>('[data-parte="contenido-del-panel"]')
      return {
        y: window.scrollY,
        adentro: contenido?.scrollTop ?? Number.NaN,
        recorrido: contenido === null || contenido === undefined ? Number.NaN : contenido.scrollHeight - contenido.clientHeight,
        cartel: marco?.querySelector('[data-parte="cartel"]')?.hasAttribute('data-visible') ?? false,
        candado: marco?.getAttribute('data-candado') ?? '?',
      }
    }, MARCO)
  /** Un punto adentro de la parte VISIBLE del módulo, a `fraccion` de su alto visible. */
  const punto = async (fraccion: number): Promise<{ x: number; y: number }> => {
    const caja = await p.locator(MARCO).first().boundingBox()
    if (caja === null) throw new Error('sin módulo')
    const alto = await p.evaluate(() => window.innerHeight)
    const arriba = Math.max(caja.y, 0)
    const abajo = Math.min(caja.y + caja.height, alto)
    return { x: caja.x + caja.width / 2, y: arriba + (abajo - arriba) * fraccion }
  }
  // Bloqueado: una muesca con el ratón cerca del tope de lo visible (el módulo sube 100 px y el ratón sigue encima).
  let q = await punto(0.15)
  await p.mouse.move(q.x, q.y)
  await dormir(300)
  const a = await medir()
  await p.mouse.wheel(0, 100)
  await dormir(500)
  const b = await medir()
  // CONTROL: el clic adentro (la caja de AHORA), y tres muescas: la rueda es del módulo.
  q = await punto(0.5)
  await p.mouse.click(q.x, q.y)
  await dormir(400)
  const c = await medir()
  // [NOCTURNO] Hacia donde el contenido tiene recorrido: la maqueta puede estar ya en su fondo (scrollTop = recorrido) y ahí bajar no mueve nada.
  const sentido = c.adentro >= c.recorrido - 1 ? -1 : 1
  for (let k = 0; k < 3; k += 1) {
    await p.mouse.wheel(0, 100 * sentido)
    await dormir(120)
  }
  await dormir(700)
  const d = await medir()
  // Y en el borde (si lo hay): tres muescas más, que el contenido ya no absorbe: la página sigue quieta.
  for (let k = 0; k < 3; k += 1) {
    await p.mouse.wheel(0, 100 * sentido)
    await dormir(120)
  }
  await dormir(700)
  const e = await medir()
  await p.mouse.move(2, 2)
  await dormir(300)
  const fuera = await medir()
  return {
    puesto: { pagina: b.y - a.y, adentro: b.adentro - a.adentro, cartel: b.cartel },
    libre: { pagina: d.y - c.y, adentro: d.adentro - c.adentro, recorrido: c.recorrido, candado: c.candado, pagina2: e.y - d.y, adentro2: e.adentro - d.adentro },
    alSalir: fuera.candado,
  }
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

/** [C2 60b] Lo que mide `MODO=espacios` en un ancho: los espacios en cajas de layout (px) y lo que sólo se ve en el sitio. */
interface MedidaDelCuerpo {
  readonly ventana: { readonly ancho: number; readonly alto: number }
  readonly arriba: number
  readonly entre: readonly number[]
  readonly antesDelCta: number
  readonly hastaElTitularDelCta: number
  readonly seccion: number
  readonly renglonesDelTitulo: number
  readonly palabraDelTitulo: { readonly renglones: number; readonly ocupa: number }
  readonly palabras: readonly number[]
  readonly titulos: readonly { readonly familia: string; readonly peso: string; readonly mayusculas: boolean }[]
}

async function cuerpo(p: Page): Promise<MedidaDelCuerpo> {
  await llevar(p, '[data-panel="tu-panel"]', 0)
  await dormir(1500)
  return p.evaluate(() => {
    const raiz = document.querySelector('[data-panel="tu-panel"]')
    const caja = (s: string): DOMRect | null => raiz?.querySelector(s)?.getBoundingClientRect() ?? null
    /** La tinta de un elemento: la unión de las cajas de sus renglones de texto (sin la caja del elemento, que es de lado a lado). */
    const tinta = (el: Element | null): { readonly ancho: number; readonly renglones: number } => {
      if (el === null) return { ancho: 0, renglones: 0 }
      const rango = document.createRange()
      rango.selectNodeContents(el)
      const cajas = [...rango.getClientRects()].filter((r) => r.width > 0 && r.height > 0)
      const tops = new Set(cajas.map((r) => Math.round(r.top / 4)))
      return { ancho: Math.max(...cajas.map((r) => r.right), 0) - Math.min(...cajas.map((r) => r.left), 0), renglones: tops.size }
    }
    const encabezado = caja('[data-pieza="encabezado-del-panel"]')
    const lista = caja('[data-pieza="modulos-del-panel"]')
    const filas = [...(raiz?.querySelectorAll('[data-pieza="fila-del-panel"]') ?? [])].map((f) => f.getBoundingClientRect())
    const cta = caja('[data-pieza="cta-del-panel"]')
    const titularDelCta = caja('[data-pieza="cta-del-panel"] [data-pieza="titulo-que-se-pinta"]')
    const modulos = [...(raiz?.querySelectorAll('[data-pieza="modulo-del-panel"]') ?? [])].map((m) => m.firstElementChild?.getBoundingClientRect() ?? null)
    const ultimo = modulos[modulos.length - 1] ?? null
    const palabrasDelTitulo = [...(raiz?.querySelectorAll('h2[data-pieza="titulo-que-se-pinta"] [data-palabra]') ?? [])].map((x) => Math.round(x.getBoundingClientRect().top / 4))
    const grupos = [...(raiz?.querySelectorAll('[data-pieza="grupo-del-modulo"]') ?? [])]
    return {
      ventana: { ancho: window.innerWidth, alto: window.innerHeight },
      arriba: (lista?.top ?? 0) - (encabezado?.bottom ?? 0),
      entre: filas.slice(1).map((f, i) => f.top - filas[i].bottom),
      antesDelCta: (cta?.top ?? 0) - (lista?.bottom ?? 0),
      hastaElTitularDelCta: (titularDelCta?.top ?? 0) - (ultimo?.bottom ?? 0),
      seccion: raiz?.getBoundingClientRect().height ?? 0,
      renglonesDelTitulo: new Set(palabrasDelTitulo).size,
      palabraDelTitulo: (() => {
        const t = tinta(raiz?.querySelector('[data-pieza="palabra-del-titulo"]') ?? null)
        return { renglones: t.renglones, ocupa: t.ancho / (encabezado?.width ?? 1) }
      })(),
      palabras: grupos.map((g) => tinta(g.querySelector('[data-pieza="palabra-fundida"]')).ancho / g.getBoundingClientRect().width),
      titulos: grupos.map((g) => {
        const s = getComputedStyle(g.querySelector('h3') ?? g)
        return { familia: s.fontFamily, peso: s.fontWeight, mayusculas: s.textTransform === 'uppercase' }
      }),
    }
  })
}

/** [C2 60b] `CONTROL=espacios-de-antes`: la sección con los espacios de B6 (la hoja le gana a las variables en línea). */
const ESPACIOS_DE_ANTES = '[data-panel="tu-panel"] > div { --respiro: 61svh !important; --entre-filas: 100svh !important; --antes-del-cta: 100svh !important; --respiro-angosto: 30svh !important; --entre-filas-angosto: 30svh !important; }'

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
    // [NOCTURNO] El ayudante que esbuild (tsx) mete en las funciones que van a `page.evaluate`, como en los otros bancos.
    await ctx.addInitScript('(() => { window.__name = window.__name || ((f) => f) })()')
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    const tag = `${String(ancho)}×${String(alto)}`

    await irA(p, '')
    if (MODO === 'espacios') {
      if (CONTROL === 'espacios-de-antes') await p.addStyleTag({ content: ESPACIOS_DE_ANTES })
      const m = await cuerpo(p)
      const escritorio = m.ventana.ancho >= 1024
      const svh = m.ventana.alto / 100
      const esperado = escritorio ? { arriba: RITMO.respiro, entre: RITMO.entreFilas, antes: RITMO.antesDelCta } : { arriba: RITMO_ANGOSTO.respiro, entre: RITMO_ANGOSTO.entreFilas, antes: RITMO_ANGOSTO.entreFilas }
      const px = (v: number): string => `${v.toFixed(0)} px (${(v / svh).toFixed(1)}svh)`
      const cerca = (v: number, svhEsperados: number): boolean => Math.abs(v - svhEsperados * svh) <= 2
      const topes = !escritorio || (m.arriba <= 20 * svh && m.entre.every((e) => e <= 25 * svh) && m.antesDelCta <= 10 * svh)
      anotar(cerca(m.arriba, esperado.arriba) && topes, `${tag} espacios · título → primer módulo ${px(m.arriba)} (declarado ${String(esperado.arriba)}svh${escritorio ? '; tope 20' : ''})`, `espacio-arriba-${tag}`)
      anotar(m.entre.length === 2 && m.entre.every((e) => cerca(e, esperado.entre)) && topes, `${tag} espacios · entre módulos ${m.entre.map(px).join(' · ')} (declarado ${String(esperado.entre)}svh${escritorio ? '; tope 25' : ''})`, `espacio-entre-${tag}`)
      anotar(cerca(m.antesDelCta, esperado.antes) && topes, `${tag} espacios · último módulo → CTA ${px(m.antesDelCta)} (declarado ${String(esperado.antes)}svh${escritorio ? '; tope 10' : ''}); hasta el titular del CTA, con su aire de adentro: ${px(m.hastaElTitularDelCta)}`, `espacio-cta-${tag}`)
      console.log(`      ${tag} la sección mide ${m.seccion.toFixed(0)} px = ${(m.seccion / m.ventana.alto).toFixed(3)} pantallas${escritorio ? ` (antes 7; k = ${(m.seccion / (7 * m.ventana.alto)).toFixed(4)})` : ' (el alto de antes es el modelo de `altoViejoAngosto`)'}`)
      anotar(m.renglonesDelTitulo === (escritorio ? 2 : 3), `${tag} el título en ${String(m.renglonesDelTitulo)} renglones (${escritorio ? '2' : '3'})`, `renglones-${tag}`)
      anotar(m.palabraDelTitulo.renglones === (escritorio ? 1 : 2) && m.palabraDelTitulo.ocupa >= 0.85 && m.palabraDelTitulo.ocupa <= 1.01, `${tag} «Lo que nos distingue» en ${String(m.palabraDelTitulo.renglones)} renglón(es), ocupa el ${(m.palabraDelTitulo.ocupa * 100).toFixed(1)} % del ancho`, `palabra-del-titulo-${tag}`)
      if (!escritorio) {
        anotar(m.palabras.length === 3 && m.palabras.every((o) => o >= 0.85 && o <= 1.01), `${tag} cada palabra fundida del ancho de la sección: ${m.palabras.map((o) => `${(o * 100).toFixed(0)} %`).join(' · ')}`, `palabras-${tag}`)
        anotar(m.titulos.length === 3 && m.titulos.every((t) => /archivo/i.test(t.familia) && t.peso === '600' && !t.mayusculas), `${tag} los títulos de los módulos en Archivo a 600, en minúsculas (${m.titulos.map((t) => `${t.familia.split(',')[0]} ${t.peso}`).join(' · ')})`, `titulos-${tag}`)
      }
      await ctx.close()
      continue
    }
    const alturas = await p.evaluate(() => (document.querySelector('[data-panel="tu-panel"]')?.getBoundingClientRect().height ?? 0) / window.innerHeight)
    anotar(alturas > 2.5 && alturas < 5, `${tag} f · la sección mide su contenido: ${alturas.toFixed(3)} pantallas (antes, la tabla: 7); la escena lo descuenta con k = ${(alturas / 7).toFixed(4)}`, `alto-${tag}`)
    const { fin } = await pintado(p)
    anotar(fin !== null && fin >= 0.45 && fin <= 0.55, `${tag} a · el título termina de pintarse con su centro al ${fin === null ? '?' : (fin * 100).toFixed(1)} % del alto (45 a 55)`, `pintado-${tag}`)
    const final = await ejes(p)
    anotar(final.desvio <= 0.01, `${tag} b · el eje de los grupos: a lo sumo ${(final.desvio * 100).toFixed(2)} % del ancho entre la palabra, el título y la descripción`, `eje-${tag}`)
    anotar(final.vertical.filter((_, i) => i % 2 === 0).every((v) => Math.abs(v) <= 2), `${tag} b · final (el que quedó de \`?grupo=\`): el pie de cada grupo al del módulo, en su caja de layout (${final.vertical.filter((_, i) => i % 2 === 0).join(' · ')} px)`, `final-${tag}`)
    const r = await rueda(p)
    anotar(r.puesto.pagina > 50 && Math.abs(r.puesto.adentro) < 1 && r.puesto.cartel, `${tag} c · bloqueado, una muesca movió la página ${String(r.puesto.pagina)} px, el contenido ${String(r.puesto.adentro)} px y el cartel ${r.puesto.cartel ? 'se ve' : 'NO se ve'}`, `rueda-${tag}`)
    anotar(r.libre.candado === 'libre' && Math.abs(r.libre.pagina) <= 2 && Math.abs(r.libre.pagina2) <= 2 && (r.libre.recorrido < 1 || Math.abs(r.libre.adentro) > 0), `${tag} c · CONTROL: después del clic (candado ${r.libre.candado}) la rueda movió el contenido ${String(r.libre.adentro)} px (tenía ${String(r.libre.recorrido)} de recorrido) y la página ${String(r.libre.pagina)} px; en el borde, tres muescas más: la página ${String(r.libre.pagina2)} px`, `rueda-libre-${tag}`)
    anotar(r.alSalir === 'puesto', `${tag} c · al sacar el ratón, el candado: ${r.alSalir}`, `rueda-salida-${tag}`)
    const aa = await contraste(p)
    anotar(aa.peor >= 4.5, `${tag} d · el texto de la sección, pintado: el peor contraste ${aa.peor.toFixed(2)}:1 («${aa.donde}»)`, `aa-${tag}`)
    const cta = await p.evaluate(() => {
      const c = document.querySelector('[data-pieza="cta-del-panel"]')
      return (c?.getBoundingClientRect().height ?? 0) / window.innerHeight
    })
    // [C2 60b] El botón del CTA es de la 60c: el primero del CTA, se llame como se llame.
    const botonDelCta = p.locator('[data-pieza="cta-del-panel"] button').first()
    await botonDelCta.scrollIntoViewIfNeeded()
    const antes = p.url()
    await botonDelCta.click()
    await dormir(800)
    anotar(cta >= 0.999 && p.url() === antes, `${tag} e · el CTA mide ${cta.toFixed(2)} pantallas y su botón no navegó`, `cta-${tag}`)
    await ctx.close()
  }
  console.log(fallas.length === 0 ? 'panel-b6: todo en verde' : `panel-b6: ${String(fallas.length)} fallas (${fallas.join(', ')})`)
  if (fallas.length > 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
