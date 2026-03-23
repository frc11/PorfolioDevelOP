'use client'

import { motion, AnimatePresence } from 'framer-motion'

export function AnimatedTaskList({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.ul layout className={className}>
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </motion.ul>
  )
}

export function AnimatedTaskItem({ children, className, id }: { children: React.ReactNode, className?: string, id: string }) {
  return (
    <motion.li
      layoutId={`task-${id}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={className}
    >
      {children}
    </motion.li>
  )
}
