'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type TabItem = {
  href: string
  label: string
  icon?: LucideIcon
  badge?: string | number
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  activeHref: string
  layoutId?: string
  className?: string
}

export function Tabs({ items, activeHref, layoutId = 'tabs-indicator', className }: TabsProps) {
  return (
    <div className={cn('overflow-x-auto border-b border-white/10', className)}>
      <nav className="flex min-w-max gap-1">
        {items.map((item) => {
          const isActive = activeHref === item.href || activeHref.startsWith(`${item.href}/`)
          const Icon = item.icon

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="relative flex cursor-not-allowed items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-700"
              >
                {Icon && <Icon size={15} strokeWidth={1.75} />}
                {item.label}
              </span>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex min-h-[44px] items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              {Icon && <Icon size={15} strokeWidth={1.75} />}
              {item.label}
              {item.badge !== undefined && Number(item.badge) > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[9px] font-bold text-zinc-950">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
