'use client'

import { Children, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'

/**
 * Wrapper de reveal escalonado, puramente presentacional.
 *
 * Empaqueta el patrón canónico de stagger (`staggerContainer`/`staggerItem`
 * de `motion-variants.ts`, el mismo que usan las listas del admin) en un solo
 * componente reusable que además respeta `prefers-reduced-motion`: si el
 * usuario pidió menos movimiento, el contenido aparece directo, sin animar.
 *
 * Pensado para envolver una grilla/columna de cards que vienen del servidor:
 * cada hijo directo se envuelve en un item con la variante de entrada. No
 * toca la lógica ni las props de los hijos — solo los envuelve.
 */
export function StaggerReveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate="visible"
    >
      {Children.map(children, (child) =>
        isValidElement(child) ? (
          <motion.div variants={staggerItem}>{child}</motion.div>
        ) : (
          child
        ),
      )}
    </motion.div>
  )
}
