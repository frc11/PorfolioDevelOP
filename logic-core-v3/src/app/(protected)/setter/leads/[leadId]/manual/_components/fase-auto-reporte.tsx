'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { FaseId } from '@/lib/leados/contracts'
import { guardarProgreso } from '@/app/(protected)/setter/_actions/dossier.actions'

/**
 * El tilde de auto-reporte de UNA fase. El MISMO camino de escritura que tenía
 * el checklist 6-en-uno del wizard (`guardarProgreso → saveOwnedProgreso →
 * progresoJson`). Desde el corte 5.6 esta es la única presentación; desde P6-B
 * se renderizan TRES por pantalla (mc1/mc2) — uno por fase, 1↔1 con su `FaseId`,
 * así el progreso persistido no cambia de forma. La explicación del auto-reporte
 * la sirve el grupo (`ConstruccionRegistro`) una sola vez, no cada tilde.
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
 *
 * El MOTIVO de por qué el tilde está apagado ya no vive acá: iba dentro del
 * `<button>`, y el de RECHAZADA nombra otra pantalla («Correcciones») que ahí
 * adentro no se puede enlazar —un `<a>` dentro de un `<button>` no es navegable—.
 * Lo sirve `MotivoDelTilde` (m-construccion.tsx), una vez arriba del grupo y con
 * el destino enlazado.
 *
 * `puedeGuardar` (3.3, B-07): el server (`saveOwnedProgreso`, dossier.ts) YA
 * rechaza el guardado fuera de `stage === 'CONSTRUCCION'` — antes de esto el
 * tilde se ofrecía igual en BRIEF (con la CTA «Arrancar construcción» arriba)
 * y el click volvía con un toast de error recién al tocar el server. Acá se
 * ESPEJA esa regla, no se agrega una nueva: `puedeGuardar` no bloquea nada
 * fuera del submit del tilde (navegación, lectura y el resto de la pantalla
 * siguen intactos) y sigue sin ser un gate — tildar en CONSTRUCCION continúa
 * sin hacer avanzar ni bloquear nada (§6-3 intacto).
 */
export function FaseAutoReporte({
  leadId,
  faseId,
  titulo,
  completadas,
  puedeGuardar = true,
}: {
  leadId: string
  faseId: FaseId
  titulo: string
  completadas: FaseId[]
  /** false cuando el server va a rechazar el guardado (stage !== CONSTRUCCION). */
  puedeGuardar?: boolean
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
      disabled={!puedeGuardar}
      aria-pressed={marcada}
      aria-label={marcada ? `Desmarcar «${titulo}» como hecha` : `Marcar «${titulo}» como hecha`}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors',
        !puedeGuardar
          ? 'cursor-not-allowed border-white/[0.08] bg-white/[0.02] opacity-60'
          : marcada
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
        {/* P6-B: con tres tildes por pantalla, el nombre de la fase tiene que
            estar A LA VISTA — sin él los tres se leen idénticos. */}
        <span className="block text-[11px] font-medium text-zinc-500">{titulo}</span>
        <span
          className={cn(
            'mt-0.5 block text-sm font-semibold',
            marcada ? 'text-emerald-200' : 'text-zinc-200',
          )}
        >
          {marcada ? 'Fase marcada como hecha' : 'Marcá esta fase cuando la termines'}
        </span>
      </span>
    </button>
  )
}
