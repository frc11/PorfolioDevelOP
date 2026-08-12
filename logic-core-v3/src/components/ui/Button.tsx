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

export type ButtonSize = 'sm' | 'md' | 'lg' | 'ds' | 'ds-compact'

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
  // Inversión monocroma + relieve táctil de 2 capas. El relieve son DOS
  // señales, no tres: sombra dura de 2px que da el grosor físico y difusa
  // corta que lo apoya. `active` hunde 2px y apaga la sombra.
  //
  // Ya no lleva canto superior iluminado. Medido: `rgba(255,255,255,.85)`
  // sobre el fondo tinta `#EDE9E1` da 1.18:1 — no es una señal débil, es una
  // línea que no se ve; existía solo en la spec.
  //
  // La sombra va por `var()` y no por un utility de tema: `--shadow-ds-control`
  // se invierte con la sección (ver globals.css), y así el mismo botón proyecta
  // la sombra de su propio lienzo en vez de arrastrar la del oscuro sobre crema.
  'ds-primary':
    'bg-ds-fg text-ds-canvas shadow-[var(--shadow-ds-control)] ' +
    'transition-[translate,box-shadow,opacity] duration-150 ease-out ' +
    'hover:opacity-90 active:translate-y-[2px] active:shadow-none ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-fg ' +
    'disabled:shadow-none disabled:hover:opacity-50 motion-reduce:transition-none',

  // Secundario: plano. No se le da relieve porque compite con el primario —
  // pero plano no es invisible. Lleva su propio token de borde
  // (`--color-ds-control-stroke`, 3:1 en los dos temas) y no el de regla, que
  // daba 1.23:1: el botón no tenía frontera y aparecía recién en hover, o sea
  // nunca en touch.
  'ds-secondary':
    'border border-ds-control-stroke bg-transparent text-ds-fg ' +
    'transition-[border-color,translate] duration-150 ease-out ' +
    'hover:border-ds-fg active:translate-y-[1px] ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-fg ' +
    'disabled:hover:border-ds-control-stroke motion-reduce:transition-none',
}

/**
 * Variantes del sistema de diseño público. Se listan porque el press físico de
 * estas variantes es CSS (`active:translate-y`), y superponerle el
 * `whileTap: scale` de Framer da dos presses a la vez — uno hunde y el otro
 * comprime, y conviven porque animan propiedades distintas. Un objeto físico se
 * hunde; no se achica.
 */
const DS_VARIANTS: ReadonlySet<ButtonVariant> = new Set(['ds-primary', 'ds-secondary'])

export function hasFramerPress(variant: ButtonVariant): boolean {
  return !DS_VARIANTS.has(variant)
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'rounded-xl px-3 py-1.5 text-xs',
  md: 'rounded-2xl px-5 py-2.5 text-sm',
  lg: 'rounded-2xl px-6 py-3 text-base',
  // Radio de control (9px), no el radio 0 de las superficies.
  ds: 'rounded-ds-control px-7 py-4 text-ds-control',
  // Mismo control, densidad de chrome. Existe porque el CTA persistente de la
  // barra de navegación tiene que caber en 64px de alto junto al logo y las
  // anclas: con `ds` (py-4 + text-ds-control) la barra se iba a ~72px y el CTA
  // pesaba más que el titular de la página. Mismo radio, mismo relieve, misma
  // receta de variante — solo cambia la caja.
  'ds-compact': 'rounded-ds-control px-4 py-2.5 text-sm',
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
        {...(reduced || disabled || loading || !hasFramerPress(variant) ? {} : buttonPress)}
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
