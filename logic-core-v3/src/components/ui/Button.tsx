'use client'

import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { buttonPress } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      icon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reduced = useReducedMotion()
    const baseClasses =
      'inline-flex items-center justify-center gap-2 font-medium transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50'

    const variantClasses = {
      primary: 'bg-cyan-400 text-zinc-950 hover:bg-cyan-300',
      secondary: 'border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]',
      ghost: 'text-zinc-300 hover:bg-white/[0.05]',
      danger: 'border border-red-400/30 bg-red-400/15 text-red-200 hover:bg-red-400/25',
    }

    const sizeClasses = {
      sm: 'rounded-xl px-3 py-1.5 text-xs',
      md: 'rounded-2xl px-5 py-2.5 text-sm',
      lg: 'rounded-2xl px-6 py-3 text-base',
    }

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        {...(reduced || disabled || loading ? {} : buttonPress)}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
