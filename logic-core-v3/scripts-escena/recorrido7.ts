/**
 * SPRINT ESCENA 7 — una sonda a lo largo del recorrido: recorrido7.ts "<pedido>" "<expresión JS>" [pasos] [ancho] [desde] [hasta]
 * Baja de a pasos por la página (como una rueda; toda, o de `desde` a `hasta` px) y en cada parada evalúa la expresión. Imprime
 * una línea JSON por parada: el scroll, la sección del centro y lo que dio la expresión.
 */
import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { abrir7 } from './banco7'

const [PEDIDO, EXPRESION] = [process.argv[2] ?? 'producto', process.argv[3] ?? 'window.__polvoDelBanco.camara()']
const PASOS = Number(process.argv[4] ?? 40)
const ANCHO = Number(process.argv[5] ?? 1440)
const [DESDE, HASTA] = [process.argv[6], process.argv[7]]

async function principal(): Promise<void> {
  const b = await abrir7(PEDIDO, ANCHO, 900)
  try {
    const fin = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
    const [a, z] = [DESDE === undefined ? 0 : Number(DESDE), HASTA === undefined ? fin : Math.min(fin, Number(HASTA))]
    for (let k = 0; k <= PASOS; k += 1) {
      const y = Math.round(a + ((z - a) * k) / PASOS)
      await scrollHasta(b, y, 90, 22)
      await esperar(300)
      const panel = await medir<string | null>(b.p, `(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); const p = e && e.closest('[data-panel]'); return p ? p.getAttribute('data-panel') : null })()`)
      console.log(JSON.stringify({ y, panel, valor: await medir<unknown>(b.p, EXPRESION) }))
    }
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('recorrido7.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
