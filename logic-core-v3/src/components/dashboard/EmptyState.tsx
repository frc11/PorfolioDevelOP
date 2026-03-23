'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
  iconColor?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  className = '',
  iconColor = 'text-cyan-500' 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="relative mb-4 flex items-center justify-center">
        {/* Glow effect */}
        <div className={`absolute h-16 w-16 rounded-full opacity-20 blur-xl ${iconColor.replace('text-', 'bg-')}`} />
        <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] shadow-inner ${iconColor}`}>
          <Icon size={28} />
        </div>
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="max-w-[280px] text-[13px] leading-relaxed text-zinc-400">
        {description}
      </p>
    </motion.div>
  )
}
