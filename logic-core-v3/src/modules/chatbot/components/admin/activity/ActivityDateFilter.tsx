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
 * Filtro de fecha por presets (todos / última semana / mes / 6m / año + personalizado).
 * Componente propio del módulo chatbot/admin — replica el UX de Leads sin importar sus componentes.
 *
 * Devuelve un Fragment de ítems flex (NO un contenedor propio) para que el Select de período y,
 * al elegir "Personalizado", los inputs desde/hasta queden INLINE en la misma fila de la barra
 * de filtros de ActivityLog. El período va angosto (sm:w-44); desde/hasta crecen (sm:flex-1)
 * para llenar el ancho restante. En mobile todo es w-full y wrappea limpio.
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
    <>
      <div className="w-full sm:w-44 sm:flex-none">
        <Select
          aria-label="Filtrar por fecha"
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as ActivityDatePreset)}
          options={ACTIVITY_PERIOD_OPTIONS}
        />
      </div>
      {preset === 'custom' && (
        <>
          <div className="w-full sm:flex-1 sm:min-w-[8rem]">
            <input
              type="date"
              aria-label="Desde"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className={dateInputCls}
            />
          </div>
          <div className="w-full sm:flex-1 sm:min-w-[8rem]">
            <input
              type="date"
              aria-label="Hasta"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              className={dateInputCls}
            />
          </div>
        </>
      )}
    </>
  )
}
