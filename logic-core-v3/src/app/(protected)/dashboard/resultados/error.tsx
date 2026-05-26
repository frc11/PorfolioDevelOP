'use client'

import { SectionErrorBoundary } from '@/components/ui'

export default function ResultadosError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <SectionErrorBoundary
      error={error}
      reset={reset}
      section="dashboard.resultados"
      tone="amber"
    />
  )
}
