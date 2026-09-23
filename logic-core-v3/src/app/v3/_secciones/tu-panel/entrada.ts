/**
 * LA ENTRADA DE «Y MÁS…» — de derecha a izquierda, una vez, con la curva que el
 * catálogo no tenía.
 *
 * ⚠️ **No hay un patrón del catálogo que haga esto.** Los nueve de
 * `_lib/motion/patrones*.ts` están ligados al scroll (`scrub`) y ninguno entra
 * en X por tiempo: P6 cruza en X pero atado a la posición del scroll. Ésta es una
 * entrada POR TIEMPO que se dispara una sola vez cuando la pieza entra en vista,
 * así que se declara acá como gesto de la sección y se anota en el contrato
 * (`USOS_DECLARADOS` y `DIRECCION-ESCENA.md`). Subirlo al catálogo compartido
 * es una decisión del planificador: `_lib/motion` no es de este lane.
 *
 * La curva es `expo.out` de GSAP: 1 − 2^(−10·t). CSS no la trae, y
 * `cubic-bezier` sólo la aproxima; se la pasa a la Web Animations API como
 * `linear(…)` muestreada, que la reproduce punto por punto.
 */

/** `expo.out`: rápida al principio y frenando al final. */
export function salidaExponencial(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/** Cuántos tramos lleva el `linear()`. Con 24, el error contra la curva queda debajo de un píxel a 1440. */
export const MUESTRAS_DE_LA_CURVA = 24

/** La curva como easing de CSS: `linear(0, 0.2929, …, 1)`. */
export function curvaComoLinear(curva: (t: number) => number, muestras: number = MUESTRAS_DE_LA_CURVA): string {
  const puntos: string[] = []
  for (let i = 0; i <= muestras; i += 1) puntos.push(curva(i / muestras).toFixed(4))
  return `linear(${puntos.join(', ')})`
}

/** Cuándo arranca el punto `k` (0, 1, 2): después de que la frase llegó, uno detrás del otro. */
export function arranqueDelPunto(k: number, duracionDeLaFrase: number, duracionDelPunto: number): number {
  return duracionDeLaFrase + (k * duracionDelPunto) / 2
}

/** Una pieza del remate en el cronograma de WAAPI. */
export interface TramoDelRemate {
  readonly pieza: 'frase' | 'punto' | 'newsletter'
  readonly delay: number
  readonly duration: number
  /** Relleno hasta el final común: sin él, al invertir cada pieza arrancaría desde su propio final. */
  readonly endDelay: number
}

/** El newsletter arranca cuando la frase ya recorrió un cuarto de su tiempo. */
export const DESFASE_DEL_NEWSLETTER = 0.25

/**
 * EL CRONOGRAMA REVERSIBLE — SPRINT PANEL 2.
 *
 * Todas las piezas terminan en el MISMO instante (`delay + duration + endDelay`
 * igual para todas). Es lo que hace que `playbackRate = -1` las devuelva en
 * espejo: se van primero los puntos, que llegaron últimos, y la frase al final.
 */
export function cronogramaDelRemate(duracion: number, duracionDelPunto: number, puntos: number): TramoDelRemate[] {
  const crudos: Omit<TramoDelRemate, 'endDelay'>[] = [
    { pieza: 'frase', delay: 0, duration: duracion },
    ...Array.from({ length: puntos }, (_, k) => ({ pieza: 'punto' as const, delay: arranqueDelPunto(k, duracion, duracionDelPunto), duration: duracionDelPunto })),
    { pieza: 'newsletter', delay: duracion * DESFASE_DEL_NEWSLETTER, duration: duracion },
  ]
  const total = Math.max(...crudos.map((t) => t.delay + t.duration))
  return crudos.map((t) => ({ ...t, endDelay: total - t.delay - t.duration }))
}
