'use client'

import { ALERT_PERIOD_OPTIONS, type DateFilterState } from './alerts-filters'

// Filtro de fecha client-side de /admin/alerts. Chips de preset (mismo look que
// el filtro de severidad) + rango "Personalizado" con dos <input type="date">.
// Patrón replicado de Proyectos/Leads (los componentes originales están acoplados
// a su panel). El styling de los inputs replica ThemedDateInput de Leads (genérico
// pero en leads/_components) para mantener el lane Alertas self-contained.

interface AlertsDateFilterProps {
  value: DateFilterState
  onChange: (patch: Partial<DateFilterState>) => void
}

const dateInputCls =
  'rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/35'

export function AlertsDateFilter({ value, onChange }: AlertsDateFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600 mr-1">Período</p>
        {ALERT_PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ period: opt.value })}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors ${
              value.period === opt.value
                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value.period === 'custom' && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] text-zinc-400">
            Desde
            <input
              type="date"
              value={value.from}
              max={value.to || undefined}
              onChange={(e) => onChange({ from: e.target.value })}
              style={{ colorScheme: 'dark' }}
              className={dateInputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-zinc-400">
            Hasta
            <input
              type="date"
              value={value.to}
              min={value.from || undefined}
              onChange={(e) => onChange({ to: e.target.value })}
              style={{ colorScheme: 'dark' }}
              className={dateInputCls}
            />
          </label>
        </div>
      )}
    </div>
  )
}
