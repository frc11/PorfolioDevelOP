import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DisplayHeadingProps {
  children: ReactNode
  size?: 'xl' | 'lg'
  as?: 'h1' | 'h2'
  id?: string
  className?: string
}

const sizeClass: Record<'xl' | 'lg', string> = {
  xl: 'text-ds-display-xl',
  lg: 'text-ds-display-lg',
}

/**
 * Titular de display. Sin familia nueva: es Geist sans, y se distingue por
 * escala y tracking negativo — ambos vienen en los tokens
 * `--text-ds-display-*` con sus modificadores de line-height y letter-spacing.
 *
 * `text-balance` reparte las líneas para que no quede una viuda de una palabra.
 */
export function DisplayHeading({
  children,
  size = 'lg',
  as = 'h2',
  id,
  className,
}: DisplayHeadingProps) {
  const Tag = as

  return (
    <Tag
      id={id}
      className={cn('font-sans font-medium text-balance text-ds-fg', sizeClass[size], className)}
    >
      {children}
    </Tag>
  )
}
