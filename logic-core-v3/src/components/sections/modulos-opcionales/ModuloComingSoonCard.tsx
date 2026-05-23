'use client'

import { motion } from 'motion/react'
import {
  Star,
  Mail,
  Calendar,
  ShoppingBag,
  MessageCircle,
  Receipt,
  Users,
  DollarSign,
  TrendingUp,
  Box,
} from 'lucide-react'
import type { PremiumModuleSeed } from '@/lib/data/premium-modules'

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const
const COMING_CARD_VARIANTS = {
  hidden: { opacity: 0, x: -10, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: EASE_PREMIUM },
  },
}

function ModuleIcon({ name, color }: { name: string; color: string }) {
  const iconProps = { size: 15, strokeWidth: 1.5, style: { color } }

  switch (name) {
    case 'Star':
      return <Star {...iconProps} />
    case 'Mail':
      return <Mail {...iconProps} />
    case 'Calendar':
      return <Calendar {...iconProps} />
    case 'ShoppingBag':
      return <ShoppingBag {...iconProps} />
    case 'MessageCircle':
      return <MessageCircle {...iconProps} />
    case 'Receipt':
      return <Receipt {...iconProps} />
    case 'Users':
      return <Users {...iconProps} />
    case 'DollarSign':
      return <DollarSign {...iconProps} />
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />
    default:
      return <Box {...iconProps} />
  }
}

interface ModuloComingSoonCardProps {
  module: PremiumModuleSeed
  index: number
}

export function ModuloComingSoonCard({ module }: ModuloComingSoonCardProps) {
  return (
    <motion.div
      variants={{
        ...COMING_CARD_VARIANTS,
        hover: {
          y: -3,
          scale: 1.008,
          borderColor: `${module.accentColor}52`,
          boxShadow: `0 16px 44px rgba(0,0,0,0.34), 0 0 28px ${module.accentColor}14`,
        },
      }}
      whileHover="hover"
      transition={{
        y: { duration: 0.32, ease: EASE_PREMIUM },
        scale: { duration: 0.32, ease: EASE_PREMIUM },
        borderColor: { duration: 0.32, ease: EASE_PREMIUM },
        boxShadow: { duration: 0.32, ease: EASE_PREMIUM },
      }}
      className="group relative overflow-hidden p-5 rounded-xl border border-white/[0.07] bg-gradient-to-br from-white/[0.025] to-transparent cursor-default"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        willChange: 'transform',
      }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-xl pointer-events-none"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.34, ease: EASE_PREMIUM }}
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-px pointer-events-none"
        variants={{
          hidden: { x: '-120%', opacity: 0 },
          visible: { x: '-120%', opacity: 0 },
          hover: { x: '120%', opacity: [0, 0.75, 0] },
        }}
        transition={{ duration: 0.9, ease: EASE_PREMIUM }}
        style={{
          background: `linear-gradient(90deg, transparent, ${module.accentColor}B0, transparent)`,
          boxShadow: `0 0 16px ${module.accentColor}30`,
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-xl pointer-events-none"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.36, ease: EASE_PREMIUM }}
        style={{
          background: `radial-gradient(circle at 20% 18%, ${module.accentColor}18, transparent 42%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <motion.div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            variants={{
              hidden: { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
              visible: { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
              hover: {
                scale: 1.07,
                boxShadow: `0 0 22px ${module.accentColor}26`,
              },
            }}
            transition={{ duration: 0.28, ease: EASE_PREMIUM }}
            style={{
              background: `${module.accentColor}14`,
              border: `1px solid ${module.accentColor}25`,
            }}
          >
            <ModuleIcon name={module.iconName} color={module.accentColor} />
          </motion.div>
          <motion.span
            variants={{
              hidden: {
                borderColor: 'rgba(245,158,11,0.2)',
                boxShadow: '0 0 0 rgba(251,191,36,0)',
                backgroundColor: 'rgba(245,158,11,0.1)',
              },
              visible: {
                borderColor: 'rgba(245,158,11,0.2)',
                boxShadow: '0 0 0 rgba(251,191,36,0)',
                backgroundColor: 'rgba(245,158,11,0.1)',
              },
              hover: {
                borderColor: 'rgba(251,191,36,0.42)',
                boxShadow: '0 0 18px rgba(251,191,36,0.16)',
                backgroundColor: 'rgba(245,158,11,0.16)',
              },
            }}
            transition={{ duration: 0.28, ease: EASE_PREMIUM }}
            className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400"
          >
            PR&Oacute;XIMAMENTE
          </motion.span>
        </div>

        <h4 className="font-semibold text-sm text-white leading-snug">{module.name}</h4>

        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {module.shortDescription}
        </p>
      </div>
    </motion.div>
  )
}
