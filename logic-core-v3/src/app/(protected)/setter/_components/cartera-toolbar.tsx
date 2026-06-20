'use client'

import { Search, X } from 'lucide-react'
import { Input, Select } from '@/components/ui'
import type { EstadoFiltro, OrdenCartera } from '@/lib/leados/flow'

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

const ESTADO_OPCIONES: { value: EstadoFiltro; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'trabajar', label: 'Para trabajar' },
  { value: 'seguimiento', label: 'En seguimiento' },
  { value: 'revision', label: 'Esperando revisión' },
  { value: 'agendadas', label: 'Agendadas' },
  { value: 'pausados', label: 'Pausados por vos' },
  { value: 'archivo', label: 'Descartados y perdidos' },
]

const ORDEN_OPCIONES: { value: OrdenCartera; label: string }[] = [
  { value: 'colas', label: 'Por colas (recomendado)' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'reciente', label: 'Más nuevos primero' },
  { value: 'antiguo', label: 'Más viejos primero' },
  { value: 'alfabetico', label: 'Nombre (A–Z)' },
]

/**
 * Palancas de la cartera: buscar + filtrar por estado + orden elegible. Todo
 * vive en el cliente (la cartera ya está en memoria) — instantáneo a la escala
 * del setter. Tocar cualquier control pasa de la vista por colas a una lista
 * plana ordenada a su gusto; "Limpiar" vuelve a las colas.
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
            Limpiar — volver a las colas
          </button>
        </div>
      )}
    </section>
  )
}
