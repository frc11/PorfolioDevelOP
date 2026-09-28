/**
 * SPRINT ESCENA 7 — capturas de los momentos: rapido7.ts <ancho> <alto> "<pedido>" "<momentos>" <carpeta> [rótulo]
 * Captura los momentos pedidos (con el recorrido asentado y verificado del banco), cuenta las
 * llamadas y los triángulos, y junta los errores de la consola. Va a `escena7/<carpeta>/`, con el
 * nombre `<momento>-<ancho>-<rótulo>.png` (el rótulo es el pedido si no se da otro).
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from './banco-escena'
import { abrir7, carpeta7 } from './banco7'
import { rotuloDe } from './comparar'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const PEDIDO = process.argv[4] ?? 'producto'
const QUE = (process.argv[5] ?? 'hero').split(' ').filter(Boolean)
const CARPETA = process.argv[6] ?? 'rapido'
const ROTULO = process.argv[7] ?? rotuloDe(PEDIDO)

async function principal(): Promise<void> {
  const dir = carpeta7(CARPETA)
  const b = await abrir7(PEDIDO, ANCHO, ALTO)
  try {
    const sello = await selloDeCarga(b)
    const ultimo = MOMENTOS.map((m) => m.nombre).filter((n) => QUE.includes(n)).pop()
    for (const momento of MOMENTOS) {
      const c = await capturarMomento(b, momento, sello)
      if (!QUE.includes(momento.nombre)) continue
      writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-${ROTULO}.png`, c.png)
      const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
      const formacion = await medir<unknown>(b.p, 'window.__formacionDelBanco ? { copias: window.__formacionDelBanco.copias, triangulos: window.__formacionDelBanco.triangulos, visibles: window.__formacionDelBanco.visibles() } : null')
      console.log(JSON.stringify({ momento: momento.nombre, llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos), formacion }))
      if (momento.nombre === ultimo) break
    }
    const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
    if (errores.length > 0) console.log(JSON.stringify({ errores: errores.slice(0, 6) }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('rapido7.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
