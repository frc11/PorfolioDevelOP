'use client'

import { Select } from '@/components/ui'
import { ThemedDateInput } from './themed-date-input'
import { LocationTypeahead } from './location-typeahead'
import {
  EMPTY_LEAD_FILTERS,
  type LeadFilterOptions,
  type LeadFilters,
  type LeadPeriod,
} from './lead-filters'

const PERIOD_OPTIONS: { value: LeadPeriod; label: string }[] = [
  { value: 'all', label: 'Cualquier periodo' },
  { value: '1w', label: '1 semana' },
  { value: '1m', label: '1 mes' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 año' },
  { value: 'custom', label: 'Personalizado' },
]

type LeadFiltersBarProps = {
  filters: LeadFilters
  options: LeadFilterOptions
  activeCount: number
  onChange: (patch: Partial<LeadFilters>) => void
  onReset: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-[150px] flex-1 flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      {children}
    </label>
  )
}

/**
 * Barra de filtros del board OUTBOUND (presentacional). Selects compartidos + date inputs
 * themed para el rango custom. Opciones derivadas en runtime; el filtrado lo hace el padre.
 */
export function LeadFiltersBar({
  filters,
  options,
  activeCount,
  onChange,
  onReset,
}: LeadFiltersBarProps) {
  const hasActiveFilters =
    filters.service !== EMPTY_LEAD_FILTERS.service ||
    filters.setter !== EMPTY_LEAD_FILTERS.setter ||
    filters.zone !== EMPTY_LEAD_FILTERS.zone ||
    filters.period !== EMPTY_LEAD_FILTERS.period

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Servicio">
          <Select
            aria-label="Filtrar por servicio"
            value={filters.service}
            onChange={(event) => onChange({ service: event.target.value })}
            options={options.service}
          />
        </Field>

        <Field label="Periodo">
          <Select
            aria-label="Filtrar por periodo"
            value={filters.period}
            onChange={(event) => {
              // Sin cast: el valor sale del set fijo de PERIOD_OPTIONS.
              const next = PERIOD_OPTIONS.find((option) => option.value === event.target.value)
              if (next) {
                onChange({ period: next.value })
              }
            }}
            options={PERIOD_OPTIONS}
          />
        </Field>

        <Field label="Setter">
          <Select
            aria-label="Filtrar por setter"
            value={filters.setter}
            onChange={(event) => onChange({ setter: event.target.value })}
            options={options.setter}
          />
        </Field>

        <Field label="Ubicacion">
          <LocationTypeahead
            value={filters.zone}
            options={options.zone}
            onChange={(zone) => onChange({ zone })}
          />
        </Field>

        <div className="ml-auto flex items-center gap-3 self-end pb-1">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Limpiar
            </button>
          ) : null}
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Leads activos</p>
            <p className="text-lg font-semibold text-white">{activeCount}</p>
          </div>
        </div>
      </div>

      {filters.period === 'custom' ? (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <ThemedDateInput
            label="Desde"
            value={filters.from}
            onChange={(value) => onChange({ from: value })}
          />
          <ThemedDateInput
            label="Hasta"
            value={filters.to}
            onChange={(value) => onChange({ to: value })}
          />
        </div>
      ) : null}
    </div>
  )
}
