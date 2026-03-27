'use client'

import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'OPEN', label: 'Abierto' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'RESOLVED', label: 'Resuelto' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
]

interface TicketsFiltersProps {
  currentStatus?: string
  currentPriority?: string
}

export function TicketsFilters({ currentStatus, currentPriority }: TicketsFiltersProps) {
  const router = useRouter()

  function navigate(status?: string, priority?: string) {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (priority) params.set('priority', priority)
    const qs = params.toString()
    router.push(`/admin/tickets${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-1">
        {STATUS_OPTIONS.map(({ value, label }) => {
          const isActive = (currentStatus ?? '') === value
          return (
            <button
              key={value || 'all'}
              type="button"
              onClick={() => navigate(value || undefined, currentPriority)}
              className={[
                'rounded-xl px-3 py-2 text-xs font-medium transition-all',
                isActive ? 'bg-cyan-400/10 text-cyan-200' : 'text-zinc-500 hover:text-zinc-200',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>

      <select
        value={currentPriority ?? ''}
        onChange={(e) => navigate(currentStatus, e.target.value || undefined)}
        className="admin-input w-auto min-w-[180px] cursor-pointer pr-10 text-xs font-medium text-zinc-300"
      >
        {PRIORITY_OPTIONS.map(({ value, label }) => (
          <option key={value || 'all'} value={value} className="bg-[#0d0f10]">
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
