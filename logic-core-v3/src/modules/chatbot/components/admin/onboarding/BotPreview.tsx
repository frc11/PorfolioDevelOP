'use client'

import { motion, AnimatePresence } from 'motion/react'
import type { OnboardingState } from './types'
import { INDUSTRIES_LABELS } from './industries'

interface BotPreviewProps {
  state: OnboardingState
}

const TONE_LABELS: Record<OnboardingState['tone'], string> = {
  informal_rioplatense: 'Informal (vos)',
  formal: 'Formal (usted)',
  neutral: 'Neutral (tú)',
}

const POSITION_LABELS: Record<OnboardingState['position'], string> = {
  bottom_right: 'Abajo derecha',
  bottom_left: 'Abajo izquierda',
}

export function BotPreview({ state }: BotPreviewProps) {
  return (
    <div className="sticky top-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.24em] text-cyan-400">
              Preview en vivo
            </span>
            <span className="text-xs text-zinc-500">
              Se actualiza mientras editás
            </span>
          </div>
        </div>

        {/* Chat simulation */}
        <div className="p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 h-80 relative overflow-hidden">
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="absolute bottom-4 right-4 left-4">
            <div
              className="rounded-3xl border bg-zinc-900/80 backdrop-blur p-4"
              style={{
                borderColor: `${state.accentColor}30`,
              }}
            >
              {/* Bot header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: `${state.accentColor}20` }}
                >
                  🤖
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">
                    {state.botName || 'Tu Bot'}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    {state.orgName || 'Tu Empresa'}
                  </p>
                </div>
              </div>

              {/* Welcome message */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.welcomeMessage || '__empty__'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl bg-white/[0.04] p-3 text-xs text-zinc-300 leading-relaxed"
                >
                  {state.welcomeMessage ||
                    'El mensaje de bienvenida aparecerá acá mientras lo escribís...'}
                </motion.div>
              </AnimatePresence>

              {/* Quick replies */}
              {state.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {state.quickReplies.slice(0, 3).map((reply) => (
                    <span
                      key={reply.id}
                      className="rounded-lg border px-2.5 py-1 text-[10px]"
                      style={{
                        borderColor: `${state.accentColor}40`,
                        color: state.accentColor,
                      }}
                    >
                      {reply.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Config summary */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/50">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">
            Configuración actual
          </p>
          <div className="space-y-1.5 text-xs">
            <ConfigRow label="Bot" value={state.botName || '—'} />
            <ConfigRow label="Empresa" value={state.orgName || '—'} />
            <ConfigRow
              label="Industria"
              value={INDUSTRIES_LABELS[state.industry] ?? state.industry}
            />
            <ConfigRow label="Tono" value={TONE_LABELS[state.tone]} />
            <ConfigRow
              label="Color"
              value={
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-white/10"
                    style={{ backgroundColor: state.accentColor }}
                  />
                  <span className="font-mono text-[10px]">{state.accentColor}</span>
                </span>
              }
            />
            <ConfigRow label="Posición" value={POSITION_LABELS[state.position]} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300">{typeof value === 'string' ? value : value}</span>
    </div>
  )
}
