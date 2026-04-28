'use client'

import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Badge } from './Badge'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_STYLES = {
  sm: { padding: 'py-6', titleSize: 'text-sm' },
  md: { padding: 'py-10', titleSize: 'text-base' },
  lg: { padding: 'py-14', titleSize: 'text-lg' },
}

export function ErrorState({
  title = 'Algo salio mal',
  description = 'No pudimos cargar esta seccion. Proba de nuevo o contacta a soporte si el problema persiste.',
  onRetry,
  retryLabel = 'Reintentar',
  className,
  size = 'md',
}: ErrorStateProps) {
  const sizes = SIZE_STYLES[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col items-center justify-center text-center', sizes.padding, className)}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400">
        <AlertCircle size={20} strokeWidth={1.75} />
      </div>

      <Badge tone="rose" variant="soft" size="xs">
        Error
      </Badge>

      <h3 className={cn('mt-3 font-semibold text-zinc-200', sizes.titleSize)}>{title}</h3>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-500">{description}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05]"
        >
          <RefreshCw size={14} strokeWidth={1.75} />
          {retryLabel}
        </button>
      )}
    </motion.div>
  )
}
