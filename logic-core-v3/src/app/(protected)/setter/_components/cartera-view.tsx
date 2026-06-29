'use client'

import { useMemo, useState } from 'react'
import { Briefcase, ChevronRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  filtrarYOrdenarCartera,
  type EstadoFiltro,
  type HomeLead,
  type OrdenCartera,
} from '@/lib/leados/flow'
import { CarteraToolbar } from './cartera-toolbar'
import { LeadCard } from './home-sections'

/**
 * LeadOS 2.1a — La cartera completa, ahora SECUNDARIA al foco. Colapsada por
 * defecto: el "modo dirección" (un lead a la vez, arriba) es lo que el setter ve
 * primero; esto es la red de seguridad para buscar / filtrar / ordenar TODA la
 * cartera cuando hace falta. Sin tablero ni colas: una lista plana ordenada por
 * urgencia, con los fijados flotando arriba (`filtrarYOrdenarCartera`).
 *
 * 2.3 — pulido de la subordinación (presentación, sin tocar la lógica): el toggle
 * tiene estados de hover/foco diseñados y el cuerpo abierto cuelga de un riel
 * neutro a la izquierda (eco gris del acento cyan del foco) para leerse como la
 * red secundaria, no como protagonista.
 */
export function CarteraView({ leads }: { leads: HomeLead[] }) {
  const [abierto, setAbierto] = useState(false)
  const [query, setQuery] = useState('')
  const [estado, setEstado] = useState<EstadoFiltro>('todos')
  const [orden, setOrden] = useState<OrdenCartera>('urgencia')

  const isFiltering = query.trim() !== '' || estado !== 'todos' || orden !== 'urgencia'

  const lista = useMemo(
    () => filtrarYOrdenarCartera(leads, query, estado, orden === 'colas' ? 'urgencia' : orden),
    [leads, query, estado, orden],
  )

  const limpiar = () => {
    setQuery('')
    setEstado('todos')
    setOrden('urgencia')
  }

  return (
    <section aria-label="Tu cartera completa" className="space-y-3">
      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        aria-expanded={abierto}
        className="group flex w-full items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-xs font-medium text-zinc-400 outline-none transition-colors hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40"
      >
        <Briefcase size={14} strokeWidth={1.5} aria-hidden className="text-zinc-500 transition-colors group-hover:text-zinc-300" />
        Ver toda la cartera
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] tabular-nums text-zinc-400 transition-colors group-hover:border-white/15 group-hover:text-zinc-300">
          {leads.length}
        </span>
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          aria-hidden
          className={cn(
            'ml-auto text-zinc-600 transition-[transform,color] group-hover:text-zinc-400',
            abierto && 'rotate-90',
          )}
        />
      </button>

      {/* Cuerpo subordinado: el riel neutro a la izquierda lo "cuelga" del toggle
          (eco del acento del foco, pero gris) — señal de que es la red secundaria,
          no protagonista. */}
      {abierto && (
        <div className="space-y-4 border-l border-white/[0.08] pl-4">
          <CarteraToolbar
            query={query}
            estado={estado}
            orden={orden}
            isFiltering={isFiltering}
            resultados={lista.length}
            onQuery={setQuery}
            onEstado={setEstado}
            onOrden={setOrden}
            onLimpiar={limpiar}
          />

          {lista.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/[0.06] px-4 py-10 text-center">
              <SearchX size={20} strokeWidth={1.5} className="text-zinc-600" />
              <p className="text-sm text-zinc-400">Ningún lead coincide con eso.</p>
              <p className="text-xs text-zinc-600">Probá con otro texto o limpiá los filtros.</p>
            </div>
          ) : (
            <section aria-label="Tu cartera" className="grid items-start gap-3 sm:grid-cols-2">
              {lista.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </section>
          )}
        </div>
      )}
    </section>
  )
}
