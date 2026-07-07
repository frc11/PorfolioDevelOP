'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
import { logger } from '@/lib/logger'

/**
 * Boundary del manual paso-por-pantalla (Bloque 4). Con el corte 5.6 el manual
 * ES la experiencia del lead (la raíz redirige acá): si la carga owned o la
 * derivación tiran, las dos salidas son reintentar o volver a la cartera y
 * seguir con otro lead — volver «al lead» sería un loop sobre el mismo error.
 * Mantiene el par de observabilidad logger + Sentry con tag de sección.
 */
export default function ManualDelLeadError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error(`[boundary:setter-manual] ${error.name}: ${error.message}`, {
      section: 'setter-manual',
      digest: error.digest,
      stack: error.stack,
    })
    Sentry.captureException(error, {
      tags: { section: 'setter', boundary: 'setter-manual' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <EmptyState
      icon={AlertTriangle}
      size="lg"
      title="No se pudo abrir el manual de este lead"
      description="No es culpa tuya. Probá de nuevo; si sigue pasando, volvé a tu cartera y seguí con otro lead mientras le avisás a Franco."
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
