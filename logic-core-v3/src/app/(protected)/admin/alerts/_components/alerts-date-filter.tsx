'use client'

import { useEffect, useRef, useState } from 'react'
import { ALERT_PERIOD_OPTIONS, type AlertPeriod, type DateFilterState } from './alerts-filters'

// Filtro de fecha client-side de /admin/alerts. Chips de preset (mismo look que
// el filtro de severidad) + rango "Personalizado" que abre un POPOVER a la derecha
// del chip (flota sobre el contenido, no empuja el layout). La lógica de filtrado
// vive en alerts-filters.ts; acá solo UI + posicionamiento del panel.

interface AlertsDateFilterProps {
  value: DateFilterState
  onChange: (patch: Partial<DateFilterState>) => void
}

const dateInputCls =
  'rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/35'

function chipCls(active: boolean): string {
  return `rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors ${
    active
      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
      : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
  }`
}

export function AlertsDateFilter({ value, onChange }: AlertsDateFilterProps) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  // Cerrar el popover con click afuera + Escape (solo mientras está abierto).
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selectPreset = (period: AlertPeriod) => {
    onChange({ period })
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600 mr-1">Período</p>
      {ALERT_PERIOD_OPTIONS.map((opt) => {
        if (opt.value === 'custom') {
          return (
            <div key="custom" ref={anchorRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  onChange({ period: 'custom' })
                  setOpen((o) => !o)
                }}
                aria-haspopup="dialog"
                aria-expanded={open}
                className={chipCls(value.period === 'custom')}
              >
                {opt.label}
              </button>

              {open && (
                <div
                  role="dialog"
                  aria-label="Rango personalizado"
                  className="absolute left-full top-0 z-50 ml-2 w-64 rounded-2xl border border-white/10 bg-[#0c1016]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                >
                  <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Rango personalizado
                  </p>
                  <div className="flex flex-col gap-3">
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
                </div>
              )}
            </div>
          )
        }

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => selectPreset(opt.value)}
            className={chipCls(value.period === opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
