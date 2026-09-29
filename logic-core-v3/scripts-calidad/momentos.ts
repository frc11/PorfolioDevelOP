/**
 * SPRINT CALIDAD 1 — los cinco momentos: momentos.ts <ancho> <alto> "<pedido>" <carpeta> <rótulo> [momentos]
 *
 * Captura los momentos (con el recorrido asentado y verificado del banco de ESCENA 3), cuenta llamadas y triángulos
 * y junta los errores de la consola. Va a `calidad1/<carpeta>/cuadros/<momento>-<ancho>-<rótulo>.png`. Es la mitad
 * de cada hoja antes/después: se corre una vez con el pedido de antes (el producto con el punto apagado) y otra con
 * el de después.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const PEDIDO = process.argv[4] ?? 'producto'
const CARPETA = process.argv[5] ?? 'momentos'
const ROTULO = process.argv[6] ?? 'despues'
const QUE = (process.argv[7] ?? 'hero quienes-somos trabajos-de-noche por-que-develop pie').split(' ').filter(Boolean)

async function principal(): Promise<void> {
  const dir = carpeta(`${CARPETA}/cuadros`)
  const b = await abrir(PEDIDO, ANCHO, ALTO)
  try {
    const sello = await selloDeCarga(b)
    const ultimo = MOMENTOS.map((m) => m.nombre).filter((n) => QUE.includes(n)).pop()
    const filas: unknown[] = []
    for (const momento of MOMENTOS) {
      const c = await capturarMomento(b, momento, sello)
      if (!QUE.includes(momento.nombre)) continue
      writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-${ROTULO}.png`, c.png)
      const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
      const fila = { momento: momento.nombre, llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos) }
      filas.push(fila)
      console.log(JSON.stringify(fila))
      if (momento.nombre === ultimo) break
    }
    const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
    writeFileSync(`${dir}/dibujos-${String(ANCHO)}-${ROTULO}.json`, JSON.stringify({ pedido: PEDIDO, filas, errores }, null, 1))
    if (errores.length > 0) console.log(JSON.stringify({ errores: errores.slice(0, 6) }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('momentos.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
