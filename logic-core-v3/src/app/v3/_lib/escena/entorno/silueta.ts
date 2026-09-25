/**
 * [ESCENA 3] LA SILUETA DEL LOGO PARA EL HOVER — pura: puntos → envolvente convexa, y punto → ¿adentro?
 *
 * El hover no puede ir contra la malla (la «cp» tiene agujeros y titila) ni contra la caja (cuenta las
 * esquinas vacías). La envolvente convexa de la «cp» no tiene ninguna de las dos cosas: cubre los
 * agujeros y el hueco entre las letras, y deja afuera las esquinas de la caja que el logo no toca.
 */

export type Punto = readonly [number, number]

const cruz = (o: Punto, a: Punto, b: Punto): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

/** La envolvente convexa (cadena monótona de Andrew), en sentido antihorario y sin repetir el primero. */
export function envolventeConvexa(puntos: readonly Punto[]): Punto[] {
  const p = [...puntos].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (p.length < 3) return p
  const abajo: Punto[] = []
  for (const q of p) {
    while (abajo.length >= 2 && cruz(abajo[abajo.length - 2], abajo[abajo.length - 1], q) <= 0) abajo.pop()
    abajo.push(q)
  }
  const arriba: Punto[] = []
  for (let i = p.length - 1; i >= 0; i -= 1) {
    const q = p[i]
    while (arriba.length >= 2 && cruz(arriba[arriba.length - 2], arriba[arriba.length - 1], q) <= 0) arriba.pop()
    arriba.push(q)
  }
  abajo.pop()
  arriba.pop()
  return [...abajo, ...arriba]
}

/** ¿El punto está adentro (o en el borde) del polígono convexo antihorario? */
export function dentroDelConvexo(poligono: readonly Punto[], x: number, y: number): boolean {
  if (poligono.length < 3) return false
  for (let i = 0; i < poligono.length; i += 1) {
    if (cruz(poligono[i], poligono[(i + 1) % poligono.length], [x, y]) < 0) return false
  }
  return true
}
