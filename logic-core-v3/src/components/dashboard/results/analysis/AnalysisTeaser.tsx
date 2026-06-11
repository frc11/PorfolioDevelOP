import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

/**
 * P0.2 — Teaser de una línea para planes sin análisis mensual (Starter /
 * sin plan). Mismo lenguaje visual que el teaser de priorización de leads
 * (P0.3): una línea, sin candado dramático, link a planes. Presentación
 * pura: la decisión de mostrarlo vive en la page (gate único vía planAllows).
 */
export function AnalysisTeaser() {
  return (
    <Link
      href="/dashboard/plan"
      className="group flex items-center gap-2.5 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-3.5 py-2.5 text-sm text-zinc-300 transition-colors hover:border-violet-400/40 hover:bg-violet-500/10"
    >
      <Sparkles className="h-4 w-4 shrink-0 text-violet-300" strokeWidth={1.5} aria-hidden />
      <span className="flex-1 leading-snug">
        Con el plan Pro, develOP analiza las conversaciones de tu asistente y te cuenta acá qué descubre cada mes.
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-violet-300">
        Ver planes
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
      </span>
    </Link>
  )
}
