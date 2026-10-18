/**
 * [B1.2b] P-H11 · ¿EL PÓSTER CUBRE EL CUADRO? — una banda es una franja pegada a un borde, de filas o columnas enteras de un solo
 * color (la luminancia casi pareja en cada línea, y todas del color de la primera). El póster del teléfono de El Garage salió de un
 * `recordVideo` del tamaño del cuadro con el viewport en píxeles CSS: la captura en el cuarto de arriba a la izquierda y el resto gris
 * (bandas del 50 % abajo y a la derecha: la caja del contenido, un 25 % del cuadro). Los márgenes de un sitio (una barra lisa, un marco,
 * el degradé oscuro del pie de una portada) son bandas más chicas: hasta ~15 % en los seis medios, con la caja del contenido en el 81 %
 * o más. Pura: la usan s76 (sobre los pósters, decodificados por ffmpeg) y quien codifique.
 */
export const BANDA_MAXIMA = 0.25
/** La caja del contenido (el cuadro menos las bandas de los cuatro bordes), como fracción del cuadro. */
export const AREA_MINIMA = 0.7

/** Cuánto de una línea puede variar la luminancia (desvío, en niveles de 0 a 255) y cuánto puede apartarse del color de la banda. */
const PAREJA = 1.5
const MISMO_COLOR = 3

export interface Bandas {
  readonly arriba: number
  readonly abajo: number
  readonly izquierda: number
  readonly derecha: number
}

/** Las bandas de cada borde, como fracción del alto (arriba, abajo) o del ancho (izquierda, derecha), de una imagen RGBA. */
export function bandasDelBorde(rgba: Uint8Array, ancho: number, alto: number): Bandas {
  const luz = (x: number, y: number): number => {
    const i = (y * ancho + x) * 4
    return 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]
  }
  // Media y desvío de una línea: la fila `k` (horizontal) o la columna `k`.
  const linea = (k: number, horizontal: boolean): { readonly media: number; readonly desvio: number } => {
    const n = horizontal ? ancho : alto
    let s = 0
    let s2 = 0
    for (let j = 0; j < n; j += 1) {
      const v = horizontal ? luz(j, k) : luz(k, j)
      s += v
      s2 += v * v
    }
    const media = s / n
    return { media, desvio: Math.sqrt(Math.max(0, s2 / n - media * media)) }
  }
  const corrida = (orden: readonly number[], horizontal: boolean): number => {
    let color: number | null = null
    let n = 0
    for (const k of orden) {
      const l = linea(k, horizontal)
      if (l.desvio >= PAREJA || (color !== null && Math.abs(l.media - color) > MISMO_COLOR)) break
      color ??= l.media
      n += 1
    }
    return n
  }
  const filas = Array.from({ length: alto }, (_, k) => k)
  const columnas = Array.from({ length: ancho }, (_, k) => k)
  return {
    arriba: corrida(filas, true) / alto,
    abajo: corrida([...filas].reverse(), true) / alto,
    izquierda: corrida(columnas, false) / ancho,
    derecha: corrida([...columnas].reverse(), false) / ancho,
  }
}

/** La fracción del cuadro que ocupa la caja del contenido. */
export function areaDelContenido(b: Bandas): number {
  return Math.max(0, 1 - b.arriba - b.abajo) * Math.max(0, 1 - b.izquierda - b.derecha)
}

/** El póster cubre el cuadro: ninguna banda pasa de `BANDA_MAXIMA` y la caja del contenido ocupa `AREA_MINIMA` o más. */
export function cubreElCuadro(b: Bandas): boolean {
  return Math.max(b.arriba, b.abajo, b.izquierda, b.derecha) <= BANDA_MAXIMA && areaDelContenido(b) >= AREA_MINIMA
}
