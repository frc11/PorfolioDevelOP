'use client'

import { useState } from 'react'
import { Play, Clock, Mail, CheckCircle2, XCircle } from 'lucide-react'

interface RecentSend {
  id: string
  botName: string
  orgName: string
  recipientEmail: string | null
  sentAt: Date
}

interface Props {
  totalActiveBots: number
  recentSends: RecentSend[]
}

export function ReportSettingsClient({ totalActiveBots, recentSends }: Props) {
  const [running, setRunning] = useState(false)
  const [lastResult, setLastResult] = useState<{
    ok: boolean
    sent?: number
    failed?: number
    skipped?: number
    errors?: string[]
    error?: string
  } | null>(null)

  async function triggerSendNow() {
    setRunning(true)
    setLastResult(null)
    try {
      const res = await fetch('/api/admin/reports/send-now', { method: 'POST' })
      const data = await res.json()
      setLastResult(data)
    } catch {
      setLastResult({ ok: false, error: 'Error de red' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Bots activos', value: totalActiveBots },
          { label: 'Envíos recientes', value: recentSends.length },
          {
            label: 'Último envío',
            value:
              recentSends[0]?.sentAt
                ? new Date(recentSends[0].sentAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                  })
                : '—',
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Trigger manual */}
      <div className="rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-100">Enviar reportes ahora</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Dispara el envío manual sin esperar el cron del lunes a las 9am.
            </p>
          </div>
          <button
            onClick={triggerSendNow}
            disabled={running}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={13} strokeWidth={1.5} />
            {running ? 'Enviando...' : 'Enviar ahora'}
          </button>
        </div>

        {lastResult && (
          <div
            className={`mt-4 rounded-xl border p-3 text-sm ${
              lastResult.ok
                ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300'
                : 'border-red-400/20 bg-red-400/8 text-red-300'
            }`}
          >
            {lastResult.ok ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={13} strokeWidth={1.5} />
                Enviados: {lastResult.sent} · Fallidos: {lastResult.failed} · Omitidos:{' '}
                {lastResult.skipped}
                {lastResult.errors && lastResult.errors.length > 0 && (
                  <span className="ml-2 text-red-400">
                    ({lastResult.errors.join(', ')})
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <XCircle size={13} strokeWidth={1.5} />
                Error: {lastResult.error}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cron info */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm">
        <Clock size={16} strokeWidth={1.5} className="shrink-0 text-zinc-500" />
        <p className="text-xs text-zinc-400">
          Los reportes se envían automáticamente{' '}
          <strong className="text-zinc-300">cada lunes a las 9am (Argentina)</strong>.
          Incluyen conversaciones, leads capturados y comparación vs semana anterior.
        </p>
      </div>

      {/* Audit log */}
      {recentSends.length > 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-white/8 p-4">
            <Mail size={14} strokeWidth={1.5} className="text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-200">
              Historial de envíos (últimos 20)
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentSends.map((send) => (
              <div key={send.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-200">{send.botName}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{send.orgName}</p>
                  {send.recipientEmail && (
                    <p className="mt-0.5 text-[10px] text-zinc-600">{send.recipientEmail}</p>
                  )}
                </div>
                <p className="shrink-0 text-[10px] text-zinc-600">
                  {new Date(send.sentAt).toLocaleString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
