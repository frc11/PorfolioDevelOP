'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'

interface Tab {
  id: string
  label: string
  href: (orgSlug: string) => string
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', href: (s) => `/admin/clients/${s}/chatbot/overview` },
  { id: 'config', label: 'Configuración', href: (s) => `/admin/clients/${s}/chatbot/config` },
  { id: 'knowledge', label: 'Knowledge Base', href: (s) => `/admin/clients/${s}/chatbot/knowledge` },
  { id: 'conversations', label: 'Conversaciones', href: (s) => `/admin/clients/${s}/chatbot/conversations` },
  { id: 'leads', label: 'Leads', href: (s) => `/admin/clients/${s}/chatbot/leads` },
  { id: 'activity', label: 'Actividad', href: (s) => `/admin/clients/${s}/chatbot/activity` },
]

export function ClientChatbotTabs({ orgSlug }: { orgSlug: string }) {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 border-b border-zinc-800 overflow-x-auto">
      {TABS.map((tab) => {
        const href = tab.href(orgSlug)
        const isActive = pathname === href

        return (
          <Link
            key={tab.id}
            href={href}
            className="relative px-4 py-2.5 text-sm transition-colors hover:text-zinc-100 whitespace-nowrap"
            style={{ color: isActive ? '#06b6d4' : '#a1a1aa' }}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="chatbot-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
