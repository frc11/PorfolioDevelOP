/**
 * LA CUENTA DE LA AMPLIACIÓN — dónde termina la imagen y cómo se la lleva desde
 * su marco (elemento compartido, FLIP). Funciones puras: el componente mide y
 * anima, acá sólo se calcula.
 */

/** Una caja en coordenadas de viewport. */
export interface Caja {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** 16:10, la proporción del marco de la tarjeta. */
export const RELACION_DEL_MARCO = 16 / 10

/**
 * La caja final de la imagen: lo más grande que entre con `margen` a los cuatro
 * lados y `pie` px abajo para el título, centrada en lo que queda.
 */
export function cajaAmpliada(anchoDePantalla: number, altoDePantalla: number, margen: number, pie: number): Caja {
  const anchoLibre = Math.max(0, anchoDePantalla - 2 * margen)
  const altoLibre = Math.max(0, altoDePantalla - 2 * margen - pie)
  const width = Math.min(anchoLibre, altoLibre * RELACION_DEL_MARCO)
  const height = width / RELACION_DEL_MARCO
  return {
    left: (anchoDePantalla - width) / 2,
    top: (altoDePantalla - pie - height) / 2,
    width,
    height,
  }
}

/** La transformada que pone la caja `hasta` exactamente encima de `desde` (origen arriba a la izquierda). */
export function transformadaEntre(desde: Caja, hasta: Caja): string {
  if (hasta.width === 0 || hasta.height === 0) return 'none'
  const dx = desde.left - hasta.left
  const dy = desde.top - hasta.top
  return `translate(${dx}px, ${dy}px) scale(${desde.width / hasta.width}, ${desde.height / hasta.height})`
}

/** El índice siguiente o anterior, dando la vuelta. */
export function vecino(indice: number, paso: 1 | -1, total: number): number {
  return (indice + paso + total) % total
}

/** Lee un token del tema en el navegador. Vacío si no hay documento. */
export function leerToken(nombre: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
}

/** Un token de largo (`5rem`, `80px`) en px, con la raíz del documento. */
export function pixelesDe(valor: string): number {
  const n = Number.parseFloat(valor)
  if (!Number.isFinite(n)) return 0
  if (!valor.trim().endsWith('rem')) return n
  const raiz = typeof document === 'undefined' ? Number.NaN : Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(raiz) ? n * raiz : 0
}

/** Un token de duración (`500ms`, `0.5s`) en milisegundos. */
export function milisegundosDe(valor: string): number {
  const n = Number.parseFloat(valor)
  if (!Number.isFinite(n)) return 0
  return valor.trim().endsWith('ms') ? n : n * 1000
}
