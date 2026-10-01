/**
 * [NAVBAR] T3 · LA LENTE DEL VIDRIO — el mapa de desplazamiento con que el fondo se curva cerca del borde del menú.
 *
 * El vidrio líquido de iOS es una losa con el borde redondeado como una lente: en el centro deja ver el fondo tal cual
 * y cerca del borde lo curva hacia adentro (lo que está justo afuera del panel aparece adentro, comprimido). Acá eso es
 * un `feDisplacementMap` en el `backdrop-filter` (sólo Chromium lo pinta: Safari no acepta filtros SVG en el
 * `backdrop-filter`, ver `LenteDelVidrio.tsx`). El mapa codifica, para cada punto del panel, hacia dónde se toma el
 * fondo: rojo para x, verde para y, 128 es «quieto».
 *
 * La forma: la distancia firmada al rectángulo redondeado del panel y su normal. Adentro de la banda del borde (`borde`)
 * el desplazamiento apunta hacia adentro y crece hacia el filo con una curva (`PERFIL`): plano en el centro, como una
 * losa, y curvo en el canto. Puro y sin DOM: lo prueba `s39-navbar`.
 */

/** El ancho de la banda que curva, en px del panel: lo que en iOS es el canto. */
export const BORDE_DE_LA_LENTE = 36
/** Cuánto se corre el fondo en el filo, en px (la escala del `feDisplacementMap`): mitad hacia cada lado del 128. */
export const ESCALA_DE_LA_LENTE = 72
/** La curva del canto: con más de 1, plana adentro y empinada en el filo. */
const PERFIL = 2.2
/** El mapa se genera a la mitad de la resolución y se estira: es una curva suave, no necesita más. */
export const RESOLUCION_DEL_MAPA = 0.5

export interface MapaDeLaLente {
  readonly ancho: number
  readonly alto: number
  /** RGBA, fila por fila. */
  readonly pixeles: Uint8ClampedArray
}

/** El desplazamiento normalizado (−1 a 1 en cada eje, hacia adentro) en el punto (x, y) de un panel de ancho × alto. */
export function desplazamientoEn(x: number, y: number, ancho: number, alto: number, radio: number, borde: number): readonly [number, number] {
  const px = x - ancho / 2
  const py = y - alto / 2
  const qx = Math.abs(px) - (ancho / 2 - radio)
  const qy = Math.abs(py) - (alto / 2 - radio)
  const ox = Math.max(qx, 0)
  const oy = Math.max(qy, 0)
  const largo = Math.hypot(ox, oy)
  // La distancia firmada al borde (negativa adentro) y la normal hacia afuera.
  const d = largo + Math.min(Math.max(qx, qy), 0) - radio
  let [nx, ny] = largo > 0 ? [ox / largo, oy / largo] : qx > qy ? [1, 0] : [0, 1]
  nx *= Math.sign(px) || 1
  ny *= Math.sign(py) || 1
  const adentro = Math.min(1, Math.max(0, -d / borde))
  const fuerza = (1 - adentro) ** PERFIL
  // Hacia adentro: el fondo se toma del lado del centro.
  return [-nx * fuerza, -ny * fuerza]
}

/** El mapa entero, a `RESOLUCION_DEL_MAPA` del panel. */
export function mapaDeLaLente(anchoDelPanel: number, altoDelPanel: number, radio: number, borde = BORDE_DE_LA_LENTE): MapaDeLaLente {
  const k = RESOLUCION_DEL_MAPA
  const ancho = Math.max(1, Math.round(anchoDelPanel * k))
  const alto = Math.max(1, Math.round(altoDelPanel * k))
  const pixeles = new Uint8ClampedArray(ancho * alto * 4)
  for (let j = 0; j < alto; j += 1) {
    for (let i = 0; i < ancho; i += 1) {
      const [dx, dy] = desplazamientoEn((i + 0.5) / k, (j + 0.5) / k, anchoDelPanel, altoDelPanel, radio, borde)
      const o = (j * ancho + i) * 4
      pixeles[o] = 128 + 127 * dx
      pixeles[o + 1] = 128 + 127 * dy
      pixeles[o + 2] = 128
      pixeles[o + 3] = 255
    }
  }
  return { ancho, alto, pixeles }
}
