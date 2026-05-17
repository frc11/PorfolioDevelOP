'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

interface AdminErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
  context?: string
}

export function AdminErrorBoundary({
  error,
  reset,
  context,
}: AdminErrorBoundaryProps) {
  return (
    <div className="rounded-3xl border border-red-400/20 bg-red-500/[0.04] p-8 text-center">
      <div className="mx-auto mb-4 w-fit rounded-2xl bg-red-500/10 p-3">
        <AlertCircle className="h-6 w-6 text-red-400" strokeWidth={1.5} />
      </div>

      <p className="mb-2 text-base font-medium text-zinc-200">
        Algo salio mal{context ? ` en ${context}` : ''}
      </p>
      <p className="mb-1 font-mono text-sm text-zinc-500">{error.message}</p>
      {error.digest && (
        <p className="mb-6 font-mono text-[10px] text-zinc-600">
          digest: {error.digest}
        </p>
      )}

      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400/15 px-5 py-2.5 text-sm text-cyan-300 transition-colors hover:bg-cyan-400/25"
      >
        <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
        Reintentar
      </button>
    </div>
  )
}
