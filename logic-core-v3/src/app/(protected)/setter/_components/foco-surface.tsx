'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowRight,
  ArrowUpNarrowWide,
  CalendarClock,
  Flame,
  PlayCircle,
  Pin,
  SkipForward,
  Target,
} from 'lucide-react'
import { Badge, Field, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { formatFechaCorta, motivoOrden, type HomeLead } from '@/lib/leados/flow'
import { anclarFoco } from '@/app/(protected)/setter/_actions/foco.actions'
import { pausarLead } from '@/app/(protected)/setter/_actions/cartera.actions'
import { ShortcutsHelp, type Atajo } from './shortcuts-help'
import { useKeyboardShortcuts, type ShortcutMap } from './use-keyboard-shortcuts'

/**
 * LeadOS 2.1a — "Modo dirección": el home entrega UN lead accionable de
 * protagonista (negocio + paso + porqué + CTA), no un tablero. Cuando el setter
 * termina (lo trabaja en el detalle y sale de la cola) o parquea (snooze), el
 * próximo render le da el siguiente. El foco solo PRESENTA y CALCULA: navega,
 * ancla el sticky y pospone — nunca transiciona stages.
 *
 *   - "Ir a trabajarlo": ancla el lead como foco (sticky D7) y abre su detalle.
 *     Al volver, retomás el MISMO lead aunque haya entrado uno más urgente.
 *   - "Pausar": snooze personal (reusa `pausarLead`) → sale de la cola → próximo.
 *   - "Saltar": ancla el próximo como foco → te corre al siguiente sin posponer.
 *
 * El padre (server) ya eligió foco/próximo con `seleccionarFoco`; acá no hay
 * motor de prioridad nuevo. Cuando NO hay accionable (cola `trabajar` vacía) el
 * padre NO monta esta superficie: muestra `HomeEnEspera` (2.1b) en su lugar — por
 * eso `foco` acá es siempre un lead real, nunca null.
 */
type FocoSurfaceProps = {
  foco: HomeLead
  proximo: HomeLead | null
  restantes: number
  total: number
  stickyActivo: boolean
}

const ATAJOS_FOCO: Atajo[] = [
  { accion: 'Ir a trabajar el lead', teclas: ['t'] },
  { accion: 'Pausar (posponer)', teclas: ['p'] },
  { accion: 'Saltar al próximo', teclas: ['s'] },
  { accion: 'Esta ayuda', teclas: ['?'] },
]

const ATAJOS_SNOOZE: { dias: number; etiqueta: string }[] = [
  { dias: 3, etiqueta: '3 días' },
  { dias: 7, etiqueta: '1 semana' },
  { dias: 14, etiqueta: '2 semanas' },
]

/** Suma `dias` a hoy → 'YYYY-MM-DD' (se llama en handlers, nunca en render). */
function fechaEnDias(dias: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

export function FocoSurface({ foco, proximo, restantes, total, stickyActivo }: FocoSurfaceProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [snoozeAbierto, setSnoozeAbierto] = useState(false)
  const [minDate, setMinDate] = useState('')
  const [fechaCustom, setFechaCustom] = useState('')
  const trabajarRef = useRef<HTMLButtonElement>(null)
  const saltarRef = useRef<HTMLButtonElement>(null)

  const irATrabajar = () => {
    startTransition(async () => {
      const result = await anclarFoco(foco.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.push(`/setter/leads/${foco.id}`)
    })
  }

  const saltar = () => {
    if (!proximo) return
    startTransition(async () => {
      const result = await anclarFoco(proximo.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setSnoozeAbierto(false)
      router.refresh()
    })
  }

  const pausar = (hasta: string) => {
    startTransition(async () => {
      const result = await pausarLead(foco.id, hasta)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`Pausado — vuelve a tu cartera el ${formatFechaCorta(result.data.snoozedUntil)}.`)
      setSnoozeAbierto(false)
      setFechaCustom('')
      router.refresh()
    })
  }

  const toggleSnooze = () => {
    setMinDate(fechaEnDias(1))
    setSnoozeAbierto((actual) => !actual)
  }

  // Bindings frescos cada render (el hook los lee por ref): `t`/`s` disparan el
  // mismo botón que el click (respetan `disabled`); `p` abre/cierra la pausa.
  const bindings: ShortcutMap = {
    t: () => trabajarRef.current?.click(),
    s: () => saltarRef.current?.click(),
    p: toggleSnooze,
  }
  useKeyboardShortcuts(bindings)

  const motivo = motivoOrden(foco)
  const meta = [foco.industry, foco.zone].filter(Boolean).join(' · ')

  return (
    <section aria-label="Tu foco ahora" className="space-y-3">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl p-5 sm:p-6',
          'border border-cyan-400/25 bg-cyan-500/[0.06]',
          'shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
        )}
      >
        {/* Acento cyan: es lo accionable, el protagonista del día. */}
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-cyan-400/80" />

        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-300/80">
            <Target size={13} strokeWidth={1.5} aria-hidden />
            Tu foco ahora
          </p>
          <span className="shrink-0 text-[11px] font-medium tabular-nums text-zinc-500">
            {total === 1 ? '1 para trabajar' : `1 de ${total} para trabajar`}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
            {foco.businessName}
          </h2>
          {foco.caliente && (
            <Badge tone="amber" variant="soft" pulse icon={<Flame size={10} strokeWidth={1.5} />}>
              Caliente
            </Badge>
          )}
        </div>

        {meta && <p className="mt-1 text-xs text-zinc-500">{meta}</p>}

        {/* El paso actual: el elemento más fuerte — qué hacer ahora salta solo. */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-100">
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden className="shrink-0 text-cyan-300" />
          <span className="min-w-0">{foco.proximaAccion}</span>
        </div>

        {/* Por qué es éste el foco (explicabilidad) + si lo sostiene el sticky. */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {motivo && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-zinc-400">
              <ArrowUpNarrowWide size={11} strokeWidth={1.5} aria-hidden className="shrink-0 text-zinc-600" />
              {motivo}
            </span>
          )}
          {stickyActivo && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-zinc-500">
              <Pin size={11} strokeWidth={1.5} aria-hidden className="shrink-0" />
              Fijado mientras lo trabajás
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            ref={trabajarRef}
            type="button"
            onClick={irATrabajar}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3.5 py-2 text-sm font-semibold text-cyan-100 outline-none transition-colors hover:bg-cyan-500/25 focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-50"
          >
            <PlayCircle size={16} strokeWidth={1.5} aria-hidden />
            Ir a trabajarlo
          </button>

          <button
            type="button"
            onClick={toggleSnooze}
            disabled={isPending}
            aria-expanded={snoozeAbierto}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-50',
              snoozeAbierto
                ? 'bg-white/[0.08] text-zinc-200'
                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200',
            )}
          >
            <CalendarClock size={14} strokeWidth={1.5} aria-hidden />
            Pausar
          </button>

          <button
            ref={saltarRef}
            type="button"
            onClick={saltar}
            disabled={!proximo || isPending}
            title={proximo ? 'Pasar al próximo sin posponer éste' : 'No hay próximo'}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 outline-none transition-colors hover:bg-white/[0.06] hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-40"
          >
            Saltar
            <SkipForward size={14} strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        {snoozeAbierto && (
          <div className="mt-3 space-y-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[11px] font-medium text-zinc-400">Sacarlo de tu vista hasta…</p>
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
                <button
                  type="button"
                  onClick={() => pausar(fechaCustom)}
                  disabled={!fechaCustom || isPending}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] disabled:opacity-50"
                >
                  Pausar
                </button>
              </div>
            </Field>
          </div>
        )}
      </div>

      {/* Lo que viene: que el setter vea el próximo sin abrir el tablero. */}
      {proximo && (
        <p className="px-1 text-xs text-zinc-600">
          Después:{' '}
          <span className="font-medium text-zinc-400">{proximo.businessName}</span>
          {restantes > 1 && <span> · +{restantes - 1} más en la cola</span>}
        </p>
      )}

      <ShortcutsHelp atajos={ATAJOS_FOCO} />
    </section>
  )
}
