'use client'

import type { ReactNode } from 'react'
import { Check, CloudOff } from 'lucide-react'
import { Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { AutosavePhase } from '@/lib/use-autosave'

type AutosaveStatusProps = {
  phase: AutosavePhase
  isDirty: boolean
  /** El guardado manual (botón) también debe leerse como "guardando". */
  busy?: boolean
  className?: string
}

type Visual = { icon: ReactNode; label: string; tone: string }

function resolveVisual(phase: AutosavePhase, isDirty: boolean, saving: boolean): Visual | null {
  if (saving) {
    return { icon: <Spinner size="xs" />, label: 'Guardando…', tone: 'text-zinc-500' }
  }
  if (phase === 'error') {
    return {
      icon: <CloudOff size={12} strokeWidth={1.5} aria-hidden />,
      label: 'No se pudo guardar — tocá «Guardar»',
      tone: 'text-amber-300',
    }
  }
  if (isDirty) {
    return {
      icon: <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" aria-hidden />,
      label: 'Sin guardar',
      tone: 'text-zinc-500',
    }
  }
  if (phase === 'saved') {
    return { icon: <Check size={12} strokeWidth={1.5} aria-hidden />, label: 'Guardado', tone: 'text-emerald-400' }
  }
  return null
}

/**
 * Indicador sutil de estado de guardado para los forms del setter. Lee del hook
 * `useAutosave` (`phase` + `isDirty`) y, opcionalmente, del guardado manual en
 * curso (`busy`). Silencioso cuando no hay nada que decir (idle + limpio).
 */
export function AutosaveStatus({ phase, isDirty, busy = false, className }: AutosaveStatusProps) {
  const visual = resolveVisual(phase, isDirty, busy || phase === 'saving')
  if (!visual) return null

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium', visual.tone, className)}
      role="status"
      aria-live="polite"
    >
      {visual.icon}
      {visual.label}
    </span>
  )
}
