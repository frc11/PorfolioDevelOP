'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { FaseId } from '@/lib/leados/contracts'
import { guardarProgreso } from '@/app/(protected)/setter/_actions/dossier.actions'

/**
 * M7–M12 — el tilde de auto-reporte de UNA fase. Reusa el MISMO camino de
 * escritura que el checklist del wizard (`guardarProgreso → saveOwnedProgreso →
 * progresoJson`): el manual explota el checklist 6-en-uno en una pantalla por
 * fase, y cada una lleva SU tilde. El `ChecklistConstruccion` del wizard queda
 * intacto.
 *
 * NO es un gate (§6-3 del brief): tildar no bloquea nada ni hace avanzar —
 * `progresoJson` jamás se cablea a la transición. El único gate de Construcción
 * es el chequeo final (M14). La marca reconstruye el array completo que espera
 * la action (agrega/quita ESTA fase, preserva las demás) — mismo shape que el
 * wizard.
 *
 * Optimista para feedback instantáneo (`useOptimistic`, patrón del checklist) +
 * `router.refresh()` tras el guardado: la action revalida `/setter` y
 * `/setter/leads/[leadId]` pero NO esta sub-ruta del manual, así que sin el
 * refresh la base optimista quedaría stale y el tilde volvería atrás al cerrar
 * la transición (mismo refresh que `OpenerForm`/`EscalarModal` en el manual).
 */
export function FaseAutoReporte({
  leadId,
  faseId,
  titulo,
  completadas,
}: {
  leadId: string
  faseId: FaseId
  titulo: string
  completadas: FaseId[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [marcada, setMarcada] = useOptimistic<boolean, boolean>(
    completadas.includes(faseId),
    (_prev, siguiente) => siguiente,
  )

  const toggle = () => {
    const marcar = !marcada
    const siguiente = marcar
      ? [...completadas.filter((id) => id !== faseId), faseId]
      : completadas.filter((id) => id !== faseId)
    startTransition(async () => {
      setMarcada(marcar)
      const result = await guardarProgreso(leadId, { completadas: siguiente })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={marcada}
      aria-label={marcada ? `Desmarcar «${titulo}» como hecha` : `Marcar «${titulo}» como hecha`}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors',
        marcada
          ? 'border-emerald-400/30 bg-emerald-500/[0.06]'
          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
          marcada
            ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
            : 'border-white/20 bg-white/[0.03] text-zinc-500 group-hover:border-white/30',
        )}
      >
        {isPending ? (
          <Loader2 size={13} strokeWidth={1.5} className="animate-spin" />
        ) : marcada ? (
          <Check size={14} strokeWidth={1.5} />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-sm font-semibold',
            marcada ? 'text-emerald-200' : 'text-zinc-200',
          )}
        >
          {marcada ? 'Fase marcada como hecha' : 'Marcá esta fase cuando la termines'}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
          Es auto-reporte: tildar no bloquea nada ni te hace avanzar — hacé las fases en el orden
          que te sirva. El único chequeo que gatea es el final.
        </span>
      </span>
    </button>
  )
}
