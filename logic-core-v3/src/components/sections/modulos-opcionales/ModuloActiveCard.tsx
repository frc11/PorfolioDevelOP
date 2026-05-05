'use client'

import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PremiumModuleSeed } from '@/lib/data/premium-modules'

function resolveLucideIcon(name: string): LucideIcon {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name]
  return Icon ?? LucideIcons.Box
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

interface ModuloActiveCardProps {
  module: PremiumModuleSeed
  index: number
}

export function ModuloActiveCard({ module, index }: ModuloActiveCardProps) {
  const Icon = resolveLucideIcon(module.iconName)
  const tierLabel = TIER_LABELS[module.tier] ?? module.tier
  const bullets = MODULE_BULLETS[module.slug] ?? [module.shortDescription]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
      className="group relative p-8 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent transition-all duration-300 cursor-default"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        willChange: 'transform',
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${module.accentColor}66`,
          background: `radial-gradient(ellipse at 20% 0%, ${module.accentColor}12, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 h-full">
        <div className="flex items-start justify-between">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: `${module.accentColor}18`,
              border: `1px solid ${module.accentColor}30`,
            }}
          >
            <Icon size={24} strokeWidth={1.5} style={{ color: module.accentColor }} />
          </div>

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
            <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: module.accentColor }}
              />
              {bullet}
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t border-white/[0.06]">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-3xl" style={{ color: module.accentColor }}>
              ${module.priceMonthlyUsd}
            </span>
            <span className="text-sm text-zinc-500">USD/mes</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
