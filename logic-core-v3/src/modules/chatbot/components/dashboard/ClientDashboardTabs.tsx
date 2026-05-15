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
]

export function ClientDashboardTabs() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1 border-b border-zinc-800 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="relative px-4 py-2.5 text-sm hover:text-zinc-100 whitespace-nowrap"
            style={{ color: isActive ? '#06b6d4' : '#a1a1aa' }}
          >
            {tab.label}
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
