'use client'

import { Search, X } from 'lucide-react'
import { Input, Select } from '@/components/ui'
import { VISTAS_CARTERA, type EstadoFiltro, type OrdenCartera } from '@/lib/leados/flow'

type CarteraToolbarProps = {
  query: string
  estado: EstadoFiltro
  orden: OrdenCartera
  isFiltering: boolean
  resultados: number
  onQuery: (value: string) => void
  onEstado: (value: EstadoFiltro) => void
  onOrden: (value: OrdenCartera) => void
  onLimpiar: () => void
}

/**
 * P22 — Las opciones del filtro SALEN de `VISTAS_CARTERA` (flow.ts), que es la
 * misma lista con la que la cartera rotula sus grupos. Antes esta lista era la
 * única fuente de los rótulos y estaba escrita acá a mano; agrupar necesitaba
 * los mismos nombres, y copiarlos habría dejado dos listas del mismo dominio
 * libres de divergir. `todos` se antepone acá porque es propio del filtro (no
 * es una vista: es la ausencia de filtro) y no tiene grupo que rotular.
 */
const ESTADO_OPCIONES: { value: EstadoFiltro; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  ...VISTAS_CARTERA.map((v) => ({ value: v.vista as EstadoFiltro, label: v.label })),
]

const ORDEN_OPCIONES: { value: OrdenCartera; label: string }[] = [
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'reciente', label: 'Más nuevos primero' },
  { value: 'antiguo', label: 'Más viejos primero' },
  { value: 'alfabetico', label: 'Nombre (A–Z)' },
]

/**
 * Palancas de la cartera secundaria: buscar + filtrar por estado + orden
 * elegible. Todo vive en el cliente (la cartera ya está en memoria) —
 * instantáneo a la escala del setter. La lista arranca por urgencia; "Limpiar"
 * vuelve a esos valores por defecto.
 */
export function CarteraToolbar({
  query,
  estado,
  orden,
  isFiltering,
  resultados,
  onQuery,
  onEstado,
  onOrden,
  onLimpiar,
}: CarteraToolbarProps) {
  return (
    <section aria-label="Buscar y ordenar tu cartera" className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Buscar negocio, rubro, zona o tu nota…"
            aria-label="Buscar en tu cartera"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            aria-label="Filtrar por estado"
            className="min-w-[9.5rem]"
            options={ESTADO_OPCIONES}
            value={estado}
            onChange={(event) => onEstado(event.target.value as EstadoFiltro)}
          />
          <Select
            aria-label="Ordenar la cartera"
            className="min-w-[10rem]"
            options={ORDEN_OPCIONES}
            value={orden}
            onChange={(event) => onOrden(event.target.value as OrdenCartera)}
          />
        </div>
      </div>

      {isFiltering && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="tabular-nums">
            {resultados} {resultados === 1 ? 'lead' : 'leads'} en la lista
          </span>
          <button
            type="button"
            onClick={onLimpiar}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-200"
          >
            <X size={12} strokeWidth={1.5} />
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  )
}
