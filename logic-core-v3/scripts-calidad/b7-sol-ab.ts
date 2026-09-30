/**
 * SPRINT CALIDAD 1 — B7 · el A/B de la sombra de la trama en el piso, prefiltrada o no: b7-sol-ab.ts [ancho alto]
 *
 * En el amanecer congelado en el pico de los rayos, el MISMO cuadro (una sola tarea) dibujado con la sombra de la trama
 * sin prefiltro y prefiltrada; la diferencia por píxel en niveles de 8 bits y cuántos píxeles cambian, más las dos
 * imágenes para los recortes.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'
import { abrirMotor } from './motor/abrir'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

const AB = `(async () => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const ctx = gl.getContext()
  const [W, H] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
  const leer = (v) => { window.__amanecerDelBanco.tramaFiltrada(v); gl.render(escena, camara); const px = new Uint8Array(W * H * 4); ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, px); return px }
  const a = leer(0)
  const b = leer(1)
  let [distintos, masDe4, maxima, suma] = [0, 0, 0, 0]
  for (let i = 0; i < a.length; i += 4) { const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])); if (d > 0) distintos += 1; if (d > 4) masDe4 += 1; maxima = Math.max(maxima, d); suma += d }
  const png = (px) => { const l = document.createElement('canvas'); l.width = W; l.height = H; const c = l.getContext('2d'); const img = c.createImageData(W, H); for (let y = 0; y < H; y += 1) img.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4); c.putImageData(img, 0, 0); return l.toDataURL('image/png').split(',')[1] }
  return { pixeles: W * H, distintos, masDe4, maxima, media: +(suma / (W * H)).toFixed(4), antes: png(a), despues: png(b) }
})()`

async function principal(): Promise<void> {
  const dir = carpeta('b7-antialias/cuadros')
  const b = await abrirMotor(ANCHO, ALTO)
  try {
    const pie = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - 0.12 * innerHeight) })()`)
    await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(pie)}, 3000)`)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(4.9)')
    await esperar(2500)
    const r = await medir<{ antes: string; despues: string } & Record<string, number>>(b.p, AB)
    writeFileSync(`${dir}/amanecer-${String(ANCHO)}-antes.png`, Buffer.from(r.antes, 'base64'))
    writeFileSync(`${dir}/amanecer-${String(ANCHO)}-despues.png`, Buffer.from(r.despues, 'base64'))
    console.log(JSON.stringify({ ancho: ANCHO, pixeles: r.pixeles, distintos: r.distintos, masDe4: r.masDe4, maxima: r.maxima, media: r.media }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('b7-sol-ab.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
