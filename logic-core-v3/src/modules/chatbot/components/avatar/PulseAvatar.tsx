'use client'

import { motion } from 'motion/react'
import type { AvatarComponentProps, AvatarCoreState } from './types'

/**
 * PulseAvatar — light avatar ("Onda / Pulso" in the registry).
 *
 * Voice-assistant style: a solid central dot tinted with the brand accent,
 * surrounded by 3 concentric rings that expand outward. Pure SVG + motion/react.
 * No Three.js, no canvas.
 *
 * State mapping:
 *  - idle     → 3 calm rings, slow expansion (2.4s), evenly staggered
 *  - thinking → faster expansion (1.4s) + irregular staggering for "uncertain" feel
 *  - speaking → tight rhythm (1.6s), larger amplitude, brighter dot
 */
export function PulseAvatar({
  state,
  accentColor,
  size = 56,
  className,
}: AvatarComponentProps) {
  const { duration, delays, maxScale, dotScale, dotOpacity, ringStartOpacity } =
    getStateConfig(state)

  const viewBox = 100
  const center = viewBox / 2
  const baseRingRadius = 16
  const dotRadius = 10 * dotScale

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        willChange: 'transform',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        role="img"
        aria-hidden
      >
        {delays.map((delay, i) => (
          <motion.circle
            key={i}
            cx={center}
            cy={center}
            r={baseRingRadius}
            fill="none"
            stroke={accentColor}
            strokeWidth={2}
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, maxScale],
              opacity: [ringStartOpacity, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: 'easeOut',
            }}
            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
          />
        ))}

        <motion.circle
          cx={center}
          cy={center}
          r={dotRadius}
          fill={accentColor}
          animate={{
            opacity: state === 'idle' ? [0.85, 1, 0.85] : [0.95, 1, 0.95],
            r: state === 'speaking' ? [dotRadius, dotRadius * 1.08, dotRadius] : dotRadius,
          }}
          transition={{
            duration: state === 'speaking' ? 0.6 : 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ opacity: dotOpacity }}
        />
      </svg>
    </div>
  )
}

interface PulseStateConfig {
  duration: number
  delays: readonly [number, number, number]
  maxScale: number
  dotScale: number
  dotOpacity: number
  ringStartOpacity: number
}

function getStateConfig(state: AvatarCoreState): PulseStateConfig {
  switch (state) {
    case 'thinking':
      return {
        duration: 1.4,
        delays: [0, 0.35, 0.95],
        maxScale: 2.3,
        dotScale: 0.95,
        dotOpacity: 0.95,
        ringStartOpacity: 0.55,
      }
    case 'speaking':
      return {
        duration: 1.6,
        delays: [0, 0.5, 1],
        maxScale: 2.6,
        dotScale: 1.05,
        dotOpacity: 1,
        ringStartOpacity: 0.7,
      }
    case 'idle':
    default:
      return {
        duration: 2.4,
        delays: [0, 0.8, 1.6],
        maxScale: 2.1,
        dotScale: 1,
        dotOpacity: 0.95,
        ringStartOpacity: 0.5,
      }
  }
}
