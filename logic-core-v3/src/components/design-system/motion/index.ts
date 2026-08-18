/**
 * Sistema de motion del sitio público — rediseño, S2-motion.
 *
 * Vocabulario (Bloque 2) en `tokens.ts`. Primitivas (Bloque 3): `Reveal`
 * (entrada por viewport), `useScrollProgress` (progreso 0→1 ligado al
 * scroll), `Parallax` (desplazamiento por progreso, intensidad como
 * parámetro).
 */

export {
  type MotionScale,
  type MotionEaseName,
  MOTION_DURATION,
  MOTION_EASE,
  REVEAL_DISTANCE_PX,
  REVEAL_STAGGER_S,
  REVEAL_MAX_STAGGER_INDEX,
  REVEAL_VIEWPORT,
  REDUCED_MOTION,
} from './tokens'

export { Reveal, type RevealProps, type RevealScale } from './Reveal'
export { useScrollProgress, type UseScrollProgressOptions } from './useScrollProgress'
export { Parallax, type ParallaxProps } from './Parallax'
