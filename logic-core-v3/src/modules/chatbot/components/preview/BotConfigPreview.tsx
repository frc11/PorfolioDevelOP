'use client'

import { useState } from 'react'
import { AvatarRenderer, getAvatarRenderSize } from '../avatar'
import type { AvatarCoreState } from '../avatar/types'
import { deriveBusinessInitials } from '../../shared/businessInitials'
import type { BotPreviewState } from './types'

interface BotConfigPreviewProps {
  state: BotPreviewState
}

type ViewMode = 'floating' | 'open'

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'floating', label: 'Flotando' },
  { value: 'open', label: 'Abierto' },
]

const AVATAR_STATES: { value: AvatarCoreState; label: string }[] = [
  { value: 'idle', label: 'Idle' },
  { value: 'thinking', label: 'Pensando' },
  { value: 'speaking', label: 'Hablando' },
]

function normalizeIntensity(value: string): 'LOW' | 'MEDIUM' | 'HIGH' {
  const upper = value.toUpperCase()
  if (upper === 'LOW' || upper === 'HIGH') return upper
  return 'MEDIUM'
}

function normalizeRadius(value: string): 'small' | 'medium' | 'large' {
  if (value === 'small' || value === 'large') return value
  return 'medium'
}

function normalizeBubble(value: string): 'sharp' | 'rounded' | 'pill' {
  if (value === 'sharp' || value === 'pill') return value
  return 'rounded'
}

function normalizeSurface(value: string): 'glass' | 'solid' | 'minimal' {
  if (value === 'solid' || value === 'minimal') return value
  return 'glass'
}

function normalizeFont(value: string): 'sans' | 'serif' | 'mono' {
  if (value === 'serif' || value === 'mono') return value
  return 'sans'
}

function isLeftPosition(value: string): boolean {
  return value === 'bottom_left'
}

/**
 * CC.4 — Preview vivo del bot, reusado entre admin y dashboard cliente.
 *
 * Recibe `BotPreviewState` (subset visual). Permite togglear:
 *  - Vista: "flotando" (avatar suelto) vs "abierto" (widget desplegado).
 *  - Estado del avatar: idle / thinking / speaking (animaciones vivas).
 *
 * Cero tecnicismo expuesto — solo lo que el visitante final ve.
 */
