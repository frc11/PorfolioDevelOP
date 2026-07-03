'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Globe, Trash2, Users } from 'lucide-react'
import { deleteAnnouncementAction } from '../_actions/announcements.actions'

export interface AdminAnnouncementRow {
  id: string
  title: string
  body: string
  audience: 'ALL' | 'ORG'
  organizationName: string | null
  publishedAt: string
  expiresAt: string | null
  readCount: number
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function expiryBadge(expiresAt: string | null): { label: string; cls: string } {
  if (!expiresAt) return { label: 'No caduca', cls: 'border-white/10 bg-white/5 text-zinc-400' }
  const expired = new Date(expiresAt).getTime() <= Date.now()
  return expired
    ? { label: 'Vencida', cls: 'border-rose-400/25 bg-rose-500/10 text-rose-300' }
    : { label: `Caduca ${formatDate(expiresAt)}`, cls: 'border-amber-400/25 bg-amber-500/10 text-amber-200' }
}

export function AnnouncementList({ announcements }: { announcements: AdminAnnouncementRow[] }) {
  const router = useRouter()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    setPendingId(id)
    startTransition(async () => {
      await deleteAnnouncementAction(id)
      setConfirmingId(null)
      setPendingId(null)
      router.refresh()
    })
  }

  if (announcements.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-sm font-medium text-zinc-300">Todavía no publicaste novedades</p>
        <p className="mt-1 text-xs text-zinc-500">Las que publiques van a aparecer acá, con su alcance y caducidad.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {announcements.map((item) => {
        const expiry = expiryBadge(item.expiresAt)
        const confirming = confirmingId === item.id
        const rowPending = isPending && pendingId === item.id

        return (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{item.body}</p>
              </div>

              {confirming ? (
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={rowPending}
                    className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                  >
                    {rowPending ? 'Retirando...' : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    disabled={rowPending}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingId(item.id)}
                  aria-label={`Retirar novedad ${item.title}`}
                  title="Retirar"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
              {item.audience === 'ALL' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-200">
                  <Globe size={11} strokeWidth={1.5} />
                  Todos los clientes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-violet-200">
                  <Building2 size={11} strokeWidth={1.5} />
                  {item.organizationName ?? 'Organización'}
                </span>
              )}
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 ${expiry.cls}`}>
                {expiry.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-400">
                <Users size={11} strokeWidth={1.5} />
                {item.readCount} {item.readCount === 1 ? 'lectura' : 'lecturas'}
              </span>
              <span className="text-zinc-600">Publicada {formatDate(item.publishedAt)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
