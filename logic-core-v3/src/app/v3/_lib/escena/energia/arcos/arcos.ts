import { CAMINO, PUNTOS_DEL_CAMINO, PUNTOS_DE_RAMA, type Campo } from './camino'
import type { Particulas } from '../especies'
import type { RayoDelPuntero } from '../fisica/fisica'

/**
 * [PULIDO 16] N2 · LOS ARCOS QUE OBEDECEN A LA FÍSICA (`docs/rediseno/PLASMA.md`). Cada arco:
 *   · su CAMINO es un líder escalonado que sigue al campo eléctrico, con ramas que buscan cargas cercanas (`camino.ts`);
 *   · se enciende 2–3 veces en ~150 ms por el MISMO canal (los re-golpes de un rayo), y el canal queda brillando un rato
 *     (el resplandor residual, que decae en ~140 ms);
 *   · IONIZA lo que toca: un átomo cerca de su camino se vuelve ion y suelta un electrón que sale disparado (`especies.ts`);
 *   · ILUMINA un instante su entorno (`lucesDeLosArcos`: las partículas cercanas, el piso y el logo, en `render/`).
 * Las clases: entre un ion y su electrón ligado (`par`), del logo, que es el generador (`logo`: los más limpios y potentes), al
 * puntero (`cursor`), el pulso del clic (`pulso`) y la descarga al soltar el botón (`descarga`: la más grande). Como mucho
 * `maximo` a la vez (los re-golpes no suman); las tasas suben con la temperatura, que se satura (el autolímite). Todo en arreglos
 * fijos: sin reservas. Puro (la prueba lo corre en Node). Quién nace y cuándo, `programador.ts`; el búfer del dibujo, `bufer.ts`.
 */
export const ARCOS = {
  maximo: 5,
  maximoCompacto: 4,
  lugares: 6,
  /** Los golpes: en qué ventana caen todos (s), cuánto dura el destello de cada uno (s), el resplandor del canal (s) y el temblor del re-golpe. */
  golpes: { ventana: [0.04, 0.15], destello: 0.028, residual: 0.14, temblor: 0.1 },
  clases: {
    par: { golpes: [2, 3], brillo: 0.8, ancho: 1, ramas: [0, 1], ioniza: { radio: 0.35, chance: 0.35, maximo: 1 } },
    logo: { golpes: [3, 3], brillo: 1.35, ancho: 1.35, ramas: [0, 1], ioniza: { radio: 0.45, chance: 0.75, maximo: 3 } },
    cursor: { golpes: [2, 2], brillo: 1, ancho: 0.9, ramas: [0, 1], ioniza: { radio: 0.3, chance: 0.3, maximo: 1 } },
    pulso: { golpes: [2, 2], brillo: 1.1, ancho: 1, ramas: [1, 2], ioniza: { radio: 0.45, chance: 0.6, maximo: 2 } },
    descarga: { golpes: [3, 3], brillo: 1.8, ancho: 1.8, ramas: [1, 3], ioniza: { radio: 0.6, chance: 0.85, maximo: 4 } },
  },
  /** Cuántos por segundo (el de los pares y al puntero) y cada cuánto el del logo (s); por la temperatura: `× (1 + calor · T)`. */
  tasas: { par: 0.9, cursor: 2.2, logo: [2, 4], calor: 1.4 },
  /** Hasta dónde (u): el largo de un par, el del logo, al puntero (desde su rayo), el pulso (su radio) y la descarga. */
  alcances: { par: 3.4, logo: 7.5, cursor: [0.9, 3.2], pulso: 4, descarga: 9 },
  /** El pulso del clic: cuántos arcos, cuánto empuja (u/s) y cuántos ioniza como mucho. */
  pulso: { arcos: [2, 4], empuje: 3.2, ioniza: 3 },
  /** La rapidez del electrón que sale ionizado por un arco (u/s). */
  eyeccion: [2.8, 4.4],
} as const

export type ClaseDeArco = keyof typeof ARCOS.clases
export const CLASES_DE_ARCOS: readonly ClaseDeArco[] = ['par', 'logo', 'cursor', 'pulso', 'descarga']

export interface Arco {
  activo: boolean
  clase: ClaseDeArco
  /** Las partículas de los extremos (−1: un punto fijo en `puntoA`/`puntoB`: el borde del logo, el puntero, el clic). */
  a: number
  b: number
  readonly puntoA: Float32Array
  readonly puntoB: Float32Array
  /** Los extremos al nacer: el canal se lleva con ellos (cada punto, con lo que se movieron, repartido a lo largo). */
  readonly a0: Float32Array
  readonly b0: Float32Array
  readonly canal: Float32Array
  ramas: number
  readonly ramaDesde: Int32Array
  readonly ramaPuntos: Float32Array
  readonly ramaHalla: Uint8Array
  golpes: number
  readonly tiempos: Float32Array
  dados: number
  edad: number
  vida: number
  brillo: number
  ancho: number
  /** Cuánto siguió al campo su camino (0 a 1) y a cuántos ionizó. */
  alineacion: number
  ionizados: number
}

/** Lo que el programador necesita de afuera (lo arma `render/armado.ts`; en la prueba, a mano). */
export interface Entorno {
  readonly rayo: RayoDelPuntero | null
  readonly maximo: number
  readonly temperatura: number
  /** Cuánto más activo está el logo (0 a 1: después de su pulso, cerca del encastre y en el golpe del pie). */
  readonly actividadDelLogo: number
  /** ¿Se ve este punto (relativo al centro) y no cae sobre un texto? */
  readonly seVe: (x: number, y: number, z: number) => boolean
  /** El punto del borde del logo más cercano a (x, y, z), en `destino`; falso si el logo no está. */
  readonly bordeDelLogo: (x: number, y: number, z: number, destino: Float32Array) => boolean
  readonly campo: Campo
  /** Una carga cercana a (x, y, z) para una rama (su lugar en `destino`), o falso. */
  readonly buscarCarga: (x: number, y: number, z: number, destino: Float32Array) => boolean
}

