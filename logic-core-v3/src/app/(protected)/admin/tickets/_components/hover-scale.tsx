'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

type HoverScaleProps = {
  children: ReactNode
  className?: string
}

/**
 * Wrapper de hover LOCAL que replica el patron de ActivityLog (no importa ni edita
 * ActivityLog ni primitivas shared): scale ~1.015 via whileHover de Framer (no CSS, para
 * que no lo pise un transform inline) + ring por CSS, <300ms, gated por reduced-motion.
 * El caller pasa sus clases de layout/tono por className; el ring se mergea con twMerge.
 */
export function HoverScale({ children, className }: HoverScaleProps) {
  const reduce = Boolean(useReducedMotion())

  return (
    <motion.div
      whileHover={
        reduce ? undefined : { scale: 1.015, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }
      }
      className={cn('hover:ring-1 hover:ring-white/15', className)}
    >
      {children}
    </motion.div>
  )
}
