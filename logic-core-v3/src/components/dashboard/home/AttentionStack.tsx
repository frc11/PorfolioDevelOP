'use client'

import { Badge, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { AttentionItem, AttentionPriority } from '@/lib/dashboard/attention'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  MessageSquare,
  Star,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

interface AttentionStackProps {
  items: AttentionItem[]
}

const ICON_MAP: Record<AttentionItem['type'], LucideIcon> = {
  billing: AlertTriangle,
  approval: CheckSquare,
  message: MessageSquare,
  connection: Wifi,
  review: Star,
}

const PRIORITY_STYLES: Record<
  AttentionPriority,
  {
    border: string
    bg: string
    iconBg: string
    glow: string
    badgeTone: 'rose' | 'amber' | 'blue' | 'cyan'
    badgeLabel: string
  }
> = {
  critical: {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/[0.06]',
    iconBg: 'bg-rose-500/15 text-rose-400',
    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.10)]',
    badgeTone: 'rose',
    badgeLabel: 'Critico',
  },
  high: {
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/[0.05]',
    iconBg: 'bg-amber-500/15 text-amber-400',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)]',
    badgeTone: 'amber',
    badgeLabel: 'Alta',
  },
  medium: {
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/[0.04]',
    iconBg: 'bg-blue-500/15 text-blue-400',
    glow: '',
    badgeTone: 'blue',
    badgeLabel: 'Media',
  },
  low: {
    border: 'border-cyan-500/15',
    bg: 'bg-cyan-500/[0.03]',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
    glow: '',
    badgeTone: 'cyan',
    badgeLabel: 'Baja',
  },
}

export function AttentionStack({ items }: AttentionStackProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          Atencion hoy · {items.length}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = ICON_MAP[item.type]
          const styles = PRIORITY_STYLES[item.priority]

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={item.ctaHref} className="block min-h-[44px]">
                <Card
                  padding="none"
                  className={cn(
                    'group overflow-hidden border p-5 transition-all duration-300 hover:scale-[1.005]',
                    styles.border,
                    styles.bg,
                    styles.glow,
                  )}
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-current opacity-[0.04] blur-3xl pointer-events-none" />

                  <div className="relative flex items-start gap-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5',
                        styles.iconBg,
                      )}
                    >
                      <Icon size={18} strokeWidth={1.75} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white sm:text-base">{item.title}</h3>
                        <Badge tone={styles.badgeTone} size="xs">
                          {styles.badgeLabel}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400 sm:text-sm">{item.description}</p>
                      {item.meta && <p className="mt-1 text-[10px] text-zinc-600">{item.meta}</p>}
                    </div>

                    <div className="hidden items-center gap-2 text-xs font-semibold text-zinc-300 transition-colors group-hover:text-white sm:flex">
                      {item.ctaLabel}
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-300 sm:hidden">
                    {item.ctaLabel}
                    <ArrowRight size={13} />
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
