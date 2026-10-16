import type { Brasas } from './brasas'
import { cruzaUnaCaja } from './cajas'
import { coordenadasDe, type Dominio } from './dominio'
import type { Red } from './reposo'

/**
 * [PULIDO 27] Z2 · `?red=toda`: TODO CONECTADO. Al formarse la red en reposo, un ÁRBOL que une las brasas que se ven por sus vecinas más
 * cercanas (el de largo mínimo: Kruskal), al alcance en el mundo y en el cuadro, sin cruzar las cajas de los textos ni del logo
 * (`cajas.ts`). Sin ciclos: cada brasa, unida a todas por un solo camino. Puro (Node), sin reservas (los búferes son de la red y de acá).
 * [PULIDO 28] AB2 · REPARTIDO (el por defecto): unía TODAS las que se veían (unos 200 enlaces cortos, amontonados donde había más brasas,
 * ramas superpuestas). Ahora primero se reparten: una brasa por celda de una grilla del cuadro (`celdas` por lado; la más cerca de un
 * punto corrido al azar del medio de la celda, fuera de las cajas): densidad pareja en toda la pantalla, enlaces más largos y menos rayos.
 * AB1 · VARIOS FOCOS: se encendía del centro del cuadro hacia afuera. Ahora desde `focos` brasas repartidas por la pantalla (la más lejos
 * de las ya elegidas, entre las más lejanas al azar), a la vez: cada una crece por el árbol hacia sus vecinas y los últimos enlaces en
 * encenderse son los que unen los frentes.
 */
export const ARBOL = {
  /** La grilla del reparto (celdas por lado en el cuadro) y cuánto se corre al azar el punto de cada celda (parte de la celda, a cada lado). */
  celdas: 9,
  corre: 0.3,
  /** Cuántas vecinas candidatas por brasa repartida, hasta qué distancia en el cuadro (NDC) y en el mundo (u). */
  vecinas: 6,
  enElCuadro: 0.6,
  alcance: 40,
  /** Los focos (entre cuántos), entre cuántas de las más lejanas se elige cada uno, y en qué parte de la formación se termina de encender. */
  focos: [5, 8],
  entre: 3,
  // [CIERRE A-bis] A4 · la red entera en ~7 s (era 0,7: ~11 s).
  enciende: 0.45,
} as const

/** Lo repartido: por celda, la brasa y su distancia al punto; después, las elegidas, sus coordenadas, su distancia por el árbol a un foco. */
const MAXIMO = ARBOL.celdas * ARBOL.celdas
const POR_CELDA = new Int32Array(MAXIMO)
const A_LA_CELDA = new Float64Array(MAXIMO)
const PUNTO = new Float64Array(MAXIMO * 2)
const NODO = new Int32Array(MAXIMO)
const UV = new Float64Array(MAXIMO * 2)
const HASTA = new Float64Array(MAXIMO)
const LEJOS = new Float64Array(MAXIMO)
const MEJOR_D = new Float64Array(ARBOL.vecinas)
const MEJOR_J = new Int32Array(ARBOL.vecinas)

/** ¿Se ve la brasa `i` (viva, en el cuadro y fuera de las cajas)? Sus coordenadas quedan en `EN_EL_DOMINIO`. */
function seVe(r: Red, b: Brasas, d: Dominio, i: number, vidaMinima: number): boolean {
  if (b.oculta[i] === 1 || b.vida[i] < vidaMinima) return false
  const c = coordenadasDe(d, b.lugar, i * 3)
  return c.w > d.w0 && c.w < d.w1 && Math.abs(c.u) <= 1 && Math.abs(c.v) <= 1 && !cruzaUnaCaja(r.cajas, c.u, c.v, c.u, c.v)
}

/** La raíz de `i` en el bosque de las repartidas (acortando el camino a la mitad). */
function raiz(padre: Int32Array, i: number): number {
  let x = i
  while (padre[x] !== x) {
    padre[x] = padre[padre[x]]
    x = padre[x]
  }
  return x
}

