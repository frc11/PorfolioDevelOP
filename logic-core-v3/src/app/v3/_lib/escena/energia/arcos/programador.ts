import { distanciaAlRayo, type Brasas, type RayoDelPuntero } from '../brasas'
import { vecinasDe } from '../vecinas'
import { encender, entre, lugarLibre, type ClaseDeArco, type EstadoDeLosArcos } from './arcos'

/**
 * [PULIDO 17] O3 · QUIÉN NACE Y CUÁNDO (`arcos.ts`: el modelo). Como en PULIDO 15: el puntero recibe arcos de las brasas a su
 * alcance; los pares enlazados descargan cada tanto (y a veces vuelven a saltar enseguida: el parpadeo); el logo, cada pocos
 * segundos (más seguido cuando está activo: después de su pulso, cerca del encastre y en el golpe del pie). Del gesto: el clic
 * tira 2–4 arcos cortos alrededor y la descarga, uno grande al grupo más denso a su alcance (o al logo). Nunca sobre un texto ni
 * fuera del cuadro (`seVe`); si el clic no encuentra a quién, los arcos mueren en el aire. Puro (Node).
 */
export const PROGRAMA = {
  /** Por segundo: los pares y al puntero; cada cuánto el logo (s). Por la temperatura: `× (1 + calor · T)`; el logo activo, `× (1 + logoActivo · actividad)`. */
  tasas: { pares: 1.1, cursor: 2.6, logo: [2.4, 4.8], calor: 1.2, logoActivo: 2.5 },
  /** Hasta dónde (u): un par, el logo (desde su centro), al puntero (desde su rayo), el pulso, la descarga, y el largo de un arco al aire. */
  alcances: { par: 3.2, logo: 6.8, cursor: [0.9, 3.4], pulso: 3, descarga: 9, alAire: [1.4, 2.6] },
  /** El largo mínimo de un arco del logo (u desde su borde): más corto, el canal es una mancha. Entre cuántas brasas se elige. */
  logoMinimo: 1.6,
  candidatasDelLogo: 6,
  /** Los arcos de un clic y cuánto pesa el grupo al elegir el blanco de la descarga (radio en u). */
  pulso: { arcos: [1, 2] },
  grupo: 1.8,
} as const

/** Lo que el programador pregunta afuera (lo arma `dibujo/armado.ts`; en la prueba, a mano). [PULIDO 18] P1.b · todo en el mundo. */
export interface EntornoDeLosArcos {
  /** La cámara (de dónde se ven los arcos) y dónde está el logo ahora (de ahí salen los suyos). */
  readonly camara: Float32Array
  readonly logo: Float32Array
  readonly rayo: RayoDelPuntero | null
  readonly maximo: number
  temperatura: number
  actividadDelLogo: number
  /** ¿Se ve este punto y no cae sobre un texto? */
  readonly seVe: (x: number, y: number, z: number) => boolean
  /** El punto del borde del logo más cercano a (x, y, z), en `destino`; falso si el logo no está. */
  readonly bordeDelLogo: (x: number, y: number, z: number, destino: Float32Array) => boolean
}

const PUNTO = new Float32Array(3)
const BORDE = new Float32Array(3)
const ELEGIDAS = new Int32Array(4)

const seVeLaBrasa = (b: Brasas, i: number, en: EntornoDeLosArcos): boolean => en.seVe(b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2])

/** ¿Se ve el par (los dos extremos y el medio) y es corto? */
function parQueSeVe(b: Brasas, i: number, j: number, en: EntornoDeLosArcos): boolean {
  const L = b.lugar
  const d = Math.hypot(L[j * 3] - L[i * 3], L[j * 3 + 1] - L[i * 3 + 1], L[j * 3 + 2] - L[i * 3 + 2])
  return d < PROGRAMA.alcances.par && seVeLaBrasa(b, i, en) && seVeLaBrasa(b, j, en) && en.seVe((L[i * 3] + L[j * 3]) / 2, (L[i * 3 + 1] + L[j * 3 + 1]) / 2, (L[i * 3 + 2] + L[j * 3 + 2]) / 2)
}

/** Hasta `cuantas` brasas al azar a menos de `alcance` de `p` que se vean (muestreo de reservorio, sin reservas), en `ELEGIDAS`. */
function alAlcance(b: Brasas, p: Float32Array, alcance: number, cuantas: number, en: EntornoDeLosArcos, azar: () => number): number {
  let vistas = 0
  for (let i = 0; i < b.n; i += 1) {
    const d = Math.hypot(b.lugar[i * 3] - p[0], b.lugar[i * 3 + 1] - p[1], b.lugar[i * 3 + 2] - p[2])
    if (d > alcance || d < 0.4 || !seVeLaBrasa(b, i, en)) continue
    vistas += 1
    if (vistas <= cuantas) ELEGIDAS[vistas - 1] = i
    else {
      const k = Math.floor(azar() * vistas)
      if (k < cuantas) ELEGIDAS[k] = i
    }
  }
  return Math.min(vistas, cuantas)
}

