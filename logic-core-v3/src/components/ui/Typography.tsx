import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EyebrowProps {
  children: ReactNode
  className?: string
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p className={cn('text-[10px] uppercase tracking-[0.24em] text-zinc-500', className)}>
      {children}
    </p>
  )
}

interface HeadingProps {
  level?: 1 | 2 | 3 | 4
  children: ReactNode
  className?: string
}

export function Heading({ level = 1, children, className }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
  const sizeClasses = {
    1: 'text-3xl font-semibold tracking-tight text-zinc-100',
    2: 'text-2xl font-semibold text-zinc-100',
    3: 'text-lg font-semibold text-zinc-100',
    4: 'text-base font-medium text-zinc-200',
  }

  return <Tag className={cn(sizeClasses[level], className)}>{children}</Tag>
}

interface MutedProps {
  children: ReactNode
  className?: string
}

export function Muted({ children, className }: MutedProps) {
  return <p className={cn('text-sm text-zinc-400', className)}>{children}</p>
}
