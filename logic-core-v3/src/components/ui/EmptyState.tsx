'use client'

import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  cta?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'subtle'
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
  cta,
  className,
  size = 'md',
  variant = 'default',
}: EmptyStateProps) {
  const sizes = SIZE_STYLES[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'default'
          ? 'rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6'
          : 'bg-transparent',
        sizes.padding,
        className,
      )}
    >
      <div className="relative mb-4">
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-500/[0.08]"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
        />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-500">
          <Icon size={sizes.iconSize / 2} strokeWidth={1.5} />
        </div>
      </div>

      <h3 className={cn('font-semibold text-zinc-300', sizes.titleSize)}>{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-600">{description}</p>
      )}

      {cta ? (
        <div className="mt-5">
          {cta.href ? (
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400/15 px-5 py-2.5 text-sm text-cyan-300 transition-colors hover:bg-cyan-400/25"
            >
              {cta.label}
            </Link>
          ) : (
            <Button variant="secondary" onClick={cta.onClick}>
              {cta.label}
            </Button>
          )}
        </div>
      ) : null}

      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
