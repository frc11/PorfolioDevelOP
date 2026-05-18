'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, ExternalLink, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Card, EmptyState } from '@/components/ui'
import {
  acknowledgeAlert,
  listAlerts,
  resolveAlert,
} from '@/modules/chatbot/server/admin/manageAlerts'

type AlertRow = Awaited<ReturnType<typeof listAlerts>>[number]

interface AlertsClientProps {
  initialAlerts: AlertRow[]
}

type Filter = 'all' | 'pending' | 'acknowledged' | 'resolved'

export function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filter, setFilter] = useState<Filter>('pending')

  const filtered = filter === 'all'
    ? alerts
    : alerts.filter((alert) => alert.status.toLowerCase() === filter)

  async function handleAck(id: string) {
    const promise = acknowledgeAlert(id)
    toast.promise(promise, {
      loading: 'Marcando como visto...',
      success: 'Alerta marcada como vista',
      error: 'Error',
    })
    await promise
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, status: 'ACKNOWLEDGED', acknowledgedAt: new Date() }
          : alert,
      ),
    )
  }

  async function handleResolve(id: string) {
    const promise = resolveAlert(id)
    toast.promise(promise, {
      loading: 'Resolviendo...',
      success: 'Alerta resuelta',
      error: 'Error',
    })
    await promise
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, status: 'RESOLVED', resolvedAt: new Date() }
          : alert,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Card padding="none" className="flex w-fit items-center gap-1 p-1.5">
        {(['all', 'pending', 'acknowledged', 'resolved'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === item
                ? 'bg-cyan-400/15 text-cyan-300'
                : 'text-zinc-400 hover:bg-white/[0.04]'
            }`}
          >
            {item === 'all' ? 'Todas' : item === 'pending' ? 'Pendientes' : item === 'acknowledged' ? 'Vistas' : 'Resueltas'}
          </button>
        ))}
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title={`Sin alertas ${filter !== 'all' ? `(${filter})` : ''}`}
          description="Todo esta funcionando correctamente"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <Card
              key={alert.id}
              padding="md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs text-zinc-500">
                      {new Date(alert.createdAt).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </span>
                  </div>
                  <h3 className="mb-1 text-base font-medium text-zinc-100">
                    {alert.title}
                  </h3>
                  <p className="mb-3 text-sm text-zinc-400">{alert.description}</p>

                  <Link
                    href={`/admin/clients/${alert.botConfig.organization.slug}/chatbot/overview`}
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                  >
                    Ver bot
                    <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                  </Link>
                </div>

                {alert.status === 'PENDING' && (
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      onClick={() => void handleAck(alert.id)}
                      variant="secondary"
                      size="sm"
                      icon={<Eye className="h-3.5 w-3.5" strokeWidth={1.5} />}
                    >
                      Visto
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void handleResolve(alert.id)}
                      variant="secondary"
                      size="sm"
                      className="border-emerald-400/30 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25"
                      icon={<CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} />}
                    >
                      Resolver
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const config = {
    CRITICAL: { label: 'Critica', color: 'text-red-300 bg-red-500/15 border-red-400/30' },
    HIGH: { label: 'Alta', color: 'text-orange-300 bg-orange-500/15 border-orange-400/30' },
    WARNING: { label: 'Warning', color: 'text-amber-300 bg-amber-500/15 border-amber-400/30' },
    INFO: { label: 'Info', color: 'text-blue-300 bg-blue-500/15 border-blue-400/30' },
  }[severity] ?? { label: severity, color: 'text-zinc-300 bg-zinc-500/15 border-zinc-400/20' }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${config.color}`}
    >
      <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
      {config.label}
    </span>
  )
}
