'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { AvatarComponentProps } from './types'

/**
 * MonogramAvatar — light avatar ("Monograma" in the registry).
 *
 * Renders 1–2 business initials over a solid disc tinted with the brand
 * accent color. Pure SVG + CSS + motion/react — no Three.js, no canvas.
 * Built to fly on low-end mobile.
 *
 * State mapping:
 *  - idle     → slow breathing pulse on the disc (3s loop)
 *  - thinking → faster pulse + 3 dots animating below the initials
 *  - speaking → soft glow halo expanding outward + tighter pulse
 *
 * `businessInitials` is taken from props as-is (uppercased, clipped to 2
 * chars). Wiring from BotConfig.botName lives in AvatarRenderer / B7.3.
 * If absent, falls back to a neutral middle-dot placeholder so the disc
 * never renders empty.
 */
export function MonogramAvatar({
  state,
  accentColor,
  size = 56,
  businessInitials,
  className,
}: AvatarComponentProps) {
  const initials = useMemo(() => normalizeInitials(businessInitials), [businessInitials])

  const pulseDuration = state === 'thinking' ? 1.2 : state === 'speaking' ? 1.8 : 3
  const pulseScale = state === 'idle' ? 1.025 : state === 'thinking' ? 1.04 : 1.05
  const fontSize = size * 0.42

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        willChange: 'transform',
      }}
    >
      {state === 'speaking' && (
        <motion.span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: accentColor,
            opacity: 0,
            filter: 'blur(6px)',
          }}
          animate={{ scale: [1, 1.35, 1.5], opacity: [0.45, 0.15, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 25%, ${withAlpha(accentColor, 1)} 0%, ${shade(accentColor, -0.18)} 85%)`,
          boxShadow: `0 4px 16px ${withAlpha(accentColor, 0.32)}, inset 0 1px 0 ${withAlpha('#ffffff', 0.18)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          fontWeight: 600,
          fontSize,
          letterSpacing: initials.length === 2 ? '-0.04em' : 0,
          userSelect: 'none',
        }}
        animate={{ scale: [1, pulseScale, 1] }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        {initials}
      </motion.div>

      <AnimatePresence>
        {state === 'thinking' && (
          <motion.div
            key="thinking-dots"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: size * 0.12,
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: size * 0.05,
              pointerEvents: 'none',
            }}
            aria-hidden
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                style={{
                  width: size * 0.07,
                  height: size * 0.07,
                  borderRadius: '50%',
                  background: '#ffffff',
                  opacity: 0.85,
                }}
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -size * 0.06, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Normalize raw initials prop into a safe 1–2 char uppercase string.
 * Returns a neutral placeholder when nothing usable is provided.
 */
function normalizeInitials(raw: string | undefined): string {
  const cleaned = (raw ?? '').trim().replace(/\s+/g, ' ')
  if (!cleaned) return '··'
  const parts = cleaned.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return cleaned.slice(0, 2).toUpperCase()
}

/**
 * Append/replace alpha on a hex color (#rgb / #rrggbb). Falls back to
 * the input if the hex can't be parsed — alpha is appended as 2 hex digits.
 */
function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  const a = Math.max(0, Math.min(1, alpha))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
}

/**
 * Lighten (positive amount) or darken (negative amount) a hex color.
 * `amount` is in [-1, 1].
 */
function shade(hex: string, amount: number): string {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  const adjust = (channel: number) => {
    if (amount >= 0) return Math.round(channel + (255 - channel) * amount)
    return Math.round(channel + channel * amount)
  }
  return `rgb(${adjust(rgb.r)}, ${adjust(rgb.g)}, ${adjust(rgb.b)})`
}

interface Rgb {
  r: number
  g: number
  b: number
}

function parseHex(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const body = match[1]
  const full =
    body.length === 3
      ? body
          .split('')
          .map((c) => c + c)
          .join('')
      : body
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}
