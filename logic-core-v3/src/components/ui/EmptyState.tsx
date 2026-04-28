'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_STYLES = {
  sm: { padding: 'py-8', iconSize: 32, titleSize: 'text-sm' },
  md: { padding: 'py-12', iconSize: 40, titleSize: 'text-base' },
  lg: { padding: 'py-16', iconSize: 48, titleSize: 'text-lg' },
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizes = SIZE_STYLES[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col items-center justify-center text-center', sizes.padding, className)}
    >
      <div className="relative mb-4">
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-500/[0.08]"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
        />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-500">
          <Icon size={sizes.iconSize / 2} strokeWidth={1.5} />
        </div>
      </div>

      <h3 className={cn('font-semibold text-zinc-300', sizes.titleSize)}>{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-600">{description}</p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
