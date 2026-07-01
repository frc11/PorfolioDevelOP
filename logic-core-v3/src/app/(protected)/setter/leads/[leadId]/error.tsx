'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
import { logger } from '@/lib/logger'

/**
 * Boundary de la pantalla del lead (3.7). Hermano del boundary de la home del
 * setter (2.4): si la carga del dossier/timeline o el render del wizard tiran
 * (un read de Neon que rebota, un parse que falla), el setter ve un estado claro
 * —no una pantalla rota ni el "se rompió cargando el panel" genérico del boundary
 * padre, que habla de la HOME, no de ESTE lead—. Copy en modo dirección: qué pasó
 * + dos salidas (reintentar acá, o volver a la cartera y seguir con otro lead).
 *
 * Mantiene el par de OBSERVABILIDAD B12.1/B14.5 del boundary del setter (logger +
 * Sentry con tag de sección) — sin él, el boundary se tragaría el error sin
 * telemetría. El cliente nunca ve el detalle técnico.
 */
export default function SetterLeadError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error(`[boundary:setter-lead] ${error.name}: ${error.message}`, {
      section: 'setter-lead',
      digest: error.digest,
      stack: error.stack,
    })
    Sentry.captureException(error, {
      tags: { section: 'setter', boundary: 'setter-lead' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <EmptyState
      icon={AlertTriangle}
      size="lg"
      title="No se pudo abrir este lead"
      description="No es culpa tuya. Probá de nuevo; si sigue pasando, volvé a tu cartera y seguí con otro mientras le avisás a Franco."
      action={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" onClick={reset}>
            Reintentar
          </Button>
          <Link
            href="/setter"
            className="inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Volver a tu cartera
          </Link>
        </div>
      }
    />
  )
}