/** AB2 · el reparto: una brasa por celda del cuadro, la más cerca del punto de su celda. Devuelve cuántas (sus índices en `NODO`). */
function repartir(r: Red, b: Brasas, d: Dominio, vidaMinima: number, azar: () => number): number {
  const N = ARBOL.celdas
  for (let k = 0; k < MAXIMO; k += 1) {
    POR_CELDA[k] = -1
    A_LA_CELDA[k] = Number.POSITIVE_INFINITY
    PUNTO[k * 2] = -1 + (2 * ((k % N) + 0.5 + (azar() * 2 - 1) * ARBOL.corre)) / N
    PUNTO[k * 2 + 1] = -1 + (2 * (Math.floor(k / N) + 0.5 + (azar() * 2 - 1) * ARBOL.corre)) / N
  }
  for (let i = 0; i < b.n; i += 1) {
    if (!seVe(r, b, d, i, vidaMinima)) continue
    const c = coordenadasDe(d, b.lugar, i * 3)
    const k = Math.min(N - 1, Math.floor(((c.u + 1) / 2) * N)) + N * Math.min(N - 1, Math.floor(((c.v + 1) / 2) * N))
    const dd = (c.u - PUNTO[k * 2]) ** 2 + (c.v - PUNTO[k * 2 + 1]) ** 2
    if (dd >= A_LA_CELDA[k]) continue
    A_LA_CELDA[k] = dd
    POR_CELDA[k] = i
  }
  let n = 0
  for (let k = 0; k < MAXIMO; k += 1) {
    if (POR_CELDA[k] < 0) continue
    const c = coordenadasDe(d, b.lugar, POR_CELDA[k] * 3)
    NODO[n] = POR_CELDA[k]
    UV[n * 2] = c.u
    UV[n * 2 + 1] = c.v
    n += 1
  }
  return n
}

/** Las aristas candidatas de la repartida `p`: sus vecinas repartidas más cercanas, al alcance y sin cruzar una caja. Devuelve cuántas hay. */
function candidatas(r: Red, b: Brasas, p: number, n: number, m: number): number {
  const L = b.lugar
  const i = NODO[p]
  MEJOR_D.fill(Number.POSITIVE_INFINITY)
  MEJOR_J.fill(-1)
  for (let q = p + 1; q < n; q += 1) {
    const j = NODO[q]
    const dd = (UV[q * 2] - UV[p * 2]) ** 2 + (UV[q * 2 + 1] - UV[p * 2 + 1]) ** 2
    if (dd >= ARBOL.enElCuadro ** 2 || dd >= MEJOR_D[ARBOL.vecinas - 1]) continue
    if ((L[j * 3] - L[i * 3]) ** 2 + (L[j * 3 + 1] - L[i * 3 + 1]) ** 2 + (L[j * 3 + 2] - L[i * 3 + 2]) ** 2 >= ARBOL.alcance ** 2) continue
    if (cruzaUnaCaja(r.cajas, UV[p * 2], UV[p * 2 + 1], UV[q * 2], UV[q * 2 + 1])) continue
    let s = ARBOL.vecinas - 1
    while (s > 0 && MEJOR_D[s - 1] > dd) {
      MEJOR_D[s] = MEJOR_D[s - 1]
      MEJOR_J[s] = MEJOR_J[s - 1]
      s -= 1
    }
    MEJOR_D[s] = dd
    MEJOR_J[s] = q
  }
  let e = m
  for (let s = 0; s < ARBOL.vecinas && MEJOR_J[s] >= 0 && e < r.claves.length; s += 1) {
    // La clave ordena por largo en el cuadro (en millonésimas de NDC²) y guarda la arista: largo · 2^16 + arista.
    r.aristas[e * 2] = p
    r.aristas[e * 2 + 1] = MEJOR_J[s]
    r.claves[e] = Math.floor(MEJOR_D[s] * 1e6) * 65536 + e
    e += 1
  }
  return e
}

