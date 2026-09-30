/**
 * SPRINT ESCENA 10 — T1 · los cinco momentos, antes y después del cierre: t1-momentos.ts <rótulo> [ancho alto]
 *                                                                        t1-momentos.ts hoja [ancho]
 *
 * Captura los cinco momentos (con el recorrido asentado y verificado del banco de ESCENA 3) del producto tal como está
 * en el servidor, con llamadas y triángulos y los errores de la consola: `antes` se corre con el producto de ESCENA 9 y
 * `despues` con el del cierre. Va a `escena10/t1-cierre/cuadros/<momento>-<ancho>-<rótulo>.png`. Con `hoja`, la hoja de
 * las dos filas rotuladas (`escena10/t1-cierre/hoja-<ancho>.png`).
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { MOMENTOS as NOMBRES, grilla, type Celda } from '../scripts-escena/hojas6'
import { DIR10, PLACA, abrir, carpeta } from './banco'

const ROTULO = process.argv[2] ?? 'despues'
const [ANCHO, ALTO] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]

async function capturar(): Promise<void> {
  const dir = carpeta('t1-cierre/cuadros')
  const b = await abrir('producto', ANCHO, ALTO)
  try {
    const sello = await selloDeCarga(b)
    const filas: unknown[] = []
    for (const momento of MOMENTOS) {
      const c = await capturarMomento(b, momento, sello)
      writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-${ROTULO}.png`, c.png)
      const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
      const fila = { momento: momento.nombre, llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos) }
      filas.push(fila)
      console.log(JSON.stringify(fila))
    }
    const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
    writeFileSync(`${dir}/dibujos-${String(ANCHO)}-${ROTULO}.json`, JSON.stringify({ placa: PLACA, filas, errores }, null, 1))
    if (errores.length > 0) console.log(JSON.stringify({ errores: errores.slice(0, 6) }))
  } finally {
    await b.cerrar()
  }
}

function hoja(): void {
  const ancho = process.argv[3] ?? '1440'
  const d = `${DIR10}/t1-cierre/cuadros`
  const fila = (rotulo: string): Celda[] => NOMBRES.map((m) => ({ archivo: `${d}/${m}-${ancho}-${rotulo}.png`, texto: `${m} - ${rotulo}` }))
  const destino = `${DIR10}/t1-cierre/hoja-${ancho}.png`
  grilla([fila('antes'), fila('despues')], Number(ancho) < 1024 ? 300 : 480, destino)
  console.log(destino)
}

async function principal(): Promise<void> {
  if (ROTULO === 'hoja') hoja()
  else await capturar()
}

if (process.argv[1]?.endsWith('t1-momentos.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
