'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquarePlus, AlertCircle, Loader2 } from 'lucide-react'
import * as z from 'zod'
import { createTicketAction } from '@/actions/ticket-actions'
import { TicketCategory, TicketPriority } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const ticketSchema = z.object({
  title: z.string().min(5, 'El titulo debe tener al menos 5 caracteres.'),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
  message: z.string().min(10, 'Describe tu problema con mas detalle (min. 10 caracteres).'),
})

type TicketValues = z.infer<typeof ticketSchema>

export function NewTicketModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TicketValues, string>>>({})
  const router = useRouter()

  const handleSubmit = async (formElement: HTMLFormElement) => {
    const formData = new FormData(formElement)
    const rawData: TicketValues = {
      title: String(formData.get('title') ?? ''),
      category: ((formData.get('category') as TicketCategory | null) ?? 'TECHNICAL') as TicketCategory,
      priority: ((formData.get('priority') as TicketPriority | null) ?? 'MEDIUM') as TicketPriority,
      message: String(formData.get('message') ?? ''),
    }

    const parsed = ticketSchema.safeParse(rawData)
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof TicketValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof TicketValues | undefined
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setErrorMsg('')
    setIsSubmitting(true)

    const res = await createTicketAction(parsed.data)

    setIsSubmitting(false)

    if (res.success && res.data && typeof res.data === 'object' && 'ticketId' in res.data) {
      setIsOpen(false)
      formElement.reset()
      toast.success('Ticket creado exitosamente')
      router.push(`/dashboard/soporte/${res.data.ticketId}`)
      return
    }

    setErrorMsg(res.error || 'Ocurrio un error.')
    toast.error(res.error || 'No se pudo crear el ticket')
  }

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        variants={{
          hover: { scale: 1.05 },
        }}
        className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110"
      >
        <motion.div
          variants={{
            hover: { rotate: 90 },
          }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <MessageSquarePlus size={18} />
        </motion.div>
        <span>Abrir Nuevo Ticket</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[35deg] -translate-x-full group-hover:animate-[shine_1.5s_infinite]" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <MessageSquarePlus className="text-cyan-400" size={20} />
                  Crear Ticket de Soporte
                </h2>
                <button
                  onClick={() => !isSubmitting && setIsOpen(false)}
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form
                  onSubmit={async (event) => {
                    event.preventDefault()
                    await handleSubmit(event.currentTarget)
                  }}
                  className="space-y-4"
                >
                  {errorMsg && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Asunto
                    </label>
                    <input
                      name="title"
                      className="w-full rounded-lg border border-white/10 bg-[#080a0c] px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder="Ej: Problema con la carga del sitio web"
                    />
                    {fieldErrors.title && <p className="mt-1 text-xs text-red-400">{fieldErrors.title}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Categoria
                      </label>
                      <select
                        name="category"
                        defaultValue="TECHNICAL"
                        className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#080a0c] px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="TECHNICAL">Soporte Tecnico</option>
                        <option value="BILLING">Facturacion</option>
                        <option value="FEATURE_REQUEST">Nuevo Requerimiento</option>
                        <option value="OTHER">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Prioridad
                      </label>
                      <select
                        name="priority"
                        defaultValue="MEDIUM"
                        className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#080a0c] px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="LOW">Baja (Mantenimiento)</option>
                        <option value="MEDIUM">Media (Estandar)</option>
                        <option value="HIGH">Alta (Bloqueante)</option>
                        <option value="URGENT">Urgente (Critico)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Descripcion Detallada
                    </label>
                    <textarea
                      name="message"
                      className="h-32 w-full resize-none rounded-lg border border-white/10 bg-[#080a0c] px-4 py-3 text-sm text-zinc-300 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder="Explica el contexto. Nuestro equipo asincrono lo evaluara a fondo..."
                    />
                    {fieldErrors.message && (
                      <p className="mt-1 text-xs text-red-400">{fieldErrors.message}</p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
                    <button
                      type="button"
                      onClick={() => !isSubmitting && setIsOpen(false)}
                      className="px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-black shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Abrir Ticket'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