/** El pedido del puntero: el pulso del clic (dónde) y la descarga al soltar (dónde y con cuánta carga, 0 a 1). */
export interface Pedidos {
  pulso: boolean
  descarga: boolean
  fuerza: number
  readonly donde: Float32Array
}

export interface EstadoDeLosArcos {
  readonly arcos: readonly Arco[]
  proximoDelLogo: number
  /** Lo que pide el banco (un arco ya). */
  forzado: ClaseDeArco | null
  readonly pedidos: Pedidos
  readonly contados: Record<ClaseDeArco, number>
  maximoALaVez: number
  /** Los que nacieron en este cuadro (el sonido, la temperatura) y a cuántos ionizaron en total. */
  nacidos: number
  ionizaciones: number
}

const R = CAMINO.ramas.maximo

export function crearArcos(azar: () => number): EstadoDeLosArcos {
  const arcos = Array.from({ length: ARCOS.lugares }, (): Arco => ({
    activo: false,
    clase: 'par',
    a: -1,
    b: -1,
    puntoA: new Float32Array(3),
    puntoB: new Float32Array(3),
    a0: new Float32Array(3),
    b0: new Float32Array(3),
    canal: new Float32Array(PUNTOS_DEL_CAMINO * 3),
    ramas: 0,
    ramaDesde: new Int32Array(R),
    ramaPuntos: new Float32Array(R * PUNTOS_DE_RAMA * 3),
    ramaHalla: new Uint8Array(R),
    golpes: 0,
    tiempos: new Float32Array(3),
    dados: 0,
    edad: 0,
    vida: 0,
    brillo: 0,
    ancho: 1,
    alineacion: 0,
    ionizados: 0,
  }))
  return { arcos, proximoDelLogo: 1 + azar() * 2, forzado: null, pedidos: { pulso: false, descarga: false, fuerza: 0, donde: new Float32Array(3) }, contados: { par: 0, logo: 0, cursor: 0, pulso: 0, descarga: 0 }, maximoALaVez: 0, nacidos: 0, ionizaciones: 0 }
}

export const entre = (azar: () => number, t: readonly number[]): number => t[0] + azar() * (t[1] - t[0])
export const entero = (azar: () => number, t: readonly number[]): number => Math.floor(t[0] + azar() * (t[1] - t[0] + 1))

/** El extremo `a` (true) o `b` del arco ahora (relativo al centro), en `destino`. */
export function extremo(arco: Arco, p: Particulas, deA: boolean, destino: Float32Array): void {
  const i = deA ? arco.a : arco.b
  const fijo = deA ? arco.puntoA : arco.puntoB
  if (i >= 0) {
    destino[0] = p.lugar[i * 3]
    destino[1] = p.lugar[i * 3 + 1]
    destino[2] = p.lugar[i * 3 + 2]
  } else {
    destino[0] = fijo[0]
    destino[1] = fijo[1]
    destino[2] = fijo[2]
  }
}

/** El brillo de los golpes a la edad `t` (cada uno, un destello que se apaga rápido) y el resplandor residual del canal. */
export function golpeEn(arco: Arco, t: number): number {
  let s = 0
  for (let k = 0; k < arco.golpes; k += 1) if (t >= arco.tiempos[k]) s += Math.exp(-(t - arco.tiempos[k]) / ARCOS.golpes.destello)
  return Math.min(1.4, s)
}
export function residualEn(arco: Arco, t: number): number {
  let s = 0
  for (let k = 0; k < arco.golpes; k += 1) if (t >= arco.tiempos[k]) s += 0.5 * Math.exp(-(t - arco.tiempos[k]) / ARCOS.golpes.residual)
  // Se termina de apagar en su vida (sin corte).
  const final = Math.min(1, Math.max(0, (arco.vida - t) / 0.06))
  return Math.min(0.8, s) * final
}

export function activos(e: EstadoDeLosArcos): number {
  let k = 0
  for (const a of e.arcos) if (a.activo) k += 1
  return k
}

/**
 * Las luces de los arcos vivos (las que iluminan su entorno): (x, y, z, intensidad) relativas al centro, la del medio del canal,
 * en `destino` (4 por luz, a lo sumo `maximo`). Devuelve cuántas.
 */
const A = new Float32Array(3)
const B = new Float32Array(3)

export function lucesDeLosArcos(e: EstadoDeLosArcos, p: Particulas, destino: Float32Array, maximo: number): number {
  let n = 0
  const medio = (PUNTOS_DEL_CAMINO - 1) >> 1
  for (const arco of e.arcos) {
    if (!arco.activo || n >= maximo) continue
    extremo(arco, p, true, A)
    extremo(arco, p, false, B)
    const s = medio / (PUNTOS_DEL_CAMINO - 1)
    for (let k = 0; k < 3; k += 1) destino[n * 4 + k] = arco.canal[medio * 3 + k] + (1 - s) * (A[k] - arco.a0[k]) + s * (B[k] - arco.b0[k])
    destino[n * 4 + 3] = (golpeEn(arco, arco.edad) + 0.4 * residualEn(arco, arco.edad)) * arco.brillo
    n += 1
  }
  return n
}
