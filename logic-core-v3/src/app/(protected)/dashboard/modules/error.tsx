'use client'

import { SectionErrorBoundary } from '@/components/ui'

export default function ModulesError({
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
      section="dashboard.modules"
      tone="amber"
    />
  )
}
