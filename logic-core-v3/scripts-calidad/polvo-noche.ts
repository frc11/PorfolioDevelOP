/**
 * SPRINT CALIDAD 1 — el polvo al llegar a la noche de Trabajos: polvo-noche.ts <rótulo> [ancho alto]
 *
 * La MISMA llegada que usan las hojas (el momento «trabajos-de-noche» del banco de ESCENA): 1) cuántas motas hay en
 * cada modo de la física cada 250 ms durante 12 s desde que se llega (cuándo se posa el polvo); 2) otra llegada con la
 * espera de las hojas (`asentada`): cuánto esperó y en qué modos estaban las motas al capturar. Para saber si la
 * diferencia de la hoja entre la base y la final es del polvo o del instante de la captura.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { MOMENTOS, asentada } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'

const ROTULO = process.argv[2] ?? 'final'
const [ANCHO, ALTO] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]

async function principal(): Promise<void> {
  const b = await abrir('producto', ANCHO, ALTO)
  const noche = MOMENTOS[2]
  const salida: Record<string, unknown> = { rotulo: ROTULO }
  try {
    await esperar(3000)
    const y = await noche.y(b)
    await scrollHasta(b, y)
    const serie: { s: number; modos: number[] }[] = []
    const t0 = Date.now()
    while (Date.now() - t0 < 12000) {
      serie.push({ s: Math.round((Date.now() - t0) / 100) / 10, modos: await medir<number[]>(b.p, 'window.__fisicaDelBanco.modos()') })
      await esperar(250)
    }
    salida.serie = serie
    await scrollHasta(b, 0)
    await esperar(4000)
    await scrollHasta(b, y)
    const q = await asentada(b)
    salida.asentada = { ms: q.ms, intentos: q.intentos, modos: await medir<number[]>(b.p, 'window.__fisicaDelBanco.modos()') }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta('final')}/polvo-noche-${String(ANCHO)}-${ROTULO}.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida))
}

if (process.argv[1]?.endsWith('polvo-noche.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
