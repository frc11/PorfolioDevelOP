'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Sparkles, Users } from 'lucide-react'
import { Button, Card, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'
import { convertInboundToLead } from '../_actions/inbound.actions'
import type { InboundPeriod } from '../_actions/inbound.schemas'

type InboundLeadRow = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  message: string
  createdAt: string
  convertedToLeadId: string | null
}

type InboundLeadsTableProps = {
  leads: InboundLeadRow[]
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const PERIOD_LABELS: Record<InboundPeriod, string> = {
  '1w': '1 semana',
  '1m': '1 mes',
  '6m': '6 meses',
  '1y': '1 año',
  custom: 'Personalizado',
}
const PRESET_PERIODS: ReadonlyArray<Exclude<InboundPeriod, 'custom'>> = ['1w', '1m', '6m', '1y']

function buildPeriodHref(period: string, from?: string, to?: string): string {
  const params = new URLSearchParams()
  params.set('tab', 'inbound')
  params.set('period', period)
  if (period === 'custom' && from && to) {
    params.set('from', from)
    params.set('to', to)
  }
  return `/admin/leads?${params.toString()}`
}

const periodChipClass = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
    active
      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
      : 'border-white/10 bg-black/20 text-zinc-400 hover:text-zinc-200',
  )

export function InboundLeadsTable({ leads }: InboundLeadsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPeriod = searchParams.get('period') ?? '1m'
  const [customFrom, setCustomFrom] = useState(searchParams.get('from') ?? '')
  const [customTo, setCustomTo] = useState(searchParams.get('to') ?? '')
  const [showCustom, setShowCustom] = useState(currentPeriod === 'custom')
  const [localLeads, setLocalLeads] = useState(leads)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setLocalLeads(leads)
  }, [leads])

  const handleConvert = (lead: InboundLeadRow) => {
    const previousLeads = localLeads
    setError(null)
    setPendingId(lead.id)

    startTransition(async () => {
      const result = await convertInboundToLead(lead.id)

      if (!result.success) {
        setLocalLeads(previousLeads)
        setError(result.error)
        setPendingId(null)
        return
      }

      setLocalLeads((current) =>
        current.map((item) =>
          item.id === lead.id ? { ...item, convertedToLeadId: result.data.id } : item
        )
      )
      setPendingId(null)
      router.refresh()
    })
  }

  return (
    <Card padding="none" className="rounded-[28px] bg-white/5 backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Leads inbound
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Formularios que entraron desde el portal y pueden convertirse al CRM interno.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Periodo</span>
          {PRESET_PERIODS.map((period) => (
            <Link
              key={period}
              href={buildPeriodHref(period)}
              aria-current={currentPeriod === period ? 'true' : undefined}
              className={periodChipClass(currentPeriod === period)}
            >
              {PERIOD_LABELS[period]}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setShowCustom((current) => !current)}
            aria-expanded={showCustom}
            className={periodChipClass(currentPeriod === 'custom')}
          >
            {PERIOD_LABELS.custom}
          </button>
        </div>

        {showCustom ? (
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-[11px] text-zinc-400">
              Desde
              <input
                type="date"
                value={customFrom}
                onChange={(event) => setCustomFrom(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/35"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-zinc-400">
              Hasta
              <input
                type="date"
                value={customTo}
                onChange={(event) => setCustomTo(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/35"
              />
            </label>
            <Link
              href={buildPeriodHref('custom', customFrom, customTo)}
              aria-disabled={!customFrom || !customTo}
              className={cn(
                'rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                !customFrom || !customTo
                  ? 'pointer-events-none border-white/10 text-zinc-600 opacity-50'
                  : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15',
              )}
            >
              Aplicar
            </Link>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="border-b border-white/10 px-5 py-4 text-sm text-rose-200">
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3">
            {error}
          </div>
        </div>
      ) : null}

      {localLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Todavia no hay leads inbound"
          description="Cuando entren formularios desde el portal, van a aparecer aca para convertirlos al CRM."
          size="md"
        />
      ) : (
        <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-black/10 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Telefono</th>
              <th className="px-4 py-3 font-medium">Mensaje</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium text-right">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-white/[0.03]">
            {localLeads.map((lead) => {
              const isConverted = Boolean(lead.convertedToLeadId)
              const isPending = pendingId === lead.id

              return (
                <tr key={lead.id}>
                  <td className="px-4 py-4">
                    <div className="min-w-[180px]">
                      <p className="font-medium text-zinc-100">{lead.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {lead.company?.trim() || 'Sin empresa'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{lead.email}</td>
                  <td className="px-4 py-4 text-zinc-300">{lead.phone ?? 'Sin telefono'}</td>
                  <td className="max-w-[420px] px-4 py-4 text-zinc-400">
                    <p className="line-clamp-3 whitespace-pre-wrap">{lead.message}</p>
                  </td>
                  <td className="px-4 py-4 text-zinc-500">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-4 text-right">
                    {isConverted ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />
                        Ya convertido
                      </span>
                    ) : (
                      <Button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleConvert(lead)}
                        variant="secondary"
                        size="sm"
                        loading={isPending}
                        icon={<Sparkles className="h-4 w-4" />}
                        className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
                      >
                        Convertir a Lead OS
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {localLeads.map((lead) => {
          const isConverted = Boolean(lead.convertedToLeadId)
          const isPending = pendingId === lead.id

          return (
            <Card
              key={lead.id}
              padding="sm"
              className="bg-white/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-100">{lead.name}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {lead.company?.trim() || 'Sin empresa'}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-500">
                  {formatDate(lead.createdAt)}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-zinc-400">
                <p>{lead.email}</p>
                <p>{lead.phone ?? 'Sin telefono'}</p>
                <p className="line-clamp-3 whitespace-pre-wrap">{lead.message}</p>
              </div>
              <div className="mt-4">
                {isConverted ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Ya convertido
                  </span>
                ) : (
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleConvert(lead)}
                    variant="secondary"
                    size="sm"
                    loading={isPending}
                    icon={<Sparkles className="h-4 w-4" />}
                    className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
                  >
                    Convertir a Lead OS
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
        </>
      )}
    </Card>
  )
}
