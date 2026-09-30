/**
 * SPRINT ESCENA 10 — T2 · la sonda del video: t2-sonda.ts
 *
 * Con Servicios quieto en pantalla (cada video en el medio del cuadro, por turno), cada medio segundo durante 3 s: si
 * cada video está en pausa, su tiempo, si tiene fuente y dónde está en el cuadro. Para ver que vuelve a andar al frenar.
 */
import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { abrir } from './banco'

const ESTADO = `[...document.querySelectorAll('video[data-pieza="video-de-servicio"]')].map((v) => { const r = v.getBoundingClientRect(); return { pausa: v.paused, t: Math.round(v.currentTime * 100) / 100, listo: v.readyState, fuente: v.currentSrc !== '', arriba: Math.round(r.top), abajo: Math.round(r.bottom), visible: getComputedStyle(v).visibility, opacidad: getComputedStyle(v.parentElement).opacity } })`

async function principal(): Promise<void> {
  const b = await abrir('producto', 1440, 900)
  try {
    const cuantos = await medir<number>(b.p, `document.querySelectorAll('video[data-pieza="video-de-servicio"]').length`)
    for (let k = 0; k < cuantos; k += 1) {
      await medir(b.p, `(() => { const v = document.querySelectorAll('video[data-pieza="video-de-servicio"]')[${String(k)}]; const r = v.getBoundingClientRect(); window.scrollTo(0, Math.round(r.top + scrollY + r.height / 2 - innerHeight / 2)); return true })()`)
      for (let i = 0; i < 6; i += 1) {
        await esperar(500)
        console.log(k, JSON.stringify(await medir<unknown>(b.p, ESTADO)))
      }
    }
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('t2-sonda.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
