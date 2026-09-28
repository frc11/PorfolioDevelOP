/**
 * SPRINT ESCENA 7 — una foto en cualquier punto del recorrido: foto7.ts "<pedido>" "<dónde>" <archivo> ["<expresión JS>"] [espera ms]
 *
 * `<dónde>` es un scroll en px, o `<sección>+<pantallas>` (el tope de la sección más tantas pantallas,
 * p. ej. `numeros+0.5` o `trabajos-0.9`). Baja como una rueda, espera, evalúa la expresión (si hay) y
 * guarda la captura. Imprime el scroll, la sección del centro y lo que dio la expresión.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { topeMas } from './banco-escena'
import { abrir7 } from './banco7'

const [PEDIDO, DONDE, ARCHIVO] = [process.argv[2] ?? 'producto', process.argv[3] ?? '0', process.argv[4] ?? 'foto.png']
const EXPRESION = process.argv[5]
const ESPERA = Number(process.argv[6] ?? 2500)

export async function scrollDe(b: Banco, donde: string): Promise<number> {
  const m = /^([a-z-]+)([+-][\d.]+)?$/.exec(donde)
  if (m === null) return Number(donde)
  return topeMas(m[1], Number(m[2] ?? 0))(b)
}

async function principal(): Promise<void> {
  const b = await abrir7(PEDIDO)
  try {
    const y = await scrollDe(b, DONDE)
    await scrollHasta(b, y)
    await esperar(ESPERA)
    const valor = EXPRESION === undefined ? null : await medir<unknown>(b.p, EXPRESION)
    await medir(b.p, 'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(0))))')
    const s = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
    writeFileSync(ARCHIVO, Buffer.from(s.data, 'base64'))
    const panel = await medir<string | null>(b.p, `(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); const p = e && e.closest('[data-panel]'); return p ? p.getAttribute('data-panel') : null })()`)
    console.log(JSON.stringify({ y: await medir<number>(b.p, 'scrollY'), panel, valor }))
    const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
    if (errores.length > 0) console.log(JSON.stringify({ errores: errores.slice(0, 6) }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('foto7.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
