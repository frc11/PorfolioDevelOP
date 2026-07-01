'use client'

import { useOptimistic, useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { FaseId } from '@/lib/leados/contracts'
import { SHELL_CONSTRUCCION } from '@/lib/leados/flow'
import { guardarProgreso } from '@/app/(protected)/setter/_actions/dossier.actions'

type ChecklistConstruccionProps = {
  leadId: string
  /** Fases ya marcadas como hechas — viene de `progresoJson` (sobrevive refresh). */
  completadas: FaseId[]
}

/**
 * E.2 — El shell de construcción como checklist UNA-A-LA-VEZ (antes: un `<ol>`
 * estático con las 6 fases expandidas, la brecha ALTA de la auditoría §8).
 *
 * REALCE, no colapso (decisión de producto + lección del bloque 3.1): las 6 fases
 * siguen SIEMPRE renderizadas y en orden (nada de `display:none`, el scroll y el
 * StepAnchor quedan intactos). Lo que cambia es la jerarquía visual:
 *   - fase ACTUAL (primera sin tildar) → destacada (marco cyan + lift, patrón del
 *     StepAnchor) y es la ÚNICA que abre sus sub-pasos (los 3 items) — así el muro
 *     de 18 bullets se reduce a los que importan ahora.
 *   - fases HECHAS → check + atenuadas (dim), titulo tachado.
 *   - fases FUTURAS → visibles pero secundarias (titulo + detalle, sin items).
 *
 * Cada fase se tilda tocando su fila (target grande, mobile-friendly), en cualquier
 * orden (auto-reporte editable, fases no lineales). El toggle es optimista
 * (`useOptimistic`) y persiste vía `guardarProgreso → saveOwnedProgreso →
 * progresoJson`. NO es un gate: no toca el self-check ni la transición. Todo es
 * estado de React + server action, sin queries al DOM → la copia responsive
 * (dual-copy) queda respetada por construcción.
 */
export function ChecklistConstruccion({ leadId, completadas }: ChecklistConstruccionProps) {
  const [isPending, startTransition] = useTransition()
  // Base = el prop del server; `useOptimistic` reconcilia solo cuando el
  // `revalidatePath` de la action refresca `completadas` (éxito → nuevo set;
  // error → el prop vuelve intacto). Sin manejar revert a mano.
  const [optimistas, setOptimistas] = useOptimistic<FaseId[], FaseId[]>(
    completadas,
    (_prev, siguiente) => siguiente,
  )
  const hechas = new Set(optimistas)
  // "Una a la vez" = la fase actual es la PRIMERA del shell que aún no está hecha.
  // Derivada de `completadas` (no se persiste aparte) → siempre consistente tras
  // tildar/des-tildar en cualquier orden. `null` = todas hechas (nada destacado).
  const faseActual = SHELL_CONSTRUCCION.find((fase) => !hechas.has(fase.id))?.id ?? null

  const toggle = (faseId: FaseId) => {
    const siguiente = hechas.has(faseId)
      ? optimistas.filter((id) => id !== faseId)
      : [...optimistas, faseId]
    startTransition(async () => {
      setOptimistas(siguiente)
      const result = await guardarProgreso(leadId, { completadas: siguiente })
      if (!result.success) toast.error(result.error)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          Checklist de construcción
        </p>
        <span className="flex items-center gap-1.5 text-[11px] tabular-nums text-zinc-500">
          {isPending && (
            <Loader2 size={11} strokeWidth={1.5} className="animate-spin" aria-hidden />
          )}
          {hechas.size}/{SHELL_CONSTRUCCION.length}
        </span>
      </div>

      <ol className="space-y-2.5">
        {SHELL_CONSTRUCCION.map((fase, index) => {
          const hecha = hechas.has(fase.id)
          const esActual = fase.id === faseActual
          return (
            <li
              key={fase.id}
              aria-current={esActual ? 'step' : undefined}
              className={cn(
                'rounded-xl border p-4 transition-colors',
                esActual
                  ? 'border-cyan-400/30 bg-cyan-500/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
                  : hecha
                    ? 'border-white/[0.05] bg-white/[0.01] opacity-60'
                    : 'border-white/[0.06] bg-white/[0.02]',
              )}
            >
              {/* La fila entera es el toggle: target grande para mobile. El badge
                  queda decorativo (aria-hidden) — el nombre accesible lo da el
                  aria-label del botón. */}
              <button
                type="button"
                onClick={() => toggle(fase.id)}
                aria-pressed={hecha}
                aria-label={
                  hecha ? `Desmarcar «${fase.titulo}»` : `Marcar «${fase.titulo}» como hecha`
                }
                className="group flex w-full items-start gap-3 text-left"
              >
                <span
                  aria-hidden
                  className={cn(
                    'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors',
                    hecha
                      ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                      : esActual
                        ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300 group-hover:bg-cyan-500/25'
                        : 'border-white/15 bg-white/[0.03] text-zinc-500 group-hover:border-white/30 group-hover:text-zinc-300',
                  )}
                >
                  {hecha ? <Check size={12} strokeWidth={1.5} /> : index + 1}
                </span>

                <span className="min-w-0 flex-1 space-y-1">
                  <span
                    className={cn(
                      'block text-sm font-semibold',
                      hecha ? 'text-zinc-400 line-through decoration-zinc-600' : 'text-zinc-200',
                    )}
                  >
                    {fase.titulo}
                  </span>
                  <span className="block text-xs text-zinc-500">{fase.detalle}</span>
                </span>
              </button>

              {/* Los sub-pasos (items) SOLO en la fase actual: es lo que reduce el
                  muro de bullets. Van FUERA del botón (tocarlos no tilda). Las
                  demás fases quedan visibles con su titulo+detalle — NO colapsadas:
                  el StepAnchor no se toca. */}
              {esActual && (
                <ul className="mt-2 space-y-1 pl-8 text-xs leading-relaxed text-zinc-400">
                  {fase.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-cyan-400/60">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
