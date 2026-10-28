/**
 * [L5] LAS FOTOS Y LAS MEDIDAS DE L5 (cola 3: 70 y 71 de la revisión 3), contra el dev (Chrome del sistema, a la vista, `/api/` bloqueado).
 *   MSYS_NO_PATHCONV=1 BASE=http://localhost:3003 MODO=escritorio npx tsx scripts-carga/l5-fotos.ts      (1440 × 900)
 *   MSYS_NO_PATHCONV=1 BASE=http://localhost:3003 MODO=telefono ANCHO=390 npx tsx scripts-carga/l5-fotos.ts (390 × 844; ANCHO=768: 768 × 1024)
 *
 * ESCRITORIO: el aro en la lectura (sin texto de espaldas, el reflejo del CTA desmontado mientras no llegó) y un arrastre sobre una tarjeta
 * (la selección queda vacía); el pie al fondo, el botón del FAQ (un renglón), el FAQ (la introducción, el aviso centrado: su centro contra el
 * del bloque), una respuesta y el WhatsApp con el mouse encima (la placa se hunde: `__pieDelBanco().faq()`).
 * TELÉFONO: la pista de las reseñas a sangre (su caja contra la ventana), el CTA que llega solo (sin scrollear: el deslizamiento por tiempo)
 * y el FAQ ANTES del pie. Las fotos, en `BANCO_FOTOS/l5-<modo>-<ancho>/` (o en el caché del banco).
 */
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const MODO = process.env.MODO === 'telefono' ? 'telefono' : 'escritorio'
const ANCHO = Number(process.env.ANCHO ?? (MODO === 'telefono' ? 390 : 1440))
const ALTO = MODO === 'telefono' ? (ANCHO >= 768 ? 1024 : 844) : 900
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco(`l5-${MODO}-${String(ANCHO)}`)
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
let n = 0
const foto = async (p: Page, nombre: string): Promise<void> => {
  n += 1
  await p.screenshot({ path: path.join(SALIDA, `${String(n).padStart(2, '0')}-${nombre}.png`) })
}
const y = (p: Page, sel: string): Promise<number | null> => p.evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); return e ? e.getBoundingClientRect().top + scrollY : null })()`) as Promise<number | null>
const ir = (p: Page, top: number): Promise<unknown> => p.evaluate(`window.scrollTo({ top: ${String(Math.round(top))}, behavior: 'instant' })`)

async function escritorio(p: Page): Promise<void> {
  // El aro en la lectura: el bloque clavado de «Por qué develOP» a 2,5 + 0,65 · 4 pantallas de su tope (el tramo de las reseñas).
  const tope = await y(p, '[data-pieza="escenario-del-final"]')
  if (tope === null) throw new Error('sin el escenario del final')
  await ir(p, tope - ALTO * 0.0)
  await dormir(1500)
  const bloque = (await p.evaluate(`(() => { const e = document.querySelector('[data-pieza="escenario-del-final"]').parentElement; return e.getBoundingClientRect().top + scrollY })()`)) as number
  for (let k = 1; k <= 10; k += 1) {
    await ir(p, bloque + ALTO * (2.5 + 0.065 * 4 * k))
    await dormir(120)
  }
  await dormir(4000)
  const lectura = await p.evaluate(`(() => {
    const t = [...document.querySelectorAll('[data-pieza="resena-del-aro"]')].filter((e) => getComputedStyle(e).visibility === 'visible')
    return { tarjetas: t.length, reflejoDelCta: document.querySelectorAll('[data-pieza="cta-en-volumen"] [data-reluciente]').length, sinSeleccion: getComputedStyle(document.querySelector('[data-pieza="capa-del-aro"]')).userSelect, aro: window.__aroDelBanco ? window.__aroDelBanco() : null }
  })()`)
  console.log('lectura', JSON.stringify(lectura))
  await foto(p, 'lectura')
  // Un arrastre sobre la tarjeta del frente: la selección queda vacía.
  const caja = (await p.evaluate(`(() => { const t = [...document.querySelectorAll('[data-pieza="resena-del-aro"]')].filter((e) => getComputedStyle(e).visibility === 'visible').sort((a, b) => Math.abs(a.getBoundingClientRect().left + a.getBoundingClientRect().width / 2 - innerWidth / 2) - Math.abs(b.getBoundingClientRect().left + b.getBoundingClientRect().width / 2 - innerWidth / 2))[0]; if (!t) return null; const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.3 } })()`)) as { x: number; y: number } | null
  if (caja !== null) {
    await p.mouse.move(caja.x, caja.y)
    await p.mouse.down()
    for (let k = 1; k <= 12; k += 1) await p.mouse.move(caja.x - k * 25, caja.y + k * 6)
    await p.mouse.up()
    console.log('arrastre', JSON.stringify({ seleccion: (await p.evaluate('String(window.getSelection())')) as string }))
    await foto(p, 'despues-del-arrastre')
  }
  // El pie al fondo, el botón del FAQ, el FAQ.
  await ir(p, 1e7)
  await dormir(9000)
  const boton = await p.evaluate(`(() => { const b = document.querySelector('[data-bloque-del-faq="boton"]'); if (!b) return null; const r = b.getBoundingClientRect(); const t = b.querySelector('button'); return { opacidad: getComputedStyle(b).opacity, alto: Math.round(r.height), renglones: t ? Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight || '20')) : null, abajo: Math.round(innerHeight - r.bottom) } })()`)
  console.log('boton', JSON.stringify(boton))
  await foto(p, 'pie-con-el-boton')
  await p.evaluate(`document.querySelector('[data-bloque-del-faq="boton"] button')?.click()`)
  for (let k = 0; k < 6; k += 1) {
    await dormir(260)
    await foto(p, `cambio-${String(k)}`)
  }
  await dormir(2500)
  const faq = await p.evaluate(`(() => {
    const d = document.querySelector('[data-bloque-del-faq="respuesta"]')
    const a = d && [...d.querySelectorAll('p')].find((e) => e.offsetParent !== null)
    if (!d || !a) return null
    const [rd, ra] = [d.getBoundingClientRect(), a.getBoundingClientRect()]
    const i = document.querySelector('[data-bloque-del-faq="preguntas"]')
    return { avisoDx: Math.round(ra.left + ra.width / 2 - (rd.left + rd.width / 2)), avisoDy: Math.round(ra.top + ra.height / 2 - (rd.top + rd.height / 2)), intro: i ? (i.textContent || '').includes('Lo que más nos preguntan') : false, preguntas: i ? Math.round(i.getBoundingClientRect().height) : null, respuesta: Math.round(rd.height) }
  })()`)
  console.log('faq', JSON.stringify(faq))
  await foto(p, 'faq')
  await p.evaluate(`document.getElementById('faq-del-pie-pregunta-0')?.click()`)
  for (let k = 0; k < 5; k += 1) {
    await dormir(200)
    await foto(p, `respuesta-${String(k)}`)
  }
  await dormir(2000)
  await foto(p, 'respuesta')
  const wa = (await p.evaluate(`(() => { const w = document.querySelector('[data-bloque-del-faq="whatsapp"] a'); if (!w) return null; const r = w.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)) as { x: number; y: number } | null
  if (wa !== null) {
    const antes = await p.evaluate('window.__pieDelBanco ? window.__pieDelBanco.faq() : null')
    await p.mouse.move(wa.x, wa.y)
    await dormir(600)
    const encima = await p.evaluate('window.__pieDelBanco ? window.__pieDelBanco.faq() : null')
    console.log('whatsapp', JSON.stringify({ antes, encima }))
    await foto(p, 'whatsapp-encima')
  }
}

