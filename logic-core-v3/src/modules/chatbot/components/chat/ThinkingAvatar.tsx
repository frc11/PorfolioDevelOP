'use client'

import { AvatarRenderer, getAvatarRenderSize } from '../avatar'
import { deriveBusinessInitials } from '../../shared/businessInitials'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface ThinkingAvatarProps {
  config: PublicBotConfig
  /** Base render size in px (before per-avatar fillScale). Default 28. */
  size?: number
}

/**
 * Mini avatar for the inline "pensando" indicator (to the LEFT of the three
 * dots / "pensando" label, inside the chat messages area).
 *
 * Renders the SAME configured avatar as the header and launcher — the single
 * source of truth `config.avatarStyle` — in its 'thinking' animation state, and
 * sizes it via `getAvatarRenderSize` exactly like those call sites so heavy
 * avatars (e.g. the Rostro Neural face) read at the right proportion.
 *
 * Why NOT a "lightweight echo": an earlier version rendered a generic accent
 * orb for heavy (3D) avatars to avoid a third WebGL canvas — but that made this
 * indicator DIVERGE from the configured avatar (it showed an orb when the bot
 * was the face avatar). Correctness wins: we render the real avatar. The heavy
 * face/orb avatars (legacy_neuro / neuro) have no light face representation, so
 * coherence requires their canvas. This indicator is transient — it mounts only
 * while the bot is thinking, so the heavy canvas is not kept alive at rest.
 */
export function ThinkingAvatar({ config, size = 28 }: ThinkingAvatarProps) {
  return (
    <div style={{ flexShrink: 0, lineHeight: 0 }}>
      <AvatarRenderer
        style={config.avatarStyle}
        state="thinking"
        accentColor={config.accentColor}
        size={getAvatarRenderSize(config.avatarStyle, size)}
        avatarImageUrl={config.avatarImageUrl}
        avatarEmoji={config.avatarEmoji}
        businessInitials={deriveBusinessInitials(config.botName)}
      />
    </div>
  )
}
