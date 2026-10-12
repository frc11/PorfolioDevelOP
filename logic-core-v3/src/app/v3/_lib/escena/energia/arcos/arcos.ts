import type { Brasas } from '../brasas'
import { largo3 } from '../largo'
import { CAMINO, crearForma, temblar, trazar, type Forma } from './camino'

/**
 * [PULIDO 17] O3 · LOS ARCOS (`docs/rediseno/PLASMA.md`): los de PULIDO 15 (cortos, quebrados, pocos; el logo es la fuente), más
 * luminosos y menos dibujados. Cada arco se ENCIENDE 2–3 veces en ~150 ms por el mismo canal (los re-golpes de un rayo: en cada uno
 * el canal tiembla un poco) y el canal queda brillando un rato (el resplandor residual). Une dos brasas o una brasa y un punto (el
 * borde del logo, el puntero, el clic; o el aire, si la descarga no encuentra a quién). Las clases: entre las dos de un enlace
 * (`par`), del logo (`logo`), al puntero (`cursor`), el pulso del clic (`pulso`) y la descarga al soltar (`descarga`, la más grande).
 * Como mucho `maximo` a la vez. Todo en arreglos fijos. Puro (Node). Quién nace y cuándo, `programador.ts`; el búfer, `cinta.ts`.
 */
export const ARCOS = {
  maximo: 5,
  maximoCompacto: 4,
  lugares: 6,
  /** Los golpes: cuántos, en qué ventana caen los que siguen al primero (s), cuánto dura el destello de cada uno (s), el resplandor del canal (s) y su temblor. */
  golpes: { cuantos: [2, 3], ventana: [0.04, 0.16], destello: 0.03, residual: 0.15, temblor: 0.18 },
  /** Un par que sigue enlazado puede volver a saltar al apagarse su arco: con qué chance y en cuánto (s). */
  repite: { chance: 0.4, en: [0.04, 0.2] },
  clases: {
    par: { brillo: 0.85, ancho: 1, ramas: 1 },
    logo: { brillo: 1.3, ancho: 1.25, ramas: 1 },
    cursor: { brillo: 1, ancho: 0.9, ramas: 1 },
    pulso: { brillo: 1.1, ancho: 1, ramas: 2 },
    descarga: { brillo: 1.7, ancho: 1.6, ramas: 2 },
  },
} as const

export type ClaseDeArco = keyof typeof ARCOS.clases
export const CLASES_DE_ARCOS: readonly ClaseDeArco[] = ['par', 'logo', 'cursor', 'pulso', 'descarga']

export interface Arco {
  activo: boolean
  clase: ClaseDeArco
  /** Las brasas de los extremos (−1: un punto fijo en `puntoA`/`puntoB`). */
  a: number
  b: number
  readonly puntoA: Float32Array
  readonly puntoB: Float32Array
  readonly forma: Forma
  golpes: number
  readonly tiempos: Float32Array
  /** Cuántos golpes ya se dieron (cada uno hace temblar el canal) y cuántos se dieron en este cuadro (calientan lo que tocan). */
  dados: number
  nuevos: number
  edad: number
  vida: number
  brillo: number
  ancho: number
}

/** Lo que pide el puntero: el pulso del clic (dónde) y la descarga al soltar (dónde y con cuánta carga, 0 a 1). */
export interface Pedidos {
  pulso: boolean
  descarga: boolean
  fuerza: number
  readonly donde: Float32Array
}

export interface EstadoDeLosArcos {
  readonly arcos: readonly Arco[]
  /** Los re-saltos pendientes de un par (el parpadeo del plasma): (a, b, en cuánto). */
  readonly pendientes: Float32Array
  cuantosPendientes: number
  proximoDelLogo: number
  /** Lo que pide el banco (un arco ya). */
  forzado: ClaseDeArco | null
  readonly pedidos: Pedidos
  readonly contados: Record<ClaseDeArco, number>
  maximoALaVez: number
  /** Los que nacieron en este cuadro (calientan la escena). */
  nacidos: number
}

export function crearArcos(azar: () => number): EstadoDeLosArcos {
  const arcos = Array.from({ length: ARCOS.lugares }, (): Arco => ({
    activo: false,
    clase: 'par',
    a: -1,
    b: -1,
    puntoA: new Float32Array(3),
    puntoB: new Float32Array(3),
    forma: crearForma(),
    golpes: 0,
    tiempos: new Float32Array(3),
    dados: 0,
    nuevos: 0,
    edad: 0,
    vida: 0,
    brillo: 0,
    ancho: 1,
  }))
  return {
    arcos,
    pendientes: new Float32Array(ARCOS.lugares * 3),
    cuantosPendientes: 0,
    proximoDelLogo: 1 + azar() * 2,
    forzado: null,
    pedidos: { pulso: false, descarga: false, fuerza: 0, donde: new Float32Array(3) },
    contados: { par: 0, logo: 0, cursor: 0, pulso: 0, descarga: 0 },
    maximoALaVez: 0,
    nacidos: 0,
  }
}

export const entre = (azar: () => number, t: readonly number[]): number => t[0] + azar() * (t[1] - t[0])

