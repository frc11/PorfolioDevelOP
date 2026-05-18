'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { standardEase } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'

interface TabContentTransitionProps {
  activeTab: string
  children: ReactNode
}

export function TabContentTransition({
  activeTab,
  children,
}: TabContentTransitionProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div>{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease: standardEase }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
