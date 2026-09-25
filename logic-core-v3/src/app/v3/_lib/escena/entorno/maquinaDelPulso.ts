/**
 * [ESCENA 3] E4 · EL PULSO — la máquina de estados, pura: (estado, tiempo, entradas) → estado.
 *
 * Sin React, sin three y sin reloj propio: el tiempo entra como número, así que el invariante
 * (`__tests__/s29-pulso.invariant.ts`) la recorre entera sin navegador.
 *
 * - **reposo** (scroll quieto, sin hover): un anillo cada `periodoReposoS`.
 * - **scroll** en movimiento: no nace ninguno; los vivos terminan su recorrido.
 * - **hover** sobre el logo: un anillo cada `periodoHoverS`, más corto y de menos alcance.
 * - **entrada y salida del hover**: un anillo PRINCIPAL en el instante, más grande y más lento. Al
 *   salir se vuelve al período de reposo (y sólo con el scroll quieto, porque si no el modo es
 *   scroll).
 * - **apagado** (movimiento reducido): ningún anillo.
 *
 * Nunca se corta un anillo vivo: cada uno trae su duración desde que nace. Al cambiar de modo sólo
 * se reprograma el PRÓXIMO. El tope cuenta todos los vivos, y los periódicos dejan siempre un
 * lugar libre, así que el principal siempre entra.
 */

/** LAS CONSTANTES DEL PULSO — todo lo que se afina, en un solo lugar. */
export const PULSO = {
  /** Período en reposo: el 60 % de los 6,2 s de ESCENA 2. */
  periodoReposoS: 3.72,
  /** Período con el cursor sobre el logo: un cuarto del de reposo. */
  periodoHoverS: 0.93,
  /** Cuánto tiene que estar quieto el progreso para que el scroll cuente como detenido. */
  quietudDelScrollS: 0.18,
  /**
   * Tope de anillos vivos a la vez, contando el principal. Arrancó en 3 y con 3 el hover no
   * llegaba a sentirse a ¼: al entrar ya están vivos el de reposo y el principal (4,5 s), y con el
   * lugar reservado para el principal de salida los rápidos no nacían hasta 2,4 s después. Con 4,
   * el primero nace a un período de hover de la entrada.
   */
  tope: 4,
  /** Cada clase de anillo: vida (s), radio final en el piso (unidades de mundo) y amplitud. */
  anillos: {
    reposo: { duracionS: 3.6, alcance: 26, amplitud: 1 },
    hover: { duracionS: 1.9, alcance: 15, amplitud: 0.85 },
    principal: { duracionS: 4.5, alcance: 33, amplitud: 1.5 },
  },
} as const

export type ClaseDeAnillo = keyof typeof PULSO.anillos

export type ModoDelPulso = 'reposo' | 'scroll' | 'hover' | 'apagado'

export interface Anillo {
  /** Cuándo nació, en el reloj de la escena. */
  readonly nace: number
  readonly clase: ClaseDeAnillo
}

export interface EstadoDelPulso {
  readonly modo: ModoDelPulso
  /** Cuándo nace el próximo periódico; `null` si en este modo no nace ninguno. */
  readonly proximo: number | null
  readonly anillos: readonly Anillo[]
}

export interface EntradasDelPulso {
  /** El reloj de la escena, en segundos. */
  readonly t: number
  readonly scrollEnMovimiento: boolean
  /** El puntero está sobre el logo (con todas las compuertas de `hoverDelLogo.ts` ya aplicadas). */
  readonly hover: boolean
  readonly reducido: boolean
}

export type ConstantesDelPulso = typeof PULSO

/** Arranca en reposo con el primer anillo a medio período: la escena no espera un ciclo entero. */
export function pulsoInicial(t: number, c: ConstantesDelPulso = PULSO): EstadoDelPulso {
  return { modo: 'reposo', proximo: t + c.periodoReposoS / 2, anillos: [] }
}

export function modoDelPulso(e: EntradasDelPulso): ModoDelPulso {
  if (e.reducido) return 'apagado'
  if (e.scrollEnMovimiento) return 'scroll'
  return e.hover ? 'hover' : 'reposo'
}

function periodoDe(modo: ModoDelPulso, c: ConstantesDelPulso): number | null {
  if (modo === 'reposo') return c.periodoReposoS
  if (modo === 'hover') return c.periodoHoverS
  return null
}

/** ¿El anillo sigue vivo en `t`? */
export function vivoEn(anillo: Anillo, t: number, c: ConstantesDelPulso = PULSO): boolean {
  return t - anillo.nace < c.anillos[anillo.clase].duracionS
}

export function avanzarElPulso(estado: EstadoDelPulso, e: EntradasDelPulso, c: ConstantesDelPulso = PULSO): EstadoDelPulso {
  const modo = modoDelPulso(e)
  if (modo === 'apagado') return { modo, proximo: null, anillos: [] }

  // 1 · Los que terminaron su recorrido se van. Los vivos, nunca.
  let anillos = estado.anillos.filter((a) => vivoEn(a, e.t, c))
  let proximo = estado.proximo

  // 2 · Un cambio de modo reprograma el próximo; entrar o salir del hover larga el principal.
  if (modo !== estado.modo) {
    const entra = modo === 'hover'
    const sale = estado.modo === 'hover' && modo === 'reposo'
    if ((entra || sale) && anillos.length < c.tope) anillos = [...anillos, { nace: e.t, clase: 'principal' }]
    const periodo = periodoDe(modo, c)
    proximo = periodo === null ? null : e.t + periodo
  }

  // 3 · El periódico de este modo, si le toca y hay lugar (dejando uno para el principal).
  const periodo = periodoDe(modo, c)
  if (periodo !== null && proximo !== null && e.t >= proximo) {
    if (anillos.length < c.tope - 1) anillos = [...anillos, { nace: e.t, clase: modo === 'hover' ? 'hover' : 'reposo' }]
    proximo += periodo
    if (proximo <= e.t) proximo = e.t + periodo
  }

  return { modo, proximo, anillos }
}
