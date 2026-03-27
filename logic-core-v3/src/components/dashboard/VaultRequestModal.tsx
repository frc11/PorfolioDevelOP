'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, X, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { sendClientMessageAction } from '@/lib/actions/messages'

export function VaultRequestModal() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleClose = useCallback(() => {
    if (isPending) return
    setOpen(false)
    setTimeout(() => {
      setText('')
      setSuccess(false)
      setError(null)
    }, 300)
  }, [isPending])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, handleClose])

  // Focus textarea on open
  useEffect(() => {
    if (open && !success) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 150)
      return () => clearTimeout(timer)
    }
  }, [open, success])

  const handleSubmit = () => {
    if (!text.trim() || isPending) return
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append(
        'content',
        `📁 Solicitud de documento/recurso desde la Bóveda:\n\n${text.trim()}`
      )
      const err = await sendClientMessageAction(null, formData)
      if (err) {
        setError(err)
      } else {
        setSuccess(true)
        setTimeout(handleClose, 2800)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-cyan-400 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/35 active:scale-95 flex-shrink-0"
      >
        <PlusCircle size={14} />
        <span className="hidden sm:inline">Solicitar documento</span>
        <span className="sm:hidden">Solicitar</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="vault-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              key="vault-modal"
              initial={{ opacity: 0, scale: 0.93, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1,   y: 0,  filter: 'blur(0px)' }}
              exit={  { opacity: 0, scale: 0.96, y: 12, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0d0f13] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
            >
              {/* Header */}
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white">Solicitar documento</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    El equipo de develOP lo subirá a tu bóveda en breve.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isPending}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-40"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="flex flex-col items-center gap-3 py-8 text-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/25">
                      <CheckCircle2 size={28} className="text-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-200">¡Solicitud enviada!</p>
                    <p className="text-xs text-zinc-500 max-w-[240px]">
                      El equipo de develOP lo procesará a la brevedad.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-4"
                  >
                    <textarea
                      ref={textareaRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={isPending}
                      rows={4}
                      placeholder="Ej: Necesito las credenciales de acceso al hosting, el logo en formato SVG y el brandbook actualizado..."
                      className="w-full resize-none rounded-xl border border-white/5 bg-black/30 p-3.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition-all focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50"
                    />

                    {error && (
                      <p className="text-xs text-red-400 font-medium">{error}</p>
                    )}

                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={handleClose}
                        disabled={isPending}
                        className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-40"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isPending || !text.trim()}
                        className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                      >
                        {isPending ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Send size={13} />
                        )}
                        Enviar solicitud
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
