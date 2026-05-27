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
  const isLongTitle = module.name.length > 24

  return (
    <motion.div
      variants={{
        hover: {
          x: 0,
          y: -4,
          scale: 1.01,
          rotate: 0,
          borderColor: `${module.accentColor}52`,
          boxShadow: `0 16px 44px rgba(0,0,0,0.34), 0 0 28px ${module.accentColor}14`,
        },
      }}
      whileHover="hover"
      transition={{
        x: { duration: 0.3, ease: EASE_PREMIUM },
        y: { duration: 0.32, ease: EASE_PREMIUM },
        scale: { duration: 0.32, ease: EASE_PREMIUM },
        rotate: { duration: 0.3, ease: EASE_PREMIUM },
        borderColor: { duration: 0.32, ease: EASE_PREMIUM },
        boxShadow: { duration: 0.32, ease: EASE_PREMIUM },
      }}
      className="group relative h-full min-h-[224px] overflow-visible rounded-xl border border-white/[0.07] bg-gradient-to-br from-white/[0.025] to-transparent p-4 cursor-default sm:min-h-[218px] sm:p-5"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        willChange: 'transform',
        transformOrigin: 'center',
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden>
        <div
          className="absolute inset-x-4 bottom-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${module.accentColor}B0, transparent)`,
            boxShadow: `0 0 14px ${module.accentColor}26`,
            opacity: 0.52,
          }}
        />
      </div>
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

      <div className="relative z-10 flex h-full flex-col gap-2.5">
        <div className="flex min-h-9 items-center justify-between gap-2">
          <motion.div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
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
            className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[8px] font-bold tracking-[0.14em] text-amber-400 sm:text-[9px] sm:tracking-widest"
          >
            PR&Oacute;XIMAMENTE
          </motion.span>
        </div>

        <h4
          className={`flex min-h-[2.45rem] items-start font-semibold leading-[1.25] text-white ${
            isLongTitle ? 'text-[12px] tracking-[-0.01em] lg:whitespace-nowrap' : 'text-sm'
          }`}
        >
          {module.name}
        </h4>

        <p className="mt-auto min-h-[3.1rem] overflow-hidden text-xs leading-[1.42] text-zinc-500 line-clamp-2">
          {module.shortDescription}
        </p>
      </div>
    </motion.div>
  )
}
