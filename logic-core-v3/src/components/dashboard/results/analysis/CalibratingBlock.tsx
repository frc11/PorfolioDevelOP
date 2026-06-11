import { Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * P0.2 — Empty state honesto por sección (patrón "calibrando" del home):
 * cuenta el potencial de la sección sin inventar datos ni dejar el hueco crudo.
 * Server-safe: el pulso es CSS (animate-pulse), sin motion.
 */
export function CalibratingBlock({
  icon: Icon = Sparkles,
  title,
  description,
}: {
  icon?: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center">
      <div className="relative">
        <div className="absolute inset-0 scale-150 animate-pulse rounded-2xl bg-cyan-500/10 blur-xl" aria-hidden />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
          <Icon size={22} strokeWidth={1.5} aria-hidden />
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-zinc-200">{title}</p>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-zinc-500">{description}</p>
      </div>
    </div>
  )
}
