import { BRASAS, type Brasas } from './brasas'

/**
 * [PULIDO 19] Q1.b · EL DOMINIO DE LA VISTA — el plasma vive en el MUNDO (no sigue a la cámara ni al logo) pero su dominio cubre lo que se
 * ve en cualquier encuadre: la pirámide de la vista (con un margen afuera del cuadro) entre dos profundidades, en fracciones de la
 * distancia de la cámara al logo (el foco). Es PERIÓDICO: una brasa que sale por una cara reaparece por la opuesta, a la misma
 * profundidad (por los lados) o a la misma altura del cuadro (por el fondo y el frente). En los planos lejanos el dominio es grande
 * y en los cercanos chico: la pantalla siempre está cubierta con la misma cantidad.
 *
 * Q1.c · NADA DESAPARECE DE LA NADA: el ALFA del dominio es una función continua de la posición: entero adentro del cuadro, se
 * funde en el margen de los lados (afuera del cuadro: no se ve) y en las bandas de profundidad (sí se ven: una brasa que se acerca
 * al frente se apaga antes de reaparecer en el fondo, donde se enciende). Al reaparecer vale 0 y se enciende desde ahí. `paso.ts` lo
 * sigue con un tope de cambio por cuadro (`fundidoS`). Y EL REPARTO (`repartir`): cuando el encuadre cambia (la cámara se aleja y el
 * dominio crece) las brasas quedan donde estaban, concentradas; las que sobran en una celda del cuadro se apagan (un fundido), se
 * mudan a la celda más vacía y se encienden ahí (otro). Puro (Node): recibe la cámara como números.
 *
 * Sin números por parámetro en lo de cada brasa (`coordenadasDe`, `alfaDe`, `envolver`; el piso vive en el dominio): en el bucle de
 * cada brasa, un número no entero que cruza una función que V8 no inlineó se encaja en un HeapNumber (16 bytes por brasa y cuadro).
 */
export const DOMINIO = {
  /** Cuánto más allá del cuadro, a los lados (fracción del medio ancho y del medio alto): ahí se funden, sin verse. */
  margen: 0.2,
  /**
   * La profundidad: del frente al fondo, en fracciones del foco (la distancia de la cámara al logo). El frente lejos de la cámara: más
   * cerca, las brasas tocan el tope de tamaño y se ven como discos borrosos (lunares, de día).
   */
  cerca: 0.4,
  lejos: 1.8,
  /**
   * Cómo se reparten en profundidad: la densidad crece como la profundidad a esta potencia (2: pareja en el mundo, como el polvo de una
   * sala: pocas cerca y grandes, muchas lejos y chicas; 1: pareja por cuadro de profundidad, que amontonaba cerca de la cámara en el
   * mundo: 59.000 pares a la vista de las fuerzas contra 4.000 en la cáscara de antes).
   */
  profundidad: 1.7,
  /** Las bandas de fundido en profundidad (fracciones del foco): desde el frente y hasta el fondo. */
  banda: { cerca: 0.3, lejos: 0.45 },
  /** El fundido en el tiempo (s): ninguna cambia su alfa más rápido (el tope de cambio por cuadro es `dt / fundidoS`). */
  fundidoS: 0.25,
  /** El foco (u): entre qué distancias vale la de la cámara al logo. */
  foco: [8, 60],
  /** El reparto: las celdas del cuadro (ancho × alto), cuántas brasas se miran por cuadro, y desde cuánto una celda está llena o vacía (por la media). */
  reparto: { celdas: [8, 5], porCuadro: 8, llena: 1.2, vacia: 0.45 },
} as const
/** Cuántas celdas tiene el reparto (el largo de `Brasas.celdasDeLaVista`). */
export const CELDAS_DEL_REPARTO = DOMINIO.reparto.celdas[0] * DOMINIO.reparto.celdas[1]

