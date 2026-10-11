import type { Campo } from '../arcos/camino'
import type { RayoDelPuntero } from '../fisica/fisica'

/**
 * [PULIDO 16] N2 · EXPERIMENTO (`?plasma-campo=si`, apagado): con el botón apretado aparecen, tenues, LAS LÍNEAS DEL CAMPO alrededor
 * del puntero y del logo; al soltar se desvanecen. Cada línea sale de una semilla (en un círculo alrededor del puntero, de frente a
 * la cámara, y en una esfera alrededor del logo) y sigue al campo de a pasos fijos. Sin reservas: los puntos viven en un búfer fijo.
 */
export const LINEAS = {
  /** Cuántas semillas (la mitad alrededor del puntero, la mitad del logo), cuántos pasos y de cuánto (u). */
  semillas: 16,
  pasos: 14,
  paso: 0.42,
  /** El radio de las semillas: alrededor del puntero y del logo (u); hasta dónde siguen (u del centro). */
  radioDelPuntero: 0.45,
  radioDelLogo: 4.4,
  hasta: 15,
  /** Lo tenues que son (su resplandor) y su ancho (parte del de un arco). */
  brillo: 1.1,
  ancho: 0.32,
} as const

export interface LineasDeCampo {
  readonly puntos: Float32Array
  readonly largos: Int32Array
  /** Cuánto se ven (0 a 1): sigue al botón. */
  visible: number
}

export function crearLineas(): LineasDeCampo {
  return { puntos: new Float32Array(LINEAS.semillas * (LINEAS.pasos + 1) * 3), largos: new Int32Array(LINEAS.semillas), visible: 0 }
}

const E = new Float32Array(3)
const U = new Float32Array(3)
const W = new Float32Array(3)

/** Sigue al campo desde (x, y, z): escribe la línea `l` y su largo (en tramos). */
function seguir(l: LineasDeCampo, k: number, x: number, y: number, z: number, campo: Campo): void {
  const o = k * (LINEAS.pasos + 1) * 3
  l.puntos[o] = x
  l.puntos[o + 1] = y
  l.puntos[o + 2] = z
  let n = 0
  for (let s = 1; s <= LINEAS.pasos; s += 1) {
    campo(x, y, z, E)
    const e = Math.hypot(E[0], E[1], E[2])
    if (e < 1e-5) break
    x += (E[0] / e) * LINEAS.paso
    y += (E[1] / e) * LINEAS.paso
    z += (E[2] / e) * LINEAS.paso
    l.puntos[o + s * 3] = x
    l.puntos[o + s * 3 + 1] = y
    l.puntos[o + s * 3 + 2] = z
    n = s
    if (Math.hypot(x, y, z) > LINEAS.hasta) break
  }
  l.largos[k] = n
}

/** Las líneas de este cuadro: alrededor del puntero (en `punto`, de frente a su rayo) y del logo (en el centro). */
export function trazarLineas(l: LineasDeCampo, campo: Campo, rayo: RayoDelPuntero | null, punto: Float32Array): void {
  const mitad = LINEAS.semillas / 2
  // Alrededor del puntero: un círculo de frente al rayo (dos ejes perpendiculares a su dirección).
  if (rayo !== null) {
    U[0] = -rayo.dz
    U[1] = 0
    U[2] = rayo.dx
    const lu = Math.hypot(U[0], U[2]) || 1
    U[0] /= lu
    U[2] /= lu
    W[0] = rayo.dy * U[2] - rayo.dz * U[1]
    W[1] = rayo.dz * U[0] - rayo.dx * U[2]
    W[2] = rayo.dx * U[1] - rayo.dy * U[0]
    for (let k = 0; k < mitad; k += 1) {
      const a = (k / mitad) * Math.PI * 2
      const c = Math.cos(a) * LINEAS.radioDelPuntero
      const s = Math.sin(a) * LINEAS.radioDelPuntero
      seguir(l, k, punto[0] + U[0] * c + W[0] * s, punto[1] + U[1] * c + W[1] * s, punto[2] + U[2] * c + W[2] * s, campo)
    }
  } else for (let k = 0; k < mitad; k += 1) l.largos[k] = 0
  // Alrededor del logo: direcciones repartidas en una esfera (la espiral de Fibonacci).
  for (let k = 0; k < mitad; k += 1) {
    const y = 1 - (2 * (k + 0.5)) / mitad
    const r = Math.sqrt(1 - y * y)
    const fi = k * 2.399963
    seguir(l, mitad + k, Math.cos(fi) * r * LINEAS.radioDelLogo, y * LINEAS.radioDelLogo, Math.sin(fi) * r * LINEAS.radioDelLogo, campo)
  }
}
