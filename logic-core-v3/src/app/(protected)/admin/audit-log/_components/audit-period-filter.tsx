'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, Check, ChevronDown } from 'lucide-react'
import { useIsClient } from '@/lib/use-is-client'
import { AUDIT_PERIOD_OPTIONS, type AuditPeriod } from './audit-filters'

type AuditPeriodFilterProps = {
  period: AuditPeriod
  from: string
  to: string
  onChange: (period: AuditPeriod, from: string, to: string) => void
}

type PanelPosition = {
  top?: number
  bottom?: number
  left: number
}

const GAP = 4
const PANEL_WIDTH = 260
const PANEL_MAX_H = 380

// Réplica LOCAL del look del dropdown de proyectos (NO se importa nada de
// projects/). Técnica del <Select> de ui: el panel se portalea a document.body
// con posición fixed calculada desde el trigger, así escapa el stacking del
// <main> (backdrop-blur) y queda SÓLIDO. Right-align + clamp al viewport, con
// flip-up si no hay espacio abajo.
function calcPosition(trigger: HTMLElement): PanelPosition {
  const rect = trigger.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom - GAP
  const flipUp = spaceBelow < PANEL_MAX_H && rect.top > spaceBelow
  const left = Math.min(
    Math.max(8, rect.right - PANEL_WIDTH),
    window.innerWidth - PANEL_WIDTH - 8,
  )

  return {
    top: flipUp ? undefined : rect.bottom + GAP,
    bottom: flipUp ? window.innerHeight - rect.top + GAP : undefined,
    left,
  }
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
 * Filtro de fecha del audit-log (createdAt). Presets hacia atrás + rango
 * "Personalizado" con dos `<input type="date">`; el rango aplica con "Aplicar",
 * el resto al instante. El panel se PORTALEA a document.body → sólido, sin fade.
 */
export function AuditPeriodFilter({ period, from, to, onChange }: AuditPeriodFilterProps) {
  const mounted = useIsClient()
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(null)
  const [showCustom, setShowCustom] = useState(period === 'custom')
  const [draftFrom, setDraftFrom] = useState(from)
  const [draftTo, setDraftTo] = useState(to)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    // El portal rompe el containment del DOM: el click-outside chequea wrapper Y panel.
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    // El trigger se mueve con el scroll del <main>; el panel es fixed → se cierra.
    const handleScroll = (event: Event) => {
      if (panelRef.current?.contains(event.target as Node)) {
        return
      }
      setOpen(false)
    }
    const handleResize = () => setOpen(false)

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [open])

  const openPanel = () => {
    if (!triggerRef.current) {
      return
    }
    setPanelPos(calcPosition(triggerRef.current))
    setShowCustom(period === 'custom')
    setDraftFrom(from)
    setDraftTo(to)
    setOpen(true)
  }

  const selectPeriod = (value: AuditPeriod) => {
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

  const selectionLabel =
    period === 'custom'
      ? from && to
        ? `${formatShortDate(from)} → ${formatShortDate(to)}`
        : 'Personalizado'
      : AUDIT_PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? 'Todos'

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Filtrar por fecha"
        className="inline-flex w-full min-w-[210px] items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors hover:bg-white/5"
      >
        <Calendar className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={1.5} />
        <span className="text-zinc-500">Fecha</span>
        <span className="truncate">{selectionLabel}</span>
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {mounted && open && panelPos
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label="Filtrar por fecha"
              style={{
                position: 'fixed',
                top: panelPos.top,
                bottom: panelPos.bottom,
                left: panelPos.left,
                width: PANEL_WIDTH,
                zIndex: 210,
              }}
              className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-[20px] backdrop-saturate-[180%]"
            >
              {AUDIT_PERIOD_OPTIONS.map((option) => {
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
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
