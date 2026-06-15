'use client'

import type { ChangeEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import { Select } from '@/components/ui'
import { ProjectsPeriodDropdown } from './projects-period-dropdown'
import {
  DELIVERY_PERIOD_OPTIONS,
  SERVICE_OPTIONS,
  START_PERIOD_OPTIONS,
  VISIBILITY_OPTIONS,
  isServiceFilter,
  type PeriodValue,
  type ProjectFilters,
  type ServiceFilter,
  type VisibilityFilter,
} from './projects-filters'

const controlClassName =
  'rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none'

type ProjectsFilterBarProps = {
  filters: ProjectFilters
  isDefault: boolean
  onServiceChange: (value: ServiceFilter) => void
  onVisibilityChange: (value: VisibilityFilter) => void
  onStartChange: (period: PeriodValue, from: string, to: string) => void
  onDeliveryChange: (period: PeriodValue, from: string, to: string) => void
  onReset: () => void
}

/**
 * Barra de filtros 100% client-side: visibilidad (botones), servicio (select),
 * inicio y entrega (dropdowns de fecha) filtran al instante vía estado del
 * board, sin navegación ni recarga. "Reestablecer filtros" vuelve todo a su
 * default. Todos combinan AND.
 */
export function ProjectsFilterBar({
  filters,
  isDefault,
  onServiceChange,
  onVisibilityChange,
  onStartChange,
  onDeliveryChange,
  onReset,
}: ProjectsFilterBarProps) {
  const handleService = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value
    if (isServiceFilter(value)) {
      onServiceChange(value)
    }
  }

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {VISIBILITY_OPTIONS.map((option) => {
          const isActive = filters.visibility === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onVisibilityChange(option.value)}
              aria-pressed={isActive}
              className={[
                'inline-flex rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
                  : 'border-white/10 bg-black/20 text-zinc-300 hover:bg-white/5',
              ].join(' ')}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          aria-label="Filtrar por tipo de servicio"
          value={filters.service}
          onChange={handleService}
          className={controlClassName}
        >
          {SERVICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <ProjectsPeriodDropdown
          label="Inicio"
          ariaLabel="Filtrar por fecha de inicio"
          options={START_PERIOD_OPTIONS}
          period={filters.start.period}
          from={filters.start.from}
          to={filters.start.to}
          onChange={onStartChange}
        />

        <ProjectsPeriodDropdown
          label="Entrega"
          ariaLabel="Filtrar por fecha de entrega estimada"
          options={DELIVERY_PERIOD_OPTIONS}
          period={filters.delivery.period}
          from={filters.delivery.from}
          to={filters.delivery.to}
          onChange={onDeliveryChange}
        />

        {!isDefault ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            Reestablecer filtros
          </button>
        ) : null}
      </div>
    </div>
  )
}
