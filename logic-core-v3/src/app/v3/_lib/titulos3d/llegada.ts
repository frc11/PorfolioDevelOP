'use client'

import { useSyncExternalStore } from 'react'

import { entornoDeLaEscena, type TitulosDePrueba } from '../escena/entorno'

/**
 * [ESCENA 9] T5 · LOS TÍTULOS EN 3D — una prueba (bandera `titulos=dom|webgl`; decide Valentino), en Portfolio y en Por
 * qué develOP. Las dos variantes llegan con el MISMO progreso que ya movía la pieza (P2 en Portfolio, P5 en la frase),
 * así que llegan cuando llegaban y a la velocidad del scroll; con la prueba, la pieza se queda quieta y llegan las
 * letras: cada una viene de atrás y acostada sobre su base (como una tapa que se levanta), escalonadas de izquierda a
 * derecha. Con movimiento reducido aparecen sin moverse (sólo la opacidad).
 *
 *   `dom`    el título de verdad partido en letras, con perspectiva de CSS (`_componentes/titulos3d/LetrasQueLlegan`).
 *   `webgl`  el título dibujado en la escena, con la luz, la niebla y la profundidad de la sala
 *            (`escena/titulos/TitulosEnLaEscena`); el del DOM queda en su lugar, transparente.
 *
 * La bandera se lee DESPUÉS de hidratar: el servidor no la conoce (sale de la URL o del banco), así que el primer render
 * es el del producto y React vuelve a pintar con la prueba, sin un desajuste de hidratación.
 */
export const LLEGADA_3D = {
  /** Cuánto viene girada cada letra (grados, sobre su base), de cuán atrás (px) y de cuán abajo (em). */
  giro: 84,
  profundidad: 220,
  subida: 0.3,
  /** Qué parte del progreso ocupa cada letra (el resto es el escalonado entre la primera y la última). */
  dura: 0.5,
  /** La perspectiva del renglón (px). */
  perspectiva: 900,
} as const

/** Cuánto llegó la letra de lugar `orden` (0 la primera, 1 la última) con el progreso `p`: arranca después; sale suave. */
export function llegadaDeLaLetra(p: number, orden: number): number {
  const u = Math.min(1, Math.max(0, (p - orden * (1 - LLEGADA_3D.dura)) / LLEGADA_3D.dura))
  return 1 - (1 - u) ** 3
}

/** El `transform` de una letra que llegó `e` (0 a 1). */
export function transformDeLaLetra(e: number): string {
  const falta = 1 - e
  return `translate3d(0, ${(falta * LLEGADA_3D.subida).toFixed(4)}em, ${(-falta * LLEGADA_3D.profundidad).toFixed(2)}px) rotateX(${(-falta * LLEGADA_3D.giro).toFixed(2)}deg)`
}

const sinCambios = (): (() => void) => () => undefined

/** La prueba de los títulos de esta carga: `no` en el servidor y en el primer render; la pedida, después. */
export function usePruebaDeTitulos(): TitulosDePrueba | 'no' {
  return useSyncExternalStore(sinCambios, () => entornoDeLaEscena().pruebas.titulos, () => 'no')
}
