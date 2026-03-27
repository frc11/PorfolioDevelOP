'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sendClientMessageAction } from '@/lib/actions/messages'
import { X, Megaphone, Send, CheckCircle2 } from 'lucide-react'
import type { ActionResult } from '@/lib/actions/schemas'

const OVERLAY = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
}

const MODAL = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: { type: 'spring' as const, stiffness: 280, damping: 24 },
}

export function CampaignRequestModal() {
  const [open, setOpen] = useState(false)
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false)
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(sendClientMessageAction, null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isSuccess = hasSubmittedOnce && !pending && state?.success

  // Auto-close after success
  useEffect(() => {
    if (!isSuccess) return
    const t = setTimeout(() => {
      setOpen(false)
      setHasSubmittedOnce(false)
    }, 1800)
    return () => clearTimeout(t)
  }, [isSuccess])

  // Focus textarea when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-cyan-400 active:scale-[0.97]"
      >
        <Megaphone size={15} />
        Solicitar nueva campaña
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            {...OVERLAY}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              {...MODAL}
              className="w-full max-w-lg rounded-2xl border border-white/[0.08] p-6"
              style={{
                background: 'rgba(14,18,22,0.95)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
              }}
            >
              {/* Header */}
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                    <Megaphone size={16} className="text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Solicitar nueva campaña</h2>
                    <p className="text-xs text-zinc-500">El equipo de develOP la va a crear para vos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Success state */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-8 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 size={24} className="text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-white">¡Solicitud enviada!</p>
                  <p className="text-xs text-zinc-500">El equipo te va a contactar a la brevedad.</p>
                </motion.div>
              ) : (
                <form
                  action={formAction}
                  onSubmit={() => setHasSubmittedOnce(true)}
                >
                  {/* Prefixed content — the textarea will be named 'content' but we prepend context */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-medium text-zinc-400">
                      Describí la campaña que necesitás
                    </label>
                    <textarea
                      ref={textareaRef}
                      name="content"
                      required
                      rows={5}
                      placeholder="Ej: Quiero una campaña de email para reactivar clientes que no compraron en los últimos 3 meses. Incluir oferta especial del 20% de descuento..."
                      className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
                    />

                    {/* Error */}
                    {hasSubmittedOnce && state?.error && (
                      <p className="text-xs text-red-400">{state.error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={pending}
                        className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-cyan-400 disabled:opacity-60 active:scale-[0.97]"
                      >
                        <Send size={13} />
                        {pending ? 'Enviando…' : 'Enviar solicitud'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
