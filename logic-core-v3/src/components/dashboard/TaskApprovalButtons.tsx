'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { approveTaskAction, rejectTaskAction } from '@/actions/dashboard-actions'
import { Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function TaskApprovalButtons({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition()
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [reason, setReason] = useState('')

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveTaskAction(taskId)
        toast.success('Entregable aprobado correctamente')
      } catch (error) {
        toast.error('Error al aprobar el entregable')
        console.error(error)
      }
    })
  }

  const handleReject = () => {
    if (!reason.trim()) return

    startTransition(async () => {
      try {
        await rejectTaskAction(taskId, reason)
        setShowRejectInput(false)
        toast.success('Cambios solicitados enviados a develOP')
      } catch (error) {
        toast.error('Ocurrió un error al enviar tu solicitud')
        console.error(error)
      }
    })
  }

  return (
    <div className="mt-4 overflow-hidden">
      <AnimatePresence mode="wait">
        {showRejectInput ? (
          <motion.div
            key="reject-form"
            initial={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-zinc-900/40 p-3 shadow-[0_0_15px_rgba(245,158,11,0.05)] backdrop-blur-sm"
          >
            <label className="text-xs font-medium text-zinc-400">Motivo de rechazo o cambios solicitados:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[60px] w-full resize-none rounded-lg border border-white/5 bg-black/20 p-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              placeholder="Ej: Faltan agregar dos secciones..."
              disabled={isPending}
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setShowRejectInput(false)}
                disabled={isPending}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReject}
                disabled={isPending || !reason.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500 transition-all hover:bg-amber-500/20 disabled:opacity-50 border border-amber-500/20"
              >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                Enviar Rechazo
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApprove}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300 disabled:opacity-50 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
            >
              {isPending && !showRejectInput ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Aprobar Avance
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 16px rgba(245, 158, 11, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRejectInput(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs font-medium text-amber-500/80 transition-all hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
            >
              <X size={14} />
              Rechazar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
