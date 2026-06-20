'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalendarClock, Pin, PinOff, Play, StickyNote, X } from 'lucide-react'
import { Button, Field, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { formatFechaCorta } from '@/lib/leados/flow'
import {
  fijarLead,
  guardarNota,
  pausarLead,
  reanudarLead,
} from '@/app/(protected)/setter/_actions/cartera.actions'
import { NOTA_MAX } from '@/app/(protected)/setter/_actions/cartera.schemas'
import { TextArea } from './text-area'

type Panel = 'none' | 'snooze' | 'note'

type LeadCardActionsProps = {
  leadId: string
  pinned: boolean
  snoozedUntil: Date | null
  note: string | null
}

/** Suma `dias` a hoy y devuelve 'YYYY-MM-DD' (se llama en handlers, nunca en render). */
function fechaEnDias(dias: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

const ATAJOS_SNOOZE: { dias: number; etiqueta: string }[] = [
  { dias: 3, etiqueta: '3 días' },
  { dias: 7, etiqueta: '1 semana' },
  { dias: 14, etiqueta: '2 semanas' },
]

/**
 * Palancas privadas del setter sobre una card: fijar, pausar (snooze personal) y
 * la nota propia. Los editores se abren INLINE (la card tiene overflow-hidden, un
 * popover flotante se cortaría). Vive fuera del <Link> de la card, así sus clicks
 * no navegan. Cada acción confirma con toast y refresca para releer el meta.
 */
export function LeadCardActions({ leadId, pinned, snoozedUntil, note }: LeadCardActionsProps) {
  const router = useRouter()
  const [panel, setPanel] = useState<Panel>('none')
  const [notaTexto, setNotaTexto] = useState(note ?? '')
  const [minDate, setMinDate] = useState('')
  const [fechaCustom, setFechaCustom] = useState('')
  const [isPending, startTransition] = useTransition()

  const estaPausado = snoozedUntil !== null

  const togglePin = () => {
    startTransition(async () => {
      const result = await fijarLead(leadId, !pinned)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(result.data.pinned ? 'Fijado arriba en tu cartera.' : 'Lo sacaste de fijados.')
      router.refresh()
    })
  }

  const pausar = (hasta: string) => {
    startTransition(async () => {
      const result = await pausarLead(leadId, hasta)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`Pausado — vuelve a tu cartera el ${formatFechaCorta(result.data.snoozedUntil)}.`)
      setPanel('none')
      setFechaCustom('')
      router.refresh()
    })
  }

  const reanudar = () => {
    startTransition(async () => {
      const result = await reanudarLead(leadId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Reanudado — vuelve a su cola.')
      setPanel('none')
      router.refresh()
    })
  }

  const guardar = () => {
    startTransition(async () => {
      const result = await guardarNota(leadId, notaTexto)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(result.data.note ? 'Nota guardada.' : 'Nota borrada.')
      setPanel('none')
      router.refresh()
    })
  }

  const abrirSnooze = () => {
    setMinDate(fechaEnDias(1))
    setPanel((actual) => (actual === 'snooze' ? 'none' : 'snooze'))
  }

  const abrirNota = () => {
    setNotaTexto(note ?? '')
    setPanel((actual) => (actual === 'note' ? 'none' : 'note'))
  }

  return (
    <div className="mt-3 border-t border-white/[0.06] pt-2.5">
      <div className="flex items-center gap-1">
        <ActionButton
          label={pinned ? 'Quitar de fijados' : 'Fijar arriba'}
          active={pinned}
          onClick={togglePin}
          disabled={isPending}
          icon={pinned ? <PinOff size={14} strokeWidth={1.5} /> : <Pin size={14} strokeWidth={1.5} />}
        />
        <ActionButton
          label={estaPausado ? 'Cambiar la pausa' : 'Pausar en tu cartera'}
          active={estaPausado || panel === 'snooze'}
          onClick={abrirSnooze}
          disabled={isPending}
          icon={<CalendarClock size={14} strokeWidth={1.5} />}
        />
        <ActionButton
          label={note ? 'Editar nota' : 'Agregar nota'}
          active={Boolean(note) || panel === 'note'}
          onClick={abrirNota}
          disabled={isPending}
          icon={<StickyNote size={14} strokeWidth={1.5} />}
        />
        {estaPausado && (
          <button
            type="button"
            onClick={reanudar}
            disabled={isPending}
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-emerald-300/90 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
          >
            <Play size={12} strokeWidth={1.5} />
            Reanudar
          </button>
        )}
      </div>

      {panel === 'snooze' && (
        <div className="mt-2.5 space-y-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-[11px] font-medium text-zinc-400">
            Sacarlo de tu vista hasta…
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ATAJOS_SNOOZE.map((atajo) => (
              <button
                key={atajo.dias}
                type="button"
                onClick={() => pausar(fechaEnDias(atajo.dias))}
                disabled={isPending}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] disabled:opacity-50"
              >
                {atajo.etiqueta}
              </button>
            ))}
          </div>
          <Field label="O elegí una fecha">
            <div className="flex gap-2">
              <Input
                type="date"
                min={minDate}
                value={fechaCustom}
                onChange={(event) => setFechaCustom(event.target.value)}
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!fechaCustom || isPending}
                onClick={() => pausar(fechaCustom)}
              >
                Pausar
              </Button>
            </div>
          </Field>
        </div>
      )}

      {panel === 'note' && (
        <div className="mt-2.5 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-zinc-400">Tu nota privada</p>
            <span className={cn('text-[10px] tabular-nums', notaTexto.length > NOTA_MAX ? 'text-red-400' : 'text-zinc-600')}>
              {notaTexto.length}/{NOTA_MAX}
            </span>
          </div>
          <TextArea
            value={notaTexto}
            onChange={(event) => setNotaTexto(event.target.value)}
            rows={2}
            maxLength={NOTA_MAX}
            placeholder="Un recordatorio para vos — solo vos la ves."
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={guardar} loading={isPending}>
              Guardar
            </Button>
            <button
              type="button"
              onClick={() => setPanel('none')}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-50"
            >
              <X size={12} strokeWidth={1.5} />
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

type ActionButtonProps = {
  label: string
  icon: React.ReactNode
  active: boolean
  disabled: boolean
  onClick: () => void
}

function ActionButton({ label, icon, active, disabled, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-50',
        active ? 'bg-cyan-500/15 text-cyan-300' : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300',
      )}
    >
      {icon}
    </button>
  )
}
