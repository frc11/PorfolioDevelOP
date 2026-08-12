'use client'

import { ArrowRight } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { Button, buttonClasses } from '@/components/ui/Button'

type ButtonOwnProps = ComponentProps<typeof Button>

interface CtaButtonProps extends Omit<ButtonOwnProps, 'variant' | 'size' | 'icon' | 'children'> {
  children: ReactNode
  /** Primario = inversión monocroma con relieve. Secundario = plano. */
  tone?: 'primary' | 'secondary'
  /**
   * `default` es el CTA de sección (hero, cierre). `compact` es la densidad de
   * chrome — el CTA persistente de la barra de navegación. Misma variante y
   * mismo radio; solo cambia la caja.
   */
  density?: 'default' | 'compact'
  /** Flecha final. Es el único icono que admite el sistema. */
  withArrow?: boolean
  /**
   * Destino. Si viene, el CTA se renderiza como `<a>` en vez de `<button>`.
   *
   * Reservado a destinos EXTERNOS (wa.me, mailto, tel). La navegación interna
   * del sitio público va por `triggerTransition()` del `TransitionContext`, que
   * necesita un `onClick` sobre el `<button>` — no un href.
   *
   * Es un `<a>` de verdad y no un `<button onClick={location.href}>` porque un
   * destino tiene que poder abrirse en pestaña nueva, copiarse con click
   * derecho y anunciarse como enlace al lector de pantalla.
   */
  href?: string
  /** Solo con `href`. */
  target?: string
  /** Solo con `href`. Con `target="_blank"` va siempre `noopener`. */
  rel?: string
}

/**
 * CTA del sitio público.
 *
 * Construido SOBRE `ui/Button`, no al lado: reusa su manejo de `disabled` y su
 * estado `loading`. Las variantes `ds-primary` / `ds-secondary` y el tamaño `ds`
 * se agregaron a `Button` de forma aditiva.
 *
 * Lo que NO reusa es el `whileTap: scale .97` de Framer. Las variantes del
 * sistema traen su press propio en CSS (`active:translate-y`), y los dos
 * convivían sin pisarse porque animan propiedades distintas: el botón se hundía
 * Y se comprimía en el mismo gesto. Queda el hundimiento de 2px — un objeto
 * físico se hunde, no se achica. El gateo vive en `hasFramerPress()` de
 * `ui/Button`, del lado de la variante, para que valga igual para quien use
 * `Button` directo.
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
 * Con `href` deja de ser un `<button>` y pasa a ser un `<a>` con la MISMA receta
 * de clases (`buttonClasses`, exportada por `ui/Button`) — no una copia del
 * string. En esa rama las props exclusivas de `<button>` (`disabled`,
 * `loading`, `type`) no aplican y no se reenvían.
 */
export function CtaButton({
  children,
  tone = 'primary',
  density = 'default',
  withArrow = true,
  href,
  target,
  rel,
  className,
  'aria-label': ariaLabel,
  ...rest
}: CtaButtonProps) {
  const variant = tone === 'primary' ? 'ds-primary' : 'ds-secondary'
  const size = density === 'compact' ? 'ds-compact' : 'ds'

  const content = (
    <>
      <span>{children}</span>
      {withArrow ? (
        <ArrowRight aria-hidden="true" strokeWidth={1.5} className="size-[1.05em] shrink-0" />
      ) : null}
    </>
  )

  if (href !== undefined) {
    return (
      // `<a>` pelado y no `motion.a`: el press de estas variantes es CSS, así
      // que esta rama no necesita Framer para nada. `:active` aplica igual a un
      // enlace que a un botón, y `motion-reduce:transition-none` ya lo aterriza
      // instantáneo para quien pidió menos movimiento.
      <a
        href={href}
        target={target}
        // `noopener` siempre que se abra en pestaña nueva: sin él la página
        // destino recibe `window.opener` y puede reescribir la nuestra.
        rel={target === '_blank' ? (rel ?? 'noopener noreferrer') : rel}
        aria-label={ariaLabel}
        className={buttonClasses({ variant, size, className })}
      >
        {content}
      </a>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      aria-label={ariaLabel}
      {...rest}
    >
      {content}
    </Button>
  )
}
