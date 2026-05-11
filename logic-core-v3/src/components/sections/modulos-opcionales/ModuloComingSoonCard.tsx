'use client'

import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PremiumModuleSeed } from '@/lib/data/premium-modules'

function resolveLucideIcon(name: string): LucideIcon {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name]
  return Icon ?? LucideIcons.Box
}

interface ModuloComingSoonCardProps {
  module: PremiumModuleSeed
  index: number
}

export function ModuloComingSoonCard({ module, index }: ModuloComingSoonCardProps) {
  const Icon = resolveLucideIcon(module.iconName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.07 }}
      whileHover={{ scale: 1.01 }}
      className="group relative p-5 rounded-xl border border-white/[0.07] bg-gradient-to-br from-white/[0.025] to-transparent transition-all duration-300 cursor-default"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        willChange: 'transform',
      }}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: `${module.accentColor}14`,
              border: `1px solid ${module.accentColor}25`,
            }}
          >
            <Icon size={15} strokeWidth={1.5} style={{ color: module.accentColor }} />
          </div>
          <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            PRÓXIMAMENTE
          </span>
        </div>

        <h4 className="font-semibold text-sm text-white leading-snug">{module.name}</h4>

        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {module.shortDescription}
        </p>
      </div>
    </motion.div>
  )
}