/** AB1 · los focos: `cuantos` repartidas, cada una entre las `entre` más lejos de las ya elegidas; su distancia por el árbol queda en `HASTA`. */
function focos(r: Red, desde: number, n: number, azar: () => number): void {
  const cuantos = Math.min(n, ARBOL.focos[0] + Math.floor(azar() * (ARBOL.focos[1] - ARBOL.focos[0] + 1)))
  HASTA.fill(Number.POSITIVE_INFINITY, 0, n)
  LEJOS.fill(Number.POSITIVE_INFINITY, 0, n)
  for (let f = 0; f < cuantos; f += 1) {
    // La primera, al azar; las demás, entre las `entre` más lejos de las elegidas (sin reservas: se busca el umbral de a una).
    let elegida = Math.floor(azar() * n)
    if (f > 0) {
      let umbral = Number.POSITIVE_INFINITY
      for (let t = 0; t < ARBOL.entre; t += 1) {
        let mejor = -1
        for (let p = 0; p < n; p += 1) if (LEJOS[p] < umbral && (mejor < 0 || LEJOS[p] > LEJOS[mejor])) mejor = p
        if (mejor < 0) break
        umbral = LEJOS[mejor]
        if (t === 0 || azar() < 1 / (t + 1)) elegida = mejor
      }
    }
    HASTA[elegida] = 0
    for (let p = 0; p < n; p += 1) LEJOS[p] = Math.min(LEJOS[p], (UV[p * 2] - UV[elegida * 2]) ** 2 + (UV[p * 2 + 1] - UV[elegida * 2 + 1]) ** 2)
  }
  // La distancia por el árbol al foco más cercano (el largo en el cuadro de cada enlace): se relaja hasta que no cambia.
  for (let vuelta = 0, cambio = true; cambio && vuelta < n; vuelta += 1) {
    cambio = false
    for (let k = desde; k < r.n; k += 1) {
      const p = r.a[k]
      const q = r.b[k]
      const largo = Math.hypot(UV[p * 2] - UV[q * 2], UV[p * 2 + 1] - UV[q * 2 + 1])
      if (HASTA[p] + largo < HASTA[q] - 1e-12) {
        HASTA[q] = HASTA[p] + largo
        cambio = true
      } else if (HASTA[q] + largo < HASTA[p] - 1e-12) {
        HASTA[p] = HASTA[q] + largo
        cambio = true
      }
    }
  }
}

/**
 * Arma el árbol en la red (vacía): reparte las que se ven, ordena las aristas candidatas por largo y, de la más corta a la más larga, las que
 * unen dos partes distintas; cada enlace nace (se enciende) por su distancia por el árbol al foco más cercano: desde los focos hacia afuera.
 */
export function armarElArbol(r: Red, b: Brasas, d: Dominio, vidaMinima: number, formaS: number, azar: () => number): void {
  const n = repartir(r, b, d, vidaMinima, azar)
  let m = 0
  for (let p = 0; p < n; p += 1) {
    r.padre[p] = p
    m = candidatas(r, b, p, n, m)
  }
  r.claves.fill(Number.POSITIVE_INFINITY, m)
  r.claves.sort()
  const desde = r.n
  for (let q = 0; q < m && r.n < r.maximo; q += 1) {
    const e = r.claves[q] % 65536
    const p = r.aristas[e * 2]
    const s = r.aristas[e * 2 + 1]
    const rp = raiz(r.padre, p)
    const rs = raiz(r.padre, s)
    if (rp === rs) continue
    r.padre[rp] = rs
    // Por ahora los índices de las repartidas (para la distancia a los focos); después, las brasas.
    r.a[r.n] = p
    r.b[r.n] = s
    r.n += 1
  }
  focos(r, desde, n, azar)
  let maximo = 1e-6
  for (let k = desde; k < r.n; k += 1) maximo = Math.max(maximo, HASTA[r.a[k]], HASTA[r.b[k]])
  for (let k = desde; k < r.n; k += 1) {
    const hasta = Number.isFinite(HASTA[r.a[k]]) && Number.isFinite(HASTA[r.b[k]]) ? Math.max(HASTA[r.a[k]], HASTA[r.b[k]]) : maximo
    const i = NODO[r.a[k]]
    const j = NODO[r.b[k]]
    r.a[k] = i
    r.b[k] = j
    r.grado[i] += 1
    r.grado[j] += 1
    // Quietas desde ya (las demás redes, al encenderse cada enlace): el árbol entero tiene que llegar a encenderse sin estirarse.
    r.quieta[i] = 1
    r.quieta[j] = 1
    r.semilla[k] = azar()
    r.alfa[k] = 0
    r.nace[k] = formaS * ARBOL.enciende * Math.min(1, hasta / maximo)
  }
}
