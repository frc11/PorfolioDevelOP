'use client'

import { motion, useReducedMotion, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { REDUCED_MOTION } from './tokens'
import { useScrollProgress } from './useScrollProgress'

export interface ParallaxProps {
  children: ReactNode
  /**
   * Recorrido total, en píxeles, mientras el elemento atraviesa el
   * viewport (mitad hacia arriba, mitad hacia abajo respecto del punto
   * neutro). Sin default a propósito: "que la intensidad sea un parámetro,
   * no un valor fijo" es un requisito del documento — cada consumidor
   * declara la suya.
   */
  intensityPx: number
  /** Se aplica al contenedor externo (el que se mide, nunca el que se mueve — ver docblock del componente). */
  className?: string
}

/**
 * Parallax sutil (S2-motion, Bloque 3, primitiva 3): desplazamiento a
 * distinta velocidad ligado al progreso de scroll, no al tiempo.
 *
 * DOS elementos, no uno. El de afuera es el que mide `useScrollProgress`
 * (nunca recibe transform); el de adentro es el que se desplaza. Medir y
 * mover el MISMO elemento retroalimenta el cálculo: `getBoundingClientRect()`
 * devuelve coordenadas incorrectas con un transform activo — lección ya
 * documentada en `CLAUDE.md` ("getBoundingClientRect() con transforms
 * activos", abril 2026) — así que el progreso se distorsionaría a medida
 * que el propio parallax se mueve. El wrapper externo aísla la medición del
 * movimiento; introduce un
 * nodo extra en el DOM, así que si el layout del consumidor depende de un
 * único hijo directo (grid/flex), el ajuste va en `className` (que cae en
 * el externo), no esperando transparencia total de nodo.
 *
 * Cero `setState` por frame: `useTransform` deriva un `MotionValue` sin
 * re-render; se escribe al DOM vía `style={{ y }}`, que `motion.div`
 * resuelve directamente. `prefers-reduced-motion` se resuelve ACÁ:
 * la intensidad efectiva colapsa a `REDUCED_MOTION.distancePx` (0) — mismo
 * principio de "distancia a cero" que `Reveal`, aplicado a un valor
 * continuo en vez de a un tween.
 */
export function Parallax({ children, intensityPx, className }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress(containerRef)
  const prefersReducedMotion = useReducedMotion()

  const effectiveIntensityPx = prefersReducedMotion ? REDUCED_MOTION.distancePx : intensityPx
  const y = useTransform(progress, [0, 1], [-effectiveIntensityPx / 2, effectiveIntensityPx / 2])

  return (
    <div ref={containerRef} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