export function BotConfigPreview({ state }: BotConfigPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('floating')
  const [avatarState, setAvatarState] = useState<AvatarCoreState>('idle')

  const borderRadiusToken = normalizeRadius(state.borderRadius)
  const bubbleStyleToken = normalizeBubble(state.bubbleStyle)
  const surfaceStyleToken = normalizeSurface(state.surfaceStyle)
  const fontStyleToken = normalizeFont(state.fontStyle)

  const radius =
    borderRadiusToken === 'small' ? '12px' : borderRadiusToken === 'large' ? '32px' : '24px'
  const bubbleRadius =
    bubbleStyleToken === 'sharp' ? '8px' : bubbleStyleToken === 'pill' ? '999px' : '18px'

  const intensity = normalizeIntensity(state.intensityLevel)
  const surfaceOpacity = intensity === 'LOW' ? 0.72 : intensity === 'HIGH' ? 0.95 : 0.84

  const fontFamily =
    fontStyleToken === 'serif'
      ? 'Georgia, serif'
      : fontStyleToken === 'mono'
        ? 'var(--font-mono), monospace'
        : 'var(--font-sans), sans-serif'

  const initials = deriveBusinessInitials(state.botName)
  const isLeft = isLeftPosition(state.position)

  const surfaceBg = state.chatSurfaceTint
    ? `${state.chatSurfaceTint}${Math.round(surfaceOpacity * 255)
        .toString(16)
        .padStart(2, '0')}`
    : `rgba(24,24,27,${surfaceOpacity})`

  // Mirror the live surfaces' per-avatar sizing so this preview stays WYSIWYG
  // (heavy avatars render a larger box; light avatars resolve to the base size).
  const previewLauncherSize = getAvatarRenderSize(state.avatarStyle, 56)
  const previewHeaderSize = getAvatarRenderSize(state.avatarStyle, 40)

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-xs font-medium tracking-tight text-zinc-400">Preview</p>
        <p className="text-[10px] tracking-tight text-zinc-600">Lo que ve el visitante</p>
      </div>

      <div className="space-y-2.5 border-b border-white/10 px-4 py-3">
        <PreviewToggle
          label="Vista"
          options={VIEW_MODES}
          value={viewMode}
          onChange={setViewMode}
        />
        <PreviewToggle
          label="Estado"
          options={AVATAR_STATES}
          value={avatarState}
          onChange={setAvatarState}
        />
      </div>

      <div
        className="relative h-96 overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
        style={{ fontFamily }}
      >
        {/* Página simulada: líneas difuminadas para sugerir contenido del sitio del cliente */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <div className="space-y-3 p-5">
            <div className="h-1.5 w-1/3 rounded-full bg-white" />
            <div className="h-1.5 w-3/4 rounded-full bg-white" />
            <div className="h-1.5 w-2/3 rounded-full bg-white" />
            <div className="mt-4 h-1.5 w-1/2 rounded-full bg-white" />
            <div className="h-1.5 w-4/5 rounded-full bg-white" />
            <div className="h-1.5 w-3/5 rounded-full bg-white" />
            <div className="mt-4 h-12 w-full rounded-md bg-white" />
            <div className="mt-3 h-1.5 w-2/3 rounded-full bg-white" />
            <div className="h-1.5 w-3/5 rounded-full bg-white" />
          </div>
        </div>

        {viewMode === 'floating' ? (
          <div
            className="absolute"
            style={{
              bottom: 20,
              left: isLeft ? 20 : undefined,
              right: isLeft ? undefined : 20,
              width: previewLauncherSize,
              height: previewLauncherSize,
            }}
          >
            <AvatarRenderer
              style={state.avatarStyle}
              state={avatarState}
              accentColor={state.accentColor}
              size={previewLauncherSize}
              avatarImageUrl={state.avatarImageUrl}
              avatarEmoji={state.avatarEmoji}
              businessInitials={initials}
            />
          </div>
        ) : (
          <div
            className={`absolute bottom-4 ${isLeft ? 'left-4 right-10' : 'left-10 right-4'} border p-4 shadow-2xl backdrop-blur`}
            style={{
              borderColor: `${state.accentColor}30`,
              backgroundColor: surfaceBg,
              borderRadius: radius,
            }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div style={{ width: previewHeaderSize, height: previewHeaderSize }} className="shrink-0">
                <AvatarRenderer
                  style={state.avatarStyle}
                  state={avatarState}
                  accentColor={state.accentColor}
                  size={previewHeaderSize}
                  avatarImageUrl={state.avatarImageUrl}
                  avatarEmoji={state.avatarEmoji}
                  businessInitials={initials}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {state.botName || 'Asistente'}
                </p>
                <p className="text-xs text-zinc-500">
                  {state.isActive ? 'En línea' : 'Pausado'}
                </p>
              </div>
            </div>

            <div
              className="p-3 text-sm leading-relaxed text-zinc-200"
              style={{
                background:
                  surfaceStyleToken === 'minimal' ? 'transparent' : 'rgba(255,255,255,0.05)',
                border:
                  surfaceStyleToken === 'solid'
                    ? `1px solid ${state.accentColor}30`
                    : '1px solid rgba(255,255,255,0.06)',
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
                    {reply.emoji ? `${reply.emoji} ` : ''}
                    {reply.label || 'Quick reply'}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface PreviewToggleProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

function PreviewToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: PreviewToggleProps<T>) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-[11px] tracking-tight text-zinc-500">{label}</span>
      <div className="flex flex-1 gap-1 rounded-md bg-black/30 p-0.5">
        {options.map((opt) => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex-1 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors ${
                active ? 'bg-white/10 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
