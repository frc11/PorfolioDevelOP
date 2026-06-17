'use client'

import { type MouseEvent, type ReactNode } from 'react'
import { LoaderCircle, TriangleAlert, X } from 'lucide-react'

type InlineConfirmProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmLabel: string
  isPending?: boolean
}

// Confirmación de borrado LOCAL y anclada: overlay absolute inset-0 → el blur del
// fondo queda SOLO sobre la card/sección contenedora (que debe ser
// position:relative), no tapa toda la pantalla. Estilo "cartel" (TriangleAlert +
// botón X). Compartida por Leads y Proyectos. NO reemplaza al ConfirmDialog
// fullscreen, que siguen usando otros consumidores (bot, bulk, impersonate).
export function InlineConfirm({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  isPending = false,
}: InlineConfirmProps) {
  if (!open) {
    return null
  }

  const stop = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div
      onClick={(event) => {
        stop(event)
        if (!isPending) onClose()
      }}
      // stopPropagation del pointerdown: si la card contenedora es draggable
      // (dnd-kit), evita que tocar el overlay inicie un drag.
      onPointerDown={(event) => event.stopPropagation()}
      className="absolute inset-0 z-20 flex items-center justify-center rounded-[26px] bg-[#05070a]/85 p-4 backdrop-blur-xl"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={stop}
        className="w-full max-w-[300px] rounded-2xl border border-white/10 bg-[#0c1016]/95 p-4 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
              <TriangleAlert className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1.5 text-sm leading-6 text-zinc-300">{description}</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar"
            disabled={isPending}
            onClick={(event) => {
              stop(event)
              onClose()
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={(event) => {
              stop(event)
              onClose()
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={(event) => {
              stop(event)
              onConfirm()
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-100 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
