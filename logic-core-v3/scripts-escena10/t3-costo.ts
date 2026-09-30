/**
 * SPRINT ESCENA 10 — T3 · lo que cuestan los títulos de volumen: t3-costo.ts [ancho alto]
 *
 * En el medio de la ventana de lectura de cada título (`t3-lectura.ts`), sin la prueba y con cada material: el tiempo
 * de GPU de TODOS los dibujos de la página durante 2 s dividido por los cuadros de ese tiempo (el de `t3-costo` de
 * ESCENA 9), la parte de los títulos (por el nombre de su malla), y las llamadas y los triángulos del último cuadro. La
 * placa, la del banco (`BANCO_GPU=alta`: la NVIDIA). Va a `escena10/t3-titulos/costo-<placa>-<ancho>.json`.
 */
import { readFileSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { mover } from '../scripts-escena/banco-escena'
import { FUERA } from '../scripts-escena/clips6'
import { DIR10, PLACA, abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const PEDIDOS = ['producto', 'producto,titulos=negro', 'producto,titulos=blanco']

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
  // La parte de los títulos: una consulta por objeto durante 60 cuadros (por el nombre de su malla).
  const objetos = await g.medir(60, 'objetos')
  const titulos = objetos === null ? null : Object.entries(objetos.pasadas).filter(([n]) => n.startsWith('titulo de volumen')).reduce((s, [, p]) => s + p.ms, 0)
  const d = window.__dibujos
  return { cuadros, gpuMsPorCuadro: +(total / Math.max(1, cuadros)).toFixed(3), titulosMsPorCuadro: titulos === null ? null : +titulos.toFixed(4), llamadas: d.ultimo, triangulos: Math.round(d.ultimosTriangulos) }
})()`

async function principal(): Promise<void> {
  const lectura = JSON.parse(readFileSync(`${DIR10}/t3-titulos/lectura-1440.json`, 'utf8')) as { ventanas: Record<string, { scroll: [number, number] } | null> }
  const momentos: readonly (readonly [string, number])[] = ['portfolio', 'frase-izquierda'].flatMap((id) => {
    const v = lectura.ventanas[id]
    return v === null || v === undefined ? [] : [[id === 'portfolio' ? 'portfolio (noche)' : 'la frase (día)', Math.round((v.scroll[0] + v.scroll[1]) / 2)] as const]
  })
  const salida: Record<string, Record<string, unknown>> = {}
  for (const pedido of PEDIDOS) {
    const b = await abrir(pedido, ANCHO, ALTO)
    const fila: Record<string, unknown> = {}
    try {
      await mover(b, FUERA[0], FUERA[1])
      for (const [nombre, y] of momentos) {
        await scrollHasta(b, y - 400)
        await esperar(600)
        await scrollHasta(b, y)
        await esperar(2500)
        fila[nombre] = await medir(b.p, COSTO)
      }
    } finally {
      await b.cerrar()
    }
    salida[pedido] = fila
    console.log(pedido, JSON.stringify(fila))
  }
  writeFileSync(`${carpeta('t3-titulos')}/costo-${PLACA}-${String(ANCHO)}.json`, JSON.stringify({ placa: PLACA, salida }, null, 1))
}

if (process.argv[1]?.endsWith('t3-costo.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
