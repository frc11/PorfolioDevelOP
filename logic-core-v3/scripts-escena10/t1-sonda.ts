/**
 * SPRINT ESCENA 10 — T1 · la sonda de la luz: t1-sonda.ts [momento]
 *
 * En un momento (por defecto la noche de Trabajos), cada segundo durante 12 s: la noche de la sala y la del logo, la
 * fase y la intensidad del encendido del haz, las manchas y la fuerza de la sombra del logo, y las llamadas del cuadro.
 * Para ver que de noche queda la mancha dura del haz y de día la sombra del logo.
 */
import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { esperar } from '../scripts-viajes/banco'
import { abrir } from './banco'

const QUE = process.argv[2] ?? 'trabajos-de-noche'

async function principal(): Promise<void> {
  const b = await abrir('producto', 1440, 900)
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      if (momento.nombre === QUE) break
    }
    for (let k = 0; k < 12; k += 1) {
      const e = await medir<unknown>(b.p, `(() => { const v = window.__escenaViva; const s = window.__sombraDelLogoDelBanco; return { noche: v?.noche, nocheDelLogo: v?.nocheDelLogo, encendido: v?.encendido, sombra: s ? s.fuerza() : null, llamadas: window.__dibujos?.ultimo } })()`)
      console.log(JSON.stringify(e))
      await esperar(1000)
    }
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('t1-sonda.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
