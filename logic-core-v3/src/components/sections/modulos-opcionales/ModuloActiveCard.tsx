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
const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.64, ease: EASE_PREMIUM },
  },
}

function ModuleIcon({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  const iconProps = { size, strokeWidth: 1.5, style: { color } }

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

const TIER_LABELS: Record<string, string> = {
  TIER_1_OPERATION: 'OPERACIÓN',
  TIER_2_GROWTH: 'CRECIMIENTO',
  TIER_3_VERTICAL: 'VERTICAL',
}

const MODULE_BULLETS: Record<string, string[]> = {
  'motor-resenas': [
    'Respuestas IA a reseñas nuevas en 1 click',
    'Alertas de reseñas en tiempo real',
    'Campañas automáticas para pedir reseñas',
  ],
  'email-marketing-pro': [
    'Templates drag-and-drop incluidos',
    'Segmentación automática de tu base',
    'Reportes de aperturas y clicks',
  ],
  'agenda-inteligente': [
    'Reservas 24/7 sin intermediarios',
    'Recordatorios automáticos por email y SMS',
    'Sincronización con Google Calendar',
  ],
  'tienda-conectada': [
    'Stock y ventas de Tiendanube en tiempo real',
    'Alertas de productos sin stock',
    'Recuperación automática de carritos abandonados',
  ],
}

const CARD_EFFECTS: Record<string, { origin: string; shine: string; iconRotate: number; priceLift: number }> = {
  'motor-resenas': {
    origin: '18% 0%',
    shine: 'linear-gradient(105deg, transparent, rgba(250,204,21,0.34), transparent)',
    iconRotate: -4,
    priceLift: 2,
  },
  'email-marketing-pro': {
    origin: '20% 8%',
    shine: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.42), transparent)',
    iconRotate: 3,
    priceLift: 1,
  },
  'agenda-inteligente': {
    origin: '16% 16%',
    shine: 'radial-gradient(circle at 18% 18%, rgba(16,185,129,0.34), transparent 42%)',
    iconRotate: -2,
    priceLift: 2,
  },
  'tienda-conectada': {
    origin: '52% 0%',
    shine: 'linear-gradient(180deg, rgba(139,92,246,0.30), transparent 55%)',
    iconRotate: 3,
    priceLift: 1,
  },
}

interface ModuloActiveCardProps {
  module: PremiumModuleSeed
  index: number
}

export function ModuloActiveCard({ module }: ModuloActiveCardProps) {
  const tierLabel = TIER_LABELS[module.tier] ?? module.tier
  const bullets = MODULE_BULLETS[module.slug] ?? [module.shortDescription]
  const effect = CARD_EFFECTS[module.slug] ?? CARD_EFFECTS['email-marketing-pro']

  return (
    <motion.div
      variants={{
        ...CARD_VARIANTS,
        hover: {
          y: -5,
          scale: 1.01,
          borderColor: `${module.accentColor}70`,
          boxShadow: `0 18px 60px ${module.accentColor}1C, 0 24px 90px rgba(0,0,0,0.45)`,
        },
      }}
      whileHover="hover"
      transition={{
        y: { duration: 0.34, ease: EASE_PREMIUM },
        scale: { duration: 0.34, ease: EASE_PREMIUM },
        borderColor: { duration: 0.34, ease: EASE_PREMIUM },
        boxShadow: { duration: 0.34, ease: EASE_PREMIUM },
      }}
      className="group relative overflow-hidden p-8 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent cursor-default"
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
          background: `radial-gradient(ellipse at ${effect.origin}, ${module.accentColor}24, transparent 62%)`,
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-x-8 top-0 h-px pointer-events-none"
        variants={{
          hidden: { opacity: 0, scaleX: 0.25 },
          visible: { opacity: 0, scaleX: 0.25 },
          hover: { opacity: 1, scaleX: 1 },
        }}
        transition={{ duration: 0.42, ease: EASE_PREMIUM }}
        style={{
          background: effect.shine,
          transformOrigin: module.slug === 'tienda-conectada' ? 'center' : 'left',
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
        style={{ boxShadow: `inset 0 0 0 1px ${module.accentColor}66` }}
      />

      <div className="relative z-10 flex flex-col gap-6 h-full">
        <div className="flex items-start justify-between">
          <motion.div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            variants={{
              hidden: { rotate: 0, scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
              visible: { rotate: 0, scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
              hover: {
                rotate: effect.iconRotate,
                scale: 1.05,
                boxShadow: `0 0 30px ${module.accentColor}32`,
              },
            }}
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
            style={{
              background: `${module.accentColor}18`,
              border: `1px solid ${module.accentColor}30`,
            }}
          >
            <ModuleIcon name={module.iconName} color={module.accentColor} />
          </motion.div>

          <span className="text-[10px] font-semibold tracking-widest px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.10] text-zinc-400">
            {tierLabel}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-2xl text-white leading-tight">{module.name}</h3>
          <p className="text-base text-zinc-300 leading-relaxed">{module.shortDescription}</p>
        </div>

        <ul className="flex flex-col gap-2 flex-1">
          {bullets.map((bullet, i) => (
            <motion.li
              key={i}
              variants={{
                hidden: { x: 0, color: 'rgb(161,161,170)' },
                visible: { x: 0, color: 'rgb(161,161,170)' },
                hover: { x: 2, color: 'rgba(244,244,245,0.82)' },
              }}
              transition={{ duration: 0.24, ease: EASE_PREMIUM }}
              className="flex items-start gap-2 text-sm text-zinc-400"
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: module.accentColor }}
              />
              {bullet}
            </motion.li>
          ))}
        </ul>

        <div className="pt-4 border-t border-white/[0.06]">
          <motion.div
            variants={{
              hidden: { y: 0, textShadow: `0 0 0 ${module.accentColor}00` },
              visible: { y: 0, textShadow: `0 0 0 ${module.accentColor}00` },
              hover: {
                y: -effect.priceLift,
                textShadow: `0 0 24px ${module.accentColor}66`,
              },
            }}
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
            className="flex items-baseline gap-1"
          >
            <span className="font-bold text-3xl" style={{ color: module.accentColor }}>
              ${module.priceMonthlyUsd}
            </span>
            <span className="text-sm text-zinc-500">USD/mes</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
