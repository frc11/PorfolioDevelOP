/**
 * SPRINT ESCENA 5 — ¿con la cámara quieta hay calma? moire5.ts [segundos]
 *
 * Para el moiré de antes (`producto,moire=hoy`) y el de ahora (`producto`: M1a + M2 + M3 + M4), en el
 * hero, sin cursor ni scroll: una captura por segundo, y entre cada par la diferencia media de luma
 * por bloques de 40 px, en todo el cuadro y en la franja de arriba (la trama del fondo). El polvo es
 * el mismo en las dos cargas, así que la diferencia entre las dos columnas es lo que agrega el moiré.
 * También, qué fracción de los bloques cambió más de 3 niveles.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar } from '../scripts-viajes/banco'
import { DIR5, bloques, foto, mover } from './banco-escena'

const SEGUNDOS = Number(process.argv[2] ?? 12)
const LADO = 40

async function serie(pedido: string): Promise<{ todo: number; arriba: number; cambian: number; velocidad: unknown }> {
  const b = await abrirBanco(1440, 900, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'` })
  try {
    await mover(b, 1400, 880)
    await esperar(4000)
    const tomas: number[][] = []
    for (let i = 0; i <= SEGUNDOS; i += 1) {
      const t0 = Date.now()
      tomas.push(bloques(await foto(b), LADO))
      await esperar(Math.max(0, 1000 - (Date.now() - t0)))
    }
    const columnas = Math.floor(1440 / LADO)
    const filasArriba = Math.floor((900 * 0.3) / LADO)
    let [todo, arriba, cambian, n] = [0, 0, 0, 0]
    for (let i = 1; i < tomas.length; i += 1) {
      const a = tomas[i - 1]
      const c = tomas[i]
      let [s, sArriba, k] = [0, 0, 0]
      for (let j = 0; j < a.length; j += 1) {
        const d = Math.abs(a[j] - c[j])
        s += d
        if (Math.floor(j / columnas) < filasArriba) sArriba += d
        if (d > 3) k += 1
      }
      todo += s / a.length
      arriba += sArriba / (filasArriba * columnas)
      cambian += k / a.length
      n += 1
    }
    const velocidad = await medir<unknown>(b.p, 'window.__moireVivo ?? null')
    return { todo: Math.round((todo / n) * 100) / 100, arriba: Math.round((arriba / n) * 100) / 100, cambian: Math.round((cambian / n) * 1000) / 10, velocidad }
  } finally {
    await b.cerrar()
  }
}

async function principal(): Promise<void> {
  const antes = await serie('producto,moire=hoy')
  const ahora = await serie('producto')
  const fila = { segundos: SEGUNDOS, bloque: LADO, antes, ahora }
  console.log(JSON.stringify(fila))
  writeFileSync(`${DIR5}/moire/calma.json`, JSON.stringify(fila, null, 2))
}

principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
