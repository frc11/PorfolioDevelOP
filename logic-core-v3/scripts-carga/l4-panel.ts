/**
 * [L4] EL PANEL EN EL SITIO (cola 3, ítem 60) — Chrome del sistema a la vista contra el dev (`BASE`), `/api/` bloqueado. Por ancho:
 *
 *   PALABRA  «Lo que nos distingue»: el TOPE del título principal en la mitad (en alto) de la palabra (≤ 3 px); el contraste de la
 *            palabra contra el papel entre 1,15:1 y 1,35:1 (se lee y sigue secundaria); abajo de 1024, la tinta de la palabra MÁS ANCHA
 *            que la del título. Lo mismo en cada módulo: el tope de su título en la mitad de su palabra (≤ 3 px).
 *   MUESTRA  la muestra del panel de cada módulo, montada: ningún botón «Pausar»/«Seguir» ni `pausa-del-video`; y ningún par de textos
 *            de una tarjeta de lead que se pise.
 *   CTA      el formulario de novedades en su ancho nuevo (≥ 460 px desde 1024), la flecha punteada terminando sobre el botón (centro a
 *            ≤ 8 px) con puntos a paso parejo, y abajo de 1024 los títulos de las dos columnas a ≥ 36 px.
 *
 *   BASE=http://localhost:3002 ANCHOS=1440x900,390x844 npx tsx scripts-carga/l4-panel.ts
 *   CONTROL=palabra-centrada   la palabra centrada en la caja del título (la de antes): PALABRA tiene que dar FALLA.
 *   CONTROL=con-pausa          un botón «Pausar» en el módulo: MUESTRA tiene que dar FALLA.
 *   CONTROL=sin-envolver       las tarjetas de lead sin envolver (la de antes): MUESTRA tiene que dar FALLA.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const TAMANOS = (process.env.ANCHOS ?? '1440x900,390x844').split(',').map((t) => t.split('x').map(Number) as [number, number])
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('l4-panel')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const CONTROLES: Readonly<Record<string, { readonly css?: string; readonly script?: string }>> = {
  'palabra-centrada': { css: '[data-pieza="palabra-del-titulo"] { top: 50% !important; } [data-pieza="palabra-fundida"] { margin-bottom: 0 !important; transform: none !important; }' },
  'con-pausa': { script: `new MutationObserver(() => { document.querySelectorAll('[data-pieza="modulo-del-panel"]').forEach((m) => { if (!m.querySelector('[data-x-pausa]')) { const b = document.createElement('button'); b.setAttribute('data-x-pausa', ''); b.textContent = 'Pausar'; m.appendChild(b) } }) }).observe(document, { childList: true, subtree: true })` },
  'sin-envolver': { css: '[data-pieza="demo-del-panel"] .flex-wrap { flex-wrap: nowrap !important; }' },
}
if (CONTROL !== '' && !(CONTROL in CONTROLES)) throw new Error(`CONTROL=${CONTROL}: ${Object.keys(CONTROLES).join(' | ')}`)

const lineas: { texto: string; bien: boolean | null }[] = []
const anotar = (bien: boolean | null, rotulo: string, ancho: number, detalle: string): void => {
  const texto = `${bien === null ? 'info ' : bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ${rotulo} · ${detalle}`
  console.log(texto)
  lineas.push({ texto, bien })
}
async function foto(p: Page, ancho: number, alto: number, nombre: string): Promise<void> {
  await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${CONTROL === '' ? 'producto' : CONTROL}-${nombre}.png`) })
  await p.setViewportSize({ width: ancho, height: alto })
}
/** Lleva el elemento a una fracción del cuadro y espera a que se asiente (Lenis, los revelados). */
async function llevar(p: Page, sel: string, fraccion: number, indice = 0): Promise<void> {
  await p.evaluate(([s, f, i]) => {
    const el = document.querySelectorAll(s as string)[i as number]
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * (f as number), behavior: 'instant' })
  }, [sel, fraccion, indice] as const)
  await dormir(1800)
}

