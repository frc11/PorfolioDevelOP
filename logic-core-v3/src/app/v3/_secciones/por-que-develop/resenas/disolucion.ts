/**
 * [NOCTURNO B2] LOS SEIS VALORES SE VAN EN EL AIRE — puro (lo recorre `s83`). De día, sin partículas: cada valor sube un poco, se
 * desenfoca y se apaga, de a pares y de ABAJO hacia arriba (el orden en que llegaron: `geometria.ts`, `ventanaDelValor`). Función del avance
 * de la disolución (0 a 1): para atrás, vuelven por el mismo camino. En 0 no queda nada escrito (la medida de los valores para la
 * transformación al CTA los lee planos).
 */

export const DISOLUCION = {
  /** Cuánto se corre cada fila (fracción de la disolución) y cuánto dura la de cada valor. */
  escalon: 0.18,
  dura: 0.64,
  /** Cuánto sube (svh), cuánto se desenfoca (px) y cuánto crece al irse. */
  subeSvh: 3,
  desenfoquePx: 9,
  crece: 0.04,
} as const

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))

/** Cuánto se fue el valor `indice` (0 a 5, en el orden de `VALORES`) con la disolución `d`. */
export function idaDelValor(d: number, indice: number): number {
  const fila = 2 - (indice % 3)
  const u = acotar01((d - fila * DISOLUCION.escalon) / DISOLUCION.dura)
  return u * u * (3 - 2 * u)
}

/** Lo que se le escribe al valor (`null`: nada, en su lugar). */
export function estiloDeLaIda(u: number): { readonly opacity: string; readonly filter: string; readonly translate: string; readonly scale: string } | null {
  if (u <= 0) return null
  return {
    opacity: (1 - u).toFixed(3),
    filter: `blur(${(u * DISOLUCION.desenfoquePx).toFixed(2)}px)`,
    translate: `0 ${(-u * DISOLUCION.subeSvh).toFixed(3)}svh`,
    scale: (1 + u * DISOLUCION.crece).toFixed(4),
  }
}
