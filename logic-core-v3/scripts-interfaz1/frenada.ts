/**
 * SPRINT INTERFAZ 1 · T1 — scroll rápido y frenada sobre un título: frenada.ts <rótulo> [consulta]
 *
 * Para cada título de la lista: la página quieta con el título entrando por abajo (al 95 % del alto), una ráfaga de la
 * rueda (7 muescas, una cada 16 ms: el gesto de tirar fuerte, que deja el título arriba) y la frenada; se graba hasta 2,5 s después. El clip va a tiempo real y a un
 * cuarto de velocidad (lo que pasa en la frenada dura medio segundo). Encima, la velocidad de Lenis y la inclinación del
 * título en cada cuadro, si la página las publica (`__inerciaDelBanco`, sólo con el texto con inercia).
 * Va a `interfaz1/t1-texto/frenada-<título>-<rótulo>{,-lento}.mp4` y `.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, enCamaraLenta, esperar, grabar, rueda, type Banco } from './banco'

const ROTULO = process.argv[2] ?? 'antes'
const CONSULTA = process.argv[3] ?? ''

/** Los títulos: por dónde se los encuentra (el primero visible que coincida). */
const TITULOS = [
  { id: 'quienes-somos', selector: '[data-panel="quienes-somos"] h2 ~ div' },
  { id: 'tu-panel', selector: '[data-panel="tu-panel"] h2' },
  { id: 'cierre', selector: '[data-panel="cierre"] h2' },
] as const

/** Anota, en cada cuadro, la velocidad que publica la página y la inclinación del título (si existen). */
const ANOTAR = (selector: string): string => `(() => {
  const el = [...document.querySelectorAll('${selector}')].find((e) => e.getBoundingClientRect().height > 2)
  const filas = []
  let seguir = true
  const paso = (t) => {
    const i = window.__inerciaDelBanco ? window.__inerciaDelBanco.estado() : null
    const r = el ? el.getBoundingClientRect() : null
    filas.push([Math.round(t), Math.round(scrollY), r ? Math.round(r.top) : 0, i ? i.velocidad : 0, i ? i.grados : 0])
    if (seguir) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
  window.__anotador = { parar() { seguir = false; return filas } }
})()`

async function unTitulo(b: Banco, dir: string, t: (typeof TITULOS)[number]): Promise<Record<string, unknown>> {
  const y = await medir<number>(b.p, `(() => { const el = [...document.querySelectorAll('${t.selector}')].find((e) => e.getBoundingClientRect().height > 2); const r = el.getBoundingClientRect(); return Math.round(r.top + scrollY) })()`)
  // Llegar con la rueda despacio (Lenis queda en el lugar de verdad) y quedarse quieto.
  const destino = Math.max(0, y - 0.95 * b.alto - 1000)
  await medir(b.p, `window.scrollTo(0, ${String(destino)})`)
  await esperar(1200)
  await rueda(b, 10, 90)
  await esperar(2000)
  await medir(b.p, ANOTAR(t.selector))
  const base = `${dir}/frenada-${t.id}-${ROTULO}`
  const cuadros = await grabar(b, `${base}.cuadros`, async () => {
    await esperar(500)
    await rueda(b, 7, 16)
    await esperar(2500)
  })
  const filas = await medir<number[][]>(b.p, 'window.__anotador.parar()')
  armarClip(`${base}.cuadros`, cuadros, `${base}.mp4`, `T1 frenada · ${t.id} · ${ROTULO}`)
  enCamaraLenta(`${base}.mp4`, `${base}-lento.mp4`)
  return { titulo: t.id, cuadros: cuadros.length, maxGrados: Math.max(0, ...filas.map((f) => Math.abs(f[4]))), maxVelocidad: Math.max(0, ...filas.map((f) => Math.abs(f[3]))), filas }
}

correr(async () => {
  const dir = carpeta('t1-texto')
  const b = await abrir(1440, 900, { consulta: CONSULTA })
  try {
    const salida: Record<string, unknown>[] = []
    for (const t of TITULOS) salida.push(await unTitulo(b, dir, t))
    writeFileSync(`${dir}/frenada-${ROTULO}.json`, JSON.stringify({ rotulo: ROTULO, placa: b.placa, titulos: salida }, null, 1))
    console.log(JSON.stringify(salida.map((s) => ({ titulo: s.titulo, cuadros: s.cuadros, maxGrados: s.maxGrados, maxVelocidad: s.maxVelocidad }))))
  } finally {
    await b.cerrar()
  }
})
