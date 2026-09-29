/**
 * SPRINT CALIDAD 1 — una sonda rápida: sonda.ts <ancho> <alto> "<pedido>" "<expresión>" [esperaMs] [scroll]
 *
 * Abre /v3 con el pedido, espera, (opcional) scrollea a `scroll` px, y evalúa la expresión en la página (puede ser
 * asíncrona). Imprime el resultado y los errores de la consola. Para comprobar que una escena compila y leer los
 * ganchos del banco sin armar un banco entero.
 */
import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { abrir } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const PEDIDO = process.argv[4] ?? 'producto'
const EXPRESION = process.argv[5] ?? '0'
const ESPERA = Number(process.argv[6] ?? 3000)
const SCROLL = process.argv[7]

async function principal(): Promise<void> {
  const b = await abrir(PEDIDO, ANCHO, ALTO)
  try {
    if (SCROLL !== undefined) await scrollHasta(b, Number(SCROLL))
    await esperar(ESPERA)
    const r = await medir<unknown>(b.p, EXPRESION)
    console.log(JSON.stringify(r))
    const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
    console.log(JSON.stringify({ errores: errores.slice(0, 8) }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('sonda.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
