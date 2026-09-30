/**
 * SPRINT CALIDAD 1 — B7 · los cantos del logo, el mismo cuadro con normales por cara y con pliegue: b7-cantos.ts [ancho alto]
 *
 * En cada momento (asentado), en una sola tarea: dibuja el cuadro con el logo como era antes de B7 (las normales por cara
 * que deja `ExtrudeGeometry`) y como es ahora (los costados suaves de `cantosDelLogo.ts`), lee el lienzo de los dos y los
 * guarda. Como nada se mueve entre uno y otro, la única diferencia es la del logo.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

const DOS = `(async () => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const ctx = gl.getContext()
  const [W, H] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
  const png = () => {
    gl.render(escena, camara)
    const px = new Uint8Array(W * H * 4)
    ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, px)
    const lienzo = document.createElement('canvas')
    lienzo.width = W; lienzo.height = H
    const c2 = lienzo.getContext('2d')
    const img = c2.createImageData(W, H)
    for (let y = 0; y < H; y += 1) img.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4)
    c2.putImageData(img, 0, 0)
    return lienzo.toDataURL('image/png').split(',')[1]
  }
  const cambiados = []
  escena.getObjectByName('logo')?.traverse((o) => { if (o.isMesh) { const plana = o.geometry.clone(); plana.computeVertexNormals(); cambiados.push([o, o.geometry]); o.geometry = plana } })
  const antes = png()
  for (const [o, g] of cambiados) { o.geometry.dispose(); o.geometry = g }
  const despues = png()
  return { antes, despues }
})()`

async function principal(): Promise<void> {
  const dir = carpeta('b7-antialias/cuadros')
  const b = await abrir('producto', ANCHO, ALTO)
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      const r = await medir<{ antes: string; despues: string }>(b.p, DOS)
      for (const rotulo of ['antes', 'despues'] as const) writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-${rotulo}.png`, Buffer.from(r[rotulo], 'base64'))
      console.log(momento.nombre)
    }
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('b7-cantos.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
