'use client'

import { useState } from 'react'
import { FileDown, Loader2, AlertCircle } from 'lucide-react'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function monthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  return `${MONTHS_ES[parseInt(month) - 1] ?? month} ${year}`
}

function prevMonth(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-').map(Number)
  if (month === 1) return `${year - 1}-12`
  return `${year}-${String(month - 1).padStart(2, '0')}`
}

function currentYYYYMM(): string {
  return new Date().toISOString().slice(0, 7)
}

interface DownloadReportButtonProps {
  /** Pass clientId only if the button is used in an admin context. In the client dashboard, omit it. */
  clientId?: string
  variant?: 'primary' | 'ghost'
  month?: string // "YYYY-MM", defaults to current month
}

function useDownload(month: string, clientId?: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const download = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ month })
      if (clientId) params.set('clientId', clientId)

      const res = await fetch(`/api/reports/monthly?${params}`)

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Error ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Extract filename from Content-Disposition header if present
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="(.+)"/)
      a.download = match?.[1] ?? `reporte-${month}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return { download, loading, error }
}

function ReportButton({
  month,
  clientId,
  variant = 'primary',
}: DownloadReportButtonProps & { month: string }) {
  const { download, loading, error } = useDownload(month, clientId)

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={download}
        disabled={loading}
        className={[
          'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
          variant === 'primary'
            ? 'bg-cyan-600 text-white hover:bg-cyan-500'
            : 'border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800',
        ].join(' ')}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <FileDown size={14} />
        )}
        {loading ? 'Generando...' : `Reporte de ${monthLabel(month)}`}
      </button>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={11} />
          {error}
        </div>
      )}
    </div>
  )
}

/** Renders buttons for current month + previous month */
export function DownloadReportButtons({ clientId }: { clientId?: string }) {
  const current = currentYYYYMM()
  const previous = prevMonth(current)

  return (
    <div className="flex flex-wrap gap-3">
      <ReportButton month={current} clientId={clientId} variant="primary" />
      <ReportButton month={previous} clientId={clientId} variant="ghost" />
    </div>
  )
}
