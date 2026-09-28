/**
 * [ESCENA 6] 6e · EL HAZ SE ENCIENDE — pura: cuando cae la noche, E1 arranca como una luz artificial.
 *
 * La máquina lleva `k`, lo que se multiplica a la parte de noche del haz: la columna, el charco, el
 * polvo del haz, las motas (5d) y la mancha dura (5c) siguen esa intensidad. Prendido vale 1; en los
 * picos del encendido pasa de 1 (el haz en su nivel `sutil` es tan tenue que un parpadeo hasta 1 no
 * se lee: un tubo que arranca destella más fuerte y después se asienta). De día no cambia nada: la
 * luz de día del haz no es este foco.
 *
 * - **apagado → encendiendo** cuando la noche pasa `prende`. El encendido es un guion fijo: dos
 *   parpadeos, un instante inestable y después firme (`GUION`).
 * - **encendiendo → prendido** al terminar el guion.
 * - **prendido (o encendiendo) → apagando** cuando la noche baja de `apaga`: se apaga suave.
 * - **apagando → apagado** cuando `k` llega a 0.
 *
 * HISTÉRESIS: entre `apaga` y `prende` no cambia nada, y si vuelve a anochecer antes de `reposoS`
 * desde que se apagó, prende sin parpadear (sube suave). Ir y volver sobre la frontera de la noche no
 * repite el parpadeo a cada rato.
 */
export const ENCENDIDO = {
  prende: 0.55,
  apaga: 0.35,
  /** Lo que tarda en apagarse, y en prender sin parpadeo (s). */
  apagaS: 1.2,
  subeS: 0.6,
  /** Cuánto tiene que estar apagado para volver a parpadear al prender (s). */
  reposoS: 8,
} as const

/**
 * El guion del encendido: tramos (desde, hasta, intensidad) en segundos. Entre dos tramos, apagado;
 * en el inestable la intensidad tiembla alrededor de su valor.
 */
export const GUION: readonly (readonly [number, number, number])[] = [
  [0.08, 0.15, 2.2],
  [0.31, 0.37, 1.8],
  [0.52, 1.25, 1.35],
  [1.25, 1.6, 1.15],
]
export const GUION_S = 1.6
/** El tramo inestable: de cuándo a cuándo tiembla, y cuánto. */
const INESTABLE = { desde: 0.52, hasta: 1.25, cuanto: 0.5 } as const

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
  // Si la escena arranca de noche (un salto, una recarga), el haz ya está prendido: no parpadea sin que nadie lo vea caer.
  return noche >= ENCENDIDO.prende ? { fase: 'prendido', desde: t, apagadoEn: -Infinity, k: 1, kInicial: 1 } : { fase: 'apagado', desde: t, apagadoEn: -Infinity, k: 0, kInicial: 0 }
}

/** El temblor del tramo inestable: dos senos rápidos, deterministas. */
function temblor(s: number): number {
  return 0.5 * Math.sin(s * 71.3) + 0.5 * Math.sin(s * 43.1 + 1.7)
}

/** La intensidad del guion a `s` segundos de empezar. */
export function guionEn(s: number): number {
  for (const [desde, hasta, k] of GUION) {
    if (s < desde || s >= hasta) continue
    if (s >= INESTABLE.desde && s < INESTABLE.hasta) return Math.max(0, k + INESTABLE.cuanto * temblor(s))
    // El último tramo se asienta suave, de `k` a 1.
    if (hasta === GUION_S) return k + (1 - k) * ((s - desde) / (hasta - desde))
    return k
  }
  return s >= GUION_S ? 1 : 0
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
      if (en >= GUION_S) return { ...e, fase: 'prendido', desde: t, k: 1, kInicial: 1 }
      return { ...e, k: guionEn(en) }
    case 'prendido':
      if (noche < ENCENDIDO.apaga) return { ...e, fase: 'apagando', desde: t, kInicial: e.k }
      // Prendido sin guion (volvió a anochecer enseguida): sube suave desde donde estaba.
      return { ...e, k: Math.min(1, e.kInicial + (1 - e.kInicial) * Math.min(1, en / ENCENDIDO.subeS)) }
    case 'apagando': {
      if (noche >= ENCENDIDO.prende) return { ...e, fase: 'prendido', desde: t, kInicial: e.k }
      const k = Math.max(0, e.kInicial * (1 - en / ENCENDIDO.apagaS))
      return k <= 0 ? { fase: 'apagado', desde: t, apagadoEn: t, k: 0, kInicial: 0 } : { ...e, k }
    }
  }
}

/** Lo que leen los demás (las motas, la sombra): la intensidad del haz de noche, 1 sin la prueba. */
export const HAZ_ENCENDIDO = { k: 1 }
