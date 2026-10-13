/**
 * [RETOQUE DEL PIE] P2 · LA TRANSFORMADA QUE DEJA LO INTERACTIVO SOBRE SU PIEZA — pura: la homografía que lleva la caja
 * de un elemento (0,0)–(ancho,alto) al cuadrilátero donde la cámara de este cuadro ve la cara de su pieza (las cuatro
 * esquinas en px, relativas a la esquina de arriba a la izquierda de la caja: arriba izquierda, arriba derecha, abajo
 * derecha, abajo izquierda), como `matrix3d` de CSS (por columnas, con `transform-origin` en 0 0). Con la cámara quieta
 * es la identidad; con el paralaje, el corrimiento y la perspectiva de la cara: el campo, el enlace y su anillo de foco
 * quedan pegados a la placa. La cuenta es la de Heckbert (cuadrado → cuadrilátero), escalada a la caja.
 */
export type Cuadrilatero = readonly [number, number, number, number, number, number, number, number]

/** Escribe en `m` (16 números) la `matrix3d` que lleva la caja al cuadrilátero; `false` si el cuadrilátero es degenerado. */
export function homografia(ancho: number, alto: number, q: Cuadrilatero | ArrayLike<number>, m: number[]): boolean {
  if (ancho <= 0 || alto <= 0 || q.length < 8) return false
  const [x0, y0, x1, y1, x2, y2, x3, y3] = [q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7]]
  const sx = x0 - x1 + x2 - x3
  const sy = y0 - y1 + y2 - y3
  const [c, f] = [x0, y0]
  let [a, b, d, e, g, h] = [x1 - x0, x3 - x0, y1 - y0, y3 - y0, 0, 0]
  if (Math.abs(sx) > 1e-9 || Math.abs(sy) > 1e-9) {
    const [dx1, dx2, dy1, dy2] = [x1 - x2, x3 - x2, y1 - y2, y3 - y2]
    const den = dx1 * dy2 - dx2 * dy1
    if (Math.abs(den) < 1e-12) return false
    g = (sx * dy2 - dx2 * sy) / den
    h = (dx1 * sy - sx * dy1) / den
    ;[a, b, d, e] = [x1 - x0 + g * x1, x3 - x0 + h * x3, y1 - y0 + g * y1, y3 - y0 + h * y3]
  }
  // De la caja al cuadrado: x / ancho, y / alto.
  ;[a, d, g] = [a / ancho, d / ancho, g / ancho]
  ;[b, e, h] = [b / alto, e / alto, h / alto]
  m.length = 16
  m[0] = a
  m[1] = d
  m[2] = 0
  m[3] = g
  m[4] = b
  m[5] = e
  m[6] = 0
  m[7] = h
  m[8] = 0
  m[9] = 0
  m[10] = 1
  m[11] = 0
  m[12] = c
  m[13] = f
  m[14] = 0
  m[15] = 1
  return true
}

/**
 * [PULIDO 22] T2 b · NÍTIDO: con la cara casi de frente (el cuadrilátero, un paralelogramo a menos de `tope` px), una transformada 2D
 * (`matrix`, el promedio de los lados, el centro en su lugar, la traslación redondeada): Chrome rasteriza el texto a su escala (con
 * `matrix3d` lo rasterizaba chico y lo estiraba: los campos se veían borrosos). Si no, `null` (la homografía de siempre).
 */
export function transformadaNitida(ancho: number, alto: number, q: ArrayLike<number>, tope = 3): string | null {
  if (ancho <= 0 || alto <= 0 || q.length < 8) return null
  if (Math.abs(q[0] - q[2] + q[4] - q[6]) > tope || Math.abs(q[1] - q[3] + q[5] - q[7]) > tope) return null
  const a = (q[2] - q[0] + q[4] - q[6]) / (2 * ancho)
  const b = (q[3] - q[1] + q[5] - q[7]) / (2 * ancho)
  const c = (q[6] - q[0] + q[4] - q[2]) / (2 * alto)
  const d = (q[7] - q[1] + q[5] - q[3]) / (2 * alto)
  const e = Math.round((q[0] + q[2] + q[4] + q[6]) / 4 - (a * ancho + c * alto) / 2)
  const f = Math.round((q[1] + q[3] + q[5] + q[7]) / 4 - (b * ancho + d * alto) / 2)
  return `matrix(${[a, b, c, d].map((v) => v.toFixed(5)).join(',')},${String(e)},${String(f)})`
}

/** La `matrix3d` en CSS (con pocos decimales: lo que se escribe por cuadro es corto y se compara barato). */
export function matrix3dCss(m: readonly number[]): string {
  return `matrix3d(${m.map((v, k) => (k === 3 || k === 7 ? v.toExponential(4) : v.toFixed(4))).join(',')})`
}

/** Lleva un punto de la caja por la matriz (lo usa el invariante para comprobar las esquinas). */
export function aplicar(m: readonly number[], x: number, y: number): [number, number] {
  const w = m[3] * x + m[7] * y + m[15]
  return [(m[0] * x + m[4] * y + m[12]) / w, (m[1] * x + m[5] * y + m[13]) / w]
}
