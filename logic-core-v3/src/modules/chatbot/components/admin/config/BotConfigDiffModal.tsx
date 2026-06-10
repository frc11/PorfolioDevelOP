'use client'

import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { Save, X } from 'lucide-react'
import { useIsClient } from '../useIsClient'
import type { BotConfigEditorState } from './types'

const FIELD_LABELS: Partial<Record<keyof BotConfigEditorState, string>> = {
  botName: 'Nombre del bot',
  isActive: 'Estado',
  industry: 'Industria',
  tone: 'Tono',
  welcomeMessage: 'Mensaje de bienvenida',
  accentColor: 'Color de acento',
  accentSecondary: 'Color secundario',
  chatSurfaceTint: 'Tinte de superficie',
  avatarStyle: 'Estilo de avatar',
  avatarImageUrl: 'URL de imagen',
  avatarEmoji: 'Emoji de avatar',
  borderRadius: 'Bordes',
  surfaceStyle: 'Estilo de superficie',
  position: 'Posición',
  fontStyle: 'Tipografía',
  bubbleStyle: 'Estilo de burbuja',
  intensityLevel: 'Intensidad',
  whatsappNumber: 'WhatsApp',
  whatsappMessage: 'Mensaje de WhatsApp',
  llmProvider: 'Proveedor LLM',
  llmModel: 'Modelo LLM',
  temperature: 'Temperatura',
  maxOutputTokens: 'Tokens máximos',
  monthlyQuota: 'Quota mensual',
  quickReplies: 'Respuestas rápidas',
  proactivePrompts: 'Prompts proactivos',
  routeColorMap: 'Mapa de colores',
  leadNotificationEmail: 'Email de notificación',
  leadNotificationMode: 'Modo de notificación',
}

const SKIP_FIELDS = new Set<keyof BotConfigEditorState>(['botConfigId'])

function formatValue(value: BotConfigEditorState[keyof BotConfigEditorState]): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Activo' : 'Inactivo'
  if (typeof value === 'string') return value || '—'
  if (typeof value === 'number') return String(value)
  return JSON.stringify(value, null, 2)
}

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  before: BotConfigEditorState
  after: BotConfigEditorState
  loading: boolean
}

export function BotConfigDiffModal({ open, onClose, onConfirm, before, after, loading }: Props) {
  // Gate de hidratación: montar el portal solo en cliente (evita document en SSR y mismatch).
  const mounted = useIsClient()
  if (!mounted) return null

  const changedKeys = (Object.keys(after) as (keyof BotConfigEditorState)[]).filter(
    key => !SKIP_FIELDS.has(key) && JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  )

  // createPortal envuelve a AnimatePresence (NO al revés): AnimatePresence.onlyElements() filtra sus
  // children con React.isValidElement, y un portal NO es un element (es react.portal) → lo descartaba y
  // el modal nunca montaba. Con AnimatePresence adentro y un <motion.div> como hijo (sí element), enter y
  // exit funcionan. El portal va a <body> para escapar del backdrop-filter del <main> admin (que atrapa
  // position:fixed); queda montado siempre (gate `mounted`), el `open` vive DENTRO → el exit no se corta.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Confirmar cambios</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {changedKeys.length} campo{changedKeys.length !== 1 ? 's' : ''} modificado
                  {changedKeys.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 hover:bg-white/[0.05]"
              >
                <X className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {changedKeys.length === 0 ? (
                <p className="text-center text-sm italic text-zinc-500">
                  No hay cambios para guardar
                </p>
              ) : (
                changedKeys.map(key => (
                  <div key={key} className="rounded-xl border border-white/10 p-3">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                      {FIELD_LABELS[key] ?? key}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="mb-1 text-[10px] text-red-400">ANTES</p>
                        <p className="break-all whitespace-pre-wrap text-zinc-400 line-through opacity-70">
                          {formatValue(before[key])}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] text-emerald-400">DESPUÉS</p>
                        <p className="break-all whitespace-pre-wrap text-zinc-100">
                          {formatValue(after[key])}
                        </p>
                      </div>
                    </div>
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
                Volver al editor
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading || changedKeys.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-cyan-300 disabled:opacity-50"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} />
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
