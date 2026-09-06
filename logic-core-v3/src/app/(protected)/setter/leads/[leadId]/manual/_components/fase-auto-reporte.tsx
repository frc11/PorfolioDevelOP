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
 * ── P25: esto es PRESENTACIÓN, ya no un escritor ─────────────────────────────
 * Hasta acá cada tilde tenía su propio `useOptimistic` + su propia llamada a
 * `guardarProgreso`, y componía el conjunto a persistir desde la prop
 * `completadas` del server. Con tres tildes leyendo la MISMA prop, tres clics
 * seguidos escribían tres veces la misma base vieja y quedaba una marca de tres.
 *
 * El estado y la escritura viven ahora en `RegistroFases`, uno solo para las
 * fases de la pantalla — mismo reparto que el chequeo final, donde el form es
 * dueño de la grilla y cada `Toggle` solo avisa. Este componente recibe
 * `marcada` y devuelve `onToggle`: no sabe qué se persiste ni cuándo, y por eso
 * no puede volver a competir consigo mismo.
 *
 * `puedeGuardar` (3.3, B-07): el server (`saveOwnedProgreso`, dossier.ts) YA
 * rechaza el guardado fuera de `stage === 'CONSTRUCCION'`. Acá se ESPEJA esa
 * regla, no se agrega una nueva — evita el viaje redondo con un toast de error.
 *
 * El MOTIVO de por qué el tilde está apagado NO vive acá: iba dentro del
 * `<button>`, y el de RECHAZADA nombra otra pantalla («Correcciones») que ahí
 * adentro no se puede enlazar —un `<a>` dentro de un `<button>` no es
 * navegable—. Lo sirve `MotivoDelTilde` (m-construccion.tsx), una vez arriba del
 * grupo y con el destino enlazado. No vuelve.
 */
export function FaseAutoReporte({
  faseId,
  titulo,
  marcada,
  guardando,
  puedeGuardar = true,
  onToggle,
}: {
  faseId: FaseId
  titulo: string
  /** ¿Esta fase está tildada? Lo decide el dueño del conjunto, no este botón. */
  marcada: boolean
  /** ¿Hay una escritura en vuelo disparada por ESTE tilde? Solo para el spinner. */
  guardando: boolean
  /** false cuando el server va a rechazar el guardado (stage !== CONSTRUCCION). */
  puedeGuardar?: boolean
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
      </span>
    </button>
  )
}
