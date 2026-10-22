/**
 * [NOCTURNO B2] LA LEGIBILIDAD DEL ARO Y SU INTERACCIÓN, contra el dev server (Chrome del sistema, a la vista, `/api/` bloqueado).
 *   BASE=http://localhost:3000 npx tsx scripts-carga/aro-legibilidad.ts            (1440 × 900; ANCHO/ALTO para otro)
 *   MODO=interaccion npx tsx scripts-carga/aro-legibilidad.ts                       (el hover y el clic)
 *
 * LEGIBILIDAD (por defecto): en la lectura (avance 0,65), con el aro frenado por el banco (el mouse sobre la placa del frente, que además
 * la señala), cada tarjeta que se ve (`[data-pieza="resena-del-aro"]` visible): su caja en dos capturas, como se ve y con su texto
 * transparente; en los píxeles que cambian, la razón de contraste del texto contra lo de abajo (WCAG). Se informan el percentil 5, la mediana y
 * el NÚCLEO (percentil 90: los píxeles enteros de la letra). [B2, después de verla] El criterio va sobre el núcleo: el percentil 5 son los
 * bordes antialiaseados de una letra fina (cubiertos un 6 a 10 %) y da ~1,2:1 aunque el texto esté entero (con el 30 % daba 1,13: no
 * separaba). Criterio: núcleo ≥ 4,5:1 en las de adelante. Control: con el texto al 30 % de opacidad el núcleo da < 4,5.
 *
 * INTERACCIÓN: el mouse entra a la placa del frente → `__aroDelBanco().senalada` es su índice, la velocidad cae a ~0 en 1 s y la pastilla
 * «Ver trabajo →» llega a opacidad 1; al salir, la velocidad vuelve. Clic → el hash es `#portfolio-…` y la página quedó en el Portfolio
 * (el panel de Trabajos en el cuadro). El sonido no se mide (el escucha global lo dispara con el clic de un enlace; el tic, el hover).
 */
import { mkdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const MODO = process.env.MODO ?? 'legibilidad'
const ANCHO = Number(process.env.ANCHO ?? 1440)
const ALTO = Number(process.env.ALTO ?? 900)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PERFIL = `C:/Users/Valentino/.cache/b4-medicion/aro-legibilidad-${String(Date.now())}`
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/aro-legibilidad')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const lineal = (c: number): number => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const luz = (d: Buffer, i: number): number => 0.2126 * lineal(d[i]) + 0.7152 * lineal(d[i + 1]) + 0.0722 * lineal(d[i + 2])
const razon = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

interface Contraste {
  readonly p5: number
  readonly mediana: number
  readonly nucleo: number
  readonly pixeles: number
}

async function contrasteDe(p: Page, indice: number, opacidadDelTexto: number | null): Promise<Contraste | null> {
  const caja = (await p.evaluate(`(() => { const r = document.querySelectorAll('[data-pieza="resena-del-aro"]')[${String(indice)}].getBoundingClientRect(); return { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(innerWidth, r.right) - Math.max(0, r.left), height: Math.min(innerHeight, r.bottom) - Math.max(0, r.top) } })()`)) as { x: number; y: number; width: number; height: number }
  if (caja.width < 4 || caja.height < 4) return null
  const marcar = (estilo: string): Promise<unknown> => p.evaluate(`(() => { let s = document.getElementById('aro-banco'); if (!s) { s = document.createElement('style'); s.id = 'aro-banco'; document.head.append(s) } s.textContent = ${JSON.stringify(estilo)} })()`)
  const sel = `[data-pieza="resena-del-aro"]:nth-of-type(${String(indice + 1)})`
  await marcar(opacidadDelTexto === null ? '' : `${sel} span { opacity: ${String(opacidadDelTexto)} }`)
  const con = await sharp(await p.screenshot({ clip: caja })).ensureAlpha().raw().toBuffer()
  await marcar(`${sel} span span { color: transparent !important; } ${sel} [aria-hidden] { visibility: hidden !important; }`)
  const sin = await sharp(await p.screenshot({ clip: caja })).ensureAlpha().raw().toBuffer()
  await marcar('')
  const razones: number[] = []
  for (let i = 0; i < Math.min(con.length, sin.length); i += 4) if (Math.abs(con[i] - sin[i]) + Math.abs(con[i + 1] - sin[i + 1]) + Math.abs(con[i + 2] - sin[i + 2]) > 40) razones.push(razon(luz(con, i), luz(sin, i)))
  if (razones.length < 20) return null
  razones.sort((a, b) => a - b)
  const en = (q: number): number => Math.round(razones[Math.min(razones.length - 1, Math.floor(razones.length * q))] * 100) / 100
  return { p5: en(0.05), mediana: en(0.5), nucleo: en(0.9), pixeles: razones.length }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const ctx = await chromium.launchPersistentContext(PERFIL, { executablePath: CHROME, headless: false, viewport: { width: ANCHO, height: ALTO }, deviceScaleFactor: 1, args: [`--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] })
  await ctx.addInitScript(`(() => { try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ; window.__entornoDeLaEscena = 'producto'; window.__name = window.__name || ((f) => f) })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 240000 })
  await dormir(8000)
  const y = await p.evaluate(`(() => { const pin = document.querySelector('[data-pieza="escenario-del-final"]')?.parentElement; return pin ? Math.round(pin.getBoundingClientRect().top + scrollY + (2.5 + 4 * 0.65) * innerHeight) : null })()`)
  await p.evaluate(`window.scrollTo({ top: ${String(y)}, behavior: 'instant' })`)
  await dormir(4000)
  const banco = (): Promise<{ senalada: number; velocidad: number; legibles: number[] } | null> => p.evaluate('window.__aroDelBanco ? window.__aroDelBanco() : null') as Promise<{ senalada: number; velocidad: number; legibles: number[] } | null>
  const frente = (await p.evaluate(`(() => { const t = [...document.querySelectorAll('[data-pieza="resena-del-aro"]')].filter((a) => a.style.visibility === 'visible'); t.sort((a, b) => Math.abs(a.getBoundingClientRect().left + a.getBoundingClientRect().width / 2 - innerWidth / 2) - Math.abs(b.getBoundingClientRect().left + b.getBoundingClientRect().width / 2 - innerWidth / 2)); const a = t[0]; if (!a) return null; const r = a.getBoundingClientRect(); return { indice: Number(a.dataset.placa), x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)) as { indice: number; x: number; y: number } | null
  if (frente === null) {
    console.log(JSON.stringify({ falla: 'no hay tarjetas visibles en la lectura', y, banco: await banco() }))
    await ctx.close()
    return
  }
  await p.mouse.move(frente.x, frente.y, { steps: 6 })
  await dormir(1200)
  const enHover = await banco()
  const pastilla = await p.evaluate(`getComputedStyle(document.querySelectorAll('[data-pieza="resena-del-aro"]')[${String(frente.indice)}].querySelector('[data-parte="ver-trabajo"]')).opacity`)
  if (MODO === 'interaccion') {
    await p.mouse.move(frente.x, 20, { steps: 6 })
    await dormir(1500)
    const fuera = await banco()
    await p.mouse.move(frente.x, frente.y, { steps: 6 })
    await dormir(600)
    await p.mouse.click(frente.x, frente.y)
    await dormir(2500)
    const destino = await p.evaluate(`(() => { const t = document.querySelector('[data-panel="trabajos"]')?.getBoundingClientRect(); return { hash: location.hash, trabajosEnElCuadro: !!t && t.top < innerHeight && t.bottom > 0 } })()`)
    console.log(JSON.stringify({ modo: MODO, frente, enHover, pastilla, alSalir: fuera, destino }))
  } else {
    const visibles = (await p.evaluate(`[...document.querySelectorAll('[data-pieza="resena-del-aro"]')].map((a, i) => [i, Number(a.style.opacity || 0)]).filter(([, o]) => o > 0.02)`)) as [number, number][]
    const medidas = []
    for (const [i, o] of visibles) medidas.push({ placa: i, opacidad: o, contraste: await contrasteDe(p, i, null) })
    const control = await contrasteDe(p, frente.indice, 0.3)
    // [B2, después de verla] El diagnóstico de la de frente: el color de la cita y su fondo, la opacidad efectiva (el producto por todos los
    // ancestros), la visibilidad, el cuerpo, el texto, su caja y si lo que hay en su centro es ella (nada del DOM la tapa).
    const diagnostico = await p.evaluate(`(() => { const a = document.querySelectorAll('[data-pieza="resena-del-aro"]')[${String(frente.indice)}]; const cita = a.querySelector('span > span'); let o = 1; for (let e = cita; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); const r = a.getBoundingClientRect(); const c = getComputedStyle(cita); const arriba = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { color: c.color, fondo: getComputedStyle(cita.parentElement).backgroundColor, opacidadEfectiva: Math.round(o * 1000) / 1000, visibilidad: c.visibility, cuerpo: c.fontSize, texto: (cita.textContent || '').slice(0, 40), caja: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], encima: !!arriba && a.contains(arriba), transform: a.style.transform.slice(0, 60) } })()`)
    await p.screenshot({ path: path.join(SALIDA, `aro-${String(ANCHO)}.png`) })
    console.log(JSON.stringify({ modo: MODO, cuadro: `${String(ANCHO)}x${String(ALTO)}`, enHover, pastilla, diagnostico, medidas, criterio: medidas.every((x) => x.opacidad < 0.99 || (x.contraste !== null && x.contraste.nucleo >= 4.5)) ? 'ok: las de adelante, núcleo >= 4,5' : 'FALLA: una de adelante con el núcleo < 4,5 (o sin texto)', control: control !== null && control.nucleo < 4.5 ? `ok (núcleo ${String(control.nucleo)}:1 con el texto al 30 %)` : `FALLA: el control dio ${JSON.stringify(control)}` }))
  }
  await ctx.close()
}
void main()
