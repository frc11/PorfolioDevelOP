'use client'

import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FaseId } from '@/lib/leados/contracts'

/**
 * El tilde de auto-reporte de UNA fase. Desde el corte 5.6 esta es la única
 * presentación; desde P6-B se renderizan TRES por pantalla (mc1/mc2) — uno por
 * fase, 1↔1 con su `FaseId`, así el progreso persistido no cambia de forma. La
 * explicación del auto-reporte la sirve el grupo (`ConstruccionRegistro`) una
 * sola vez, no cada tilde.
 *
 * NO es un gate (§6-3 del brief): tildar no bloquea nada ni hace avanzar —
 * `progresoJson` jamás se cablea a la transición. El único gate de Construcción
 * es el chequeo final (M14).
 *
 * P25 — PRESENTACIONAL. Antes cada tilde era su propio escritor: llamaba
 * `guardarProgreso` reconstruyendo el set completo desde la prop `completadas`
 * del server, que es la MISMA para los tres y solo se refresca al volver el
 * `router.refresh()`. Tres clics dentro de esa ventana calculaban sobre la misma
 * base vieja y la última escritura pisaba a las otras: 3 clics → 1 marca.
 * Ahora el dueño del blob es UNO solo (`ConstruccionTildes`, el patrón del
 * chequeo final) y este componente no escribe ni conoce el `leadId`: recibe si
 * está marcada y avisa el toggle. El markup, los aria y las clases quedan
 * IDÉNTICOS — este sprint no cambia una sola pantalla.
 *
 * `puedeGuardar` (3.3, B-07): el server (`saveOwnedProgreso`, dossier.ts) YA
 * rechaza el guardado fuera de `stage === 'CONSTRUCCION'`. Acá se ESPEJA esa
 * regla, no se agrega una nueva: no bloquea nada fuera del submit del tilde
 * (navegación, lectura y el resto de la pantalla siguen intactos) y sigue sin
 * ser un gate.
 */
export function FaseAutoReporte({
  faseId,
  titulo,
  marcada,
  guardando = false,
  puedeGuardar = true,
  motivo,
  onToggle,
}: {
  faseId: FaseId
  titulo: string
  /** Estado vivo del dueño del blob — no una derivación de la prop del server. */
  marcada: boolean
  /** Hay un guardado en vuelo que incluye ESTA fase. */
  guardando?: boolean
  /** false cuando el server va a rechazar el guardado (stage !== CONSTRUCCION). */
  puedeGuardar?: boolean
  /** Motivo corto a mostrar cuando `puedeGuardar` es false. */
  motivo?: string
  onToggle: (faseId: FaseId) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(faseId)}
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
        {guardando ? (
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
        {!puedeGuardar && motivo && (
          <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">{motivo}</span>
        )}
      </span>
    </button>
  )
}
