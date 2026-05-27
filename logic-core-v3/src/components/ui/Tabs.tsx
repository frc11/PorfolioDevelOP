'use client'

import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type BaseItem = {
  label: string
  icon?: LucideIcon
  badge?: string | number
  disabled?: boolean
}

export type NavTabItem = BaseItem & { href: string }
export type ValueTabItem = BaseItem & { value: string }
export type TabItem = NavTabItem

type TabsCommon = {
  layoutId?: string
  className?: string
  size?: 'sm' | 'md'
}

type NavTabsProps = TabsCommon & {
  items: NavTabItem[]
  activeHref: string
  value?: never
  onValueChange?: never
}

type ValueTabsProps = TabsCommon & {
  items: ValueTabItem[]
  value: string
  onValueChange: (value: string) => void
  activeHref?: never
}

type TabsProps = NavTabsProps | ValueTabsProps

export function Tabs(props: TabsProps) {
  const { items, layoutId = 'tabs-indicator', className, size = 'md' } = props
  const isNavMode = 'activeHref' in props && props.activeHref !== undefined

  const sizing = size === 'sm' ? 'px-3 py-2 text-xs' : 'min-h-[44px] px-4 py-3 text-sm'

  return (
    <div className={cn('overflow-x-auto border-b border-white/10', className)}>
      <nav className="flex min-w-max gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = isNavMode
            ? props.activeHref === (item as NavTabItem).href ||
              props.activeHref.startsWith(`${(item as NavTabItem).href}/`)
            : props.value === (item as ValueTabItem).value

          const key = isNavMode
            ? (item as NavTabItem).href
            : (item as ValueTabItem).value

          const baseClasses = cn(
            'relative flex items-center gap-2 font-medium transition-colors',
            sizing,
            item.disabled
              ? 'cursor-not-allowed text-zinc-700'
              : isActive
                ? 'text-white'
                : 'text-zinc-500 hover:text-zinc-300',
          )

          const inner = (
            <>
              {Icon && <Icon size={15} strokeWidth={1.5} />}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge !== '' && (
                <span
                  className={cn(
                    'ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1.5 text-[9px] font-medium tabular-nums',
                    isActive
                      ? 'bg-cyan-500 text-zinc-950'
                      : 'bg-white/5 text-zinc-500',
                  )}
                >
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
            </>
          )

          if (item.disabled) {
            return (
              <span key={key} className={baseClasses}>
                {Icon && <Icon size={15} strokeWidth={1.5} />}
                <span>{item.label}</span>
              </span>
            )
          }

          if (isNavMode) {
            return (
              <Link key={key} href={(item as NavTabItem).href} className={baseClasses}>
                {inner}
              </Link>
            )
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => props.onValueChange((item as ValueTabItem).value)}
              className={baseClasses}
            >
              {inner}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
