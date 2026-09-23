/**
 * LA RÁFAGA — qué hace el túnel cuando alguien scrollea desesperado.
 *
 *     npx tsx scripts-b4/s10-rafaga.ts                 (las tres pruebas)
 *     SALIDA_DE_RAFAGA=antes npx tsx scripts-b4/s10-rafaga.ts
 *
 * Tres pruebas, las tres con muescas de rueda reales:
 *
 *   A · **la ráfaga**: 10 muescas cada 15 ms justo al arrancar el túnel. Se graba
 *       cuadro por cuadro cuánto túnel se MUESTRA —leído de las escalas de las
 *       capas, no del scroll— y se reporta qué fracción recorre en 150, 300, 500,
 *       1.000 y 2.000 ms, y la velocidad más alta en ventanas de 100 ms.
 *   B · **el desesperado**: muescas cada 15 ms desde el arranque del túnel hasta
 *       pasar el final de la sección. Se anota el estado MOSTRADO en el instante
 *       en que el scroll cruza el despineado: si el túnel o la salida quedaron a
 *       medio camino, eso es lo que ve alguien al salir del pin.
 *   C · **la vuelta desesperada**: muescas hacia ARRIBA cada 15 ms desde la
 *       espera del CTA hasta pasar el tope del pin. Cuadro por cuadro se anota si
 *       el cartel se ve con alguna capa del túnel todavía en escala mayor que 0 —
 *       Portfolio encima del túnel, que es lo que no puede pasar—, y el estado
 *       mostrado al cruzar el tope.
 *
 * El avance mostrado se reconstruye de la capa que esté en su rampa: su escala
 * propia, invertida con la tabla, da el píxel del túnel sin ambigüedad.
 */

import { writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const PERFIL = perfilPorId('1440')
const ETIQUETA = process.env.SALIDA_DE_RAFAGA ?? 'despues'
const SALIDA = `C:/Users/Valentino/.cache/b4-medicion/s10-rafaga-${ETIQUETA}.json`
const PX_DEL_TUNEL = 1480

type Pagina = Awaited<ReturnType<typeof abrirPagina>>

/** Un recolector que corre en la página: cada cuadro, scroll y lo que se muestra. */
const RECOLECTOR = `(() => {
  const RAMPAS = { 'proyecto-0': [0.9, 810, 1720], 'proyecto-1': [1.2, 1303, 1983], 'proyecto-2': [1.05, 1636, 2236], cta: [0.4, 1873, 2290] }
  const escalaDe = (el) => { const m = /matrix\\(([-0-9.e]+)/.exec(getComputedStyle(el).transform || ''); return m === null ? 1 : Number(m[1]) }
  const tunelMostrado = () => {
    for (const [rol, [a, arranca, topa]] of Object.entries(RAMPAS)) {
      const el = document.querySelector('[data-capa="' + rol + '"]')
      if (el === null) continue
      const s = escalaDe(el)
      if (s > 1e-6 && s < a - 1e-6) return arranca - 810 + (s / a) * (topa - arranca)
    }
    const c = document.querySelector('[data-capa="cta"]')
    if (c !== null && escalaDe(c) >= 0.4 - 1e-6) return ${String(PX_DEL_TUNEL)}
    return 0
  }
  const cartel = () => { const el = document.querySelector('[data-pieza="cartel"]'); if (el === null) return 0; const cs = getComputedStyle(el); return cs.visibility === 'hidden' ? 0 : Number(cs.opacity) }
  const capaMayor = () => Math.max(...['proyecto-0', 'proyecto-1', 'proyecto-2', 'cta'].map((r) => { const el = document.querySelector('[data-capa="' + r + '"]'); return el === null ? 0 : escalaDe(el) }))
  const capa = () => { const el = document.querySelector('[data-pieza="tunel"]'); const m = el === null ? null : /translateY\\(([-0-9.]+)px\\)/.exec(el.style.transform || ''); return m === null ? 0 : Number(m[1]) }
  const muestras = []
  const t0 = performance.now()
  window.__rafaga = muestras
  const cuadro = () => {
    muestras.push({ t: performance.now() - t0, y: window.scrollY, tunel: tunelMostrado(), salida: capa(), cartel: cartel(), capaMayor: capaMayor() })
    if (performance.now() - t0 < 6000) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
  return 1
})()`

async function muescas(p: Pagina, cuantas: number, cadaMs: number, deltaY = 100): Promise<void> {
  for (let k = 0; k < cuantas; k += 1) {
    await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY, modifiers: 0, pointerType: 'mouse' }, p.sessionId)
    await new Promise((r) => setTimeout(r, cadaMs))
  }
}

async function posarEn(p: Pagina, y: number): Promise<void> {
  await medir<number>(p, `(async () => { const h = performance.now() + 4000; while (performance.now() < h) { window.scrollTo(0, ${String(y)}); await new Promise((r) => setTimeout(r, 40)) } return 1 })()`)
}