async function palabra(p: Page, ancho: number, alto: number): Promise<void> {
  await llevar(p, '[data-pieza="encabezado-del-panel"]', 0.35)
  const m = await p.evaluate(() => {
    const t = document.querySelector('[data-pieza="encabezado-del-panel"] h2')
    const w = document.querySelector('[data-pieza="palabra-del-titulo"]')
    if (!t || !w) return null
    const caja = (e: Element): { top: number; h: number } => { const b = e.getBoundingClientRect(); return { top: b.top, h: b.height } }
    // La tinta: el ancho de la línea más ancha de un texto (Range sobre cada nodo de texto).
    const ancho = (e: Element): number => {
      const r = document.createRange(); let mayor = 0
      const nodos = document.createTreeWalker(e, NodeFilter.SHOW_TEXT)
      for (let n = nodos.nextNode(); n; n = nodos.nextNode()) { r.selectNodeContents(n); for (const c of r.getClientRects()) mayor = Math.max(mayor, c.width) }
      return mayor
    }
    // El contraste: el color de la tinta con la opacidad de la palabra, sobre el papel de la sección.
    const rgb = (c: string): number[] => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
    const lineal = (v: number): number => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)
    const luz = (c: number[]): number => 0.2126 * lineal(c[0] ?? 0) + 0.7152 * lineal(c[1] ?? 0) + 0.0722 * lineal(c[2] ?? 0)
    let papelEl: Element | null = w
    let fondo = 'rgba(0, 0, 0, 0)'
    while (papelEl && /rgba\(.*, 0\)|transparent/.test(fondo)) { fondo = getComputedStyle(papelEl).backgroundColor; papelEl = papelEl.parentElement }
    const cs = getComputedStyle(w)
    const a = Number(cs.opacity)
    const papel = rgb(fondo)
    const tinta = rgb(cs.color)
    const mezcla = papel.map((p, i) => a * (tinta[i] ?? 0) + (1 - a) * p)
    const [l1, l2] = [luz(papel), luz(mezcla)]
    return { t: caja(t), w: caja(w), anchoT: ancho(t), anchoW: ancho(w), contraste: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05), alfa: a }
  })
  if (m === null) return void anotar(false, 'PALABRA', ancho, 'no están el título o la palabra')
  const dy = m.t.top - (m.w.top + m.w.h / 2)
  const movil = ancho < 1024
  anotar(Math.abs(dy) <= 3, 'PALABRA · el tope del título en la mitad de la palabra', ancho, `tope del título ${m.t.top.toFixed(1)} · mitad de la palabra ${(m.w.top + m.w.h / 2).toFixed(1)} · diferencia ${dy.toFixed(1)} px (tope 3)`)
  anotar(m.contraste >= 1.15 && m.contraste <= 1.35, 'PALABRA · se lee y es secundaria', ancho, `alfa ${m.alfa} · ${m.contraste.toFixed(3)}:1 contra el papel (1,15 a 1,35)`)
  if (movil) anotar(m.anchoW > m.anchoT, 'PALABRA · abajo de 1024 más ancha que el título', ancho, `la tinta de la palabra ${m.anchoW.toFixed(0)} px contra ${m.anchoT.toFixed(0)} px del título`)
  await foto(p, ancho, alto, 'a-titulo')
  // Los módulos: el tope del título de cada uno en la mitad de su palabra.
  for (let i = 0; i < 3; i++) {
    await llevar(p, '[data-pieza="fila-del-panel"]', movil ? 0.25 : 0.12, i)
    const f = await p.evaluate((k) => {
      const li = document.querySelectorAll('[data-pieza="fila-del-panel"]')[k]
      const w = li?.querySelector('[data-pieza="palabra-fundida"]')
      const t = li?.querySelector('h3')
      if (!w || !t) return null
      // Con el revelado de la fila terminado (la fila entera en el cuadro): las cajas de verdad, con sus transformadas.
      const a = w.getBoundingClientRect(); const b = t.getBoundingClientRect()
      return { dy: b.top - (a.top + a.height / 2), op: Number(getComputedStyle(w.parentElement ?? w).opacity) }
    }, i)
    anotar(f !== null && Math.abs(f.dy) <= 3, `PALABRA · módulo ${String(i + 1)}: el tope del título en la mitad de su palabra`, ancho, f === null ? 'sin palabra o título' : `diferencia ${f.dy.toFixed(1)} px (tope 3)`)
    if (i === 0) await foto(p, ancho, alto, 'b-modulo')
  }
}

