import type { TargetAndTransition, Transition } from 'motion/react'

/**
 * [PULIDO 11] B1 · EL VOLTEO DE LOS DOS FORMULARIOS (el del pie y el panel de Contacto) — la única transformación entre el
 * formulario, la carga y la tarjeta del resultado (el hundido se borró). Lo nuevo guarda la CAJA de lo que estaba (el mismo alto:
 * la tarjeta ocupa la placa entera), así que las dos comparten el eje y nada se teletransporta en el cambio: las dos giran sobre
 * el eje horizontal del medio, en un solo movimiento de 180° (la que estaba hasta quedar de canto; la nueva, desde el canto).
 * [PULIDO 13] · el `columpio` (la bisagra arriba, `?volteo=columpio`) se borró: ganó el centrado.
 *
 * Con movimiento reducido, un fundido. Las curvas son las mismas en el DOM (Motion) y en la placa 3D del pie
 * (`escena/pie3d/transformacionDelPie.ts`).
 */
/** Los tiempos (s). `centrado`: el giro entero. `fundido`: con movimiento reducido. */
export const VOLTEO = {
  centrado: { s: 0.9 },
  fundido: { s: 0.4 },
} as const

/** La duración entera de un volteo. */
export function duracionDelVolteo(reducido: boolean): number {
  return reducido ? VOLTEO.fundido.s : VOLTEO.centrado.s
}

/**
 * [PULIDO 27] Y1 c · en el pie de volumen (la placa 3D) el cambio no es el volteo: la placa se derretía en el piso y lo nuevo nacía del
 * mismo charco. [PULIDO 28] AA2 · se hunde por su hueco sobre su plataforma, el piso se cierra, se cambian y sube la otra
 * (`escena/pie3d/transformacionDelPie.ts`). La duración entera (s), la mitad de cada lado; con movimiento reducido, el fundido de siempre.
 */
// [CIERRE A-bis] A8 · un 15 % más rápido (era 2,4): la bajada, el cierre, la apertura y la subida, 0,51 s cada una.
export const CAMBIO_DEL_PIE = { s: 2.04 } as const

export function duracionDelCambioDelPie(reducido: boolean): number {
  return reducido ? VOLTEO.fundido.s : CAMBIO_DEL_PIE.s
}

/**
 * [B10] EL HUNDIMIENTO DEL CAMBIO, sin three (vivía en `escena/pie3d/transformacionDelPie.ts`, que lo re-exporta): lo usan la placa 3D
 * del formulario y el FAQ del pie en el DOM (`_componentes/faq/`). `espesores`: cuánto baja la placa; `baja`: la parte del tiempo bajando.
 */
// [CIERRE A] A8 · la bajada y el cierre al mismo ritmo: medidos en el sitio la bajada de la placa duraba 2,3 veces el cierre del piso (0,84
// y 0,36 s de los 2,4 del cambio, `baja` 0,35); los dos en el promedio, 0,6 s cada uno (y lo mismo a la vuelta: la apertura y la subida).
export const HUNDIMIENTO_DEL_PIE = { espesores: 3, baja: 0.25 } as const

const suaveDelCambio = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/**
 * [PULIDO 28] AA2 · el piso en `t` (0 a 1): cuánto bajó la placa (parte de lo hondo: bajando hasta `baja`, subiendo desde `1 − baja`) y
 * cuánto se cerró el piso sobre ella (en lo que queda hasta la mitad, entero en la mitad: ahí se cambian; y se abre igual).
 */
export function pisoDelHundimiento(t: number): { readonly baja: number; readonly cerrado: number } {
  const H = HUNDIMIENTO_DEL_PIE
  const u = Math.min(1, Math.max(0, t))
  const ida = u < 0.5 ? u : 1 - u
  return { baja: suaveDelCambio(ida / H.baja), cerrado: suaveDelCambio((ida - H.baja) / (0.5 - H.baja)) }
}

const CURVA: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

/** Lo que Motion necesita para que un estado entre y salga (con `AnimatePresence` en `mode="wait"`). */
export interface TransicionDelVolteo {
  readonly initial: TargetAndTransition | false
  readonly animate: TargetAndTransition
  readonly exit: TargetAndTransition
  readonly transition: Transition
  readonly style: { readonly transformOrigin: string }
}

/**
 * El cambio de un estado al otro en el DOM. `quieto`: el pie en 3D (lo gira la escena): ninguna transformada.
 */
export function transicionDelVolteo(reducido: boolean, quieto = false): TransicionDelVolteo {
  if (quieto) return { initial: false, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 }, style: { transformOrigin: '50% 50%' } }
  if (reducido) return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: VOLTEO.fundido.s / 2, ease: CURVA }, style: { transformOrigin: '50% 50%' } }
  const mitad = VOLTEO.centrado.s / 2
  return { initial: { rotateX: -90 }, animate: { rotateX: 0 }, exit: { rotateX: 90, transition: { duration: mitad, ease: [0.55, 0, 0.75, 0.45] } }, transition: { duration: mitad, ease: CURVA }, style: { transformOrigin: '50% 50%' } }
}

/** El evento que la placa 3D del pie despacha en el formulario cuando termina de voltear (lo nuevo ya se ve). */
export const VOLTEO_TERMINADO = 'develop:volteo-terminado'
