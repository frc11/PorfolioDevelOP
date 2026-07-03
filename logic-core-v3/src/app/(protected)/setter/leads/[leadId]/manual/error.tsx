'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
import { logger } from '@/lib/logger'

/**
 * Boundary del manual paso-por-pantalla (Bloque 4). Hermano del boundary de la
 * pantalla del lead (3.7): si la carga owned o la derivación tiran, el setter
 * ve un estado claro con dos salidas — reintentar acá, o volver al lead (el
 * wizard clásico sigue vivo y funcional, es la red de contención del manual).
 * Mantiene el par de observabilidad logger + Sentry con tag de sección.
 */
export default function ManualDelLeadError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams<{ leadId?: string }>()
  const leadHref = params?.leadId ? `/setter/leads/${params.leadId}` : '/setter'

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
      description="No es culpa tuya. Probá de nuevo; si sigue pasando, volvé al lead y seguí desde ahí mientras le avisás a Franco."
      action={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" onClick={reset}>
            Reintentar
          </Button>
          <Link
            href={leadHref}
            className="inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Volver al lead
          </Link>
        </div>
      }
    />
  )
}
