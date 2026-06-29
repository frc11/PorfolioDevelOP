'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
import { logger } from '@/lib/logger'

/**
 * Boundary de ruta del setter (2.4). Si `listOwnedLeads`/`buildHomeLeads` o el
 * render del foco tiran, el setter ve un estado claro (no una pantalla rota) y
 * puede reintentar. Se mantiene el `EmptyState` con copy cálido propio del setter
 * (en vez de `SectionErrorBoundary`, cuyo "Volver al inicio" apunta a /dashboard,
 * el área del CLIENTE — ruta equivocada para un setter). Lo que faltaba era la
 * OBSERVABILIDAD: este boundary se tragaba el error sin telemetría. Se agrega el
 * mismo par B12.1/B14.5 que usan el boundary raíz y `SectionErrorBoundary`
 * (logger + Sentry con tag de sección). El cliente nunca ve el detalle técnico.
 */
export default function SetterError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error(`[boundary:setter] ${error.name}: ${error.message}`, {
      section: 'setter',
      digest: error.digest,
      stack: error.stack,
    })
    Sentry.captureException(error, {
      tags: { section: 'setter', boundary: 'setter' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <EmptyState
      icon={AlertTriangle}
      size="lg"
      title="Algo se rompió cargando el panel"
      description="No es culpa tuya. Probá de nuevo; si sigue pasando, avisale a Franco."
      action={
        <Button variant="secondary" onClick={reset}>
          Reintentar
        </Button>
      }
    />
  )
}
