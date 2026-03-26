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
      {/* Status tabs */}
      <div
        className="flex items-center gap-0.5 rounded-xl p-1"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {STATUS_OPTIONS.map(({ value, label }) => {
          const isActive = (currentStatus ?? '') === value
          return (
            <button
              key={value || 'all'}
              onClick={() => navigate(value || undefined, currentPriority)}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                isActive ? 'text-zinc-100' : 'text-zinc-600 hover:text-zinc-400',
              ].join(' ')}
              style={isActive ? { background: 'rgba(255,255,255,0.08)' } : {}}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Priority dropdown */}
      <select
        value={currentPriority ?? ''}
        onChange={(e) => navigate(currentStatus, e.target.value || undefined)}
        className="cursor-pointer rounded-xl px-3 py-[9px] text-xs font-medium text-zinc-500 outline-none transition-colors hover:text-zinc-300"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
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
