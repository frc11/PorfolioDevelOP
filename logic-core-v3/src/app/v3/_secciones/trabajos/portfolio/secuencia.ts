import type { Transition } from 'motion/react'

/**
 * [B1.2b] LA SECUENCIA DE UNA TIRA — un solo gatillo por proyecto (plan §12, punto 5). Al cruzar el borde de su paso (o con el
 * panel entrando, para la primera), la secuencia entera va POR TIEMPO: primero la tira con el video y el nombre; a los 400 ms la
 * ficha, escalonada de a 80 ms. El resto del scroll del proyecto es permanencia. Al irse, se apaga enseguida (la tira se cierra
 * igual). Con movimiento reducido, todo de una. La curva es la del revelado de las secciones (`CLAUDE.md`). Sólo la opacidad: la
 * rama quieta (y el servidor) no escribe una transformada (`trabajos.invariant` §6).
 */
export const SECUENCIA = { entraS: 0.5, fichaTrasS: 0.4, escalonS: 0.08, seVaS: 0.15, curva: [0.25, 0.46, 0.45, 0.94] } as const

/** Cuándo arranca la pieza `orden` (0: el video y el nombre; 1, 2…: la ficha, de arriba abajo), en segundos. */
export const demoraDe = (orden: number): number => (orden <= 0 ? 0 : SECUENCIA.fichaTrasS + (orden - 1) * SECUENCIA.escalonS)

/** Las props de Motion de una pieza de la secuencia: visible (su tira activa con el panel adentro) o no. */
export function enLaSecuencia(visible: boolean, orden: number, reducido: boolean): {
  readonly initial: false
  readonly animate: { readonly opacity: number }
  readonly transition: Transition
} {
  const transition: Transition = reducido
    ? { duration: 0 }
    : visible
      ? { duration: SECUENCIA.entraS, delay: demoraDe(orden), ease: [...SECUENCIA.curva] }
      : { duration: SECUENCIA.seVaS }
  return { initial: false, animate: { opacity: visible ? 1 : 0 }, transition }
}
