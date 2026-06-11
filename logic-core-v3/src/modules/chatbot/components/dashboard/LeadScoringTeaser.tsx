import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

/**
 * P0.3 — Teaser que ocupa el lugar de los chips de clasificación cuando el plan
 * del cliente no incluye la priorización de contactos (Starter / sin plan).
 *
 * Es presentación pura: NO consulta el plan. La decisión de mostrarlo vive en
 * el server component que lo renderiza (gate único vía `planAllows`). Tono
 * develOP, sentence case, sin jerga ("clasificación"/"scoring"): habla de
 * negocio. Sin modal ni blur — una sola línea con link a planes.
 */
export function LeadScoringTeaser({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/dashboard/plan"
      className={`group flex items-center gap-2.5 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-3.5 py-2.5 text-sm text-zinc-300 transition-colors hover:border-violet-400/40 hover:bg-violet-500/10 ${className}`}
    >
      <Sparkles className="h-4 w-4 shrink-0 text-violet-300" strokeWidth={1.5} aria-hidden />
      <span className="flex-1 leading-snug">
        Con el plan Pro, tu asistente marca a quién llamar primero.
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-violet-300">
        Ver planes
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
      </span>
    </Link>
  )
}
