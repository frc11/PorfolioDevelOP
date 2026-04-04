'use client'

import { LoaderCircle, TriangleAlert, X } from 'lucide-react'

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel: string
  variant?: 'danger' | 'default'
  isPending?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  variant = 'default',
  isPending = false,
}: ConfirmDialogProps) {
  if (!open) {
    return null
  }

  const confirmClassName =
    variant === 'danger'
      ? 'border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15'
      : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15'

  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md"
      onClick={isPending ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0c1016]/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-200">
              <TriangleAlert className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={[
              'inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              confirmClassName,
            ].join(' ')}
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            <span>{isPending ? 'Procesando...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
