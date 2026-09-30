/**
 * SPRINT ESCENA 9 — T3 · lo que cuesta cada prueba: t3-costo.ts [ancho alto] [pedidos separados por punto y coma]
 *
 * El tiempo de GPU de TODOS los dibujos de la página (la escena, las simulaciones, el mapa de la sombra, los pasos del
 * posproceso) durante 2 s en cada momento, dividido por los cuadros que la página dio en ese tiempo: el costo por cuadro,
 * con cada prueba y sin ninguna. Los pasos del posproceso van en otros `render` que la escena, así que la cuenta por
 * cuadro de `motor.ts` los repartiría mal; la suma total no. La página corre (el polvo se mueve): es una media de ~150
 * cuadros por momento. Va a `escena9/t3-material-y-luz/costo-<ancho>.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
export const PEDIDOS_DEL_COSTO = (process.argv[4] ?? 'producto;producto,material=brillante;producto,sombra-logo;producto,bloom;producto,aa=taa;producto,aa=msaa8;producto,tono=agx;producto,logo-noche=grueso').split(';')

const COSTO = `(async () => {
  const g = window.__gpuDelBanco
  let cuadros = 0
  let sigue = true
  const contar = () => { if (!sigue) return; cuadros += 1; requestAnimationFrame(contar) }
  requestAnimationFrame(contar)
  g.grabar()
  await new Promise((r) => setTimeout(r, 2000))
  sigue = false
  const lista = await g.parar()
  const total = lista.reduce((s, [, ms]) => s + (Number.isFinite(ms) ? ms : 0), 0)
  return { cuadros, gpuMsPorCuadro: +(total / Math.max(1, cuadros)).toFixed(3), disjuntos: lista.filter(([, ms]) => !Number.isFinite(ms)).length }
})()`

async function principal(): Promise<void> {
  const salida: Record<string, Record<string, unknown>> = {}
  for (const pedido of PEDIDOS_DEL_COSTO) {
    const b = await abrir(pedido, ANCHO, ALTO)
    const fila: Record<string, unknown> = {}
    try {
      const sello = await selloDeCarga(b)
      for (const m of MOMENTOS) {
        await capturarMomento(b, m, sello)
        fila[m.nombre] = await medir(b.p, COSTO)
      }
      const pie = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * 0.12) })()`)
      await scrollHasta(b, pie)
      await medir(b.p, 'window.__amanecerDelBanco.congelar(4.9)')
      await esperar(2500)
      fila['rayos del amanecer'] = await medir(b.p, COSTO)
      await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
    } finally {
      await b.cerrar()
    }
    salida[pedido] = fila
    console.log(pedido, JSON.stringify(Object.fromEntries(Object.entries(fila).map(([k, v]) => [k, (v as { gpuMsPorCuadro: number }).gpuMsPorCuadro]))))
  }
  writeFileSync(`${carpeta('t3-material-y-luz')}/costo-${String(ANCHO)}.json`, JSON.stringify(salida, null, 1))
}

if (process.argv[1]?.endsWith('t3-costo.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
