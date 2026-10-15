import type { Brasas } from './brasas'
import { cruzaUnaCaja } from './cajas'
import { coordenadasDe, type Dominio } from './dominio'
import { CELDA, celdaDe, indice } from './grilla'
import type { Red } from './reposo'

/**
 * [PULIDO 27] Z2 · `?red=toda`: TODO CONECTADO. Al formarse la red en reposo, un ÁRBOL que une todas las brasas que se ven por sus vecinas
 * más cercanas: el de largo mínimo (Kruskal) sobre las `vecinas` más cercanas de cada una (por la grilla del último paso), al alcance en
 * el mundo y en el cuadro, sin cruzar las cajas de los textos ni del logo (`cajas.ts`); se enciende del centro del cuadro hacia afuera
 * en la formación. Sin ciclos: cada brasa, unida a todas por un solo camino. Puro (Node), sin reservas (los búferes son de la red).
 */
export const ARBOL = {
  /** Cuántas vecinas candidatas por brasa, hasta qué distancia en el mundo (u) y en el cuadro (NDC), y en qué parte de la formación se termina de encender. */
  vecinas: 8,
  alcance: 4.5,
  enElCuadro: 0.34,
  enciende: 0.7,
} as const

/** Las mejores vecinas de la brasa de turno: su distancia al cuadrado y su índice (de menor a mayor). */
const MEJOR_D = new Float64Array(ARBOL.vecinas)
const MEJOR_J = new Int32Array(ARBOL.vecinas)

/** ¿Se ve la brasa `i` (viva, en el cuadro y fuera de las cajas)? Sus coordenadas quedan en `EN_EL_DOMINIO`. */
function seVe(r: Red, b: Brasas, d: Dominio, i: number, vidaMinima: number): boolean {
  if (b.oculta[i] === 1 || b.vida[i] < vidaMinima) return false
  const c = coordenadasDe(d, b.lugar, i * 3)
  return c.w > d.w0 && c.w < d.w1 && Math.abs(c.u) <= 1 && Math.abs(c.v) <= 1 && !cruzaUnaCaja(r.cajas, c.u, c.v, c.u, c.v)
}

/** La raíz de `i` en el bosque (acortando el camino a la mitad). */
function raiz(padre: Int32Array, i: number): number {
  let x = i
  while (padre[x] !== x) {
    padre[x] = padre[padre[x]]
    x = padre[x]
  }
  return x
}

/** Las aristas candidatas de `i`: sus vecinas más cercanas que se ven, al alcance y sin cruzar una caja. Devuelve cuántas hay ahora. */
function candidatas(r: Red, b: Brasas, d: Dominio, i: number, vidaMinima: number, m: number): number {
  const L = b.lugar
  const g = b.grilla
  const A2 = ARBOL.alcance * ARBOL.alcance
  const C2 = ARBOL.enElCuadro * ARBOL.enElCuadro
  MEJOR_D.fill(Number.POSITIVE_INFINITY)
  MEJOR_J.fill(-1)
  const ci = coordenadasDe(d, L, i * 3)
  const ui = ci.u
  const vi = ci.v
  celdaDe(g, L, i * 3)
  const cx = CELDA[0]
  const cy = CELDA[1]
  const cz = CELDA[2]
  for (let ax = Math.max(0, cx - 1); ax <= Math.min(g.nx - 1, cx + 1); ax += 1) for (let ay = Math.max(0, cy - 1); ay <= Math.min(g.ny - 1, cy + 1); ay += 1) for (let az = Math.max(0, cz - 1); az <= Math.min(g.nz - 1, cz + 1); az += 1) {
    for (let j = b.cabeza[indice(g, ax, ay, az)]; j >= 0; j = b.siguiente[j]) {
      if (j <= i) continue
      const dd = (L[j * 3] - L[i * 3]) ** 2 + (L[j * 3 + 1] - L[i * 3 + 1]) ** 2 + (L[j * 3 + 2] - L[i * 3 + 2]) ** 2
      if (dd >= A2 || dd >= MEJOR_D[ARBOL.vecinas - 1] || !seVe(r, b, d, j, vidaMinima)) continue
      const cj = coordenadasDe(d, L, j * 3)
      if ((cj.u - ui) ** 2 + (cj.v - vi) ** 2 >= C2 || cruzaUnaCaja(r.cajas, ui, vi, cj.u, cj.v)) continue
      // En su lugar entre las mejores (de menor a mayor).
      let q = ARBOL.vecinas - 1
      while (q > 0 && MEJOR_D[q - 1] > dd) {
        MEJOR_D[q] = MEJOR_D[q - 1]
        MEJOR_J[q] = MEJOR_J[q - 1]
        q -= 1
      }
      MEJOR_D[q] = dd
      MEJOR_J[q] = j
    }
  }
  let n = m
  for (let q = 0; q < ARBOL.vecinas && MEJOR_J[q] >= 0 && n < r.claves.length; q += 1) {
    // La clave ordena por largo (en milésimas de u²) y guarda la arista: largo · 2^16 + arista.
    r.aristas[n * 2] = i
    r.aristas[n * 2 + 1] = MEJOR_J[q]
    r.claves[n] = Math.floor(MEJOR_D[q] * 1000) * 65536 + n
    n += 1
  }
  return n
}

/**
 * Arma el árbol en la red (vacía): las aristas candidatas, ordenadas por largo, y de la más corta a la más larga las que unen dos partes
 * distintas; cada enlace nace (se enciende) por la distancia de su medio al centro del cuadro, del centro hacia afuera.
 */
export function armarElArbol(r: Red, b: Brasas, d: Dominio, vidaMinima: number, formaS: number, azar: () => number): void {
  let m = 0
  for (let i = 0; i < b.n; i += 1) {
    r.padre[i] = i
    if (seVe(r, b, d, i, vidaMinima)) m = candidatas(r, b, d, i, vidaMinima, m)
  }
  r.claves.fill(Number.POSITIVE_INFINITY, m)
  r.claves.sort()
  const L = b.lugar
  for (let q = 0; q < m && r.n < r.maximo; q += 1) {
    const e = r.claves[q] % 65536
    const i = r.aristas[e * 2]
    const j = r.aristas[e * 2 + 1]
    const ri = raiz(r.padre, i)
    const rj = raiz(r.padre, j)
    if (ri === rj) continue
    r.padre[ri] = rj
    const k = r.n
    r.a[k] = i
    r.b[k] = j
    r.grado[i] += 1
    r.grado[j] += 1
    // Quietas desde ya (las demás redes, al encenderse cada enlace): el árbol entero tiene que llegar a encenderse sin estirarse.
    r.quieta[i] = 1
    r.quieta[j] = 1
    r.semilla[k] = azar()
    r.alfa[k] = 0
    const c = coordenadasDe(d, L, i * 3)
    const u = c.u
    const v = c.v
    const cj = coordenadasDe(d, L, j * 3)
    const lejos = Math.min(1, Math.sqrt(((u + cj.u) / 2) ** 2 + ((v + cj.v) / 2) ** 2) / Math.SQRT2)
    r.nace[k] = formaS * ARBOL.enciende * lejos ** 1.2
    r.n = k + 1
  }
}
