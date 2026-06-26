'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PlusCircle, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { sendClientMessageAction } from '@/lib/actions/messages'
import { Modal } from '@/components/ui'

export function VaultRequestModal() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleClose = () => {
    if (isPending) return
    setOpen(false)
    setTimeout(() => {
      setText('')
      setSuccess(false)
      setError(null)
    }, 300)
  }

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
      const result = await sendClientMessageAction(null, formData)
      if (!result.success) {
        setError(result.error ?? 'Ocurrió un error.')
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
        className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400 transition-colors hover:border-cyan-500/35 hover:bg-cyan-500/20"
      >
        <PlusCircle size={14} strokeWidth={1.5} />
        <span className="hidden sm:inline">Solicitar documento</span>
        <span className="sm:hidden">Solicitar</span>
      </button>

      {/* Modal primitivo: portalea a body + backdrop oscurecido/desenfocado estándar */}
      <Modal
        open={open}
        onClose={handleClose}
        title="Solicitar documento"
        description="El equipo de develOP lo subirá a tu bóveda en breve."
        size="sm"
        closeOnBackdrop={!isPending}
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/15">
                <CheckCircle2 size={28} strokeWidth={1.5} className="text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-200">¡Solicitud enviada!</p>
              <p className="max-w-[240px] text-xs text-zinc-500">
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
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-sm text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-500/30 disabled:opacity-50"
              />

              {error && <p className="text-xs font-medium text-red-400">{error}</p>}

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
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} strokeWidth={1.5} />
                  )}
                  Enviar solicitud
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </>
  )
}
