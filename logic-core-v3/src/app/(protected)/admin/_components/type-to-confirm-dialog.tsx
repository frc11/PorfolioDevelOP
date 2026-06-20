'use client'

import { type ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'
import { LoaderCircle, TriangleAlert, X } from 'lucide-react'

import { useIsClient } from '@/lib/use-is-client'

// Confirmación de acción DESTRUCTIVA e irreversible: además del cartel, exige
// escribir una frase exacta (ej. "ELIMINAR") para habilitar el botón. Fullscreen
// (portal a body), estilo danger. Montar condicionalmente (`{open && <Dialog/>}`)
// para que el input se resetee en cada apertura sin un effect.
type TypeToConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmPhrase: string
  confirmLabel: string
  isPending?: boolean
}

export function TypeToConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmPhrase,
  confirmLabel,
  isPending = false,
}: TypeToConfirmDialogProps) {
  const mounted = useIsClient()
  const [typed, setTyped] = useState('')

  if (!open || !mounted) {
    return null
  }

  const matches = typed.trim() === confirmPhrase

  return createPortal(
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md"
      onClick={isPending ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md overflow-hidden rounded-[28px] border border-rose-400/20 bg-[#0c1016]/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-200">
              <TriangleAlert className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">{title}</p>
              <div className="mt-2 text-sm leading-6 text-zinc-400">{description}</div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar"
            disabled={isPending}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-xs text-zinc-400">
            Escribí{' '}
            <span className="font-mono font-semibold text-rose-200">{confirmPhrase}</span>{' '}
            para confirmar
          </label>
          <input
            type="text"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            disabled={isPending}
            autoComplete="off"
            spellCheck={false}
            aria-label={`Escribí ${confirmPhrase} para confirmar`}
            placeholder={confirmPhrase}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-rose-400/40 focus:outline-none disabled:opacity-60"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isPending || !matches}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/15 px-4 py-2.5 text-sm font-medium text-rose-100 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : null}
            <span>{isPending ? 'Eliminando...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
