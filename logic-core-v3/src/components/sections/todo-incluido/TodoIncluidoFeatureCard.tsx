'use client'

import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { IncludedFeature } from './data'

function resolveLucideIcon(name: string): LucideIcon {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name]
  return Icon ?? LucideIcons.Box
}

interface TodoIncluidoFeatureCardProps {
  feature: IncludedFeature
  index: number
}

export function TodoIncluidoFeatureCard({ feature, index }: TodoIncluidoFeatureCardProps) {
  const Icon = resolveLucideIcon(feature.iconName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.08 }}
      whileHover={{ scale: 1.02 }}
      className="group relative p-8 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent transition-all duration-300 cursor-default"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        willChange: 'transform',
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${feature.accentColor}18, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px ${feature.accentColor}4D` }}
      />

      <div className="relative z-10 flex flex-col gap-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${feature.accentColor}18`,
            border: `1px solid ${feature.accentColor}30`,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <Icon size={20} strokeWidth={1.5} style={{ color: feature.accentColor }} />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-xl text-white leading-snug">{feature.title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
        </div>

        <div className="mt-auto">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              border: `1px solid ${feature.accentColor}50`,
              color: feature.accentColor,
              background: `${feature.accentColor}0D`,
            }}
          >
            {feature.highlight}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
