'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ReactNode } from 'react'

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  // Respeta prefers-reduced-motion: si el usuario pidió menos movimiento,
  // el contenido aparece directo (sin desplazamiento ni blur), sin animar.
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 15, filter: 'blur(8px)' }}
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, filter: 'blur(0px)' }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 80, damping: 15, delay }
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}
