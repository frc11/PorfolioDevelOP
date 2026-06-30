'use client'

// P1.C — Pregunta 4 del dueño: "¿cuánta plata generó la web?". Tile interactivo:
// - ticket cargado + hay leads → cifra estimada (siempre con marco "estimado").
// - ticket cargado + sin leads → invitación honesta (no "$0" crudo).
// - ticket null → card de setup de UNA pregunta que guarda el ticket.
// - lápiz discreto para editar el ticket después.
// El componente es client porque guarda el ticket (server action org-scoped) con
// feedback optimista; el cálculo lo hace la lógica pura (estimateMoney).

import { useState, useTransition } from 'react'
import { DollarSign, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { saveAverageTicket } from '@/app/(protected)/dashboard/_actions/business-profile.actions'
import { estimateMoney, formatMoneyUsd } from '@/lib/dashboard/home-metrics-logic'

// Mismo shell que los demás tiles del hero (B13).
const TILE = 'rounded-2xl border border-white/10 bg-white/[0.02] p-5'

interface MoneyEstimateProps {
  /** Leads del período (semana) — multiplicador de la estimación. */
  leadCount: number
  /** Ticket promedio en USD ya cargado, o null si falta configurarlo. */
  initialTicketUsd: number | null
}

export function MoneyEstimate({ leadCount, initialTicketUsd }: MoneyEstimateProps) {
  const [ticket, setTicket] = useState<number | null>(initialTicketUsd)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialTicketUsd != null ? String(initialTicketUsd) : '')
  const [isPending, startTransition] = useTransition()

  const showForm = editing || ticket == null

  function handleSave() {
    const value = Number(draft)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Ingresá un monto válido en dólares.')
      return
    }
    const intValue = Math.round(value)
    startTransition(async () => {
      const res = await saveAverageTicket({ averageTicketUsd: intValue })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setTicket(intValue)
      setEditing(false)
      toast.success('Listo, lo usamos para estimar tus oportunidades')
    })
  }

  if (showForm) {
    return (
      <div className={TILE}>
        <div className="mb-3 flex items-start justify-between">
          <p className="text-xs tracking-tight text-zinc-500">Cuánto te generó la web</p>
          <div className="rounded-md bg-emerald-400/10 p-1.5">
            <DollarSign className="h-4 w-4 text-emerald-300" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
        <label htmlFor="avg-ticket" className="block text-sm font-medium text-zinc-200">
          ¿Cuánto vale una venta promedio para tu negocio?
        </label>
        <p className="mt-1 text-xs text-zinc-500">
          Con eso estimamos cuánta plata representan tus leads. En dólares (US$).
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-3">
            <span className="text-sm text-zinc-500">US$</span>
            <input
              id="avg-ticket"
              type="number"
              inputMode="numeric"
              min={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
              placeholder="1500"
              className="min-h-[44px] w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>
          <Button size="sm" onClick={handleSave} loading={isPending}>
            Guardar
          </Button>
          {ticket != null && (
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setEditing(false)
                setDraft(String(ticket))
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    )
  }

  const estimate = estimateMoney(leadCount, ticket)

  return (
    <div className={TILE}>
      <div className="mb-3 flex items-start justify-between">
        <p className="text-xs tracking-tight text-zinc-500">Cuánto te generó la web</p>
        <button
          type="button"
          onClick={() => {
            setDraft(ticket != null ? String(ticket) : '')
            setEditing(true)
          }}
          aria-label="Editar ticket promedio"
          className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {leadCount > 0 && estimate != null ? (
        <>
          <p className="text-2xl font-medium tracking-tight text-emerald-300">
            ≈ {formatMoneyUsd(estimate)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">en oportunidades comerciales</p>
          <p className="mt-2 text-[11px] text-zinc-500">
            estimado según tu ticket promedio ({formatMoneyUsd(ticket ?? 0)})
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-zinc-300">
            Cuando entren leads vas a ver acá cuánto representan
          </p>
          <p className="mt-2 text-[11px] text-zinc-500">
            tu ticket promedio: {formatMoneyUsd(ticket ?? 0)}
          </p>
        </>
      )}
    </div>
  )
}
