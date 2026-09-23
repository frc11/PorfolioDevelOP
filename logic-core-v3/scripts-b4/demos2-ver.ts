/**
 * SPRINT DEMOS 2, MIRADO — el Genie, la llegada escalonada y las ocho demos.
 *
 *     npx tsx scripts-b4/demos2-ver.ts
 *
 * Sólo lo que pide la aceptación:
 *   1. los cuadros por segundo del Genie, abriendo y cerrando, SIN fotos en el
 *      medio (una foto re-emula y relayoutea: mete un cuadro largo que no es suyo);
 *   2. las dos tiras de contacto —la apertura y el cierre— sacadas del screencast,
 *      que entrega los cuadros que el navegador de verdad pintó;
 *   3. la llegada: fotos en cinco puntos del recorrido del vacío;
 *   4. el estante de ocho a 1440 y a 1280: ¿entra en su columna?;
 *   5. el sitio vivo: /web-development con las ocho y la última abriendo su preview.
 *
 * ⚠️ Usa Chrome: tomar el candado antes. Después de cada foto se re-emula.
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { capturar } from './captura'
import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId, type Perfil } from './perfiles'
import { paneles } from './sitio'

const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/demos2-ver'
const PX_DE_LA_SECCION = 6813
/** El vacío en px de la sección a 900: nace en 3.882 y llena el cuadro 969 px después. */
const VACIO = { desde: 3882, largo: 969 } as const
type Pagina = Awaited<ReturnType<typeof abrirPagina>>

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const ALTO_1280: Perfil = { ...perfilPorId('1440'), id: '1280', nombre: '1280 × 800', procedencia: 'la otra punta del escritorio', ancho: 1280, alto: 800 }

async function posarEn(p: Pagina, y: number, ms = 3000): Promise<void> {
  await medir<number>(p, `(async () => { const h = performance.now() + ${String(ms)}; while (performance.now() < h) { window.scrollTo(0, ${String(y)}); await new Promise((r) => setTimeout(r, 40)) } return 1 })()`)
}
async function mouse(p: Pagina, x: number, y: number): Promise<void> {
  await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, pointerType: 'mouse' }, p.sessionId)
}
async function clic(p: Pagina, x: number, y: number): Promise<void> {
  await mouse(p, x, y)
  await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }, p.sessionId)
  await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }, p.sessionId)
}
async function foto(p: Pagina, perfil: Perfil, nombre: string): Promise<void> {
  await capturar(p, `${SALIDA}/${nombre}.png`)
  await emular(p, perfil)
}
const RAF = `(window.__cuadros = [], (function t(a) { window.__cuadros.push(a); if (window.__cuadros.length < 60) requestAnimationFrame(t) })(performance.now()), 1)`
async function leerCuadros(p: Pagina, nombre: string): Promise<void> {
  const c = await medir<number[]>(p, 'window.__cuadros')
  const pasos = c.slice(1).map((x, k) => x - c[k]).filter((d) => d > 0)
  const media = pasos.reduce((a, b) => a + b, 0) / pasos.length
  const largos = pasos.map((d, k) => ({ d, en: c[k + 1] - c[0] })).filter((x) => x.d > 20)
  console.log(`  ${nombre}: ${String(pasos.length)} cuadros · media ${media.toFixed(1)} ms (${(1000 / media).toFixed(0)} fps) · peor ${Math.max(...pasos).toFixed(1)} ms · ${String(largos.length)} de más de 20 ms: ${largos.map((x) => `${x.d.toFixed(0)} ms a los ${x.en.toFixed(0)}`).join(', ')}`)
}

/** Llega a los demos de a muescas —la noche sólo se dispara cruzando su línea— y devuelve el mapeo. */
async function aLosDemos(p: Pagina, perfil: Perfil): Promise<(px: number) => number> {
  const t = (await paneles(p)).find((s) => s.id === 'trabajos')
  if (t === undefined) throw new Error('falta trabajos')
  const cero = t.top - perfil.alto
  const yDe = (px: number): number => Math.round(cero + (px / PX_DE_LA_SECCION) * t.alto)
  for (let y = cero - 1500; y < yDe(3700); y += 150) await medir<number>(p, `(window.scrollTo(0, ${String(y)}), new Promise((r) => setTimeout(() => r(1), 60)))`)
  return yDe
}

