'use client'

import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { AvatarComponentProps, AvatarCoreState } from './types'

/**
 * GeometricAvatar — light avatar ("Asistente Geométrico" in the registry).
 *
 * Organic blob shape with a minimal face (two dot eyes). Pure SVG +
 * motion/react. No Three.js, no canvas. Friendly + professional vibe.
 *
 * State mapping:
 *  - idle     → soft breathing (scale Y), eyes blink occasionally
 *  - thinking → blob tilts slightly, eyes look up-right
 *  - speaking → rhythmic pulsing of the whole blob, eyes track open/close
 *
 * The blob is morphed via a soft asymmetric border-radius animation on a
 * filled disc gradient — cheaper than path morphing and visually close
 * enough at avatar sizes (~56px).
 */
export function GeometricAvatar({
  state,
  accentColor,
  size = 56,
  className,
}: AvatarComponentProps) {
  const config = useMemo(() => getStateConfig(state), [state])
  const eyeY = size * 0.45
  const eyeOffsetX = size * 0.13
  const eyeRadius = size * 0.05
  const center = size / 2

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        willChange: 'transform',
        perspective: 200,
      }}
    >
      <motion.div
        style={{
          position: 'relative',
          width: size,
          height: size,
        }}
        animate={config.containerAnimate}
        transition={config.containerTransition}
      >
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 32% 28%, ${lighten(accentColor, 0.18)} 0%, ${accentColor} 60%, ${darken(accentColor, 0.2)} 100%)`,
            boxShadow: `0 4px 14px ${withAlpha(accentColor, 0.32)}, inset 0 1px 0 ${withAlpha('#ffffff', 0.2)}`,
          }}
          animate={config.blobAnimate}
          transition={config.blobTransition}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          aria-hidden
        >
          <motion.ellipse
            cx={center - eyeOffsetX}
            cy={eyeY}
            rx={eyeRadius}
            ry={eyeRadius}
            fill="#0f172a"
            animate={config.eyeAnimate}
            transition={config.eyeTransition}
            style={{ transformOrigin: `${center - eyeOffsetX}px ${eyeY}px`, transformBox: 'fill-box' }}
          />
          <motion.ellipse
            cx={center + eyeOffsetX}
            cy={eyeY}
            rx={eyeRadius}
            ry={eyeRadius}
            fill="#0f172a"
            animate={config.eyeAnimate}
            transition={config.eyeTransition}
            style={{ transformOrigin: `${center + eyeOffsetX}px ${eyeY}px`, transformBox: 'fill-box' }}
          />
        </svg>
      </motion.div>
    </div>
  )
}

interface AnimateMap {
  [key: string]: number | number[] | string | string[]
}

interface TransitionConfig {
  duration: number
  repeat: number
  ease: 'easeInOut' | 'easeOut' | 'easeIn' | 'linear'
  times?: number[]
}

interface GeometricStateConfig {
  containerAnimate: AnimateMap
  containerTransition: TransitionConfig
  blobAnimate: { borderRadius: string[] }
  blobTransition: TransitionConfig
  eyeAnimate: AnimateMap
  eyeTransition: TransitionConfig
}

function getStateConfig(state: AvatarCoreState): GeometricStateConfig {
  switch (state) {
    case 'thinking':
      return {
        containerAnimate: { rotate: [-3, 3, -3], y: [0, -1, 0] },
        containerTransition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
        blobAnimate: {
          borderRadius: [
            '58% 42% 60% 40% / 50% 55% 45% 50%',
            '52% 48% 55% 45% / 48% 52% 48% 52%',
            '58% 42% 60% 40% / 50% 55% 45% 50%',
          ],
        },
        blobTransition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
        eyeAnimate: { cy: [0, -1.5, 0], scaleY: [1, 0.95, 1] },
        eyeTransition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'speaking':
      return {
        containerAnimate: { scale: [1, 1.04, 1] },
        containerTransition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' },
        blobAnimate: {
          borderRadius: [
            '50% 50% 50% 50% / 50% 50% 50% 50%',
            '54% 46% 48% 52% / 52% 48% 52% 48%',
            '50% 50% 50% 50% / 50% 50% 50% 50%',
          ],
        },
        blobTransition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' },
        eyeAnimate: { scaleY: [1, 0.6, 1] },
        eyeTransition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'idle':
    default:
      return {
        containerAnimate: { scaleY: [1, 1.03, 1], scaleX: [1, 0.99, 1] },
        containerTransition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        blobAnimate: {
          borderRadius: [
            '50% 50% 50% 50% / 50% 50% 50% 50%',
            '52% 48% 51% 49% / 50% 50% 50% 50%',
            '50% 50% 50% 50% / 50% 50% 50% 50%',
          ],
        },
        blobTransition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        eyeAnimate: { scaleY: [1, 1, 0.1, 1, 1] },
        eyeTransition: {
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.45, 0.5, 0.55, 1],
        },
      }
  }
}

function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  const a = Math.max(0, Math.min(1, alpha))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
}

function lighten(hex: string, amount: number): string {
  return shade(hex, Math.abs(amount))
}

function darken(hex: string, amount: number): string {
  return shade(hex, -Math.abs(amount))
}

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
