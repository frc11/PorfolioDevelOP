'use client'

import { Card, Stat } from '@/components/ui'
import type { WeekResultsData } from '@/lib/dashboard/week-results'
import { motion } from 'framer-motion'
import { CheckCircle2, Eye, MessageSquare, UserCheck } from 'lucide-react'

interface WeekResultsGridProps {
  data: WeekResultsData
}

const ITEMS = [
  { key: 'visits', icon: Eye, tone: 'cyan' },
  { key: 'leads', icon: UserCheck, tone: 'emerald' },
  { key: 'messagesAnswered', icon: MessageSquare, tone: 'blue' },
  { key: 'tasksCompleted', icon: CheckCircle2, tone: 'violet' },
] as const

export function WeekResultsGrid({ data }: WeekResultsGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          Resultados de la Semana
        </h2>
        <span className="shrink-0 text-[10px] text-zinc-600">vs semana anterior</span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ITEMS.map((item, index) => {
          const stat = data[item.key]
          const trend =
            stat.trend === null
              ? undefined
              : stat.invertColors === undefined
                ? { value: stat.trend }
                : { value: stat.trend, invertColors: stat.invertColors }

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card>
                <Stat
                  label={stat.label}
                  value={stat.value}
                  icon={item.icon}
                  tone={item.tone}
                  size="lg"
                  trend={trend}
                />
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
