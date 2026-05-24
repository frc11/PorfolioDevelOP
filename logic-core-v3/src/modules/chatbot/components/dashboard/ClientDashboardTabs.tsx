'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'

const TABS = [
  { id: 'overview', label: 'Overview', href: '/dashboard/chatbot' },
  { id: 'leads', label: 'Leads', href: '/dashboard/chatbot/leads' },
  { id: 'conversations', label: 'Conversaciones', href: '/dashboard/chatbot/conversations' },
  { id: 'knowledge', label: 'Información', href: '/dashboard/chatbot/knowledge' },
  { id: 'settings', label: 'Configuración', href: '/dashboard/chatbot/settings' },
  { id: 'install', label: 'Instalación', href: '/dashboard/chatbot/install' },
]

interface ClientDashboardTabsProps {
  hotLeadsCount?: number
}

export function ClientDashboardTabs({ hotLeadsCount = 0 }: ClientDashboardTabsProps) {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1 border-b border-zinc-800 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href
        const showHotDot = tab.id === 'leads' && hotLeadsCount > 0 && !isActive
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="relative px-4 py-2.5 text-sm hover:text-zinc-100 whitespace-nowrap"
            style={{ color: isActive ? '#06b6d4' : '#a1a1aa' }}
          >
            <span className="inline-flex items-center gap-1.5">
              {tab.label}
              {showHotDot && (
                <span
                  className="relative inline-flex h-2 w-2"
                  aria-label={`${hotLeadsCount} contacto${hotLeadsCount === 1 ? '' : 's'} caliente${hotLeadsCount === 1 ? '' : 's'} sin contactar`}
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/60" />
                  <span className="relative h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                </span>
              )}
            </span>
            {isActive && (
              <motion.div
                layoutId="client-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
