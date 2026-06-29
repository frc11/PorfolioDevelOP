'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Archive, ArchiveRestore, Bot, Building2, Check, Download, Loader2, Pause, Pin, PinOff, Plus, Search, Trash2, X } from 'lucide-react'
import { Button, Card, Input, Select } from '@/components/ui'
import { EmptyStateMuted, emptyMutedCtaCls } from '@/components/ui/EmptyStateMuted'
import { InlineConfirm } from '@/app/(protected)/admin/_components/inline-confirm'
import { TypeToConfirmDialog } from '@/app/(protected)/admin/_components/type-to-confirm-dialog'
import { archiveClient, unarchiveClient } from '@/modules/chatbot/server/admin/archiveClient'
import { getClientDeletionSummary, hardDeleteClient } from '@/modules/chatbot/server/admin/hardDeleteClient'
import { ClientAvatar } from '@/modules/chatbot/components/admin/client-avatar/ClientAvatar'
import { bulkExportLeads, bulkPauseBots } from '@/lib/bulk-actions'
import { hoverLift, staggerContainer, staggerItem } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'

interface ClientItem {
  id: string
  companyName: string
  slug: string
  siteUrl: string | null
  whatsapp: string | null
  avatarImageUrl: string | null
  avatarEmoji: string | null
  avatarInitials: string | null
  botConfig: { isActive: boolean; monthlyQuota: number } | null
  subscription: { status: string; plan: { name: string } | null } | null
  _count: { projects: number; tickets: number; messages: number }
  createdAt: string
}

interface ClientsListClientProps {
  clients: ClientItem[]
  archivedClients: ClientItem[]
}

const PIN_KEY = 'develop:admin:pinned-clients'

// El detalle de borrado se deriva del retorno de la action (un archivo 'use server'
// exporta solo funciones async, así que no exportamos el tipo nombrado).
type DeletionSummary = Awaited<ReturnType<typeof getClientDeletionSummary>>['summary']

