/**
 * SPRINT ESCENA 10 — T3 · cuándo se lee cada título: t3-lectura.ts [ancho alto]
 *
 * Recorre Trabajos y Por qué develOP de a 60 px (quieto 350 ms en cada paso) con la prueba prendida y anota, en cada
 * paso, el progreso de la coreografía y cuánto llegó y cuánto se fue cada título. La ventana de lectura de un título
 * es donde llegó entero y todavía no se fue; su medio es el progreso con cuya cámara se coloca. Va a
 * `escena10/t3-titulos/lectura-<ancho>.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

interface Paso {
  readonly y: number
  readonly progreso: number
  readonly titulos: readonly { readonly id: string; readonly llegada: number; readonly salida: number }[]
}

async function principal(): Promise<void> {
  const b = await abrir('producto,titulos=negro', ANCHO, ALTO)
  const pasos: Paso[] = []
  try {
    for (const panel of ['trabajos', 'por-que-develop']) {
      const { tope, alto } = await medir<{ tope: number; alto: number }>(b.p, `(() => { const r = document.querySelector('[data-panel="${panel}"]').getBoundingClientRect(); return { tope: Math.round(r.top + scrollY), alto: Math.round(r.height) } })()`)
      for (let y = tope - ALTO; y <= tope + alto; y += 60) {
        await scrollHasta(b, y)
        await esperar(350)
        pasos.push(await medir<Paso>(b.p, `({ y: ${String(y)}, progreso: window.__titulosDelBanco.progreso(), titulos: window.__titulosDelBanco.titulos().map((t) => ({ id: t.id, llegada: t.llegada, salida: t.salida })) })`))
      }
    }
  } finally {
    await b.cerrar()
  }
  const ventanas: Record<string, unknown> = {}
  for (const id of ['portfolio', 'frase-izquierda', 'frase-derecha']) {
    const leidos = pasos.filter((p) => p.titulos.some((t) => t.id === id && t.llegada >= 0.999 && t.salida <= 0.001))
    if (leidos.length === 0) {
      ventanas[id] = null
      continue
    }
    const [desde, hasta] = [leidos[0].progreso, leidos[leidos.length - 1].progreso]
    ventanas[id] = { desde, hasta, medio: (desde + hasta) / 2, scroll: [leidos[0].y, leidos[leidos.length - 1].y] }
  }
  console.log(JSON.stringify(ventanas))
  writeFileSync(`${carpeta('t3-titulos')}/lectura-${String(ANCHO)}.json`, JSON.stringify({ ventanas, pasos }, null, 1))
}

if (process.argv[1]?.endsWith('t3-lectura.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