export interface Dominio {
  /** La cámara (de dónde se mira) y su base: derecha, arriba, adelante (unitarios). */
  readonly o: Float32Array
  readonly r: Float32Array
  readonly u: Float32Array
  readonly f: Float32Array
  /** La tangente del medio campo, horizontal y vertical, el foco y las profundidades del frente y del fondo (u). */
  tanX: number
  tanY: number
  D: number
  w0: number
  w1: number
  /** El piso (y): nada nace ni reaparece por debajo del mínimo sobre él (`BRASAS.piso.minimo`). */
  piso: number
  /** La caja del mundo que lo contiene (para la grilla): mínimos (0–2) y máximos (3–5). */
  readonly caja: Float32Array
  /** Los ejes de la base y qué eje de la cámara es cada uno (para escribirlos sin reservas por cuadro). */
  readonly ejes: readonly (readonly [Float32Array, number, number, number])[]
  listo: boolean
}

export function crearDominio(): Dominio {
  const r = new Float32Array([1, 0, 0])
  const u = new Float32Array([0, 1, 0])
  const f = new Float32Array([0, 0, -1])
  return { o: new Float32Array(3), r, u, f, tanX: 0.5, tanY: 0.3, D: 20, w0: 5, w1: 40, piso: Number.NEGATIVE_INFINITY, caja: new Float32Array(6), ejes: [[r, 1, 0, 0], [u, 0, 1, 0], [f, 0, 0, -1]], listo: false }
}

/** Lo que `coordenadasDe` deja, y el alfa de `alfaDe` (el mismo objeto cada vez: sin reservas). */
export const EN_EL_DOMINIO = { u: 0, v: 0, w: 0, alfa: 0 }
const XYZ = new Float32Array(3)

/** Arma el dominio con la cámara ya escrita en `o`, `r`, `u` y `f` (su posición y su base), su campo vertical (grados), su aspecto, el foco (u) y el piso (y). */
export function armarElDominio(d: Dominio, fovGrados: number, aspecto: number, foco: number, piso: number): void {
  d.piso = piso
  d.tanY = Math.tan((fovGrados * Math.PI) / 360)
  d.tanX = d.tanY * aspecto
  d.D = Math.min(DOMINIO.foco[1], Math.max(DOMINIO.foco[0], foco))
  d.w0 = DOMINIO.cerca * d.D
  d.w1 = DOMINIO.lejos * d.D
  const m = 1 + DOMINIO.margen
  for (let e = 0; e < 3; e += 1) {
    d.caja[e] = Number.POSITIVE_INFINITY
    d.caja[e + 3] = Number.NEGATIVE_INFINITY
  }
  for (let k = 0; k < 8; k += 1) {
    const w = k & 1 ? d.w1 : d.w0
    const su = k & 2 ? m : -m
    const sv = k & 4 ? m : -m
    for (let e = 0; e < 3; e += 1) {
      const p = d.o[e] + d.f[e] * w + d.r[e] * su * w * d.tanX + d.u[e] * sv * w * d.tanY
      if (p < d.caja[e]) d.caja[e] = p
      if (p > d.caja[e + 3]) d.caja[e + 3] = p
    }
  }
  d.listo = true
}

/** Las coordenadas de la vista de la brasa en `L[o..o+2]`: `u` y `v` (−1 a 1 adentro del cuadro) y `w` (la profundidad, u), en `EN_EL_DOMINIO`. */
export function coordenadasDe(d: Dominio, L: Float32Array, o: number): typeof EN_EL_DOMINIO {
  const px = L[o] - d.o[0]
  const py = L[o + 1] - d.o[1]
  const pz = L[o + 2] - d.o[2]
  const w = px * d.f[0] + py * d.f[1] + pz * d.f[2]
  const ww = Math.max(1e-3, w)
  EN_EL_DOMINIO.u = (px * d.r[0] + py * d.r[1] + pz * d.r[2]) / (ww * d.tanX)
  EN_EL_DOMINIO.v = (px * d.u[0] + py * d.u[1] + pz * d.u[2]) / (ww * d.tanY)
  EN_EL_DOMINIO.w = w
  return EN_EL_DOMINIO
}

/** Las coordenadas de la vista de un punto del mundo (fuera del bucle de cada cuadro: las pruebas). */
export function coordenadas(d: Dominio, x: number, y: number, z: number): typeof EN_EL_DOMINIO {
  XYZ[0] = x
  XYZ[1] = y
  XYZ[2] = z
  return coordenadasDe(d, XYZ, 0)
}

