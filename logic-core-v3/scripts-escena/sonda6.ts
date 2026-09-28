/**
 * SPRINT ESCENA 6 — una sonda: sonda6.ts "<pedido>" "<momento>" "<expresión JS>" [espera ms]
 * Lleva la página al momento (asentado y verificado) y evalúa la expresión. Para mirar un estado sin
 * armar un banco entero.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar } from '../scripts-viajes/banco'
import { CONTADOR, ESPIA_DE_SALTOS, MOMENTOS, capturarMomento, selloDeCarga, viajarElPuntero } from './banco-escena'
import { ERRORES } from './formacion'

const [PEDIDO, MOMENTO, EXPRESION] = [process.argv[2] ?? 'producto', process.argv[3] ?? 'hero', process.argv[4] ?? 'window.__escenaViva']
const ESPERA = Number(process.argv[5] ?? 500)
/** Si viene, además guarda una captura ahí, después de evaluar. */
const CAPTURA = process.argv[6] === '-' ? undefined : process.argv[6]
/** Si viene «x0,y0,x1,y1,ms», el puntero hace ese viaje (con el mouse del protocolo) antes de evaluar. */
const VIAJE = process.argv[7]?.split(',').map(Number)

async function principal(): Promise<void> {
  const b = await abrirBanco(1440, 900, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${PEDIDO}'; ${CONTADOR}; ${ESPIA_DE_SALTOS}; ${ERRORES}` })
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      if (momento.nombre !== MOMENTO) continue
      if (VIAJE !== undefined) await viajarElPuntero(b, [VIAJE[0], VIAJE[1]], [VIAJE[2], VIAJE[3]], VIAJE[4])
      await esperar(ESPERA)
      console.log(JSON.stringify(await medir<unknown>(b.p, EXPRESION)))
      if (CAPTURA !== undefined) {
        await esperar(400)
        await medir(b.p, 'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(0))))')
        const s = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
        writeFileSync(CAPTURA, Buffer.from(s.data, 'base64'))
      }
      break
    }
    const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
    if (errores.length > 0) console.log(JSON.stringify({ errores: errores.slice(0, 6) }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('sonda6.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
