'use client'

import { AlertTriangle } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'

export default function SetterError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
