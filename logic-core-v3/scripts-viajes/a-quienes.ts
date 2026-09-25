/* SPRINT VIAJES · fase 0 — Quiénes somos alrededor de su tope: dónde termina de llegar el texto y dónde está el logo. */
import { abrirBanco, captura, scrollHasta, topeDe } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const DESVIOS = (process.argv[4] ?? '-150,-72,0,60,135,200,300').split(',').map(Number)
const DIR = 'C:/Users/Valentino/.cache/b4-medicion/viajes'

async function principal(): Promise<void> {
  const b = await abrirBanco(ANCHO, ALTO)
  try {
    const tope = await topeDe(b, 'quienes-somos')
    for (const d of DESVIOS) {
      const y = await scrollHasta(b, tope + d)
      await captura(b, `${DIR}/quienes-${String(ANCHO)}-${String(d)}.png`)
      console.log(`quienes ${String(ANCHO)} tope ${tope.toFixed(0)} desvío ${String(d)} → y ${y.toFixed(0)}`)
    }
  } finally {
    await b.cerrar()
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