export function ClientsListClient({ clients, archivedClients }: ClientsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reduced = useReducedMotion()
  const [search, setSearch] = useState('')
  const [filterBot, setFilterBot] = useState<
    'all' | 'active' | 'inactive' | 'none'
  >('all')
  const [sortBy, setSortBy] = useState<'created' | 'name' | 'activity'>(
    'created',
  )
  const [mounted, setMounted] = useState(false)
  const [pinned, setPinned] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState<'export' | 'pause' | null>(
    null,
  )
  const [showArchived, setShowArchived] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteSummary, setDeleteSummary] = useState<DeletionSummary | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PIN_KEY)
      setPinned(raw ? new Set(JSON.parse(raw) as string[]) : new Set())
    } catch {
      setPinned(new Set())
    }
  }, [])

  useEffect(() => {
    setMounted(true)
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
    setBulkLoading('export')
    try {
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
    } finally {
      setBulkLoading(null)
    }
  }

  async function handleBulkPauseBots() {
    if (!confirm(`Pausar bots de ${selected.size} clientes?`)) return

    setBulkLoading('pause')
    try {
      const promise = bulkPauseBots([...selected])
      toast.promise(promise, {
        loading: 'Pausando bots...',
        success: (result) => `${result.affected} bots pausados`,
        error: 'Error pausando bots',
      })
      await promise
      deselectAll()
      router.refresh()
    } finally {
      setBulkLoading(null)
    }
  }

  function switchView(archived: boolean) {
    setShowArchived(archived)
    setSelected(new Set())
  }

  async function handleArchive(id: string) {
    setPendingId(id)
    try {
      await archiveClient({ organizationId: id })
      toast.success('Cliente archivado')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo archivar el cliente')
    } finally {
      setPendingId(null)
    }
  }

  async function handleUnarchive(id: string) {
    setPendingId(id)
    try {
      await unarchiveClient({ organizationId: id })
      toast.success('Cliente desarchivado')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo desarchivar el cliente')
    } finally {
      setPendingId(null)
    }
  }

  // Hard-delete: trae el detalle (counts) para el modal, exige escribir "ELIMINAR",
  // y al confirmar borra (cascada) + audit. El target se trackea en `deleteTargetId`
  // para soportar tanto la selección (1 cliente) como el deep-link ?delete=<orgId>
  // (p. ej. desde un ticket "Solicitud de eliminación de cuenta"). La action y el
  // TypeToConfirmDialog se reusan tal cual; sólo cambia de dónde sale el id.
  const openDeleteFor = useCallback(async (id: string) => {
    setDeleteTargetId(id)
    setDeleteLoading(true)
    try {
      const res = await getClientDeletionSummary({ organizationId: id })
      setDeleteSummary(res.summary)
      setDeleteOpen(true)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'No se pudo cargar el detalle del cliente',
      )
      setDeleteTargetId(null)
    } finally {
      setDeleteLoading(false)
    }
  }, [])

  async function openDelete() {
    if (selected.size !== 1) return
    const [id] = [...selected]
    await openDeleteFor(id)
  }

  function closeDelete() {
    if (deletePending) return
    setDeleteOpen(false)
    setDeleteSummary(null)
    setDeleteTargetId(null)
  }

  async function confirmDelete() {
    if (!deleteTargetId) return
    const id = deleteTargetId
    setDeletePending(true)
    try {
      const res = await hardDeleteClient({ organizationId: id })
      toast.success(
        `Cliente eliminado · ${res.preservedLeads} lead${
          res.preservedLeads === 1 ? '' : 's'
        } preservado${res.preservedLeads === 1 ? '' : 's'} en el pipeline`,
      )
      setDeleteOpen(false)
      setDeleteSummary(null)
      setDeleteTargetId(null)
      deselectAll()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo eliminar el cliente')
    } finally {
      setDeletePending(false)
    }
  }

  // Deep-link /admin/clients?delete=<orgId>: abre el confirm de borrado del cliente
  // correspondiente (lo usa el bloque "Ir a borrar" del ticket de eliminación).
  // Corre una sola vez gracias al ref-guard.
  const didAutoOpenDelete = useRef(false)
  useEffect(() => {
    if (didAutoOpenDelete.current) return
    const target = searchParams.get('delete')
    if (target) {
      didAutoOpenDelete.current = true
      void openDeleteFor(target)
    }
  }, [searchParams, openDeleteFor])

  const filtered = useMemo(() => {
    let result = showArchived ? archivedClients : clients

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
  }, [archivedClients, clients, filterBot, pinned, search, showArchived, sortBy])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            strokeWidth={1.5}
          />
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, slug, web o WhatsApp..."
            className="rounded-2xl py-2.5 pl-10"
          />
        </div>

        <Select
          value={filterBot}
          onChange={(event) =>
            setFilterBot(
              event.target.value as 'all' | 'active' | 'inactive' | 'none',
            )
          }
          className="w-auto rounded-2xl py-2.5"
          options={[
            { value: 'all', label: 'Todos los bots' },
            { value: 'active', label: 'Bot activo' },
            { value: 'inactive', label: 'Bot pausado' },
            { value: 'none', label: 'Sin bot' },
          ]}
        />

        <Select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value as 'created' | 'name' | 'activity')
          }
          className="w-auto rounded-2xl py-2.5"
          options={[
            { value: 'created', label: 'Recientes primero' },
            { value: 'name', label: 'Nombre A-Z' },
            { value: 'activity', label: 'Mas activos' },
          ]}
        />

        <Link
          href="/admin/clients/new"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-cyan-300"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Nuevo cliente
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-0.5">
          <button
            type="button"
            onClick={() => switchView(false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !showArchived
                ? 'bg-white/10 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Activos
          </button>
          <button
            type="button"
            onClick={() => switchView(true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              showArchived
                ? 'bg-white/10 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Archivados{archivedClients.length > 0 ? ` (${archivedClients.length})` : ''}
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          Mostrando {filtered.length} de{' '}
          {(showArchived ? archivedClients : clients).length}
        </p>
      </div>

      {selected.size > 0 && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="sticky top-4 z-30 flex flex-col gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/[0.08] p-3 backdrop-blur md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-cyan-300">
              {selected.size} cliente{selected.size !== 1 ? 's' : ''}{' '}
              seleccionado{selected.size !== 1 ? 's' : ''}
            </span>
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
            <Button
              type="button"
              onClick={handleBulkExportLeads}
              variant="secondary"
              size="sm"
              loading={bulkLoading === 'export'}
              icon={<Download className="h-3.5 w-3.5" strokeWidth={1.5} />}
            >
              Exportar leads
            </Button>
            <Button
              type="button"
              onClick={handleBulkPauseBots}
              variant="secondary"
              size="sm"
              loading={bulkLoading === 'pause'}
              className="border-amber-400/30 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30"
              icon={<Pause className="h-3.5 w-3.5" strokeWidth={1.5} />}
            >
              Pausar bots
            </Button>
            <button
              type="button"
              onClick={openDelete}
              disabled={selected.size !== 1 || deleteLoading}
              title={
                selected.size !== 1
                  ? 'Seleccioná un solo cliente para eliminar'
                  : 'Eliminar cliente (irreversible)'
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleteLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
              ) : (
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
              Eliminar
            </button>
            <button
              type="button"
              onClick={deselectAll}
              aria-label="Limpiar selección"
              title="Limpiar selección"
              className="ml-1 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <EmptyStateMuted
          icon={showArchived ? Archive : Building2}
          title={
            search
              ? `Sin resultados para "${search}"`
              : showArchived
                ? 'Sin clientes archivados'
                : 'Sin clientes'
          }
          description={
            showArchived
              ? 'Los clientes que archives van a aparecer aca.'
              : 'Ajusta la busqueda o los filtros para encontrar clientes.'
          }
        >
          {!showArchived && (
            <Link href="/admin/clients/new" className={emptyMutedCtaCls}>
              Nuevo cliente
            </Link>
          )}
        </EmptyStateMuted>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced || mounted ? false : 'hidden'}
          animate={reduced ? undefined : 'visible'}
        >
          {filtered.map((client) => (
            <motion.div
              key={client.id}
              variants={reduced ? undefined : staggerItem}
              className="h-full"
            >
              <ClientCard
                client={client}
                pinned={pinned.has(client.id)}
                selected={selected.has(client.id)}
                selectionMode={!showArchived && selected.size > 0}
                reduced={reduced}
                archived={showArchived}
                actionPending={pendingId === client.id}
                onTogglePin={() => togglePin(client.id)}
                onToggleSelect={() => toggleSelected(client.id)}
                onArchive={() => handleArchive(client.id)}
                onUnarchive={() => handleUnarchive(client.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {deleteOpen && deleteSummary && (
        <TypeToConfirmDialog
          open
          onClose={closeDelete}
          onConfirm={confirmDelete}
          title="Eliminar cliente"
          confirmPhrase="ELIMINAR"
          confirmLabel="Eliminar definitivamente"
          isPending={deletePending}
          description={<DeleteSummaryDetail summary={deleteSummary} />}
        />
      )}
    </div>
  )
}

function DeleteSummaryDetail({ summary }: { summary: DeletionSummary }) {
  const items: string[] = [
    `${summary.projects} proyecto${summary.projects === 1 ? '' : 's'}`,
    `${summary.tickets} ticket${summary.tickets === 1 ? '' : 's'}`,
    `${summary.messages} mensaje${summary.messages === 1 ? '' : 's'}`,
    `${summary.assets} archivo${summary.assets === 1 ? '' : 's'}`,
  ]
  if (summary.hasBot) {
    items.push(
      `el bot${summary.botName ? ` "${summary.botName}"` : ''} (${summary.deletedConversations} conversaciones, ${summary.deletedBotLeads} leads del bot no convertidos)`,
    )
  }
  if (summary.hasSubscription) {
    items.push('su suscripción')
  }

  return (
    <div className="space-y-3">
      <p>
        Vas a eliminar{' '}
        <span className="font-medium text-zinc-100">{summary.companyName}</span> y todo
        lo suyo de forma{' '}
        <span className="font-semibold text-rose-300">irreversible</span>:
      </p>
      <ul className="list-disc space-y-0.5 pl-5 text-zinc-300">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <p className="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-2 text-emerald-200">
        Se preservan {summary.preservedLeads} lead
        {summary.preservedLeads === 1 ? '' : 's'} en el pipeline de ventas (no se borran).
      </p>
    </div>
  )
}

function ClientCard({
  client,
  pinned,
  selected,
  selectionMode,
  reduced,
  archived,
  actionPending,
  onTogglePin,
  onToggleSelect,
  onArchive,
  onUnarchive,
}: {
  client: ClientItem
  pinned: boolean
  selected: boolean
  selectionMode: boolean
  reduced: boolean
  archived: boolean
  actionPending: boolean
  onTogglePin: () => void
  onToggleSelect: () => void
  onArchive: () => void
  onUnarchive: () => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <motion.div className="h-full" {...(reduced ? {} : hoverLift)}>
      <Card
        padding="none"
        className={`group relative h-full hover:border-white/20 hover:bg-white/[0.04] ${
          selected ? 'border-cyan-400/40' : 'border-white/10'
        }`}
      >
        {!archived && (
          <label
            className="absolute left-3 top-3 z-10 inline-flex cursor-pointer"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              aria-label={`Seleccionar ${client.companyName}`}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-md border border-white/20 bg-zinc-950/80 text-transparent shadow-sm backdrop-blur transition-colors peer-hover:border-white/40 peer-checked:border-cyan-400 peer-checked:bg-cyan-400 peer-checked:text-zinc-950 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-zinc-950"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </label>
        )}
        <Link
          href={`/admin/clients/${client.id}`}
          className="block p-5"
          onClick={
            selectionMode
              ? (event) => {
                  event.preventDefault()
                  onToggleSelect()
                }
              : undefined
          }
          aria-label={
            selectionMode
              ? `${selected ? 'Deseleccionar' : 'Seleccionar'} ${client.companyName}`
              : undefined
          }
        >
          <div className="mb-3 flex items-start justify-between gap-3 pl-6 pr-20">
            <ClientAvatar
              companyName={client.companyName}
              avatarImageUrl={client.avatarImageUrl}
              avatarEmoji={client.avatarEmoji}
              avatarInitials={client.avatarInitials}
              size={36}
            />
            {!archived && client.botConfig && (
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
            <span>{client.subscription?.plan?.name ?? 'Sin plan'}</span>
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

        {!archived && (
          <div className="absolute right-3 top-3 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={actionPending}
              className="rounded-lg p-1.5 text-zinc-500 opacity-0 transition-opacity hover:bg-white/[0.05] hover:text-amber-300 group-hover:opacity-100 disabled:opacity-50"
              aria-label={`Archivar ${client.companyName}`}
              title="Archivar cliente"
            >
              <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={onTogglePin}
              className="rounded-lg p-1.5 opacity-0 transition-opacity hover:bg-white/[0.05] group-hover:opacity-100"
              aria-label={pinned ? 'Despinear' : 'Pinear'}
            >
              {pinned ? (
                <Pin className="h-3.5 w-3.5 text-cyan-400" strokeWidth={2} />
              ) : (
                <PinOff className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
              )}
            </button>
          </div>
        )}

        {archived && (
          <button
            type="button"
            onClick={onUnarchive}
            disabled={actionPending}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
            aria-label={`Desarchivar ${client.companyName}`}
          >
            {actionPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
            ) : (
              <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            Desarchivar
          </button>
        )}

        <InlineConfirm
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false)
            onArchive()
          }}
          title="Archivar cliente"
          description={
            <>
              Se archiva{' '}
              <span className="font-medium text-zinc-100">{client.companyName}</span>{' '}
              y deja de aparecer en la lista de activos. Es reversible: su bot,
              proyectos y tickets quedan intactos.
            </>
          }
          confirmLabel="Archivar"
          isPending={actionPending}
        />
      </Card>
    </motion.div>
  )
}
