import type * as THREE from 'three'

/**
 * [ESCENA 3] E4 · DÓNDE HAY TEXTO — para que el anillo del pulso no le baje el contraste.
 *
 * Junta las cajas de los bloques de texto que están en pantalla, las une cuando se tocan (con la
 * pluma de margen) y se queda con las más grandes. Las devuelve en píxeles del búfer de dibujo con
 * el origen abajo a la izquierda, que es como las compara el shader contra `gl_FragCoord`. Lee el
 * DOM, así que se llama con freno (`Entorno.tsx`), y sólo mientras hay anillos vivos.
 */

const TEXTO = 'h1, h2, h3, h4, h5, h6, p, li, dt, dd, blockquote, figcaption, a, button, label'

interface Caja {
  x0: number
  y0: number
  x1: number
  y1: number
}

const seTocan = (a: Caja, b: Caja, m: number): boolean =>
  a.x0 - m <= b.x1 && b.x0 - m <= a.x1 && a.y0 - m <= b.y1 && b.y0 - m <= a.y1

/** Escribe hasta `destino.length` cajas; las que sobran quedan vacías (x1 < x0). Devuelve cuántas. */
export function leerCajasDeTexto(lienzo: HTMLCanvasElement, destino: THREE.Vector4[], plumaCss: number): number {
  const r = lienzo.getBoundingClientRect()
  const escala = r.width > 0 ? lienzo.width / r.width : 1
  const cajas: Caja[] = []
  for (const el of document.querySelectorAll(TEXTO)) {
    const c = el.getBoundingClientRect()
    if (c.width < 4 || c.height < 4) continue
    if (c.bottom < r.top || c.top > r.bottom || c.right < r.left || c.left > r.right) continue
    if ((el.textContent ?? '').trim() === '') continue
    cajas.push({ x0: c.left, y0: c.top, x1: c.right, y1: c.bottom })
  }
  // Unir las que se tocan, hasta que no quede ninguna por unir.
  let unidas = true
  while (unidas) {
    unidas = false
    for (let i = 0; i < cajas.length && !unidas; i += 1) {
      for (let j = i + 1; j < cajas.length; j += 1) {
        if (!seTocan(cajas[i], cajas[j], plumaCss)) continue
        const a = cajas[i]
        const b = cajas[j]
        cajas[i] = { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }
        cajas.splice(j, 1)
        unidas = true
        break
      }
    }
  }
  cajas.sort((a, b) => (b.x1 - b.x0) * (b.y1 - b.y0) - (a.x1 - a.x0) * (a.y1 - a.y0))
  const n = Math.min(cajas.length, destino.length)
  for (let i = 0; i < destino.length; i += 1) {
    if (i >= n) {
      destino[i].set(-1, -1, -2, -2)
      continue
    }
    const c = cajas[i]
    destino[i].set((c.x0 - r.left) * escala, (r.bottom - c.y1) * escala, (c.x1 - r.left) * escala, (r.bottom - c.y0) * escala)
  }
  return n
}
