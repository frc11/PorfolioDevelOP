'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Archive, Bot, FolderKanban, LayoutDashboard, LifeBuoy } from 'lucide-react'
import { Card } from '@/components/ui'
import { springConfig } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'chatbot', label: 'Chatbot', icon: Bot },
  { id: 'projects', label: 'Proyectos', icon: FolderKanban },
  { id: 'vault', label: 'Boveda', icon: Archive },
  { id: 'support', label: 'Soporte', icon: LifeBuoy },
] as const

interface ClientTabsNavProps {
  clientId: string
  activeTab: string
}

export function ClientTabsNav({ clientId, activeTab }: ClientTabsNavProps) {
  const reduced = useReducedMotion()

  return (
    <Card padding="none" className="flex items-center gap-1 overflow-x-auto p-1.5">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <Link
            key={tab.id}
            href={`/admin/clients/${clientId}?tab=${tab.id}`}
            scroll={false}
            className="relative inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-colors"
          >
            {isActive && reduced && (
              <div className="absolute inset-0 rounded-xl bg-cyan-400/15" />
            )}
            {isActive && !reduced && (
              <motion.div
                layoutId="client-tab-active"
                className="absolute inset-0 rounded-xl bg-cyan-400/15"
                transition={springConfig}
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
          </Link>
        )
      })}
    </Card>
  )
}
