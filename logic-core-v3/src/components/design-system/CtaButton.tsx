'use client'

import { ArrowRight } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

type ButtonOwnProps = ComponentProps<typeof Button>

interface CtaButtonProps extends Omit<ButtonOwnProps, 'variant' | 'size' | 'icon' | 'children'> {
  children: ReactNode
  /** Primario = inversión monocroma con relieve. Secundario = plano. */
  tone?: 'primary' | 'secondary'
  /** Flecha final. Es el único icono que admite el sistema. */
  withArrow?: boolean
}

/**
 * CTA del sitio público.
 *
 * Construido SOBRE `ui/Button`, no al lado: reusa su gateo de `buttonPress`
 * (`whileTap: scale .97`, spring 600/25) contra `useReducedMotion()`, su manejo
 * de `disabled` y su estado `loading`. Las variantes `ds-primary` / `ds-secondary`
 * y el tamaño `ds` se agregaron a `Button` de forma aditiva.
 *
 * Por qué extender y no envolver: se midió `twMerge` contra los tokens del
 * sistema y NO colapsa `rounded-2xl` + `rounded-ds-control` ni
 * `text-sm` + `text-ds-control` — pasar el radio y el tamaño por `className`
 * habría dejado dos clases en pugna, resueltas por orden de fuente. Los colores
 * (`bg-*`, `text-*`, `border-*`) sí colapsan bien; el radio y el tamaño no.
 *
 * Sin scale en hover y sin letterSpacing animado: el CTA actual del sitio anima
 * letterSpacing, que provoca reflow del texto en cada hover.
 *
 * NO navega. Es un `<button>`: en el sitio público la navegación va por
 * `triggerTransition()` del `TransitionContext`, y cablearla es trabajo de B2 —
 * acá el componente todavía no se usa en ninguna sección real.
 */
export function CtaButton({
  children,
  tone = 'primary',
  withArrow = true,
  ...rest
}: CtaButtonProps) {
  return (
    <Button variant={tone === 'primary' ? 'ds-primary' : 'ds-secondary'} size="ds" {...rest}>
      <span>{children}</span>
      {withArrow ? (
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.5}
          className="size-[1.05em] shrink-0"
        />
      ) : null}
    </Button>
  )
}
