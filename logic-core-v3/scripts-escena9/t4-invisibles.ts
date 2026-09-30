/**
 * SPRINT ESCENA 9 — T4 · lo que se dibuja sin verse: t4-invisibles.ts <antes|despues> [ancho alto]
 *
 * Dos cúpulas que cubren la pantalla entera se dibujaban siempre: la de la vía láctea (también de día, cuando su luz y
 * su oscuro valen cero) y la del cielo de día (también de noche, cuando pinta el color de la niebla, el del fondo).
 *   antes:   en los cinco momentos, el MISMO cuadro con las dos, sin la vía láctea y sin el cielo de día
 *            (`mismo-cuadro.ts`): cuánto cambia la imagen si no se dibujan.
 *   despues: con el arreglo (cada una se esconde sola cuando no suma), el mismo cuadro tal como queda y con las dos
 *            forzadas, en los cinco momentos y en tres instantes del amanecer (donde la vía láctea sí se ve): tiene que
 *            dar 0 píxeles distintos en todos.
 * Va a `escena9/t4-fluidez/invisibles/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'
import { guardarMismoCuadro, type MismoCuadro } from './mismo-cuadro'

const [MODO, ANCHO, ALTO] = [process.argv[2] ?? 'antes', Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]

const ANTES = {
  variantes: ['las-dos', 'sin-via-lactea', 'sin-cielo-de-dia'],
  preparar: `(k) => {
  const e = window.__gpuDelBanco.tres().escena
  e.getObjectByName('vía láctea').visible = k !== 'sin-via-lactea'
  e.getObjectByName('cielo de día').visible = k !== 'sin-cielo-de-dia'
}`,
}

/** Después: `producto` deja lo que decidió el cuadro (guardado la primera vez); `forzadas`, las dos dibujadas. */
const DESPUES = {
  variantes: ['producto', 'forzadas'],
  preparar: `(() => {
  const e = window.__gpuDelBanco.tres().escena
  const via = e.getObjectByName('vía láctea')
  const cielo = e.getObjectByName('cielo de día')
  const guardado = [via.visible, cielo.visible]
  return (k) => {
    via.visible = k === 'forzadas' ? true : guardado[0]
    cielo.visible = k === 'forzadas' ? true : guardado[1]
  }
})()`,
}

/** Los instantes del amanecer (s de su reloj, congelado): las estrellas todavía, el resplandor y los rayos. */
const AMANECER = [0.3, 2.0, 4.9] as const

async function principal(): Promise<void> {
  const dir = carpeta('t4-fluidez/invisibles')
  const m = MODO === 'despues' ? DESPUES : ANTES
  const b = await abrir('producto', ANCHO, ALTO)
  const salida: Record<string, Omit<MismoCuadro, 'pngs'> & { readonly visibles?: readonly boolean[] }> = {}
  try {
    const sello = await selloDeCarga(b)
    const visibles = (): Promise<boolean[]> => medir<boolean[]>(b.p, "(() => { const e = window.__gpuDelBanco.tres().escena; return [e.getObjectByName('vía láctea').visible, e.getObjectByName('cielo de día').visible] })()")
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      const v = await visibles()
      const r = await guardarMismoCuadro(b, m.variantes, m.preparar, `${dir}/${MODO}-${momento.nombre}-${String(ANCHO)}`)
      salida[momento.nombre] = { ancho: r.ancho, alto: r.alto, logo: r.logo, distintos: r.distintos, visibles: v }
      console.log(momento.nombre, JSON.stringify(v), JSON.stringify(r.distintos))
    }
    if (MODO === 'despues') {
      const y = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * 0.12) })()`)
      await scrollHasta(b, y)
      for (const s of AMANECER) {
        await medir(b.p, `window.__amanecerDelBanco.congelar(${String(s)})`)
        await esperar(2500)
        const v = await visibles()
        const nombre = `amanecer-${String(s)}s`
        const r = await guardarMismoCuadro(b, m.variantes, m.preparar, `${dir}/${MODO}-${nombre}-${String(ANCHO)}`)
        salida[nombre] = { ancho: r.ancho, alto: r.alto, logo: r.logo, distintos: r.distintos, visibles: v }
        console.log(nombre, JSON.stringify(v), JSON.stringify(r.distintos))
      }
      await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${dir}/${MODO}-${String(ANCHO)}.json`, JSON.stringify({ variantes: m.variantes, salida }, null, 1))
}

if (process.argv[1]?.endsWith('t4-invisibles.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
