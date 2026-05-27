'use client'

import { useEffect, useRef } from 'react'
import { getAvatar, getAvatarOrDefault, DEFAULT_AVATAR_ID } from './registry'
import type { AvatarCoreState } from './types'

export interface AvatarRendererProps {
  /** Avatar id persisted in BotConfig.avatarStyle. Falls back gracefully. */
  style: string
  /** Canonical 3-state lifecycle from useChatbot. */
  state: AvatarCoreState
  /** Brand hex (BotConfig.accentColor). */
  accentColor: string
  /** Render size in px. Default 56. */
  size?: number
  /** URL for the 'image' escape hatch. */
  avatarImageUrl?: string | null
  /** Emoji string for the 'emoji' escape hatch. */
  avatarEmoji?: string | null
  /** Business initials for avatars that render text (Monogram in B7.2). */
  businessInitials?: string
  /**
   * Kept in props for source compatibility — was passed to LegacyNeuroAvatar
   * to bump face reactions. The canonical contract no longer plumbs this:
   * the legacy adapter derives its own pulse from `state === 'speaking'`.
   */
  messagePulse?: number
}

/**
 * Renders an avatar by resolving `style` against the central registry.
 *
 * Resolution order:
 *  1. 'image' / 'emoji' → escape hatches handled inline (not registry).
 *  2. Registry lookup by id → mount the registered component.
 *  3. Unknown id → fall back to DEFAULT_AVATAR_ID with a structured warn.
 *
 * Guarantee: this component never throws and never renders nothing.
 * Backward-compat with the previous `'neuro' | 'legacy_neuro'` enum is
 * automatic — both ids live in the registry.
 */
export function AvatarRenderer({
  style,
  state,
  accentColor,
  size = 56,
  avatarImageUrl,
  avatarEmoji,
  businessInitials,
}: AvatarRendererProps) {
  if (style === 'image' && avatarImageUrl) {
    return (
      <img
        src={avatarImageUrl}
        alt="Avatar"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2px solid ${accentColor}`,
        }}
      />
    )
  }

  if (style === 'emoji' && avatarEmoji) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `${accentColor}1A`,
          border: `2px solid ${accentColor}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.6,
        }}
      >
        {avatarEmoji}
      </div>
    )
  }

  const resolved = getAvatarOrDefault(style)
  const wasFallback = !getAvatar(style)
  const AvatarComponent = resolved.component

  return (
    <>
      {wasFallback && <UnsupportedStyleWarning requested={style} fallback={resolved.id} />}
      <AvatarComponent
        state={state}
        accentColor={accentColor}
        size={size}
        businessInitials={businessInitials}
      />
    </>
  )
}

/**
 * Emits a single structured warning per (requested, fallback) pair.
 * Renders nothing. Lives as a tiny effect-only component so warnings
 * don't fire on every re-render.
 */
function UnsupportedStyleWarning({
  requested,
  fallback,
}: {
  requested: string
  fallback: string
}) {
  const warnedRef = useRef<string | null>(null)
  useEffect(() => {
    const key = `${requested}->${fallback}`
    if (warnedRef.current === key) return
    warnedRef.current = key
    if (requested === DEFAULT_AVATAR_ID) return
    console.warn(
      JSON.stringify({
        type: 'avatar.unsupported_style',
        level: 'warn',
        requested,
        fallback,
      })
    )
  }, [requested, fallback])
  return null
}