/** El alfa del dominio de la brasa en `L[o..o+2]` (0 a 1): continuo en la posición; 0 fuera del dominio. En `EN_EL_DOMINIO.alfa`. */
export function alfaDe(d: Dominio, L: Float32Array, o: number): void {
  const c = coordenadasDe(d, L, o)
  if (c.w <= d.w0 || c.w >= d.w1) {
    c.alfa = 0
    return
  }
  const m = DOMINIO.margen
  // Las rampas suaves (3t² − 2t³), inline: una función que devuelve un número se encaja si no se inlinea.
  const tu = Math.min(1, Math.max(0, (1 + m - Math.abs(c.u)) / m))
  const tv = Math.min(1, Math.max(0, (1 + m - Math.abs(c.v)) / m))
  const tf = Math.min(1, Math.max(0, (c.w - d.w0) / (DOMINIO.banda.cerca * d.D)))
  const tl = Math.min(1, Math.max(0, (d.w1 - c.w) / (DOMINIO.banda.lejos * d.D)))
  const lados = Math.min(tu * tu * (3 - 2 * tu), tv * tv * (3 - 2 * tv))
  const profundidad = Math.min(tf * tf * (3 - 2 * tf), tl * tl * (3 - 2 * tl))
  c.alfa = lados * profundidad
}

/** El alfa del dominio en un punto, devuelto (fuera del bucle de cada cuadro: la siembra, las pruebas). */
export function alfaDelDominio(d: Dominio, x: number, y: number, z: number): number {
  XYZ[0] = x
  XYZ[1] = y
  XYZ[2] = z
  alfaDe(d, XYZ, 0)
  return EN_EL_DOMINIO.alfa
}

/**
 * Hasta qué profundidad llega el rayo de la vista (u, v) antes de bajar del mínimo sobre el piso (el fondo del dominio si no baja). Una
 * muestra bajo el piso no se sube al mínimo (se apilaban en el horizonte): se elige la profundidad hasta acá.
 */
export function hastaElPiso(d: Dominio, u: number, v: number): number {
  const baja = d.f[1] + u * d.tanX * d.r[1] + v * d.tanY * d.u[1]
  if (baja >= -1e-6) return d.w1
  return Math.min(d.w1, (d.piso + BRASAS.piso.minimo - d.o[1]) / baja)
}

/** Una profundidad al azar entre el frente y `hasta`, más hacia el fondo (la densidad crece con la profundidad: `DOMINIO.profundidad`). */
const profundidadAlAzar = (d: Dominio, hasta: number, azar: () => number): number => {
  const p = DOMINIO.profundidad + 1
  return (d.w0 ** p + azar() * (hasta ** p - d.w0 ** p)) ** (1 / p)
}

/**
 * El peso de la celda `k` del cuadro: cuánto aire hay detrás de ella (su rayo central, del frente hasta el piso o el fondo, con la
 * densidad de `profundidad`): a una celda que mira el piso de cerca le toca menos que a una que mira el fondo. 0: no llega por encima
 * del piso (inalcanzable). Sin desestructurar (un iterador por llamada: 60 KB de basura por cuadro).
 */
export function pesoDeLaCelda(d: Dominio, k: number): number {
  const nx = DOMINIO.reparto.celdas[0]
  const ny = DOMINIO.reparto.celdas[1]
  const u = (((k % nx) + 0.5) / nx) * 2 - 1
  const v = ((Math.floor(k / nx) + 0.5) / ny) * 2 - 1
  const hasta = hastaElPiso(d, u, v)
  if (hasta <= d.w0 + 1) return 0
  const p = DOMINIO.profundidad + 1
  return hasta ** p - d.w0 ** p
}

/** Cuántas brasas le tocan a cada celda del cuadro (en `destino`; 0 a las inalcanzables), con `n` brasas. Devuelve cuántas celdas alcanzables hay. */
export function objetivosDelReparto(d: Dominio, n: number, destino: Float32Array): number {
  let suma = 0
  let alcanzables = 0
  for (let k = 0; k < destino.length; k += 1) {
    destino[k] = pesoDeLaCelda(d, k)
    suma += destino[k]
    if (destino[k] > 0) alcanzables += 1
  }
  for (let k = 0; k < destino.length; k += 1) destino[k] = suma > 0 ? (n * destino[k]) / suma : 0
  return alcanzables
}

