'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { approveTaskAction, rejectTaskAction } from '@/actions/dashboard-actions'
import { Check, X, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function TaskApprovalButtons({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<'idle' | 'approve-confirm' | 'reject-form'>('idle')
  const [reason, setReason] = useState('')

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveTaskAction(taskId)
      if (result.success) {
        toast.success('Entregable aprobado correctamente')
      } else {
        toast.error(result.error || 'Error al aprobar el entregable')
      }
    })
  }

  const handleReject = () => {
    if (!reason.trim()) return

    startTransition(async () => {
      const result = await rejectTaskAction(taskId, reason)
      if (result.success) {
        setMode('idle')
        toast.success('Cambios solicitados enviados a develOP')
      } else {
        toast.error(result.error || 'Ocurrió un error al enviar tu solicitud')
      }
    })
  }

  return (
    <div className="mt-4 overflow-hidden">
      <AnimatePresence mode="wait">

        {/* ── Approve confirmation ── */}
        {mode === 'approve-confirm' && (
          <motion.div
            key="approve-confirm"
            initial={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 shadow-[0_0_15px_rgba(16,185,129,0.05)] backdrop-blur-sm"
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-emerald-400" />
              <p className="text-xs font-medium text-zinc-300">
                ¿Confirmás que la entrega está ok?
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMode('idle')}
                disabled={isPending}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25 disabled:opacity-50 border border-emerald-500/25"
              >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Sí, confirmar
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Reject form ── */}
        {mode === 'reject-form' && (
          <motion.div
            key="reject-form"
            initial={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-zinc-900/40 p-3 shadow-[0_0_15px_rgba(245,158,11,0.05)] backdrop-blur-sm"
          >
            <label className="text-xs font-medium text-zinc-400">¿Qué cambios necesitás?</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[72px] w-full resize-none rounded-lg border border-white/5 bg-black/20 p-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              placeholder="Ej: Faltan agregar dos secciones en la página de inicio..."
              disabled={isPending}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => { setMode('idle'); setReason('') }}
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
                Enviar solicitud
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Default action buttons ── */}
        {mode === 'idle' && (
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
              onClick={() => setMode('approve-confirm')}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300 disabled:opacity-50 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
            >
              <Check size={14} />
              Aprobar entrega
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 16px rgba(245, 158, 11, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('reject-form')}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs font-medium text-amber-500/80 transition-all hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
            >
              <X size={14} />
              Solicitar cambios
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
