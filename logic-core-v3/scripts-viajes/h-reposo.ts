/* SPRINT VIAJES — ¿qué pieza de la primera pantalla de Quiénes somos se mueve alrededor del reposo? h-reposo.ts <ancho> <alto> <y> */
import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar } from './banco'

const [ANCHO, ALTO, Y] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), Number(process.argv[4] ?? 1034)]

const LEER = `(() => {
  const salida = {}
  document.querySelectorAll('[data-panel="quienes-somos"] [data-composicion="agencia"] [style]').forEach((e, i) => {
    const c = getComputedStyle(e)
    salida[i + ':' + e.tagName.toLowerCase() + '.' + (e.getAttribute('data-parte') || e.getAttribute('data-pieza') || e.getAttribute('data-rango') || e.className.toString().slice(0, 30))] = [c.transform, c.opacity, c.clipPath, c.maskImage, c.strokeDashoffset].join(' | ')
  })
  return salida
})()`

async function principal(): Promise<void> {
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'viajes-reposo' })
  try {
    const en = async (y: number): Promise<Record<string, string>> => {
      await medir(b.p, `(() => { window.scrollTo(0, ${String(y)}); return 0 })()`)
      await esperar(700)
      return medir<Record<string, string>>(b.p, LEER)
    }
    const antes = await en(Y - 30)
    const ahora = await en(Y)
    const despues = await en(Y + 30)
    for (const k of Object.keys(ahora)) {
      if (antes[k] !== ahora[k] || despues[k] !== ahora[k]) console.log(JSON.stringify({ k, antes: antes[k] === ahora[k] ? '=' : antes[k], ahora: ahora[k], despues: despues[k] === ahora[k] ? '=' : despues[k] }))
    }
  } finally {
    await b.cerrar()
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
