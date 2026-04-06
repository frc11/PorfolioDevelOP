'use client'

import { startTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SubscriptionStatus } from '@prisma/client'
import {
  FolderKanban,
  LifeBuoy,
  LogIn,
  MessageCircle,
  ChevronRight,
} from 'lucide-react'
import { startImpersonationAction } from '../_actions/client.actions'

export type ClientCardData = {
  id: string
  companyName: string
  primaryUser: {
    name: string | null
    email: string
  } | null
  subscription: {
    status: SubscriptionStatus
    planName: string
  } | null
  healthScore: number
  counts: {
    projects: number
    tickets: number
    messages: number
  }
}

type ClientCardProps = {
  client: ClientCardData
}

function getSubscriptionVisual(status: SubscriptionStatus | null) {
  if (status === 'ACTIVE') {
    return {
      label: 'Activa',
      tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    }
  }

  if (status === 'PAST_DUE') {
    return {
      label: 'Vencida',
      tone: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
    }
  }

  return {
    label: 'Sin suscripcion',
    tone: 'border-white/10 bg-white/[0.06] text-zinc-300',
  }
}

function getHealthVisual(score: number) {
  if (score > 70) {
    return {
      tone: 'text-emerald-300',
      track: '#34d399',
      glow: 'shadow-[0_0_24px_rgba(52,211,153,0.18)]',
    }
  }

  if (score > 40) {
    return {
      tone: 'text-amber-300',
      track: '#f59e0b',
      glow: 'shadow-[0_0_24px_rgba(245,158,11,0.18)]',
    }
  }

  return {
    tone: 'text-rose-300',
    track: '#f43f5e',
    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.18)]',
  }
}

function CountPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon className="h-4 w-4 text-zinc-500" />
        <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

export function ClientCard({ client }: ClientCardProps) {
  const router = useRouter()
  const subscription = getSubscriptionVisual(client.subscription?.status ?? null)
  const health = getHealthVisual(client.healthScore)
  const progress = Math.max(0, Math.min(100, client.healthScore))
  const detailHref = `/admin/os/clients/${client.id}`

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => {
        startTransition(() => {
          router.push(detailHref)
        })
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          startTransition(() => {
            router.push(detailHref)
          })
        }
      }}
      className="group cursor-pointer rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/20 hover:bg-white/[0.07]"
    >
      <div className="relative overflow-hidden rounded-[24px] border border-white/8 bg-black/20 p-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-28 w-28 rounded-full bg-emerald-400/5 blur-3xl" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-lg font-semibold text-white">{client.companyName}</p>
                <span
                  className={[
                    'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                    subscription.tone,
                  ].join(' ')}
                >
                  {subscription.label}
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-400">
                {client.primaryUser?.name?.trim() || client.primaryUser?.email || 'Sin contacto principal'}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {client.subscription?.planName || 'Sin plan asignado'}
              </p>
            </div>

            <div
              className={[
                'relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30',
                health.glow,
              ].join(' ')}
              style={{
                background: `conic-gradient(${health.track} ${progress * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
              }}
            >
              <div className="flex h-[70px] w-[70px] flex-col items-center justify-center rounded-full border border-white/10 bg-[#05070a]/95">
                <span className={['text-lg font-semibold', health.tone].join(' ')}>{progress}</span>
                <span className="text-[9px] uppercase tracking-[0.24em] text-zinc-500">Health</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <CountPill icon={FolderKanban} label="Proyectos" value={client.counts.projects} />
            <CountPill icon={LifeBuoy} label="Tickets" value={client.counts.tickets} />
            <CountPill icon={MessageCircle} label="Mensajes" value={client.counts.messages} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <form
              action={startImpersonationAction.bind(null, client.id)}
              onClick={(event) => event.stopPropagation()}
              onSubmitCapture={(event) => event.stopPropagation()}
              className="relative z-10"
            >
              <button
                type="submit"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-400/15"
              >
                <LogIn className="h-4 w-4" />
                Impersonar
              </button>
            </form>

            <Link
              href={detailHref}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center gap-1 text-sm text-cyan-200 transition-colors hover:text-cyan-100"
            >
              Ver detalle
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
