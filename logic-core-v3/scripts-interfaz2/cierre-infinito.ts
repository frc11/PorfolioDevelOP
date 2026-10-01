/**
 * SPRINT INTERFAZ 2 · cierre — el infinito del recorrido: la esquina ampliada en cuatro puntos de la página (0, ~37, ~75
 * y 100 %) a 1440 y a 390 —con el tono de lo que hay debajo—, y el clip de la esquina mientras la rueda recorre la página
 * a 1440. Va a `interfaz2/cierre/infinito/`.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, esperar, grabar, raton, rueda, type Banco } from './banco'

const ESTADO = `(() => { const e = document.querySelector('[data-pieza="infinito-del-recorrido"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { caja: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], texto: e.textContent, tono: e.getAttribute('data-seccion') === 'invertida' ? 'claro sobre oscuro' : 'oscuro sobre claro', aria: e.getAttribute('aria-hidden') } })()`

/** La esquina ampliada ×3: el cuadro entero (una captura con `clip` sale negra en este entorno después de la primera) y el recorte con ffmpeg. */
async function foto(b: Banco, archivo: string, caja: readonly number[]): Promise<void> {
  const [x, y, w, h] = caja
  const m = 18
  const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  const entero = archivo.replace(/\.png$/, '-entero.png')
  writeFileSync(entero, Buffer.from(c.data, 'base64'))
  await b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: b.ancho, height: b.alto, deviceScaleFactor: 1, mobile: b.ancho < 1024, screenWidth: b.ancho, screenHeight: b.alto }, b.p.sessionId)
  const [cx, cy] = [Math.max(0, x - m), Math.max(0, y - m)]
  const [cw, ch] = [Math.min(b.ancho - cx, w + 2 * m), Math.min(b.alto - cy, h + 2 * m)]
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', entero, '-vf', `crop=${String(cw)}:${String(ch)}:${String(cx)}:${String(cy)},scale=iw*3:-2:flags=lanczos`, archivo])
}

correr(async () => {
  const dir = carpeta('cierre/infinito')
  for (const [ancho, alto] of [[1440, 900], [390, 844]] as const) {
    const b = await abrir(ancho, alto, { pedido: 'producto' })
    try {
      const maximo = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
      for (const f of [0, 0.37, 0.75, 1]) {
        // La rueda las últimas muescas (la noche de Trabajos cae con la gota al cruzar), y quieto.
        await medir(b.p, `window.scrollTo(0, ${String(Math.max(0, Math.round(maximo * f) - 500))})`)
        await esperar(900)
        if (f > 0) await rueda(b, 5, 90)
        await esperar(2200)
        const e = await medir<{ caja: number[]; texto: string; tono: string; aria: string } | null>(b.p, ESTADO)
        if (e === null) throw new Error('no está el infinito')
        console.log(ancho, f, JSON.stringify(e))
        await foto(b, `${dir}/${String(ancho)}-${String(Math.round(f * 100))}.png`, e.caja)
      }
      if (ancho >= 1024) {
        await medir(b.p, 'window.scrollTo(0, 0)')
        await esperar(1500)
        await raton(b, [700, 450], [700, 400], 2, 30)
        const cuadros = await grabar(b, `${dir}/_cuadros`, async () => {
          await esperar(500)
          for (let k = 0; k < 90; k += 1) {
            await rueda(b, 3, 40)
            await esperar(120)
          }
          await esperar(1800)
        }, 1440)
        armarClip(`${dir}/_cuadros`, cuadros, `${dir}/recorrido-1440.mp4`, 'el infinito del recorrido - la pagina entera con la rueda')
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${dir}/recorrido-1440.mp4`, '-vf', 'crop=iw*0.16:ih*0.2:iw*0.84:ih*0.8,scale=trunc(iw*3/2)*2:-2', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', `${dir}/recorrido-1440-esquina.mp4`])
      }
    } finally {
      await b.cerrar()
    }
  }
})
