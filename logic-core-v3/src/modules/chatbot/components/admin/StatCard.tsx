interface StatCardProps {
  label: string
  value: number | string
  format?: 'number' | 'currency' | 'compact'
  accent?: 'cyan' | 'emerald' | 'violet' | 'amber'
}

const ACCENT_COLORS = {
  cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
  emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  violet: 'border-violet-500/20 bg-violet-500/5 text-violet-400',
  amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
}

export function StatCard({ label, value, format = 'number', accent = 'cyan' }: StatCardProps) {
  const formatted =
    typeof value === 'string'
      ? value
      : format === 'currency'
      ? `$${value.toFixed(4)}`
      : format === 'compact'
      ? new Intl.NumberFormat('en', { notation: 'compact' }).format(value)
      : value.toLocaleString()

  return (
    <div className={`rounded-xl border p-4 ${ACCENT_COLORS[accent]}`}>
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold">{formatted}</p>
    </div>
  )
}
