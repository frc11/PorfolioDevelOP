'use client'

import type { BotConfigEditorState } from './types'

interface BotConfigPreviewProps {
  state: BotConfigEditorState
}

export function BotConfigPreview({ state }: BotConfigPreviewProps) {
  const radius = state.borderRadius === 'small' ? '12px' : state.borderRadius === 'large' ? '32px' : '24px'
  const bubbleRadius = state.bubbleStyle === 'sharp' ? '8px' : state.bubbleStyle === 'pill' ? '999px' : '18px'
  const surfaceOpacity = state.intensityLevel === 'LOW' ? '0.72' : state.intensityLevel === 'HIGH' ? '0.95' : '0.84'
  const fontFamily = state.fontStyle === 'serif' ? 'Georgia, serif' : state.fontStyle === 'mono' ? 'var(--font-mono), monospace' : 'var(--font-sans), sans-serif'

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/10 p-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-400">
          Preview
        </p>
      </div>

      <div className="relative h-96 overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6">
        <div
          className={`absolute bottom-4 ${state.position === 'bottom_left' ? 'left-4 right-10' : 'left-10 right-4'} border p-4 shadow-2xl backdrop-blur`}
          style={{
            borderColor: `${state.accentColor}30`,
            backgroundColor: state.chatSurfaceTint
              ? `${state.chatSurfaceTint}${Math.round(Number(surfaceOpacity) * 255).toString(16).padStart(2, '0')}`
              : `rgba(24,24,27,${surfaceOpacity})`,
            borderRadius: radius,
            fontFamily,
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{
                backgroundColor: `${state.accentColor}20`,
                color: state.accentColor,
              }}
            >
              {state.avatarStyle === 'emoji' && state.avatarEmoji ? state.avatarEmoji : 'Bot'}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-100">{state.botName}</p>
              <p className="text-xs text-zinc-500">
                {state.isActive ? 'Activo' : 'Pausado'}
              </p>
            </div>
          </div>

          <div
            className="p-3 text-sm leading-relaxed text-zinc-200"
            style={{
              background: state.surfaceStyle === 'minimal' ? 'transparent' : 'rgba(255,255,255,0.05)',
              border: state.surfaceStyle === 'solid' ? `1px solid ${state.accentColor}30` : '1px solid rgba(255,255,255,0.06)',
              borderRadius: bubbleRadius,
            }}
          >
            {state.welcomeMessage || 'Mensaje de bienvenida'}
          </div>

          {state.quickReplies.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {state.quickReplies.slice(0, 3).map((reply, index) => (
                <span
                  key={reply.id ?? index}
                  className="rounded-full border px-2.5 py-1 text-[11px] text-zinc-100"
                  style={{
                    borderColor: `${state.accentColor}35`,
                    backgroundColor: `${state.accentColor}18`,
                  }}
                >
                  {reply.emoji ? `${reply.emoji} ` : ''}{reply.label || 'Quick reply'}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1 border-t border-white/10 bg-zinc-950/50 p-4 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="text-zinc-500">Modelo</span>
          <span className="truncate font-mono text-zinc-300">{state.llmModel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Temperatura</span>
          <span className="font-mono text-zinc-300">{state.temperature}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Quota mensual</span>
          <span className="text-zinc-300">{state.monthlyQuota.toLocaleString('es-AR')} conv</span>
        </div>
      </div>
    </div>
  )
}
