'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface DraftBannerProps {
  savedAt: Date | null
  onContinue: () => void
  onDiscard: () => void
}

export function DraftBanner({ savedAt, onContinue, onDiscard }: DraftBannerProps) {
  if (!savedAt) return null

  return (
    <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-4 mb-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-amber-200">
          Tenés un onboarding sin terminar
        </p>
        <p className="text-xs text-amber-300/70 mt-0.5">
          Guardado {formatDistanceToNow(savedAt, { locale: es, addSuffix: true })}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={onDiscard}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-zinc-300 hover:bg-white/[0.08] transition-colors"
        >
          Descartar
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-xl bg-amber-400/20 border border-amber-400/30 px-4 py-2 text-xs text-amber-100 hover:bg-amber-400/30 transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