/** Un arco del clic que muere en el aire: hacia un punto al azar a su alrededor que se vea. */
function alAire(e: EstadoDeLosArcos, b: Brasas, desde: Float32Array, clase: ClaseDeArco, en: EntornoDeLosArcos, azar: () => number): void {
  for (let intento = 0; intento < 8; intento += 1) {
    const z = azar() * 2 - 1
    const fi = azar() * Math.PI * 2
    const s = Math.sqrt(1 - z * z)
    const r = entre(azar, PROGRAMA.alcances.alAire)
    const x = desde[0] + Math.cos(fi) * s * r
    const y = desde[1] + z * r
    const w = desde[2] + Math.sin(fi) * s * r
    if (!en.seVe(x, y, w)) continue
    const arco = lugarLibre(e, en.maximo, true)
    if (arco === null) return
    arco.puntoA.set(desde)
    arco.puntoB[0] = x
    arco.puntoB[1] = y
    arco.puntoB[2] = w
    encender(e, arco, clase, -1, -1, b, en.camara, azar)
    return
  }
}

/** El pulso del clic: 2–4 arcos a las brasas cercanas (las que falten, al aire). */
function pulso(e: EstadoDeLosArcos, b: Brasas, en: EntornoDeLosArcos, azar: () => number): void {
  const donde = e.pedidos.donde
  const cuantos = Math.floor(entre(azar, [PROGRAMA.pulso.arcos[0], PROGRAMA.pulso.arcos[1] + 0.999]))
  const halladas = alAlcance(b, donde, PROGRAMA.alcances.pulso, cuantos, en, azar)
  for (let k = 0; k < halladas; k += 1) {
    const arco = lugarLibre(e, en.maximo, true)
    if (arco === null) return
    arco.puntoA.set(donde)
    encender(e, arco, 'pulso', -1, ELEGIDAS[k], b, en.camara, azar)
  }
  for (let k = halladas; k < Math.min(cuantos, 1); k += 1) alAire(e, b, donde, 'pulso', en, azar)
}

/** La descarga al soltar: un arco grande al grupo más denso a su alcance (o al logo, si queda más cerca), o al aire. */
function descarga(e: EstadoDeLosArcos, b: Brasas, en: EntornoDeLosArcos, azar: () => number): void {
  const donde = e.pedidos.donde
  let mejor = -1
  let densidad = -1
  for (let k = 0; k < 48; k += 1) {
    const i = Math.floor(azar() * b.n)
    const d = Math.hypot(b.lugar[i * 3] - donde[0], b.lugar[i * 3 + 1] - donde[1], b.lugar[i * 3 + 2] - donde[2])
    if (d > PROGRAMA.alcances.descarga || d < 1 || !seVeLaBrasa(b, i, en)) continue
    const v = vecinasDe(b, i, PROGRAMA.grupo) - d * 0.15
    if (v > densidad) {
      mejor = i
      densidad = v
    }
  }
  const alLogo = en.bordeDelLogo(donde[0], donde[1], donde[2], PUNTO) && en.seVe(PUNTO[0], PUNTO[1], PUNTO[2]) && Math.hypot(PUNTO[0] - donde[0], PUNTO[1] - donde[1], PUNTO[2] - donde[2]) < PROGRAMA.alcances.descarga * 0.6
  const arco = lugarLibre(e, en.maximo, true)
  if (arco === null) return
  arco.puntoA.set(donde)
  if (mejor >= 0 && !(alLogo && azar() < 0.4)) encender(e, arco, 'descarga', -1, mejor, b, en.camara, azar)
  else if (alLogo) {
    arco.puntoB.set(PUNTO)
    encender(e, arco, 'descarga', -1, -1, b, en.camara, azar)
  } else {
    arco.activo = false
    alAire(e, b, donde, 'descarga', en, azar)
  }
}