async function muestra(p: Page, ancho: number, alto: number): Promise<void> {
  const malos: string[] = []
  let tarjetas = 0
  for (let i = 0; i < 3; i++) {
    await llevar(p, '[data-pieza="fila-del-panel"]', ancho < 1024 ? 0.2 : 0.3, i)
    await p.evaluate((k) => document.querySelectorAll('[data-pieza="modulo-del-panel"]')[k]?.querySelector('[data-parte="marco"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })), i)
    await dormir(2500)
    const r = await p.evaluate((k) => {
      const m = document.querySelectorAll('[data-pieza="modulo-del-panel"]')[k]
      const botones = [...(m?.querySelectorAll('button') ?? [])].map((b) => (b.textContent ?? '').trim()).filter((t) => /^(Pausar|Seguir)/i.test(t))
      const conPausa = (m?.querySelector('[data-parte="pausa-del-video"]') ?? null) !== null
      const montada = (m?.querySelector('[data-pieza="demo-del-panel"]') ?? null) !== null
      // Los pares de textos de una tarjeta de lead que se pisan (más de 2 px de ancho y de alto en común).
      const solapes: string[] = []
      let n = 0
      for (const c of m?.querySelectorAll('[data-pieza="demo-del-panel"] .pointer-events-none.relative') ?? []) {
        n++
        const hojas = [...c.querySelectorAll('h3, p, span')].filter((e) => e.children.length === 0 && (e.textContent ?? '').trim() !== '' && e.getClientRects().length > 0)
        for (let a = 0; a < hojas.length; a++) for (let b = a + 1; b < hojas.length; b++) {
          const x = hojas[a]?.getBoundingClientRect(); const y = hojas[b]?.getBoundingClientRect()
          if (!x || !y) continue
          const ancho = Math.min(x.right, y.right) - Math.max(x.left, y.left); const alto = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top)
          if (ancho > 2 && alto > 2) solapes.push(`${(hojas[a]?.textContent ?? '').trim().slice(0, 14)} × ${(hojas[b]?.textContent ?? '').trim().slice(0, 14)}`)
        }
      }
      return { botones, conPausa, montada, solapes, n }
    }, i)
    tarjetas += r.n
    if (!r.montada) malos.push(`módulo ${String(i + 1)}: la muestra no se montó`)
    if (r.botones.length > 0 || r.conPausa) malos.push(`módulo ${String(i + 1)}: botón de pausa (${r.botones.join(',') || 'pausa-del-video'})`)
    if (r.solapes.length > 0) malos.push(`módulo ${String(i + 1)}: textos que se pisan (${r.solapes.slice(0, 3).join(' | ')})`)
    await foto(p, ancho, alto, `c-muestra-${String(i + 1)}`)
  }
  anotar(malos.length === 0, 'MUESTRA · sin botón de pausa y sin textos que se pisen', ancho, malos.length === 0 ? `las tres muestras montadas, ${String(tarjetas)} tarjetas de lead revisadas, ningún botón de pausa` : malos.join(' · '))
}

async function cta(p: Page, ancho: number, alto: number): Promise<void> {
  await llevar(p, '[data-pieza="cta-del-panel"]', 0.1)
  await dormir(1500)
  const m = await p.evaluate(() => {
    const caja = (e: Element | null): { x: number; y: number; w: number; h: number } | null => { const b = e?.getBoundingClientRect(); return b === undefined ? null : { x: b.left, y: b.top, w: b.width, h: b.height } }
    const campos = [...document.querySelectorAll('[data-pieza="form-de-novedades"] label')].map((l) => caja(l))
    const flecha = document.querySelector('[data-pieza="flecha-punteada"]')
    const camino = flecha?.querySelector('path')
    const boton = document.querySelector('[data-pieza="probar-ahora"]')
    const t = (s: string): number => Number.parseFloat(getComputedStyle(document.querySelector(s) ?? document.body).fontSize)
    return { campos, flecha: caja(flecha ?? null), boton: caja(boton), dash: camino === null || camino === undefined ? '' : getComputedStyle(camino).strokeDasharray, probar: t('[data-pieza="columna-probar"] h4'), novedades: t('[data-pieza="columna-novedades"] h4') }
  })
  const campo = m.campos[0]
  anotar(campo !== null && campo !== undefined && (ancho < 1024 || campo.w >= 460) && campo.h >= 34, 'CTA · el formulario de novedades más grande', ancho, campo ? `píldora ${campo.w.toFixed(0)} × ${campo.h.toFixed(0)} px (desde 1024 ≥ 460 de ancho, y ≥ 34 de alto: antes ~ 26)` : 'sin campos')
  const f = m.flecha; const b = m.boton
  const alineada = f !== null && b !== null && Math.abs(f.x + f.w / 2 - (b.x + b.w / 2)) <= 8 && f.y + f.h <= b.y + 4
  anotar(alineada && /^0(px)?,? ?9(px)?$/.test(m.dash.replace(/\s+/g, ' ').trim().replace(', ', ',')) , 'CTA · la flecha punteada sobre el botón, con puntos a paso parejo', ancho, f && b ? `centro de la flecha ${(f.x + f.w / 2).toFixed(0)} · del botón ${(b.x + b.w / 2).toFixed(0)} · la flecha termina ${(b.y - (f.y + f.h)).toFixed(0)} px arriba del botón · dasharray «${m.dash}»` : 'sin flecha o botón')
  if (ancho < 1024) anotar(m.probar >= 36 && m.novedades >= 36, 'CTA · teléfono: los títulos de las dos columnas más grandes', ancho, `«Probar el panel» ${m.probar.toFixed(0)} px · «Suscribite a las novedades» ${m.novedades.toFixed(0)} px (≥ 36)`)
  await foto(p, ancho, alto, 'd-cta')
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const control = CONTROLES[CONTROL] ?? {}
  for (const [ancho, alto] of TAMANOS) {
    const movil = ancho < 1024
    const ctx = await chromium.launchPersistentContext(perfilDelBanco('l4-panel'), {
      executablePath: CHROME, headless: false, viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil, reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      const estilo = control.css === undefined ? '' : `document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(control.css)}; document.head.appendChild(s) });`
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ${estilo} ${control.script ?? ''} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(7000)
      if ((await p.evaluate(() => document.visibilityState)) !== 'visible' || (await p.evaluate(() => window.innerWidth)) === 0) throw new Error('pestaña oculta: la medición no vale')
      await palabra(p, ancho, alto)
      await muestra(p, ancho, alto)
      await cta(p, ancho, alto)
    } catch (err) {
      anotar(false, 'EL BANCO', ancho, `se cayó: ${err instanceof Error ? err.message.split('\n')[0] ?? '' : String(err)}`)
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `l4-panel-${CONTROL === '' ? 'producto' : CONTROL}.json`), JSON.stringify(lineas, null, 2))
  const malas = lineas.filter((l) => l.bien === false).length
  console.log(CONTROL === '' ? `${malas === 0 ? '✓' : '✗'} ${String(lineas.length - malas)} de ${String(lineas.length)}` : `control ${CONTROL}: ${malas > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'} (${String(malas)} fallas)`)
}

void main()
