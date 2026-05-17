'use client'

import { motion } from 'motion/react'
import { Cog, Layers, MessageSquare, Palette, Settings } from 'lucide-react'

const TABS = [
  { id: 'identity', label: 'Identidad', icon: Settings },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'style', label: 'Estilo', icon: Layers },
  { id: 'behavior', label: 'Comportamiento', icon: MessageSquare },
  { id: 'advanced', label: 'Avanzado', icon: Cog },
] as const

export type ConfigTab = typeof TABS[number]['id']

interface ConfigTabsProps {
  active: ConfigTab
  onChange: (tab: ConfigTab) => void
}

export function ConfigTabs({ active, onChange }: ConfigTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.02] p-1.5">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="config-tab-active"
                className="absolute inset-0 rounded-xl bg-cyan-400/15"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon
                className={`h-4 w-4 ${isActive ? 'text-cyan-300' : 'text-zinc-400'}`}
                strokeWidth={1.5}
              />
              <span className={isActive ? 'text-cyan-300' : 'text-zinc-400'}>
                {tab.label}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
