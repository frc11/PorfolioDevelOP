import { Card } from '@/components/ui/Card'
import type { LucideIcon } from 'lucide-react'

interface BusinessStatCardProps {
  label: string
  value: string | number
  description?: string
  icon?: LucideIcon
  accent?: 'cyan' | 'emerald' | 'violet' | 'amber'
  context?: string
}

const ACCENT: Record<string, { text: string; bg: string }> = {
  cyan: { text: 'text-cyan-300', bg: 'bg-cyan-400/10' },
  emerald: { text: 'text-emerald-300', bg: 'bg-emerald-400/10' },
  violet: { text: 'text-violet-300', bg: 'bg-violet-400/10' },
  amber: { text: 'text-amber-300', bg: 'bg-amber-400/10' },
}

export function BusinessStatCard({
  label,
  value,
  description,
  icon: Icon,
  accent = 'cyan',
  context,
}: BusinessStatCardProps) {
  const colors = ACCENT[accent]

  return (
    <Card padding="lg">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
        {Icon && (
          <div className={`rounded-xl p-2 ${colors.bg}`}>
            <Icon className={`h-4 w-4 ${colors.text}`} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <p className="text-3xl font-semibold tracking-tight text-zinc-100">{value}</p>

      {context && <p className="mt-1 text-xs text-zinc-500">{context}</p>}

      {description && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{description}</p>
      )}
    </Card>
  )
}
