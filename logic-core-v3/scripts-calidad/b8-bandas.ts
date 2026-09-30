/**
 * SPRINT CALIDAD 1 — B8 · las bandas de los degradados: b8-bandas.ts [ancho alto]
 *
 * En cada momento (asentado), en una sola tarea: dibuja el cuadro con el dithering apagado en todos los materiales que
 * lo piden y con el dithering prendido, lee los dos y compara:
 * - las MESETAS: el largo medio de las corridas horizontales de un mismo color (un degradé en escalones hace corridas
 *   largas; con dithering se cortan), en el cuadro entero y en la mitad de arriba (el cielo);
 * - cuánto cambia cada píxel (con ruido de ±½ escalón, a lo sumo 1 nivel) y cuántos cambian.
 * Guarda los dos cuadros para los recortes con el contraste estirado (que muestran las bandas).
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

const AB = `(async () => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const materiales = new Set()
  escena.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; for (const m of ms) if (m.dithering === true) materiales.add(m) })
  const ctx = gl.getContext()
  const [W, H] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
  const leer = (con) => { for (const m of materiales) { m.dithering = con; m.needsUpdate = true } gl.render(escena, camara); const px = new Uint8Array(W * H * 4); ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, px); return px }
  const a = leer(false)
  const b = leer(true)
  // readPixels da la fila 0 abajo: la mitad de arriba del cuadro son las filas H/2..H.
  const mesetas = (px, y0, y1) => { let [corridas, pixeles] = [0, 0]; for (let y = y0; y < y1; y += 1) { let largo = 1; for (let x = 1; x < W; x += 1) { const i = (y * W + x) * 4, j = i - 4; if (px[i] === px[j] && px[i + 1] === px[j + 1] && px[i + 2] === px[j + 2]) largo += 1; else { corridas += 1; pixeles += largo; largo = 1 } } corridas += 1; pixeles += largo } return +(pixeles / corridas).toFixed(2) }
  let [distintos, maxima] = [0, 0]
  for (let i = 0; i < a.length; i += 4) { const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])); if (d > 0) distintos += 1; maxima = Math.max(maxima, d) }
  const png = (px) => { const l = document.createElement('canvas'); l.width = W; l.height = H; const c = l.getContext('2d'); const img = c.createImageData(W, H); for (let y = 0; y < H; y += 1) img.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4); c.putImageData(img, 0, 0); return l.toDataURL('image/png').split(',')[1] }
  return { materiales: materiales.size, mesetasCuadro: [mesetas(a, 0, H), mesetas(b, 0, H)], mesetasCielo: [mesetas(a, H >> 1, H), mesetas(b, H >> 1, H)], distintos, maxima, antes: png(a), despues: png(b) }
})()`

async function principal(): Promise<void> {
  const dir = carpeta('b8-dithering/cuadros')
  const b = await abrir('producto', ANCHO, ALTO)
  const tabla: Record<string, unknown> = {}
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      const r = await medir<{ antes: string; despues: string } & Record<string, unknown>>(b.p, AB)
      for (const rotulo of ['antes', 'despues'] as const) writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-${rotulo}.png`, Buffer.from(r[rotulo], 'base64'))
      const fila: Record<string, unknown> = { ...r }
      delete fila.antes
      delete fila.despues
      tabla[momento.nombre] = fila
      console.log(JSON.stringify({ momento: momento.nombre, ...fila }))
    }
    const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
    if (errores.length > 0) console.log(JSON.stringify({ errores: errores.slice(0, 5) }))
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta('b8-dithering')}/bandas-${String(ANCHO)}.json`, JSON.stringify(tabla, null, 1))
}

if (process.argv[1]?.endsWith('b8-bandas.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
