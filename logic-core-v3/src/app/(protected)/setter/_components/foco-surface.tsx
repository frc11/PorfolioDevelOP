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
  PinOff,
  SkipForward,
  Target,
} from 'lucide-react'
import { Badge, Field, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { formatFechaCorta, motivoOrden, type HomeLead } from '@/lib/leados/flow'
import { anclarFoco, soltarFoco } from '@/app/(protected)/setter/_actions/foco.actions'
import { pausarLead } from '@/app/(protected)/setter/_actions/cartera.actions'
import { ShortcutsHelp, type Atajo } from './shortcuts-help'
import { useKeyboardShortcuts, type ShortcutMap } from './use-keyboard-shortcuts'

/**
 * LeadOS 2.1a — "Modo dirección": el lead protagonista (negocio + paso + porqué
 * + CTA). El foco solo PRESENTA y CALCULA: navega, ancla el sticky, suelta y
 * pausa — nunca transiciona stages.
 *
 *   - "Ir a trabajarlo": ancla el lead como foco (sticky D7) y abre su detalle.
 *     Al volver, retomás el MISMO lead aunque haya entrado uno más urgente.
 *   - "Pausar": snooze personal (reusa `pausarLead`) → sale de la cola → próximo.
 *   - "Saltar": ancla el próximo como foco → te corre al siguiente sin pausarlo.
 *   - "Soltar": borra el anclaje → el foco vuelve a ser la cima de la cola.
 *
 * P21 — desde este sprint el foco es EL PRIMER ÍTEM DE LA COLA (`ColaDelDia`),
 * no un bloque solo: se sigue dibujando igual (mismo card, mismos atajos), pero
 * la cuenta "1 de N para trabajar" se fue al encabezado de la cola, que es donde
 * el número significa algo. El padre (server) ya eligió foco/próximo con
 * `seleccionarFoco`; acá no hay motor de prioridad nuevo. Cuando NO hay
 * accionable, el padre no monta la cola: muestra `HomeEnEspera` (2.1b).
 *
 * P21 — "Soltar" cierra un cabo de 2.1a: había TRES lugares para anclar el foco
 * ("Ir a trabajarlo", "Saltar", "Abrir" de un aviso) y ninguno para soltarlo. La
 * action `soltarFoco` existía desde 2.1a, construida y sin un solo llamador; el
 * botón sólo aparece con el sticky activo, que es cuando hay algo que soltar.
 */
type FocoSurfaceProps = {
  foco: HomeLead
  proximo: HomeLead | null
  stickyActivo: boolean
}

const ATAJOS_FOCO: Atajo[] = [
  { accion: 'Ir a trabajar el lead', teclas: ['t'] },
  { accion: 'Pausar el lead', teclas: ['p'] },
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

export function FocoSurface({ foco, proximo, stickyActivo }: FocoSurfaceProps) {
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
      // F3 — el par de señales del patrón (`lead-card-actions`): el control ya se
      // deshabilitaba en el acto, faltaba el anuncio. «Saltar» era la única acción
      // que escribe y no acusaba: se queda en la MISMA pantalla y sólo cambia el
      // nombre adentro de la tarjeta — al lado de «Pausar», que sí anuncia. Sus
      // hermanas mudas («Ir a trabajarlo», «Abrir») no lo necesitan: navegan.
      toast.success(`Saltado — ahora tu foco es ${proximo.businessName}.`)
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

  const soltar = () => {
    startTransition(async () => {
      const result = await soltarFoco()
      if (!result.success) {
        toast.error(result.error)
        return
      }
      // Mismo par de señales que "Saltar" (F3): el control ya se deshabilita en
      // el acto, y esto anuncia lo que pasó — se queda en la MISMA pantalla y lo
      // único que cambia es cuál lead encabeza la cola.
      toast.success('Soltado — el foco vuelve al primero de tu cola.')
      setSnoozeAbierto(false)
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

        {/* P21 — la cuenta "1 de N para trabajar" se fue al encabezado de la
            cola: acá decía la posición de un cursor que el setter no mueve, y
            repetía un total que ahora tiene su lugar propio arriba. */}
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-300/80">
            <Target size={13} strokeWidth={1.5} aria-hidden />
            Tu foco ahora
          </p>
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

        {/* El paso actual. P21 — dejó de ser una caja cyan rellena de ancho
            completo: con ese tratamiento parecía más un botón que el botón
            (que mide un tercio y está abajo), y el ojo iba a la fila que no se
            puede tocar. Sigue siendo lo más fuerte que se LEE —cyan, con la
            flecha— pero ya no imita un control: el único que parece pulsable es
            el que lo es. */}
        <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-cyan-100">
          <ArrowRight
            size={16}
            strokeWidth={1.5}
            aria-hidden
            className="mt-0.5 shrink-0 text-cyan-300"
          />
          <span className="min-w-0">{foco.proximaAccion}</span>
        </p>

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
            title={proximo ? 'Pasar al próximo sin pausar éste' : 'No hay próximo'}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 outline-none transition-colors hover:bg-white/[0.06] hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-40"
          >
            Saltar
            <SkipForward size={14} strokeWidth={1.5} aria-hidden />
          </button>

          {/* P21 — sólo con el sticky activo: sin anclaje no hay nada que
              soltar, y un control que no hace nada es peor que su ausencia. */}
          {stickyActivo && (
            <button
              type="button"
              onClick={soltar}
              disabled={isPending}
              title="Dejar de fijar este lead: el foco vuelve al primero de la cola"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 outline-none transition-colors hover:bg-white/[0.06] hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-50"
            >
              <PinOff size={14} strokeWidth={1.5} aria-hidden />
              Soltar
            </button>
          )}
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

      {/* P21 — el pie "Después: <negocio> · +N más en la cola" se fue. Existía
          porque la cola NO se renderizaba: era la única forma de ver el próximo
          sin abrir el tablero. Ahora el próximo es la fila de abajo, con su
          acción y su botón — dejarlo sería el mismo negocio nombrado dos veces
          a tres centímetros de distancia. Con él se fue `restantes`, que era su
          único consumidor: "Saltar" mira `proximo`, no la cuenta. */}
      <ShortcutsHelp atajos={ATAJOS_FOCO} />
    </section>
  )
}
