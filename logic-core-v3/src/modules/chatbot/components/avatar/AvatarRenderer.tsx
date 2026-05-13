'use client'

import { useMemo } from 'react'
import { NeuroAvatar } from './NeuroAvatar'
import { LegacyNeuroAvatar } from './LegacyNeuroAvatar'
import { mapStateToLegacyProps } from './legacyStateMapper'
import type { NeuroAvatarState } from './types'



export interface AvatarRendererProps {
  style: string  // accepts any string from BD; falls back gracefully
  state: NeuroAvatarState
  accentColor: string
  size?: number
  avatarImageUrl?: string | null
  avatarEmoji?: string | null
  /** Bumped on each new assistant message — passed to legacy avatar to trigger reactions. */
  messagePulse?: number
}

/**
 * Renders the appropriate avatar component based on `style`.
 *
 * MVP supports 'neuro' (default) and 'legacy_neuro'. Other values
 * fall back to 'neuro' with a console warning.
 */
export function AvatarRenderer({
  style,
  state,
  accentColor,
  size = 56,
  avatarImageUrl,
  avatarEmoji,
  messagePulse = 0,
}: AvatarRendererProps) {
  const legacyProps = useMemo(
    () => mapStateToLegacyProps(state, accentColor, messagePulse),
    [state, accentColor, messagePulse]
  )

  switch (style) {
    case 'neuro':
      return <NeuroAvatar state={state} accentColor={accentColor} size={size} />

    case 'legacy_neuro':
      return (
        <div style={{ width: size, height: size }}>
          <LegacyNeuroAvatar {...legacyProps} />
        </div>
      )

    case 'image':
      if (avatarImageUrl) {
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
      return <NeuroAvatar state={state} accentColor={accentColor} size={size} />

    case 'emoji':
      if (avatarEmoji) {
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
      return <NeuroAvatar state={state} accentColor={accentColor} size={size} />

    case 'simple':
      // Reserved for Phase 1.5 (lightweight client variant)
    default:
      if (style !== 'neuro' && style !== 'legacy_neuro') {
        console.warn(
          JSON.stringify({
            type: 'avatar.unsupported_style',
            level: 'warn',
            style,
            fallback: 'neuro',
          })
        )
      }
      return <NeuroAvatar state={state} accentColor={accentColor} size={size} />
  }
}
