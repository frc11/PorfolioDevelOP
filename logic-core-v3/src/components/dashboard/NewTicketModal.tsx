'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquarePlus, AlertCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createTicketAction } from '@/actions/ticket-actions'
import { TicketCategory, TicketPriority } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const ticketSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres.'),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
  message: z.string().min(10, 'Describe tu problema con más detalle (mín. 10 caracteres).'),
})

type TicketValues = z.infer<typeof ticketSchema>

export function NewTicketModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TicketValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: 'TECHNICAL',
      priority: 'MEDIUM',
    }
  })

  const onSubmit = async (data: TicketValues) => {
    setIsSubmitting(true)
    setErrorMsg('')
    const res = await createTicketAction(data)
    setIsSubmitting(false)

    if (res.success && res.ticketId) {
      setIsOpen(false)
      reset()
      toast.success('Ticket creado exitosamente')
      router.push(`/dashboard/soporte/${res.ticketId}`)
    } else {
      setErrorMsg(res.error || 'Ocurrió un error.')
      toast.error(res.error || 'No se pudo crear el ticket')
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        variants={{
          hover: { scale: 1.05 }
        }}
        className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110"
      >
        <motion.div
          variants={{
            hover: { rotate: 90 }
          }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <MessageSquarePlus size={18} />
        </motion.div>
        <span>Abrir Nuevo Ticket</span>
        
        {/* Subtle Shine Reflection */}
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
              className="relative w-full max-w-lg bg-[#0c0e12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus className="text-cyan-400" size={20} />
                  Crear Ticket de Soporte
                </h2>
                <button
                  onClick={() => !isSubmitting && setIsOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Asunto</label>
                    <input 
                      {...register('title')} 
                      className="w-full bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" 
                      placeholder="Ej: Problema con la carga del sitio web" 
                    />
                    {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Categoría</label>
                      <select {...register('category')} className="w-full bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer">
                        <option value="TECHNICAL">Soporte Técnico</option>
                        <option value="BILLING">Facturación</option>
                        <option value="FEATURE_REQUEST">Nuevo Requerimiento</option>
                        <option value="OTHER">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Prioridad</label>
                      <select {...register('priority')} className="w-full bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer">
                        <option value="LOW">Baja (Mantenimiento)</option>
                        <option value="MEDIUM">Media (Estándar)</option>
                        <option value="HIGH">Alta (Bloqueante)</option>
                        <option value="URGENT">Urgente (Crítico)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Descripción Detallada</label>
                    <textarea 
                      {...register('message')} 
                      className="w-full h-32 resize-none bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" 
                      placeholder="Explica el contexto. Nuestro equipo asíncrono lo evaluará a fondo..." 
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                    <button
                      type="button"
                      onClick={() => !isSubmitting && setIsOpen(false)}
                      className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-2.5 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
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
