'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const FILENAME_FALLBACK = 'informe-mensual.pdf'

/**
 * P2.C — Botón "Descargá el informe del mes". Sin librería de PDF en el
 * cliente: solo hace `fetch` a la ruta que genera el PDF en el server
 * (`@react-pdf/renderer` corre 100% server-side) y dispara la descarga del
 * blob recibido — el bundle del dashboard no gana peso por esta feature.
 */
export function DownloadMonthlyReportButton() {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch('/api/reports/client-monthly')
      if (!res.ok) throw new Error(`request failed: ${res.status}`)

      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? FILENAME_FALLBACK

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('No pudimos generar el informe. Probá de nuevo en unos minutos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      aria-label="Descargar informe del mes en PDF"
      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 size={15} strokeWidth={1.5} className="animate-spin" aria-hidden="true" />
      ) : (
        <FileDown size={15} strokeWidth={1.5} aria-hidden="true" />
      )}
      {loading ? 'Generando...' : 'Descargar informe del mes'}
    </button>
  )
}
