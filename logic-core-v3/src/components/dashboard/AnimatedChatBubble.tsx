'use client'

import { motion } from 'framer-motion'

export function AnimatedChatBubble({ 
  children, 
  isAgency, 
  className 
}: { 
  children: React.ReactNode, 
  isAgency: boolean, 
  className?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15, transformOrigin: isAgency ? 'top left' : 'top right' }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
