/**
 * SPRINT ESCENA 10 — T2 · el video quieto mientras el scroll se mueve, en video: t2-clip.ts
 *
 * Con un video entero en pantalla y andando: dos tramos de scroll suave con una pausa entre los dos, y el reloj de la
 * página y el estado del video estampados en cada cuadro (arriba a la izquierda, por el banco: el sitio no cambia). Se
 * ve el video congelarse en el cuadro en que estaba y seguir desde ahí al frenar. Va a `escena10/t2-video/`.
 */
import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { grabar, mover } from '../scripts-escena/banco-escena'
import { FUERA, scrollSuave } from '../scripts-escena/clips6'
import { abrir, carpeta } from './banco'

/** Un rótulo del banco, encima de todo: el tiempo del video y si está en pausa (se escribe en cada cuadro). */
const ROTULO = `(() => { const v = window.__videoDelClip; const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:8px;top:8px;z-index:2147483647;background:#000c;color:#fff;font:14px monospace;padding:4px 8px;pointer-events:none'; document.body.appendChild(d); const paso = () => { d.textContent = 'video ' + v.currentTime.toFixed(2) + ' s · ' + (v.paused ? 'EN PAUSA' : 'andando') + ' · scroll ' + Math.round(scrollY); requestAnimationFrame(paso) }; paso(); return true })()`

async function principal(): Promise<void> {
  const dir = carpeta('t2-video')
  const b = await abrir('producto', 1440, 900)
  try {
    await mover(b, FUERA[0], FUERA[1])
    const d = await medir<{ tope: number; alto: number }>(b.p, `(() => { const r = document.querySelector('[data-panel="servicios"]').getBoundingClientRect(); return { tope: Math.round(r.top + scrollY), alto: Math.round(r.height) } })()`)
    let puesto = -1
    for (let y = d.tope; y <= d.tope + d.alto && puesto < 0; y += 150) {
      await scrollHasta(b, y)
      await esperar(900)
      const hay = await medir<boolean>(b.p, `(() => { const v = [...document.querySelectorAll('video[data-pieza="video-de-servicio"]')].find((x) => { const r = x.getBoundingClientRect(); return !x.paused && r.top >= 0 && r.bottom + 400 <= innerHeight + 200 }); window.__videoDelClip = v ?? null; return v !== undefined })()`)
      if (hay) puesto = y
    }
    if (puesto < 0) throw new Error('no hay un lugar con un video entero en pantalla')
    await medir(b.p, ROTULO)
    await grabar(b, `${dir}/video-quieto-al-scrollear`, async () => {
      await esperar(1500)
      await scrollSuave(b, puesto, puesto + 250, 1400)
      await esperar(1800)
      await scrollSuave(b, puesto + 250, puesto, 1400)
      await esperar(2000)
    }, 1440)
    console.log(`${dir}/video-quieto-al-scrollear.mp4`)
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('t2-clip.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
