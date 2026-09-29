/**
 * [ESCENA 6] 6e · EL HAZ SE ENCIENDE — pura: cuando cae la noche, E1 arranca como una luz artificial.
 * [ESCENA 7] T9: encendido en el producto, y más notorio.
 * [ESCENA 8] T1: se pasaba de fallas; quedan la mitad de los intentos (de siete, cuatro: uno sí y uno no).
 *
 * La máquina lleva `k`, lo que se multiplica a la parte de noche del haz: la columna, el charco, el
 * polvo del haz, las motas (5d), la mancha dura (5c) y la luz que rebota del piso (T12) siguen esa
 * intensidad. De día no cambia nada: la luz de día del haz no es este foco.
 *
 * **El guion (T9, T1 de ESCENA 8).** Primero FALLA: cuatro intentos cortos y tenues, dispares, con dos
 * tramos que tiemblan (~1,7 s), todos más débiles que la luz final. Un instante a oscuras,
 * y ENCIENDE: un golpe más fuerte que todo lo anterior que se asienta en `FIRME`, más alto que el haz de
 * ESCENA 6 (que quedaba en 1). En ESCENA 6 los intentos eran destellos por encima del final; ahora se lee
 * que está fallando y que después prende.
 *
 * - **apagado → encendiendo** cuando la noche pasa `prende`.
 * - **encendiendo → prendido** al terminar el guion.
 * - **prendido (o encendiendo) → apagando** cuando la noche baja de `apaga`: se apaga suave.
 * - **apagando → apagado** cuando `k` llega a 0.
 *
 * HISTÉRESIS: entre `apaga` y `prende` no cambia nada, y si vuelve a anochecer antes de `reposoS`
 * desde que se apagó, prende sin fallar (sube suave a `FIRME`). Ir y volver sobre la frontera de la noche
 * no repite el guion a cada rato.
 */
export const ENCENDIDO = {
  prende: 0.55,
  apaga: 0.35,
  /** Lo que tarda en apagarse, y en prender sin el guion (s). */
  apagaS: 1.2,
  subeS: 0.6,
  /** Cuánto tiene que estar apagado para volver a fallar al prender (s). */
  reposoS: 8,
} as const

/** La intensidad del haz prendido, contra la de ESCENA 6 (1). */
export const FIRME = 1.45

/**
 * El guion: tramos (desde, hasta, intensidad) en segundos. Entre dos tramos, apagado. Los intentos que
 * fallan, tenues; los dos largos tiemblan (`TIEMBLAN`). El último es el encendido: un golpe que se asienta.
 */
export const GUION: readonly (readonly [number, number, number])[] = [
  [0.1, 0.17, 0.42],
  [0.36, 0.69, 0.5],
  [0.92, 1.36, 0.58],
  [1.58, 1.66, 0.62],
  [1.94, 2.86, 2.4],
]
export const GUION_S = 2.86
/** Dónde termina la falla y arranca el encendido de verdad (s). */
export const FALLA_S = 1.94
/** Los tramos que tiemblan, y cuánto. */
const TIEMBLAN = { cuanto: 0.25, tramos: [1, 2] } as const

export type Fase = 'apagado' | 'encendiendo' | 'prendido' | 'apagando'

export interface EstadoDelEncendido {
  readonly fase: Fase
  /** Cuándo entró a esta fase (reloj de la escena). */
  readonly desde: number
  /** Cuándo se apagó del todo por última vez. */
  readonly apagadoEn: number
  readonly k: number
  /** El `k` con que arrancó la fase (para apagar o subir suave desde donde estaba). */
  readonly kInicial: number
}

export function encendidoInicial(noche: number, t: number): EstadoDelEncendido {
  // Si la escena arranca de noche (un salto, una recarga), el haz ya está prendido: no falla sin que nadie lo vea caer.
  return noche >= ENCENDIDO.prende ? { fase: 'prendido', desde: t, apagadoEn: -Infinity, k: FIRME, kInicial: FIRME } : { fase: 'apagado', desde: t, apagadoEn: -Infinity, k: 0, kInicial: 0 }
}

/** El temblor de un tramo inestable: dos senos rápidos, deterministas. */
function temblor(s: number): number {
  return 0.5 * Math.sin(s * 71.3) + 0.5 * Math.sin(s * 43.1 + 1.7)
}

/** La intensidad del guion a `s` segundos de empezar. */
export function guionEn(s: number): number {
  for (let i = 0; i < GUION.length; i += 1) {
    const [desde, hasta, k] = GUION[i]
    if (s < desde || s >= hasta) continue
    if ((TIEMBLAN.tramos as readonly number[]).includes(i)) return Math.max(0, k + TIEMBLAN.cuanto * temblor(s))
    // El encendido: el golpe en 0,05 s y después se asienta en FIRME.
    if (hasta === GUION_S) {
      const u = (s - desde) / (hasta - desde)
      return u < 0.06 ? k * (u / 0.06) : k + (FIRME - k) * (1 - Math.exp(-(u - 0.06) * 5))
    }
    return k
  }
  return s >= GUION_S ? FIRME : 0
}

/** Un paso: la noche de este cuadro y el reloj. Con `reducido`, sin guion: sigue a la noche sin parpadear. */
export function avanzarElEncendido(e: EstadoDelEncendido, noche: number, t: number, reducido: boolean): EstadoDelEncendido {
  const en = t - e.desde
  switch (e.fase) {
    case 'apagado':
      if (noche < ENCENDIDO.prende) return e
      if (reducido || t - e.apagadoEn < ENCENDIDO.reposoS) return { ...e, fase: 'prendido', desde: t, kInicial: e.k }
      return { ...e, fase: 'encendiendo', desde: t, kInicial: 0 }
    case 'encendiendo':
      if (noche < ENCENDIDO.apaga) return { ...e, fase: 'apagando', desde: t, kInicial: e.k }
      if (en >= GUION_S) return { ...e, fase: 'prendido', desde: t, k: FIRME, kInicial: FIRME }
      return { ...e, k: guionEn(en) }
    case 'prendido': {
      if (noche < ENCENDIDO.apaga) return { ...e, fase: 'apagando', desde: t, kInicial: e.k }
      // Prendido sin guion (volvió a anochecer enseguida): sube suave desde donde estaba.
      const k = e.kInicial + (FIRME - e.kInicial) * Math.min(1, en / ENCENDIDO.subeS)
      // [CALIDAD 1] B2: asentado, el mismo estado (la noche entera sin reservar nada por cuadro).
      return k === e.k ? e : { ...e, k }
    }
    case 'apagando': {
      if (noche >= ENCENDIDO.prende) return { ...e, fase: 'prendido', desde: t, kInicial: e.k }
      const k = Math.max(0, e.kInicial * (1 - en / ENCENDIDO.apagaS))
      return k <= 0 ? { fase: 'apagado', desde: t, apagadoEn: t, k: 0, kInicial: 0 } : { ...e, k }
    }
  }
}

/** Lo que leen los demás (las motas, la sombra, el rebote): la intensidad del haz de noche (1 sin el encendido). */
export const HAZ_ENCENDIDO = { k: 1 }
