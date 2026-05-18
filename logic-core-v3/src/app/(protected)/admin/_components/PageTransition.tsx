'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp, fadeUpTransition } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={fadeUpTransition}
      className="min-h-full"
    >
      {children}
    </motion.div>
  )
}