/** El extremo `a` (true) o `b` del arco ahora (relativo al centro), en `destino`. */
export function extremo(arco: Arco, b: Brasas, deA: boolean, destino: Float32Array): void {
  const i = deA ? arco.a : arco.b
  const fijo = deA ? arco.puntoA : arco.puntoB
  if (i >= 0) {
    destino[0] = b.lugar[i * 3]
    destino[1] = b.lugar[i * 3 + 1]
    destino[2] = b.lugar[i * 3 + 2]
  } else destino.set(fijo)
}

/** El brillo de los golpes a la edad `t` (cada uno, un destello que se apaga rápido). */
export function golpeEn(arco: Arco, t: number): number {
  let s = 0
  for (let k = 0; k < arco.golpes; k += 1) if (t >= arco.tiempos[k]) s += Math.exp(-(t - arco.tiempos[k]) / ARCOS.golpes.destello)
  return Math.min(1.4, s)
}

/** El resplandor residual del canal a la edad `t` (se termina de apagar en su vida, sin corte). */
export function residualEn(arco: Arco, t: number): number {
  let s = 0
  for (let k = 0; k < arco.golpes; k += 1) if (t >= arco.tiempos[k]) s += 0.5 * Math.exp(-(t - arco.tiempos[k]) / ARCOS.golpes.residual)
  return Math.min(0.8, s) * Math.min(1, Math.max(0, (arco.vida - t) / 0.06))
}

export function activos(e: EstadoDeLosArcos): number {
  let k = 0
  for (const a of e.arcos) if (a.activo) k += 1
  return k
}

/** Un lugar libre; si no hay (o se llegó al tope) y `desplaza`, el del más viejo que no sea del puntero. */
export function lugarLibre(e: EstadoDeLosArcos, maximo: number, desplaza: boolean): Arco | null {
  if (activos(e) < maximo) {
    for (const a of e.arcos) if (!a.activo) return a
    return null
  }
  if (!desplaza) return null
  let viejo: Arco | null = null
  for (const a of e.arcos) if (a.activo && a.clase !== 'cursor' && (viejo === null || a.edad / a.vida > viejo.edad / viejo.vida)) viejo = a
  if (viejo !== null) viejo.activo = false
  return viejo
}

const A = new Float32Array(3)
const B = new Float32Array(3)

/** Enciende `arco` de la clase pedida entre `a` y `b` (brasas, o −1 con su punto ya puesto), visto desde `camara`. */
export function encender(e: EstadoDeLosArcos, arco: Arco, clase: ClaseDeArco, a: number, b: number, brasas: Brasas, camara: ArrayLike<number>, azar: () => number): void {
  const c = ARCOS.clases[clase]
  arco.activo = true
  arco.clase = clase
  arco.a = a
  arco.b = b
  arco.edad = 0
  arco.dados = 0
  arco.nuevos = 0
  arco.brillo = c.brillo * (0.8 + 0.2 * azar())
  arco.ancho = c.ancho
  arco.golpes = Math.floor(entre(azar, [ARCOS.golpes.cuantos[0], ARCOS.golpes.cuantos[1] + 0.999]))
  arco.tiempos[0] = 0
  for (let k = 1; k < arco.golpes; k += 1) arco.tiempos[k] = Math.max(arco.tiempos[k - 1] + 0.02, entre(azar, ARCOS.golpes.ventana))
  arco.vida = arco.tiempos[arco.golpes - 1] + ARCOS.golpes.residual * 2.2
  extremo(arco, brasas, true, A)
  extremo(arco, brasas, false, B)
  trazar(arco.forma, A, B, camara, azar() < 0.35 ? 0 : azar() < 0.7 ? 1 : c.ramas, azar)
  e.contados[clase] += 1
  e.nacidos += 1
  e.maximoALaVez = Math.max(e.maximoALaVez, activos(e))
}

/** Envejece los arcos: en cada golpe nuevo el canal tiembla (y `nuevos` cuenta los de este cuadro); se apagan al terminar su vida. */
export function envejecer(e: EstadoDeLosArcos, brasas: Brasas, dt: number, azar: () => number): void {
  for (const arco of e.arcos) {
    arco.nuevos = 0
    if (!arco.activo) continue
    arco.edad += dt
    while (arco.dados < arco.golpes && arco.edad >= arco.tiempos[arco.dados]) {
      if (arco.dados > 0) {
        extremo(arco, brasas, true, A)
        extremo(arco, brasas, false, B)
        temblar(arco.forma, largo3(B[0] - A[0], B[1] - A[1], B[2] - A[2]), ARCOS.golpes.temblor, azar)
      }
      arco.dados += 1
      arco.nuevos += 1
    }
    if (arco.edad < arco.vida) continue
    arco.activo = false
    // El par sigue enlazado: a veces vuelve a saltar enseguida (el parpadeo del plasma).
    if (arco.clase === 'par' && brasas.pareja[arco.a] === arco.b && e.cuantosPendientes < ARCOS.lugares && azar() < ARCOS.repite.chance) {
      const k = e.cuantosPendientes
      e.pendientes[k * 3] = arco.a
      e.pendientes[k * 3 + 1] = arco.b
      e.pendientes[k * 3 + 2] = entre(azar, ARCOS.repite.en)
      e.cuantosPendientes += 1
    }
  }
}

/** Cuántos tramos puede pedir un arco al búfer (el camino y sus ramas). */
export const TRAMOS_POR_ARCO = 2 ** CAMINO.niveles + CAMINO.ramas.maximo * 2 ** CAMINO.ramas.niveles
