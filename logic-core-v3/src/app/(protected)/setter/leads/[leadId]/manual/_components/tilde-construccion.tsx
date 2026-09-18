'use client'

import { useId } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * P42 — EL TILDE ÚNICO de «Construir».
 *
 * Con un prompt único hay una sola cosa que marcar: que la demo quedó
 * construida. Las tres fases de la pantalla siguen existiendo por dentro (son la
 * llave del progreso guardado); este botón las marca y las desmarca juntas, y lo
 * decide el dueño del conjunto (`RegistroFases`), no este componente.
 *
 * La jerarquía es la de lo que significa: arriba y grande, qué afirma el tilde;
 * abajo y chico, cuándo marcarlo. Los tres tildes de antes la tenían invertida
 * —«Marcá esta fase cuando la termines» en grande y el nombre de la fase chico y
 * gris— y con tres filas iguales no se sabía cuál era cuál.
 *
 * El nombre accesible es FIJO («La demo quedó construida») y el estado lo dice
 * `aria-pressed`: un botón de dos estados no cambia de nombre al pulsarse. Cuándo
 * marcarlo va como descripción.
 *
 * `puedeGuardar` espeja la regla del server (`saveOwnedProgreso`: solo en
 * CONSTRUCCION). El motivo del tilde apagado lo dice el grupo, no el botón.
 */
export function TildeConstruccion({
  marcada,
  guardando,
  puedeGuardar,
  onToggle,
}: {
  /** ¿Las tres fases de la pantalla están marcadas? Lo decide el dueño del conjunto. */
  marcada: boolean
  /** ¿Hay una escritura en vuelo? Solo para el spinner. */
  guardando: boolean
  /** false cuando el server va a rechazar el guardado (stage !== CONSTRUCCION). */
  puedeGuardar: boolean
  onToggle: () => void
}) {
  const idNombre = useId()
  const idCuando = useId()
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!puedeGuardar}
      aria-pressed={marcada}
      aria-labelledby={idNombre}
      aria-describedby={idCuando}
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
        {guardando ? (
          <Loader2 size={13} strokeWidth={1.5} className="animate-spin" />
        ) : marcada ? (
          <Check size={14} strokeWidth={1.5} />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span
          id={idNombre}
          className={cn('block text-sm font-semibold', marcada ? 'text-emerald-200' : 'text-zinc-100')}
        >
          La demo quedó construida
        </span>
        <span id={idCuando} className="mt-0.5 block text-xs leading-relaxed text-zinc-400">
          {marcada
            ? 'Marcada como hecha.'
            : 'Marcala cuando Claude Design haya terminado y estén todas las secciones que pediste.'}
        </span>
      </span>
    </button>
  )
}
