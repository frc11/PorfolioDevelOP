'use client'

import { motion } from 'motion/react'
import {
  BarChart3,
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Box,
} from 'lucide-react'
import type { IncludedFeature } from './data'

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const
const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.62, ease: EASE_PREMIUM },
  },
}

const CARD_EFFECTS: Record<string, { origin: string; shine: string; iconRotate: number; glowStrength: string }> = {
  resultados: {
    origin: '18% 0%',
    shine: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.46), transparent)',
    iconRotate: -3,
    glowStrength: '1A',
  },
  'mi-proyecto': {
    origin: '50% 0%',
    shine: 'linear-gradient(180deg, rgba(139,92,246,0.28), transparent 52%)',
    iconRotate: 3,
    glowStrength: '20',
  },
  mensajes: {
    origin: '18% 22%',
    shine: 'radial-gradient(circle at 20% 25%, rgba(16,185,129,0.34), transparent 42%)',
    iconRotate: -2,
    glowStrength: '1D',
  },
  boveda: {
    origin: '82% 18%',
    shine: 'linear-gradient(135deg, rgba(245,158,11,0.25), transparent 44%)',
    iconRotate: 2,
    glowStrength: '1C',
  },
  'ai-brief': {
    origin: '70% 0%',
    shine: 'linear-gradient(120deg, transparent 18%, rgba(236,72,153,0.32), transparent 62%)',
    iconRotate: 4,
    glowStrength: '20',
  },
}

function FeatureIcon({ name, color }: { name: string; color: string }) {
  const iconProps = { size: 20, strokeWidth: 1.5, style: { color } }

  switch (name) {
    case 'BarChart3':
      return <BarChart3 {...iconProps} />
    case 'GitBranch':
      return <GitBranch {...iconProps} />
    case 'MessageSquare':
      return <MessageSquare {...iconProps} />
    case 'ShieldCheck':
      return <ShieldCheck {...iconProps} />
    case 'Sparkles':
      return <Sparkles {...iconProps} />
    default:
      return <Box {...iconProps} />
  }
}

interface TodoIncluidoFeatureCardProps {
  feature: IncludedFeature
  index: number
}

export function TodoIncluidoFeatureCard({ feature }: TodoIncluidoFeatureCardProps) {
  const effect = CARD_EFFECTS[feature.id] ?? CARD_EFFECTS.resultados

  return (
    <motion.div
      variants={{
        ...CARD_VARIANTS,
        hover: {
          y: -5,
          scale: 1.01,
          borderColor: `${feature.accentColor}66`,
          boxShadow: `0 18px 60px ${feature.accentColor}${effect.glowStrength}, 0 24px 80px rgba(0,0,0,0.45)`,
        },
      }}
      whileHover="hover"
      transition={{
        y: { duration: 0.34, ease: EASE_PREMIUM },
        scale: { duration: 0.34, ease: EASE_PREMIUM },
        borderColor: { duration: 0.34, ease: EASE_PREMIUM },
        boxShadow: { duration: 0.34, ease: EASE_PREMIUM },
      }}
      className="group relative overflow-hidden p-8 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent cursor-default"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        willChange: 'transform',
      }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-2xl pointer-events-none"
        variants={{
          hidden: { opacity: 0, scale: 0.98 },
          visible: { opacity: 0, scale: 0.98 },
          hover: { opacity: 1, scale: 1.02 },
        }}
        transition={{ duration: 0.42, ease: EASE_PREMIUM }}
        style={{
          background: `radial-gradient(ellipse at ${effect.origin}, ${feature.accentColor}22, transparent 62%)`,
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-x-6 top-0 h-px pointer-events-none"
        variants={{
          hidden: { opacity: 0, scaleX: 0.35 },
          visible: { opacity: 0, scaleX: 0.35 },
          hover: { opacity: 1, scaleX: 1 },
        }}
        transition={{ duration: 0.42, ease: EASE_PREMIUM }}
        style={{
          background: effect.shine,
          transformOrigin: feature.id === 'boveda' ? 'right' : 'left',
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-2xl pointer-events-none"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.38, ease: EASE_PREMIUM }}
        style={{ boxShadow: `inset 0 0 0 1px ${feature.accentColor}4D` }}
      />

      <div className="relative z-10 flex flex-col gap-5">
        <motion.div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          variants={{
            hidden: { rotate: 0, scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
            visible: { rotate: 0, scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
            hover: {
              rotate: effect.iconRotate,
              scale: feature.id === 'mensajes' ? 1.06 : 1.04,
              boxShadow: `0 0 26px ${feature.accentColor}30`,
            },
          }}
          transition={{ duration: 0.28, ease: EASE_PREMIUM }}
          style={{
            background: `${feature.accentColor}18`,
            border: `1px solid ${feature.accentColor}30`,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <FeatureIcon name={feature.iconName} color={feature.accentColor} />
        </motion.div>

        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-xl text-white leading-snug">{feature.title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
        </div>

        <div className="mt-auto">
          <motion.span
            variants={{
              hidden: {
                y: 0,
                backgroundColor: `${feature.accentColor}0D`,
                borderColor: `${feature.accentColor}50`,
                boxShadow: `0 0 0 ${feature.accentColor}00`,
              },
              visible: {
                y: 0,
                backgroundColor: `${feature.accentColor}0D`,
                borderColor: `${feature.accentColor}50`,
                boxShadow: `0 0 0 ${feature.accentColor}00`,
              },
              hover: {
                y: -1,
                backgroundColor: `${feature.accentColor}18`,
                borderColor: `${feature.accentColor}78`,
                boxShadow: `0 0 22px ${feature.accentColor}16`,
              },
            }}
            transition={{ duration: 0.28, ease: EASE_PREMIUM }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              border: `1px solid ${feature.accentColor}50`,
              color: feature.accentColor,
              background: `${feature.accentColor}0D`,
            }}
          >
            {feature.highlight}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}
