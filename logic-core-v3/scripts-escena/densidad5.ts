/**
 * SPRINT ESCENA 5 — el polvo parejo, antes y después. densidad5.ts <ancho> <alto> [columnas] [filas]
 *
 * Para el polvo de antes (`producto,polvo=antes`) y el de ahora (`producto`), en los 5 momentos del
 * banco (por scroll, asentados y verificados): la captura, y cuántas motas caen en cada zona de una
 * grilla de la pantalla (`window.__polvoDelBanco.contar`, que repite la cuenta del shader). La
 * dispersión entre zonas es el coeficiente de variación (desvío / media): 0 es parejo.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco } from '../scripts-viajes/banco'
import { CONTADOR, DIR5, ESPIA_DE_SALTOS, MOMENTOS, capturarMomento, selloDeCarga } from './banco-escena'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const [COLUMNAS, FILAS] = [Number(process.argv[4] ?? 6), Number(process.argv[5] ?? 4)]
const VARIANTES = [
  ['antes', 'producto,polvo=antes'],
  ['despues', 'producto'],
] as const

function dispersion(zonas: readonly number[]): { total: number; media: number; cv: number; min: number; max: number } {
  const total = zonas.reduce((a, b) => a + b, 0)
  const media = total / zonas.length
  const cv = Math.sqrt(zonas.reduce((s, z) => s + (z - media) ** 2, 0) / zonas.length) / Math.max(media, 1e-9)
  return { total, media: Math.round(media * 10) / 10, cv: Math.round(cv * 1000) / 1000, min: Math.min(...zonas), max: Math.max(...zonas) }
}

async function principal(): Promise<void> {
  const dir = `${DIR5}/densidad/cuadros`
  mkdirSync(dir, { recursive: true })
  const filas: unknown[] = []
  for (const [nombre, pedido] of VARIANTES) {
    const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'; ${CONTADOR}; ${ESPIA_DE_SALTOS}` })
    try {
      const sello = await selloDeCarga(b)
      for (const momento of MOMENTOS) {
        const c = await capturarMomento(b, momento, sello)
        writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-${nombre}.png`, c.png)
        const zonas = await medir<number[]>(b.p, `window.__polvoDelBanco.contar(${String(COLUMNAS)}, ${String(FILAS)})`)
        const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
        const camara = await medir<number[]>(b.p, 'window.__polvoDelBanco.camara()')
        const fila = { polvo: nombre, momento: momento.nombre, ancho: ANCHO, zonas, ...dispersion(zonas), llamadas: dibujos.ultimo, camara }
        filas.push(fila)
        console.log(JSON.stringify(fila))
      }
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${DIR5}/densidad/zonas-${String(ANCHO)}.json`, JSON.stringify(filas, null, 2))
}

principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
