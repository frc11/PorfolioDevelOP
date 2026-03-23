'use client'

import { motion } from 'framer-motion'
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 80, damping: 15, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
