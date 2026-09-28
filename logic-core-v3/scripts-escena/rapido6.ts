/**
 * SPRINT ESCENA 6 — capturas de los momentos: rapido6.ts <ancho> <alto> "<pedido>" "<momentos>" <carpeta>
 * Captura los momentos pedidos (con el mismo recorrido asentado y verificado del banco) y junta los
 * errores de la consola. Va a `~/.cache/b4-medicion/escena6/<carpeta>/`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco } from '../scripts-viajes/banco'
import { CONTADOR, DIR6, ESPIA_DE_SALTOS, MOMENTOS, capturarMomento, selloDeCarga } from './banco-escena'
import { rotuloDe } from './comparar'
import { ERRORES } from './formacion'


const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const PEDIDO = process.argv[4] ?? 'producto'
const QUE = (process.argv[5] ?? 'hero').split(' ').filter(Boolean)
const CARPETA = process.argv[6] ?? 'rapido'

async function principal(): Promise<void> {
  const dir = `${DIR6}/${CARPETA}`
  mkdirSync(dir, { recursive: true })
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${PEDIDO}'; ${CONTADOR}; ${ESPIA_DE_SALTOS}; ${ERRORES}` })
  try {
    const sello = await selloDeCarga(b)
    const ultimo = MOMENTOS.map((m) => m.nombre).filter((n) => QUE.includes(n)).pop()
    for (const momento of MOMENTOS) {
      const c = await capturarMomento(b, momento, sello)
      if (!QUE.includes(momento.nombre)) continue
      writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-${rotuloDe(PEDIDO)}.png`, c.png)
      const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
      const formacion = await medir<unknown>(b.p, 'window.__formacionDelBanco ? { copias: window.__formacionDelBanco.copias, instancias: window.__formacionDelBanco.instancias, triangulos: window.__formacionDelBanco.triangulos, visibles: window.__formacionDelBanco.visibles() } : null')
      console.log(JSON.stringify({ momento: momento.nombre, llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos), formacion }))
      if (momento.nombre === ultimo) break
    }
    const errores = await medir<string[]>(b.p, 'window.__errores')
    if (errores.length > 0) console.log(JSON.stringify({ errores: errores.slice(0, 6) }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('rapido6.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