/** Escribe el punto del mundo de unas coordenadas de la vista en la brasa `i` (con `w` ya elegido sobre el piso; por las dudas, nunca abajo del mínimo). */
function escribir(d: Dominio, b: Brasas, i: number, u: number, v: number, w: number): void {
  for (let e = 0; e < 3; e += 1) b.lugar[i * 3 + e] = d.o[e] + d.f[e] * w + d.r[e] * u * w * d.tanX + d.u[e] * v * w * d.tanY
  const minimo = d.piso + BRASAS.piso.minimo
  if (b.lugar[i * 3 + 1] < minimo) b.lugar[i * 3 + 1] = minimo
}

/**
 * Un lugar al azar de la vista para la brasa `i`, sobre el piso: en todo el cuadro (`k` −1: parejo en el AIRE, como el polvo de una sala:
 * la profundidad se sortea en todo el dominio y lo que cae bajo el piso se sortea de nuevo), o dentro de la celda `k` del reparto (la
 * profundidad hasta el piso).
 */
function alAzarEnLaVista(d: Dominio, b: Brasas, i: number, k: number, azar: () => number): boolean {
  const nx = DOMINIO.reparto.celdas[0]
  const ny = DOMINIO.reparto.celdas[1]
  for (let intento = 0; intento < 12; intento += 1) {
    const u = k < 0 ? azar() * 2 - 1 : (((k % nx) + azar()) / nx) * 2 - 1
    const v = k < 0 ? azar() * 2 - 1 : ((Math.floor(k / nx) + azar()) / ny) * 2 - 1
    const hasta = hastaElPiso(d, u, v)
    if (hasta <= d.w0 + 0.5) continue
    const w = profundidadAlAzar(d, k < 0 ? d.w1 : hasta, azar)
    if (w > hasta) continue
    escribir(d, b, i, u, v, w)
    return true
  }
  return false
}

/**
 * Si la brasa `i` salió del dominio, la vuelve a meter por la cara opuesta (primero en profundidad, después por los lados) y devuelve
 * `true`: ése es el evento (su alfa vale 0 de los dos lados de la cara). Adentro, no toca nada.
 */
export function envolver(d: Dominio, b: Brasas, i: number, azar: () => number): boolean {
  const c = coordenadasDe(d, b.lugar, i * 3)
  const m = 1 + DOMINIO.margen
  let { u, v, w } = c
  let salio = false
  const fondo = d.w1 - d.w0
  if (w < d.w0) {
    w += fondo * Math.ceil((d.w0 - w) / fondo)
    salio = true
  } else if (w > d.w1) {
    w -= fondo * Math.ceil((w - d.w1) / fondo)
    salio = true
  }
  if (u > m || u < -m) {
    u -= 2 * m * Math.sign(u) * Math.ceil((Math.abs(u) - m) / (2 * m))
    salio = true
  }
  if (v > m || v < -m) {
    v -= 2 * m * Math.sign(v) * Math.ceil((Math.abs(v) - m) / (2 * m))
    salio = true
  }
  if (!salio) return false
  u = Math.min(m, Math.max(-m, u))
  v = Math.min(m, Math.max(-m, v))
  // Si por ahí el rayo baja del piso antes de esa profundidad, a una profundidad que esté sobre el piso (o a cualquier lugar de la vista).
  const hasta = hastaElPiso(d, u, v)
  if (w > hasta) {
    if (hasta > d.w0 + 0.5) w = profundidadAlAzar(d, hasta, azar)
    else if (alAzarEnLaVista(d, b, i, -1, azar)) return true
  }
  escribir(d, b, i, u, v, Math.min(d.w1, Math.max(d.w0, w)))
  return true
}

/**
 * Puebla el dominio: cada brasa que no está adentro del cuadro (o todas, `todas`) va a un lugar al azar de la vista: parejo en el
 * cuadro y, en profundidad, más hacia el fondo (la densidad crece con la profundidad: las cercanas son pocas y grandes; las lejanas,
 * muchas y chicas). Con el alfa en 0 (se encienden desde ahí). Devuelve cuántas movió.
 */
