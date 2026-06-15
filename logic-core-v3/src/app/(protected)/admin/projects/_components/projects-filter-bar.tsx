'use client'

import type { ChangeEvent } from 'react'
import { Select } from '@/components/ui'
import {
  PERIOD_OPTIONS,
  SERVICE_OPTIONS,
  VISIBILITY_OPTIONS,
  isPeriodFilter,
  isServiceFilter,
  type PeriodFilter,
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
  onPeriodChange: (period: PeriodFilter, from: string, to: string) => void
  onReset: () => void
}

/**
 * Barra de filtros 100% client-side: visibilidad (botones), servicio y período
 * (controlados) filtran al instante vía estado del board, sin navegación ni
 * recarga. El control de período acá es básico (select + fechas inline para
 * "Personalizado"); CAMBIO B lo reemplaza por un dropdown con "Aplicar".
 */
export function ProjectsFilterBar({
  filters,
  isDefault,
  onServiceChange,
  onVisibilityChange,
  onPeriodChange,
  onReset,
}: ProjectsFilterBarProps) {
  const handleService = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value
    if (isServiceFilter(value)) {
      onServiceChange(value)
    }
  }

  const handlePeriod = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value
    if (isPeriodFilter(value)) {
      // Al salir de "custom" se limpian las fechas; al entrar se conservan.
      const from = value === 'custom' ? filters.from : ''
      const to = value === 'custom' ? filters.to : ''
      onPeriodChange(value, from, to)
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

        <Select
          aria-label="Filtrar por período de última actividad"
          value={filters.period}
          onChange={handlePeriod}
          className={controlClassName}
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {filters.period === 'custom' ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              aria-label="Desde"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) => onPeriodChange('custom', event.currentTarget.value, filters.to)}
              className={controlClassName}
            />
            <span className="text-sm text-zinc-500">→</span>
            <input
              type="date"
              aria-label="Hasta"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) => onPeriodChange('custom', filters.from, event.currentTarget.value)}
              className={controlClassName}
            />
          </div>
        ) : null}

        {!isDefault ? (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Limpiar
          </button>
        ) : null}
      </div>
    </div>
  )
}