/** El paso del programa (los arcos ya envejecidos): el puntero, los re-saltos, los pedidos del gesto, los pares y el logo. */
export function programarArcos(e: EstadoDeLosArcos, b: Brasas, dt: number, en: EntornoDeLosArcos, azar: () => number): void {
  e.nacidos = 0
  const calor = 1 + PROGRAMA.tasas.calor * en.temperatura
  const forzado = e.forzado
  e.forzado = null
  // Los del puntero siguen al rayo; sin puntero, se apagan.
  for (const arco of e.arcos) {
    if (!arco.activo || arco.clase !== 'cursor') continue
    if (en.rayo === null) arco.activo = false
    else distanciaAlRayo(b.lugar[arco.a * 3], b.lugar[arco.a * 3 + 1], b.lugar[arco.a * 3 + 2], en.rayo, arco.puntoB)
  }
  if (en.rayo !== null && (forzado === 'cursor' || azar() < PROGRAMA.tasas.cursor * dt)) {
    const inicio = Math.floor(azar() * b.n)
    for (let k = 0; k < b.n; k += 1) {
      const i = (inicio + k) % b.n
      const d = distanciaAlRayo(b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2], en.rayo, PUNTO)
      if (d < PROGRAMA.alcances.cursor[0] || d >= PROGRAMA.alcances.cursor[1] || !seVeLaBrasa(b, i, en) || !en.seVe(PUNTO[0], PUNTO[1], PUNTO[2])) continue
      const arco = lugarLibre(e, en.maximo, true)
      if (arco !== null) {
        arco.puntoB.set(PUNTO)
        encender(e, arco, 'cursor', i, -1, b, en.camara, azar)
      }
      break
    }
  }
  // Los re-saltos pendientes de un par que sigue enlazado.
  for (let k = e.cuantosPendientes - 1; k >= 0; k -= 1) {
    e.pendientes[k * 3 + 2] -= dt
    if (e.pendientes[k * 3 + 2] > 0) continue
    const i = e.pendientes[k * 3]
    const j = e.pendientes[k * 3 + 1]
    e.cuantosPendientes -= 1
    e.pendientes.copyWithin(k * 3, e.cuantosPendientes * 3, e.cuantosPendientes * 3 + 3)
    if (b.pareja[i] !== j || !parQueSeVe(b, i, j, en)) continue
    const arco = lugarLibre(e, en.maximo, false)
    if (arco !== null) encender(e, arco, 'par', i, j, b, en.camara, azar)
  }
  if (e.pedidos.pulso || forzado === 'pulso') {
    e.pedidos.pulso = false
    pulso(e, b, en, azar)
  }
  if (e.pedidos.descarga || forzado === 'descarga') {
    e.pedidos.descarga = false
    descarga(e, b, en, azar)
  }
  if (forzado === 'par' || azar() < PROGRAMA.tasas.pares * calor * dt) {
    const inicio = Math.floor(azar() * b.n)
    for (let k = 0; k < b.n; k += 1) {
      const i = (inicio + k) % b.n
      const j = b.pareja[i]
      if (j < 0 || !parQueSeVe(b, i, j, en)) continue
      const arco = lugarLibre(e, en.maximo, forzado === 'par')
      if (arco !== null) encender(e, arco, 'par', i, j, b, en.camara, azar)
      break
    }
  }
  e.proximoDelLogo -= dt * calor * (1 + PROGRAMA.tasas.logoActivo * en.actividadDelLogo)
  if (forzado === 'logo' || e.proximoDelLogo <= 0) {
    e.proximoDelLogo = entre(azar, PROGRAMA.tasas.logo)
    // Entre varias brasas a su alcance que se vean, la más corta que pase el largo mínimo (más corto, el canal es una mancha).
    let mejor = -1
    let largo = Number.POSITIVE_INFINITY
    for (let intento = 0, vistas = 0; intento < b.n * 2 && vistas < PROGRAMA.candidatasDelLogo; intento += 1) {
      const i = Math.floor(azar() * b.n)
      const d = Math.hypot(b.lugar[i * 3] - en.logo[0], b.lugar[i * 3 + 1] - en.logo[1], b.lugar[i * 3 + 2] - en.logo[2])
      if (d > PROGRAMA.alcances.logo || !seVeLaBrasa(b, i, en)) continue
      vistas += 1
      if (!en.bordeDelLogo(b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2], BORDE) || !en.seVe(BORDE[0], BORDE[1], BORDE[2])) continue
      const l = Math.hypot(b.lugar[i * 3] - BORDE[0], b.lugar[i * 3 + 1] - BORDE[1], b.lugar[i * 3 + 2] - BORDE[2])
      if (l >= PROGRAMA.logoMinimo && l < largo) {
        mejor = i
        largo = l
        PUNTO.set(BORDE)
      }
    }
    if (mejor >= 0) {
      const arco = lugarLibre(e, en.maximo, true)
      if (arco !== null) {
        arco.puntoA.set(PUNTO)
        encender(e, arco, 'logo', -1, mejor, b, en.camara, azar)
      }
    }
  }
}
