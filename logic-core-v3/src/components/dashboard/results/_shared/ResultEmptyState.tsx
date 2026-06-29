import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Empty state canon del admin (punteado + muted) para todos los empties de
 * Resultados (D1). Reemplaza los heroes bespoke (`bg-white/[0.025]` + glow +
 * `font-black uppercase`) por el lenguaje del admin: borde dashed, superficie
 * muy tenue, título `font-medium text-zinc-300`, hint `text-zinc-500`.
 *
 * El CTA se pasa como `children` (un `<Link>`, `<a>` o `<form action={…}>`): la
 * ACCIÓN queda intacta (las del upsell/activación son FROZEN); sólo cambia el
 * contenedor. Para los botones, usar `resultEmptyCtaCls` / `resultEmptyCtaSecondaryCls`.
 */
interface ResultEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  /** CTA(s) — el caller pasa su Link/form/a sin tocar la acción. */
  children?: ReactNode
  className?: string
}

export function ResultEmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: ResultEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5 rounded-[22px] border border-dashed border-white/10 bg-white/[0.01] px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-zinc-500">
          <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-base font-medium tracking-tight text-zinc-300">{title}</p>
        {description && (
          <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500">{description}</p>
        )}
      </div>

      {children && (
        <div className="mt-1 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {children}
        </div>
      )}
    </div>
  )
}

/** CTA primario canon (acento cyan sutil, sin uppercase/font-black). */
export const resultEmptyCtaCls =
  'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/15 motion-reduce:transition-none'

/** CTA secundario canon (neutro). */
export const resultEmptyCtaSecondaryCls =
  'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06] motion-reduce:transition-none'
