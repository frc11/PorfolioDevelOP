'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { hoverLift } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'

interface QuickActionMotionProps {
  children: ReactNode
}

export function QuickActionMotion({ children }: QuickActionMotionProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div className="h-full" {...(reduced ? {} : hoverLift)}>
      {children}
    </motion.div>
  )
}
