import type { DossierStage } from '@prisma/client'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

type PasoEstado = 'hecho' | 'actual' | 'pendiente' | 'bloqueado'

// B4: los cinco pasos del flujo ya existen (3 wizard B3 + construcción B4 +
// revisión B5) — se acabaron los "próximo bloque".
const PASOS = ['Ficha', 'Evaluación', 'Brief', 'Construcción', 'Revisión'] as const

/**
 * Índice del paso "actual" según el stage del dossier. El `stage` nombra el hito
 * cumplido; el índice apunta al SIGUIENTE paso accionable. Fuente única de "dónde
 * está el lead" — la reusa el aterrizaje al abrir (`step-anchor`) para no re-derivar
 * el flujo ni tocar gates.
 */
export function pasoActual(stage: DossierStage | null): number {
  switch (stage) {
    case null:
    case 'FICHA':
      return 0
    case 'EVALUADA':
    case 'DESCARTADA':
      return 2
    case 'BRIEF':
    case 'CONSTRUCCION':
    case 'RECHAZADA':
      return 3
    case 'EN_REVISION':
      return 4
    case 'APROBADA':
      return 5
  }
}

export function DossierStepper({ stage }: { stage: DossierStage | null }) {
  const actual = pasoActual(stage)
  const descartado = stage === 'DESCARTADA'

  return (
    <ol className="flex items-start gap-1 overflow-x-auto pb-1" aria-label="Pasos del dossier">
      {PASOS.map((paso, index) => {
        const estado: PasoEstado = descartado
          ? index < 2
            ? 'hecho'
            : 'bloqueado'
          : index < actual
            ? 'hecho'
            : index === actual
              ? 'actual'
              : 'pendiente'

        return (
          <li key={paso} className="flex min-w-max flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  'h-px flex-1',
                  index === 0 ? 'bg-transparent' : estado === 'hecho' || estado === 'actual' ? 'bg-cyan-500/40' : 'bg-white/10',
                )}
              />
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                  estado === 'hecho' && 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300',
                  // El paso actual se ELEVA sobre el rail: sombra + un ring del
                  // color del fondo que abre un hueco contra las líneas conectoras
                  // (contraste de superficie, sin sumar color).
                  estado === 'actual' &&
                    'border-cyan-400 bg-cyan-400 text-zinc-950 shadow-[0_4px_12px_rgba(0,0,0,0.5)] ring-2 ring-[var(--color-void)]',
                  estado === 'pendiente' && 'border-white/10 bg-white/[0.03] text-zinc-500',
                  estado === 'bloqueado' && 'border-white/[0.06] bg-transparent text-zinc-700',
                )}
              >
                {estado === 'hecho' ? (
                  <Check size={13} strokeWidth={2} />
                ) : estado === 'bloqueado' ? (
                  <Lock size={11} strokeWidth={1.5} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  'h-px flex-1',
                  index === PASOS.length - 1 ? 'bg-transparent' : estado === 'hecho' ? 'bg-cyan-500/40' : 'bg-white/10',
                )}
              />
            </div>
            <span
              className={cn(
                'whitespace-nowrap px-1 text-[10px] font-medium uppercase tracking-wider',
                estado === 'actual'
                  ? 'text-cyan-300'
                  : estado === 'hecho'
                    ? 'text-zinc-400'
                    : 'text-zinc-600',
              )}
            >
              {paso}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
