/**
 * SPRINT CALIDAD 1 — B10 · el apoyo de las copias: b10-apoyo.ts [ancho alto]
 *
 * En cada momento (asentado): el MISMO cuadro con la mancha de contacto de la formación apagada y prendida (una sola
 * tarea), guardado para los recortes, con cuántos píxeles cambia y cuánto oscurece como mucho; y el costo de GPU de la
 * mancha (el perfil por objeto, 120 cuadros).
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
  const contacto = escena.getObjectByName('formación · contacto')
  if (!contacto) return { hay: false }
  const ctx = gl.getContext()
  const [W, H] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
  const leer = (v) => { const antes = contacto.visible; contacto.visible = v; gl.render(escena, camara); contacto.visible = antes; const px = new Uint8Array(W * H * 4); ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, px); return px }
  const a = leer(false)
  const b = leer(true)
  let [distintos, oscurece] = [0, 0]
  for (let i = 0; i < a.length; i += 4) { const d = (a[i] + a[i + 1] + a[i + 2] - b[i] - b[i + 1] - b[i + 2]) / 3; if (Math.abs(d) > 0.5) distintos += 1; oscurece = Math.max(oscurece, d) }
  const png = (px) => { const l = document.createElement('canvas'); l.width = W; l.height = H; const c = l.getContext('2d'); const img = c.createImageData(W, H); for (let y = 0; y < H; y += 1) img.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4); c.putImageData(img, 0, 0); return l.toDataURL('image/png').split(',')[1] }
  return { hay: true, copias: contacto.count, distintos, oscureceMax: +oscurece.toFixed(1), antes: png(a), despues: png(b) }
})()`

async function principal(): Promise<void> {
  const dir = carpeta('b10-apoyo/cuadros')
  const b = await abrir('producto', ANCHO, ALTO)
  const tabla: Record<string, unknown> = {}
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      const r = await medir<{ hay: boolean; antes?: string; despues?: string } & Record<string, unknown>>(b.p, AB)
      if (r.antes !== undefined && r.despues !== undefined) {
        writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-antes.png`, Buffer.from(r.antes, 'base64'))
        writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-despues.png`, Buffer.from(r.despues, 'base64'))
      }
      const perfil = await medir<{ pasadas: Record<string, { ms: number }> } | null>(b.p, 'window.__gpuDelBanco.medir(120)')
      const fila: Record<string, unknown> = { ...r, gpuMs: perfil === null ? null : Math.round((perfil.pasadas['formación · contacto']?.ms ?? 0) * 1000) / 1000 }
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
  writeFileSync(`${carpeta('b10-apoyo')}/apoyo-${String(ANCHO)}.json`, JSON.stringify(tabla, null, 1))
}

if (process.argv[1]?.endsWith('b10-apoyo.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
