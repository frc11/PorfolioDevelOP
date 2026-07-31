'use client'

import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { buttonPress } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

// `ds-*` y el tamaño `ds` son del sistema de diseño del sitio público
// (rediseño B1). Son claves nuevas: los consumidores admin/dashboard no las
// usan y sus variantes/tamaños quedaron sin tocar. Se consumen a través de
// `CtaButton`, no directamente.
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'ds-primary'
  | 'ds-secondary'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'ds'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'ref'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-cyan-400 text-zinc-950 hover:bg-cyan-300',
  secondary: 'border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]',
  ghost: 'text-zinc-300 hover:bg-white/[0.05]',
  danger: 'border border-red-400/30 bg-red-400/15 text-red-200 hover:bg-red-400/25',

  // ── Sistema de diseño B1 (sitio público) ───────────────────────────
  // Inversión monocroma + relieve táctil de 2 capas. El canto superior
  // más claro y la sombra corta son lo único que declara "esto se aprieta".
  // `active` hunde 2px y apaga la sombra. Sin scale en hover.
  'ds-primary':
    'border-t border-t-ds-control-edge bg-ds-fg text-ds-canvas shadow-ds-control ' +
    'transition-[translate,box-shadow,opacity] duration-150 ease-out ' +
    'hover:opacity-90 active:translate-y-[2px] active:shadow-none ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-fg ' +
    'disabled:shadow-none disabled:hover:opacity-50 motion-reduce:transition-none',

  // Secundario: plano. No se le da relieve porque compite con el primario.
  'ds-secondary':
    'border border-ds-rule bg-transparent text-ds-fg ' +
    'transition-[border-color,translate] duration-150 ease-out ' +
    'hover:border-ds-fg active:translate-y-[1px] ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-fg ' +
    'disabled:hover:border-ds-rule motion-reduce:transition-none',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'rounded-xl px-3 py-1.5 text-xs',
  md: 'rounded-2xl px-5 py-2.5 text-sm',
  lg: 'rounded-2xl px-6 py-3 text-base',
  // Radio de control (9px), no el radio 0 de las superficies.
  ds: 'rounded-ds-control px-7 py-4 text-ds-control',
}

/**
 * La receta de clases del botón, sin el `<button>`.
 *
 * Existe para que un CTA con destino externo pueda ser un `<a>` de verdad
 * (`CtaButton` con `href`) y verse EXACTAMENTE igual que el botón, sin copiar
 * el string de clases a otro archivo — copiarlo es lo que las deja divergir.
 *
 * Los mapas salieron del cuerpo del componente al scope de módulo de paso: se
 * recreaban en cada render sin necesidad. Las clases no cambiaron.
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}): string {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)
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

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        {...(reduced || disabled || loading ? {} : buttonPress)}
        className={buttonClasses({ variant, size, className })}
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
