'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LoaderCircle, Sparkles } from 'lucide-react'
import { convertInboundToLead } from '../_actions/inbound.actions'

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

export function InboundLeadsTable({ leads }: InboundLeadsTableProps) {
  const router = useRouter()
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
    <section className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Leads inbound
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Formularios que entraron desde el portal y pueden convertirse al CRM de Agency OS.
        </p>
      </div>

      {error ? (
        <div className="border-b border-white/10 px-5 py-4 text-sm text-rose-200">
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3">
            {error}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
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
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleConvert(lead)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        Convertir a Lead OS
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