async function telefono(p: Page): Promise<void> {
  const pista = await y(p, '[data-pieza="resenas-en-lista"] [data-parte="pista"]')
  if (pista === null) throw new Error('sin la pista de las reseñas')
  await ir(p, pista - ALTO * 0.3)
  await dormir(2500)
  const caja = await p.evaluate(`(() => { const u = document.querySelector('[data-pieza="resenas-en-lista"] [data-parte="pista"]'); const r = u.getBoundingClientRect(); return { izquierda: Math.round(r.left), derecha: Math.round(r.right), ventana: innerWidth, desborde: document.documentElement.scrollWidth - innerWidth } })()`)
  console.log('pista', JSON.stringify(caja))
  await foto(p, 'resenas')
  await dormir(3000)
  await foto(p, 'resenas-3s')
  // El CTA: pasado el umbral del bloque clavado (0,25 de su recorrido) y quieto: llega solo.
  const cta = (await p.evaluate(`(() => { const c = document.querySelector('[data-pieza="cta-del-final"]'); const r = c.getBoundingClientRect(); return { top: r.top + scrollY, alto: r.height } })()`)) as { top: number; alto: number }
  await ir(p, cta.top + (cta.alto - ALTO) * 0.08)
  await dormir(1200)
  await ir(p, cta.top + (cta.alto - ALTO) * 0.25)
  await dormir(300)
  await foto(p, 'cta-disparado')
  await dormir(1200)
  await foto(p, 'cta-1-5s')
  await dormir(2000)
  await foto(p, 'cta-llegado')
  // El FAQ antes del pie.
  const orden = await p.evaluate(`(() => { const l = document.querySelector('[data-faq-del-pie="lista"]'); const pie = document.querySelector('[data-pieza="pie"]'); if (!l || !pie) return { lista: !!l, pie: !!pie }; return { faqArriba: l.getBoundingClientRect().bottom <= pie.getBoundingClientRect().top + 1, faq: Math.round(l.getBoundingClientRect().top + scrollY), pie: Math.round(pie.getBoundingClientRect().top + scrollY), fondo: document.documentElement.offsetHeight } })()`)
  console.log('orden', JSON.stringify(orden))
  const faqY = await y(p, '[data-faq-del-pie="lista"]')
  if (faqY !== null) {
    await ir(p, faqY - 40)
    await dormir(1500)
    await foto(p, 'faq')
  }
  await ir(p, 1e7)
  await dormir(5000)
  await foto(p, 'pie')
}

async function main(): Promise<void> {
  const movil = MODO === 'telefono'
  const ctx = await chromium.launchPersistentContext(perfilDelBanco('l5-fotos'), {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    isMobile: movil,
    hasTouch: movil,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', `--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  try {
    await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
    await p.mouse.move(ANCHO / 2, ALTO / 2)
    await dormir(7000)
    console.log(`${MODO} ${String(ANCHO)}×${String(ALTO)} · visible: ${String(await p.evaluate('document.visibilityState'))} · ancho ${String(await p.evaluate('innerWidth'))}`)
    if (movil) await telefono(p)
    else await escritorio(p)
  } finally {
    await ctx.close()
  }
}

void main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
