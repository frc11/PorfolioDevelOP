/**
 * PASADA FINAL · C2 — DÓNDE SE VE CADA COLUMNA DEL PIE: npx tsx scripts-pasada/c2-ventanas.ts [ancho alto]
 *
 * Recorre la última pantalla de a 2 % del progreso de la sección del pie y anota, para cada grupo de la coreografía, desde
 * qué progreso sus piezas están enteras en el cuadro (las cajas del DOM, que son las del 3D llegado). Con eso se ubican
 * los tramos: que cada columna llegue donde se la ve. Pide el servidor de desarrollo.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir } from '../scripts-escena10/banco'
import { esperar } from '../scripts-viajes/banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? '1440'), Number(process.argv[3] ?? '900')]

async function principal(): Promise<void> {
  const b = await abrir('producto', ANCHO, ALTO)
  try {
    await medir(b.p, 'scrollTo(0, document.documentElement.scrollHeight)')
    await esperar(4000)
    const filas = await medir<unknown>(b.p, `new Promise(async (listo) => {
      const s = document.querySelector('footer').closest('section')
      const r0 = s.getBoundingClientRect()
      const top = r0.top + scrollY
      const h = r0.height
      const cuadro = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const filas = []
      for (let k = 0; k <= 50; k += 1) {
        const p = k / 50
        scrollTo(0, Math.round(top - innerHeight + p * h))
        await cuadro()
        const ps = window.__pieDelBanco.piezas()
        const entera = (g) => ps.filter((x) => x.llegada === g).every((x) => x.dom[1] >= 0 && x.dom[3] <= innerHeight)
        const abajo = (g) => Math.max(...ps.filter((x) => x.llegada === g).map((x) => x.dom[3]))
        filas.push({ p, atras: entera('atras'), tapa: entera('tapa'), fundido: entera('fundido'), abajoAtras: abajo('atras'), abajoTapa: abajo('tapa'), abajoFundido: abajo('fundido') })
      }
      listo({ alto: h, vh: innerHeight, filas })
    })`)
    writeFileSync(`C:/Users/Valentino/.cache/b4-medicion/pasada-final/c2/ventanas-${String(ANCHO)}.json`, JSON.stringify(filas, null, 1))
    const f = filas as { alto: number; vh: number; filas: { p: number; atras: boolean; tapa: boolean; fundido: boolean }[] }
    const desde = (g: 'atras' | 'tapa' | 'fundido'): number | null => f.filas.find((x) => x[g])?.p ?? null
    console.log(JSON.stringify({ ancho: ANCHO, alto: f.alto, vh: f.vh, enteras: { atras: desde('atras'), tapa: desde('tapa'), fundido: desde('fundido') } }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('c2-ventanas.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
