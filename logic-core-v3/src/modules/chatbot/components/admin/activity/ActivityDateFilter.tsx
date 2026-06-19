'use client'

import { Select } from '@/components/ui'
import { ACTIVITY_PERIOD_OPTIONS, type ActivityDatePreset } from './activityFilters'

interface ActivityDateFilterProps {
  preset: ActivityDatePreset
  from: string
  to: string
  onPresetChange: (preset: ActivityDatePreset) => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}

const dateInputCls =
  'w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 focus:border-cyan-400/30 focus:outline-none [color-scheme:dark]'

/**
 * Filtro de fecha por presets (última semana/mes/6m/año + personalizado). El rango
 * desde/hasta se revela SOLO cuando se elige "Personalizado". Componente propio del
 * módulo chatbot/admin — replica el UX de Leads sin importar sus componentes.
 */
export function ActivityDateFilter({
  preset,
  from,
  to,
  onPresetChange,
  onFromChange,
  onToChange,
}: ActivityDateFilterProps) {
  return (
    <div className="space-y-2">
      <Select
        aria-label="Filtrar por fecha"
        value={preset}
        onChange={(e) => onPresetChange(e.target.value as ActivityDatePreset)}
        options={ACTIVITY_PERIOD_OPTIONS}
      />
      {preset === 'custom' && (
        <div className="space-y-2">
          <input
            type="date"
            aria-label="Desde"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className={dateInputCls}
          />
          <input
            type="date"
            aria-label="Hasta"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className={dateInputCls}
          />
        </div>
      )}
    </div>
  )
}
