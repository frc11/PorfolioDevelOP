/** [CALIDAD 1] B4 · ¿se ve la escena en el borde de Servicios donde se suspende? Capturas y el estado del lienzo. */
import { medir } from '../scripts-b4/navegador'
import { captura, esperar } from '../scripts-viajes/banco'
import { abrir, carpeta } from './banco'

async function principal(): Promise<void> {
  const b = await abrir('producto', 1440, 900)
  const dir = carpeta('b4-bordes/servicios')
  try {
    for (const y of [12600, 12900, 13100, 13300, 13600]) {
      await medir(b.p, `(async () => { for (let a = scrollY; a < ${String(y)}; a += 90) { window.scrollTo(0, a); await new Promise((r) => setTimeout(r, 22)) } window.scrollTo(0, ${String(y)}); return 1 })()`)
      await esperar(1500)
      const lienzo = await medir<unknown>(b.p, `(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); const x = Math.round(innerWidth / 2), yy = Math.round(innerHeight / 2); const arriba = document.elementFromPoint(x, yy); return { top: Math.round(r.top), bottom: Math.round(r.bottom), arriba: arriba === null ? null : arriba.tagName + '.' + String(arriba.className).slice(0, 40), cuadros: window.__gpuDelBanco === undefined ? -1 : 0 } })()`)
      console.log(y, JSON.stringify(lienzo))
      await captura(b, `${dir}/scroll-${String(y)}.png`)
    }
  } finally {
    await b.cerrar()
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(e); process.exit(1) })
