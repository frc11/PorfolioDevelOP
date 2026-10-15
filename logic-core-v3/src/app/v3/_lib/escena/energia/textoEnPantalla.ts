import * as THREE from 'three'

/**
 * [PULIDO 13] K6 · LO QUE ES TEXTO EN LA PANTALLA, para que lo que vuela por la escena pase por detrás (era de los hilos; [PULIDO 14]
 * L3 · de los destellos; [PULIDO 15] M2 · lo usan las cargas y los arcos, en el sombreador y al elegir dónde salta un arco). Las cajas
 * del texto a la vista (los títulos 3D también: su lugar lo marca el DOM transparente), con su aire, las más grandes primero, en NDC
 * (x0, y0, x1, y1).
 */
export const TEXTO_EN_PANTALLA = { cajas: 8, margenPx: 14, cadaMs: 200, conScrollMs: 50 } as const

const CAJA_DEL_LOGO = new THREE.Box3()
const ESQUINA = new THREE.Vector3()

/**
 * [PULIDO 27] Z2 · la caja del logo en la pantalla (NDC: x0, y0, x1, y1 y, en el quinto, 1 si vale): su caja del mundo (gira con él)
 * proyectada; detrás de la cámara, no vale. La red en reposo no se forma delante (`cajas.ts`).
 */
export function cajaDelLogo(logo: THREE.Object3D, camara: THREE.Camera, destino: Float32Array): void {
  destino[4] = 0
  CAJA_DEL_LOGO.setFromObject(logo)
  if (CAJA_DEL_LOGO.isEmpty()) return
  const { min, max } = CAJA_DEL_LOGO
  destino[0] = Number.POSITIVE_INFINITY
  destino[1] = Number.POSITIVE_INFINITY
  destino[2] = Number.NEGATIVE_INFINITY
  destino[3] = Number.NEGATIVE_INFINITY
  for (let k = 0; k < 8; k += 1) {
    ESQUINA.set(k & 1 ? max.x : min.x, k & 2 ? max.y : min.y, k & 4 ? max.z : min.z).project(camara)
    if (ESQUINA.z > 1) return
    destino[0] = Math.min(destino[0], ESQUINA.x)
    destino[1] = Math.min(destino[1], ESQUINA.y)
    destino[2] = Math.max(destino[2], ESQUINA.x)
    destino[3] = Math.max(destino[3], ESQUINA.y)
  }
  destino[4] = 1
}

// [PULIDO 21] S2 · las tarjetas de las demos, por su estante y su carrusel enteros (una caja: no gastan los lugares de a una).
const ENTERAS = 'a, button, [data-pieza="estante"], [data-pieza="carrusel"]'
const SELECTOR_DEL_TEXTO = `[data-v3] :is(h1, h2, h3, p, li, blockquote, figcaption, ${ENTERAS}):not([data-pieza="libro"], [data-parte="portada"])`

let rango: Range | null = null

/**
 * Escribe las cajas en `destino` y devuelve cuántas. [PULIDO 16] N2 · la caja de un texto es la de lo que ocupa su texto (un rango
 * sobre su contenido): la del bloque (un `h1` o un `p` ocupan todo el ancho de su columna) tapaba media pantalla en el teléfono y
 * dejaba sin arcos ni pulsos a lo que no tiene letras encima. Los enlaces y los botones, su caja entera (su fondo, su borde). Y sólo
 * lo que se ve: el menú del teléfono, cerrado (transparente), tenía sus enlaces en el medio de la pantalla y la vedaba entera.
 */
export function cajasDelTexto(destino: readonly THREE.Vector4[], ancho: number, alto: number): number {
  const m = TEXTO_EN_PANTALLA.margenPx
  const cajas: [number, number, number, number, number][] = []
  rango ??= document.createRange()
  for (const el of document.querySelectorAll(SELECTOR_DEL_TEXTO)) {
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue
    let r = el.getBoundingClientRect()
    if (!el.matches(ENTERAS)) {
      rango.selectNodeContents(el)
      r = rango.getBoundingClientRect()
    }
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > alto || r.right < 0 || r.left > ancho) continue
    // [PULIDO 21] S2 · una caja que envuelve la pantalla entera no es un texto: en Demos, los enlaces de las tarjetas del túnel que ya
    // pasaron (escalados más allá de la cámara) la tapaban toda y no quedaba un arco ni la red.
    if (r.left <= 0 && r.top <= 0 && r.right >= ancho && r.bottom >= alto) continue
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
