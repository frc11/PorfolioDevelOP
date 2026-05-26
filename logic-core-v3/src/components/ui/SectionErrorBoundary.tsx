'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { logger } from '@/lib/logger'

interface SectionErrorBoundaryProps {
  // El error que React le pasa al boundary. Lo usamos SOLO para loguear
  // server-side (digest + name) — nunca se muestra al cliente.
  error: Error & { digest?: string }
  // Callback de Next que re-renderiza el segmento. Sin esto el usuario
  // queda atrapado en el boundary hasta navegar afuera.
  reset: () => void
  // Slug del segmento (ej: 'dashboard.chatbot', 'admin.projects'). Va al
  // log como metadata para correlacionar. NO se muestra en pantalla.
  section: string
  // Tono visual: 'cyan' para admin (consistente con AdminErrorBoundary
  // previo), 'amber' para dashboard cliente. Default: cyan.
  tone?: 'cyan' | 'amber'
  // Si true, renderiza fullscreen con `min-h-screen` para boundaries de
  // layout raíz (ej. dashboard/error.tsx). Default false = card en flujo.
  fullscreen?: boolean
}

const TONE_STYLES = {
  cyan: {
    border: 'border-cyan-400/20',
    bg: 'bg-cyan-500/[0.04]',
    iconBg: 'bg-cyan-500/10',
    icon: 'text-cyan-400',
    button: 'bg-cyan-400/15 text-cyan-300 hover:bg-cyan-400/25',
    eyebrow: 'text-cyan-500/60',
  },
  amber: {
    border: 'border-amber-400/20',
    bg: 'bg-amber-500/[0.04]',
    iconBg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    button: 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25',
    eyebrow: 'text-amber-500/60',
  },
} as const

export function SectionErrorBoundary({
  error,
  reset,
  section,
  tone = 'cyan',
  fullscreen = false,
}: SectionErrorBoundaryProps) {
  useEffect(() => {
    // B12.1 — Registrar el error con el logger existente. El cliente NO ve
    // detalles técnicos; el server sí los persiste para diagnóstico.
    logger.error(`[boundary:${section}] ${error.name}: ${error.message}`, {
      section,
      digest: error.digest,
      stack: error.stack,
    })

    // TODO(B14): cablear Sentry acá.
    //   Sentry.captureException(error, {
    //     tags: { section, boundary: 'section' },
    //     extra: { digest: error.digest },
    //   })
  }, [error, section])

  const styles = TONE_STYLES[tone]

  const content = (
    <div
      className={`rounded-3xl border ${styles.border} ${styles.bg} p-8 text-center`}
      role="alert"
      aria-live="polite"
    >
      <div className={`mx-auto mb-4 w-fit rounded-2xl ${styles.iconBg} p-3`}>
        <AlertCircle className={`h-6 w-6 ${styles.icon}`} strokeWidth={1.5} />
      </div>

      <p className={`mb-2 text-[10px] font-mono uppercase tracking-[0.25em] ${styles.eyebrow}`}>
        Error inesperado
      </p>
      <p className="mb-2 text-base font-medium text-zinc-200">
        Algo no salió como esperábamos
      </p>
      <p className="mb-6 text-sm text-zinc-500 leading-relaxed max-w-md mx-auto">
        Tomamos nota del problema y lo estamos revisando. Probá de nuevo y, si sigue, recargá la página o volvé al inicio.
      </p>

      {error.digest && (
        <p className="mb-6 font-mono text-[10px] text-zinc-700">
          ref: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl ${styles.button} px-5 py-2.5 text-sm font-semibold transition-colors`}
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
          Reintentar
        </button>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )

  if (fullscreen) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">{content}</div>
      </main>
    )
  }

  return content
}
