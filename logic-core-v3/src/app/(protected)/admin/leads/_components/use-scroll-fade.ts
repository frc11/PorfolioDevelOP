'use client'

import { useMemo, useState, type RefObject } from 'react'
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'

export type GroupFade = {
  opacity: MotionValue<number>
  y: MotionValue<number>
}

export type ScrollFade = {
  groups: [GroupFade, GroupFade, GroupFade]
  /** Índice del grupo activo (el que recibe pointer-events). */
  activeIndex: number
}

/**
 * Cross-fade de 3 grupos dirigido por el scroll del módulo (Tanda 2 · Bloque 1).
 *
 * El progreso 0→1 del contenedor mapea G1→G2→G3 con un solape `fadeBand` y un leve
 * `revealShift` (translateY) en el grupo que entra/sale. Está escrito para EXACTAMENTE
 * 3 grupos: la cantidad de hooks es fija (rules-of-hooks).
 */
export function useScrollFade(
  containerRef: RefObject<HTMLDivElement | null>,
  fadeBand: number,
  revealShift: number,
): ScrollFade {
  const { scrollYProgress } = useScroll({ container: containerRef })

  const t = useMemo(() => {
    // Tres mesetas iguales separadas por dos bandas de cross-fade de ancho `band`.
    // Clamp a [0, 1/3): garantiza meseta > 0 y rangos de useTransform estrictamente
    // crecientes aunque alguien suba el TUNABLE FADE_BAND fuera de rango.
    const band = Math.min(Math.max(fadeBand, 0), 1 / 3 - 0.001)
    const plateau = (1 - 2 * band) / 3
    return {
      g1PlateauEnd: plateau,
      band1End: plateau + band,
      g2PlateauEnd: 2 * plateau + band,
      band2End: 2 * plateau + 2 * band,
      switch1: plateau + band / 2,
      switch2: 2 * plateau + 1.5 * band,
    }
  }, [fadeBand])

  const g1Opacity = useTransform(scrollYProgress, [0, t.g1PlateauEnd, t.band1End], [1, 1, 0])
  const g1Y = useTransform(scrollYProgress, [0, t.g1PlateauEnd, t.band1End], [0, 0, -revealShift])

  const g2Opacity = useTransform(
    scrollYProgress,
    [t.g1PlateauEnd, t.band1End, t.g2PlateauEnd, t.band2End],
    [0, 1, 1, 0],
  )
  const g2Y = useTransform(
    scrollYProgress,
    [t.g1PlateauEnd, t.band1End, t.g2PlateauEnd, t.band2End],
    [revealShift, 0, 0, -revealShift],
  )

  const g3Opacity = useTransform(scrollYProgress, [t.g2PlateauEnd, t.band2End, 1], [0, 1, 1])
  const g3Y = useTransform(scrollYProgress, [t.g2PlateauEnd, t.band2End, 1], [revealShift, 0, 0])

  const [activeIndex, setActiveIndex] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < t.switch1 ? 0 : value < t.switch2 ? 1 : 2
    setActiveIndex((current) => (current === next ? current : next))
  })

  return {
    groups: [
      { opacity: g1Opacity, y: g1Y },
      { opacity: g2Opacity, y: g2Y },
      { opacity: g3Opacity, y: g3Y },
    ],
    activeIndex,
  }
}
