'use client'

import { useDeferredValue, useState } from 'react'
import { Building2, Search } from 'lucide-react'
import { EmptyState } from '@/app/(protected)/admin/os/_components/empty-state'
import { ClientCard, type ClientCardData } from './client-card'

type ClientListProps = {
  clients: ClientCardData[]
}

type SubscriptionFilter = 'ALL' | 'ACTIVE' | 'PAST_DUE' | 'NONE'

const FILTER_OPTIONS: Array<{ value: SubscriptionFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'PAST_DUE', label: 'Vencida' },
  { value: 'NONE', label: 'Sin suscripcion' },
]

function getSubscriptionFilterValue(client: ClientCardData): SubscriptionFilter {
  if (client.subscription?.status === 'ACTIVE') {
    return 'ACTIVE'
  }

  if (client.subscription?.status === 'PAST_DUE') {
    return 'PAST_DUE'
  }

  return 'NONE'
}

export function ClientList({ clients }: ClientListProps) {
  const [query, setQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<SubscriptionFilter>('ALL')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  const filteredClients = clients.filter((client) => {
    const matchesFilter =
      selectedFilter === 'ALL'
        ? true
        : getSubscriptionFilterValue(client) === selectedFilter

    const matchesQuery =
      deferredQuery.length === 0
        ? true
        : client.companyName.toLowerCase().includes(deferredQuery)

    return matchesFilter && matchesQuery
  })

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre de empresa"
              className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-400/30"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const isActive = selectedFilter === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedFilter(option.value)}
                  className={[
                    'rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
                      : 'border-white/10 bg-black/20 text-zinc-300 hover:bg-white/5',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4 text-xs uppercase tracking-[0.22em] text-zinc-600">
          {filteredClients.length} resultado(s)
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hay clientes para mostrar"
          description="Ajusta la busqueda o cambia el filtro de suscripcion para ver mas resultados."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  )
}
