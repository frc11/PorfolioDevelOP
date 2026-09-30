/**
 * SPRINT ESCENA 9 — EL MISMO CUADRO, UNA VEZ POR VARIANTE: en la página, en una sola tarea (nada se mueve entre una y
 * otra: ni el polvo, ni el piso vivo, ni la cámara), la escena se dibuja una vez por variante y cada dibujo se lee del
 * lienzo antes de que se componga (el método de CALIDAD 1, B6). Sale como PNG, más la caja del logo en pantalla.
 *
 * `preparar` es el código (una función de la página, en texto) que deja puesta la variante que recibe; al final vuelve
 * a dejar la primera.
 */
import { writeFileSync } from 'node:fs'

import type { Banco } from '../scripts-viajes/banco'
import { medir } from '../scripts-b4/navegador'

export interface MismoCuadro {
  readonly ancho: number
  readonly alto: number
  /** La caja del logo en el búfer (x, y, ancho, alto), con un margen; null si no está en cuadro. */
  readonly logo: readonly [number, number, number, number] | null
  /** Píxeles distintos (algún canal cambia más de 2 niveles) de cada variante contra la primera, en la caja del logo y en todo el cuadro. */
  readonly distintos: readonly { readonly enElLogo: number; readonly enTodo: number; readonly maxima: number }[]
  readonly pngs: readonly string[]
}

export function mismoCuadro(variantes: readonly string[], preparar: string): string {
  return `(async () => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const preparar = ${preparar}
  const ctx = gl.getContext()
  const [w, h] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
  // La caja del logo en el búfer: las ocho esquinas de su caja proyectadas.
  const logo = escena.getObjectByName('logo')
  let caja = null
  if (logo) {
    let malla = null
    logo.traverse((o) => { if (malla === null && o.isMesh && o.geometry.boundingBox) malla = o })
    if (malla) {
      const b3 = new malla.geometry.boundingBox.constructor().setFromObject(logo)
      const V = logo.position.constructor
      let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
      for (const x of [b3.min.x, b3.max.x]) for (const y of [b3.min.y, b3.max.y]) for (const z of [b3.min.z, b3.max.z]) {
        const v = new V(x, y, z).project(camara)
        const [px, py] = [(v.x + 1) / 2 * w, (1 - v.y) / 2 * h]
        x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py)
      }
      const m = 0.06 * Math.max(x1 - x0, y1 - y0)
      x0 = Math.max(0, Math.floor(x0 - m)); y0 = Math.max(0, Math.floor(y0 - m)); x1 = Math.min(w, Math.ceil(x1 + m)); y1 = Math.min(h, Math.ceil(y1 + m))
      if (x1 - x0 > 8 && y1 - y0 > 8) caja = [x0, y0, (x1 - x0) & ~1, (y1 - y0) & ~1]
    }
  }
  const lienzo = document.createElement('canvas')
  lienzo.width = w
  lienzo.height = h
  const c2 = lienzo.getContext('2d')
  const leer = () => { const a = new Uint8Array(w * h * 4); ctx.readPixels(0, 0, w, h, ctx.RGBA, ctx.UNSIGNED_BYTE, a); return a }
  const png = (a) => { const img = c2.createImageData(w, h); for (let y = 0; y < h; y += 1) img.data.set(a.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4); c2.putImageData(img, 0, 0); return lienzo.toDataURL('image/png').split(',')[1] }
  const leidos = []
  for (const k of ${JSON.stringify(variantes)}) { preparar(k); gl.render(escena, camara); leidos.push(leer()) }
  preparar(${JSON.stringify(variantes[0])})
  const distintos = leidos.map((a) => {
    let [enElLogo, enTodo, maxima] = [0, 0, 0]
    for (let i = 0; i < a.length; i += 4) {
      const d = Math.max(Math.abs(a[i] - leidos[0][i]), Math.abs(a[i + 1] - leidos[0][i + 1]), Math.abs(a[i + 2] - leidos[0][i + 2]))
      maxima = Math.max(maxima, d)
      if (d <= 2) continue
      enTodo += 1
      const p = i / 4
      const [x, y] = [p % w, h - 1 - Math.floor(p / w)]
      if (caja && x >= caja[0] && x < caja[0] + caja[2] && y >= caja[1] && y < caja[1] + caja[3]) enElLogo += 1
    }
    return { enElLogo, enTodo, maxima }
  })
  return { ancho: w, alto: h, logo: caja, distintos, pngs: leidos.map(png) }
})()`
}

/** Corre el mismo cuadro y guarda cada variante como `<base>-<variante>.png`. */
export async function guardarMismoCuadro(b: Banco, variantes: readonly string[], preparar: string, base: string): Promise<MismoCuadro> {
  const r = await medir<MismoCuadro>(b.p, mismoCuadro(variantes, preparar))
  r.pngs.forEach((png, k) => writeFileSync(`${base}-${variantes[k]}.png`, Buffer.from(png, 'base64')))
  return r
}