export function poblar(d: Dominio, b: Brasas, azar: () => number, todas: boolean): number {
  let movidas = 0
  for (let i = 0; i < b.n; i += 1) {
    if (!todas) {
      const c = coordenadasDe(d, b.lugar, i * 3)
      if (c.w > d.w0 && c.w < d.w1 && Math.abs(c.u) <= 1 && Math.abs(c.v) <= 1) continue
    }
    if (!alAzarEnLaVista(d, b, i, -1, azar)) continue
    b.vida[i] = 0
    b.velocidad[i * 3] = 0
    b.velocidad[i * 3 + 1] = 0
    b.velocidad[i * 3 + 2] = 0
    movidas += 1
  }
  return movidas
}

/** La celda del cuadro de unas coordenadas de la vista (−1 si está fuera del cuadro o del dominio). */
function celdaDelCuadro(d: Dominio, c: typeof EN_EL_DOMINIO): number {
  if (c.w <= d.w0 || c.w >= d.w1 || Math.abs(c.u) > 1 || Math.abs(c.v) > 1) return -1
  const nx = DOMINIO.reparto.celdas[0]
  const ny = DOMINIO.reparto.celdas[1]
  const cx = Math.min(nx - 1, Math.floor(((c.u + 1) / 2) * nx))
  const cy = Math.min(ny - 1, Math.floor(((c.v + 1) / 2) * ny))
  return cy * nx + cx
}

/** La celda más vacía respecto de lo que le toca, entre las que piden al menos una brasa (−1 si ninguna). */
function masVacia(cuenta: Int32Array, objetivo: Float32Array): number {
  let k = -1
  for (let c = 0; c < cuenta.length; c += 1) if (objetivo[c] >= 1 && (k < 0 || cuenta[c] / objetivo[c] < cuenta[k] / objetivo[k])) k = c
  return k
}

/**
 * El reparto de un cuadro: cuenta las brasas por celda del cuadro y lo que le toca a cada una (por el aire que tiene detrás); las que ya
 * se apagaron para mudarse van a la celda más vacía (con la vida en 0: nacen ahí, el evento); y, de a `porCuadro`, las que sobran en
 * una celda llena (mientras haya una vacía) empiezan a apagarse. Devuelve cuántas se mudaron.
 */
export function repartir(d: Dominio, b: Brasas, azar: () => number): number {
  const R = DOMINIO.reparto
  const cuenta = b.celdasDeLaVista
  cuenta.fill(0)
  for (let i = 0; i < b.n; i += 1) {
    const k = celdaDelCuadro(d, coordenadasDe(d, b.lugar, i * 3))
    if (k >= 0) cuenta[k] += 1
  }
  const objetivo = b.objetivoDeLasCeldas
  if (objetivosDelReparto(d, b.n, objetivo) === 0) return 0
  let vacia = masVacia(cuenta, objetivo)
  let mudadas = 0
  for (let i = 0; i < b.n; i += 1) {
    if (b.migra[i] === 0 || b.vida[i] > 0.02 || vacia < 0) continue
    // A la celda más vacía; si ahí no hay lugar (casi todo piso), a cualquier lugar de la vista: nunca se queda apagada esperando.
    if (!alAzarEnLaVista(d, b, i, vacia, azar) && !alAzarEnLaVista(d, b, i, -1, azar)) continue
    b.vida[i] = 0
    b.eventos[i] = 1
    b.migra[i] = 0
    cuenta[vacia] += 1
    vacia = masVacia(cuenta, objetivo)
    mudadas += 1
  }
  for (let k = 0; k < R.porCuadro; k += 1) {
    const i = (b.turnoDelReparto + k) % b.n
    if (b.migra[i] === 1 || vacia < 0 || cuenta[vacia] >= R.vacia * objetivo[vacia]) continue
    const celda = celdaDelCuadro(d, coordenadasDe(d, b.lugar, i * 3))
    if (celda >= 0 && cuenta[celda] > R.llena * objetivo[celda]) {
      b.migra[i] = 1
      cuenta[celda] -= 1
    }
  }
  b.turnoDelReparto = (b.turnoDelReparto + R.porCuadro) % b.n
  return mudadas
}
