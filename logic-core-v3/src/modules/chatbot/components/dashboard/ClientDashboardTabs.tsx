'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

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
  const scrollRef = useRef<HTMLDivElement | null>(null)
  // Indicador de scroll: las fades laterales aparecen SOLO cuando hay overflow
  // real (mobile / viewport angosto) para que el cliente sepa que puede
  // deslizar y hay más tabs. En desktop, donde entran todas, no se ven.
  const [overflow, setOverflow] = useState({ left: false, right: false })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      setOverflow({
        left: el.scrollLeft > 1,
        right: Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth,
      })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#141618] to-transparent transition-opacity duration-200 ${
          overflow.left ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#141618] to-transparent transition-opacity duration-200 ${
          overflow.right ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <nav
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto border-b border-zinc-800 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
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
    </div>
  )
}