interface Muestra {
  readonly t: number
  readonly y: number
  readonly tunel: number
  readonly salida: number
  readonly cartel: number
  readonly capaMayor: number
}

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/s10-rafaga', ancho: PERFIL.ancho, alto: PERFIL.alto + 120 })
  const informe: Record<string, unknown> = {}
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, PERFIL)
    const trabajos = (await paneles(p)).find((s) => s.id === 'trabajos')
    if (trabajos === undefined) throw new Error('falta trabajos')
    const arranqueDelTunel = trabajos.top + 950
    const despineado = trabajos.top + trabajos.alto - PERFIL.alto

    // ── A · LA RÁFAGA ─────────────────────────────────────────────────────
    await posarEn(p, arranqueDelTunel)
    await medir<number>(p, RECOLECTOR)
    await muescas(p, 10, 15)
    await medir<number>(p, 'new Promise((r) => setTimeout(() => r(1), 3500))')
    const a = await medir<Muestra[]>(p, 'window.__rafaga')
    const base = a[0]
    const en = (ms: number): Muestra => a.find((m) => m.t >= ms) ?? a[a.length - 1]
    const filas = [150, 300, 500, 1000, 2000].map((ms) => {
      const m = en(ms)
      return { ms, scroll: m.y - base.y, tunel: m.tunel - base.tunel, fraccion: (m.tunel - base.tunel) / PX_DEL_TUNEL }
    })
    let pico = 0
    for (const m of a) {
      const antes = a.find((x) => x.t >= m.t - 100)
      if (antes !== undefined && m.t - antes.t > 50) pico = Math.max(pico, ((m.tunel - antes.tunel) / (m.t - antes.t)) * 1000)
    }
    console.log(`\nA · RÁFAGA de 10 muescas cada 15 ms, desde el arranque del túnel (y=${String(Math.round(arranqueDelTunel))})`)
    for (const f of filas) {
      console.log(`  a los ${String(f.ms).padStart(4)} ms  scroll +${String(Math.round(f.scroll)).padStart(5)} px   túnel mostrado +${String(Math.round(f.tunel)).padStart(5)} px = ${(f.fraccion * 100).toFixed(1).padStart(5)} % del túnel`)
    }
    console.log(`  velocidad más alta del túnel mostrado (ventanas de 100 ms): ${pico.toFixed(0)} px/s`)
    informe.rafaga = { filas, picoPxPorS: pico }

    // ── B · EL DESESPERADO ────────────────────────────────────────────────
    await posarEn(p, arranqueDelTunel)
    await medir<number>(p, RECOLECTOR)
    const cuantas = Math.ceil((despineado - arranqueDelTunel + 1200) / 100)
    await muescas(p, cuantas, 15)
    await medir<number>(p, 'new Promise((r) => setTimeout(() => r(1), 2500))')
    const b = await medir<Muestra[]>(p, 'window.__rafaga')
    const alDespinear = b.find((m) => m.y >= despineado) ?? null
    console.log(`\nB · DESESPERADO: ${String(cuantas)} muescas cada 15 ms, del arranque del túnel hasta pasar el despineado (y=${String(Math.round(despineado))})`)
    if (alDespinear === null) {
      console.log('  el scroll no llegó al despineado')
    } else {
      console.log(`  al cruzar el despineado (t=${alDespinear.t.toFixed(0)} ms): túnel mostrado ${alDespinear.tunel.toFixed(0)} de ${String(PX_DEL_TUNEL)} px · salida ${alDespinear.salida.toFixed(0)} de -1131 px`)
    }
    informe.desesperado = { cuantas, despineado, alDespinear }

    // ── C · LA VUELTA DESESPERADA ─────────────────────────────────────────
    const tope = trabajos.top
    // La espera del CTA: el túnel termina en tope + 2.430 y la salida arranca en tope + 2.982.
    await posarEn(p, trabajos.top + 2700)
    await medir<number>(p, RECOLECTOR)
    const cuantasC = Math.ceil((trabajos.top + 2700 - tope + 600) / 100)
    await muescas(p, cuantasC, 15, -100)
    await medir<number>(p, 'new Promise((r) => setTimeout(() => r(1), 2500))')
    const c = await medir<Muestra[]>(p, 'window.__rafaga')
    const encima = c.filter((m) => m.cartel > 0.001 && m.capaMayor > 1e-6)
    const alTope = c.find((m) => m.y <= tope) ?? null
    console.log(`\nC · VUELTA DESESPERADA: ${String(cuantasC)} muescas hacia arriba cada 15 ms, de la espera del CTA hasta pasar el tope del pin (y=${String(Math.round(tope))})`)
    console.log(`  cuadros con el cartel visible y alguna capa del túnel en escala > 0: ${String(encima.length)} de ${String(c.length)}`)
    if (alTope !== null) console.log(`  al cruzar el tope (t=${alTope.t.toFixed(0)} ms): capa más grande en escala ${alTope.capaMayor.toFixed(4)} · cartel en opacidad ${alTope.cartel.toFixed(3)}`)
    informe.vuelta = { cuantas: cuantasC, tope, encima: encima.length, cuadros: c.length, alTope }
    writeFileSync(SALIDA, JSON.stringify({ ...informe, crudoA: a, crudoB: b, crudoC: c }, null, 1))
    console.log(`\ncrudo en ${SALIDA}`)
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
