'use client'

import { useState } from 'react'
import { Check, ImagePlus, Smile } from 'lucide-react'
import { AvatarRenderer } from './AvatarRenderer'
import { AVATAR_REGISTRY } from './registry'
import type { AvatarRegistryEntry, AvatarWeight } from './types'

export interface AvatarPickerProps {
  /** Currently selected avatar id (registry id, 'image' or 'emoji'). */
  value: string
  /** Called with the new avatar id when the user picks one. */
  onChange: (id: string) => void
  /** Brand hex from the BotConfig form being edited. */
  accentColor: string
  /** Business initials piped to the Monogram preview. Derived in the parent. */
  businessInitials?: string
  /**
   * When true, also render the two escape-hatch cards (image / emoji).
   * Admin = true. Client dashboard = false.
   */
  includeEscapeHatches?: boolean
  /** Optional URL backing the 'image' option preview. */
  avatarImageUrl?: string | null
  /** Optional emoji backing the 'emoji' option preview. */
  avatarEmoji?: string | null
  /** Wrapper class hook. */
  className?: string
}

const WEIGHT_LABELS: Record<AvatarWeight, string> = {
  heavy: 'Pesado',
  light: 'Liviano',
}

const WEIGHT_TONE: Record<AvatarWeight, string> = {
  heavy: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  light: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
}

/**
 * Grid selector for avatar styles.
 *
 * Every card mounts the REAL avatar component (not a thumbnail). Hovering
 * a card pushes that avatar into `speaking` state so the user previews
 * the active animation before selecting. The selected card is highlighted
 * with the brand accent and a check badge.
 *
 * Pure controlled component — `value` and `onChange` drive everything.
 * Loading/error/empty states aren't applicable: the registry is static.
 */
export function AvatarPicker({
  value,
  onChange,
  accentColor,
  businessInitials,
  includeEscapeHatches = false,
  avatarImageUrl,
  avatarEmoji,
  className,
}: AvatarPickerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div
      className={
        className ??
        'grid grid-cols-2 gap-3 sm:grid-cols-3'
      }
      role="radiogroup"
      aria-label="Estilo de avatar"
    >
      {AVATAR_REGISTRY.map((entry) => (
        <RegistryCard
          key={entry.id}
          entry={entry}
          isActive={value === entry.id}
          isHovered={hoveredId === entry.id}
          accentColor={accentColor}
          businessInitials={businessInitials}
          onSelect={() => onChange(entry.id)}
          onHoverChange={(hover) => setHoveredId(hover ? entry.id : null)}
        />
      ))}

      {includeEscapeHatches && (
        <>
          <EscapeHatchCard
            id="image"
            label="Imagen custom"
            description="Subí una foto. Cuadrada, 256x256+ recomendado."
            isActive={value === 'image'}
            accentColor={accentColor}
            onSelect={() => onChange('image')}
            preview={
              avatarImageUrl ? (
                <img
                  src={avatarImageUrl}
                  alt=""
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${accentColor}`,
                  }}
                />
              ) : (
                <PreviewPlaceholder accentColor={accentColor}>
                  <ImagePlus className="h-6 w-6 text-white/70" strokeWidth={1.5} />
                </PreviewPlaceholder>
              )
            }
          />
          <EscapeHatchCard
            id="emoji"
            label="Emoji"
            description="Un emoji corto sobre fondo de marca."
            isActive={value === 'emoji'}
            accentColor={accentColor}
            onSelect={() => onChange('emoji')}
            preview={
              avatarEmoji ? (
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: `${accentColor}1A`,
                    border: `2px solid ${accentColor}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                  }}
                >
                  {avatarEmoji}
                </div>
              ) : (
                <PreviewPlaceholder accentColor={accentColor}>
                  <Smile className="h-6 w-6 text-white/70" strokeWidth={1.5} />
                </PreviewPlaceholder>
              )
            }
          />
        </>
      )}
    </div>
  )
}

function RegistryCard({
  entry,
  isActive,
  isHovered,
  accentColor,
  businessInitials,
  onSelect,
  onHoverChange,
}: {
  entry: AvatarRegistryEntry
  isActive: boolean
  isHovered: boolean
  accentColor: string
  businessInitials?: string
  onSelect: () => void
  onHoverChange: (hovered: boolean) => void
}) {
  const previewState = isHovered || isActive ? 'speaking' : 'idle'

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={onSelect}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      className={
        'group relative flex flex-col items-center gap-3 rounded-2xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-white/30 ' +
        (isActive
          ? 'border-white/40 bg-white/[0.06]'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]')
      }
      style={isActive ? { boxShadow: `0 0 0 1px ${accentColor}55 inset` } : undefined}
    >
      {isActive && (
        <span
          aria-hidden
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-zinc-950"
          style={{ background: accentColor }}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}

      <div className="flex h-20 w-20 items-center justify-center">
        <AvatarRenderer
          style={entry.id}
          state={previewState}
          accentColor={accentColor}
          size={64}
          businessInitials={businessInitials}
        />
      </div>

      <div className="min-w-0 self-stretch">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-zinc-100">{entry.label}</p>
          <span
            className={
              'shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ' +
              WEIGHT_TONE[entry.weight]
            }
          >
            {WEIGHT_LABELS[entry.weight]}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-400">
          {entry.description}
        </p>
      </div>
    </button>
  )
}

function EscapeHatchCard({
  label,
  description,
  isActive,
  accentColor,
  onSelect,
  preview,
}: {
  id: string
  label: string
  description: string
  isActive: boolean
  accentColor: string
  onSelect: () => void
  preview: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={onSelect}
      className={
        'group relative flex flex-col items-center gap-3 rounded-2xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-white/30 ' +
        (isActive
          ? 'border-white/40 bg-white/[0.06]'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]')
      }
      style={isActive ? { boxShadow: `0 0 0 1px ${accentColor}55 inset` } : undefined}
    >
      {isActive && (
        <span
          aria-hidden
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-zinc-950"
          style={{ background: accentColor }}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}

      <div className="flex h-20 w-20 items-center justify-center">{preview}</div>

      <div className="min-w-0 self-stretch">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-zinc-100">{label}</p>
          <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            Custom
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-400">
          {description}
        </p>
      </div>
    </button>
  )
}

function PreviewPlaceholder({
  accentColor,
  children,
}: {
  accentColor: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: `${accentColor}1A`,
        border: `2px dashed ${accentColor}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  )
}
