'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Save, X } from 'lucide-react'
import { DiffViewer } from './DiffViewer'

interface SaveConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  oldKB: Record<string, string>
  newKB: Record<string, string>
  sectionLabels: Record<string, string>
  loading: boolean
}

export function SaveConfirmModal({
  open,
  onClose,
  onConfirm,
  oldKB,
  newKB,
  sectionLabels,
  loading,
}: SaveConfirmModalProps) {
  const changedSections = Object.keys(newKB).filter((key) => oldKB[key] !== newKB[key])

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
            className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  Confirmar cambios en KB
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {changedSections.length} seccion{changedSections.length !== 1 ? 'es' : ''} modificada{changedSections.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/[0.05]">
                <X className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {changedSections.length === 0 ? (
                <p className="text-center text-sm italic text-zinc-500">
                  No hay cambios para guardar
                </p>
              ) : (
                changedSections.map((key) => (
                  <div key={key}>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-cyan-400">
                      {sectionLabels[key] ?? key}
                    </p>
                    <DiffViewer oldValue={oldKB[key] ?? ''} newValue={newKB[key] ?? ''} />
                  </div>
                ))
              )}
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
                disabled={loading || changedSections.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-cyan-300 disabled:opacity-50"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} />
                {loading ? 'Guardando...' : 'Confirmar y guardar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
