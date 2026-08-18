'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import {
  MOTION_DURATION,
  MOTION_EASE,
  REDUCED_MOTION,
  REVEAL_DISTANCE_PX,
  REVEAL_MAX_STAGGER_INDEX,
  REVEAL_STAGGER_S,
  REVEAL_VIEWPORT,
  type MotionScale,
} from './tokens'

/**
 * Reveal solo cubre las tres escalas que tiene sentido que APAREZCAN al
 * entrar al viewport. `micro` no está: es la escala de retroalimentación de
 * estado (hover, botón) sobre algo que ya está en pantalla, no de una
 * llegada — no le corresponde a esta primitiva.
 */
export type RevealScale = Exclude<MotionScale, 'micro'>

export interface RevealProps {
  /** Contenido a revelar. */
  children: ReactNode
  /**
   * Posición del elemento dentro de un grupo de hermanos, para el desfase
   * (`REVEAL_STAGGER_S` × este índice, con tope en `REVEAL_MAX_STAGGER_INDEX`
   * — ver `tokens.ts`). Sin índice, sin desfase: cada `<Reveal>` es
   * independiente por default, el desfase entre hermanos es opt-in pasando
   * el índice del propio `.map()` del consumidor.
   */
  index?: number
  /**
   * Escala de duración del token del sistema. Default `'elemento'` (0.6s —
   * la de `CLAUDE.md`). No es un override libre de duración: es una
   * selección entre las 3 escalas ya aprobadas del sistema. La curva
   * (`MOTION_EASE.arrive`) y la distancia (`REVEAL_DISTANCE_PX`) NO son
   * configurables por props — es la garantía de "una sola física en el
   * home" que pide el sprint. Si un consumidor necesita otra física, no es
   * un prop nuevo: es una conversación sobre el sistema.
   */
  scale?: RevealScale
  className?: string
}

/**
 * Reveal de entrada del sistema (S2-motion, Bloque 3). Un elemento aparece
 * al entrar al viewport, con la física única del sistema: distancia
 * `REVEAL_DISTANCE_PX`, curva `MOTION_EASE.arrive`, umbral
 * `REVEAL_VIEWPORT`, una sola vez (`once: true`).
 *
 * Cero `setState` por frame: usa `whileInView` de `motion/react`, que
 * dispara por `IntersectionObserver`, no por scroll. `prefers-reduced-motion`
 * se resuelve ACÁ, no en el consumidor — con la distancia colapsada a
 * `REDUCED_MOTION.distancePx` (0) no queda nada que desplazar, así que solo
 * la opacidad conserva una duración explícita (`REDUCED_MOTION.opacityDurationS`,
 * más corta que cualquier escala normal pero no un corte instantáneo — la
 * regla del documento permite que el cambio de opacidad se mantenga suave).
 * El desfase entre hermanos se conserva bajo movimiento reducido: sin
 * distancia que recorrer, la secuencia todavía comunica orden por el orden
 * en que cada uno termina de aparecer, no es decorativa.
 */
export function Reveal({ children, index = 0, scale = 'elemento', className }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()

  const distance = prefersReducedMotion ? REDUCED_MOTION.distancePx : REVEAL_DISTANCE_PX
  const duration = prefersReducedMotion ? REDUCED_MOTION.opacityDurationS : MOTION_DURATION[scale]
  const delay = Math.min(index, REVEAL_MAX_STAGGER_INDEX) * REVEAL_STAGGER_S

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration, ease: MOTION_EASE.arrive, delay }}
    >
      {children}
    </motion.div>
  )
}
