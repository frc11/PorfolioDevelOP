'use client'

import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, Check, X, Zap } from 'lucide-react'
import type { PreflightCheck } from '@/modules/chatbot/server/admin/preflightChecks'

interface ActivationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  checks: PreflightCheck[]
  loading: boolean
  botName: string
  botSlug: string
}

export function ActivationModal({
  open,
  onClose,
  onConfirm,
  checks,
  loading,
  botName,
  botSlug,
}: ActivationModalProps) {
  const failures = checks.filter((check) => check.status === 'fail')
  const warnings = checks.filter((check) => check.status === 'warn')
  const canActivate = failures.length === 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-400/15 p-2">
                  <Zap className="h-5 w-5 text-cyan-300" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Activar bot
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {botName} · <span className="font-mono">{botSlug}</span>
                  </p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/[0.05]">
                <X className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6">
              <p className="mb-4 text-sm text-zinc-300">
                Verifica que todo este correcto antes de activar:
              </p>

              <div className="mb-6 space-y-2">
                {checks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </div>

              {!canActivate && (
                <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
                  <p className="mb-1 text-sm font-medium text-red-200">
                    No se puede activar todavia
                  </p>
                  <p className="text-xs text-red-300/80">
                    Resolve los items marcados como error antes de continuar
                  </p>
                </div>
              )}

              {canActivate && warnings.length > 0 && (
                <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
                  <p className="mb-1 text-sm font-medium text-amber-200">
                    {warnings.length} warning{warnings.length !== 1 ? 's' : ''} no criticas
                  </p>
                  <p className="text-xs text-amber-300/80">
                    Podes activar igual, pero idealmente resolvelas
                  </p>
                </div>
              )}

              {canActivate && warnings.length === 0 && (
                <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-200">
                    Todo listo para activar
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs text-zinc-500">
                  Al activar, el bot empezara a responder consultas en produccion.
                  Las conversaciones contaran contra la quota mensual del cliente.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 p-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.08] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!canActivate || loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap className="h-4 w-4" strokeWidth={1.5} />
                {loading ? 'Activando...' : 'Activar bot'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CheckRow({ check }: { check: PreflightCheck }) {
  const config = {
    pass: { Icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-400/20' },
    warn: { Icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/[0.06]', border: 'border-amber-400/20' },
    fail: { Icon: X, color: 'text-red-400', bg: 'bg-red-500/[0.06]', border: 'border-red-400/30' },
  }[check.status]

  const Icon = config.Icon

  return (
    <div className={`flex items-start gap-3 rounded-xl border ${config.border} ${config.bg} p-3`}>
      <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${config.color}`} strokeWidth={2} />
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-200">{check.label}</p>
        <p className="mt-0.5 text-xs text-zinc-400">{check.message}</p>
        {check.hint && (
          <p className="mt-1 text-xs italic text-zinc-500">{check.hint}</p>
        )}
      </div>
    </div>
  )
}
