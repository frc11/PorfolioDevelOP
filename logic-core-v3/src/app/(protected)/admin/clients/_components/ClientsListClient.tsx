'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Bot, Building2, Download, Pause, Pin, PinOff, Plus, Search } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { bulkExportLeads, bulkPauseBots } from '@/lib/bulk-actions'

interface ClientItem {
  id: string
  companyName: string
  slug: string
  siteUrl: string | null
  whatsapp: string | null
  botConfig: { isActive: boolean; monthlyQuota: number } | null
  subscription: { status: string; planName: string } | null
  _count: { projects: number; tickets: number; messages: number }
  createdAt: string
}

interface ClientsListClientProps {
  clients: ClientItem[]
}

const PIN_KEY = 'develop:admin:pinned-clients'

export function ClientsListClient({ clients }: ClientsListClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterBot, setFilterBot] = useState<
    'all' | 'active' | 'inactive' | 'none'
  >('all')
  const [sortBy, setSortBy] = useState<'created' | 'name' | 'activity'>(
    'created',
  )
  const [pinned, setPinned] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PIN_KEY)
      setPinned(raw ? new Set(JSON.parse(raw) as string[]) : new Set())
    } catch {
      setPinned(new Set())
    }
  }, [])

  function togglePin(id: string) {
    const next = new Set(pinned)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setPinned(next)

    try {
      localStorage.setItem(PIN_KEY, JSON.stringify([...next]))
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }
  }

  function toggleSelected(id: string) {
    const next = new Set(selected)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelected(next)
  }

  function selectAll() {
    setSelected(new Set(filtered.map((client) => client.id)))
  }

  function deselectAll() {
    setSelected(new Set())
  }

  async function handleBulkExportLeads() {
    const result = await bulkExportLeads([...selected])
    if (!result.ok) return

    const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success(`${result.count} leads exportados`)
  }

  async function handleBulkPauseBots() {
    if (!confirm(`Pausar bots de ${selected.size} clientes?`)) return

    const promise = bulkPauseBots([...selected])
    toast.promise(promise, {
      loading: 'Pausando bots...',
      success: (result) => `${result.affected} bots pausados`,
      error: 'Error pausando bots',
    })
    await promise
    deselectAll()
    router.refresh()
  }

  const filtered = useMemo(() => {
    let result = clients

    if (search.trim()) {
      const s = search.trim().toLowerCase()
      result = result.filter(
        (client) =>
          client.companyName.toLowerCase().includes(s) ||
          client.slug.toLowerCase().includes(s) ||
          client.siteUrl?.toLowerCase().includes(s) ||
          client.whatsapp?.toLowerCase().includes(s),
      )
    }

    if (filterBot !== 'all') {
      result = result.filter((client) => {
        if (filterBot === 'none') return !client.botConfig
        if (filterBot === 'active') return client.botConfig?.isActive
        if (filterBot === 'inactive') {
          return client.botConfig && !client.botConfig.isActive
        }
        return true
      })
    }

    const sorted = [...result]
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.companyName.localeCompare(b.companyName))
    } else if (sortBy === 'created') {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    } else if (sortBy === 'activity') {
      sorted.sort(
        (a, b) =>
          b._count.messages +
          b._count.tickets -
          (a._count.messages + a._count.tickets),
      )
    }

    return [
      ...sorted.filter((client) => pinned.has(client.id)),
      ...sorted.filter((client) => !pinned.has(client.id)),
    ]
  }, [clients, filterBot, pinned, search, sortBy])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, slug, web o WhatsApp..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.02] py-2.5 pl-10 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-400/30 focus:outline-none"
          />
        </div>

        <select
          value={filterBot}
          onChange={(event) =>
            setFilterBot(
              event.target.value as 'all' | 'active' | 'inactive' | 'none',
            )
          }
          className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-200 focus:border-cyan-400/30 focus:outline-none"
        >
          <option value="all">Todos los bots</option>
          <option value="active">Bot activo</option>
          <option value="inactive">Bot pausado</option>
          <option value="none">Sin bot</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value as 'created' | 'name' | 'activity')
          }
          className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-200 focus:border-cyan-400/30 focus:outline-none"
        >
          <option value="created">Recientes primero</option>
          <option value="name">Nombre A-Z</option>
          <option value="activity">Mas activos</option>
        </select>

        <Link
          href="/admin/clients/new"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-cyan-300"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Nuevo cliente
        </Link>
      </div>

      <p className="text-xs text-zinc-500">
        Mostrando {filtered.length} de {clients.length}
      </p>

      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-4 z-30 flex flex-col gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/[0.08] p-3 backdrop-blur md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-cyan-300">
              {selected.size} cliente{selected.size !== 1 ? 's' : ''}{' '}
              seleccionado{selected.size !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Deseleccionar
            </button>
            {selected.size < filtered.length && (
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Seleccionar visibles
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBulkExportLeads}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
              Exportar leads
            </button>
            <button
              type="button"
              onClick={handleBulkPauseBots}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/20 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-400/30"
            >
              <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
              Pausar bots
            </button>
          </div>
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={search ? `Sin resultados para "${search}"` : 'Sin clientes'}
          description="Ajusta la busqueda o los filtros para encontrar clientes."
          cta={{ label: 'Nuevo cliente', href: '/admin/clients/new' }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              pinned={pinned.has(client.id)}
              selected={selected.has(client.id)}
              onTogglePin={() => togglePin(client.id)}
              onToggleSelect={() => toggleSelected(client.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ClientCard({
  client,
  pinned,
  selected,
  onTogglePin,
  onToggleSelect,
}: {
  client: ClientItem
  pinned: boolean
  selected: boolean
  onTogglePin: () => void
  onToggleSelect: () => void
}) {
  return (
    <div
      className={`group relative rounded-2xl border bg-white/[0.02] transition-colors hover:bg-white/[0.04] ${
        selected ? 'border-cyan-400/40' : 'border-white/10'
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        onClick={(event) => event.stopPropagation()}
        className="absolute left-3 top-3 z-10 h-4 w-4 rounded border-white/20 bg-white/[0.05] accent-cyan-400"
        aria-label={`Seleccionar ${client.companyName}`}
      />
      <Link href={`/admin/clients/${client.id}`} className="block p-5">
        <div className="mb-3 flex items-start justify-between gap-3 pl-6 pr-8">
          <div className="rounded-xl bg-cyan-400/10 p-2">
            <Building2 className="h-4 w-4 text-cyan-300" strokeWidth={1.5} />
          </div>
          {client.botConfig && (
            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                client.botConfig.isActive
                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-500'
              }`}
            >
              <Bot className="h-2.5 w-2.5" strokeWidth={2} />
              {client.botConfig.isActive ? 'Activo' : 'Pausado'}
            </span>
          )}
        </div>

        <h3 className="mb-1 text-base font-medium text-zinc-100">
          {client.companyName}
        </h3>
        <p className="mb-3 text-xs font-mono text-zinc-500">{client.slug}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500">
          <span>{client.subscription?.planName ?? 'Sin plan'}</span>
          {client.siteUrl && <span>{client.siteUrl}</span>}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
          <div>
            <p className="text-sm font-medium text-zinc-200">
              {client._count.projects}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              Proy
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">
              {client._count.tickets}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              Tickets
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">
              {client._count.messages}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              Msgs
            </p>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={onTogglePin}
        className="absolute right-3 top-3 rounded-lg p-1.5 opacity-0 transition-opacity hover:bg-white/[0.05] group-hover:opacity-100"
        aria-label={pinned ? 'Despinear' : 'Pinear'}
      >
        {pinned ? (
          <Pin className="h-3.5 w-3.5 text-cyan-400" strokeWidth={2} />
        ) : (
          <PinOff className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
        )}
      </button>
    </div>
  )
}
