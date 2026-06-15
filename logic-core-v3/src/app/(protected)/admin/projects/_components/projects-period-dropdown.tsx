'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Calendar, Check, ChevronDown } from 'lucide-react'
import { PERIOD_OPTIONS, type PeriodFilter } from './projects-filters'

type ProjectsPeriodDropdownProps = {
  period: PeriodFilter
  from: string
  to: string
  onChange: (period: PeriodFilter, from: string, to: string) => void
}

function formatShortDate(value: string): string {
  // value es 'YYYY-MM-DD'; se interpreta como fecha local para evitar el corrimiento UTC.
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return value
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(year, month - 1, day))
}

const dateInputClassName =
  'rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none [color-scheme:dark] focus:border-cyan-400/40'

/**
 * Dropdown lane-local del filtro de período (sin librería de date-picker). Al
 * elegir "Personalizado" los 2 selectores de fecha aparecen DENTRO del mismo
 * panel (sin recargar) y el rango se aplica recién con "Aplicar" (ambas fechas
 * puestas). El resto de las opciones aplican al instante. Panel posicionado
 * `absolute` bajo el trigger: la barra vive arriba de la página, así que no lo
 * recorta el scroll del `<main>`.
 */
export function ProjectsPeriodDropdown({
  period,
  from,
  to,
  onChange,
}: ProjectsPeriodDropdownProps) {
  const [open, setOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(period === 'custom')
  const [draftFrom, setDraftFrom] = useState(from)
  const [draftTo, setDraftTo] = useState(to)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const openPanel = () => {
    // Seed de los drafts con el rango aplicado al abrir (sin effect → sin lint).
    setShowCustom(period === 'custom')
    setDraftFrom(from)
    setDraftTo(to)
    setOpen(true)
  }

  const selectPeriod = (value: PeriodFilter) => {
    if (value === 'custom') {
      setShowCustom(true)
      return
    }

    onChange(value, '', '')
    setOpen(false)
  }

  const canApply = draftFrom !== '' && draftTo !== '' && draftFrom <= draftTo

  const applyCustom = () => {
    if (!canApply) {
      return
    }

    onChange('custom', draftFrom, draftTo)
    setOpen(false)
  }

  const triggerLabel =
    period === 'custom'
      ? from && to
        ? `${formatShortDate(from)} → ${formatShortDate(to)}`
        : 'Personalizado'
      : PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? 'Período'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Filtrar por período de última actividad"
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors hover:bg-white/5"
      >
        <Calendar className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        <span>{triggerLabel}</span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Opciones de período"
          // Panel SÓLIDO/opaco (mismo criterio que el <Select> de servicio, que
          // portalea a body sobre el bg sólido): acá es absolute dentro del
          // <main> translúcido, así que un /95 + backdrop-blur dejaba pasar el
          // fondo. bg-zinc-900 sin alpha lo corta.
          className="absolute right-0 top-full z-30 mt-2 w-[260px] overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900 p-1.5 shadow-2xl"
        >
          {PERIOD_OPTIONS.map((option) => {
            const isActive =
              option.value === 'custom' ? showCustom : option.value === period

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => selectPeriod(option.value)}
                className={[
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-300'
                    : 'text-zinc-200 hover:bg-cyan-400/10 hover:text-cyan-300',
                ].join(' ')}
              >
                <span>{option.label}</span>
                {isActive ? <Check className="h-4 w-4 text-cyan-400" strokeWidth={1.5} /> : null}
              </button>
            )
          })}

          {showCustom ? (
            <div className="mt-2 space-y-3 border-t border-white/10 px-1 pt-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Desde
                </label>
                <input
                  type="date"
                  value={draftFrom}
                  max={draftTo || undefined}
                  onChange={(event) => setDraftFrom(event.currentTarget.value)}
                  className={dateInputClassName}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Hasta
                </label>
                <input
                  type="date"
                  value={draftTo}
                  min={draftFrom || undefined}
                  onChange={(event) => setDraftTo(event.currentTarget.value)}
                  className={dateInputClassName}
                />
              </div>

              <button
                type="button"
                onClick={applyCustom}
                disabled={!canApply}
                className="w-full rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aplicar
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
