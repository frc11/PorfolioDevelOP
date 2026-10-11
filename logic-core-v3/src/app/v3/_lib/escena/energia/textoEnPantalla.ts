import * as THREE from 'three'

/**
 * [PULIDO 13] K6 · LO QUE ES TEXTO EN LA PANTALLA, para que lo que vuela por la escena pase por detrás (era de los hilos; [PULIDO 14]
 * L3 · de los destellos; [PULIDO 15] M2 · lo usan las cargas y los arcos, en el sombreador y al elegir dónde salta un arco). Las cajas
 * del texto a la vista (los títulos 3D también: su lugar lo marca el DOM transparente), con su aire, las más grandes primero, en NDC
 * (x0, y0, x1, y1).
 */
export const TEXTO_EN_PANTALLA = { cajas: 8, margenPx: 14, cadaMs: 200 } as const

const SELECTOR_DEL_TEXTO = '[data-v3] :is(h1, h2, h3, p, li, a, button, blockquote, figcaption)'

/** Escribe las cajas en `destino` y devuelve cuántas. */
export function cajasDelTexto(destino: readonly THREE.Vector4[], ancho: number, alto: number): number {
  const m = TEXTO_EN_PANTALLA.margenPx
  const cajas: [number, number, number, number, number][] = []
  for (const el of document.querySelectorAll(SELECTOR_DEL_TEXTO)) {
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > alto || r.right < 0 || r.left > ancho) continue
    cajas.push([r.left - m, r.top - m, r.right + m, r.bottom + m, r.width * r.height])
  }
  cajas.sort((a, b) => b[4] - a[4])
  const n = Math.min(cajas.length, destino.length)
  for (let i = 0; i < n; i += 1) {
    const [l, t, d, b] = cajas[i]
    destino[i].set((l / ancho) * 2 - 1, 1 - (b / alto) * 2, (d / ancho) * 2 - 1, 1 - (t / alto) * 2)
  }
  return n
}
