import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motivoOrden, type HomeLead } from '@/lib/leados/flow'

/**
 * B-beta — Carril de re-entrada "Continuá donde dejaste". El setter que vuelve no
 * tiene que reconstruir en qué andaba: este carril PRESENTA el punto de re-entrada
 * que el motor YA calculó — el tope del carril "trabajar"
 * (`particionarCartera(...).grupos.trabajar[0]`, ordenado por `ordenUrgencia`:
 * respondió → caliente → resto). NO calcula prioridad nueva: el padre le pasa ese
 * lead ya elegido (cero motor nuevo). Por construcción el tope de "trabajar" es
 * siempre `accionable`.
 *
 * Aislamiento (#1): el lead sale de `particionarCartera` sobre `listOwnedLeads`,
 * filtrado por `assignedToId` — sólo la cartera de este setter.
 *
 * B9: es un CTA (navega, accionable) → cyan justificado. El rótulo del motivo de
 * orden va neutro (zinc): es informativo, no compite con la acción.
 *
 * Lleva al MISMO destino que "Recorrer" / el atajo `r`: el detalle con
 * `?cola=trabajar`, así retomar encadena el recorrido en vez de cortarlo.
 */
export function ContinuarCta({ lead }: { lead: HomeLead }) {
  const motivo = motivoOrden(lead)

  return (
    <Link
      href={`/setter/leads/${lead.id}?cola=trabajar`}
      aria-label={`Continuá donde dejaste: ${lead.businessName} — ${lead.proximaAccion}`}
      className={cn(
        'group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 sm:p-5',
        'border border-cyan-400/25 bg-cyan-500/[0.06]',
        'shadow-[0_8px_30px_rgba(0,0,0,0.25)] outline-none transition-colors',
        'hover:border-cyan-400/40 hover:bg-cyan-500/[0.09]',
        'focus-visible:ring-2 focus-visible:ring-cyan-400/40',
      )}
    >
      {/* Acento cyan: retomás trabajo real, es accionable. */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-cyan-400/80" />

      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
      >
        <PlayCircle size={20} strokeWidth={1.5} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-300/80">
          Continuá donde dejaste
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-zinc-100">
          {lead.businessName}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="min-w-0 truncate text-xs font-medium text-cyan-100/90">
            {lead.proximaAccion}
          </span>
          {motivo && (
            <span className="hidden shrink-0 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 sm:inline-flex">
              {motivo}
            </span>
          )}
        </div>
      </div>

      <ArrowRight
        size={18}
        strokeWidth={1.5}
        aria-hidden
        className="shrink-0 text-cyan-300 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}
