/**
 * [M2] LA CUENTA DEL HILO DE LECTURA — dónde va la aguja del hilo (px desde el tope del texto de la nota) para el texto con su tope en `tope`
 * (coordenadas del cuadro) y `alto` px, con la línea de lectura a `lineaPx` del borde de arriba del cuadro: la aguja está EN la línea de lectura
 * mientras el texto la cruza (al lado de lo que se está leyendo), clavada arriba antes y abajo después. Total y acotada.
 */
export const LINEA_DE_LECTURA = 0.4

export function posicionDeLaAguja(tope: number, alto: number, lineaPx: number): number {
  if (!(alto > 0)) return 0
  const p = lineaPx - tope
  return p < 0 ? 0 : p > alto ? alto : p
}

/** Lo leído (0 → 1): la aguja sobre el alto del texto. */
export const avanceDelHilo = (tope: number, alto: number, lineaPx: number): number => (alto > 0 ? posicionDeLaAguja(tope, alto, lineaPx) / alto : 1)

/** Las dos formas del hilo que se probaron (`M2-resultado.md`): al costado de la columna (la elegida) y la barra de arriba (`?hilo=barra`). */
export type FormaDelHilo = 'costado' | 'barra'

/** La forma pedida por la URL: `?hilo=barra` muestra la barra de arriba; cualquier otra cosa, el hilo al costado. */
export const formaDelHiloPedida = (busqueda: string): FormaDelHilo => (new URLSearchParams(busqueda).get('hilo') === 'barra' ? 'barra' : 'costado')
