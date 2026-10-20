/**
 * [P-H31a] EL CORTE DIAGONAL DE PRUEBA, PURO — el recorte del paso que entra en las historias de la galería (`GaleriaHistorias.tsx`):
 * hacia adelante destapa desde abajo a la derecha, hacia atrás desde arriba a la izquierda, con la curva del velo (1 − (1 − t)²). Es la
 * forma que servicios usa para su precio; ésta sólo prueba la transición del componente común fuera del Portfolio.
 */

const curva = (t: number): number => 1 - (1 - t) * (1 - t)
const pct = (n: number): string => `${n.toFixed(2)}%`

/** El `clip-path` del que entra con el avance de la transición (0 → 1): en 1, sin recorte. */
export function recorteDiagonal(avance: number, sentido: 1 | -1): string {
  if (avance >= 1) return 'none'
  // La línea x + y = s barre el cuadro de 200 % a 0 % (adelante: queda lo de abajo a la derecha) o de 0 % a 200 % (atrás).
  const e = curva(Math.max(0, avance))
  if (sentido === 1) {
    const s = 200 * (1 - e)
    return s <= 100
      ? `polygon(${pct(s)} 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${pct(s)})`
      : `polygon(100% ${pct(s - 100)}, 100% 100%, ${pct(s - 100)} 100%)`
  }
  const s = 200 * e
  return s <= 100 ? `polygon(0% 0%, ${pct(s)} 0%, 0% ${pct(s)})` : `polygon(0% 0%, 100% 0%, 100% ${pct(s - 100)}, ${pct(s - 100)} 100%, 0% 100%)`
}

/** El área que deja ver un recorte (0 a 10.000, en % cuadrados): para la prueba. */
export function areaDelRecorte(recorte: string): number {
  if (recorte === 'none') return 10_000
  const puntos = [...recorte.matchAll(/(-?[\d.]+)% (-?[\d.]+)%/g)].map((m) => [Number(m[1]), Number(m[2])] as const)
  let doble = 0
  for (let i = 0; i < puntos.length; i++) {
    const a = puntos[i]
    const b = puntos[(i + 1) % puntos.length]
    if (a !== undefined && b !== undefined) doble += a[0] * b[1] - b[0] * a[1]
  }
  return Math.abs(doble) / 2
}