async function elGenie(p: Pagina, perfil: Perfil, yDe: (px: number) => number): Promise<void> {
  await posarEn(p, yDe(5400))
  const piezas = await medir<{ x: number; y: number; slug: string }[]>(p, `[...document.querySelectorAll('[data-pieza="libro"]')].map((a) => { const r = a.getBoundingClientRect(); return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.6, slug: a.dataset.demo } })`)
  // 1 · fps, sin fotos.
  const pieza = piezas[2]
  await mouse(p, pieza.x, pieza.y)
  await esperar(700)
  await medir<number>(p, RAF)
  await clic(p, pieza.x, pieza.y)
  await esperar(1200)
  await leerCuadros(p, `Genie abriendo (${pieza.slug})`)
  await esperar(1500)
  const cruz = await medir<{ x: number; y: number }>(p, `(() => { const b = [...document.querySelectorAll('[role="dialog"] button')].pop(); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)
  await medir<number>(p, RAF)
  await clic(p, cruz.x, cruz.y)
  await esperar(1200)
  await leerCuadros(p, 'Genie cerrando')
  console.log(`  cerrada: ${await medir<string>(p, `JSON.stringify({ dialogo: !!document.querySelector('[role="dialog"]'), foco: document.activeElement?.dataset?.demo ?? document.activeElement?.tagName })`)}`)
  await esperar(800)

  // 2 · las tiras de contacto, del screencast.
  const cuadros: { t: number; data: string }[] = []
  p.conexion.al('Page.screencastFrame', (params) => {
    const meta = params.metadata as { timestamp?: number } | undefined
    cuadros.push({ t: meta?.timestamp ?? Date.now() / 1000, data: params.data as string })
    void p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId as number }, p.sessionId)
  })
  const otra = piezas[6]
  await mouse(p, otra.x, otra.y)
  await esperar(900)
  await p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: perfil.ancho, maxHeight: perfil.alto, everyNthFrame: 1 }, p.sessionId)
  await esperar(400)
  const abre = Date.now() / 1000
  await clic(p, otra.x, otra.y)
  await esperar(1500)
  const cierraEn = Date.now() / 1000
  await p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, p.sessionId)
  await p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, p.sessionId)
  await esperar(1200)
  await p.conexion.enviar('Page.stopScreencast', {}, p.sessionId)
  await esperar(300)
  mkdirSync(`${SALIDA}/tira`, { recursive: true })
  const guardar = (desde: number, nombre: string): void => {
    const tramo = cuadros.filter((c) => c.t >= desde - 0.05 && c.t <= desde + 0.75)
    const elegidos = Array.from({ length: 8 }, (_, k) => tramo[Math.min(tramo.length - 1, Math.round((k * (tramo.length - 1)) / 7))])
    elegidos.forEach((c, k) => {
      if (c !== undefined) writeFileSync(`${SALIDA}/tira/${nombre}-${String(k)}.jpg`, Buffer.from(c.data, 'base64'))
    })
    console.log(`  tira «${nombre}»: ${String(tramo.length)} cuadros pintados en 750 ms, 8 elegidos`)
  }
  guardar(abre, 'apertura')
  guardar(cierraEn, 'cierre')
}

async function laLlegada(p: Pagina, perfil: Perfil, yDe: (px: number) => number): Promise<void> {
  for (const u of [0.5, 0.64, 0.78, 0.9, 1]) {
    await posarEn(p, yDe(VACIO.desde + u * VACIO.largo))
    await foto(p, perfil, `llegada-${String(Math.round(u * 100))}`)
  }
}

async function elEstante(perfil: Perfil): Promise<void> {
  const chrome = await lanzarChrome({ perfil: `C:/Users/Valentino/.cache/b4-medicion/demos2-${perfil.id}`, ancho: perfil.ancho, alto: perfil.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, perfil)
    const yDe = await aLosDemos(p, perfil)
    // Largo: el regulador limita la velocidad del efecto, y de 3.700 a 5.400 son 1.700 px.
    await posarEn(p, yDe(5400), 9000)
    const r = await medir<string>(p, `(() => { const e = document.querySelector('[data-pieza="estante"]'); const col = e.parentElement.getBoundingClientRect(); const ls = [...e.querySelectorAll('[data-pieza="libro"]')].map((a) => a.getBoundingClientRect()); return JSON.stringify({ columna: [Math.round(col.left), Math.round(col.right)], libros: ls.length, primero: Math.round(ls[0].left), ultimo: Math.round(ls[ls.length - 1].right), ancho: Math.round(ls[0].width), paso: Math.round(ls[1].left - ls[0].left) }) })()`)
    console.log(`  estante a ${perfil.id}: ${r}`)
    await foto(p, perfil, `estante-${perfil.id}`)
    if (perfil.id === '1440') {
      await laLlegada(p, perfil, yDe)
      await elGenie(p, perfil, yDe)
    }
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

async function elSitioVivo(): Promise<void> {
  const perfil = perfilPorId('1440')
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/demos2-vivo', ancho: perfil.ancho, alto: perfil.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, 'http://localhost:3000/web-development', { marcaDeIntro: false })
    await esperar(4000)
    // La sección de templates: 8 pantallas pegajosas. Se llega a la última de a muescas.
    const destino = await medir<number>(p, `(() => { const s = [...document.querySelectorAll('section')].find((x) => x.textContent.includes('Templates inmersivos')); return s ? s.getBoundingClientRect().top + window.scrollY + s.offsetHeight - window.innerHeight - 5 : -1 })()`)
    if (destino < 0) throw new Error('no encontré la sección de templates')
    await medir<number>(p, `(async () => { for (let y = ${String(destino - 7200)}; y <= ${String(destino)}; y += 120) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)) } return 1 })()`)
    await esperar(6000)
    const estado = await medir<string>(p, `(() => { const s = [...document.querySelectorAll('section')].find((x) => x.textContent.includes('Templates inmersivos')); const tarjetas = s.querySelectorAll('article'); const activa = [...tarjetas].find((a) => a.getAttribute('aria-hidden') === 'false'); return JSON.stringify({ tarjetas: tarjetas.length, contador: (s.textContent.match(/\\d\\d \\/ \\d\\d/) ?? [''])[0], activa: activa?.querySelector('h3')?.textContent, iframe: activa?.querySelector('iframe')?.getAttribute('src') }) })()`)
    console.log(`  sitio vivo: ${estado}`)
    await foto(p, perfil, 'sitio-vivo-web-development')
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  await elEstante(ALTO_1280)
  await elEstante(perfilPorId('1440'))
  await elSitioVivo()
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
