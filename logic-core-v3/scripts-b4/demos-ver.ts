/**
 * LAS DEMOS, MIRADAS — el CTA apretable, la entrada por el vacío, el estante y
 * la ventana. A 1440 × 900.
 *
 *     npx tsx scripts-b4/demos-ver.ts
 *
 * Sólo lo que pide la aceptación del sprint DEMOS: fotos de cada momento y cinco
 * lecturas (la ruta tipeada, la escala de la capa, el cartel de cada pieza, los
 * cuadros por segundo de la apertura y la página quieta con la ventana abierta).
 * ⚠️ Usa Chrome: tomar el candado antes. Después de cada foto se re-emula.
 */

import { mkdirSync } from 'node:fs'

import { capturar } from './captura'
import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/demos-ver'
const PERFIL = perfilPorId('1440')
const PX_DE_LA_SECCION = 6813
type Pagina = Awaited<ReturnType<typeof abrirPagina>>

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

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
async function tecla(p: Pagina, key: string, code: string, vk: number): Promise<void> {
  await p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk }, p.sessionId)
  await p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk }, p.sessionId)
}
async function foto(p: Pagina, nombre: string): Promise<void> {
  await capturar(p, `${SALIDA}/${nombre}.png`)
  await emular(p, PERFIL)
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/demos-ver-perfil', ancho: PERFIL.ancho, alto: PERFIL.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, PERFIL)
    const t = (await paneles(p)).find((s) => s.id === 'trabajos')
    if (t === undefined) throw new Error('falta trabajos')
    const cero = t.top - PERFIL.alto
    const yDe = (px: number): number => Math.round(cero + (px / PX_DE_LA_SECCION) * t.alto)
    for (let y = cero - 1500; y < yDe(3700); y += 150) await medir<number>(p, `(window.scrollTo(0, ${String(y)}), new Promise((r) => setTimeout(() => r(1), 60)))`)

    // ── FASE 1 · el CTA con el puntero encima ──
    await posarEn(p, yDe(3830))
    await mouse(p, 10, 10)
    await foto(p, '1a-cta-reposo')
    await mouse(p, PERFIL.ancho / 2, PERFIL.alto / 2)
    await esperar(900)
    const ruta = await medir<string>(p, `getComputedStyle(document.querySelector('[data-pieza="ruta-del-cta"]')).clipPath`)
    const alza = await medir<string>(p, `document.querySelector('[data-pieza="cuerpo-de-la-ventana"]').style.transform`)
    console.log(`  CTA encima: ruta ${ruta} · elevación ${alza}`)
    await foto(p, '1b-cta-encima')
    await mouse(p, 10, 10)
    await esperar(700)
    console.log(`  CTA al salir: ruta ${await medir<string>(p, `getComputedStyle(document.querySelector('[data-pieza="ruta-del-cta"]')).clipPath`)}`)

    // ── FASE 2 · la entrada ──
    for (const px of [4100, 4350, 4600, 4860, 5400]) {
      await posarEn(p, yDe(px))
      const escala = await medir<string>(p, `document.querySelector('[data-capa="demos"]').style.transform`)
      const recorte = await medir<string>(p, `getComputedStyle(document.querySelector('[data-pieza="tunel"]')).clipPath.slice(-60)`)
      console.log(`  px ${String(px)}: demos ${escala} · vacío …${recorte}`)
      await foto(p, `2-entrada-${String(px)}`)
    }

    // ── FASE 3 · el estante, pieza por pieza ──
    const piezas = await medir<{ x: number; y: number; slug: string }[]>(
      p,
      `[...document.querySelectorAll('[data-pieza="libro"]')].map((a) => { const r = a.getBoundingClientRect(); return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.6, slug: a.dataset.demo } })`,
    )
    for (const [i, pieza] of piezas.entries()) {
      await mouse(p, pieza.x, pieza.y)
      await esperar(650)
      const texto = await medir<string>(p, `(document.querySelector('[data-parte="del-estante"]')?.textContent ?? '') + ' · visible=' + String(document.querySelector('[data-parte="del-estante"]')?.hasAttribute('data-visible'))`)
      const arriba = await medir<string>(p, `[...document.querySelectorAll('[data-pieza="libro"]')].filter((a) => a.matches(':hover')).map((a) => a.dataset.demo).join(',')`)
      console.log(`  pieza ${pieza.slug}: hover=${arriba} · cartel «${texto}»`)
      if (i === 2) await foto(p, '3-estante-hover')
    }
    const precargas = await medir<string>(p, `[...document.head.querySelectorAll('link[data-demos-precarga]')].map((l) => l.rel + '=' + l.href).join(' | ')`)
    console.log(`  precargas: ${precargas}`)

    // ── FASE 4 · abrir, la página quieta, cerrar con Esc ──
    const yAntes = await medir<number>(p, 'window.scrollY')
    await medir<number>(p, `(window.__cuadros = [], (function t(a) { window.__cuadros.push(a); if (window.__cuadros.length < 90) requestAnimationFrame(t) })(performance.now()), 1)`)
    const abrir = piezas[1]
    await clic(p, abrir.x, abrir.y)
    await esperar(90)
    await foto(p, '4a-liquido')
    await esperar(1500)
    const cuadros = await medir<number[]>(p, 'window.__cuadros')
    const pasos = cuadros.slice(1).map((c, k) => c - cuadros[k]).filter((d) => d > 0)
    const peor = Math.max(...pasos)
    const media = pasos.reduce((a, b) => a + b, 0) / pasos.length
    console.log(`  apertura: ${String(pasos.length)} cuadros · media ${media.toFixed(1)} ms (${(1000 / media).toFixed(0)} fps) · peor ${peor.toFixed(1)} ms`)
    const largos = pasos.map((d, k) => ({ d, en: cuadros[k + 1] - cuadros[0] })).sort((a, b) => b.d - a.d).slice(0, 4)
    console.log(`  los cuadros más largos: ${largos.map((l) => `${l.d.toFixed(0)} ms a los ${l.en.toFixed(0)} ms`).join(' · ')}`)
    await esperar(2500)
    const estado = await medir<string>(p, `JSON.stringify({ dialogo: !!document.querySelector('[role="dialog"]'), overflow: document.documentElement.style.overflow, foco: document.activeElement?.getAttribute('aria-label'), cartel: document.querySelector('[data-pieza="dialogo-de-demo"] [data-pieza="cartel-de-demos"]')?.textContent ?? null, iframes: document.querySelectorAll('iframe').length })`)
    console.log(`  abierta: ${estado}`)
    await foto(p, '4b-abierta')
    // La rueda sobre el velo y sobre la demo: la página no se mueve.
    for (const [x, y] of [[60, 450], [720, 500]] as const) {
      for (let k = 0; k < 6; k += 1) {
        await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: 120, pointerType: 'mouse' }, p.sessionId)
        await esperar(80)
      }
    }
    await esperar(800)
    console.log(`  scroll de la página: antes ${String(yAntes)} · con la ventana abierta y 12 muescas ${String(await medir<number>(p, 'window.scrollY'))}`)
    await foto(p, '4c-demo-scrolleada')
    // Un clic adentro de la demo: se abre el template en otra pestaña.
    const pestanas = async (): Promise<number> =>
      ((await p.conexion.enviar('Target.getTargets', {})) as { targetInfos: { type: string }[] }).targetInfos.filter((x) => x.type === 'page').length
    const antes = await pestanas()
    await clic(p, 720, 520)
    await esperar(1500)
    console.log(`  clic adentro de la demo: pestañas ${String(antes)} → ${String(await pestanas())} · foco ${await medir<string>(p, 'document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.tagName')}`)
    // La pestaña nueva pasa al frente y la nuestra se oculta (sin rAF): se cierra y se vuelve.
    const todas = ((await p.conexion.enviar('Target.getTargets', {})) as { targetInfos: { type: string; targetId: string; url: string }[] }).targetInfos
    for (const x of todas.filter((x) => x.type === 'page' && x.url.includes('netlify.app'))) await p.conexion.enviar('Target.closeTarget', { targetId: x.targetId })
    await p.conexion.enviar('Page.bringToFront', {}, p.sessionId)
    await esperar(800)
    await tecla(p, 'Escape', 'Escape', 27)
    await esperar(1200)
    const despues = await medir<string>(p, `JSON.stringify({ dialogo: !!document.querySelector('[role="dialog"]'), overflow: document.documentElement.style.overflow, foco: document.activeElement?.dataset?.demo ?? document.activeElement?.tagName, iframes: document.querySelectorAll('iframe').length })`)
    console.log(`  cerrada con Esc: ${despues}`)
    await foto(p, '4d-cerrada')

    // ── LOS CUADROS POR SEGUNDO, sin fotos en el medio (una foto re-emula y relayoutea) ──
    await esperar(1200)
    const otra = piezas[5]
    await mouse(p, otra.x, otra.y)
    await esperar(700)
    await medir<number>(p, `(window.__cuadros = [], (function t(a) { window.__cuadros.push(a); if (window.__cuadros.length < 70) requestAnimationFrame(t) })(performance.now()), 1)`)
    await clic(p, otra.x, otra.y)
    await esperar(1400)
    const c2 = await medir<number[]>(p, 'window.__cuadros')
    const p2 = c2.slice(1).map((c, k) => c - c2[k]).filter((d) => d > 0)
    const m2 = p2.reduce((a, b) => a + b, 0) / p2.length
    const l2 = p2.map((d, k) => ({ d, en: c2[k + 1] - c2[0] })).sort((a, b) => b.d - a.d).slice(0, 4)
    console.log(`  apertura limpia: ${String(p2.length)} cuadros · media ${m2.toFixed(1)} ms (${(1000 / m2).toFixed(0)} fps) · más largos ${l2.map((l) => `${l.d.toFixed(0)} ms a los ${l.en.toFixed(0)}`).join(' · ')}`)
    // El círculo rojo cierra, y el foco vuelve a su pieza.
    const rojo = await medir<{ x: number; y: number }>(p, `(() => { const r = document.querySelector('[role="dialog"] button').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)
    await clic(p, rojo.x, rojo.y)
    await esperar(1200)
    console.log(`  cerrada con el rojo: ${await medir<string>(p, `JSON.stringify({ dialogo: !!document.querySelector('[role="dialog"]'), foco: document.activeElement?.dataset?.demo ?? document.activeElement?.tagName, overflow: document.documentElement.style.overflow })`)}`)
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
