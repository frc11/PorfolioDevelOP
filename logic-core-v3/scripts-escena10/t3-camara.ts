/**
 * SPRINT ESCENA 10 — T3 · la cámara viva contra la calculada: t3-camara.ts [scroll…]
 *
 * En cada scroll pedido (quieto 2,5 s), la posición y la orientación de la cámara de la escena y las de la cámara que la
 * colocación de los títulos arma para el mismo progreso (la pista del home, sin el mouse ni la inercia).
 */
import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { FUERA } from '../scripts-escena/clips6'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { abrir } from './banco'

async function principal(): Promise<void> {
  const b = await abrir('producto,titulos=negro', 1440, 900)
  try {
    await mover(b, FUERA[0], FUERA[1])
    for (const y of process.argv.slice(2).map(Number)) {
      await scrollHasta(b, y)
      await esperar(2500)
      const c = await medir<{ viva: number[]; calculada: number[] }>(b.p, 'window.__titulosDelBanco.camara()')
      const p = await medir<number>(b.p, 'window.__titulosDelBanco.progreso()')
      console.log(y, p.toFixed(4), 'viva', c.viva.map((v) => v.toFixed(3)).join(' '), '| calculada', c.calculada.map((v) => v.toFixed(3)).join(' '))
    }
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('t3-camara.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
